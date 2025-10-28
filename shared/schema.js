import { z } from "zod";

/**
 * Runtime-only schemas (Zod). Removed Drizzle-specific constructs to keep JS-only.
 * These are used for request validation in routes.
 */

export const insertAdminSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertSlideshowImageSchema = z.object({
  imageUrl: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.string().min(1),
  imageUrl: z.string().min(1),
  isChefChoice: z.boolean().default(false),
  isSignature: z.boolean().default(false),
});

export const insertCustomOrderSchema = z.object({
  cakeType: z.string().min(1),
  size: z.string().min(1),
  flavor: z.string().min(1),
  customMessage: z.string().optional(),
  deliveryDate: z.string().min(1),
  customerName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
});

export const insertContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});
