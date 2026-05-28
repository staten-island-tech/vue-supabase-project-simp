<script setup>
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref(null)

async function login() {
  errorMsg.value = null
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
  } catch (e) {
    errorMsg.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm p-6">
      <h1 class="text-2xl font-semibold text-gray-900">Login</h1>

      <form class="mt-6 space-y-4" @submit.prevent="login">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {{ loading ? 'Logging in…' : 'Login' }}
        </button>
      </form>

      <p v-if="errorMsg" class="mt-4 text-sm text-red-600">
        {{ errorMsg }}
      </p>

      <div class="mt-6 text-center text-sm text-gray-600">
        <NuxtLink
          to="/signup"
          class="font-medium text-blue-600 hover:text-blue-700"
        >
          Don’t have an account? Sign up
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>