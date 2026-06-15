<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    <div v-if="playerStore.loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-8xl mb-4 animate-bounce">🐣</div>
        <p class="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">Loading your kingdom...</p>
      </div>
    </div>

    <div v-else class="relative z-10">
      <!-- Animated background -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        <div class="absolute top-20 right-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" style="animation-delay:.5s"></div>
        <div class="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style="animation-delay:1s"></div>
        <div class="absolute bottom-20 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style="animation-delay:1.5s"></div>
      </div>

      <!-- Header -->
      <div class="bg-linear-to-r from-purple-900 to-indigo-900 border-b-2 border-purple-700 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
              🏰 {{ playerStore.profile?.trainer_name ?? 'Trainer' }}'s Kingdom
            </h1>
            <div class="hidden md:block text-sm text-purple-200">
              <p class="font-bold">Level: <span class="text-yellow-300">{{ playerStore.trainerLevel }}</span></p>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <p class="text-xs text-purple-300">GOLD</p>
              <p ref="goldCounterEl" class="text-xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
            </div>
            <button @click="logout" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-sm transition hover:scale-105">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Quick actions (5 cards) -->
        <div ref="actionCardsEl" class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <NuxtLink to="/inventory" class="quick-card rounded-2xl border-2 border-amber-500 bg-linear-to-br from-amber-900 to-yellow-900 p-6 hover:border-amber-300 hover:shadow-lg hover:scale-105 transition cursor-pointer">
            <p class="text-4xl mb-2">🎒</p>
            <h3 class="font-bold text-lg">Inventory</h3>
            <p class="text-xs text-amber-200 mt-1">Open eggs and use food</p>
            <p class="text-xs text-amber-200 mt-2">{{ petCollection.length }}/50 Pets</p>
          </NuxtLink>
          <NuxtLink to="/shop" class="quick-card rounded-2xl border-2 border-yellow-500 bg-linear-to-br from-yellow-900 to-orange-900 p-6 hover:border-yellow-300 hover:shadow-lg hover:scale-105 transition cursor-pointer">
            <p class="text-4xl mb-2">🎰</p>
            <h3 class="font-bold text-lg">Shop</h3>
            <p class="text-xs text-yellow-200 mt-1">Buy eggs and food</p>
            <p class="text-xs text-yellow-200 mt-2">Hatch rare pets!</p>
          </NuxtLink>
          <NuxtLink to="/battle" class="quick-card rounded-2xl border-2 border-purple-500 bg-linear-to-br from-purple-900 to-pink-900 p-6 hover:border-purple-300 hover:shadow-lg hover:scale-105 transition cursor-pointer">
            <p class="text-4xl mb-2">⚔️</p>
            <h3 class="font-bold text-lg">Battle Arena</h3>
            <p class="text-xs text-purple-200 mt-1">Fight with your team</p>
            <p class="text-xs text-purple-200 mt-2">Best for Gold</p>
          </NuxtLink>
          <NuxtLink to="/training" class="quick-card rounded-2xl border-2 border-green-500 bg-linear-to-br from-green-900 to-emerald-900 p-6 hover:border-green-300 hover:shadow-lg hover:scale-105 transition cursor-pointer">
            <p class="text-4xl mb-2">🏋️</p>
            <h3 class="font-bold text-lg">Training</h3>
            <p class="text-xs text-green-200 mt-1">Pop orbs mini-game</p>
            <p class="text-xs text-green-200 mt-2">Best for EXP</p>
          </NuxtLink>
          <button @click="openLeaderboard" class="quick-card rounded-2xl border-2 border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900 p-6 hover:border-cyan-300 hover:shadow-lg hover:scale-105 transition cursor-pointer">
            <p class="text-4xl mb-2">🏆</p>
            <h3 class="font-bold text-lg">Leaderboards</h3>
            <p class="text-xs text-cyan-200 mt-1">Top Trainers</p>
            <p class="text-xs text-cyan-200 mt-2">Ranked by Level</p>
          </button>
        </div>

        <!-- Active Pet -->
        <div v-if="playerStore.activePet" ref="activePetEl" class="rounded-3xl border-2 border-cyan-500 bg-linear-to-r from-cyan-900 to-blue-900 shadow-2xl p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">⭐ Your Active Companion ⭐</h2>
          <div class="grid md:grid-cols-3 gap-6 items-center">
            <!-- Pet display -->
            <div class="text-center">
              <div ref="activePetEmojiEl" class="text-9xl mb-4 inline-block">{{ playerStore.activePet.species?.emoji ?? '🐱' }}</div>
              <h3 class="text-3xl font-bold text-cyan-200">{{ playerStore.activePetName }}</h3>
              <p class="text-sm text-cyan-300 mt-1">Level {{ playerStore.activePet.level }} • {{ playerStore.activePet.species?.rarity ?? 'Unknown' }}</p>
              <div class="mt-4 space-y-2 text-sm">
                <div class="flex items-center justify-between bg-black bg-opacity-30 px-3 py-2 rounded-lg">
                  <span>EXP</span>
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" :style="{ width: (playerStore.activePet.experience % 100) + '%' }"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between bg-black bg-opacity-30 px-3 py-2 rounded-lg">
                  <span>HUNGER</span>
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" :style="{ width: (100 - playerStore.activePet.hunger) + '%' }"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between bg-black bg-opacity-30 px-3 py-2 rounded-lg">
                  <span>HAPPINESS</span>
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: playerStore.activePet.happiness + '%' }"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between bg-black bg-opacity-30 px-3 py-2 rounded-lg">
                  <span>AFFECTION</span>
                  <div class="w-32 bg-gray-700 rounded-full h-2">
                    <div class="bg-pink-500 h-2 rounded-full" :style="{ width: playerStore.activePet.affection + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="bg-black bg-opacity-40 rounded-2xl p-6">
              <h4 class="font-bold text-lg mb-4 text-cyan-300">📊 Battle Stats</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span>HP</span>
                  <span class="font-bold">{{ playerStore.activePet.current_hp }}/{{ playerStore.activePet.max_hp }}</span>
                </div>
                <div class="flex justify-between">
                  <span>ATK <span class="text-xs text-pink-300">(+{{ Math.round((playerStore.activePet.affection ?? 0) / 100 * 15) }}% affection)</span></span>
                  <span class="font-bold text-red-300">{{ playerStore.activePet.species?.base_attack ?? 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>DEF</span>
                  <span class="font-bold text-blue-300">{{ playerStore.activePet.species?.base_defense ?? 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>SPD</span>
                  <span class="font-bold text-yellow-300">{{ playerStore.activePet.species?.base_speed ?? 0 }}</span>
                </div>
                <hr class="border-cyan-700 my-2" />
                <div class="flex justify-between text-pink-300 text-xs">
                  <span>Training EXP bonus:</span>
                  <span class="font-bold">+{{ affectionTrainingBonus }}%</span>
                </div>
                <div class="flex justify-between text-cyan-200">
                  <span>Next Level:</span>
                  <span class="font-bold">{{ 100 - (playerStore.activePet.experience % 100) }} EXP</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <button @click="feedActivePet" class="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition hover:scale-105">
                🍖 QUICK FEED (+10g, +8 EXP)
              </button>
              <button @click="openFeedModal" class="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition hover:scale-105">
                🍽️ FEED FROM INVENTORY
              </button>
              <button @click="playWithPet" class="w-full bg-pink-600 hover:bg-pink-500 py-3 rounded-lg font-bold transition hover:scale-105">
                💕 BOND (+15 Happiness, +8 Affection)
              </button>
              <button @click="increasePetAffection" class="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold transition hover:scale-105">
                🤝 PET (+5 Affection)
              </button>
            </div>
          </div>
        </div>

        <!-- Pet Collection -->
        <h2 class="text-2xl font-bold mb-6">🎯 Your Collection ({{ petCollection.length }}/50)</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div
            v-for="pet in petCollection"
            :key="pet.id"
            @click="selectActivePet(pet.id)"
            class="pet-collection-card rounded-2xl border-2 p-4 text-center hover:border-cyan-300 cursor-pointer transition hover:scale-105"
            :class="playerStore.activePet?.id === pet.id
              ? 'border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900'
              : 'border-blue-500 bg-linear-to-br from-blue-900 to-slate-900'"
          >
            <p class="text-5xl mb-2">{{ pet.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-sm">{{ pet.nickname || pet.species?.name || 'Unknown' }}</p>
            <p class="text-xs text-slate-300">Lvl {{ pet.level }}</p>
            <div class="mt-1 flex justify-center gap-0.5">
              <span v-for="i in 5" :key="i" class="text-[9px]" :class="(pet.affection ?? 0) >= i * 20 ? 'text-pink-400' : 'text-slate-600'">♥</span>
            </div>
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
            <span v-if="pet.team_slot" class="mt-1 inline-block text-xs bg-cyan-700 text-cyan-100 rounded px-1">Team {{ pet.team_slot }}</span>
            <p v-if="playerStore.activePet?.id === pet.id" class="text-xs text-cyan-300 font-bold mt-1">⭐ Active</p>
          </div>
          <div v-for="i in Math.max(0, 5 - Math.min(5, petCollection.length))" :key="`empty-${i}`" class="rounded-2xl border-2 border-dashed border-slate-600 p-4 flex items-center justify-center">
            <p class="text-3xl opacity-50">🔒</p>
          </div>
        </div>

        <!-- Daily Challenges + Login Bonus -->
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <div class="rounded-3xl border-2 border-yellow-500 bg-linear-to-r from-yellow-900 to-orange-900 p-6">
            <h3 class="text-2xl font-bold mb-4">📋 Daily Challenges</h3>
            <div class="space-y-3">
              <div v-for="task in playerStore.dailyProgress" :key="task.id" class="bg-black bg-opacity-30 p-3 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ task.completed ? '✅' : '🔄' }}</span>
                  <div class="flex-1">
                    <p class="font-bold" :class="task.completed ? 'line-through text-yellow-400' : ''">{{ task.title }}</p>
                    <p class="text-xs text-yellow-200">{{ task.progress }}/{{ task.target_count }} • +{{ task.reward_gold }}g +{{ task.reward_experience }} EXP</p>
                  </div>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div class="h-2 rounded-full transition-all" :class="task.completed ? 'bg-green-500' : 'bg-yellow-500'" :style="{ width: Math.min(100, task.progress / task.target_count * 100) + '%' }"></div>
                </div>
              </div>
              <p v-if="!playerStore.dailyProgress.length" class="text-yellow-200 text-sm">No challenges loaded yet.</p>
            </div>
          </div>

          <div class="rounded-3xl border-2 border-pink-500 bg-linear-to-r from-pink-900 to-purple-900 p-6 flex flex-col">
            <h3 class="text-2xl font-bold mb-4">🎁 Daily Login Bonus</h3>
            <p class="text-pink-200 text-sm mb-2">Streak: <span class="font-bold text-yellow-300">{{ playerStore.profile?.daily_streak ?? 0 }} day(s)</span></p>
            <p class="text-pink-200 text-sm mb-4">Come back daily for bigger rewards!</p>
            <button @click="claimDailyRewards" :disabled="alreadyClaimedToday"
              class="w-full mt-auto py-3 rounded-lg font-bold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="alreadyClaimedToday ? 'bg-gray-700' : 'bg-yellow-600 hover:bg-yellow-500'">
              {{ alreadyClaimedToday ? '✅ Already Claimed Today' : '🎁 CLAIM DAILY BONUS' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center py-6 border-t border-purple-700">
        <p class="text-purple-300 text-sm">✨ Keep caring for your pets to unlock new features! ✨</p>
      </div>

      <!-- Notification -->
      <div v-if="notification" ref="notifEl" class="fixed bottom-6 right-6 text-white px-6 py-4 rounded-lg shadow-lg z-40 font-bold"
        :class="notifError ? 'bg-red-600' : 'bg-green-600'">
        {{ notification }}
      </div>

      <!-- Feed From Inventory Modal -->
      <div v-if="showFeedModal" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" @click.self="showFeedModal = false">
        <div ref="feedModalEl" class="rounded-3xl border-2 border-blue-500 bg-linear-to-br from-blue-900 to-slate-900 p-6 max-w-sm w-full">
          <h2 class="text-xl font-black mb-1">🍽️ Feed {{ playerStore.activePetName }}</h2>
          <p class="text-xs text-blue-300 mb-4">Choose a food from your inventory. Feeding also gives EXP & Affection!</p>
          <div v-if="loadingFoods" class="text-center text-blue-300 py-6 animate-pulse">Loading foods...</div>
          <div v-else-if="feedModalFoods.length === 0" class="text-center text-blue-300 py-6">
            No food in inventory. Visit the <NuxtLink to="/shop" class="text-yellow-300 underline" @click="showFeedModal=false">Shop</NuxtLink>!
          </div>
          <div v-else class="space-y-3">
            <button
              v-for="food in feedModalFoods"
              :key="food.shop_item_id"
              @click="useInventoryFood(food)"
              :disabled="feedingWith === food.shop_item_id"
              class="w-full flex items-center gap-3 bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-xl transition hover:scale-105 text-left"
            >
              <span class="text-3xl">{{ foodEmoji(food.food_kind) }}</span>
              <div class="flex-1">
                <p class="font-bold">{{ food.name }}</p>
                <p class="text-xs text-blue-300">{{ foodDesc(food.food_kind) }}</p>
              </div>
              <span class="text-sm font-bold text-white">x{{ food.food_count }}</span>
            </button>
          </div>
          <button @click="showFeedModal = false" class="w-full mt-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-bold transition">
            Cancel
          </button>
        </div>
      </div>

      <!-- Leaderboard Modal -->
      <div v-if="showLeaderboard" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" @click.self="closeLeaderboard">
        <div class="rounded-3xl border-2 border-green-500 bg-linear-to-br from-green-900 via-slate-900 to-emerald-900 shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-300 to-emerald-300">🏆 Leaderboard</h2>
            <button @click="closeLeaderboard" class="text-2xl hover:text-red-400 transition">✕</button>
          </div>

          <div v-if="selectedPlayer" class="mb-4">
            <button @click="selectedPlayer = null" class="text-sm text-green-300 hover:text-green-200 mb-4 transition">← Back</button>
            <div class="rounded-2xl border border-green-600 bg-black bg-opacity-30 p-6 text-center mb-4">
              <p class="text-7xl mb-2">{{ selectedPlayer.active_pet_emoji ?? '🧑‍🌾' }}</p>
              <h3 class="text-2xl font-black">{{ selectedPlayer.trainer_name ?? 'Unknown Trainer' }}</h3>
              <p class="text-sm text-green-300 mt-1">Level {{ selectedPlayer.level }} Trainer</p>
              <div class="grid grid-cols-2 gap-3 mt-4 text-sm text-left">
                <div class="bg-black bg-opacity-30 rounded-lg p-3 flex justify-between"><span>💰 Gold</span><span class="font-bold">{{ selectedPlayer.coins }}</span></div>
                <div class="bg-black bg-opacity-30 rounded-lg p-3 flex justify-between"><span>✨ EXP</span><span class="font-bold">{{ selectedPlayer.experience }}</span></div>
                <div class="bg-black bg-opacity-30 rounded-lg p-3 flex justify-between"><span>🐾 Pets</span><span class="font-bold">{{ selectedPlayer.total_pets_owned }}</span></div>
                <div class="bg-black bg-opacity-30 rounded-lg p-3 flex justify-between"><span>🔥 Streak</span><span class="font-bold">{{ selectedPlayer.daily_streak ?? 0 }}d</span></div>
              </div>
              <div v-if="selectedPlayer.active_pet_species_name" class="mt-4 rounded-xl border border-cyan-600 bg-cyan-900 bg-opacity-30 p-4">
                <p class="text-xs text-cyan-300 uppercase font-bold mb-1">Active Companion</p>
                <p class="font-bold">{{ selectedPlayer.active_pet_nickname || selectedPlayer.active_pet_species_name }}</p>
                <p class="text-xs" :class="rarityTextClass(selectedPlayer.active_pet_rarity ?? '')">
                  {{ capitalize(selectedPlayer.active_pet_rarity ?? '') }} • Lvl {{ selectedPlayer.active_pet_level }}
                </p>
                <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <span>ATK {{ selectedPlayer.active_pet_attack }}</span>
                  <span>DEF {{ selectedPlayer.active_pet_defense }}</span>
                  <span>SPD {{ selectedPlayer.active_pet_speed }}</span>
                </div>
              </div>
            </div>
            <h4 class="font-bold mb-2">🐾 Pet Collection ({{ selectedPlayerPets.length }})</h4>
            <div v-if="loadingPlayerPets" class="text-center text-green-300 py-4 animate-pulse">Loading pets...</div>
            <div v-else-if="!selectedPlayerPets.length" class="text-green-300 text-sm">No pets to show.</div>
            <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div v-for="pet in selectedPlayerPets" :key="pet.id" class="rounded-xl border p-3 text-center" :class="rarityCardClass(pet.species_rarity ?? '')">
                <p class="text-3xl">{{ pet.species_emoji ?? '🐣' }}</p>
                <p class="text-xs font-bold truncate">{{ pet.nickname || pet.species_name || 'Unknown' }}</p>
                <p class="text-xs" :class="rarityTextClass(pet.species_rarity ?? '')">Lvl {{ pet.level }}</p>
              </div>
            </div>
          </div>

          <div v-else>
            <div v-if="loadingLeaderboard" class="text-center text-green-300 py-10 animate-pulse">Loading rankings...</div>
            <div v-else class="space-y-2">
              <div v-for="(player, idx) in leaderboardData" :key="player.id"
                @click="viewPlayerDetails(player)"
                class="flex items-center gap-3 bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-xl cursor-pointer transition"
                :class="player.id === playerStore.profile?.id ? 'border border-yellow-400' : ''">
                <span class="text-lg font-black w-8 text-center" :class="rankClass(idx)">{{ rankLabel(idx) }}</span>
                <p class="text-3xl">{{ player.active_pet_emoji ?? '🧑‍🌾' }}</p>
                <div class="flex-1">
                  <p class="font-bold">{{ player.trainer_name ?? 'Unknown' }} <span v-if="player.id === playerStore.profile?.id" class="text-xs text-yellow-300">(You)</span></p>
                  <p class="text-xs text-green-300">Lvl {{ player.level }} • {{ player.experience }} EXP</p>
                </div>
                <p class="text-yellow-300 font-bold text-sm">💰 {{ player.coins }}</p>
              </div>
              <p v-if="!leaderboardData.length" class="text-center text-green-300 py-6">No trainers yet.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const playerStore = usePlayerStore()
const supabase = useSupabaseClient()

const notification = ref('')
const notifError = ref(false)
const notifEl = ref(null)
const goldCounterEl = ref(null)
const actionCardsEl = ref(null)
const activePetEl = ref(null)
const activePetEmojiEl = ref(null)
const feedModalEl = ref(null)

// Feed modal
const showFeedModal = ref(false)
const feedModalFoods = ref([])
const loadingFoods = ref(false)
const feedingWith = ref(null)

// Leaderboard
const showLeaderboard = ref(false)
const leaderboardData = ref([])
const loadingLeaderboard = ref(false)
const selectedPlayer = ref(null)
const selectedPlayerPets = ref([])
const loadingPlayerPets = ref(false)

const petCollection = computed(() => playerStore.petCollection)

const alreadyClaimedToday = computed(() => {
  const last = playerStore.profile?.last_daily_claim
  if (!last) return false
  return new Date(last).toDateString() === new Date().toDateString()
})

const affectionTrainingBonus = computed(() => {
  const aff = playerStore.activePet?.affection ?? 0
  if (aff >= 76) return 35
  if (aff >= 51) return 20
  if (aff >= 26) return 10
  return 0
})

const showNotif = (msg, isError = false, duration = 2500) => {
  notification.value = msg
  notifError.value = isError
  nextTick(() => {
    if (notifEl.value) {
      gsap.fromTo(notifEl.value, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
    }
  })
  setTimeout(() => {
    if (notifEl.value) {
      gsap.to(notifEl.value, { x: 80, opacity: 0, duration: 0.25, onComplete: () => { notification.value = '' } })
    } else {
      notification.value = ''
    }
  }, duration)
}

// Flash gold counter on change
watch(() => playerStore.goldBalance, async () => {
  await nextTick()
  if (goldCounterEl.value) {
    gsap.fromTo(goldCounterEl.value, { scale: 1.3, color: '#fb923c' }, { scale: 1, color: '#fde68a', duration: 0.35, ease: 'back.out(2)' })
  }
})

const logout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const feedActivePet = async () => {
  if (!playerStore.activePet) return
  try {
    await playerStore.feedPet(playerStore.activePet.id)
    if (activePetEmojiEl.value) {
      gsap.fromTo(activePetEmojiEl.value, { y: 0 }, { y: -20, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
    }
    showNotif('🍖 Your pet ate! +10g +8 EXP')
  } catch { showNotif('❌ Failed to feed pet', true) }
}

const openFeedModal = async () => {
  if (!playerStore.activePet || !playerStore.profile) return
  showFeedModal.value = true
  loadingFoods.value = true

  const { data } = await supabase
    .from('user_shop_inventory')
    .select('*, shop_items(id, item_kind, name, food_kind, gold_price)')
    .eq('user_id', playerStore.profile.id)

  feedModalFoods.value = (data || [])
    .filter(r => r.shop_items?.item_kind === 'food' && r.food_count > 0)
    .map(r => ({ ...r.shop_items, shop_item_id: r.shop_item_id, food_count: r.food_count }))

  loadingFoods.value = false

  await nextTick()
  if (feedModalEl.value) {
    gsap.fromTo(feedModalEl.value, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' })
  }
}

const useInventoryFood = async (food) => {
  if (!playerStore.activePet) return
  feedingWith.value = food.shop_item_id
  try {
    const result = await playerStore.useFoodItem(playerStore.activePet.id, food.food_kind, food.shop_item_id)
    if (result) {
      if (activePetEmojiEl.value) {
        gsap.fromTo(activePetEmojiEl.value, { y: 0, scale: 1 }, { y: -20, scale: 1.1, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
      }
      showNotif(`🍽️ ${playerStore.activePetName} loved the ${food.name}! +${result.expGain} EXP ❤️+${3}`)
      // Refresh food list
      food.food_count--
      feedModalFoods.value = feedModalFoods.value.filter(f => f.food_count > 0)
      if (feedModalFoods.value.length === 0) showFeedModal.value = false
    }
  } catch { showNotif('❌ Failed to use food', true) } finally { feedingWith.value = null }
}

const playWithPet = async () => {
  if (!playerStore.activePet) return
  const result = await playerStore.playWithPet(playerStore.activePet.id)
  if (result?.ok) {
    if (activePetEmojiEl.value) {
      gsap.to(activePetEmojiEl.value, { rotation: 360, duration: 0.5, ease: 'power2.inOut', onComplete: () => gsap.set(activePetEmojiEl.value, { rotation: 0 }) })
    }
    showNotif('💕 Your pet loved playing!')
  } else {
    showNotif(result?.message || '❌ Cannot play right now', true)
  }
}

const increasePetAffection = async () => {
  if (!playerStore.activePet) return
  try {
    const newAffection = Math.min(100, playerStore.activePet.affection + 5)
    await supabase.from('user_pets').update({ affection: newAffection }).eq('id', playerStore.activePet.id)
    playerStore.activePet.affection = newAffection
    if (activePetEmojiEl.value) {
      gsap.fromTo(activePetEmojiEl.value, { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
    }
    showNotif('🤝 Your pet likes you more! +5 Affection')
  } catch { showNotif('❌ Failed', true) }
}

const selectActivePet = async (petId) => {
  try {
    await playerStore.setActivePet(petId)
    // Animate the active pet card
    const cards = document.querySelectorAll('.pet-collection-card')
    cards.forEach(card => {
      if (card.classList.contains('border-cyan-500')) {
        gsap.fromTo(card, { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      }
    })
    showNotif('⭐ Pet selected!', false, 1000)
  } catch { showNotif('❌ Failed to select pet', true) }
}

const claimDailyRewards = async () => {
  try {
    const reward = await playerStore.claimDailyLoginReward()
    if (!reward) { showNotif('Already claimed today'); return }
    showNotif(`🎁 +${reward} gold! Streak: ${playerStore.profile?.daily_streak} days`)
  } catch { showNotif('❌ Failed to claim', true) }
}

// Leaderboard
const openLeaderboard = async () => {
  showLeaderboard.value = true
  selectedPlayer.value = null
  await fetchLeaderboard()
}
const closeLeaderboard = () => { showLeaderboard.value = false; selectedPlayer.value = null; selectedPlayerPets.value = [] }
const fetchLeaderboard = async () => {
  loadingLeaderboard.value = true
  try {
    const { data, error } = await supabase.rpc('get_leaderboard_top_100')
    if (error) throw error
    leaderboardData.value = data || []
  } catch { showNotif('❌ Failed to load leaderboard', true) } finally { loadingLeaderboard.value = false }
}
const viewPlayerDetails = async (player) => {
  selectedPlayer.value = player
  selectedPlayerPets.value = []
  loadingPlayerPets.value = true
  try {
    const { data, error } = await supabase.rpc('get_public_pet_collection', { p_user_id: player.id })
    if (error) throw error
    selectedPlayerPets.value = data || []
  } catch { showNotif('❌ Failed to load pets', true) } finally { loadingPlayerPets.value = false }
}

const rankLabel = (idx) => { if (idx === 0) return '🥇'; if (idx === 1) return '🥈'; if (idx === 2) return '🥉'; return `#${idx + 1}` }
const rankClass = (idx) => { if (idx === 0) return 'text-yellow-300'; if (idx === 1) return 'text-slate-300'; if (idx === 2) return 'text-orange-300'; return 'text-green-300' }
const rarityCardClass = (r) => ({ common: 'border-gray-400 bg-linear-to-br from-gray-800 to-slate-900', rare: 'border-blue-400 bg-linear-to-br from-blue-900 to-slate-900', epic: 'border-purple-400 bg-linear-to-br from-purple-900 to-slate-900', legendary: 'border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900' }[r] ?? 'border-gray-500 bg-slate-900')
const rarityTextClass = (r) => ({ common: 'text-gray-300', rare: 'text-blue-300', epic: 'text-purple-300', legendary: 'text-yellow-300' }[r] ?? 'text-white')
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const foodEmoji = (k) => ({ basic: '🍓', premium: '🍖', special: '🐲' }[k] ?? '🍖')
const foodDesc = (k) => ({ basic: '-20 hunger · +5 happy · +15 HP · +5 EXP · +3 Affection', premium: '-50 hunger · +15 happy · +35 HP · +12 EXP · +6 Affection', special: 'Full heal · +30 happy · +25 EXP · +12 Affection' }[k] ?? '')

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { await navigateTo('/login'); return }
    if (!playerStore.isInitialized) await playerStore.fetchPlayerProfile(user.id)
    await playerStore.incrementChallengeProgress('LOGIN')

    // Stagger animate action cards
    await nextTick()
    gsap.from('.quick-card', { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'all' })

    // Stagger pet collection cards
    gsap.from('.pet-collection-card', { scale: 0.85, opacity: 0, duration: 0.4, stagger: 0.06, delay: 0.3, ease: 'back.out(1.5)', clearProps: 'all' })

    // Slide active pet section in
    if (activePetEl.value) {
      gsap.from(activePetEl.value, { x: -40, opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.out', clearProps: 'all' })
    }
  } catch (err) {
    console.error('Failed to initialize player:', err)
    await navigateTo('/login')
  }
})
</script>