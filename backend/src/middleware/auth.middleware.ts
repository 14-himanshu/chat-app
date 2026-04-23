import type { IncomingMessage } from "http";
import { verifyToken, type TokenPayload } from "../services/auth.service.js";

/**
 * Extract and verify the JWT from a WebSocket upgrade request.
 * Clients must pass the token as a query param: ?token=<jwt>
 * Returns the decoded payload or throws on failure.
 */
export function authenticateWsRequest(request: IncomingMessage): TokenPayload {
  const rawUrl = request.url ?? "/";
  // Use a dummy base so URL can parse a relative path
  const url = new URL(rawUrl, "http://localhost");
  const token = url.searchParams.get("token");

  if (!token) {
    throw new Error("No token provided.");
  }

  return verifyToken(token);
}
