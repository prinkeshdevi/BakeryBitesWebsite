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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

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

  // Custom Order methods
  getAllCustomOrders(): Promise<CustomOrder[]>;
  getCustomOrder(id: string): Promise<CustomOrder | undefined>;
  createCustomOrder(order: InsertCustomOrder): Promise<CustomOrder>;

  // Contact methods
  getAllContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private admins: Map<string, Admin>;
  private slideshowImages: Map<string, SlideshowImage>;
  private products: Map<string, Product>;
  private customOrders: Map<string, CustomOrder>;
  private contacts: Map<string, Contact>;

  constructor() {
    this.admins = new Map();
    this.slideshowImages = new Map();
    this.products = new Map();
    this.customOrders = new Map();
    this.contacts = new Map();

    // Create default admin (username: admin, password: admin123)
    this.createAdmin({ username: "admin", password: "admin123" });

    // Seed slideshow images
    this.seedSlideshowImages();

    // Seed products
    this.seedProducts();
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
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
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
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
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
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.customOrders.set(id, order);
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

export const storage = new MemStorage();
