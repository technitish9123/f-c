import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    // @react-pdf (order invoices) needs Node's stream/zlib/util/Buffer;
    // CRA's webpack 4 shimmed these automatically, Vite does not.
    nodePolyfills({ include: ["stream", "zlib", "util", "events", "buffer", "process"], globals: { Buffer: true, process: true } }),
  ],
  // keep the existing REACT_APP_* variable names (Render env + .env)
  envPrefix: "REACT_APP_",
  server: { port: 3000 },
  preview: { port: 3000 },
  // Render publishes ./build
  build: { outDir: "build", sourcemap: false },
});
