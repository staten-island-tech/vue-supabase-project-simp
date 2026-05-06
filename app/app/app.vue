<script setup>
import Auth from './components/Auth.vue';

const user = useSupabaseUser()
const supabase = useSupabaseClient()

console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_KEY prefix:', process.env.SUPABASE_KEY?.slice)

</script>

<template>
  <div>
    <div v-if="user">
      <div>Signed in as:{{ user.email }}</div>
      <button type="button" @click="supabase.auth.signOut()">Sign out</button>
    </div>
    <div v-else>
      <Auth />
    </div>
  </div>
<NuxtPage></NuxtPage>
</template>
