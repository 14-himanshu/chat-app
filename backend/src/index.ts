import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { setupWebSocketServer } from "./ws/handler.js";

const PORT = process.env["PORT"] ? parseInt(process.env["PORT"]) : 8080;
const CLIENT_ORIGIN = process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173";
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

async function main(): Promise<void> {
  // ── Database ────────────────────────────────────────────────
  await connectDB();

  // ── Express app ─────────────────────────────────────────────
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));

  app.options("*", cors()); // Explicitly handle preflight
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // REST routes
  app.use("/api/auth", authRoutes);

  // ── HTTP server (shared by Express + WS) ────────────────────
  const httpServer = http.createServer(app);

  // ── WebSocket server ─────────────────────────────────────────
  setupWebSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Allowed Origins: ${allowedOrigins.join(", ")}`);
    console.log(`   REST  → http://localhost:${PORT}/api/auth`);
    console.log(`   WS    → ws://localhost:${PORT}?token=<jwt>`);
  });
}

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
