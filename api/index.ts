import express from "express";
import session from "express-session";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

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

// Build/version info for diagnosing stale deploys
app.get("/api/version", (_req, res) => {
  res.json({
    vercel: Boolean(process.env.VERCEL),
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    buildAt: new Date().toISOString(),
  });
});

// DB connectivity health check
app.get("/api/db/health", async (_req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ connected: false, reason: "DATABASE_URL not set" });
    await db.execute(sql`select 1`);
    res.json({ connected: true });
  } catch (e: any) {
    res.status(500).json({ connected: false, error: e?.message || String(e) });
  }
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

// Simple password-only login for /media
app.post("/api/media/login", async (req, res) => {
  try {
    const [{ setAdminAuth }] = await Promise.all([import("../server/auth")]);
    const password = String(req.body?.password || "").trim();
    if (password === "bakerybites2025") {
      // issue auth cookie with a stable id
      (req as any).session.adminId = "media-admin";
      setAdminAuth(res as any, "media-admin");
      return res.json({ message: "Login successful" });
    }
    return res.status(401).json({ error: "Invalid password" });
  } catch (e: any) {
    return res.status(500).json({ error: "Media login failed", detail: e?.message || String(e) });
  }
});

function extractCreds(req: any) {
  try {
    const hasBody = req.body && (req.body.username !== undefined || req.body.password !== undefined);
    if (hasBody) {
      return {
        username: String(req.body.username ?? "").trim(),
        password: String(req.body.password ?? "").trim(),
        source: "json",
      };
    }
    // Try rawBody JSON
    if (req.rawBody) {
      try {
        const parsed = JSON.parse(Buffer.from(req.rawBody).toString("utf8"));
        if (parsed && (parsed.username || parsed.password)) {
          return {
            username: String(parsed.username ?? "").trim(),
            password: String(parsed.password ?? "").trim(),
            source: "raw",
          };
        }
      } catch {
        // ignore
      }
    }
    // Try query params (debug fallback)
    if (req.query && (req.query.username || req.query.password)) {
      return {
        username: String(req.query.username ?? "").trim(),
        password: String(req.query.password ?? "").trim(),
        source: "query",
      };
    }
  } catch {
    // ignore
  }
  return { username: "", password: "", source: "none" };
}

// Always-available admin login that accepts default credentials
app.post("/api/admin/login", async (req, res, next) => {
  try {
    const [{ setAdminAuth }, { storage }] = await Promise.all([
      import("../server/auth"),
      import("../server/storage"),
    ]);

    const creds = extractCreds(req);
    const usernameLc = creds.username.toLowerCase();
    const password = creds.password;

    const defaults = [
      { username: "apurva", password: "bakerybites2025" },
      { username: "admin", password: "admin123" },
    ];

    const matchedDefault = defaults.find(
      (d) => usernameLc === d.username && password === d.password
    );

    if (matchedDefault) {
      // Try to sync with storage (best-effort) then set cookies
      try {
        const admin = await storage.getAdminByUsername(matchedDefault.username);
        if (admin) {
          (req as any).session.adminId = admin.id;
          setAdminAuth(res as any, admin.id);
        } else {
          (req as any).session.adminId = `default-${matchedDefault.username}`;
          setAdminAuth(res as any, `default-${matchedDefault.username}`);
        }
      } catch {
        (req as any).session.adminId = `default-${matchedDefault.username}`;
        setAdminAuth(res as any, `default-${matchedDefault.username}`);
      }
      return res.json({ message: "Login successful", parsedFrom: creds.source });
    }

    // If not default, pass through to full routes (if loaded) or return 401 later
    return next();
  } catch (e: any) {
    return res.status(500).json({ error: "Login handler failed", detail: e?.message || String(e) });
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

    // Minimal fallbacks so uploads, orders and contacts can still be submitted
    let memoryOrders: any[] = [];
    let memoryContacts: any[] = [];

    // Load helpers and validation schema lazily
    const [
      { clearAdminAuth },
      { insertCustomOrderSchema, insertContactSchema },
      fsMod,
      multerMod,
    ] = await Promise.all([
      import("../server/auth"),
      import("../shared/schema"),
      import("fs"),
      import("multer"),
    ]);

    const fs = fsMod as any;
    const multer: any = (multerMod as any).default ?? (multerMod as any);

    // Ensure uploads dir exists
    const uploadsDir = path.join(baseUploadDir, "uploads");
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {}

    // Minimal upload handler (public, to support /media without auth)
    const storage = multer.diskStorage({
      destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
      filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname || "") || "";
        cb(null, uniqueSuffix + ext);
      },
    });
    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req: any, file: any, cb: any) => {
        const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mkv/;
        const ok = allowed.test((file.mimetype || "").toLowerCase()) || allowed.test((file.originalname || "").toLowerCase());
        if (ok) return cb(null, true);
        cb(new Error("Only images and videos are allowed"));
      },
    });

    app.post("/api/upload", upload.single("image"), (req, res) => {
      try {
        const file = (req as any).file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });
        return res.json({ url: `/uploads/${file.filename}` });
      } catch {
        return res.status(500).json({ error: "Failed to upload file" });
      }
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