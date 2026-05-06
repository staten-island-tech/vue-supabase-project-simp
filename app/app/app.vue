<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";

const supabase = useSupabaseClient();

let sub: any = null;

onMounted(() => {
  sub = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      window.location.href = "/account";
    }
  });
});

onBeforeUnmount(() => {
  sub?.data?.subscription?.unsubscribe?.();
});
</script>

<template>
<NuxtPage></NuxtPage>
</template>
