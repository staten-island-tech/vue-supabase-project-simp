<template>
  <div class="min-h-screen bg-linear-to-b from-blue-400 via-purple-300 to-pink-300 flex items-center justify-center p-4">
    <!-- Floating pets decoration -->
    <div class="absolute top-10 right-10 text-6xl animate-bounce">🐱</div>
    <div class="absolute top-32 left-16 text-5xl animate-pulse">🐾</div>
    <div class="absolute bottom-24 right-16 text-7xl opacity-50">🌟</div>

    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🧙‍♂️ Pet Kingdom Login
        </h1>
        <p class="text-gray-600 text-lg">Welcome back, Trainer! Feed, battle, and evolve your pets.</p>
      </div>

      <div
        v-if="message"
        class="mb-6 p-4 border-2 rounded-xl text-center"
        :class="messageType === 'error'
          ? 'bg-red-100 border-red-400 text-red-700'
          : 'bg-green-100 border-green-400 text-green-700 font-bold'"
      >
        {{ message }}
      </div>

      <form @submit.prevent="signIn" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@kingdom.com"
            class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition transform hover:scale-105"
        >
          🔮 Enter the Hatchery
        </button>
      </form>

      <div class="text-center text-gray-600 mt-6 space-y-2">
        <p>
          New Trainer?
          <NuxtLink to="/signup" class="text-blue-700 font-bold hover:underline">
            Hatch a new account
          </NuxtLink>
        </p>

        <p class="text-sm opacity-80">
          Tip: If you don’t see your pet progress, make sure you verified your email (if enabled).
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const message = ref('')
const messageType = ref('success')

const supabase = useSupabaseClient()

const signIn = async () => {
  message.value = 'Summoning your trainer profile...'
  messageType.value = 'success'

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    message.value = error.message
    messageType.value = 'error'
    return
  }

  message.value = 'Welcome back! Your pets are waiting ✨'
  messageType.value = 'success'

  await navigateTo('/')
}
</script>