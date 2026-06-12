<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white p-6">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
            🎒 Inventory
          </h1>
          <p class="text-purple-300 text-sm mt-1">Your eggs, food, and pets</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-center bg-black bg-opacity-30 px-5 py-2 rounded-xl border border-yellow-500">
            <p class="text-xs text-yellow-300">GOLD</p>
            <p class="text-2xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
          </div>
          <NuxtLink to="/" class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 font-bold text-sm transition hover:scale-105">
            🏰 Home
          </NuxtLink>
          <NuxtLink to="/shop" class="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 font-bold text-sm transition hover:scale-105">
            🏪 Shop
          </NuxtLink>
        </div>
      </div>

      <!-- Notification -->
      <div
        v-if="notification"
        class="mb-6 p-4 rounded-xl border-2 text-center font-bold"
        :class="notificationError ? 'bg-red-900 border-red-500 text-red-200' : 'bg-green-900 border-green-500 text-green-200'"
      >
        {{ notification }}
      </div>

      <div v-if="loading" class="text-center py-20 text-purple-300 text-xl animate-pulse">
        Loading your inventory...
      </div>

      <div v-else>
        <!-- Eggs Section -->
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">🥚 Your Eggs</h2>
          <div v-if="ownedEggs.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400">
            No eggs yet! Head to the <NuxtLink to="/shop" class="text-yellow-300 underline">Shop</NuxtLink> to buy some.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              v-for="egg in ownedEggs"
              :key="egg.shop_item_id"
              class="rounded-2xl border-2 p-5 text-center flex flex-col items-center gap-2"
              :class="rarityCardClass(egg.rarity)"
            >
              <p class="text-5xl">{{ rarityEmoji(egg.rarity) }}</p>
              <p class="font-bold">{{ egg.name }}</p>
              <p class="text-xs" :class="rarityTextClass(egg.rarity)">{{ capitalize(egg.rarity) }}</p>
              <span class="bg-black bg-opacity-40 text-white text-xs px-3 py-1 rounded-full font-bold">
                x{{ egg.eggs_count }}
              </span>
              <button
                @click="openEgg(egg)"
                :disabled="opening === egg.shop_item_id"
                class="w-full mt-1 py-2 rounded-lg font-bold text-sm bg-yellow-500 hover:bg-yellow-400 text-black transition disabled:opacity-50"
              >
                {{ opening === egg.shop_item_id ? 'Hatching...' : '🐣 Open' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Food Section -->
        <div class="mb-10">
          <h2 class="text-2xl font-bold mb-4">🍖 Your Food</h2>
          <div v-if="ownedFood.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400">
            No food yet! Head to the <NuxtLink to="/shop" class="text-yellow-300 underline">Shop</NuxtLink> to buy some.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
              v-for="food in ownedFood"
              :key="food.shop_item_id"
              class="rounded-2xl border-2 border-blue-500 bg-linear-to-br from-blue-900 to-slate-900 p-5 text-center flex flex-col items-center gap-2"
            >
              <p class="text-5xl">{{ foodEmoji(food.food_kind) }}</p>
              <p class="font-bold">{{ food.name }}</p>
              <p class="text-xs text-blue-300">{{ foodDescription(food.food_kind) }}</p>
              <span class="bg-black bg-opacity-40 text-white text-xs px-3 py-1 rounded-full font-bold">
                x{{ food.food_count }}
              </span>
              <button
                @click="useFood(food)"
                :disabled="!playerStore.activePet || usingFood === food.shop_item_id"
                class="w-full mt-1 py-2 rounded-lg font-bold text-sm transition"
                :class="playerStore.activePet
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
              >
                {{ usingFood === food.shop_item_id ? 'Feeding...' : '🍽️ Feed Active Pet' }}
              </button>
            </div>
          </div>
          <p v-if="!playerStore.activePet" class="mt-2 text-xs text-purple-400">
            Set an active pet on the Home page to use food.
          </p>
        </div>

        <!-- Pets Section -->
        <div>
          <h2 class="text-2xl font-bold mb-4">🐾 Your Pets ({{ playerStore.pets.length }})</h2>
          <div v-if="playerStore.pets.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400">
            No pets yet! Open an egg to hatch one.
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              v-for="pet in playerStore.pets"
              :key="pet.id"
              @click="playerStore.setActivePet(pet.id)"
              class="rounded-2xl border-2 p-4 text-center cursor-pointer transition hover:scale-105"
              :class="playerStore.activePet?.id === pet.id
                ? 'border-cyan-400 bg-linear-to-br from-cyan-900 to-blue-900'
                : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-cyan-600'"
            >
              <p class="text-5xl mb-2">{{ pet.species?.emoji ?? '🐣' }}</p>
              <p class="font-bold text-sm">{{ pet.nickname || pet.species?.name || 'Unknown' }}</p>
              <p class="text-xs text-slate-300 mt-1">Lvl {{ pet.level }}</p>
              <p class="text-xs mt-1" :class="rarityTextClass(pet.species?.rarity ?? '')">
                {{ capitalize(pet.species?.rarity ?? '') }}
              </p>
              <div class="mt-2 space-y-1">
                <div class="flex items-center gap-1 text-xs">
                  <span>❤️</span>
                  <div class="flex-1 bg-gray-700 rounded-full h-1.5">
                    <div class="bg-red-500 h-1.5 rounded-full" :style="{ width: (pet.current_hp / pet.max_hp * 100) + '%' }"></div>
                  </div>
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <span>🍗</span>
                  <div class="flex-1 bg-gray-700 rounded-full h-1.5">
                    <div class="bg-green-500 h-1.5 rounded-full" :style="{ width: (100 - pet.hunger) + '%' }"></div>
                  </div>
                </div>
              </div>
              <p v-if="playerStore.activePet?.id === pet.id" class="text-xs text-cyan-300 font-bold mt-2">⭐ Active</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Hatching Animation Overlay -->
      <div v-if="hatchingEgg" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <p
          ref="eggEl"
          class="text-9xl"
          :class="rarityGlowClass(hatchingEgg.rarity)"
        >
          {{ hatchingEgg.emoji }}
        </p>
      </div>

      <!-- Hatch Result Modal -->
      <div v-if="hatchResult" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div ref="resultCardEl" class="rounded-3xl border-2 border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900 p-10 max-w-sm w-full text-center">
          <p ref="resultEmojiEl" class="text-8xl mb-4">{{ hatchResult.emoji }}</p>
          <h2 class="text-3xl font-black mb-1">{{ hatchResult.name }}</h2>
          <p class="text-lg font-bold mb-2" :class="rarityTextClass(hatchResult.rarity)">
            {{ capitalize(hatchResult.rarity) }}
          </p>
          <p class="text-yellow-200 text-sm mb-6">A new pet has joined your collection!</p>
          <button @click="hatchResult = null" class="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg transition">
            🎉 Awesome!
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

const loading = ref(false)
const opening = ref<string | null>(null)
const usingFood = ref<string | null>(null)
const notification = ref('')
const notificationError = ref(false)
const hatchResult = ref<any>(null)

// Hatching animation state
const hatchingEgg = ref<{ emoji: string; rarity: string } | null>(null)
const eggEl = ref<HTMLElement | null>(null)
const resultCardEl = ref<HTMLElement | null>(null)
const resultEmojiEl = ref<HTMLElement | null>(null)

const ownedEggs = ref<any[]>([])
const ownedFood = ref<any[]>([])

const showNotification = (msg: string, isError = false) => {
  notification.value = msg
  notificationError.value = isError
  setTimeout(() => (notification.value = ''), 3000)
}

// Shakes and bursts the egg with increasing intensity, resolves when done
const playEggShakeAnimation = (rarity: string) => {
  return new Promise<void>((resolve) => {
    if (!eggEl.value) { resolve(); return }

    const tl = gsap.timeline({ onComplete: resolve })
    gsap.set(eggEl.value, { rotation: 0, scale: 1, opacity: 1 })

    // Building shake — gets faster and wider
    tl.to(eggEl.value, { rotation: -8, duration: 0.12, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: 8, duration: 0.12, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: -10, duration: 0.1, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: 10, duration: 0.1, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: -14, scale: 1.05, duration: 0.09, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: 14, scale: 1.05, duration: 0.09, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: -18, scale: 1.1, duration: 0.07, ease: 'power1.inOut' })
      .to(eggEl.value, { rotation: 18, scale: 1.1, duration: 0.07, ease: 'power1.inOut' })
      // Final burst — flash bigger then pop
      .to(eggEl.value, { rotation: 0, scale: 1.4, duration: 0.15, ease: 'power2.out' })
      .to(eggEl.value, { scale: 0, opacity: 0, duration: 0.25, ease: 'power3.in' })
  })
}

// Pops the result card in with a bouncy reveal, plus an elastic emoji pop
const animateHatchResultIn = async () => {
  await nextTick()
  if (!resultCardEl.value) return

  gsap.fromTo(
    resultCardEl.value,
    { scale: 0, rotation: -15, opacity: 0 },
    { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }
  )

  if (resultEmojiEl.value) {
    gsap.fromTo(
      resultEmojiEl.value,
      { scale: 0, rotation: 0 },
      { scale: 1, rotation: 360, duration: 0.7, delay: 0.15, ease: 'elastic.out(1, 0.5)' }
    )
  }
}

const fetchInventory = async () => {
  if (!playerStore.profile) return
  loading.value = true

  const { data, error } = await supabase
    .from('user_shop_inventory')
    .select('*, shop_items(id, item_kind, name, rarity, food_kind, gold_price)')
    .eq('user_id', playerStore.profile.id)

  if (error) { showNotification('Failed to load inventory', true); loading.value = false; return }

  const rows = data || []
  ownedEggs.value = rows
    .filter(r => r.shop_items?.item_kind === 'egg' && r.eggs_count > 0)
    .map(r => ({ ...r.shop_items, shop_item_id: r.shop_item_id, eggs_count: r.eggs_count }))

  ownedFood.value = rows
    .filter(r => r.shop_items?.item_kind === 'food' && r.food_count > 0)
    .map(r => ({ ...r.shop_items, shop_item_id: r.shop_item_id, food_count: r.food_count }))

  loading.value = false
}

const openEgg = async (egg: any) => {
  if (!playerStore.profile) return
  opening.value = egg.shop_item_id

  try {
    // Get drop rates for this egg rarity
    const { data: rates } = await supabase
      .from('egg_drop_rates')
      .select('pet_rarity, drop_chance')
      .eq('egg_rarity', egg.rarity)

    // Roll for pet rarity
    const roll = Math.random() * 100
    let cumulative = 0
    let selectedRarity = 'common'
    for (const rate of (rates || [])) {
      cumulative += Number(rate.drop_chance)
      if (roll <= cumulative) { selectedRarity = rate.pet_rarity; break }
    }

    // Pick a random pet of that rarity
    const { data: species } = await supabase
      .from('pet_species')
      .select('*')
      .eq('rarity', selectedRarity)

    if (!species || species.length === 0) throw new Error('No pets found for this rarity')
    const picked = species[Math.floor(Math.random() * species.length)]

    // Play the shaking/bursting egg animation before revealing the result
    hatchingEgg.value = { emoji: rarityEmoji(egg.rarity), rarity: egg.rarity }
    await nextTick()
    await playEggShakeAnimation(egg.rarity)
    hatchingEgg.value = null

    // Add pet to user_pets
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_pets').insert({
      user_id: user!.id,
      pet_species_id: picked.id,
      level: 1,
      experience: 0,
      current_hp: picked.base_hp,
      max_hp: picked.base_hp,
      hunger: 50,
      happiness: 70,
      affection: 0,
    })

    // Decrement egg count
    await supabase
      .from('user_shop_inventory')
      .update({ eggs_count: egg.eggs_count - 1 })
      .eq('user_id', playerStore.profile.id)
      .eq('shop_item_id', egg.shop_item_id)

    // Refresh pets, then keep total_pets_owned in sync
    await playerStore.fetchUserPets(playerStore.profile.id)
    await fetchInventory()

    await supabase
      .from('profiles')
      .update({ total_pets_owned: playerStore.pets.length })
      .eq('id', playerStore.profile.id)
    if (playerStore.profile) playerStore.profile.total_pets_owned = playerStore.pets.length

    // Progress the "Expand Collection" daily challenge
    await playerStore.incrementChallengeProgress('SUMMON_PET')

    hatchResult.value = { name: picked.name, emoji: picked.emoji, rarity: picked.rarity }
    await animateHatchResultIn()
  } catch (err: any) {
    showNotification(`❌ ${err.message}`, true)
  } finally {
    opening.value = null
  }
}

