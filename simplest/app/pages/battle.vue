<template>
  <div class="min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-slate-900 text-white p-6">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
            ⚔️ Battle Arena
          </h1>
          <p class="text-purple-300 text-sm mt-1">Pick a pet, choose an arena, and fight!</p>
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
        <!-- Pet selection -->
        <h2 class="text-xl font-bold mb-3">1. Choose your fighter</h2>
        <div v-if="playerStore.pets.length === 0" class="rounded-2xl border border-dashed border-purple-600 p-8 text-center text-purple-400 mb-8">
          You don't have any pets yet. Hatch an egg first!
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div
            v-for="pet in playerStore.pets"
            :key="pet.id"
            @click="selectPet(pet.id)"
            class="rounded-2xl border-2 p-3 text-center cursor-pointer transition hover:scale-105"
            :class="selectedPetId === pet.id
              ? 'border-cyan-400 bg-linear-to-br from-cyan-900 to-blue-900'
              : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-cyan-600'"
          >
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

        <!-- Ability preview for selected pet -->
        <div v-if="selectedPet" class="mb-8 rounded-2xl border border-cyan-700 bg-black bg-opacity-30 p-4">
          <h3 class="font-bold mb-2 text-cyan-300">
            {{ selectedPet.nickname || selectedPet.species?.name }}'s Abilities
          </h3>
          <div v-if="loadingAbilities" class="text-sm text-cyan-200 animate-pulse">Loading abilities...</div>
          <div v-else-if="playerAbilities.length === 0" class="text-sm text-cyan-200">
            No abilities learned yet — level up to learn moves!
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="ability in playerAbilities"
              :key="ability.id"
              class="rounded-lg border border-cyan-600 bg-cyan-900 bg-opacity-30 p-2 text-xs"
            >
              <p class="font-bold">{{ ability.ability_name }}</p>
              <p class="text-cyan-300">PWR {{ ability.power }} • ACC {{ ability.accuracy }}%</p>
              <p v-if="ability.learn_level >= 3" class="text-yellow-300 mt-1">⏱ 3 min cooldown</p>
            </div>
          </div>
          <p v-if="selectedPet.current_hp <= 0" class="text-red-400 text-sm mt-3 font-bold">
            ⚠️ This pet has fainted! Feed it from your Inventory to restore HP before battling.
          </p>
        </div>

        <!-- Arena selection -->
        <h2 class="text-xl font-bold mb-3">2. Choose an arena</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div
            v-for="arena in arenas"
            :key="arena.id"
            @click="selectedArenaId = arena.id"
            class="rounded-2xl border-2 p-5 text-center cursor-pointer transition hover:scale-105"
            :class="selectedArenaId === arena.id
              ? 'border-yellow-400 bg-linear-to-br from-yellow-900 to-orange-900'
              : 'border-slate-600 bg-linear-to-br from-slate-800 to-slate-900 hover:border-yellow-600'"
          >
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
      </div>

      <!-- ============ BATTLE SCREEN ============ -->
      <div v-else-if="battleState === 'fighting'">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Player pet -->
          <div class="rounded-2xl border-2 border-cyan-500 bg-linear-to-br from-cyan-900 to-blue-900 p-4 text-center">
            <p class="text-5xl mb-1">{{ selectedPet?.species?.emoji ?? '🐣' }}</p>
            <p class="font-bold text-sm truncate">{{ selectedPet?.nickname || selectedPet?.species?.name }}</p>
            <p class="text-xs text-cyan-300 mb-1">Lvl {{ selectedPet?.level }}</p>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-red-500 h-3 rounded-full transition-all duration-500" :style="{ width: Math.max(0, playerHp / playerMaxHp * 100) + '%' }"></div>
            </div>
            <p class="text-xs mt-1">{{ Math.max(0, Math.round(playerHp)) }} / {{ playerMaxHp }} HP</p>
          </div>

          <!-- Enemy pet -->
          <div class="rounded-2xl border-2 border-red-500 bg-linear-to-br from-red-900 to-orange-900 p-4 text-center">
            <p class="text-5xl mb-1">{{ enemy?.species?.emoji ?? '👾' }}</p>
            <p class="font-bold text-sm truncate">Wild {{ enemy?.species?.name }}</p>
            <p class="text-xs text-orange-300 mb-1">Lvl {{ enemy?.level }}</p>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-red-500 h-3 rounded-full transition-all duration-500" :style="{ width: Math.max(0, enemyHp / enemyMaxHp * 100) + '%' }"></div>
            </div>
            <p class="text-xs mt-1">{{ Math.max(0, Math.round(enemyHp)) }} / {{ enemyMaxHp }} HP</p>
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
            v-for="ability in playerAbilities"
            :key="ability.id"
            @click="useAbility(ability)"
            :disabled="isProcessingTurn || isOnCooldown(ability)"
            class="rounded-xl border-2 p-3 text-left transition"
            :class="isProcessingTurn || isOnCooldown(ability)
              ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'border-cyan-500 bg-cyan-900 bg-opacity-40 hover:bg-opacity-70 hover:scale-105'"
          >
            <p class="font-bold text-sm">{{ ability.ability_name }}</p>
            <p class="text-xs text-cyan-300">PWR {{ ability.power }} • ACC {{ ability.accuracy }}%</p>
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
            {{ result?.won ? `Your ${selectedPet?.species?.name} won the battle!` : `Your ${selectedPet?.species?.name} fought hard but lost.` }}
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { usePlayerStore } from '../store/player'

