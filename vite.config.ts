import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.GITHUB_ACTIONS ? "/elhilodelasnornas/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "El Hilo de las Nornas",
        short_name: "Nornas",
        description: "RPG de acción isométrico sobre Ingrid, las runas y la defensa de Bjørndal.",
        theme_color: "#0a101d",
        background_color: "#050914",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [{ src: "assets/nornas-three-council-mark.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
  },
  server: { host: true },
});
