import {
  type Admin,
  type InsertAdmin,
  type SlideshowImage,
  type InsertSlideshowImage,
  type Product,
  type InsertProduct,
  type CustomOrder,
  type InsertCustomOrder,
  type Contact,
  type InsertContact,
  type Upload,
  type InsertUpload,
  admins,
  products as productsTable,
  slideshowImages as slideshowImagesTable,
  customOrders as customOrdersTable,
  contacts as contactsTable,
  uploads as uploadsTable,
} from "../shared/schema";
import { randomUUID } from "crypto";
import { getDb, bootstrapDb } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminPassword(id: string, password: string): Promise<Admin | undefined>;

  // Slideshow methods
  getAllSlideshowImages(): Promise<SlideshowImage[]>;
  getSlideshowImage(id: string): Promise<SlideshowImage | undefined>;
  createSlideshowImage(image: InsertSlideshowImage): Promise<SlideshowImage>;
  updateSlideshowImage(
    id: string,
    data: Partial<InsertSlideshowImage>
  ): Promise<SlideshowImage | undefined>;
  deleteSlideshowImage(id: string): Promise<boolean>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: string,
    data: Partial<InsertProduct>
  ): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Uploads methods
  getAllUploads(): Promise<Upload[]>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  deleteUploadByFilename(filename: string): Promise<boolean>;

  // Custom Order methods
  getAllCustomOrders(): Promise<CustomOrder[]>;
  getCustomOrder(id: string): Promise<CustomOrder | undefined>;
  createCustomOrder(order: InsertCustomOrder): Promise<CustomOrder>;

  // Contact methods
  getAllContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
}

/**
 * In-memory storage (fallback for local dev without DB)
 */
export class MemStorage implements IStorage {
  private admins: Map<string, Admin>;
  private slideshowImages: Map<string, SlideshowImage>;
  private products: Map<string, Product>;
  private customOrders: Map<string, CustomOrder>;
  private contacts: Map<string, Contact>;
  private uploads: Map<string, Upload>;
  private persistPath: string | null;

  constructor() {
    this.admins = new Map();
    this.slideshowImages = new Map();
    this.products = new Map();
    this.customOrders = new Map();
    this.contacts = new Map();
    this.uploads = new Map();
    // Persist to JSON when running without DATABASE_URL (use /tmp on Vercel)
    const base = process.env.VERCEL ? "/tmp" : process.cwd();
    this.persistPath = `${base}/uploads_state.json`;
    this.loadFromDisk();

    // Create default admin (username: apurva, password: bakerybites2025)
    if (!Array.from(this.admins.values()).some(a => a.username.toLowerCase() === "apurva")) {
      this.createAdmin({ username: "apurva", password: "bakerybites2025" });
    }

    // Seed slideshow images (only if empty)
    if (this.slideshowImages.size === 0) {
      this.seedSlideshowImages();
    }

    // Seed products (only if empty)
    if (this.products.size === 0) {
      this.seedProducts();
    }
  }

  private loadFromDisk() {
    try {
      const fs = require("fs");
      if (this.persistPath && fs.existsSync(this.persistPath)) {
        const raw = fs.readFileSync(this.persistPath, "utf-8");
        const data = JSON.parse(raw || "{}");
        if (data.admins) for (const a of data.admins as Admin[]) this.admins.set(a.id, a);
        if (data.slideshowImages) for (const i of data.slideshowImages as SlideshowImage[]) this.slideshowImages.set(i.id, i);
        if (data.products) for (const p of data.products as Product[]) this.products.set(p.id, p);
        if (data.customOrders) for (const o of data.customOrders as CustomOrder[]) this.customOrders.set(o.id, o);
        if (data.contacts) for (const c of data.contacts as Contact[]) this.contacts.set(c.id, c);
        if (data.uploads) for (const u of data.uploads as Upload[]) this.uploads.set(u.id, u);
      }
    } catch {
      // ignore
    }
  }

