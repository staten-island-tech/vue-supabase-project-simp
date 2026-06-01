<template>
  <div class="min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-20 left-20 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div class="absolute top-40 right-20 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute -bottom-8 left-1/2 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 4s"></div>
    </div>

    <!-- Main card -->
    <div class="relative z-10 w-full max-w-md">
      <div class="rounded-3xl border-2 border-purple-500 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl p-8 backdrop-blur-xl">
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="text-7xl mb-4 animate-bounce">🐣</div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300 mb-2">
            HATCH YOUR TRAINER
          </h1>
          <p class="text-purple-200 text-sm">Choose your Trainer ID and begin your Pet Kingdom journey</p>
        </div>

        <!-- Message alert -->
        <div
          v-if="message"
          class="mb-6 p-4 rounded-xl border-2 text-center font-bold animate-pulse"
          :class="messageType === 'error'
            ? 'bg-red-900 border-red-500 text-red-200'
            : 'bg-green-900 border-green-500 text-green-200'"
        >
          {{ message }}
        </div>

        <!-- Form -->
        <form @submit.prevent="signUp" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wide">
              � Trainer Name
            </label>
            <input
              v-model="trainerName"
              type="text"
              required
              placeholder="e.g., Ash, Misty, Brock..."
              maxlength="20"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-purple-500 text-white placeholder-purple-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wide">
              �📧 Trainer Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="trainer@kingdom.com"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-purple-500 text-white placeholder-purple-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-purple-200 mb-2 uppercase tracking-wide">
              🔐 Secure Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-purple-500 text-white placeholder-purple-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 transition"
            />
            <p class="text-xs text-purple-300 mt-2">
              🔒 Minimum 6 characters for your protection
            </p>
          </div>

          <button
            type="submit"
            class="w-full relative group rounded-xl bg-linear-to-r from-yellow-500 via-pink-500 to-purple-500 hover:from-yellow-400 hover:via-pink-400 hover:to-purple-400 text-white font-black py-4 text-lg uppercase tracking-wider shadow-xl transform hover:scale-105 transition overflow-hidden"
          >
            <span class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition"></span>
            <span class="relative flex items-center justify-center gap-2">
              🌟 HATCH NOW 🌟
            </span>
          </button>
        </form>

        <!-- Perks -->
        <div class="mt-8 space-y-3">
          <div class="flex items-center gap-3 text-sm">
            <span class="text-xl">✨</span>
            <p class="text-purple-200">Instant pet hatching upon signup</p>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-xl">🎁</span>
            <p class="text-purple-200">Daily login bonuses and rewards</p>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="text-xl">⚡</span>
            <p class="text-purple-200">Access to exclusive summoning events</p>
          </div>
        </div>

        <!-- Login link -->
        <div class="mt-8 pt-6 border-t border-purple-700 text-center">
          <p class="text-purple-300 text-sm mb-3">
            Already a Trainer?
          </p>
          <NuxtLink
            to="/login"
            class="inline-block px-6 py-2 rounded-lg border-2 border-cyan-500 hover:bg-cyan-500 hover:bg-opacity-20 text-cyan-300 font-bold transition"
          >
            🔮 Login to Your Kingdom
          </NuxtLink>
        </div>
      </div>

      <!-- Floating pets decoration -->
      <div class="absolute -top-16 left-10 text-5xl animate-bounce pointer-events-none">🐲</div>
      <div class="absolute -bottom-16 right-10 text-6xl opacity-50 pointer-events-none">🐰</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '../store/player'

const email = ref('')
const password = ref('')
const trainerName = ref('')
const message = ref('')
const messageType = ref('success')
const loading = ref(false)

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

const signUp = async () => {
  if (!trainerName.value.trim()) {
    message.value = '⚠️ Please enter a Trainer Name'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = '🐣 Hatching your Trainer ID...'
  messageType.value = 'success'

  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (error) {
      message.value = `⚠️ ${error.message}`
      messageType.value = 'error'
      loading.value = false
      return
    }

    if (!data.user) {
      message.value = '⚠️ Signup failed. Please try again.'
      messageType.value = 'error'
      loading.value = false
      return
    }

    // Initialize player profile and give starter pets
    await playerStore.initializeNewPlayer(data.user.id, email.value, trainerName.value)

    message.value = '✨ Trainer hatched! Redirecting to login...'
    messageType.value = 'success'

    email.value = ''
    password.value = ''
    trainerName.value = ''

    await new Promise(resolve => setTimeout(resolve, 1500))
    await navigateTo('/login')
  } catch (err: any) {
    message.value = `⚠️ ${err.message || 'An error occurred'}`
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>