const useFood = async (food: any) => {
  if (!playerStore.activePet || !playerStore.profile) return
  usingFood.value = food.shop_item_id

  try {
    const hungerReduction = { basic: 20, premium: 50, special: 100 }[food.food_kind as string] ?? 20
    const happinessBoost  = { basic: 5,  premium: 15, special: 30  }[food.food_kind as string] ?? 5

    const newHunger    = Math.max(0, playerStore.activePet.hunger - hungerReduction)
    const newHappiness = Math.min(100, playerStore.activePet.happiness + happinessBoost)

    await supabase.from('user_pets').update({ hunger: newHunger, happiness: newHappiness })
      .eq('id', playerStore.activePet.id)

    playerStore.activePet.hunger    = newHunger
    playerStore.activePet.happiness = newHappiness

    // Decrement food count
    await supabase
      .from('user_shop_inventory')
      .update({ food_count: food.food_count - 1 })
      .eq('user_id', playerStore.profile.id)
      .eq('shop_item_id', food.shop_item_id)

    await fetchInventory()
    showNotification(`🍽️ ${playerStore.activePet.species?.name ?? 'Your pet'} enjoyed the ${food.name}!`)
  } catch (err: any) {
    showNotification(`❌ ${err.message}`, true)
  } finally {
    usingFood.value = null
  }
}