  private saveToDisk() {
    try {
      if (!this.persistPath) return;
      const fs = require("fs");
      const payload = {
        admins: Array.from(this.admins.values()),
        slideshowImages: Array.from(this.slideshowImages.values()),
        products: Array.from(this.products.values()),
        customOrders: Array.from(this.customOrders.values()),
        contacts: Array.from(this.contacts.values()),
        uploads: Array.from(this.uploads.values()),
      };
      fs.writeFileSync(this.persistPath, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  private seedSlideshowImages() {
    const slideshowImages = [
      {
        imageUrl: "/assets/generated_images/Pink_birthday_cake_hero_1b0daf87.png",
        order: 0,
        isActive: true,
      },
      {
        imageUrl: "/assets/generated_images/Pastel_cupcakes_arrangement_hero_0b4c44fa.png",
        order: 1,
        isActive: true,
      },
      {
        imageUrl: "/assets/generated_images/Wedding_cake_hero_image_f0dd6599.png",
        order: 2,
        isActive: true,
      },
      {
        imageUrl: "/assets/generated_images/Macarons_and_pastries_hero_2165da4f.png",
        order: 3,
        isActive: true,
      },
      {
        imageUrl: "/assets/generated_images/Custom_decorated_cake_hero_f6649382.png",
        order: 4,
        isActive: true,
      },
    ];

    slideshowImages.forEach((img) => {
      this.createSlideshowImage(img);
    });
  }

  private seedProducts() {
    const products = [
      // Most Popular
      {
        name: "Chocolate Dream Cake",
        description: "Rich chocolate cake with silky ganache frosting, perfect for chocolate lovers",
        price: 599,
        category: "popular",
        imageUrl: "/assets/generated_images/Chocolate_cake_product_photo_c224ce5e.png",
        isChefChoice: false,
        isSignature: false,
      },
      {
        name: "Pink Paradise Cupcake",
        description: "Vanilla cupcake with pink swirl frosting and colorful sprinkles",
        price: 89,
        category: "popular",
        imageUrl: "/assets/generated_images/Pink_vanilla_cupcake_product_661c1df1.png",
        isChefChoice: false,
        isSignature: false,
      },
      {
        name: "Red Velvet Classic",
        description: "Classic red velvet cake with cream cheese frosting",
        price: 649,
        category: "popular",
        imageUrl: "/assets/generated_images/Red_velvet_cake_product_8b1d59ec.png",
        isChefChoice: false,
        isSignature: false,
      },
      {
        name: "Strawberry Shortcake",
        description: "Fresh strawberries with whipped cream on fluffy sponge cake",
        price: 549,
        category: "popular",
        imageUrl: "/assets/generated_images/Strawberry_shortcake_product_photo_d4a61d91.png",
        isChefChoice: false,
        isSignature: false,
      },
      // Our Choice (Chef's Choice & Signature)
      {
        name: "Artisan Donut Collection",
        description: "Handcrafted donuts with pastel glazes and premium toppings",
        price: 399,
        category: "choice",
        imageUrl: "/assets/generated_images/Colorful_donuts_product_photo_c3b6291b.png",
        isChefChoice: true,
        isSignature: false,
      },
      {
        name: "Signature Celebration Cake",
        description: "Our award-winning custom cake with intricate design details",
        price: 1299,
        category: "choice",
        imageUrl: "/assets/generated_images/Custom_decorated_cake_hero_f6649382.png",
        isChefChoice: false,
        isSignature: true,
      },
      {
        name: "Wedding Elegance",
        description: "Three-tier masterpiece with fresh flowers and gold accents",
        price: 3999,
        category: "choice",
        imageUrl: "/assets/generated_images/Wedding_cake_hero_image_f0dd6599.png",
        isChefChoice: true,
        isSignature: true,
      },
      // Catalog items (various categories)
      {
        name: "Birthday Celebration Cake",
        description: "Vibrant birthday cake with colorful frosting and sprinkles",
        price: 799,
        category: "cakes",
        imageUrl: "/assets/generated_images/Pink_birthday_cake_hero_1b0daf87.png",
        isChefChoice: false,
        isSignature: false,
      },
      {
        name: "Cupcake Deluxe Box",
        description: "12 gourmet cupcakes with assorted pastel frostings",
        price: 899,
        category: "cupcakes",
        imageUrl: "/assets/generated_images/Pastel_cupcakes_arrangement_hero_0b4c44fa.png",
        isChefChoice: false,
        isSignature: false,
      },
      {
        name: "French Macaron Platter",
        description: "Delicate French macarons and pastries in pastel colors",
        price: 699,
        category: "pastries",
        imageUrl: "/assets/generated_images/Macarons_and_pastries_hero_2165da4f.png",
        isChefChoice: false,
        isSignature: false,
      },
    ];

    products.forEach((product) => {
      this.createProduct(product);
    });
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const needle = username.trim().toLowerCase();
    return Array.from(this.admins.values()).find(
      (admin) => admin.username.trim().toLowerCase() === needle
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  async updateAdminPassword(id: string, password: string): Promise<Admin | undefined> {
    const existing = this.admins.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, password };
    this.admins.set(id, updated);
    return updated;
  }

  // Slideshow methods
  async getAllSlideshowImages(): Promise<SlideshowImage[]> {
    return Array.from(this.slideshowImages.values()).sort(
      (a, b) => a.order - b.order
    );
  }

  async getSlideshowImage(id: string): Promise<SlideshowImage | undefined> {
    return this.slideshowImages.get(id);
  }

  async createSlideshowImage(
    insertImage: InsertSlideshowImage
  ): Promise<SlideshowImage> {
    const id = randomUUID();
    const image: SlideshowImage = {
      ...insertImage,
      id,
      createdAt: new Date(),
    };
    this.slideshowImages.set(id, image);
    this.saveToDisk();
    return image;
  }

  async updateSlideshowImage(
    id: string,
    data: Partial<InsertSlideshowImage>
  ): Promise<SlideshowImage | undefined> {
    const image = this.slideshowImages.get(id);
    if (!image) return undefined;

    const updated = { ...image, ...data };
    this.slideshowImages.set(id, updated);
    return updated;
  }

  async deleteSlideshowImage(id: string): Promise<boolean> {
    return this.slideshowImages.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      category: insertProduct.category,
      imageUrl: insertProduct.imageUrl,
      isChefChoice: insertProduct.isChefChoice ?? false,
      isSignature: insertProduct.isSignature ?? false,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    this.saveToDisk();
    return product;
  }

  async updateProduct(
    id: string,
    data: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = { ...product, ...data };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Uploads
  async getAllUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async createUpload(insert: InsertUpload): Promise<Upload> {
    const id = randomUUID();
    const row: Upload = {
      id,
      filename: insert.filename,
      url: insert.url,
      mimetype: insert.mimetype,
      size: insert.size,
      isVideo: insert.isVideo ?? false,
      createdAt: new Date(),
    };
    this.uploads.set(id, row);
    this.saveToDisk();
    return row;
  }
  async deleteUploadByFilename(filename: string): Promise<boolean> {
    let deleted = false;
    for (const [id, u] of this.uploads) {
      if (u.filename === filename) {
        this.uploads.delete(id);
        deleted = true;
      }
    }
    if (deleted) this.saveToDisk();
    return deleted;
  }

  // Custom Order methods
  async getAllCustomOrders(): Promise<CustomOrder[]> {
    return Array.from(this.customOrders.values()).sort(
      (a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getCustomOrder(id: string): Promise<CustomOrder | undefined> {
    return this.customOrders.get(id);
  }

  async createCustomOrder(
    insertOrder: InsertCustomOrder
  ): Promise<CustomOrder> {
    const id = randomUUID();
    const order: CustomOrder = {
      id,
      cakeType: insertOrder.cakeType,
      size: insertOrder.size,
      flavor: insertOrder.flavor,
      customMessage: insertOrder.customMessage ?? null,
      deliveryDate: insertOrder.deliveryDate,
      customerName: insertOrder.customerName,
      phone: insertOrder.phone,
      email: insertOrder.email,
      createdAt: new Date(),
    };
    this.customOrders.set(id, order);
    this.saveToDisk();
    return order;
  }

  // Contact methods
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }
}

/**
 * Postgres-backed storage (production)
 */
export class PgStorage implements IStorage {
  private ready: Promise<void>;
  constructor() {
    this.ready = bootstrapDb();
  }
  private async ensureReady() {
    await this.ready;
  }
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const needle = username.trim().toLowerCase();
    const rows = await db
      .select()
      .from(admins)
      .where(sql`lower(${admins.username}) = ${needle}`)
      .limit(1);
    return rows[0];
  }
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    await this.ensureReady();
    const db = getDb()!;
    const id = randomUUID();
    const [row] = await db
      .insert(admins)
      .values({ id, ...insertAdmin })
      .returning();
    return row!;
  }
  async updateAdminPassword(id: string, password: string): Promise<Admin | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.update(admins).set({ password }).where(eq(admins.id, id)).returning();
    return row;
  }

  async getAllSlideshowImages(): Promise<SlideshowImage[]> {
    await this.ensureReady();
    const db = getDb()!;
    const rows = await db.select().from(slideshowImagesTable).orderBy(slideshowImagesTable.order);
    return rows;
  }
  async getSlideshowImage(id: string): Promise<SlideshowImage | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.select().from(slideshowImagesTable).where(eq(slideshowImagesTable.id, id)).limit(1);
    return row;
  }
  async createSlideshowImage(image: InsertSlideshowImage): Promise<SlideshowImage> {
    await this.ensureReady();
    const db = getDb()!;
    const id = randomUUID();
    const [row] = await db.insert(slideshowImagesTable).values({ id, ...image }).returning();
    return row!;
  }
  async updateSlideshowImage(id: string, data: Partial<InsertSlideshowImage>): Promise<SlideshowImage | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.update(slideshowImagesTable).set(data).where(eq(slideshowImagesTable.id, id)).returning();
    return row;
  }
  async deleteSlideshowImage(id: string): Promise<boolean> {
    await this.ensureReady();
    const db = getDb()!;
    const res = await db.delete(slideshowImagesTable).where(eq(slideshowImagesTable.id, id));
    // drizzle neon-http returns { rowCount?: number } only on pg driver; here assume success if no error
    return true;
  }

  async getAllProducts(): Promise<Product[]> {
    await this.ensureReady();
    const db = getDb()!;
    const rows = await db.select().from(productsTable);
    return rows;
  }
  async getProduct(id: string): Promise<Product | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    return row;
  }
  async getProductsByCategory(category: string): Promise<Product[]> {
    await this.ensureReady();
    const db = getDb()!;
    const rows = await db.select().from(productsTable).where(eq(productsTable.category, category));
    return rows;
  }
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    await this.ensureReady();
    const db = getDb()!;
    const id = randomUUID();
    const [row] = await db.insert(productsTable).values({ id, ...insertProduct }).returning();
    return row!;
  }
  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.update(productsTable).set(data).where(eq(productsTable.id, id)).returning();
    return row;
  }
  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureReady();
    const db = getDb()!;
    await db.delete(productsTable).where(eq(productsTable.id, id));
    return true;
  }

  async getAllCustomOrders(): Promise<CustomOrder[]> {
    await this.ensureReady();
    const db = getDb()!;
    const rows = await db.select().from(customOrdersTable).orderBy(desc(customOrdersTable.createdAt));
    return rows;
  }
  async getCustomOrder(id: string): Promise<CustomOrder | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.select().from(customOrdersTable).where(eq(customOrdersTable.id, id)).limit(1);
    return row;
  }
  async createCustomOrder(insertOrder: InsertCustomOrder): Promise<CustomOrder> {
    await this.ensureReady();
    const db = getDb()!;
    const id = randomUUID();
    const [row] = await db.insert(customOrdersTable).values({ id, ...insertOrder }).returning();
    return row!;
  }

  async getAllContacts(): Promise<Contact[]> {
    await this.ensureReady();
    const db = getDb()!;
    const rows = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
    return rows;
  }
  async getContact(id: string): Promise<Contact | undefined> {
    await this.ensureReady();
    const db = getDb()!;
    const [row] = await db.select().from(contactsTable).where(eq(contactsTable.id, id)).limit(1);
    return row;
  }
  async createContact(insertContact: InsertContact): Promise<Contact> {
    await this.ensureReady();
    const db = getDb()!;
    const id = randomUUID();
    const [row] = await db.insert(contactsTable).values({ id, ...insertContact }).returning();
    return row!;
  }
}

const hasDb = !!process.env.DATABASE_URL;
export const storage: IStorage = hasDb ? new PgStorage() : new MemStorage();
