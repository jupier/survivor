/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  base: "/survivor/", // GitHub Pages base path
  server: {
    port: 3000,
    open: true,
  },
  // @ts-ignore - vitest config
  test: {
    globals: true,
    environment: "jsdom",
  },
});
