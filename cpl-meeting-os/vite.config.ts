import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

/**
 * GitHub Pages:
 * - For https://<user>.github.io/<repo>/ set base="/<repo>/"
 * - For https://<user>.github.io set base="/"
 *
 * GitHub Actions passes GITHUB_REPO_NAME during build.
 */
const repoName = process.env.GITHUB_REPO_NAME || "";
const base = repoName ? `/${repoName}/` : "/";

import path from "path";

export default defineConfig({
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "CPL Meeting OS",
        short_name: "CPL OS",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#0b0b0b",
        theme_color: "#0b0b0b",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  test: {
    environment: "jsdom"
  }
});
