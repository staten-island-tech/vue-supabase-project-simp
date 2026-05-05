<script setup>
const supabase = useSupabaseClient()

const mode = ref<'signup' | 'login'>('signup')
const email = ref('')
const password = ref('')
const loading = ref(false)

const doSignUp = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error

    alert(data.user ? 'Sign up successful. You may need to confirm your email (if enabled).' : 'Check your email to confirm.')
    mode.value = 'login'
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}

const doLogin = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    alert('Logged in!')
  } catch (e) {
    alert(e instanceof Error ? e.message : String(e))
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!email.value || !password.value) return
  if (mode.value === 'signup') return doSignUp()
  return doLogin()
}
</script>

<template>
  <div>
    <button type="button" :disabled="loading || mode === 'login'" @click="mode = 'signup'">
      Sign up
    </button>

    <button type="button" :disabled="loading || mode === 'signup'" @click="mode = 'login'" style="margin-left: 8px">
      Login
    </button>

    <form @submit.prevent="submit">
      <div style="margin-top: 12px">
        <div>Email</div>
        <input v-model="email" type="email" autocomplete="email" required />
      </div>

      <div style="margin-top: 12px">
        <div>Password</div>
        <input v-model="password" type="password" autocomplete="current-password" required />
      </div>

      <div style="margin-top: 12px">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Working...' : (mode === 'signup' ? 'Create account' : 'Log in') }}
        </button>
      </div>
    </form>
  </div>
</template>


<style scoped>



</style>