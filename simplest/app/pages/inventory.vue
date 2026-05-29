<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div class="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <div class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900">Inventory</h1>
          <p class="text-slate-600">Your user inventory is loaded from Supabase and only shows items you own.</p>
        </div>
        <button
          @click="fetchOwnedItems"
          class="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Refresh
        </button>
      </div>

      <div v-if="!user" class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Please sign in to see your inventory. Then return to this page.
      </div>

      <div v-else>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 class="mb-4 text-xl font-semibold text-slate-900">All Available Items</h2>
            <ul class="space-y-3">
              <li v-for="item in items" :key="item.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.name }}</p>
                    <p class="text-sm text-slate-600">{{ item.description }}</p>
                  </div>
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{{ item.rarity }}</span>
                </div>
              </li>
            </ul>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-900">Your Inventory</h2>
                <p class="text-sm text-slate-600">Only items you own are shown here.</p>
              </div>
              <span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{{ ownedList.length }} owned</span>
            </div>

            <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-4 text-slate-700">Loading your inventory...</div>
            <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{{ error }}</div>
            <div v-else-if="ownedList.length === 0" class="rounded-3xl border border-slate-200 bg-white p-4 text-slate-700">
              No owned items were found for your account.
            </div>
            <ul v-else class="space-y-3">
              <li v-for="item in ownedList" :key="item.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.name }}</p>
                    <p class="text-sm text-slate-600">{{ item.description }}</p>
                  </div>
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Owned</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(false)
const error = ref('')
const ownedItems = ref([])

const items = [
  { id: 'potion', name: 'Health Potion', description: 'Restores health when used.', rarity: 'Common' },
  { id: 'elixir', name: 'Mana Elixir', description: 'Restores magic power.', rarity: 'Uncommon' },
  { id: 'sword', name: 'Steel Sword', description: 'A sharp blade for close combat.', rarity: 'Rare' },
  { id: 'shield', name: 'Iron Shield', description: 'Blocks damage from enemies.', rarity: 'Rare' },
  { id: 'ring', name: 'Ring of Speed', description: 'Increases movement speed.', rarity: 'Epic' },
]

const ownedNames = computed(() => {
  const names = new Set()
  for (const item of ownedItems.value) {
    if (item.item_name) names.add(item.item_name)
    if (item.name) names.add(item.name)
    if (item.item?.name) names.add(item.item.name)
    if (item.item_id) names.add(item.item_id)
  }
  return names
})

const ownedList = computed(() => {
  return items.filter((item) => ownedNames.value.has(item.name) || ownedNames.value.has(item.id))
})

const fetchOwnedItems = async () => {
  if (!user.value?.id) {
    ownedItems.value = []
    return
  }

  loading.value = true
  error.value = ''

  const tableCandidates = ['user_items', 'user_inventory', 'inventory', 'owned_items']
  let data = null

  for (const table of tableCandidates) {
    const { data: result, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.value.id)
      .limit(200)

    if (!fetchError) {
      data = result || []
      break
    }
  }

  if (data === null) {
    error.value = 'Unable to load inventory. Confirm your Supabase inventory table uses `user_id` and matches one of: user_items, user_inventory, inventory, owned_items.'
    ownedItems.value = []
  } else {
    ownedItems.value = data
  }

  loading.value = false
}

onMounted(fetchOwnedItems)
watch(() => user.value?.id, fetchOwnedItems)
</script>

<style scoped>
</style>