import { copyFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

// GitHub Pages serves 404.html for unknown paths; reusing index.html lets the SPA router handle deep links.
const spaFallback = (): Plugin => ({
  name: "spa-404-fallback",
  apply: "build",
  closeBundle() {
    copyFileSync("dist/index.html", "dist/404.html");
  },
});

export default defineConfig({
  base: "/Detalk-App/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          ethers: ["ethers"],
          radix: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
});
