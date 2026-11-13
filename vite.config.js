import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // keep the existing REACT_APP_* variable names (Render env + .env)
  envPrefix: "REACT_APP_",
  server: { port: 3000 },
  preview: { port: 3000 },
  // Render publishes ./build
  build: { outDir: "build", sourcemap: false },
});
