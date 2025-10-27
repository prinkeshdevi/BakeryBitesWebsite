import express from "express";
import session from "express-session";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";

// Minimal Express app suitable for Vercel Serverless Functions.
// No Vite dev middleware here. Static files are handled by Vercel (see vercel.json).

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

const app = express();
// Trust proxy so secure cookies work behind Vercel
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bakery-bites-secret-key-2023",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// For JSON bodies and URL-encoded forms
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Serve uploads via the serverless function (Vercel’s FS is read-only except /tmp)
const baseUploadDir = process.env.VERCEL ? "/tmp" : process.cwd();
app.use("/uploads", express.static(path.join(baseUploadDir, "uploads")));

// Basic health check for debugging
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// Register routes with explicit error surface if import fails
(async () => {
  try {
    const { registerRoutes } = await import("../server/routes");
    registerRoutes(app);
  } catch (err: any) {
    // Surface import errors at /api/health for quick diagnostics
    const msg = (err && (err.stack || err.message)) || String(err);
    // eslint-disable-next-line no-console
    console.error("Failed to register routes:", msg);
    app.get("/api/admin/login", (_req, res) => {
      res.status(500).json({ error: "Routes init failed", detail: msg });
    });
    app.all("/api/*", (_req, res) => {
      res.status(500).json({ error: "Routes init failed", detail: msg });
    });
  }
})();

// Vercel Node runtime expects a default handler(req, res)
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Delegate the request to Express
  (app as any)(req, res);
}