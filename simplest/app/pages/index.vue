<template>
  <div class="min-h-screen bg-linear-to-b from-slate-50 to-white flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
      <h1 class="mb-3 text-center text-4xl font-semibold text-slate-900">
        🏰 Welcome to the Hatchery
      </h1>
      <p class="mb-8 text-center text-slate-600">
        Feed your pets, collect better evolutions, and unlock stronger battles. Your kingdom starts here.
      </p>

      <div class="flex flex-col gap-4 sm:grid sm:grid-cols-2">
        <NuxtLink
          to="/login"
          class="rounded-2xl border border-slate-200 bg-sky-600 px-5 py-4 text-center text-white transition hover:bg-sky-700 font-bold"
        >
          🚪 Leave & Sign in again
        </NuxtLink>

        <NuxtLink
          to="/signup"
          class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200 font-bold"
        >
          🐣 Hatch another account
        </NuxtLink>

        <!-- Placeholders / placeholders from your original -->
        <NuxtLink
          to="/"
          class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200 font-bold"
        >
          📜 Quest Log (coming soon)
        </NuxtLink>

        <NuxtLink
          to="/"
          class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200 font-bold"
        >
          🧪 Pet Lab (coming soon)
        </NuxtLink>
      </div>
    </div>
  </div>
</template>