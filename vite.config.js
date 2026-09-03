import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // The book carries embedded certificates and rotation frames as
    // base64 — keep them inline as one file rather than splitting chunks.
    chunkSizeWarningLimit: 4000,
  },
});
