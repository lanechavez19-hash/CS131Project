import { defineConfig } from "vite";
export default defineConfig({
  server: { open: true },
  build: { target: "es2020" },
  base: "./" // makes the build portable in a subfolder
});