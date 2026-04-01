// @ts-check
import { defineConfig } from "astro/config";

import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
  },

  prefetch: {
    prefetchAll: false, // Jangan semua link di-prefetch otomatis
    defaultStrategy: "tap", // Hanya prefetch saat link disentuh/diklik
  },

  integrations: [react()],
});