import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import { Avatar, BrandMark, StatusBadge } from './ui';

interface ChatRoomProps {
    joinedRooms: string[];
    activeRoom: string | null;
    messagesByRoom: Record<string, Message[]>;
    unreadByRoom: Record<string, number>;
    userCountByRoom: Record<string, number>;
    onJoinRoom: (roomId: string) => void;
    onLeaveRoom: (roomId: string) => void;
    onSwitchRoom: (roomId: string) => void;
    inputValue: string;
    setInputValue: (v: string) => void;
    sendMessage: () => void;
    isConnected: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    currentUser: string | null;
}

function formatTime(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDateLabel(d: Date) {
    const today = new Date(), yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ── Sidebar ───────────────────────────────────────────────── */
function Sidebar({ joinedRooms, activeRoom, unreadByRoom, onSwitch, onLeave, onJoin, isConnected }: {
    joinedRooms: string[];
    activeRoom: string | null;
    unreadByRoom: Record<string, number>;
    onSwitch: (r: string) => void;
    onLeave: (r: string) => void;
    onJoin: (r: string) => void;
    isConnected: boolean;
}) {
    const [adding, setAdding] = useState(false);
    const [newRoom, setNewRoom] = useState('');
    const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

    const submit = () => {
        if (newRoom.trim()) { onJoin(newRoom); setNewRoom(''); setAdding(false); }
    };

    return (
        <aside style={{
            width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'rgba(0,0,0,0.35)', borderRight: '1px solid var(--border)',
            height: '100%',
        }}>
            {/* Brand */}
            <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <BrandMark size={32} />
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Real Time Chat</div>
                    <StatusBadge active={isConnected} activeText="Online" inactiveText="Offline" />
                </div>
            </div>

            {/* Room list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px 0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
                    Rooms
                </div>

                {joinedRooms.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 10px', lineHeight: 1.6 }}>
                        No rooms yet. Join one below.
                    </div>
                )}

                {joinedRooms.map(room => {
                    const active = room === activeRoom;
                    const unread = unreadByRoom[room] ?? 0;
                    const hovered = hoveredRoom === room;
                    return (
                        <div
                            key={room}
                            onMouseEnter={() => setHoveredRoom(room)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            onClick={() => onSwitch(room)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                                background: active ? 'rgba(124,58,237,0.18)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                                <span style={{ color: active ? 'var(--accent-light)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>#</span>
                                <span style={{
                                    fontSize: 13, fontWeight: active ? 600 : 500,
                                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {room}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                {unread > 0 && (
                                    <span style={{
                                        background: '#7c3aed', color: '#fff', borderRadius: 10,
                                        fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                                    }}>{unread > 99 ? '99+' : unread}</span>
                                )}
                                {hovered && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onLeave(room); }}
                                        title="Leave room"
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-muted)', padding: 2, borderRadius: 4,
                                            display: 'flex', alignItems: 'center',
                                        }}
                                    >
                                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Room */}
            <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
                {adding ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                        <input
                            autoFocus
                            value={newRoom}
                            onChange={e => setNewRoom(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setNewRoom(''); } }}
                            placeholder="ROOM-ID"
                            style={{
                                flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-focus)',
                                borderRadius: 6, padding: '7px 10px', fontSize: 12, color: 'var(--text-primary)',
                                fontFamily: 'inherit', letterSpacing: '0.05em', outline: 'none',
                            }}
                        />
                        <button onClick={submit} style={{
                            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none',
                            borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '0 10px', fontSize: 12, fontWeight: 600,
                        }}>Join</button>
                    </div>
                ) : (
                    <button
                        id="add-room-btn"
                        onClick={() => setAdding(true)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.3)',
                            borderRadius: 8, padding: '9px 12px', cursor: 'pointer', color: 'var(--accent-light)',
                            fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.18)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.1)'; }}
                    >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Join a Room
                    </button>
                )}
            </div>
        </aside>
    );
}

/* ── Empty / No-room states ───────────────────────────────── */
function NoRoomSelected() {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', padding: 32, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No room selected</p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>Join a room from the sidebar to start chatting.</p>
        </div>
    );
}

function EmptyMessages() {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Be the first to say something!</p>
        </div>
    );
}

