import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import {
  insertSlideshowImageSchema,
  insertProductSchema,
  insertCustomOrderSchema,
  insertContactSchema,
} from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
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

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (req.session?.adminId) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
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
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
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

  // File Upload Route (for product images)
  app.post("/api/upload", requireAuth, upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
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
  app.get("/api/contacts", requireAuth, async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
