// Global type augmentations for Express requests used in the server

import type { Request } from "express";

// Add minimal fields we use on the Request object so TypeScript doesn't error.
declare module "express-serve-static-core" {
  interface Request {
    // Set by our auth middleware
    adminId?: string;
    // Present when using express-session in dev / server environment
    session?: any;
    // Present when using multer single-file uploads
    file?: any;
    // Present when using multer multi-file uploads
    files?: any;
  }
}