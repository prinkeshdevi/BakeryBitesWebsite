import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import path from "path";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bakery-bites-secret-key-2023",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Serve uploaded files
// In Vercel/serverless, multer saves to /tmp (see routes.js). Mirror that here.
const baseUploadDir = process.env.VERCEL ? "/tmp" : process.cwd();
app.use("/uploads", express.static(path.join(baseUploadDir, "uploads")));

// Serve generated assets
app.use("/assets", express.static(path.join(process.cwd(), "attached_assets")));

// Capture raw body for certain integrations
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // @ts-ignore - runtime assignment
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Simple health check to debug availability
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    cwd: process.cwd(),
    time: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore circular refs
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err, _req, res, _next) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Unhandled error:", err);
  });

  // Setup Vite in development, serve static in production
  const env = app.get("env");
  log(`starting server in ${env} mode`);

  if (env === "development") {
    try {
      await setupVite(app, server);
      log("vite dev middleware attached");
    } catch (e) {
      console.error("Failed to setup Vite middleware:", e);
      throw e;
    }
  } else {
    try {
      serveStatic(app);
      log("serving static assets from dist/public");
    } catch (e) {
      console.error("Failed to serve static assets:", e);
      throw e;
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
