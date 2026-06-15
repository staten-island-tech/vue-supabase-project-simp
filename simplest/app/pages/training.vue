<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6 overflow-hidden">
    <div class="max-w-3xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-green-300 to-emerald-300">
            🏋️ Training Area
          </h1>
          <p class="text-purple-300 text-sm mt-1">Pop orbs to earn EXP & Gold for your pets!</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-black bg-opacity-30 px-4 py-2 rounded-xl border border-yellow-500 text-center">
            <p class="text-xs text-yellow-300">GOLD</p>
            <p class="text-xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
          </div>
          <NuxtLink to="/" class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 font-bold text-sm transition hover:scale-105">
            🏰 Home
          </NuxtLink>
        </div>
      </div>

      <!-- ===== SELECT SCREEN ===== -->
      <div v-if="gameState === 'select'">
        <h2 class="text-xl font-bold mb-3">1. Choose a pet to train</h2>
        <div v-if="playerStore.pets.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400 mb-8">
          No pets yet — hatch an egg first!
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div
            v-for="pet in playerStore.pets"
            :key="pet.id"
            @click="selectPet(pet)"
            class="rounded-2xl border-2 p-3 text-center cursor-pointer transition hover:scale-105 relative"
            :class="selectedPet?.id === pet.id
              ? 'border-green-400 bg-linear-to-br from-green-900 to-emerald-900'
              : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-green-600'"
          >
            <p class="text-4xl mb-1">{{ pet.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-xs truncate">{{ pet.nickname || pet.species?.name }}</p>
            <p class="text-xs text-slate-300">Lvl {{ pet.level }}</p>
            <!-- Affection indicator -->
            <div class="mt-1 flex justify-center gap-0.5">
              <span v-for="i in 5" :key="i" class="text-[10px]" :class="(pet.affection ?? 0) >= i * 20 ? 'text-pink-400' : 'text-slate-600'">♥</span>
            </div>
            <div v-if="isOnCooldown(pet.id)" class="mt-1 text-xs text-yellow-300 font-bold">
              ⏱ {{ formatCooldown(petCooldowns[pet.id]) }}
            </div>
            <div v-else class="mt-1 text-xs text-green-300 font-bold">✅ Ready</div>
          </div>
        </div>

        <!-- Affection EXP bonus hint for selected pet -->
        <div v-if="selectedPet" class="mb-6 rounded-xl bg-pink-900 bg-opacity-40 border border-pink-700 p-3 text-sm flex items-center gap-3">
          <span class="text-2xl">❤️</span>
          <div>
            <p class="font-bold">Affection Bonus: <span class="text-pink-300">+{{ Math.round(affectionExpBonus * 100) }}% EXP</span></p>
            <p class="text-xs text-pink-200">Play with and feed your pet to raise affection ({{ selectedPet.affection ?? 0 }}/100)</p>
          </div>
        </div>

        <h2 class="text-xl font-bold mb-3">2. Choose training type</h2>
        <!-- Why lower tiers still matter -->
        <p class="text-xs text-purple-300 mb-3">💡 Quick Drill has the lowest cooldown — best for active grinding! Higher tiers give bigger single rewards but slower cooldowns.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            v-for="type in trainingTypes"
            :key="type.id"
            @click="selectedType = type"
            class="rounded-2xl border-2 p-5 text-center cursor-pointer transition hover:scale-105"
            :class="selectedType?.id === type.id
              ? 'border-green-400 bg-linear-to-br from-green-900 to-emerald-900'
              : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-green-600'"
          >
            <p class="text-4xl mb-2">{{ type.emoji }}</p>
            <h3 class="font-bold text-lg">{{ type.name }}</h3>
            <p class="text-xs text-slate-300 mt-1">{{ type.duration }}s · <span class="text-green-300 font-bold">{{ type.cooldownMins }}min CD</span></p>
            <div class="text-xs mt-2 bg-black bg-opacity-30 rounded-lg p-2 space-y-0.5">
              <p>✨ <span class="text-blue-300 font-bold">{{ type.baseExp[0] }}-{{ type.baseExp[1] }} EXP</span></p>
              <p>💰 {{ type.baseGold[0] }}-{{ type.baseGold[1] }} Gold</p>
              <p class="text-purple-300 text-[10px] mt-1">× score bonus up to ×2.0</p>
            </div>
            <!-- EXP/hour estimate -->
            <p class="text-[10px] text-yellow-200 mt-2 opacity-70">
              ~{{ Math.round(((type.baseExp[0] + type.baseExp[1]) / 2 * 1.3) / type.cooldownMins * 60) }} EXP/hr (avg)
            </p>
          </div>
        </div>

        <!-- Score multiplier guide -->
        <div class="rounded-xl bg-black bg-opacity-30 border border-purple-700 p-3 mb-6 text-xs text-purple-300 grid grid-cols-4 gap-2">
          <div class="text-center"><p class="text-white font-bold">0-4</p><p>×1.0</p></div>
          <div class="text-center"><p class="text-green-300 font-bold">5-8</p><p>×1.3</p></div>
          <div class="text-center"><p class="text-yellow-300 font-bold">9-12</p><p>×1.6</p></div>
          <div class="text-center"><p class="text-orange-300 font-bold">13+</p><p>×2.0 🔥</p></div>
        </div>

        <button
          @click="startCountdown"
          :disabled="!canTrain"
          class="w-full py-4 rounded-xl font-black text-lg transition"
          :class="canTrain
            ? 'bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black hover:scale-105'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
        >
          🏋️ START TRAINING
        </button>
        <p class="text-center text-xs text-purple-400 mt-2 h-4">
          <template v-if="!selectedPet">Select a pet to train.</template>
          <template v-else-if="isOnCooldown(selectedPet.id)">Resting — {{ formatCooldown(petCooldowns[selectedPet.id]) }} left.</template>
          <template v-else-if="!selectedType">Select a training type.</template>
        </p>
      </div>

      <!-- ===== COUNTDOWN ===== -->
      <div v-else-if="gameState === 'countdown'" class="flex flex-col items-center justify-center py-20">
        <p class="text-6xl mb-4">{{ selectedPet?.species?.emoji }}</p>
        <p ref="countdownEl" class="text-9xl font-black text-yellow-300 leading-none">
          {{ countdownNum === 0 ? 'GO!' : countdownNum }}
        </p>
        <p class="text-xl text-purple-300 mt-4">{{ selectedType?.name }} — Ready!</p>
      </div>

      <!-- ===== PLAYING ===== -->
      <div v-else-if="gameState === 'playing'" class="select-none">
        <div class="flex items-center justify-between mb-3">
          <div class="bg-black bg-opacity-40 rounded-xl px-4 py-2 text-center min-w-20">
            <p class="text-xs text-purple-300">SCORE</p>
            <p ref="scoreEl" class="text-3xl font-black text-yellow-300">{{ score }}</p>
          </div>
          <div class="text-center">
            <p class="text-3xl">{{ selectedPet?.species?.emoji }}</p>
            <p class="text-xs text-purple-300">{{ selectedPet?.nickname || selectedPet?.species?.name }}</p>
          </div>
          <div class="bg-black bg-opacity-40 rounded-xl px-4 py-2 text-center min-w-20">
            <p class="text-xs text-purple-300">TIME</p>
            <p class="text-3xl font-black" :class="timeLeft <= 3 ? 'text-red-400' : 'text-white'">{{ timeLeft }}s</p>
          </div>
        </div>

        <div class="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div class="h-3 rounded-full transition-all duration-1000"
            :class="timeLeft <= 3 ? 'bg-red-500' : timeLeft <= 5 ? 'bg-orange-500' : 'bg-green-500'"
            :style="{ width: Math.max(0, timeLeft / (selectedType?.duration ?? 10) * 100) + '%' }"
          ></div>
        </div>

        <div ref="playAreaEl" class="relative w-full rounded-2xl border-2 border-purple-600 bg-black bg-opacity-50" style="height: 340px;">
          <p class="absolute inset-0 flex items-center justify-center text-purple-800 font-bold text-2xl pointer-events-none">TAP THE ORBS!</p>
          <div
            v-for="orb in activeOrbs"
            :key="orb.id"
            :ref="(el) => { if (el) orbEls.set(orb.id, el) }"
            @click.stop="clickOrb(orb.id)"
            class="absolute pointer-events-auto"
            :style="{ left: orb.x + '%', top: orb.y + '%', fontSize: orb.size + 'px', transform: 'translate(-50%, -50%)', cursor: 'pointer', lineHeight: '1', zIndex: 10 }"
          >{{ orb.emoji }}</div>
        </div>
        <p class="text-center text-xs text-purple-400 mt-2">Pop as many orbs as you can!</p>
      </div>

      <!-- ===== RESULTS ===== -->
      <div v-else-if="gameState === 'results'">
        <div ref="resultsCardEl" class="rounded-3xl border-2 border-green-400 bg-linear-to-br from-green-900 to-emerald-900 p-8 text-center">
          <p class="text-7xl mb-3">🏆</p>
          <h2 class="text-3xl font-black mb-1">Training Complete!</h2>
          <p class="text-green-200 text-sm mb-5">{{ selectedPet?.nickname || selectedPet?.species?.name }} {{ selectedPet?.species?.emoji }} worked hard!</p>

          <div class="bg-black bg-opacity-30 rounded-xl p-4 mb-5">
            <p class="text-4xl font-black mb-1">{{ score }} orbs</p>
            <p class="text-sm font-bold" :class="rewardMultiplier >= 2 ? 'text-orange-300' : rewardMultiplier >= 1.6 ? 'text-yellow-300' : rewardMultiplier >= 1.3 ? 'text-green-300' : 'text-slate-300'">
              {{ multiplierLabel }}
            </p>
            <p v-if="affectionExpBonus > 0" class="text-xs text-pink-300 mt-1">
              ❤️ +{{ Math.round(affectionExpBonus * 100) }}% EXP from affection
            </p>
          </div>

          <div class="flex justify-center gap-6 mb-4">
            <div ref="expRewardEl" class="bg-black bg-opacity-30 rounded-xl px-6 py-3">
              <p class="text-xs text-blue-300">EXP EARNED</p>
              <p class="text-3xl font-bold text-blue-300">+{{ earnedExp }}</p>
            </div>
            <div ref="goldRewardEl" class="bg-black bg-opacity-30 rounded-xl px-6 py-3">
              <p class="text-xs text-yellow-300">GOLD EARNED</p>
              <p class="text-3xl font-bold text-yellow-300">+{{ earnedGold }}</p>
            </div>
          </div>

          <p class="text-xs text-green-300 mb-6">⏱ Next {{ selectedType?.name }} in {{ selectedType?.cooldownMins }} minutes</p>

          <div class="flex gap-3 justify-center">
            <button @click="goToSelect" class="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition hover:scale-105">
              🏋️ Train Again
            </button>
            <NuxtLink to="/" class="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition hover:scale-105">
              🏰 Home
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

// Quick Drill has shortest CD → best for active grinding (more EXP/hour)
// Higher tiers give bigger single rewards for passive play
const trainingTypes = [
  { id: 'quick',     name: 'Quick Drill',        emoji: '⚡', duration: 8,  cooldownMins: 1.5, baseGold: [8, 15],   baseExp: [20, 35] },
  { id: 'sparring',  name: 'Sparring Match',      emoji: '🥊', duration: 12, cooldownMins: 4,   baseGold: [18, 35],  baseExp: [45, 70] },
  { id: 'intensive', name: 'Intensive Training',  emoji: '🏆', duration: 16, cooldownMins: 8,   baseGold: [40, 65],  baseExp: [95, 140] },
]

const gameState = ref('select')
const selectedPet = ref(null)
const selectedType = ref(null)
const petCooldowns = ref({})

const score = ref(0)
const timeLeft = ref(0)
const countdownNum = ref(3)
const earnedGold = ref(0)
const earnedExp = ref(0)
const activeOrbs = ref([])

const orbEls = new Map()
const orbTimelines = new Map()

const countdownEl = ref(null)
const scoreEl = ref(null)
const resultsCardEl = ref(null)
const goldRewardEl = ref(null)
const expRewardEl = ref(null)

let gameTimer = null
let spawnTimer = null

// Affection gives EXP bonus: 0-25=0%, 26-50=+10%, 51-75=+20%, 76-100=+35%
const affectionExpBonus = computed(() => {
  const aff = selectedPet.value?.affection ?? 0
  if (aff >= 76) return 0.35
  if (aff >= 51) return 0.20
  if (aff >= 26) return 0.10
  return 0
})

const isOnCooldown = (petId) => {
  const cd = petCooldowns.value[petId]
  return !!cd && cd.getTime() > Date.now()
}

const canTrain = computed(() =>
  !!selectedPet.value && !!selectedType.value && !isOnCooldown(selectedPet.value.id)
)

const rewardMultiplier = computed(() => {
  if (score.value >= 13) return 2.0
  if (score.value >= 9) return 1.6
  if (score.value >= 5) return 1.3
  return 1.0
})

const multiplierLabel = computed(() => {
  if (score.value >= 13) return '🔥 Legendary effort! ×2.0 bonus'
  if (score.value >= 9) return '⭐ Great job! ×1.6 bonus'
  if (score.value >= 5) return '👍 Nice work! ×1.3 bonus'
  return '💪 Aim for 5+ orbs next time!'
})

const formatCooldown = (date) => {
  if (!date) return ''
  const secs = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000))
  if (secs <= 0) return ''
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const selectPet = async (pet) => {
  selectedPet.value = pet
  if (!(pet.id in petCooldowns.value)) {
    const cd = await playerStore.getAbilityCooldown(pet.id, 'TRAINING')
    petCooldowns.value = { ...petCooldowns.value, [pet.id]: cd }
  }
}

const loadAllCooldowns = async () => {
  for (const pet of playerStore.pets) {
    const cd = await playerStore.getAbilityCooldown(pet.id, 'TRAINING')
    petCooldowns.value[pet.id] = cd
  }
}

const animateCountdown = async () => {
  await nextTick()
  if (!countdownEl.value) return
  gsap.fromTo(countdownEl.value, { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' })
}

const startCountdown = async () => {
  if (!canTrain.value) return
  gameState.value = 'countdown'
  countdownNum.value = 3
  await animateCountdown()
  const interval = setInterval(async () => {
    countdownNum.value--
    if (countdownNum.value < 0) { clearInterval(interval); startGame() }
    else await animateCountdown()
  }, 800)
}

const ORBS = ['✨', '⭐', '💫', '🌟', '⚡', '🔮', '💎', '🎯', '🌀', '🏅']

const startGame = () => {
  score.value = 0
  activeOrbs.value = []
  orbEls.clear()
  orbTimelines.forEach(t => t.kill())
  orbTimelines.clear()
  timeLeft.value = selectedType.value?.duration ?? 10
  gameState.value = 'playing'

  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endGame()
  }, 1000)

  const scheduleSpawn = () => {
    if (gameState.value !== 'playing') return
    spawnOrb()
    spawnTimer = setTimeout(scheduleSpawn, 600 + Math.random() * 500)
  }
  scheduleSpawn()
}

const spawnOrb = async () => {
  if (gameState.value !== 'playing') return
  const id = `o-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  activeOrbs.value.push({
    id, x: 6 + Math.random() * 82, y: 6 + Math.random() * 82,
    emoji: ORBS[Math.floor(Math.random() * ORBS.length)],
    size: 34 + Math.random() * 22,
  })
  await nextTick()
  const el = orbEls.get(id)
  if (!el) return
  const tl = gsap.timeline()
  tl.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(2.5)' })
    .to(el, { scale: 1.12, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  orbTimelines.set(id, tl)
  setTimeout(() => expireOrb(id), 1800 + Math.random() * 700)
}

const clickOrb = (id) => {
  if (gameState.value !== 'playing') return
  orbTimelines.get(id)?.kill()
  orbTimelines.delete(id)
  const el = orbEls.get(id)
  if (el) {
    gsap.to(el, {
      scale: 2.4, opacity: 0, duration: 0.22, ease: 'power2.out',
      onComplete: () => { activeOrbs.value = activeOrbs.value.filter(o => o.id !== id); orbEls.delete(id) },
    })
  } else {
    activeOrbs.value = activeOrbs.value.filter(o => o.id !== id)
  }
  score.value++
  if (scoreEl.value) {
    gsap.fromTo(scoreEl.value, { scale: 1.5, color: '#fb923c' }, { scale: 1, color: '#fde68a', duration: 0.3, ease: 'back.out(2)' })
  }
}

const expireOrb = (id) => {
  orbTimelines.get(id)?.kill()
  orbTimelines.delete(id)
  const el = orbEls.get(id)
  if (el) {
    gsap.to(el, { scale: 0, opacity: 0, duration: 0.18, onComplete: () => { activeOrbs.value = activeOrbs.value.filter(o => o.id !== id); orbEls.delete(id) } })
  } else {
    activeOrbs.value = activeOrbs.value.filter(o => o.id !== id)
  }
}

const endGame = async () => {
  if (gameTimer) { clearInterval(gameTimer); gameTimer = null }
  if (spawnTimer) { clearTimeout(spawnTimer); spawnTimer = null }
  orbTimelines.forEach(t => t.kill())
  orbTimelines.clear()
  activeOrbs.value = []

  const type = selectedType.value
  const mul = rewardMultiplier.value
  const affBonus = affectionExpBonus.value
  const rand = (r) => Math.floor(r[0] + Math.random() * (r[1] - r[0] + 1))

  // EXP is primary reward, gold is secondary
  earnedExp.value = Math.round(rand(type.baseExp) * mul * (1 + affBonus))
  earnedGold.value = Math.round(rand(type.baseGold) * mul)

  try {
    await playerStore.addGold(earnedGold.value)
    await playerStore.addExperience(selectedPet.value.id, earnedExp.value)
    const cdMs = type.cooldownMins * 60 * 1000
    await playerStore.setAbilityCooldown(selectedPet.value.id, 'TRAINING', cdMs)
    petCooldowns.value = { ...petCooldowns.value, [selectedPet.value.id]: new Date(Date.now() + cdMs) }
  } catch (e) { console.error('Training reward error:', e) }

  gameState.value = 'results'
  await nextTick()
  if (resultsCardEl.value) {
    gsap.fromTo(resultsCardEl.value, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' })
  }
  const rewardEls = [expRewardEl.value, goldRewardEl.value].filter(Boolean)
  if (rewardEls.length) {
    gsap.fromTo(rewardEls, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.15, delay: 0.35, ease: 'power2.out' })
  }
}

const goToSelect = () => {
  gameState.value = 'select'
  score.value = 0
  earnedGold.value = 0
  earnedExp.value = 0
  activeOrbs.value = []
}

onUnmounted(() => {
  if (gameTimer) clearInterval(gameTimer)
  if (spawnTimer) clearTimeout(spawnTimer)
  orbTimelines.forEach(t => t.kill())
})

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { await navigateTo('/login'); return }
  if (!playerStore.isInitialized) await playerStore.fetchPlayerProfile(user.id)
  await loadAllCooldowns()
  if (playerStore.activePet) await selectPet(playerStore.activePet)
})
</script>