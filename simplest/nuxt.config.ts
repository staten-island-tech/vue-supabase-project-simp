import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      },
    },
  },
  modules: ['@pinia/nuxt', '@nuxtjs/supabase'],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  srcDir: 'app',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