/* ── Message List ─────────────────────────────────────────── */
function MessageList({ messages, currentUser, messagesEndRef }: {
    messages: Message[]; currentUser: string | null; messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    if (messages.length === 0) return <EmptyMessages />;
    let lastDate = '';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
            {messages.map((msg, i) => {
                const mine = msg.username === currentUser;
                const prev = messages[i - 1], next = messages[i + 1];
                const sameAsPrev = prev?.username === msg.username;
                const sameAsNext = next?.username === msg.username;
                const msgDate = msg.timestamp.toDateString();
                const showDate = msgDate !== lastDate;
                if (showDate) lastDate = msgDate;
                const br = mine
                    ? { borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: sameAsPrev ? 6 : 18, borderBottomRightRadius: sameAsNext ? 6 : 18 }
                    : { borderTopRightRadius: 18, borderBottomRightRadius: 18, borderTopLeftRadius: sameAsPrev ? 6 : 18, borderBottomLeftRadius: sameAsNext ? 6 : 18 };
                return (
                    <React.Fragment key={msg.id}>
                        {showDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 8px' }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{formatDateLabel(msg.timestamp)}</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>
                        )}
                        <article className="animate-slide-up" style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10, marginTop: sameAsPrev ? 3 : 14, padding: '0 16px' }}>
                            {!mine && (
                                <div style={{ width: 32, flexShrink: 0, marginBottom: 2 }}>
                                    {!sameAsNext ? <Avatar name={msg.username} size={32} /> : <div style={{ width: 32 }} />}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: 'min(72%,520px)' }}>
                                {!mine && !sameAsPrev && (
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, marginLeft: 2, letterSpacing: '0.02em' }}>{msg.username}</span>
                                )}
                                <div style={{ ...br, padding: '9px 14px', fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap', background: mine ? 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)' : 'var(--bg-elevated)', color: mine ? '#fff' : 'var(--text-primary)', border: mine ? 'none' : '1px solid var(--border)', boxShadow: mine ? '0 4px 16px rgba(124,58,237,0.3)' : '0 2px 8px rgba(0,0,0,0.25)' }}>
                                    {msg.text}
                                </div>
                                {!sameAsNext && (
                                    <time style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, marginLeft: mine ? 0 : 4, marginRight: mine ? 4 : 0 }}>{formatTime(msg.timestamp)}</time>
                                )}
                            </div>
                        </article>
                    </React.Fragment>
                );
            })}
            <div ref={messagesEndRef} style={{ height: 8 }} />
        </div>
    );
}

/* ── Composer ─────────────────────────────────────────────── */
function Composer({ value, setValue, sendMessage, isConnected, inputRef, disabled }: {
    value: string; setValue: (v: string) => void; sendMessage: () => void;
    isConnected: boolean; inputRef: React.RefObject<HTMLInputElement | null>; disabled: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const canSend = isConnected && !disabled && !!value.trim();
    return (
        <footer style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '6px 6px 6px 16px', boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none', transition: 'border-color 0.18s,box-shadow 0.18s' }}>
                <input
                    ref={inputRef} id="message-input" type="text" value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    disabled={!isConnected || disabled}
                    placeholder={disabled ? 'Select a room to chat…' : isConnected ? 'Type a message…' : 'Reconnecting…'}
                    style={{ flex: 1, height: 40, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', caretColor: 'var(--accent-light)' }}
                />
                <button id="send-message-btn" onClick={sendMessage} disabled={!canSend} aria-label="Send"
                    style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: canSend ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'var(--bg-elevated)', color: canSend ? '#fff' : 'var(--text-muted)', cursor: canSend ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: canSend ? '0 2px 12px rgba(124,58,237,0.4)' : 'none', transition: 'all 0.18s' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Press <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'monospace' }}>Enter</kbd> to send
            </p>
        </footer>
    );
}

/* ── ChatRoom root ────────────────────────────────────────── */
const ChatRoom: React.FC<ChatRoomProps> = ({
    joinedRooms, activeRoom, messagesByRoom, unreadByRoom, userCountByRoom,
    onJoinRoom, onLeaveRoom, onSwitchRoom,
    inputValue, setInputValue, sendMessage, isConnected, messagesEndRef, inputRef, currentUser,
}) => {
    const messages    = activeRoom ? (messagesByRoom[activeRoom] ?? []) : [];
    const userCount   = activeRoom ? (userCountByRoom[activeRoom] ?? 0) : 0;

    // Auto-scroll when messages change for the active room
    const prevActiveRef = useRef(activeRoom);
    useEffect(() => { prevActiveRef.current = activeRoom; }, [activeRoom]);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Sidebar */}
            <Sidebar
                joinedRooms={joinedRooms} activeRoom={activeRoom}
                unreadByRoom={unreadByRoom} onSwitch={onSwitchRoom}
                onLeave={onLeaveRoom} onJoin={onJoinRoom} isConnected={isConnected}
            />

            {/* Main area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>#</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {activeRoom ?? 'No room selected'}
                        </span>
                    </div>
                    {activeRoom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                            <div title={`${userCount} user(s) online`} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                                </svg>
                                {userCount}
                            </div>
                            <StatusBadge active={isConnected} activeText="Connected" inactiveText="Reconnecting" />
                        </div>
                    )}
                </header>

                {/* Messages */}
                <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollBehavior: 'smooth' }}>
                    <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {!activeRoom ? <NoRoomSelected /> : <MessageList messages={messages} currentUser={currentUser} messagesEndRef={messagesEndRef} />}
                    </div>
                </main>

                {/* Composer */}
                <div style={{ maxWidth: 780 + 32, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
                    <Composer value={inputValue} setValue={setInputValue} sendMessage={sendMessage} isConnected={isConnected} inputRef={inputRef} disabled={!activeRoom} />
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
