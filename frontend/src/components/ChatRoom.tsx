import React, { useState } from 'react';
import type { Message } from '../types';
import { Avatar, BrandMark, StatusBadge } from './ui';

/* ─── Props ──────────────────────────────────────────────────── */
interface ChatRoomProps {
    currentRoomId: string;
    userCount: number;
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    sendMessage: () => void;
    isConnected: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    currentUser: string | null;
}

/* ─── Time formatter ─────────────────────────────────────────── */
function formatTime(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ─── Date divider label ─────────────────────────────────────── */
function formatDateLabel(d: Date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ─── Header ─────────────────────────────────────────────────── */
function ChatHeader({ roomId, userCount, isConnected }: { roomId: string; userCount: number; isConnected: boolean }) {
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                height: 64,
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
                gap: 12,
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Left — brand + room info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <BrandMark size={38} />
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        Real Time Chat
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Room</span>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: 'var(--accent-light)',
                            background: 'var(--accent-bg)',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            border: '1px solid rgba(139,92,246,0.25)',
                        }}>
                            {roomId}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right — user count + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div
                    title={`${userCount} user${userCount !== 1 ? 's' : ''} in room`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-full)',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                    }}
                >
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    {userCount}
                </div>
                <StatusBadge active={isConnected} activeText="Connected" inactiveText="Reconnecting" />
            </div>
        </header>
    );
}

/* ─── Date Divider ───────────────────────────────────────────── */
function DateDivider({ label }: { label: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '20px 0 8px',
            userSelect: 'none',
        }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
            }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
    );
}

/* ─── Empty State ────────────────────────────────────────────── */
function EmptyState() {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 32,
            textAlign: 'center',
        }}>
            <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--accent-bg)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
            }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Be the first to say something!
            </p>
        </div>
    );
}

/* ─── Message List ───────────────────────────────────────────── */
interface MessageListProps {
    messages: Message[];
    currentUser: string | null;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function MessageList({ messages, currentUser, messagesEndRef }: MessageListProps) {
    if (messages.length === 0) return <EmptyState />;

    let lastDate = '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
            {messages.map((message, index) => {
                const mine = message.username === currentUser;
                const prev = messages[index - 1];
                const next = messages[index + 1];

                const sameAsPrev = prev?.username === message.username;
                const sameAsNext = next?.username === message.username;

                const msgDate = message.timestamp.toDateString();
                const showDateDivider = msgDate !== lastDate;
                if (showDateDivider) lastDate = msgDate;

                // Bubble border-radius shaping
                const br = mine ? {
                    borderTopLeftRadius: 18,
                    borderBottomLeftRadius: 18,
                    borderTopRightRadius: sameAsPrev ? 6 : 18,
                    borderBottomRightRadius: sameAsNext ? 6 : 18,
                } : {
                    borderTopRightRadius: 18,
                    borderBottomRightRadius: 18,
                    borderTopLeftRadius: sameAsPrev ? 6 : 18,
                    borderBottomLeftRadius: sameAsNext ? 6 : 18,
                };

                const gap = sameAsPrev ? 3 : 14;

                return (
                    <React.Fragment key={message.id}>
                        {showDateDivider && <DateDivider label={formatDateLabel(message.timestamp)} />}

                        <article
                            className="animate-slide-up"
                            style={{
                                display: 'flex',
                                flexDirection: mine ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 10,
                                marginTop: gap,
                                padding: '0 16px',
                            }}
                        >
                            {/* Avatar (theirs only, show on last in group) */}
                            {!mine && (
                                <div style={{ width: 32, flexShrink: 0, marginBottom: 2 }}>
                                    {!sameAsNext ? (
                                        <Avatar name={message.username} size={32} />
                                    ) : (
                                        <div style={{ width: 32 }} />
                                    )}
                                </div>
                            )}

                            {/* Bubble group */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: mine ? 'flex-end' : 'flex-start',
                                maxWidth: 'min(72%, 520px)',
                            }}>
                                {/* Sender name (first in group) */}
                                {!mine && !sameAsPrev && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--text-secondary)',
                                        marginBottom: 5,
                                        marginLeft: 2,
                                        letterSpacing: '0.02em',
                                    }}>
                                        {message.username}
                                    </span>
                                )}

