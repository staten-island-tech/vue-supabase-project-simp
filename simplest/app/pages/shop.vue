<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white p-6">
    <!-- Header -->
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
            🏪 Kingdom Shop
          </h1>
          <p class="text-purple-300 text-sm mt-1">Spend your gold on eggs and food!</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-center bg-black bg-opacity-30 px-5 py-2 rounded-xl border border-yellow-500">
            <p class="text-xs text-yellow-300">GOLD</p>
            <p class="text-2xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
          </div>
          <NuxtLink
            to="/"
            class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 font-bold text-sm transition hover:scale-105"
          >
            🏰 Home
          </NuxtLink>
        </div>
      </div>

      <!-- Notification -->
      <div
        v-if="notification"
        class="mb-6 p-4 rounded-xl border-2 text-center font-bold transition"
        :class="notificationError
          ? 'bg-red-900 border-red-500 text-red-200'
          : 'bg-green-900 border-green-500 text-green-200'"
      >
        {{ notification }}
      </div>

      <!-- Eggs Section -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">🥚 Eggs</h2>
        <p class="text-purple-300 text-sm mb-6">
          Buy an egg and open it from your inventory to hatch a random pet!
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="egg in eggs"
            :key="egg.id"
            class="rounded-2xl border-2 p-6 text-center flex flex-col items-center gap-3 transition hover:scale-105"
            :class="rarityCardClass(egg.rarity)"
          >
            <p class="text-6xl">{{ rarityEmoji(egg.rarity) }}</p>
            <h3 class="font-black text-lg">{{ egg.name }}</h3>
            <div class="text-xs space-y-1 text-left w-full bg-black bg-opacity-30 rounded-lg p-3">
              <p v-for="rate in dropRates[egg.rarity]" :key="rate.pet_rarity" class="flex justify-between">
                <span :class="rarityTextClass(rate.pet_rarity)">{{ capitalize(rate.pet_rarity) }}</span>
                <span class="font-bold">{{ rate.drop_chance }}%</span>
              </p>
            </div>
            <p class="text-yellow-300 font-bold text-lg">💰 {{ egg.gold_price }}</p>
            <button
              @click="buyItem(egg)"
              :disabled="playerStore.goldBalance < egg.gold_price || !!buying"
              class="w-full py-2 rounded-lg font-bold text-sm transition"
              :class="playerStore.goldBalance >= egg.gold_price
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
            >
              {{ buying === egg.id ? 'Buying...' : 'Buy' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Food Section -->
      <div>
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">🍖 Food</h2>
        <p class="text-purple-300 text-sm mb-6">
          Feed your pets to keep them happy and earn gold!
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="food in foods"
            :key="food.id"
            class="rounded-2xl border-2 border-blue-500 bg-linear-to-br from-blue-900 to-slate-900 p-6 text-center flex flex-col items-center gap-3 transition hover:scale-105"
          >
            <p class="text-6xl">{{ foodEmoji(food.food_kind) }}</p>
            <h3 class="font-black text-lg">{{ food.name }}</h3>
            <p class="text-sm text-blue-200">{{ foodDescription(food.food_kind) }}</p>
            <p class="text-yellow-300 font-bold text-lg">💰 {{ food.gold_price }}</p>
            <button
              @click="buyItem(food)"
              :disabled="playerStore.goldBalance < food.gold_price || !!buying"
              class="w-full py-2 rounded-lg font-bold text-sm transition"
              :class="playerStore.goldBalance >= food.gold_price
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
            >
              {{ buying === food.id ? 'Buying...' : 'Buy' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

const shopItems = ref<any[]>([])
const dropRates = ref<Record<string, any[]>>({})
const buying = ref<string | null>(null)
const notification = ref('')
const notificationError = ref(false)

const eggs = computed(() => shopItems.value.filter(i => i.item_kind === 'egg'))
const foods = computed(() => shopItems.value.filter(i => i.item_kind === 'food'))

const showNotification = (msg: string, isError = false) => {
  notification.value = msg
  notificationError.value = isError
  setTimeout(() => (notification.value = ''), 3000)
}

const fetchShopItems = async () => {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .order('gold_price', { ascending: true })
  if (error) { showNotification('Failed to load shop', true); return }
  shopItems.value = data || []
}

const fetchDropRates = async () => {
  const { data, error } = await supabase
    .from('egg_drop_rates')
    .select('egg_rarity, pet_rarity, drop_chance')
    .order('drop_chance', { ascending: false })
  if (error) return
  const grouped: Record<string, any[]> = {}
  for (const row of data || []) {
    if (row.drop_chance === 0) continue
    if (!grouped[row.egg_rarity]) grouped[row.egg_rarity] = []
    grouped[row.egg_rarity].push(row)
  }
  dropRates.value = grouped
}

const buyItem = async (item: any) => {
  const profile = playerStore.profile
  if (!profile) return

  if (playerStore.goldBalance < item.gold_price) {
    showNotification('❌ Not enough gold!', true)
    return
  }

  buying.value = item.id

  try {
    // Deduct gold
    await playerStore.addGold(-item.gold_price)

    // Upsert into user_shop_inventory
    const countField = item.item_kind === 'egg' ? 'eggs_count' : 'food_count'

    const { data: existing } = await supabase
      .from('user_shop_inventory')
      .select('*')
      .eq('user_id', profile.id)
      .eq('shop_item_id', item.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('user_shop_inventory')
        .update({ [countField]: existing[countField] + 1, updated_at: new Date().toISOString() })
        .eq('user_id', profile.id)
        .eq('shop_item_id', item.id)
    } else {
      await supabase
        .from('user_shop_inventory')
        .insert({
          user_id: profile.id,
          shop_item_id: item.id,
          eggs_count: item.item_kind === 'egg' ? 1 : 0,
          food_count: item.item_kind === 'food' ? 1 : 0,
        })
    }

    // Log purchase
    await supabase.from('shop_purchase_log').insert({
      user_id: profile.id,
      shop_item_id: item.id,
      qty: 1,
      gold_spent: item.gold_price,
    })

    showNotification(`✅ Bought ${item.name}!`)
  } catch (err: any) {
    showNotification(`❌ ${err.message}`, true)
  } finally {
    buying.value = null
  }
}

// Helpers
const rarityCardClass = (rarity: string) => ({
  'common':    'border-gray-400 bg-linear-to-br from-gray-800 to-slate-900',
  'rare':      'border-blue-400 bg-linear-to-br from-blue-900 to-slate-900',
  'epic':      'border-purple-400 bg-linear-to-br from-purple-900 to-slate-900',
  'legendary': 'border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900',
}[rarity] || 'border-gray-500 bg-slate-900')

const rarityTextClass = (rarity: string) => ({
  'common':    'text-gray-300',
  'rare':      'text-blue-300',
  'epic':      'text-purple-300',
  'legendary': 'text-yellow-300',
}[rarity] || 'text-white')

const rarityEmoji = (rarity: string) => ({ common: '🥚', rare: '💎', epic: '🔮', legendary: '⭐' }[rarity] || '🥚')
const foodEmoji = (kind: string) => ({ basic: '🍓', premium: '🍖', special: '🐲' }[kind] || '🍖')
const foodDescription = (kind: string) => ({
  basic:   'Fills hunger by 20. Simple but effective.',
  premium: 'Fills hunger by 50 and boosts happiness.',
  special: 'Max hunger fill + big happiness boost!',
}[kind] || '')
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    await navigateTo('/login')
    return
  }

  if (user && !playerStore.isInitialized) await playerStore.fetchPlayerProfile(user.id)
  await fetchShopItems()
  await fetchDropRates()
})
</script>