<script setup>
import { ref, onMounted } from 'vue'
import { useCounterStore } from './store/counter'

const counter = useCounterStore()


</script>

<template>
  <div>
    <button @click="counter.inc()">Increment</button>
    <p>Count: {{ counter.count }}</p>
  </div>
</template>
