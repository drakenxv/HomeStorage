import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallback: "index.html"
      },
      manifest: {
        name: "Inventory",
        short_name: "Inventory",
        description: "Offline inventory and expiry tracker",
        start_url: "./",
        display: "standalone",
        background_color: "#f7f7f8",
        theme_color: "#111827",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      }
    })
  ]
});