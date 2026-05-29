<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <h1 class="mb-6 text-2xl font-semibold text-slate-900">Sign up</h1>

      <form @submit.prevent="signUp" class="space-y-5">
        <label class="block text-sm font-medium text-slate-700">
          Email
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <label class="block text-sm font-medium text-slate-700">
          Password
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="Enter a secure password"
            class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <button
          type="submit"
          class="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          Create account
        </button>
      </form>

      <p v-if="message" class="mt-5 rounded-xl border px-4 py-3 text-sm" :class="messageType === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'">
        {{ message }}
      </p>
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
  message.value = 'Creating your account...'
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

  message.value = 'Account created! Redirecting to sign in...'
  messageType.value = 'success'

  email.value = ''
  password.value = ''

  await navigateTo('/login')
}
</script>
