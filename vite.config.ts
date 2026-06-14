import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy vendor libs out of the main bundle so the demo's
        // first paint is snappy. mermaid + recharts dominate bundle size.
        manualChunks: {
          mermaid: ["mermaid"],
          recharts: ["recharts"],
          "react-vendor": ["react", "react-dom"],
          tanstack: ["@tanstack/react-router", "@tanstack/react-query", "@tanstack/react-table"],
        },
      },
    },
  },
})
