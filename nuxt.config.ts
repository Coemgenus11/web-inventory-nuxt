// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],

  css: ["~/assets/css/tailwind.css"],

  // pinia: {
  //   storesDirs: ["./stores/**", "./custom-folder/stores/**"],
  // },
    runtimeConfig: {
    // server-only, hindi makikita sa browser
    // apiSecret: process.env.API_SECRET,

    // client-side, safe i-expose
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },
})
