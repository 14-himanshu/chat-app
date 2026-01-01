import React from 'react';

interface JoinRoomProps {
    roomId: string;
    setRoomId: (id: string) => void;
    joinRoom: () => void;
    isConnected: boolean;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ roomId, setRoomId, joinRoom, isConnected }) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Join Room</h2>
                <p className="text-gray-500 text-sm">
                    {isConnected ? 'System Online' : 'Connecting...'}
                </p>
            </div>

            {/* Form */}
            <div className="w-full space-y-4">
                <div>
                    <label className="block text-gray-500 text-xs uppercase mb-2 ml-1">Room ID</label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        placeholder="ENTER ROOM ID"
                        disabled={!isConnected}
                        className="w-full h-14 bg-black border border-gray-800 rounded-md px-4 text-white text-center font-bold focus:border-white focus:outline-none"
                        maxLength={10}
                        autoFocus
                    />
                </div>

                <button
                    onClick={joinRoom}
                    disabled={!isConnected || !roomId.trim()}
                    className="w-full h-12 bg-white text-black rounded-md font-bold hover:bg-gray-200 disabled:opacity-50"
                >
                    Join
                </button>
            </div>

            <div className="mt-8 text-center text-gray-600 text-xs">
                End-to-End Encrypted
            </div>
        </div>
    );
};

export default JoinRoom;
