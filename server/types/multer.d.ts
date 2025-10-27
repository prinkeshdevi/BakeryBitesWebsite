// Minimal local type declarations for 'multer' to satisfy TypeScript on Vercel
// If you later add '@types/multer', you can remove this file.

import type { Request } from "express";

declare module "multer" {
  namespace MulterNS {
    interface Multer {
      single(fieldname: string): any;
    }

    interface StorageEngine {
      _handleFile(req: Request, file: any, cb: (error?: any, info?: any) => void): void;
      _removeFile(req: Request, file: any, cb: (error: Error) => void): void;
    }

    interface MulterFile {
      fieldname?: string;
      originalname: string;
      encoding?: string;
      mimetype: string;
      size?: number;
      destination?: string;
      filename: string;
      path?: string;
      buffer?: Buffer;
    }

    type FileFilterCallback = (error: any, acceptFile: boolean) => void;

    function diskStorage(opts: {
      destination: (req: Request, file: MulterFile, cb: (error: any, destination: string) => void) => void;
      filename: (req: Request, file: MulterFile, cb: (error: any, filename: string) => void) => void;
    }): StorageEngine;
  }

  // Default export (for ESM default import)
  function multer(opts: {
    storage: MulterNS.StorageEngine;
    limits?: { fileSize?: number };
    fileFilter?: (req: Request, file: MulterNS.MulterFile, cb: MulterNS.FileFilterCallback) => void;
  }): MulterNS.Multer;
  export default multer;

  // Named export for diskStorage
  export const diskStorage: typeof MulterNS.diskStorage;

  // Re-export types within a namespace-like object
  export namespace multer {
    export import Multer = MulterNS.Multer;
    export import StorageEngine = MulterNS.StorageEngine;
    export import MulterFile = MulterNS.MulterFile;
    export import FileFilterCallback = MulterNS.FileFilterCallback;
  }
}