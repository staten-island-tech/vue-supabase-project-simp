<script setup>
import { ref, onMounted } from 'vue'
// use the Nuxt Supabase client injected by @nuxtjs/supabase
const supabase = useSupabaseClient()

const todos = ref([])

async function getTodos() {
  if (!supabase) {
    console.error('supabase client unavailable')
    return
  }
  try {
    const { data, error } = await supabase.from('todos').select()
    if (error) {
      console.error('supabase select error', error)
      return
    }
    todos.value = data ?? []
  } catch (e) {
    console.error('unexpected error fetching todos', e)
  }
}

onMounted(() => {
  getTodos()
})
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo?.id">{{ todo?.name }}</li>
  </ul>
</template>
