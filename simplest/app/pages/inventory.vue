<template>
  <div class="min-h-screen bg-gradient-to-r from-pink-300 to-blue-400 p-6">
    <div class="mx-auto max-w-6xl rounded-3xl border border-white/40 bg-white/80 backdrop-blur-lg p-8 shadow-2xl">
      <div class="mb-8 flex flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-semibold text-slate-900">📜 Inventory</h1>
            <p class="text-slate-600">Your user inventory is loaded from Supabase and only shows items you own.</p>
          </div>
          <button
            @click="fetchOwnedItems"
            class="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Refresh
          </button>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/"
            class="rounded-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🏰 Home
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🚪 Login
          </NuxtLink>
          <NuxtLink
            to="/signup"
            class="rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🐣 Sign Up
          </NuxtLink>
        </div>
      </div>

      <div v-if="!currentUserId" class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Please sign in to see your inventory. Then return to this page.
      </div>

      <div v-else>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="rounded-3xl border border-blue-200/40 bg-gradient-to-br from-blue-50/60 to-blue-100/60 backdrop-blur-sm p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">🎁 All Available Items</h2>
            <div v-if="allItems.length === 0" class="rounded-2xl border border-blue-200 bg-blue-50/80 p-6 text-center text-blue-700">
              <p class="font-semibold">No items found</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="item in allItems" :key="item.id" class="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-300">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-4">
                    <p class="font-bold text-slate-900">{{ item.name }}</p>
                    <span class="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md">{{ item.rarity || 'Common' }}</span>
                  </div>
                  <p class="text-sm text-slate-600">{{ item.description || 'No description available.' }}</p>
                </div>
              </li>
            </ul>
          </section>

          <section class="rounded-3xl border border-purple-200/40 bg-gradient-to-br from-purple-50/60 to-purple-100/60 backdrop-blur-sm p-6 shadow-lg">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">👜 Your Inventory</h2>
                <p class="text-sm text-slate-600">Only items you own are shown here.</p>
              </div>
              <span class="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg">{{ ownedList.length }} owned</span>
            </div>

            <div v-if="loading" class="rounded-2xl border border-purple-200 bg-purple-50/80 p-6 text-center text-purple-700 font-semibold">Loading your inventory...</div>
            <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-800 whitespace-pre-wrap text-sm font-semibold">{{ error }}</div>
            <div v-else-if="ownedList.length === 0" class="rounded-2xl border border-purple-200 bg-purple-50/80 p-6 text-center text-purple-700">
              <p class="font-semibold">No owned items yet</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="item in ownedList" :key="item.id" class="rounded-2xl border border-white/60 bg-gradient-to-r from-white/80 to-purple-50/60 backdrop-blur-sm p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-300">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-4">
                    <p class="font-bold text-slate-900">{{ item.name }}</p>
                    <span class="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-md">{{ item.rarity }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-sm text-slate-600">{{ item.description || 'No description available.' }}</p>
                    <span class="bg-gradient-to-r from-purple-400 to-purple-500 text-white font-bold px-4 py-1 rounded-full text-sm shadow-md">{{ item.amount }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <section class="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 class="mb-4 text-lg font-semibold text-amber-900">🔧 Dev Testing (Temporary)</h2>
          <div class="mb-4 rounded bg-amber-100 p-3 text-sm text-amber-900">
            <p><strong>User logged in:</strong> {{ currentUserId ? 'YES' : 'NO' }}</p>
            <p><strong>User ID:</strong> {{ currentUserId || 'NONE' }}</p>
            <p><strong>Selected item:</strong> {{ selectedItemLabel || 'NONE' }}</p>
          </div>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div class="flex-1">
              <label class="block text-sm font-medium text-amber-900">
                Select item to add:
                <select
                  v-model="selectedItemId"
                  class="mt-2 w-full rounded-xl border border-amber-300 bg-white px-4 py-2 text-amber-900 outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option :value="null">-- Choose an item --</option>
                  <option v-for="item in allItems" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </option>
                </select>
              </label>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                @click="addTestItem(false)"
                :disabled="!selectedItemId || addingTestItem"
                class="rounded-xl bg-amber-600 px-6 py-2 text-sm font-semibold text-white transition disabled:opacity-50 hover:enabled:bg-amber-700"
              >
                {{ addingTestItem ? 'Adding...' : 'Add Item' }}
              </button>
            </div>
          </div>
          <p v-if="testItemMessage" class="mt-3 text-sm" :class="testItemError ? 'text-amber-800' : 'text-emerald-800'">
            {{ testItemMessage }}
          </p>
        </section>

        <section class="mt-8 rounded-3xl border border-slate-300 bg-slate-100 p-6">
          <h3 class="mb-3 text-sm font-semibold text-slate-700">📊 Debug Info</h3>
          <div class="space-y-2 text-xs text-slate-700">
            <p><strong>Raw ownedItems count:</strong> {{ ownedItems.length }}</p>
            <p><strong>Owned list count:</strong> {{ ownedList.length }}</p>
            <details class="cursor-pointer">
              <summary class="font-mono text-slate-600 hover:text-slate-900">View raw data (click to expand)</summary>
              <pre class="mt-2 overflow-auto rounded bg-white p-2 text-xs">{{ JSON.stringify(ownedItems, null, 2) }}</pre>
            </details>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const supabase = useSupabaseClient()
const loading = ref(false)
const error = ref('')
const currentUserId = ref(null)
const allItems = ref([])
const ownedItems = ref([])
const selectedItemId = ref(null)
const addingTestItem = ref(false)
const testItemMessage = ref('')
const testItemError = ref(false)

const potionName = 'Health Potion'
const potionDescription = 'A restorative potion that heals minor wounds.'
const potionRarity = 'Uncommon'

const initializeUser = async () => {
  const { data } = await supabase.auth.getSession()
  currentUserId.value = data?.session?.user?.id || null
}

const fetchAllItems = async () => {
  const { data, error: itemsError } = await supabase
    .from('items')
    .select('id, name, description, rarity')
    .order('name', { ascending: true })

  if (itemsError) {
    console.error('Failed to load items:', itemsError)
    error.value = `Unable to load available items:\n${itemsError.message}`
    allItems.value = []
    return
  }

  allItems.value = data || []
  if (!selectedItemId.value && allItems.value.length > 0) {
    selectedItemId.value = allItems.value[0].id
  }
}

const createPotionNow = async () => {
  if (!currentUserId.value) {
    testItemMessage.value = 'You must be logged in to create a potion.'
    testItemError.value = true
    return
  }

  addingTestItem.value = true
  testItemMessage.value = 'Creating potion item...'
  testItemError.value = false

  const potion = await ensurePotionItemExists()
  if (!potion) {
    testItemMessage.value = 'Failed to create potion.'
    testItemError.value = true
    addingTestItem.value = false
    return
  }

  // Check if potion already exists in user's inventory
  const { data: existing, error: existingError } = await supabase
    .from('inventory')
    .select('id, quantity')
    .eq('user_id', currentUserId.value)
    .eq('item_id', potion.id)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking existing potion:', existingError)
    testItemMessage.value = `Error adding potion: ${existingError.message}`
    testItemError.value = true
    addingTestItem.value = false
    return
  }

  if (existing) {
    // Update quantity if potion already in inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating potion quantity:', updateError)
      testItemMessage.value = `Error adding potion: ${updateError.message}`
      testItemError.value = true
      addingTestItem.value = false
      return
    }
  } else {
    // Insert new inventory row for potion
    const { error: insertError } = await supabase
      .from('inventory')
      .insert([
        {
          user_id: currentUserId.value,
          item_id: potion.id,
          quantity: 1,
        },
      ])

    if (insertError) {
      console.error('Error adding potion to inventory:', insertError)
      testItemMessage.value = `Error adding potion: ${insertError.message}`
      testItemError.value = true
      addingTestItem.value = false
      return
    }
  }

  testItemMessage.value = `✓ Created and added "${potion.name}" to your inventory!`
  testItemError.value = false
  await fetchOwnedItems()
  addingTestItem.value = false
}

