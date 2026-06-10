<template>
  <div class="min-h-screen bg-gradient-to-r from-pink-200 to-blue-300 flex flex-col items-center justify-center p-6">
    <!-- Decorative background elements -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

    <div class="w-full max-w-2xl rounded-3xl border border-white/40 bg-white/80 backdrop-blur-lg p-12 shadow-2xl relative z-10">
      <!-- Header Section -->
      <div class="text-center mb-10">
        <h1 class="mb-3 text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          🏰 Welcome to the Hatchery
        </h1>
        <p class="text-lg text-slate-600 leading-relaxed">
          Feed your pets, collect better evolutions, and unlock stronger battles. Your kingdom starts here.
        </p>
      </div>

      <!-- Button Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Primary Button -->
        <NuxtLink
          to="/login"
          class="group relative rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 px-6 py-4 text-center text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            🚪 Sign in
          </span>
        </NuxtLink>

        <!-- Secondary Button -->
        <NuxtLink
          to="/signup"
          class="group relative rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-4 text-center text-slate-900 font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-slate-200 hover:border-slate-300 overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            🐣 New Account
          </span>
        </NuxtLink>

        <!-- Tertiary Buttons -->
        <NuxtLink
          to="/inventory"
          class="group relative rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 px-6 py-4 text-center text-emerald-900 font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-200 hover:border-emerald-300 overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            📜 Inventory
          </span>
        </NuxtLink>

        <NuxtLink
          to="/pet"
          class="group relative rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 px-6 py-4 text-center text-amber-900 font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-200 hover:border-amber-300 opacity-75 overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            🐣 Pet
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>