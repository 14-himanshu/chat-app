import { useEffect, useRef, useState } from 'react';
import './App.css'
import Auth from './Auth';
import JoinRoom from './components/JoinRoom';
import ChatRoom from './components/ChatRoom';
import type { Message } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat") {
          const newMessage: Message = {
            id: Date.now().toString() + Math.random(),
            text: data.payload.message,
            timestamp: new Date(data.payload.timestamp || new Date()),
            username: data.payload.username,
          };
          setMessages(m => [...m, newMessage]);
        } else if (data.type === "userCount") {
          setUserCount(data.payload.count);
        }
      } catch (error) {
        // Handle plain text messages (backward compatibility)
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          text: event.data,
          timestamp: new Date(),
          username: "Unknown",
        };
        setMessages(m => [...m, newMessage]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated]);

  const handleAuth = (authenticatedUsername: string) => {
    setUsername(authenticatedUsername);
    setIsAuthenticated(true);
  };

  const joinRoom = () => {
    if (!roomId.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !username) return;

    wsRef.current.send(JSON.stringify({
      type: "join",
      payload: {
        roomId: roomId.trim(),
        username: username
      }
    }));

    setCurrentRoomId(roomId.trim());
    setHasJoinedRoom(true);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const message = inputValue.trim();

    wsRef.current.send(JSON.stringify({
      type: "chat",
      payload: { message }
    }));

    setInputValue("");
  };

  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 md:p-10">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#09090b] rounded-xl border border-zinc-800 p-8 md:p-12 flex flex-col gap-6 h-[85vh] md:h-[90vh] shadow-2xl shadow-zinc-900/20 overflow-hidden relative">

        {!hasJoinedRoom ? (
          <div className="flex-1 flex items-center justify-center w-full">
            <JoinRoom
              roomId={roomId}
              setRoomId={setRoomId}
              joinRoom={joinRoom}
              isConnected={isConnected}
            />
          </div>
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
