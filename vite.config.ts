/// <reference types="vitest" />
import { defineConfig } from "vite";
import { versionPlugin } from "./vite-plugin-version";

export default defineConfig({
  base: "/survivor/", // GitHub Pages base path
  server: {
    port: 3000,
    open: true,
  },
  plugins: [versionPlugin()],
  // @ts-ignore - vitest config
  test: {
    globals: true,
    environment: "jsdom",
  },
});
