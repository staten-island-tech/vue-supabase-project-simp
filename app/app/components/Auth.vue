<template>

    <form @submit.prevent="handleLogin">
        <h2>Sign in / Sign up</h2>
        <input v-model="email" type="email" placeholder="you@example.come" required />
        <button :disabled="loading">
            {{  loading ? 'sending...' : 'Send magic link' }}
        </button>
    </form>

</template>

<script setup>

const supabase = useSupabaseClient()
const loading = ref(false)
const email = ref('')
const handleLogin = async () => {
    try {
        loading.value = true
        const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
        })
        if (error) throw error 
        alert('Check your emial for the login link!')
    } catch (error) { 
        alert(error.error_description || error.message)
    } finally {
        loading.value = false
    }
}

</script>

<style scoped>



</style>