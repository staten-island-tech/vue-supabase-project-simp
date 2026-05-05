<script setup>
import Auth from './components/Auth.vue';

const user = useSupabaseUser()
const supabase = useSupabaseClient()

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
</template>
