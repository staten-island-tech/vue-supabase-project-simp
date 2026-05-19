import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  css:['./app/assets/css/main.css'],
  modules:[
    '@pinia/nuxt',
  ],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vite:{
    plugins:[
      tailwindcss(),
    ],
  },
});
