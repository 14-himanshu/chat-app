import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../services/auth.service.js";

// Extend Express Request to carry the decoded token payload
export interface AuthRequest extends Request {
  user: TokenPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized — missing token." });
    return;
  }
  try {
    const payload = verifyToken(auth.slice(7));
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized — invalid or expired token." });
  }
}
