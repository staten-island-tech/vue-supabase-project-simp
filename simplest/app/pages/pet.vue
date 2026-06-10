<template>
  <div class="min-h-screen bg-gradient-to-r from-pink-300 to-blue-400 flex flex-col p-6">
    <!-- Header with Navigation -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-white drop-shadow-lg">🐣 Pet Manager</h1>
      <NuxtLink
        to="/"
        class="bg-white/90 hover:bg-white px-6 py-3 rounded-full font-bold text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        ← Back Home
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Pet Display (Left/Center) -->
      <div class="lg:col-span-2">
        <div class="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-lg p-12 shadow-2xl">
          <!-- Pet Display -->
          <div class="text-center mb-10">
            <div class="text-9xl mb-6 animate-bounce">{{ currentPet.emoji }}</div>
            <h2 class="text-3xl font-bold text-slate-900 mb-2">{{ currentPet.name }}</h2>
            <p class="text-lg text-slate-600 mb-4">Level {{ currentPet.level }}</p>

            <!-- Pet Stats -->
            <div class="flex justify-center mb-8">
              <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl w-full max-w-xs">
                <p class="text-sm text-purple-600 font-semibold mb-2">Health</p>
                <p class="text-3xl font-bold text-purple-900">{{ currentPet.hp }}/{{ currentPet.maxHp }}</p>
              </div>
            </div>
          </div>

          <!-- Experience Bar -->
          <div class="mb-10">
            <div class="flex justify-between items-center mb-3">
              <p class="font-bold text-slate-900">Experience</p>
              <p class="text-sm text-slate-600">{{ currentPet.exp }}/{{ expToNextLevel }} EXP</p>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                class="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                :style="{ width: expPercentage + '%' }"
              ></div>
            </div>
          </div>

          <!-- Treat Selection -->
          <div class="mb-8">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Select Treat to Use</h3>
            <div v-if="loading" class="text-center py-8 text-slate-600">
              Loading treats from inventory...
            </div>
            <div v-else-if="availableTreats.length === 0" class="text-center py-8 text-slate-600">
              <p>No pet treats available in your inventory</p>
              <p class="text-sm">Visit the inventory page to add treats</p>
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                v-for="(treat, index) in availableTreats"
                :key="index"
                @click="selectTreat(treat)"
                :class="[
                  'p-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105',
                  selectedTreat?.id === treat.id
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-white/60 hover:bg-white/90 text-slate-900 shadow-md border-2 border-transparent hover:border-yellow-300'
                ]"
              >
                <div class="text-3xl mb-2">{{ treat.emoji }}</div>
                <div class="text-xs">{{ treat.name }}</div>
                <div class="text-sm font-semibold text-yellow-600">+{{ treat.exp }} EXP</div>
              </button>
            </div>
          </div>

          <!-- Use Treat Button -->
          <button
            v-if="selectedTreat && (inventoryCount(selectedTreat.id) > 0)"
            @click="useTreat"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            Use {{ selectedTreat.name }} ({{ inventoryCount(selectedTreat.id) }} available)
          </button>
          <button
            v-else
            disabled
            class="w-full bg-slate-300 text-slate-500 font-bold py-4 px-6 rounded-2xl cursor-not-allowed opacity-50"
          >
            Select a treat to use
          </button>
        </div>
      </div>

      <!-- Inventory Sidebar (Right) -->
      <div class="lg:col-span-1">
        <div class="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-lg p-8 shadow-2xl h-fit sticky top-6">
          <h3 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            📜 Inventory
          </h3>

          <div v-if="!currentUserId" class="text-center py-8">
            <p class="text-slate-600 mb-4">Sign in to see your pet treats</p>
            <NuxtLink
              to="/login"
              class="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In
            </NuxtLink>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="loading" class="text-center py-8 text-slate-600">
              Loading inventory...
            </div>
            <div
              v-for="(count, treatName) in userInventory"
              v-else-if="Object.keys(userInventory).length > 0"
              :key="treatName"
              class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 hover:border-blue-400 transition-all"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ getTreatEmoji(treatName) }}</span>
                  <div>
                    <p class="font-bold text-slate-900">{{ treatName }}</p>
                    <p class="text-sm text-slate-600">+{{ getTreatExp(treatName) }} EXP</p>
                  </div>
                </div>
                <div class="bg-blue-500 text-white font-bold px-3 py-1 rounded-full text-lg">
                  {{ count }}
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-slate-500">
              <p class="text-lg">No treats in inventory</p>
              <p class="text-sm">Visit the inventory page to get treats!</p>
            </div>
          </div>

          <!-- Inventory Navigation -->
          <NuxtLink
            to="/inventory"
            class="block w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            📦 Go to Inventory
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const supabase = useSupabaseClient()

// Pet State
const currentPet = ref({
  name: 'Flutterby',
  emoji: '🦋',
  level: 5,
  exp: 45,
  hp: 80,
  maxHp: 100,
})

