import { defineConfig } from "vite";

export default defineConfig({
  server: { 
    open: true 
  },
  base: "/CS131Project/",
  build: {
    target: "es2020",
    outDir: "docs",
  },
});
