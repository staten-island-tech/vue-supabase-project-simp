<script setup>
import { createClient } from '@supabase/supabase-js';
import { ref, onMounted } from 'vue';
import Auth from './components/Auth.vue';

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

const todos = ref([])

async function getTodos() {
  const { data } = await supabase.from('todos').select()
  todos.value = data
}

onMounted(() => {
  getTodos()
})

const user = useSupabaseUser

</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }} </li>
  </ul>
  <h1>
    hello world!
  </h1>
  <div class="container">
    <div v-if="user">
      <p>You're signed in as: {{  user.email }}</p>
      <button @click="supabase.auth.signOut()">Sign out</button>
    </div>
    <Auth v-else/>
  </div>
</template>
