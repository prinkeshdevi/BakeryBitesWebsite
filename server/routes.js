import { createServer } from "http";
import { storage } from "./storage.js";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import crypto from "crypto";
import {
  insertSlideshowImageSchema,
  insertProductSchema,
  insertCustomOrderSchema,
  insertContactSchema,
} from "../shared/schema.js";

// Configure multer for file uploads
const baseUploadDir = process.env.VERCEL ? "/tmp" : process.cwd();
const uploadDir = path.join(baseUploadDir, "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// --- Stateless auth helpers (works on Vercel serverless) ---
const TOKEN_COOKIE = "auth";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24h
const SECRET = process.env.SESSION_SECRET || "bakery-bites-secret-key-2023";

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${hmac}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookie(req, name) {
  const cookie = req.headers?.cookie || "";
  const parts = cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

function setCookie(res, name, value, { maxAge = TOKEN_TTL_SECONDS } = {}) {
  const cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${maxAge}`,
  ].join("; ");
  res.setHeader("Set-Cookie", cookie);
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session?.adminId) {
    return next();
  }
  // stateless token fallback
  const token = parseCookie(req, TOKEN_COOKIE);
  const payload = verify(token);
  if (payload?.adminId) {
    // bridge for downstream code if needed
    req.session = req.session || {};
    req.session.adminId = payload.adminId;
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(app) {
  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password required" });
      }

      const admin = await storage.getAdminByUsername(username);

      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // set in-memory session (for non-serverless/dev)
      req.session.adminId = admin.id;

      // also set stateless cookie for serverless environments
      const token = sign({
        adminId: admin.id,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
      });
      setCookie(res, TOKEN_COOKIE, token);

      res.json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    try {
      // clear stateless cookie
      setCookie(res, TOKEN_COOKIE, "", { maxAge: 0 });

      // destroy stateful session if present
      req.session?.destroy?.(() => {});
      res.json({ message: "Logout successful" });
    } catch (err) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/admin/check", requireAuth, (_req, res) => {
    res.json({ authenticated: true });
  });

  // Slideshow Routes
  app.get("/api/slideshow", async (_req, res) => {
    try {
      const images = await storage.getAllSlideshowImages();
      res.json(images.filter((img) => img.isActive));
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch slideshow images" });
    }
  });

  app.post(
    "/api/slideshow",
    requireAuth,
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const images = await storage.getAllSlideshowImages();
        const maxOrder =
          images.length > 0 ? Math.max(...images.map((i) => i.order)) : -1;

        const newImage = await storage.createSlideshowImage({
          imageUrl,
          order: maxOrder + 1,
          isActive: true,
        });

        res.json(newImage);
      } catch (error) {
        console.error("Slideshow upload error:", error);
        res.status(500).json({ error: "Failed to upload image" });
      }
    }
  );

  app.patch("/api/slideshow/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSlideshowImage(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: "Image not found" });
      }

      res.json(updated);
    } catch (_error) {
      res.status(500).json({ error: "Failed to update image" });
    }
  });

  app.delete("/api/slideshow/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSlideshowImage(id);

      if (!deleted) {
        return res.status(404).json({ error: "Image not found" });
      }

      res.json({ message: "Image deleted successfully" });
    } catch (_error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Product Routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/popular", async (_req, res) => {
    try {
      const products = await storage.getProductsByCategory("popular");
      res.json(products);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch popular products" });
    }
  });

  app.get("/api/products/choice", async (_req, res) => {
    try {
      const products = await storage.getProductsByCategory("choice");
      res.json(products);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch choice products" });
    }
  });

  app.get("/api/products/catalog", async (_req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      res.json(allProducts);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch catalog" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error?.message || "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateProduct(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(updated);
    } catch (_error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (_error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // File Upload Route (for product images)
  app.post("/api/upload", requireAuth, upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Custom Order Routes
  app.get("/api/orders/custom", requireAuth, async (_req, res) => {
    try {
      const orders = await storage.getAllCustomOrders();
      res.json(orders);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/custom", async (req, res) => {
    try {
      const validated = insertCustomOrderSchema.parse(req.body);
      const order = await storage.createCustomOrder(validated);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error?.message || "Invalid order data" });
    }
  });

  // Contact Routes
  app.get("/api/contacts", requireAuth, async (_req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (_error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validated = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validated);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: error?.message || "Invalid contact data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
