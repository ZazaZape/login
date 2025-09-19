import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
  },
});
