import type { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const TOKEN_NAME = "bb_admin";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface AuthClaims {
  id: string;
}

declare module "express-serve-static-core" {
  interface Request {
    adminId?: string;
  }
}

function getSecret(): string {
  return process.env.SESSION_SECRET || "bakery-bites-secret-key-2023";
}

export function setAdminAuth(res: Response, adminId: string) {
  const token = jwt.sign({ id: adminId } as AuthClaims, getSecret(), {
    expiresIn: "1d",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie(TOKEN_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY_MS,
  });
}

export function clearAdminAuth(res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(TOKEN_NAME, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

function parseCookie(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  // Split multiple cookies
  const pairs = header.split(";").map((p) => p.trim());
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, idx));
    const val = decodeURIComponent(pair.slice(idx + 1));
    if (!(key in out)) out[key] = val;
  }
  return out;
}

export function getAdminIdFromReq(req: Request): string | null {
  // Prefer express-session if present and set
  const sessionAdminId = (req as any).session?.adminId as string | undefined;
  if (sessionAdminId) return sessionAdminId;

  // Fallback to JWT cookie
  const cookies = parseCookie(req.headers.cookie);
  const token = cookies[TOKEN_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getSecret()) as AuthClaims;
    return decoded.id;
  } catch {
    return null;
  }
}

export function requireAuthJWT(req: Request, res: Response, next: NextFunction) {
  const adminId = getAdminIdFromReq(req);
  if (!adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.adminId = adminId;
  next();
}