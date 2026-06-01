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

      <div v-if="!currentUserId" class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        Please sign in to see your inventory. Then return to this page.
      </div>

      <div v-else>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 class="mb-4 text-xl font-semibold text-slate-900">All Available Items</h2>
            <div v-if="allItems.length === 0" class="rounded-3xl border border-slate-200 bg-white p-4 text-slate-700">
              No items found in the items table.
            </div>
            <ul v-else class="space-y-3">
              <li v-for="item in allItems" :key="item.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.name }}</p>
                    <p class="text-sm text-slate-600">Price: ${{ item.price }}</p>
                  </div>
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">ID {{ item.id }}</span>
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
            <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800 whitespace-pre-wrap text-sm">{{ error }}</div>
            <div v-else-if="ownedList.length === 0" class="rounded-3xl border border-slate-200 bg-white p-4 text-slate-700">
              No owned items were found for your account.
            </div>
            <ul v-else class="space-y-3">
              <li v-for="item in ownedList" :key="item.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.name }}</p>
                    <p class="text-sm text-slate-600">Quantity: {{ item.amount }}</p>
                  </div>
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Price ${{ item.price }}</span>
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
                  v-model.number="selectedItemId"
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
              <button
                @click="addTestItem(true)"
                :disabled="allItems.length === 0 || addingTestItem"
                class="rounded-xl bg-slate-700 px-6 py-2 text-sm font-semibold text-white transition disabled:opacity-50 hover:enabled:bg-slate-800"
              >
                Add first available item
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
const potionCategory = 'Potion'
const potionPrice = 10

const initializeUser = async () => {
  const { data } = await supabase.auth.getSession()
  currentUserId.value = data?.session?.user?.id || null
}

const fetchAllItems = async () => {
  const { data, error: itemsError } = await supabase
    .from('item')
    .select('id, name, price')
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

const ensurePotionItemExists = async () => {
  const { data: existing, error: existingError } = await supabase
    .from('item')
    .select('id, name, price')
    .eq('name', potionName)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking potion item:', existingError)
    return null
  }

  if (existing) {
    return existing
  }

  const { data: inserted, error: insertError } = await supabase
    .from('item')
    .insert([
      {
        name: potionName,
        price: potionPrice,
        category: potionCategory,
      },
    ])
    .select('id, name, price')
    .maybeSingle()

  if (insertError) {
    console.error('Error creating potion item:', insertError)
    return null
  }

  return inserted
}

const fetchOwnedItems = async () => {
  if (!currentUserId.value) {
    ownedItems.value = []
    return
  }

  loading.value = true
  error.value = ''

  const { data, error: fetchError } = await supabase
    .from('inv')
    .select('user_id, name, quantity, item(id, name, price)')
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
      id: entry.item?.id || entry.name,
      name: entry.item?.name || entry.name || 'Unknown item',
      amount: entry.quantity,
      price: entry.item?.price ?? 0,
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
    .from('inv')
    .select('quantity')
    .eq('user_id', currentUserId.value)
    .eq('name', selectedItemName)
    .maybeSingle()

  if (existingError) {
    console.error('Error checking existing user item:', existingError)
    testItemMessage.value = `Error adding item: ${existingError.message}`
    testItemError.value = true
    addingTestItem.value = false
    return
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('inv')
      .update({ quantity: existing.quantity + 1 })
      .eq('user_id', currentUserId.value)
      .eq('name', selectedItemName)

    if (updateError) {
      console.error('Error updating user item amount:', updateError)
      testItemMessage.value = `Error adding item: ${updateError.message}`
      testItemError.value = true
      addingTestItem.value = false
      return
    }
  } else {
    const { error: insertError } = await supabase
      .from('inv')
      .insert([
        {
          user_id: currentUserId.value,
          name: selectedItemName,
          quantity: 1,
        },
      ])

    if (insertError) {
      console.error('Error inserting user item:', insertError)
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