                                {/* The bubble */}
                                <div
                                    style={{
                                        ...br,
                                        padding: '9px 14px',
                                        fontSize: '14px',
                                        lineHeight: 1.6,
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        background: mine
                                            ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                                            : 'var(--bg-elevated)',
                                        color: mine ? '#fff' : 'var(--text-primary)',
                                        border: mine ? 'none' : '1px solid var(--border)',
                                        boxShadow: mine
                                            ? '0 4px 16px rgba(124,58,237,0.3)'
                                            : '0 2px 8px rgba(0,0,0,0.25)',
                                        position: 'relative',
                                    }}
                                >
                                    {message.text}
                                </div>

                                {/* Timestamp (last in group) */}
                                {!sameAsNext && (
                                    <time style={{
                                        fontSize: '10px',
                                        color: 'var(--text-muted)',
                                        marginTop: 5,
                                        marginLeft: mine ? 0 : 4,
                                        marginRight: mine ? 4 : 0,
                                        letterSpacing: '0.03em',
                                    }}>
                                        {formatTime(message.timestamp)}
                                    </time>
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

/* ─── Composer ───────────────────────────────────────────────── */
interface ComposerProps {
    value: string;
    setValue: (val: string) => void;
    sendMessage: () => void;
    isConnected: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

function Composer({ value, setValue, sendMessage, isConnected, inputRef }: ComposerProps) {
    const [focused, setFocused] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const canSend = isConnected && !!value.trim();

    return (
        <footer
            style={{
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    maxWidth: 760,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'var(--bg-input)',
                    border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '6px 6px 6px 16px',
                    boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    id="message-input"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    disabled={!isConnected}
                    placeholder={isConnected ? 'Type a message…' : 'Reconnecting to server…'}
                    style={{
                        flex: 1,
                        height: 40,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        caretColor: 'var(--accent-light)',
                    }}
                />

                <button
                    id="send-message-btn"
                    onClick={sendMessage}
                    disabled={!canSend}
                    aria-label="Send message"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: canSend
                            ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                            : 'var(--bg-elevated)',
                        color: canSend ? '#fff' : 'var(--text-muted)',
                        cursor: canSend ? 'pointer' : 'not-allowed',
                        flexShrink: 0,
                        boxShadow: canSend ? '0 2px 12px rgba(124,58,237,0.4)' : 'none',
                        transition: 'all 0.18s ease',
                        transform: canSend ? 'scale(1)' : 'scale(0.95)',
                    }}
                    onMouseEnter={e => {
                        if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = canSend ? 'scale(1)' : 'scale(0.95)';
                    }}
                >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>

            <p style={{
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: 8,
                letterSpacing: '0.01em',
            }}>
                Press <kbd style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                }}>Enter</kbd> to send
            </p>
        </footer>
    );
}

/* ─── ChatRoom (root) ────────────────────────────────────────── */
const ChatRoom: React.FC<ChatRoomProps> = ({
    currentRoomId,
    userCount,
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    isConnected,
    messagesEndRef,
    inputRef,
    currentUser,
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'var(--bg-base)',
            overflow: 'hidden',
        }}>
            <ChatHeader roomId={currentRoomId} userCount={userCount} isConnected={isConnected} />

            {/* Messages */}
            <main
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    scrollBehavior: 'smooth',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ maxWidth: 780, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <MessageList
                        messages={messages}
                        currentUser={currentUser}
                        messagesEndRef={messagesEndRef}
                    />
                </div>
            </main>

            <div style={{ maxWidth: 780 + 32, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
                <Composer
                    value={inputValue}
                    setValue={setInputValue}
                    sendMessage={sendMessage}
                    isConnected={isConnected}
                    inputRef={inputRef}
                />
            </div>
        </div>
    );
};

export default ChatRoom;