// Pet treat types that are available in inventory
const petTreatTypes = ref([
  { name: 'Health Potion', emoji: '🍯', exp: 50 },
  { name: 'Blueberries', emoji: '', exp: 10 },
  { name: 'Honey Comb', emoji: '🍯', exp: 30 },  
  { name: 'Pet Treat', emoji: '🍖', exp: 25 },
  { name: 'Big Pet Treat', emoji: '🥩', exp: 75 },])

// Available treats (will be populated from inventory)
const availableTreats = ref([])

// User Inventory from Supabase (treat name -> count)
const userInventory = ref({})

// Inventory entry IDs for tracking (treat name -> inventory id)
const inventoryEntryIds = ref({})

// User info
const currentUserId = ref(null)
const loading = ref(false)

// Selected treat
const selectedTreat = ref(null)

// Experience to next level
const expToNextLevel = ref(100)

// Computed property for exp bar percentage
const expPercentage = computed(() => {
  return (currentPet.value.exp / expToNextLevel.value) * 100
})

// Initialize user
const initializeUser = async () => {
  const { data } = await supabase.auth.getSession()
  currentUserId.value = data?.session?.user?.id || null
}

// Fetch user's inventory from Supabase
const fetchUserInventory = async () => {
  if (!currentUserId.value) {
    userInventory.value = {}
    availableTreats.value = []
    return
  }

  loading.value = true

  const { data, error } = await supabase
    .from('inventory')
    .select('id, quantity, item_id, items(id, name)')
    .eq('user_id', currentUserId.value)
    .gt('quantity', 0)

  if (error) {
    console.error('Error fetching inventory:', error)
    userInventory.value = {}
  } else if (data) {
    // Build inventory map with item names and counts
    const inventoryMap = {}
    const treatsList = []
    const idMap = {}

    data.forEach((entry) => {
      const itemName = entry.items?.name || ''
      const quantity = entry.quantity
      const inventoryId = entry.id

      // Check if this item is a pet treat
      const isPetTreat = petTreatTypes.value.some(t => t.name === itemName)
      
      if (isPetTreat) {
        inventoryMap[itemName] = quantity
        idMap[itemName] = inventoryId
        
        // Add to treats list if not already added
        const treatData = petTreatTypes.value.find(t => t.name === itemName)
        if (treatData && !treatsList.some(t => t.name === itemName)) {
          treatsList.push({
            id: itemName,
            name: itemName,
            emoji: treatData.emoji,
            exp: treatData.exp,
          })
        }
      }
    })

    userInventory.value = inventoryMap
    inventoryEntryIds.value = idMap
    availableTreats.value = treatsList
  }

  loading.value = false
}

// Functions
const getTreatEmoji = (treatName) => {
  const treat = availableTreats.value.find(t => t.id === treatName)
  return treat ? treat.emoji : '?'
}

const getTreatName = (treatName) => {
  return treatName
}

const getTreatExp = (treatName) => {
  const treat = availableTreats.value.find(t => t.id === treatName)
  return treat ? treat.exp : 0
}

const inventoryCount = (treatName) => {
  return userInventory.value[treatName] || 0
}

const selectTreat = (treat) => {
  selectedTreat.value = treat
}

const useTreat = async () => {
  if (!selectedTreat.value || inventoryCount(selectedTreat.value.id) <= 0 || !currentUserId.value) {
    return
  }

  const treatName = selectedTreat.value.id
  const inventoryId = inventoryEntryIds.value[treatName]

  if (!inventoryId) {
    console.error('Inventory entry ID not found for treat:', treatName)
    return
  }

  // Add exp
  const newExp = currentPet.value.exp + selectedTreat.value.exp

  // Check if level up
  if (newExp >= expToNextLevel.value) {
    currentPet.value.level += 1
    currentPet.value.exp = newExp - expToNextLevel.value
    // Increase health on level up
    currentPet.value.hp += 10
    currentPet.value.maxHp += 10
  } else {
    currentPet.value.exp = newExp
  }

  // Decrease inventory in local state
  userInventory.value[treatName] -= 1

  // Update Supabase inventory
  try {
    const newQuantity = userInventory.value[treatName]

    if (newQuantity > 0) {
      // Update quantity if still have items
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', inventoryId)

      if (updateError) {
        console.error('Error updating inventory:', updateError)
      }
    } else {
      // Delete inventory entry if quantity reaches 0
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', inventoryId)

      if (deleteError) {
        console.error('Error deleting inventory entry:', deleteError)
      } else {
        // Remove from local tracking
        delete inventoryEntryIds.value[treatName]
      }
    }
  } catch (err) {
    console.error('Error updating Supabase inventory:', err)
  }
}

onMounted(async () => {
  await initializeUser()
  await fetchUserInventory()
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
