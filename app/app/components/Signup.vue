<script setup>
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref(null)

async function handleSignUp() {
  loading.value = true
  errorMsg.value = null

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) errorMsg.value = error.message
  else alert('Check your email to confirm your account (if enabled).')

  loading.value = false
}
</script>

<template>
  <div style="max-width:420px;margin:40px auto;padding:20px;">
    <h2>Sign up</h2>

    <form @submit.prevent="handleSignUp">
      <div style="margin-bottom:12px;">
        <label>Email</label>
        <input v-model="email" type="email" required style="width:100%;padding:8px;" />
      </div>

      <div style="margin-bottom:12px;">
        <label>Password</label>
        <input v-model="password" type="password" required style="width:100%;padding:8px;" />
      </div>

      <button :disabled="loading" type="submit">
        {{ loading ? 'Creating...' : 'Create account' }}
      </button>
    </form>

    <p v-if="errorMsg" style="color:red;margin-top:12px;">
      {{ errorMsg }}
    </p>
  </div>
</template>

