import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxtjs/supabase'],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  srcDir: 'app',
  vite: {
    plugins: [tailwindcss()],
  },
  supabase: {
    redirect: false,
  },
})