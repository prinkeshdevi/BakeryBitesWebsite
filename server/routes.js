import { createServer } from "http";
import { storage } from "./storage.js";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import {
  insertSlideshowImageSchema,
  insertProductSchema,
  insertCustomOrderSchema,
  insertContactSchema,
} from "../shared/schema.js";

// Configure upload targets
const baseUploadDir = process.env.VERCEL ? "/tmp" : process.cwd();
const uploadDir = path.join(baseUploadDir, "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Always use memory storage; decide destination in handler
const upload = multer({
  storage: multer.memoryStorage(),
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

async function storeFileAndGetUrl(file) {
  const addSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext);
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const finalName = `${safeName}-${addSuffix}${ext}`;

  // Prefer Vercel Blob in serverless
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(finalName, file.buffer, {
      access: "public",
      addRandomSuffix: false,
      token,
    });
    return blob.url;
  }

  // Fallback to local tmp/disk storage
  const targetPath = path.join(uploadDir, finalName);
  await fs.writeFile(targetPath, file.buffer);
  return `/uploads/${finalName}`;
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session?.adminId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
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

      req.session.adminId = admin.id;
      res.json({ message: "Login successful" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
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

        const imageUrl = await storeFileAndGetUrl(req.file);
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
        const msg =
          error?.message ||
          "Failed to upload image. Ensure BLOB_READ_WRITE_TOKEN is set.";
        res.status(500).json({ error: msg });
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
  app.post("/api/upload", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = await storeFileAndGetUrl(req.file);
      res.json({ url: imageUrl });
    } catch (error) {
      const msg =
        error?.message ||
        "Failed to upload file. Ensure BLOB_READ_WRITE_TOKEN is set.";
      res.status(500).json({ error: msg });
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
