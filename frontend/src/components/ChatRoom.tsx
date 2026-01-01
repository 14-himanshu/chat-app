import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface ChatRoomProps {
    currentRoomId: string;
    userCount: number;
    messages: Message[];
    inputValue: string;
    setInputValue: (val: string) => void;
    sendMessage: () => void;
    isConnected: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    currentUser: string | null;
}

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
    currentUser
}) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Real Time Chat</h1>
                </div>
                <p className="text-gray-500 text-xs">
                    Room expires after users exit
                </p>
            </div>

            {/* Room Info */}
            <div className="bg-zinc-900 h-10 rounded-md p-3 flex justify-between items-center text-sm text-white">
                <div>
                    <span className="text-gray-400 mr-2">Room Code:</span>
                    <span className="font-bold">{currentRoomId}</span>
                </div>
                <div>
                    <span className="text-gray-400 mr-2">Users:</span>
                    <span>{userCount}</span>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 border border-gray-800 rounded-md bg-black overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                            No messages yet...
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMyMessage = msg.username === currentUser;
                            const isSameUser = index > 0 && messages[index - 1].username === msg.username;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}
                                >
                                    {!isSameUser && (
                                        <span className={`text-xs text-gray-500 mb-1 ${isMyMessage ? 'mr-1' : 'ml-1'}`}>
                                            {isMyMessage ? 'You' : msg.username}
                                        </span>
                                    )}
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-md text-sm ${isMyMessage
                                                ? 'bg-gray-900 text-white'
                                                : 'border border-gray-700 text-white'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-3 h-12">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected}
                    placeholder="Type a message..."
                    className="flex-1 bg-black border border-gray-800 rounded-md px-4 text-white focus:border-white focus:outline-none transition-colors"
                />
                <button
                    onClick={sendMessage}
                    disabled={!isConnected || !inputValue.trim()}
                    className="w-24 bg-white text-black rounded-md font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;