definePageMeta({ auth: true })

const supabase = useSupabaseClient()
const playerStore = usePlayerStore()

// --- Arena definitions ---
const arenas = [
  {
    id: 'training', name: 'Training Grounds', emoji: '🌱', difficulty: 'Easy',
    levelRange: [1, 5], rarityPool: ['common'],
    rewardGold: [30, 50], rewardExp: [20, 30], powerMul: 0.75,
  },
  {
    id: 'wild', name: 'Wild Frontier', emoji: '🌲', difficulty: 'Medium',
    levelRange: [5, 12], rarityPool: ['common', 'rare'],
    rewardGold: [60, 100], rewardExp: [40, 60], powerMul: 1.0,
  },
  {
    id: 'coliseum', name: "Champion's Coliseum", emoji: '🏛️', difficulty: 'Hard',
    levelRange: [10, 20], rarityPool: ['rare', 'epic', 'legendary'],
    rewardGold: [120, 180], rewardExp: [80, 120], powerMul: 1.35,
  },
]

const battleState = ref<'select' | 'fighting' | 'result'>('select')
const selectedPetId = ref<string | null>(null)
const selectedArenaId = ref<string | null>(null)
const playerAbilities = ref<any[]>([])
const loadingAbilities = ref(false)
const cooldowns = ref<Record<string, Date | null>>({})

const selectedPet = computed(() => playerStore.pets.find(p => p.id === selectedPetId.value) ?? null)
const selectedArena = computed(() => arenas.find(a => a.id === selectedArenaId.value) ?? null)

const canStart = computed(() =>
  !!selectedPet.value &&
  !!selectedArena.value &&
  (selectedPet.value.current_hp ?? 0) > 0 &&
  playerAbilities.value.length > 0
)

// --- Battle runtime state ---
const enemy = ref<any>(null)
const playerHp = ref(0)
const playerMaxHp = ref(0)
const enemyHp = ref(0)
const enemyMaxHp = ref(0)
const battleLog = ref<string[]>([])
const isProcessingTurn = ref(false)
const result = ref<{ won: boolean; goldReward: number; expReward: number } | null>(null)
const logEl = ref<HTMLElement | null>(null)

// --- Pet selection ---
const selectPet = async (petId: string) => {
  selectedPetId.value = petId
  await loadAbilitiesForSelectedPet()
}

