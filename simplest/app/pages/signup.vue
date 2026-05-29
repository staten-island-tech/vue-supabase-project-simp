<template>
  <div class="min-h-screen bg-linear-to-b from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
    <!-- Floating pets decoration -->
    <div class="absolute top-10 left-10 text-6xl animate-bounce">🐲</div>
    <div class="absolute top-20 right-20 text-5xl animate-pulse">✨</div>
    <div class="absolute bottom-20 left-20 text-7xl opacity-50">🐰</div>

    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          ✨ Hatch Your Pet Kingdom ✨
        </h1>
        <p class="text-gray-600 text-lg">Create your Trainer ID. Then feed & evolve your first pet!</p>
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

      <form @submit.prevent="signUp" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@kingdom.com"
            class="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            class="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
          />
          <p class="text-xs text-gray-500 mt-2">
            Minimum 6 characters.
          </p>
        </div>

        <button
          type="submit"
          class="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition transform hover:scale-105"
        >
          🐣 Begin Hatching
        </button>
      </form>

      <div class="text-center text-gray-600 mt-6">
        Already a Trainer?
        <NuxtLink to="/login" class="text-purple-700 font-bold hover:underline">
          Log in and care for pets
        </NuxtLink>
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

const signUp = async () => {
  message.value = 'Hatching your Trainer ID...'
  messageType.value = 'success'

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    message.value = error.message
    messageType.value = 'error'
    return
  }

  // If email confirmations are enabled, Supabase may not create an active session yet.
  // Your original redirect to /login may happen too fast; we keep it but give clearer UI.
  message.value = 'Trainer hatched! Redirecting you to the login hatchery...'
  messageType.value = 'success'

  email.value = ''
  password.value = ''

  // Keep your original behavior
  await navigateTo('/login')
}
</script>