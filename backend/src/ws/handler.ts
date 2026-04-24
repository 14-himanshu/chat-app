import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { authenticateWsRequest } from "../middleware/auth.middleware.js";
import { saveMessage, getRoomHistory } from "../services/message.service.js";

interface ConnectedUser {
  socket: WebSocket;
  userId: string;
  username: string;
  /** All rooms this socket is currently subscribed to */
  rooms: Set<string>;
}

let connectedUsers: ConnectedUser[] = [];

function send(socket: WebSocket, data: object): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

function getRoomUserCount(roomId: string): number {
  return connectedUsers.filter((u) => u.rooms.has(roomId)).length;
}

/** Broadcast to every socket subscribed to roomId */
function broadcastToRoom(roomId: string, data: object): void {
  for (const user of connectedUsers) {
    if (user.rooms.has(roomId)) {
      send(user.socket, data);
    }
  }
}

function broadcastUserCount(roomId: string): void {
  const count = getRoomUserCount(roomId);
  broadcastToRoom(roomId, { type: "userCount", payload: { roomId, count } });
}

export function setupWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    // ── Authenticate ───────────────────────────────────────────
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

    const user: ConnectedUser = { socket, userId, username, rooms: new Set() };
    connectedUsers.push(user);

    // ── Message handler ────────────────────────────────────────
    socket.on("message", async (raw) => {
      let parsed: { type: string; payload: Record<string, string> };

      try {
        parsed = JSON.parse(raw.toString()) as typeof parsed;
      } catch {
        send(socket, { type: "error", payload: { message: "Invalid JSON." } });
        return;
      }

      // ── JOIN ROOM ──────────────────────────────────────────
      if (parsed.type === "joinRoom") {
        const roomId = parsed.payload["roomId"]?.trim().toUpperCase();
        if (!roomId) {
          send(socket, { type: "error", payload: { message: "roomId is required." } });
          return;
        }

        // Always send history (handles re-joins on reconnect)
        if (!user.rooms.has(roomId)) {
          user.rooms.add(roomId);
          console.log(`👥 ${username} joined room ${roomId} (in ${user.rooms.size} room(s))`);
        }

        try {
          const history = await getRoomHistory(roomId);
          send(socket, { type: "history", payload: { roomId, messages: history } });
        } catch (err) {
          console.error("Failed to fetch history:", err);
        }

        broadcastUserCount(roomId);
        return;
      }

      // ── LEAVE ROOM ─────────────────────────────────────────
      if (parsed.type === "leaveRoom") {
        const roomId = parsed.payload["roomId"]?.trim().toUpperCase();
        if (!roomId || !user.rooms.has(roomId)) return;

        user.rooms.delete(roomId);
        console.log(`👋 ${username} left room ${roomId}`);
        broadcastUserCount(roomId);
        return;
      }

      // ── CHAT ───────────────────────────────────────────────
      if (parsed.type === "chat") {
        const roomId      = parsed.payload["roomId"]?.trim().toUpperCase();
        const message     = parsed.payload["message"]?.trim() ?? "";
        const messageType = (parsed.payload["messageType"] as "text" | "image" | "file") ?? "text";
        const fileUrl     = parsed.payload["fileUrl"];
        const fileName    = parsed.payload["fileName"];

        if (!roomId || !user.rooms.has(roomId)) {
          send(socket, { type: "error", payload: { message: "Join the room first." } });
          return;
        }
        // Must have text OR a file
        if (!message && !fileUrl) return;

        const timestamp = new Date().toISOString();

        try {
          await saveMessage(roomId, userId, username, message || fileName || "file", messageType, fileUrl, fileName);
        } catch (err) {
          console.error("Failed to save message:", err);
        }

        broadcastToRoom(roomId, {
          type:    "chat",
          payload: { roomId, message, username, timestamp, messageType, fileUrl, fileName },
        });
        return;
      }


      send(socket, { type: "error", payload: { message: "Unknown message type." } });
    });

    // ── Disconnect ─────────────────────────────────────────────
    socket.on("close", () => {
      const rooms = [...user.rooms];
      connectedUsers = connectedUsers.filter((u) => u.socket !== socket);
      console.log(`🔌 ${username} disconnected (was in: ${rooms.join(", ") || "none"})`);
      for (const roomId of rooms) broadcastUserCount(roomId);
    });

    socket.on("error", (err) => {
      console.error(`WS error for ${username}:`, err.message);
    });
  });

  console.log("✅ WebSocket server attached to HTTP server");
}
