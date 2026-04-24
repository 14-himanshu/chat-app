import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import Auth from './Auth';
import ChatRoom from './components/ChatRoom';
import type { Message } from './types';

// ── Restore session ────────────────────────────────────────────
const storedToken    = localStorage.getItem('chat_token');
const storedUsername = localStorage.getItem('chat_username');
const storedRooms    = JSON.parse(localStorage.getItem('chat_rooms') ?? '[]') as string[];

function App() {
  // ── Auth state ───────────────────────────────────────────────
  const [username,        setUsername]        = useState<string | null>(storedUsername);
  const [token,           setToken]           = useState<string | null>(storedToken);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedToken && storedUsername));
  const [isConnected,     setIsConnected]     = useState(false);

  // ── Multi-room state ─────────────────────────────────────────
  const [joinedRooms,    setJoinedRooms]    = useState<string[]>(storedRooms);
  const [activeRoom,     setActiveRoom]     = useState<string | null>(storedRooms[0] ?? null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});
  const [unreadByRoom,   setUnreadByRoom]   = useState<Record<string, number>>({});
  const [userCountByRoom,setUserCountByRoom]= useState<Record<string, number>>({});

  const wsRef          = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const [inputValue,   setInputValue]  = useState('');

  // ── Scroll to bottom when active room messages change ────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByRoom, activeRoom]);

  // ── Persist joined rooms ─────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('chat_rooms', JSON.stringify(joinedRooms));
  }, [joinedRooms]);

  // ── WebSocket connection ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const wsBase = import.meta.env['VITE_WS_URL'] ?? 'ws://localhost:8080';
    const ws     = new WebSocket(`${wsBase}?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      setIsConnected(true);
      // Re-subscribe to all persisted rooms on reconnect
      const rooms = JSON.parse(localStorage.getItem('chat_rooms') ?? '[]') as string[];
      for (const roomId of rooms) {
        ws.send(JSON.stringify({ type: 'joinRoom', payload: { roomId } }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          type: string;
          payload: Record<string, unknown>;
        };

        if (data.type === 'history') {
          const roomId   = data.payload['roomId'] as string;
          const rawMsgs  = data.payload['messages'] as Array<{
            id: string; message: string; username: string; timestamp: string;
            type?: string; fileUrl?: string; fileName?: string;
          }>;
          const messages: Message[] = rawMsgs.map(m => ({
            id:        m.id,
            text:      m.message,
            username:  m.username,
            timestamp: new Date(m.timestamp),
            type:      (m.type as Message['type']) ?? 'text',
            fileUrl:   m.fileUrl,
            fileName:  m.fileName,
          }));
          setMessagesByRoom(prev => ({ ...prev, [roomId]: messages }));

        } else if (data.type === 'chat') {
          const p      = data.payload as { roomId: string; message: string; username: string; timestamp: string; messageType?: string; fileUrl?: string; fileName?: string };
          const newMsg: Message = {
            id:        Date.now().toString() + Math.random(),
            text:      p.message,
            username:  p.username,
            timestamp: new Date(p.timestamp),
            type:      (p.messageType as Message['type']) ?? 'text',
            fileUrl:   p.fileUrl,
            fileName:  p.fileName,
          };
          setMessagesByRoom(prev => ({
            ...prev,
            [p.roomId]: [...(prev[p.roomId] ?? []), newMsg],
          }));
          // Increment unread if this room is not active
          setActiveRoom(current => {
            if (current !== p.roomId) {
              setUnreadByRoom(u => ({ ...u, [p.roomId]: (u[p.roomId] ?? 0) + 1 }));
            }
            return current;
          });

        } else if (data.type === 'userCount') {
          const { roomId, count } = data.payload as { roomId: string; count: number };
          setUserCountByRoom(prev => ({ ...prev, [roomId]: count }));
        }
      } catch {
        console.warn('Received non-JSON WS message');
      }
    };

    ws.onerror = () => setIsConnected(false);

    ws.onclose = (ev) => {
      setIsConnected(false);
      if (ev.code === 1008) {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_username');
        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
      }
    };

    wsRef.current = ws;
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [isAuthenticated, token]);

  // ── Auth ─────────────────────────────────────────────────────
  const handleAuth = (u: string, t: string) => {
    setUsername(u); setToken(t); setIsAuthenticated(true);
  };

  // ── Join a room ───────────────────────────────────────────────
  const joinRoom = useCallback((roomId: string) => {
    const id = roomId.trim().toUpperCase();
    if (!id || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'joinRoom', payload: { roomId: id } }));

    setJoinedRooms(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveRoom(id);
    setUnreadByRoom(prev => ({ ...prev, [id]: 0 }));
  }, []);

  // ── Leave a room ─────────────────────────────────────────────
  const leaveRoom = useCallback((roomId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'leaveRoom', payload: { roomId } }));

    setJoinedRooms(prev => {
      const next = prev.filter(r => r !== roomId);
      // Switch to adjacent room if we left the active one
      setActiveRoom(cur => cur === roomId ? (next[0] ?? null) : cur);
      return next;
    });
    setMessagesByRoom(prev => { const n = { ...prev }; delete n[roomId]; return n; });
    setUnreadByRoom  (prev => { const n = { ...prev }; delete n[roomId]; return n; });
    setUserCountByRoom(prev => { const n = { ...prev }; delete n[roomId]; return n; });
  }, []);

  // ── Switch active room ────────────────────────────────────────
  const switchRoom = useCallback((roomId: string) => {
    setActiveRoom(roomId);
    setUnreadByRoom(prev => ({ ...prev, [roomId]: 0 }));
  }, []);

  // ── Send text message ─────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!inputValue.trim() || !activeRoom ||
        !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type:    'chat',
      payload: { roomId: activeRoom, message: inputValue.trim(), messageType: 'text' },
    }));
    setInputValue('');
  }, [inputValue, activeRoom]);

  // ── Upload file then send via WS ──────────────────────────────
  const sendFileMessage = useCallback(async (file: File) => {
    if (!activeRoom || !token || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const apiBase  = import.meta.env['VITE_API_URL'] ?? 'http://localhost:8080';
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${apiBase}/api/upload`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
    });
    if (!res.ok) throw new Error(await res.text());

    const { url, fileName, fileType } = await res.json() as { url: string; fileName: string; fileType: 'image' | 'file' };

    wsRef.current.send(JSON.stringify({
      type:    'chat',
      payload: { roomId: activeRoom, message: '', messageType: fileType, fileUrl: url, fileName },
    }));
  }, [activeRoom, token]);

  // ── Render ────────────────────────────────────────────────────
  if (!isAuthenticated) return <Auth onAuth={handleAuth} />;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 1100,
        height: '100%', maxHeight: 820, minHeight: 560,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 32px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex',
      }}>
        <ChatRoom
          // rooms
          joinedRooms={joinedRooms}
          activeRoom={activeRoom}
          messagesByRoom={messagesByRoom}
          unreadByRoom={unreadByRoom}
          userCountByRoom={userCountByRoom}
          onJoinRoom={joinRoom}
          onLeaveRoom={leaveRoom}
          onSwitchRoom={switchRoom}
          // chat
          inputValue={inputValue}
          setInputValue={setInputValue}
          sendMessage={sendMessage}
          sendFileMessage={sendFileMessage}
          isConnected={isConnected}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          currentUser={username}
        />
      </div>
    </div>
  );
}

export default App;
