<script setup lang="ts">
import { useCounterStore } from '~/store/counter';

const counter = useCounterStore()
</script>

<template>
  <div>{{ counter.count }}</div>
</template>