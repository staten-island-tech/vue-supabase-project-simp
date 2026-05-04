<script setup>
import { createClient } from '@supabase/supabase-js';
import { ref, onMounted } from 'vue';

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

</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }} </li>
  </ul>
  <h1 class="text-3xl font-bold">
    hello world!
  </h1>
</template>
