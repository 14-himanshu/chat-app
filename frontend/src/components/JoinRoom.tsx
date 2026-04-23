import React from 'react';
import { BrandMark, Button, Field, StatusBadge } from './ui';

interface JoinRoomProps {
    roomId: string;
    setRoomId: (id: string) => void;
    joinRoom: () => void;
    isConnected: boolean;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ roomId, setRoomId, joinRoom, isConnected }) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') joinRoom();
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '32px 24px',
            }}
        >
            {/* Background glow */}
            <div style={{
                position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 400, height: 300, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div
                className="animate-pop-in"
                style={{
                    width: '100%',
                    maxWidth: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 32,
                    position: 'relative',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <BrandMark size={56} />
                    <div>
                        <h2 style={{
                            fontSize: '28px', fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.04em',
                            lineHeight: 1.1,
                        }}>
                            Join a Room
                        </h2>
                        <p style={{ marginTop: 8, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Enter a room ID to start chatting in real-time
                        </p>
                    </div>
                    <StatusBadge active={isConnected} activeText="Server online" inactiveText="Connecting…" />
                </div>

                {/* Input area */}
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '28px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    <Field
                        id="room-id-input"
                        label="Room ID"
                        type="text"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyPress}
                        placeholder="e.g. CHAT42"
                        disabled={!isConnected}
                        maxLength={10}
                        autoFocus
                        style={{
                            textAlign: 'center',
                            fontSize: '18px',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            height: '56px',
                        }}
                    />

                    <Button
                        id="join-room-btn"
                        onClick={joinRoom}
                        disabled={!isConnected || !roomId.trim()}
                        size="lg"
                        style={{ width: '100%' }}
                    >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                        </svg>
                        Join Room
                    </Button>
                </div>

                {/* Info footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    End-to-end encrypted · Room expires when everyone leaves
                </div>
            </div>
        </div>
    );
};

export default JoinRoom;
