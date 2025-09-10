import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ew-responsive-data-store",
      fileName: (format) => `index.${format}.min.js`,
    },
    rollupOptions: {
      external: ['@vue/reactivity', 'react','@vue/shared']
    }
  }
});
