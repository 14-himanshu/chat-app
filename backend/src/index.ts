import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
  socket: WebSocket;
  room: string;
  username?: string;
}
let allSockets: User[] = [];

console.log(`WebSocket server is running on port ${PORT}`);

// Helper function to get user count for a specific room
function getRoomUserCount(roomId: string): number {
  return allSockets.filter(user => user.room === roomId).length;
}

// Helper function to broadcast user count to all users in a room
function broadcastUserCount(roomId: string) {
  const userCount = getRoomUserCount(roomId);
  const message = JSON.stringify({
    type: "userCount",
    payload: { count: userCount }
  });

  allSockets.forEach(user => {
    if (user.room === roomId && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(message);
    }
  });
}

wss.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const existingUserIndex = allSockets.findIndex(u => u.socket === socket);

        if (existingUserIndex !== -1 && allSockets[existingUserIndex]) {
          // Update existing user
          allSockets[existingUserIndex]!.room = parsedMessage.payload.roomId;
          allSockets[existingUserIndex]!.username = parsedMessage.payload.username;
        } else {
          // Add new user
          allSockets.push({
            socket,
            room: parsedMessage.payload.roomId,
            username: parsedMessage.payload.username,
          });
        }

        console.log(`${parsedMessage.payload.username} joined room: ${parsedMessage.payload.roomId}`);

        // Broadcast updated user count to all users in the room
        broadcastUserCount(parsedMessage.payload.roomId);
      }

      if (parsedMessage.type === "chat") {
        let currentUser = null;
        for (let i = 0; i < allSockets.length; i++) {
          if (allSockets[i]?.socket === socket) {
            currentUser = allSockets[i];
            break;
          }
        }

        if (currentUser && currentUser.room) {
          const messageToSend = JSON.stringify({
            type: "chat",
            payload: {
              message: parsedMessage.payload.message,
              username: currentUser.username || "Anonymous",
              timestamp: new Date().toISOString()
            }
          });

          for (let i = 0; i < allSockets.length; i++) {
            if (allSockets[i]?.room === currentUser.room) {
              allSockets[i]?.socket.send(messageToSend);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");

    // Find the room the user was in before removing them
    const disconnectedUser = allSockets.find(user => user.socket === socket);
    const roomId = disconnectedUser?.room;

    // Remove disconnected socket from allSockets array
    allSockets = allSockets.filter((user) => user.socket !== socket);

    // Broadcast updated user count to remaining users in the room
    if (roomId) {
      broadcastUserCount(roomId);
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
