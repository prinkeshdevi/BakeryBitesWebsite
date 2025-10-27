import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const plugins = [react()];

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Runtime error overlay is dev-only
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    plugins.push(runtimeErrorOverlay());

    // Load Replit-only dev plugins dynamically (only when running on Replit)
    if (process.env.REPL_ID !== undefined) {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      plugins.push(cartographer(), devBanner());
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        // In case any component still references this at build time
        external: ["@radix-ui/react-tooltip"],
      },
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
