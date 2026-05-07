<script setup>

const user = useSupabaseUser()

console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_KEY prefix:', process.env.SUPABASE_KEY?.slice)

</script>

<template>
  <Signup v-if="!user" />
  <div v-else>
    <p>Logged in as: {{ user.email }}</p>
  </div>
</template>

