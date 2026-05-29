<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
      <h1 class="mb-6 text-center text-4xl font-semibold text-slate-900">Main Menu</h1>
      <p class="mb-8 text-center text-slate-600">Welcome to your account. You can manage your account or login in to see your pets</p>

      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/login" class="rounded-2xl border border-slate-200 bg-sky-600 px-5 py-4 text-center text-white transition hover:bg-sky-700">
          Sign out of the current account and go back to sign in
        </NuxtLink>
        <NuxtLink to="/signup" class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200">
          Sign out of the current account and go back to sign up
        </NuxtLink>
        <NuxtLink to="/" class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200">
          text here
        </NuxtLink>
        <NuxtLink to="/" class="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-900 transition hover:bg-slate-200">
          text here
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
