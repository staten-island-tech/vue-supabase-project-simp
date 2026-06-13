<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white p-6">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
            ⚔️ Battle Arena
          </h1>
          <p class="text-purple-300 text-sm mt-1">Build a team of up to 3 pets and choose an arena!</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-center bg-black bg-opacity-30 px-5 py-2 rounded-xl border border-yellow-500">
            <p class="text-xs text-yellow-300">GOLD</p>
            <p class="text-2xl font-bold text-yellow-300">💰 {{ playerStore.goldBalance }}</p>
          </div>
          <NuxtLink to="/" class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 font-bold text-sm transition hover:scale-105">
            🏰 Home
          </NuxtLink>
        </div>
      </div>

      <!-- ============ SELECT SCREEN ============ -->
      <div v-if="battleState === 'select'">
        <!-- Team selection -->
        <h2 class="text-xl font-bold mb-1">1. Build your team (up to 3)</h2>
        <p class="text-xs text-purple-300 mb-3">Tap a pet to add/remove it from your battle team. Order matters — slot 1 fights first.</p>
        <div v-if="playerStore.pets.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400 mb-8">
          You don't have any pets yet. Hatch an egg first!
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div
            v-for="pet in playerStore.pets"
            :key="pet.id"
            @click="toggleTeamSlot(pet)"
            class="relative rounded-2xl border-2 p-3 text-center cursor-pointer transition hover:scale-105"
            :class="pet.team_slot
              ? 'border-cyan-400 bg-linear-to-br from-cyan-900 to-blue-900'
              : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-cyan-600'"
          >
            <span
              v-if="pet.team_slot"
              class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-cyan-400 text-black font-black text-xs flex items-center justify-center"
            >{{ pet.team_slot }}</span>
            <p class="text-4xl mb-1">{{ pet.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-xs truncate">{{ pet.nickname || pet.species?.name }}</p>
            <p class="text-xs text-slate-300">Lvl {{ pet.level }}</p>
            <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                class="h-1.5 rounded-full"
                :class="pet.current_hp > 0 ? 'bg-red-500' : 'bg-gray-500'"
                :style="{ width: (pet.current_hp / pet.max_hp * 100) + '%' }"
              ></div>
            </div>
            <p v-if="pet.current_hp <= 0" class="text-xs text-red-400 font-bold mt-1">Fainted</p>
          </div>
        </div>

        <!-- Arena selection -->
        <h2 class="text-xl font-bold mb-3">2. Choose an arena</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div
            v-for="arena in arenas"
            :key="arena.id"
            @click="isArenaUnlocked(arena) && (selectedArenaId = arena.id)"
            class="rounded-2xl border-2 p-5 text-center transition relative overflow-hidden"
            :class="[
              isArenaUnlocked(arena) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60',
              selectedArenaId === arena.id
                ? 'border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900'
                : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-yellow-600'
            ]"
          >
            <div v-if="!isArenaUnlocked(arena)" class="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-10">
              <p class="text-4xl mb-1">🔒</p>
              <p class="text-xs font-bold text-yellow-300">Unlocks at Trainer Lvl {{ arena.minTrainerLevel }}</p>
            </div>
            <p class="text-5xl mb-2">{{ arena.emoji }}</p>
            <h3 class="font-black text-lg">{{ arena.name }}</h3>
            <p class="text-xs text-slate-300 mb-2">{{ arena.difficulty }} • Lvl {{ arena.levelRange[0] }}-{{ arena.levelRange[1] }}</p>
            <div class="text-xs bg-black bg-opacity-30 rounded-lg p-2 space-y-1">
              <p>💰 {{ arena.rewardGold[0] }}-{{ arena.rewardGold[1] }} Gold</p>
              <p>✨ {{ arena.rewardExp[0] }}-{{ arena.rewardExp[1] }} EXP</p>
            </div>
          </div>
        </div>

        <button
          @click="startBattle"
          :disabled="!canStart"
          class="w-full py-4 rounded-xl font-black text-lg transition"
          :class="canStart
            ? 'bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black hover:scale-105'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'"
        >
          ⚔️ START BATTLE
        </button>
        <p v-if="!canStart" class="text-center text-xs text-purple-400 mt-2">
          Pick at least 1 healthy team member and an unlocked arena.
        </p>
      </div>

      <!-- ============ SWITCH SCREEN (fighter fainted, team has more) ============ -->
      <div v-else-if="battleState === 'switch'" class="text-center">
        <p class="text-2xl mb-4">😵 {{ fighter?.nickname || fighter?.species?.name }} fainted!</p>
        <p class="text-purple-300 mb-6">Choose your next fighter:</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
          <div
            v-for="pet in remainingTeam"
            :key="pet.id"
            @click="switchFighter(pet)"
            class="rounded-2xl border-2 border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900 p-3 text-center cursor-pointer hover:scale-105 transition"
          >
            <p class="text-4xl mb-1">{{ pet.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-xs truncate">{{ pet.nickname || pet.species?.name }}</p>
            <p class="text-xs text-slate-300">Lvl {{ pet.level }}</p>
          </div>
        </div>
      </div>

      <!-- ============ BATTLE SCREEN ============ -->
      <div v-else-if="battleState === 'fighting'">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Player pet -->
          <div ref="playerCardEl" class="rounded-2xl border-2 border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900 p-4 text-center relative overflow-hidden">
            <p ref="playerEmojiEl" class="text-5xl mb-1">{{ fighter?.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-sm truncate">{{ fighter?.nickname || fighter?.species?.name }}</p>
            <p class="text-xs text-cyan-300 mb-1">Lvl {{ fighter?.level }}</p>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-red-500 h-3 rounded-full transition-all duration-500" :style="{ width: Math.max(0, playerHp / playerMaxHp * 100) + '%' }"></div>
            </div>
            <p class="text-xs mt-1">{{ Math.max(0, Math.round(playerHp)) }} / {{ playerMaxHp }} HP</p>
            <div ref="playerDmgEl" class="absolute top-2 right-2 text-2xl font-black text-red-400 opacity-0 pointer-events-none"></div>
          </div>

          <!-- Enemy pet -->
          <div ref="enemyCardEl" class="rounded-2xl border-2 border-red-500 bg-linear-to-br from-red-900 to-orange-900 p-4 text-center relative overflow-hidden">
            <p ref="enemyEmojiEl" class="text-5xl mb-1">{{ enemy?.species?.emoji ?? '👾' }}</p>
            <p class="font-bold text-sm truncate">Wild {{ enemy?.species?.name }}</p>
            <p class="text-xs text-orange-300 mb-1">Lvl {{ enemy?.level }}</p>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-red-500 h-3 rounded-full transition-all duration-500" :style="{ width: Math.max(0, enemyHp / enemyMaxHp * 100) + '%' }"></div>
            </div>
            <p class="text-xs mt-1">{{ Math.max(0, Math.round(enemyHp)) }} / {{ enemyMaxHp }} HP</p>
            <div ref="enemyDmgEl" class="absolute top-2 right-2 text-2xl font-black text-red-400 opacity-0 pointer-events-none"></div>
          </div>
        </div>

        <!-- Team bench -->
        <div class="flex gap-2 mb-4">
          <div
            v-for="pet in team"
            :key="pet.id"
            class="rounded-lg border px-2 py-1 text-xs flex items-center gap-1"
            :class="pet.id === fighter?.id
              ? 'border-cyan-400 bg-cyan-900 bg-opacity-50'
              : (pet.current_hp ?? 0) <= 0 ? 'border-gray-600 bg-gray-800 opacity-50' : 'border-slate-600 bg-slate-800'"
          >
            <span>{{ pet.species?.emoji ?? '🐣' }}</span>
            <span>{{ Math.max(0, Math.round((pet.id === fighter?.id ? playerHp : pet.current_hp))) }}/{{ pet.max_hp }}</span>
          </div>
        </div>

        <!-- Battle log -->
        <div ref="logEl" class="rounded-2xl border border-purple-700 bg-black bg-opacity-40 p-4 h-40 overflow-y-auto mb-6 text-sm space-y-1">
          <p v-for="(line, idx) in battleLog" :key="idx" class="text-purple-100">{{ line }}</p>
        </div>

        <!-- Ability buttons -->
        <h3 class="font-bold mb-2">Choose your move:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="ability in fighterAbilities"
            :key="ability.id"
            @click="useAbility(ability)"
            :disabled="isProcessingTurn || isOnCooldown(ability)"
            class="rounded-xl border-2 p-3 text-left transition"
            :class="isProcessingTurn || isOnCooldown(ability)
              ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'border-cyan-500 bg-cyan-900 bg-opacity-40 hover:bg-opacity-70 hover:scale-105'"
          >
            <p class="font-bold text-sm">{{ ability.ability_name }}</p>
            <p class="text-xs text-cyan-300">PWR {{ effectivePower(ability, fighter) }} • ACC {{ ability.accuracy }}%</p>
            <p v-if="isOnCooldown(ability)" class="text-xs text-yellow-300 mt-1">
              ⏱ {{ cooldownLabel(ability) }}
            </p>
          </button>
        </div>
      </div>

      <!-- ============ RESULT SCREEN ============ -->
      <div v-else-if="battleState === 'result'" class="text-center">
        <div class="rounded-3xl border-2 p-10" :class="result?.won ? 'border-green-500 bg-linear-to-br from-green-900 to-emerald-900' : 'border-red-500 bg-linear-to-br from-red-900 to-slate-900'">
          <p class="text-7xl mb-4">{{ result?.won ? '🎉' : '😢' }}</p>
          <h2 class="text-3xl font-black mb-2">{{ result?.won ? 'Victory!' : 'Defeat...' }}</h2>
          <p class="text-lg mb-6">
            {{ result?.won ? 'Your team won the battle!' : 'Your team fought hard but lost.' }}
          </p>
          <div class="flex justify-center gap-4 mb-6">
            <div class="bg-black bg-opacity-30 rounded-xl px-6 py-3">
              <p class="text-xs text-yellow-300">GOLD EARNED</p>
              <p class="text-2xl font-bold text-yellow-300">+{{ result?.goldReward }}</p>
            </div>
            <div class="bg-black bg-opacity-30 rounded-xl px-6 py-3">
              <p class="text-xs text-blue-300">EXP EARNED</p>
              <p class="text-2xl font-bold text-blue-300">+{{ result?.expReward }}</p>
            </div>
          </div>
          <div class="flex gap-3 justify-center">
            <button @click="resetToSelect" class="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition hover:scale-105">
              ⚔️ Battle Again
            </button>
            <NuxtLink to="/" class="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold transition hover:scale-105">
              🏰 Back Home
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- ============ EVOLUTION MODAL ============ -->
      <div v-if="evolution" class="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4">
        <div ref="evoCardEl" class="rounded-3xl border-2 border-yellow-400 bg-linear-to-br from-yellow-900 to-purple-900 p-10 max-w-sm w-full text-center">
          <p class="text-lg font-bold text-yellow-300 mb-4">✨ Your pet is evolving! ✨</p>
          <div class="flex items-center justify-center gap-4 mb-4">
            <span class="text-6xl">{{ evolution.fromEmoji }}</span>
            <span class="text-3xl">➜</span>
            <span ref="evoToEmojiEl" class="text-7xl">{{ evolution.toEmoji }}</span>
          </div>
          <h2 class="text-2xl font-black mb-1">{{ evolution.from }} ➜ {{ evolution.to }}!</h2>
          <p class="text-yellow-200 text-sm mb-6">Stats boosted across the board!</p>
          <button @click="evolution = null" class="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg transition">
            🎉 Awesome!
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

// --- Arena definitions (level-gated by trainer level) ---
const arenas = [
  {
    id: 'training', name: 'Training Grounds', emoji: '🌱', difficulty: 'Easy',
    levelRange: [1, 5], rarityPool: ['common'], minTrainerLevel: 1,
    rewardGold: [30, 50], rewardExp: [20, 30], powerMul: 0.75,
  },
  {
    id: 'wild', name: 'Wild Frontier', emoji: '🌲', difficulty: 'Medium',
    levelRange: [5, 12], rarityPool: ['common', 'rare'], minTrainerLevel: 3,
    rewardGold: [60, 100], rewardExp: [40, 60], powerMul: 1.0,
  },
  {
    id: 'coliseum', name: "Champion's Coliseum", emoji: '🏛️', difficulty: 'Hard',
    levelRange: [10, 20], rarityPool: ['rare', 'epic', 'legendary'], minTrainerLevel: 6,
    rewardGold: [120, 180], rewardExp: [80, 120], powerMul: 1.35,
  },
]

const isArenaUnlocked = (arena: typeof arenas[0]) => playerStore.trainerLevel >= arena.minTrainerLevel

const battleState = ref<'select' | 'switch' | 'fighting' | 'result'>('select')
const selectedArenaId = ref<string | null>(null)
const selectedArena = computed(() => arenas.find(a => a.id === selectedArenaId.value) ?? null)

// --- Team ---
const team = computed(() =>
  playerStore.pets
    .filter(p => !!p.team_slot)
    .sort((a, b) => (a.team_slot ?? 0) - (b.team_slot ?? 0))
)

const toggleTeamSlot = async (pet: any) => {
  if (pet.team_slot) {
    await playerStore.setTeamSlot(pet.id, null)
    return
  }
  const used = new Set(team.value.map(p => p.team_slot))
  let nextSlot: number | null = null
  for (let s = 1; s <= 3; s++) {
    if (!used.has(s)) { nextSlot = s; break }
  }
  if (nextSlot === null) return // team full
  await playerStore.setTeamSlot(pet.id, nextSlot)
}

const canStart = computed(() =>
  team.value.length > 0 &&
  team.value.some(p => (p.current_hp ?? 0) > 0) &&
  !!selectedArena.value &&
  isArenaUnlocked(selectedArena.value)
)

// --- Battle runtime state ---
const fighter = ref<any>(null) // currently-fighting team member
const fighterAbilities = ref<any[]>([])
const cooldowns = ref<Record<string, Date | null>>({})

const enemy = ref<any>(null)
const playerHp = ref(0)
const playerMaxHp = ref(0)
const enemyHp = ref(0)
const enemyMaxHp = ref(0)
const battleLog = ref<string[]>([])
const isProcessingTurn = ref(false)
const result = ref<{ won: boolean; goldReward: number; expReward: number } | null>(null)
const evolution = ref<any>(null)

const logEl = ref<HTMLElement | null>(null)
const playerCardEl = ref<HTMLElement | null>(null)
const enemyCardEl = ref<HTMLElement | null>(null)
const playerEmojiEl = ref<HTMLElement | null>(null)
const enemyEmojiEl = ref<HTMLElement | null>(null)
const playerDmgEl = ref<HTMLElement | null>(null)
const enemyDmgEl = ref<HTMLElement | null>(null)
const evoCardEl = ref<HTMLElement | null>(null)
const evoToEmojiEl = ref<HTMLElement | null>(null)

const remainingTeam = computed(() =>
  team.value.filter(p => p.id !== fighter.value?.id && (p.current_hp ?? 0) > 0)
)

// --- Abilities for a given pet ---
const loadAbilitiesFor = async (pet: any) => {
  const { data, error } = await supabase
    .from('pet_abilities')
    .select('*')
    .eq('pet_species_id', pet.pet_species_id)
    .lte('learn_level', pet.level)
    .order('learn_level', { ascending: true })

  const abilities = error ? [] : (data ?? [])

  cooldowns.value = {}
  for (const ability of abilities) {
    cooldowns.value[ability.id] = await playerStore.getAbilityCooldown(pet.id, ability.id)
  }

  return abilities
}

const isOnCooldown = (ability: any) => {
  const until = cooldowns.value[ability.id]
  return !!until && until.getTime() > Date.now()
}

const cooldownLabel = (ability: any) => {
  const until = cooldowns.value[ability.id]
  if (!until) return ''
  const secs = Math.max(0, Math.ceil((until.getTime() - Date.now()) / 1000))
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Moves "upgrade" — each level above the level it was learned adds +4% power
const effectivePower = (ability: any, pet: any) => {
  const bonus = Math.max(0, (pet?.level ?? 1) - (ability.learn_level ?? 1)) * 0.04
  return Math.round(ability.power * (1 + bonus))
}

// --- Effective stat calculation (hunger/happiness/affection all matter) ---
const effectiveStats = (pet: any) => {
  const hunger = Math.max(0, Math.min(100, pet.hunger ?? 50))
  const happiness = Math.max(0, Math.min(100, pet.happiness ?? 50))
  const affection = Math.max(0, Math.min(100, pet.affection ?? 0))
  const hungerPct = hunger / 100
  const happyPct = happiness / 100
  const lvlMul = 1 + (pet.level ?? 1) * 0.03
  const affectionMul = 1 + (affection / 100) * 0.15 // up to +15% ATK from a bonded pet

  return {
    atk: Math.max(1, Math.round((pet.species?.base_attack ?? 10) * lvlMul * (0.6 + 0.4 * hungerPct) * affectionMul)),
    def: Math.max(1, Math.round((pet.species?.base_defense ?? 10) * lvlMul * (0.6 + 0.4 * hungerPct))),
    spd: Math.max(1, Math.round((pet.species?.base_speed ?? 10) * (0.7 + 0.3 * happyPct))),
  }
}

// --- Enemy generation ---
const generateEnemy = async (arena: typeof arenas[0]) => {
  const { data: species } = await supabase
    .from('pet_species')
    .select('*')
    .in('rarity', arena.rarityPool)

  const pool = species && species.length > 0 ? species : []
  const picked = pool[Math.floor(Math.random() * pool.length)]

  const level = Math.floor(
    arena.levelRange[0] + Math.random() * (arena.levelRange[1] - arena.levelRange[0] + 1)
  )

  const lvlMul = (1 + level * 0.03) * arena.powerMul
  const maxHp = Math.max(1, Math.round((picked?.base_hp ?? 50) * lvlMul))

  const { data: abilities } = await supabase
    .from('pet_abilities')
    .select('*')
    .eq('pet_species_id', picked?.id)
    .lte('learn_level', level)

  return {
    species: picked,
    level,
    maxHp,
    atk: Math.max(1, Math.round((picked?.base_attack ?? 10) * lvlMul)),
    def: Math.max(1, Math.round((picked?.base_defense ?? 10) * lvlMul)),
    spd: Math.max(1, Math.round((picked?.base_speed ?? 10) * lvlMul)),
    abilities: abilities && abilities.length > 0
      ? abilities
      : [{ id: 'struggle', ability_name: 'Struggle', power: 30, accuracy: 100, learn_level: 1 }],
  }
}

// --- Damage calculation ---
const calcDamage = (power: number, atk: number, def: number) => {
  const variance = 0.85 + Math.random() * 0.3
  return Math.max(1, Math.round((power / 10) * (atk / Math.max(1, def)) * variance))
}

const scrollLogToBottom = async () => {
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
}

const log = (line: string) => {
  battleLog.value.push(line)
  scrollLogToBottom()
}

// --- GSAP hit feedback: shake card + floating damage number ---
const playHitEffect = (side: 'player' | 'enemy', dmg: number | null) => {
  const card = side === 'player' ? playerCardEl.value : enemyCardEl.value
  const emoji = side === 'player' ? playerEmojiEl.value : enemyEmojiEl.value
  const dmgEl = side === 'player' ? playerDmgEl.value : enemyDmgEl.value

  if (card) {
    gsap.fromTo(card, { x: 0 }, {
      x: 10, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut',
      onComplete: () => gsap.set(card, { x: 0 }),
    })
  }
  if (emoji) {
    gsap.fromTo(emoji, { scale: 1 }, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' })
  }
  if (dmgEl && dmg !== null) {
    dmgEl.textContent = `-${dmg}`
    gsap.fromTo(dmgEl, { opacity: 1, y: 0, scale: 0.8 }, { opacity: 0, y: -30, scale: 1.3, duration: 0.8, ease: 'power1.out' })
  } else if (dmgEl) {
    dmgEl.textContent = 'MISS'
    gsap.fromTo(dmgEl, { opacity: 1, y: 0 }, { opacity: 0, y: -20, duration: 0.8, ease: 'power1.out' })
  }
}

// --- Pick first available fighter from team ---
const pickFirstFighter = () => {
  return team.value.find(p => (p.current_hp ?? 0) > 0) ?? null
}

// --- Start battle ---
const startBattle = async () => {
  if (!canStart.value || !selectedArena.value) return

  enemy.value = await generateEnemy(selectedArena.value)

  const first = pickFirstFighter()
  if (!first) return
  fighter.value = first
  fighterAbilities.value = await loadAbilitiesFor(first)

  playerMaxHp.value = first.max_hp
  playerHp.value = first.current_hp
  enemyMaxHp.value = enemy.value.maxHp
  enemyHp.value = enemy.value.maxHp

  battleLog.value = []
  log(`You sent out ${first.nickname || first.species?.name}!`)
  log(`A wild ${enemy.value.species?.name} (Lvl ${enemy.value.level}) appears!`)

  battleState.value = 'fighting'
}

const switchFighter = async (pet: any) => {
  fighter.value = pet
  fighterAbilities.value = await loadAbilitiesFor(pet)
  playerMaxHp.value = pet.max_hp
  playerHp.value = pet.current_hp
  log(`Go, ${pet.nickname || pet.species?.name}!`)
  battleState.value = 'fighting'
}

// --- Use ability (player turn, then enemy turn) ---
const useAbility = async (ability: any) => {
  if (!fighter.value || !enemy.value || isProcessingTurn.value) return
  isProcessingTurn.value = true

  const playerStats = effectiveStats(fighter.value)
  const enemyStats = { atk: enemy.value.atk, def: enemy.value.def, spd: enemy.value.spd }
  const playerPower = effectivePower(ability, fighter.value)

  const playerFirst = playerStats.spd >= enemyStats.spd

  const doPlayerMove = async () => {
    const hit = Math.random() * 100 <= ability.accuracy
    if (hit) {
      const dmg = calcDamage(playerPower, playerStats.atk, enemyStats.def)
      enemyHp.value = Math.max(0, enemyHp.value - dmg)
      playHitEffect('enemy', dmg)
      log(`${fighter.value!.nickname || fighter.value!.species?.name} used ${ability.ability_name}! Dealt ${dmg} damage.`)
    } else {
      playHitEffect('enemy', null)
      log(`${fighter.value!.nickname || fighter.value!.species?.name} used ${ability.ability_name}, but it missed!`)
    }

    // Shortened cooldown for tier-3+ moves: 45 seconds
    if (ability.learn_level >= 3 && ability.id !== 'struggle') {
      const cooldownMs = 45 * 1000
      cooldowns.value[ability.id] = new Date(Date.now() + cooldownMs)
      await playerStore.setAbilityCooldown(fighter.value!.id, ability.id, cooldownMs)
    }
  }

  const doEnemyMove = async () => {
    const enemyAbility = enemy.value.abilities[Math.floor(Math.random() * enemy.value.abilities.length)]
    const hit = Math.random() * 100 <= enemyAbility.accuracy
    if (hit) {
      const dmg = calcDamage(enemyAbility.power, enemyStats.atk, playerStats.def)
      playerHp.value = Math.max(0, playerHp.value - dmg)
      playHitEffect('player', dmg)
      log(`Wild ${enemy.value.species?.name} used ${enemyAbility.ability_name}! Dealt ${dmg} damage.`)
    } else {
      playHitEffect('player', null)
      log(`Wild ${enemy.value.species?.name} used ${enemyAbility.ability_name}, but it missed!`)
    }
  }

  await new Promise(r => setTimeout(r, 350))

  if (playerFirst) {
    await doPlayerMove()
    if (enemyHp.value <= 0) return finishBattle(true)
    await new Promise(r => setTimeout(r, 550))
    await doEnemyMove()
    if (playerHp.value <= 0) return handleFaint()
  } else {
    await doEnemyMove()
    if (playerHp.value <= 0) return handleFaint()
    await new Promise(r => setTimeout(r, 550))
    await doPlayerMove()
    if (enemyHp.value <= 0) return finishBattle(true)
  }

  isProcessingTurn.value = false
}

// --- Handle current fighter fainting ---
const handleFaint = async () => {
  // Persist 0 HP for this fighter
  fighter.value.current_hp = 0
  await supabase.from('user_pets').update({ current_hp: 0, updated_at: new Date().toISOString() }).eq('id', fighter.value.id)

  if (remainingTeam.value.length > 0) {
    battleState.value = 'switch'
    isProcessingTurn.value = false
  } else {
    await finishBattle(false)
  }
}

// --- Finish battle: persist results ---
const finishBattle = async (won: boolean) => {
  if (!fighter.value || !selectedArena.value || !enemy.value) return

  log(won ? `🎉 ${enemy.value.species?.name} fainted! You won!` : `😢 Your team has fainted! You lost...`)

  const arena = selectedArena.value
  const randInRange = (range: number[]) => Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1))

  const goldReward = won ? randInRange(arena.rewardGold) : Math.floor(arena.rewardGold[0] / 3)
  const expReward = won ? randInRange(arena.rewardExp) : Math.floor(arena.rewardExp[0] / 3)

  // Decay hunger/happiness on the fighter that finished the battle
  const newHunger = Math.max(5, (fighter.value.hunger ?? 50) - (8 + Math.floor(Math.random() * 8)))
  const newHappiness = Math.max(5, (fighter.value.happiness ?? 50) - (4 + Math.floor(Math.random() * 6)))
  const finalHp = Math.max(0, Math.round(playerHp.value))

  try {
    await supabase
      .from('user_pets')
      .update({
        current_hp: finalHp,
        hunger: newHunger,
        happiness: newHappiness,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fighter.value.id)

    fighter.value.current_hp = finalHp
    fighter.value.hunger = newHunger
    fighter.value.happiness = newHappiness

    await playerStore.addGold(goldReward)
    const evoResult = await playerStore.addExperience(fighter.value.id, expReward)

    if (won) {
      await playerStore.incrementChallengeProgress('BATTLE_WIN')
    }

    await supabase.from('battle_records').insert({
      challenger_id: playerStore.profile!.id,
      challenger_pet_id: fighter.value.id,
      opponent_species_id: enemy.value.species?.id ?? null,
      arena_difficulty: arena.id,
      player_won: won,
      winner_id: won ? playerStore.profile!.id : null,
      battle_log: JSON.stringify(battleLog.value),
      reward_gold: goldReward,
      reward_experience: expReward,
    })

    if (evoResult && (evoResult as any).evolved) {
      evolution.value = evoResult
      await nextTick()
      if (evoCardEl.value) {
        gsap.fromTo(evoCardEl.value, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' })
      }
      if (evoToEmojiEl.value) {
        gsap.fromTo(evoToEmojiEl.value, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.8, delay: 0.3, ease: 'elastic.out(1, 0.5)' })
      }
    }
  } catch (err) {
    console.error('Failed to save battle results', err)
  }

  result.value = { won, goldReward, expReward }
  isProcessingTurn.value = false
  battleState.value = 'result'
}

const resetToSelect = async () => {
  result.value = null
  enemy.value = null
  fighter.value = null
  battleLog.value = []
  battleState.value = 'select'

  if (playerStore.profile?.id) {
    await playerStore.fetchUserPets(playerStore.profile.id)
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    await navigateTo('/login')
    return
  }
  if (!playerStore.isInitialized) {
    await playerStore.fetchPlayerProfile(user.id)
  }
})
</script>