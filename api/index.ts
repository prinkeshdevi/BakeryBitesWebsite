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

// Always-available admin check, even if full routes fail to load
app.get("/api/admin/check", async (req, res) => {
  try {
    const { getAdminIdFromReq } = await import("../server/auth");
    const id = getAdminIdFromReq(req as any);
    if (id) return res.json({ authenticated: true });
    return res.status(401).json({ authenticated: false });
  } catch (e: any) {
    return res.status(500).json({ error: "Auth check failed", detail: e?.message || String(e) });
  }
});

// Try to register the full server routes. If it fails, add minimal fallbacks
let fullRoutesReady = false;
(async () => {
  try {
    const { registerRoutes } = await import("../server/routes");
    await registerRoutes(app);
    fullRoutesReady = true;
  } catch (err: any) {
    const msg = (err && (err.stack || err.message)) || String(err);
    // eslint-disable-next-line no-console
    console.error("Failed to register routes:", msg);

    // Minimal fallbacks so login, orders and contacts can still be submitted
    let memoryOrders: any[] = [];
    let memoryContacts: any[] = [];

    // Load helpers and validation schema lazily
    const [{ setAdminAuth, clearAdminAuth }, { insertCustomOrderSchema, insertContactSchema }] = await Promise.all([
      import("../server/auth"),
      import("../shared/schema"),
    ]);

    app.post("/api/admin/login", express.json(), (req, res) => {
      const username = String(req.body?.username || "").trim().toLowerCase();
      const password = String(req.body?.password || "").trim();
      const defaultUsername = "apurva";
      const defaultPassword = "bakerybites2025";

      if (username === defaultUsername && password === defaultPassword) {
        setAdminAuth(res as any, "default-admin");
        return res.json({ message: "Login successful" });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    });

    app.post("/api/admin/logout", (_req, res) => {
      clearAdminAuth(res as any);
      res.json({ message: "Logout successful" });
    });

    app.post("/api/orders/custom", (req, res) => {
      try {
        const validated = insertCustomOrderSchema.parse(req.body);
        const order = { ...validated, id: `${Date.now()}` };
        memoryOrders.unshift(order);
        res.json(order);
      } catch (e: any) {
        res.status(400).json({ error: e?.message || "Invalid order data" });
      }
    });

    app.post("/api/contacts", (req, res) => {
      try {
        const validated = insertContactSchema.parse(req.body);
        const contact = { ...validated, id: `${Date.now()}` };
        memoryContacts.unshift(contact);
        res.json(contact);
      } catch (e: any) {
        res.status(400).json({ error: e?.message || "Invalid contact data" });
      }
    });

    // Explicit error for other API endpoints during fallback
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