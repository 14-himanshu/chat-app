import { useEffect, useRef, useState } from 'react';
import './App.css';
import Auth from './Auth';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import type { Message } from './types';

// ── Restore session from localStorage ─────────────────────────
const storedToken = localStorage.getItem('chat_token');
const storedUsername = localStorage.getItem('chat_username');

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  // Initialise from persisted session if available
  const [username, setUsername] = useState<string | null>(storedUsername);
  const [token, setToken] = useState<string | null>(storedToken);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(storedToken && storedUsername)
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── WebSocket connection ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const wsBase = import.meta.env['VITE_WS_URL'] ?? 'ws://localhost:8080';
    // Attach JWT as a query param — verified server-side before connection is accepted
    const wsUrl = `${wsBase}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as {
          type: string;
          payload: Record<string, unknown>;
        };

        if (data.type === 'history') {
          // Server sends previous room messages on join
          const history = data.payload['messages'] as Array<{
            id: string;
            message: string;
            username: string;
            timestamp: string;
          }>;
          const historyMessages: Message[] = history.map((m) => ({
            id: m.id,
            text: m.message,
            timestamp: new Date(m.timestamp),
            username: m.username,
          }));
          setMessages(historyMessages);
        } else if (data.type === 'chat') {
          const p = data.payload as { message: string; username: string; timestamp: string };
          const newMessage: Message = {
            id: Date.now().toString() + Math.random(),
            text: p.message,
            timestamp: new Date(p.timestamp || new Date()),
            username: p.username,
          };
          setMessages((m) => [...m, newMessage]);
        } else if (data.type === 'userCount') {
          setUserCount((data.payload as { count: number }).count);
        }
      } catch {
        console.warn('Received non-JSON WS message');
      }
    };

    ws.onerror = () => setIsConnected(false);

    ws.onclose = (ev) => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      // Token rejected by server — clear session and force re-login
      if (ev.code === 1008) {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_username');
        setIsAuthenticated(false);
        setToken(null);
        setUsername(null);
      }
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isAuthenticated, token]);

  // ── Auth handler ─────────────────────────────────────────────
  const handleAuth = (authenticatedUsername: string, authToken: string) => {
    setUsername(authenticatedUsername);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  // ── Room join ─────────────────────────────────────────────────
  const joinRoom = () => {
    if (!roomId.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !username) return;

    wsRef.current.send(JSON.stringify({
      type: 'join',
      payload: { roomId: roomId.trim(), username },
    }));

    setCurrentRoomId(roomId.trim());
    setHasJoinedRoom(true);
    setMessages([]); // cleared; server will push history via 'history' event
  };

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      payload: { message: inputValue.trim() },
    }));
    setInputValue('');
  };

  // ── Render ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          height: '100%',
          maxHeight: 820,
          minHeight: 560,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 32px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {!hasJoinedRoom ? (
          <JoinRoom
            roomId={roomId}
            setRoomId={setRoomId}
            joinRoom={joinRoom}
            isConnected={isConnected}
          />
        ) : (
          <ChatRoom
            currentRoomId={currentRoomId}
            userCount={userCount}
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            sendMessage={sendMessage}
            isConnected={isConnected}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
            currentUser={username}
          />
        )}
      </div>
    </div>
  );
}

export default App;
