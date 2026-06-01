<template>
  <div class="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-20 right-20 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div class="absolute bottom-20 left-20 w-64 h-64 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 2s"></div>
      <div class="absolute top-1/2 right-1/2 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 4s"></div>
    </div>

    <!-- Main card -->
    <div class="relative z-10 w-full max-w-md">
      <div class="rounded-3xl border-2 border-cyan-500 bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 shadow-2xl p-8 backdrop-blur-xl">
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="text-7xl mb-4 animate-pulse">🧙‍♂️</div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-300 mb-2">
            WELCOME BACK
          </h1>
          <p class="text-blue-200 text-sm">Your pets are waiting to be cared for...</p>
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
        <form @submit.prevent="signIn" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-blue-200 mb-2 uppercase tracking-wide">
              📧 Trainer Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="trainer@kingdom.com"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-cyan-500 text-white placeholder-cyan-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-blue-200 mb-2 uppercase tracking-wide">
              🔐 Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-cyan-500 text-white placeholder-cyan-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            class="w-full relative group rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-black py-4 text-lg uppercase tracking-wider shadow-xl transform hover:scale-105 transition overflow-hidden"
          >
            <span class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition"></span>
            <span class="relative flex items-center justify-center gap-2">
              🔮 ENTER THE HATCHERY 🔮
            </span>
          </button>
        </form>

        <!-- Info -->
        <div class="mt-8 space-y-3 text-sm">
          <div class="flex items-center gap-2 text-cyan-200">
            <span class="text-lg">⚡</span>
            <p>Your pets' care points reset daily</p>
          </div>
          <div class="flex items-center gap-2 text-cyan-200">
            <span class="text-lg">🎁</span>
            <p>Claim your daily login bonus</p>
          </div>
          <div class="flex items-center gap-2 text-cyan-200">
            <span class="text-lg">🏆</span>
            <p>Check the leaderboards</p>
          </div>
        </div>

        <!-- Signup link -->
        <div class="mt-8 pt-6 border-t border-cyan-700 text-center">
          <p class="text-blue-300 text-sm mb-3">
            New to Pet Kingdom?
          </p>
          <NuxtLink
            to="/signup"
            class="inline-block px-6 py-2 rounded-lg border-2 border-yellow-500 hover:bg-yellow-500 hover:bg-opacity-20 text-yellow-300 font-bold transition"
          >
            🐣 Hatch Your First Pet
          </NuxtLink>
        </div>
      </div>

      <!-- Floating pets decoration -->
      <div class="absolute -top-16 right-10 text-5xl animate-bounce pointer-events-none">🐱</div>
      <div class="absolute -bottom-16 left-10 text-6xl opacity-50 pointer-events-none">⭐</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '../store/player'

const email = ref('')
const password = ref('')
const message = ref('')
const messageType = ref('success')
const loading = ref(false)

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

const signIn = async () => {
  loading.value = true
  message.value = '🧙‍♂️ Summoning your trainer profile...'
  messageType.value = 'success'

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
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
      message.value = '⚠️ Login failed. Please try again.'
      messageType.value = 'error'
      loading.value = false
      return
    }

    message.value = '✨ Welcome back trainer! Your pets miss you ✨'
    messageType.value = 'success'

    // Initialize player store
    await playerStore.fetchPlayerProfile(data.user.id)

    email.value = ''
    password.value = ''

    await new Promise(resolve => setTimeout(resolve, 1500))
    await navigateTo('/')
  } catch (err: any) {
    message.value = `⚠️ ${err.message || 'An error occurred'}`
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>