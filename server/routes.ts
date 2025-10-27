import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { isCloudinaryEnabled, uploadLocalFileToCloudinary, destroyCloudinary } from "./cloudinary";
import {
  insertSlideshowImageSchema,
  insertProductSchema,
  insertCustomOrderSchema,
  insertContactSchema,
} from "../shared/schema";
import { clearAdminAuth, getAdminIdFromReq, requireAuthJWT, setAdminAuth } from "./auth";

// Configure multer for file uploads
// On Vercel serverless, the filesystem is read-only except for /tmp
const baseUploadDir = process.env.VERCEL ? "/tmp" : process.cwd();
const uploadDir = path.join(baseUploadDir, "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req: Request, file: any, cb: (error: any, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: any, cb: (error: any, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: Request, file: any, cb: any) => {
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

// Authentication middleware that supports both session and JWT cookie
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = (req as any).session?.adminId as string | undefined;
  const jwtId = getAdminIdFromReq(req);
  if (sessionId || jwtId) {
    (req as any).adminId = sessionId || jwtId;
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const rawUsername = req.body?.username;
      const rawPassword = req.body?.password;

      if (!rawUsername || !rawPassword) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const username = String(rawUsername).trim();
      const password = String(rawPassword).trim();

      // Accept either of these default credentials (case-insensitive username)
      const defaults = [
        { username: "apurva", password: "bakerybites2025" },
        { username: "admin", password: "admin123" },
      ];

      const matchedDefault = defaults.find(
        (d) => username.toLowerCase() === d.username && password === d.password
      );

      // Fast-path: if matched default, log in immediately and try to sync storage best-effort
      if (matchedDefault) {
        try {
          let found = await storage.getAdminByUsername(matchedDefault.username);
          if (!found) {
            found = await storage.createAdmin({
              username: matchedDefault.username,
              password: matchedDefault.password,
            });
          } else if (found.password !== matchedDefault.password) {
            const updated = await storage.updateAdminPassword(found.id, matchedDefault.password);
            if (updated) found = updated;
          }
          // Set session + JWT
          req.session.adminId = found.id;
          setAdminAuth(res, found.id);
        } catch {
          // Storage sync failed — still grant session using a stable id
          req.session.adminId = `default-${matchedDefault.username}`;
          setAdminAuth(res, `default-${matchedDefault.username}`);
        }
        return res.json({ message: "Login successful" });
      }

      // Non-default credentials path: use storage
      let admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set either session or JWT cookie for auth
      req.session.adminId = admin.id;
      setAdminAuth(res, admin.id);

      res.json({ message: "Login successful" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    clearAdminAuth(res);
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ message: "Logout successful" });
      });
    } else {
      res.json({ message: "Logout successful" });
    }
  });

  app.get("/api/admin/check", requireAuth, (req, res) => {
    res.json({ authenticated: true });
  });

  // Slideshow Routes
  app.get("/api/slideshow", async (req, res) => {
    try {
      const images = await storage.getAllSlideshowImages();
      res.json(images.filter((img) => img.isActive));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow images" });
    }
  });

  app.post(
    "/api/slideshow",
    requireAuth,
    upload.single("image"),
    async (req, res) => {
      try {
        const mreq = req as Request & { file?: any };
        if (!mreq.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = `/uploads/${mreq.file.filename}`;
        const images = await storage.getAllSlideshowImages();
        const maxOrder = images.length > 0 ? Math.max(...images.map((i) => i.order)) : -1;

        const newImage = await storage.createSlideshowImage({
          imageUrl,
          order: maxOrder + 1,
          isActive: true,
        });

        res.json(newImage);
      } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/popular", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory("popular");
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular products" });
    }
  });

  app.get("/api/products/choice", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory("choice");
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch choice products" });
    }
  });

  app.get("/api/products/catalog", async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts();
      // Return all products except those only in popular/choice categories
      res.json(allProducts);
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid product data" });
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // File Upload Route (for product images) - public to support /media without auth
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      const mreq = req as Request & { file?: any };
      if (!mreq.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = mreq.file;
      let url = `/uploads/${file.filename}`;
      let publicId: string | null = null;
      let isVideo =
        /\.(mp4|mov|avi|webm|mkv)$/i.test((file.originalname || "").toLowerCase()) ||
        /^video\\//i.test(String(file.mimetype || ""));

      // If Cloudinary is configured, upload the saved local file to Cloudinary
      if (isCloudinaryEnabled()) {
        try {
          const localPath = path.join(uploadDir, file.filename);
          const uploaded = await uploadLocalFileToCloudinary(localPath, {
            folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "bakery-bites",
          });
          url = uploaded.url;
          publicId = uploaded.publicId;
          isVideo = uploaded.resourceType === "video";
        } catch (e) {
          // Cloud upload failed; continue with local url
        }
      }

      // Persist upload metadata (DB if available, otherwise memory)
      try {
        await storage.createUpload({
          filename: file.filename,
          url,
          mimetype: String(file.mimetype || "application/octet-stream"),
          size: Number(file.size || 0),
          isVideo,
          publicId: publicId || undefined,
        } as any);
      } catch {
        // ignore metadata failures
      }

      res.json({ url });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Custom Order Routes
  app.get("/api/orders/custom", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllCustomOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders/custom", async (req, res) => {
    try {
      const validated = insertCustomOrderSchema.parse(req.body);
      const order = await storage.createCustomOrder(validated);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid order data" });
    }
  });

  // Contact Routes
  app.get("/api/contacts", requireAuth, async (_req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const validated = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validated);
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid contact data" });
    }
  });

  // Uploads listing and deletion (public to support /media)
  app.get("/api/uploads", async (_req, res) => {
    try {
      try {
        const rows = await storage.getAllUploads();
        if (rows && rows.length) {
          const mapped = rows.map((u) => ({
            name: u.filename,
            size: Number((u as any).size || 0),
            modifiedAt: (u as any).createdAt ? new Date((u as any).createdAt as any).getTime() : Date.now(),
            url: u.url,
            isVideo: !!(u as any).isVideo,
          })).sort((a, b) => b.modifiedAt - a.modifiedAt);
          return res.json(mapped);
        }
      } catch {
        // fall back to FS
      }
      if (!existsSync(uploadDir)) {
        return res.json([]);
      }
      const files = readdirSync(uploadDir);
      const list = files.map((name) => {
        const full = path.join(uploadDir, name);
        const st = statSync(full);
        const lower = name.toLowerCase();
        const isVideo = /\.(mp4|mov|avi|webm|mkv)$/.test(lower);
        return {
          name,
          size: st.size,
          modifiedAt: st.mtimeMs,
          url: `/uploads/${name}`,
          isVideo,
        };
      }).sort((a, b) => b.modifiedAt - a.modifiedAt);
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: "Failed to list uploads" });
    }
  });

  app.delete("/api/uploads/:name", async (req, res) => {
    try {
      const name = req.params.name;
      // Prevent path traversal
      const safeName = path.basename(name);

      // Try Cloudinary delete if configured and record exists
      if (isCloudinaryEnabled()) {
        try {
          const rec = await storage.getUploadByFilename(safeName);
          if (rec && (rec as any).publicId) {
            await destroyCloudinary((rec as any).publicId as string);
          }
        } catch {}
      }

      // Delete local file as best-effort
      const full = path.join(uploadDir, safeName);
      if (existsSync(full)) {
        unlinkSync(full);
      }
      try {
        await storage.deleteUploadByFilename(safeName);
      } catch {}
      res.json({ message: "Deleted" });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