// Helpers
const rarityCardClass = (rarity: string) => ({
  common:    'border-gray-400 bg-linear-to-br from-gray-800 to-slate-900',
  rare:      'border-blue-400 bg-linear-to-br from-blue-900 to-slate-900',
  epic:      'border-purple-400 bg-linear-to-br from-purple-900 to-slate-900',
  legendary: 'border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900',
}[rarity] ?? 'border-gray-500 bg-slate-900')

const rarityTextClass = (rarity: string) => ({
  common:    'text-gray-300',
  rare:      'text-blue-300',
  epic:      'text-purple-300',
  legendary: 'text-yellow-300',
}[rarity] ?? 'text-white')

const rarityGlowClass = (rarity: string) => ({
  common:    'drop-shadow-[0_0_20px_rgba(156,163,175,0.7)]',
  rare:      'drop-shadow-[0_0_25px_rgba(96,165,250,0.8)]',
  epic:      'drop-shadow-[0_0_30px_rgba(192,132,252,0.85)]',
  legendary: 'drop-shadow-[0_0_40px_rgba(250,204,21,0.9)]',
}[rarity] ?? '')

const rarityEmoji = (r: string) => ({ common: '🥚', rare: '💎', epic: '🔮', legendary: '⭐' }[r] ?? '🥚')
const foodEmoji = (k: string) => ({ basic: '🍓', premium: '🍖', special: '🐲' }[k] ?? '🍖')
const foodDescription = (k: string) => ({
  basic:   '-20 hunger, +5 happiness',
  premium: '-50 hunger, +15 happiness',
  special: '-100 hunger, +30 happiness',
}[k] ?? '')
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    await navigateTo('/login')
    return
  }

  if (user && !playerStore.isInitialized) await playerStore.fetchPlayerProfile(user.id)
  await fetchInventory()
})
</script>