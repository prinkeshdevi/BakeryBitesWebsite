// Fallback shims for modules without available type declarations in this project
declare module "multer" {
  const multerDefault: any;
  export default multerDefault;
  export const diskStorage: any;
}