const fetchOwnedItems = async () => {
  if (!currentUserId.value) {
    ownedItems.value = []
    return
  }

  loading.value = true
  error.value = ''

  const { data, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity, item_id, items(id, name, description, rarity)')
    .eq('user_id', currentUserId.value)
    .gt('quantity', 0)

  if (fetchError) {
    console.error('Failed to load owned items:', fetchError)
    error.value = `Error loading inventory:\n${fetchError.message}`
    ownedItems.value = []
  } else {
    ownedItems.value = data || []
  }

  loading.value = false
}

const ownedList = computed(() => {
  return ownedItems.value
    .map((entry) => ({
      id: entry.items?.id || 'unknown',
      name: entry.items?.name || 'Unknown item',
      description: entry.items?.description || '',
      rarity: entry.items?.rarity || 'Common',
      amount: entry.quantity,
    }))
    .filter((item) => item.name !== 'Unknown item')
})

const selectedItemLabel = computed(() => {
  const selected = allItems.value.find((item) => item.id === selectedItemId.value)
  return selected ? selected.name : null
})

const addTestItem = async (useFirstAvailable = false) => {
  let itemId = selectedItemId.value
  if (!itemId && useFirstAvailable) {
    itemId = allItems.value[0]?.id || null
  }

  if (!currentUserId.value || !itemId) {
    alert(`Cannot add item. User ID: ${currentUserId.value || 'MISSING'}, Item: ${itemId || 'NOT SELECTED'}`)
    return
  }

  const selectedItem = allItems.value.find((item) => item.id === itemId)
  const selectedItemName = selectedItem?.name
  if (!selectedItemName) {
    alert('Selected item not found in the item table.')
    return
  }

  addingTestItem.value = true
  testItemMessage.value = 'Adding test item...'
  testItemError.value = false

  const { data: existing, error: existingError } = await supabase
    .from('inventory')
    .select('id, quantity')
    .eq('user_id', currentUserId.value)
    .eq('item_id', itemId)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking existing inventory row:', existingError)
    testItemMessage.value = `Error adding item: ${existingError.message}`
    testItemError.value = true
    addingTestItem.value = false
    return
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating inventory quantity:', updateError)
      testItemMessage.value = `Error adding item: ${updateError.message}`
      testItemError.value = true
      addingTestItem.value = false
      return
    }
  } else {
    const { error: insertError } = await supabase
      .from('inventory')
      .insert([
        {
          user_id: currentUserId.value,
          item_id: itemId,
          quantity: 1,
        },
      ])

    if (insertError) {
      console.error('Error inserting inventory row:', insertError)
      testItemMessage.value = `Error adding item: ${insertError.message}`
      testItemError.value = true
      addingTestItem.value = false
      return
    }
  }

  testItemMessage.value = `✓ Added ${selectedItemName || 'item'} to inventory!`
  testItemError.value = false
  selectedItemId.value = null
  await fetchOwnedItems()
  addingTestItem.value = false
}

onMounted(async () => {
  await initializeUser()
  await fetchAllItems()
  const potion = await ensurePotionItemExists()
  if (potion) {
    await fetchAllItems()
    selectedItemId.value = potion.id
  }
  await fetchOwnedItems()
})
</script>

<style scoped>
</style>