const loadAbilitiesForSelectedPet = async () => {
  if (!selectedPet.value) return
  loadingAbilities.value = true
  try {
    const { data, error } = await supabase
      .from('pet_abilities')
      .select('*')
      .eq('pet_species_id', selectedPet.value.pet_species_id)
      .lte('learn_level', selectedPet.value.level)
      .order('learn_level', { ascending: true })

    if (error) throw error
    playerAbilities.value = data ?? []

    // Load cooldowns for each ability
    cooldowns.value = {}
    for (const ability of playerAbilities.value) {
      const cd = await playerStore.getAbilityCooldown(selectedPet.value.id, ability.id)
      cooldowns.value[ability.id] = cd
    }
  } catch (err) {
    playerAbilities.value = []
  } finally {
    loadingAbilities.value = false
  }
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

// --- Effective stat calculation (mirrors decay-aware battle formula) ---
const effectiveStats = (pet: any) => {
  const hunger = Math.max(0, Math.min(100, pet.hunger ?? 50))
  const happiness = Math.max(0, Math.min(100, pet.happiness ?? 50))
  const hungerPct = hunger / 100
  const happyPct = happiness / 100
  const lvlMul = 1 + (pet.level ?? 1) * 0.03

  return {
    atk: Math.max(1, Math.round((pet.species?.base_attack ?? 10) * lvlMul * (0.6 + 0.4 * hungerPct))),
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
  const variance = 0.85 + Math.random() * 0.3 // 0.85 - 1.15
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

// --- Start battle ---
const startBattle = async () => {
  if (!canStart.value || !selectedPet.value || !selectedArena.value) return

  enemy.value = await generateEnemy(selectedArena.value)

  playerMaxHp.value = selectedPet.value.max_hp
  playerHp.value = selectedPet.value.current_hp
  enemyMaxHp.value = enemy.value.maxHp
  enemyHp.value = enemy.value.maxHp

  battleLog.value = []
  log(`A wild ${enemy.value.species?.name} (Lvl ${enemy.value.level}) appears!`)

  battleState.value = 'fighting'
}

// --- Use ability (player turn, then enemy turn) ---
const useAbility = async (ability: any) => {
  if (!selectedPet.value || !enemy.value || isProcessingTurn.value) return
  isProcessingTurn.value = true

  const playerStats = effectiveStats(selectedPet.value)
  const enemyStats = { atk: enemy.value.atk, def: enemy.value.def, spd: enemy.value.spd }

  const playerFirst = playerStats.spd >= enemyStats.spd

  const doPlayerMove = async () => {
    const hit = Math.random() * 100 <= ability.accuracy
    if (hit) {
      const dmg = calcDamage(ability.power, playerStats.atk, enemyStats.def)
      enemyHp.value = Math.max(0, enemyHp.value - dmg)
      log(`${selectedPet.value!.nickname || selectedPet.value!.species?.name} used ${ability.ability_name}! Dealt ${dmg} damage.`)
    } else {
      log(`${selectedPet.value!.nickname || selectedPet.value!.species?.name} used ${ability.ability_name}, but it missed!`)
    }

    // Apply cooldown for strong (learn_level >= 3) abilities
    if (ability.learn_level >= 3 && ability.id !== 'struggle') {
      const cooldownMs = 3 * 60 * 1000
      cooldowns.value[ability.id] = new Date(Date.now() + cooldownMs)
      await playerStore.setAbilityCooldown(selectedPet.value!.id, ability.id, cooldownMs)
    }
  }

  const doEnemyMove = async () => {
    const enemyAbility = enemy.value.abilities[Math.floor(Math.random() * enemy.value.abilities.length)]
    const hit = Math.random() * 100 <= enemyAbility.accuracy
    if (hit) {
      const dmg = calcDamage(enemyAbility.power, enemyStats.atk, playerStats.def)
      playerHp.value = Math.max(0, playerHp.value - dmg)
      log(`Wild ${enemy.value.species?.name} used ${enemyAbility.ability_name}! Dealt ${dmg} damage.`)
    } else {
      log(`Wild ${enemy.value.species?.name} used ${enemyAbility.ability_name}, but it missed!`)
    }
  }

  await new Promise(r => setTimeout(r, 400))

  if (playerFirst) {
    await doPlayerMove()
    if (enemyHp.value <= 0) return finishBattle(true)
    await new Promise(r => setTimeout(r, 600))
    await doEnemyMove()
    if (playerHp.value <= 0) return finishBattle(false)
  } else {
    await doEnemyMove()
    if (playerHp.value <= 0) return finishBattle(false)
    await new Promise(r => setTimeout(r, 600))
    await doPlayerMove()
    if (enemyHp.value <= 0) return finishBattle(true)
  }

  isProcessingTurn.value = false
}

// --- Finish battle: persist results ---
const finishBattle = async (won: boolean) => {
  if (!selectedPet.value || !selectedArena.value || !enemy.value) return

  log(won ? `🎉 ${enemy.value.species?.name} fainted! You won!` : `😢 ${selectedPet.value.nickname || selectedPet.value.species?.name} fainted! You lost...`)

  const arena = selectedArena.value
  const randInRange = (range: number[]) => Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1))

  const goldReward = won ? randInRange(arena.rewardGold) : Math.floor(arena.rewardGold[0] / 3)
  const expReward = won ? randInRange(arena.rewardExp) : Math.floor(arena.rewardExp[0] / 3)

  // Decay hunger/happiness a bit from the fight
  const newHunger = Math.max(5, (selectedPet.value.hunger ?? 50) - (8 + Math.floor(Math.random() * 8)))
  const newHappiness = Math.max(5, (selectedPet.value.happiness ?? 50) - (4 + Math.floor(Math.random() * 6)))
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
      .eq('id', selectedPet.value.id)

    // Reflect locally
    selectedPet.value.current_hp = finalHp
    selectedPet.value.hunger = newHunger
    selectedPet.value.happiness = newHappiness

    await playerStore.addGold(goldReward)
    await playerStore.addExperience(selectedPet.value.id, expReward)

    if (won) {
      await playerStore.incrementChallengeProgress('BATTLE_WIN')
    }

    await supabase.from('battle_records').insert({
      challenger_id: playerStore.profile!.id,
      challenger_pet_id: selectedPet.value.id,
      opponent_species_id: enemy.value.species?.id ?? null,
      arena_difficulty: arena.id,
      player_won: won,
      winner_id: won ? playerStore.profile!.id : null,
      battle_log: JSON.stringify(battleLog.value),
      reward_gold: goldReward,
      reward_experience: expReward,
    })
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
  battleLog.value = []
  battleState.value = 'select'

  // Refresh pet data (HP/hunger/happiness/level may have changed)
  if (playerStore.profile?.id) {
    await playerStore.fetchUserPets(playerStore.profile.id)
  }
  if (selectedPetId.value) {
    await loadAbilitiesForSelectedPet()
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
  if (playerStore.activePet) {
    await selectPet(playerStore.activePet.id)
  }
})
</script>