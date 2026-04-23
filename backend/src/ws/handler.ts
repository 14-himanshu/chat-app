import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { authenticateWsRequest } from "../middleware/auth.middleware.js";
import { saveMessage, getRoomHistory } from "../services/message.service.js";

interface ConnectedUser {
  socket: WebSocket;
  userId: string;
  username: string;
  room: string | null;
}

let connectedUsers: ConnectedUser[] = [];

function send(socket: WebSocket, data: object): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

function getRoomUserCount(roomId: string): number {
  return connectedUsers.filter((u) => u.room === roomId).length;
}

function broadcastToRoom(roomId: string, data: object, excludeSocket?: WebSocket): void {
  for (const user of connectedUsers) {
    if (user.room === roomId && user.socket !== excludeSocket) {
      send(user.socket, data);
    }
  }
}

function broadcastUserCount(roomId: string): void {
  const count = getRoomUserCount(roomId);
  // broadcastToRoom already covers everyone in the room, including the user who just joined/left
  broadcastToRoom(roomId, { type: "userCount", payload: { count } });
}

export function setupWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    // ── Authenticate ──────────────────────────────────────────
    let userId: string;
    let username: string;

    try {
      const payload = authenticateWsRequest(request);
      userId = payload.userId;
      username = payload.username;
    } catch (err) {
      console.warn("WS rejected — invalid token:", (err as Error).message);
      socket.close(1008, "Unauthorized");
      return;
    }

    console.log(`🔌 ${username} connected`);

    const user: ConnectedUser = { socket, userId, username, room: null };
    connectedUsers.push(user);

    // ── Message handler ───────────────────────────────────────
    socket.on("message", async (raw) => {
      let parsed: { type: string; payload: Record<string, string> };

      try {
        parsed = JSON.parse(raw.toString()) as typeof parsed;
      } catch {
        send(socket, { type: "error", payload: { message: "Invalid JSON." } });
        return;
      }

      // ── JOIN ────────────────────────────────────────────────
      if (parsed.type === "join") {
        const roomId = parsed.payload["roomId"]?.trim().toUpperCase();
        if (!roomId) {
          send(socket, { type: "error", payload: { message: "roomId is required." } });
          return;
        }

        user.room = roomId;
        console.log(`👥 ${username} joined room ${roomId}`);

        // Send chat history
        try {
          const history = await getRoomHistory(roomId);
          send(socket, { type: "history", payload: { messages: history } });
        } catch (err) {
          console.error("Failed to fetch history:", err);
        }

        // Notify room of updated user count
        broadcastUserCount(roomId);
        return;
      }

      // ── CHAT ────────────────────────────────────────────────
      if (parsed.type === "chat") {
        if (!user.room) {
          send(socket, { type: "error", payload: { message: "Join a room first." } });
          return;
        }

        const message = parsed.payload["message"]?.trim();
        if (!message) return;

        const timestamp = new Date().toISOString();

        // Persist to DB
        try {
          await saveMessage(user.room, userId, username, message);
        } catch (err) {
          console.error("Failed to save message:", err);
        }

        // Broadcast to everyone in the room — broadcastToRoom includes the sender
        broadcastToRoom(user.room, {
          type: "chat",
          payload: { message, username, timestamp },
        });
        return;
      }

      send(socket, { type: "error", payload: { message: "Unknown message type." } });
    });

    // ── Disconnect ────────────────────────────────────────────
    socket.on("close", () => {
      const room = user.room;
      connectedUsers = connectedUsers.filter((u) => u.socket !== socket);
      console.log(`🔌 ${username} disconnected`);
      if (room) broadcastUserCount(room);
    });

    socket.on("error", (err) => {
      console.error(`WS error for ${username}:`, err.message);
    });
  });

  console.log("✅ WebSocket server attached to HTTP server");
}
