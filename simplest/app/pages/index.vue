<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    <!-- Loading state -->
    <div v-if="playerStore.loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-8xl mb-4 animate-bounce">🐣</div>
        <p class="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
          Loading your kingdom...
        </p>
      </div>
    </div>

    <!-- Main game UI -->
    <div v-else class="relative z-10">
      <!-- Animated background -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
        <div class="absolute top-20 right-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
        <div class="absolute bottom-40 left-1/4 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style="animation-delay: 1s"></div>
        <div class="absolute bottom-20 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
      </div>

      <!-- Header with user info -->
      <div class="bg-linear-to-r from-purple-900 to-indigo-900 border-b-2 border-purple-700 backdrop-blur-md sticky top-0 z-20">
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
              <p class="text-xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
            </div>
            <button
              @click="logout"
              class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-sm transition transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Quick actions row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <NuxtLink
            to="/inventory"
            class="rounded-2xl border-2 border-amber-500 bg-linear-to-br from-amber-900 to-yellow-900 p-6 hover:border-amber-300 hover:shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <p class="text-4xl mb-2">🎒</p>
            <h3 class="font-bold text-lg">Inventory</h3>
            <p class="text-xs text-amber-200 mt-1">Open eggs and use food</p>
            <p class="text-xs text-amber-200 mt-2">{{ petCollection.length }}/50 Pets Owned</p>
          </NuxtLink>
          <NuxtLink
            to="/shop"
            class="rounded-2xl border-2 border-yellow-500 bg-linear-to-br from-yellow-900 to-orange-900 p-6 hover:border-yellow-300 hover:shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <p class="text-4xl mb-2">🎰</p>
            <h3 class="font-bold text-lg">Buy Eggs</h3>
            <p class="text-xs text-yellow-200 mt-1">Shop for eggs and food</p>
            <p class="text-xs text-yellow-200 mt-2">{{ petCollection.length }}/50 Pets Owned</p>
          </NuxtLink>

          <button
            @click="feedActivePet"
            :disabled="!playerStore.activePet"
            class="rounded-2xl border-2 border-blue-500 bg-linear-to-br from-blue-900 to-cyan-900 p-6 hover:border-blue-300 hover:shadow-lg hover:scale-105 transition cursor-pointer disabled:opacity-50"
          >
            <p class="text-4xl mb-2">🍖</p>
            <h3 class="font-bold text-lg">Feed Active Pet</h3>
            <p class="text-xs text-blue-200 mt-1">+10 Gold</p>
            <p class="text-xs text-blue-200 mt-2" v-if="playerStore.activePet">
              Hunger: {{ playerStore.activePet.hunger }}/100
            </p>
          </button>

          <button
            @click="battleRandom"
            class="rounded-2xl border-2 border-purple-500 bg-linear-to-br from-purple-900 to-pink-900 p-6 hover:border-purple-300 hover:shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <p class="text-4xl mb-2">⚔️</p>
            <h3 class="font-bold text-lg">Battle Arena</h3>
            <p class="text-xs text-purple-200 mt-1">PvP Mode</p>
            <p class="text-xs text-purple-200 mt-2">Earn 50 Gold</p>
          </button>

          <button
            @click="showLeaderboard = true"
            class="rounded-2xl border-2 border-green-500 bg-linear-to-br from-green-900 to-emerald-900 p-6 hover:border-green-300 hover:shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <p class="text-4xl mb-2">🏆</p>
            <h3 class="font-bold text-lg">Leaderboards</h3>
            <p class="text-xs text-green-200 mt-1">Top 100 Trainers</p>
            <p class="text-xs text-green-200 mt-2">Rank: #{{ Math.floor(Math.random() * 500) + 1 }}</p>
          </button>
        </div>

        <!-- Featured section: Your Active Pet -->
        <div v-if="playerStore.activePet" class="rounded-3xl border-2 border-cyan-500 bg-linear-to-r from-cyan-900 to-blue-900 shadow-2xl p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            ⭐ Your Active Companion ⭐
          </h2>
          <div class="grid md:grid-cols-3 gap-6 items-center">
            <!-- Pet display -->
            <div class="text-center">
              <div class="text-9xl mb-4 animate-bounce">{{ playerStore.activePet.species?.emoji ?? '🐱' }}</div>
              <h3 class="text-3xl font-bold text-cyan-200">{{ playerStore.activePetName }}</h3>
              <p class="text-sm text-cyan-300 mt-1">
                Level {{ playerStore.activePet.level }} • {{ playerStore.activePet.species?.rarity ?? 'Unknown' }}
              </p>
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
              </div>
            </div>

            <!-- Pet stats -->
            <div class="bg-black bg-opacity-40 rounded-2xl p-6">
              <h4 class="font-bold text-lg mb-4 text-cyan-300">📊 Stats</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span>HP</span>
                  <span class="font-bold">{{ playerStore.activePet.current_hp }}/{{ playerStore.activePet.max_hp }}</span>
                </div>
                <div class="flex justify-between">
                  <span>ATK</span>
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
                <div class="flex justify-between">
                  <span>Affection</span>
                  <span class="font-bold text-pink-300">❤️ {{ playerStore.activePet.affection }}%</span>
                </div>
                <hr class="border-cyan-700 my-3" />
                <div class="flex justify-between text-cyan-200">
                  <span>Next Level:</span>
                  <span class="font-bold">{{ playerStore.activePet.level + 1 }}</span>
                </div>
              </div>
            </div>

            <!-- Quick actions for pet -->
            <div class="space-y-3">
              <button
                @click="feedActivePet"
                class="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                🍖 FEED (+10 Gold)
              </button>
              <button
                @click="increasePetAffection"
                class="w-full bg-pink-600 hover:bg-pink-500 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                💕 BOND (+5 Affection)
              </button>
              <button
                @click="showPetDetails = true"
                class="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                📋 DETAILS
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
            class="rounded-2xl border-2 p-4 text-center hover:border-cyan-300 cursor-pointer transition transform hover:scale-105"
            :class="{
              'border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900': playerStore.activePet?.id === pet.id,
              'border-blue-500 bg-linear-to-br from-blue-900 to-slate-900': playerStore.activePet?.id !== pet.id
            }"
          >
            <p class="text-5xl mb-2">{{ pet.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-sm">{{ pet.nickname || pet.species?.name || 'Unknown' }}</p>
            <p class="text-xs" :class="playerStore.activePet?.id === pet.id ? 'text-cyan-200' : 'text-slate-300'">
              Lvl {{ pet.level }}
            </p>
            <p class="text-xs mt-1" :class="playerStore.activePet?.id === pet.id ? 'text-cyan-200' : 'text-slate-300'">
              H: {{ pet.hunger }}/100
            </p>
          </div>

          <!-- Empty slots -->
          <div v-for="i in Math.max(0, 5 - Math.min(5, petCollection.length))" :key="`empty-${i}`" class="rounded-2xl border-2 border-dashed border-slate-600 bg-slate-800 bg-opacity-30 p-4 text-center flex items-center justify-center">
            <p class="text-3xl opacity-50">🔒</p>
          </div>
        </div>

        <!-- Daily Tasks & Rewards -->
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <div class="rounded-3xl border-2 border-yellow-500 bg-linear-to-r from-yellow-900 to-orange-900 p-6">
            <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
              📋 Daily Challenges
            </h3>
            <div class="space-y-3">
              <div
                v-for="task in playerStore.dailyProgress"
                :key="task.id"
                class="bg-black bg-opacity-30 p-3 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ task.completed ? '✅' : '🔄' }}</span>
                  <div class="flex-1">
                    <p class="font-bold" :class="task.completed ? 'line-through text-yellow-400' : ''">
                      {{ task.title }}
                    </p>
                    <p class="text-xs text-yellow-200">
                      {{ task.progress }}/{{ task.target_count }} • +{{ task.reward_gold }} Gold, +{{ task.reward_experience }} EXP
                    </p>
                  </div>
                </div>
                <!-- Progress bar -->
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="task.completed ? 'bg-green-500' : 'bg-yellow-500'"
                    :style="{ width: Math.min(100, (task.progress / task.target_count) * 100) + '%' }"
                  ></div>
                </div>
              </div>

              <p v-if="playerStore.dailyProgress.length === 0" class="text-yellow-200 text-sm">
                No challenges loaded yet.
              </p>
            </div>
          </div>

          <!-- Daily Login Bonus -->
          <div class="rounded-3xl border-2 border-pink-500 bg-linear-to-r from-pink-900 to-purple-900 p-6 flex flex-col">
            <h3 class="text-2xl font-bold mb-4 flex items-center gap-2">
              🎁 Daily Login Bonus
            </h3>
            <p class="text-pink-200 text-sm mb-2">
              Current streak: <span class="font-bold text-yellow-300">{{ playerStore.profile?.daily_streak ?? 0 }} day(s)</span>
            </p>
            <p class="text-pink-200 text-sm mb-4">
              Come back every day to grow your streak and earn bigger rewards!
            </p>
            <button
              @click="claimDailyRewards"
              :disabled="alreadyClaimedToday"
              class="w-full mt-auto py-3 rounded-lg font-bold transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="alreadyClaimedToday ? 'bg-gray-700' : 'bg-yellow-600 hover:bg-yellow-500'"
            >
              {{ alreadyClaimedToday ? '✅ Already Claimed Today' : '🎁 CLAIM DAILY BONUS' }}
            </button>
          </div>
        </div>
      </div>


      <!-- Footer -->
      <div class="text-center py-6 border-t border-purple-700 mt-12">
        <p class="text-purple-300 text-sm">
          ✨ Keep caring for your pets to unlock new features! ✨
        </p>
      </div>

      <!-- Success notification -->
      <div
        v-if="notification"
        class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg animate-pulse z-40"
      >
        {{ notification }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const playerStore = usePlayerStore()
const supabase = useSupabaseClient()

const showLeaderboard = ref(false)
const showPetDetails = ref(false)
const notification = ref('')

const petCollection = computed(() => playerStore.petCollection)

const alreadyClaimedToday = computed(() => {
  const last = playerStore.profile?.last_daily_claim
  if (!last) return false
  return new Date(last).toDateString() === new Date().toDateString()
})

const showNotification = (msg: string, duration = 2000) => {
  notification.value = msg
  setTimeout(() => (notification.value = ''), duration)
}

const logout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

const feedActivePet = async () => {
  if (!playerStore.activePet) return

  try {
    await playerStore.feedPet(playerStore.activePet.id)
    showNotification('✨ Your pet is happy and full!')
  } catch (err) {
    showNotification('❌ Failed to feed pet')
  }
}

const increasePetAffection = async () => {
  if (!playerStore.activePet) return

  try {
    const newAffection = Math.min(100, playerStore.activePet.affection + 5)

    await supabase
      .from('user_pets')
      .update({ affection: newAffection })
      .eq('id', playerStore.activePet.id)

    playerStore.activePet.affection = newAffection
    showNotification('💕 Your pet loves you more now!')
  } catch (err) {
    showNotification('❌ Failed to increase affection')
  }
}

const selectActivePet = async (petId: string) => {
  try {
    await playerStore.setActivePet(petId)
    showNotification('⭐ Pet selected!', 1000)
  } catch (err) {
    showNotification('❌ Failed to select pet')
  }
}

const battleRandom = async () => {
  try {
    if (!playerStore.activePet) {
      showNotification('❌ You need an active pet!')
      return
    }

    notification.value = '⚔️ Battle in progress...'

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Random win/loss (60% win rate)
    const won = Math.random() > 0.4

    if (won) {
      await playerStore.addGold(50)
      await playerStore.addExperience(playerStore.activePet.id, 50)
      await playerStore.incrementChallengeProgress('BATTLE_WIN')
      showNotification('🎉 Victory! +50 Gold, +50 EXP', 3000)
    } else {
      showNotification('😢 Defeat! Better luck next time', 3000)
    }
  } catch (err) {
    showNotification('❌ Battle failed')
  }
}

const claimDailyRewards = async () => {
  try {
    if (!playerStore.profile?.id) return
    const reward = await playerStore.claimDailyLoginReward()

    if (!reward) {
      showNotification('Already claimed today')
      return
    }

    showNotification('🎁 +' + reward + ' coins')
  } catch (err) {
    showNotification('❌ Failed to claim rewards')
  }
}

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      await navigateTo('/login')
      return
    }
    if (!playerStore.isInitialized) {
      await playerStore.fetchPlayerProfile(user.id)
    }
    // Counts toward the "Daily Login" challenge progress (separate from the gold bonus)
    await playerStore.incrementChallengeProgress('LOGIN')
  } catch (err) {
    console.error('Failed to initialize player:', err)
    await navigateTo('/login')
  }
})
</script>