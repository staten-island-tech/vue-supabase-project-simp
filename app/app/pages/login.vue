<script setup lang="ts">
console.log("login.vue mounted");
definePageMeta({ auth: false })

import { ref } from "vue";

const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);

async function handleSignup(e: Event) {
  e.preventDefault();
  loading.value = true;
  error.value = null;
  message.value = null;

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (signUpError) {
    error.value = signUpError.message;
    loading.value = false;
    return;
  }

  // Option: either show a message or redirect to /login
  message.value = "Signup successful. Redirecting to login...";
  loading.value = false;

  // navigate to login page
  navigateTo("/login");
}
</script>

<template>
  <main class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Sign Up</h1>

    <form @submit="handleSignup" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Password</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
        >
          {{ loading ? "Signing up..." : "Sign Up" }}
        </button>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <p v-if="message" class="text-green-600 text-sm">{{ message }}</p>

      <p class="text-sm">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 underline">Log in</NuxtLink>
      </p>
    </form>
  </main>
</template>