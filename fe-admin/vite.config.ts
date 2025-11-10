import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: false, // Tự động tìm port khác nếu 3000 bị chiếm
    host: true, // Cho phép access từ network
    open: true, // Tự động mở browser
  },
  preview: {
    port: 3000,
    strictPort: false,
  },
});
