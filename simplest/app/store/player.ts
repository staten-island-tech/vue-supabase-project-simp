import { defineStore } from 'pinia'
import type {
  UserProfile,
  UserPet,
  PetSpecies,
  PetAbility,
} from '../types/database.types'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    profile: null as (UserProfile & Record<string, any>) | null,
    activePet: null as (UserPet & { species?: PetSpecies | null; abilities?: PetAbility[] | null }) | null,
    pets: [] as (UserPet & { species?: PetSpecies })[] | [],
    dailyProgress: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isInitialized: (state) => !!state.profile,
    petCollection: (state) => state.pets,
    activePetLevel: (state) => state.activePet?.level ?? 0,
    activePetName: (state) => state.activePet?.nickname || state.activePet?.species?.name || 'Unknown',
    goldBalance: (state) => Number(state.profile?.coins ?? 0),
    trainerLevel: (state) => state.profile?.level ?? 1,
    nextLevelExp: (state) => {
      const level = state.profile?.level ?? 1
      return level * 100
    },
    dailyChallengesCompleted: (state) => state.dailyProgress.filter(d => d.completed).length,
  },

  actions: {
    async initializeNewPlayer(userId: string, email: string, trainerName: string) {
      const supabase = useSupabaseClient()

      try {
        this.loading = true
        this.error = null

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            username: trainerName,
            full_name: trainerName,
            trainer_name: trainerName,
            level: 1,
            experience: 0,
            coins: 500,
            total_pets_owned: 0,
            active_pet_id: null,
          }, { onConflict: 'id' })

        if (profileError) throw profileError

        await this.fetchPlayerProfile(userId)
        await this.giveStarterPets(userId)
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPlayerProfile(userId: string) {
      const supabase = useSupabaseClient()

      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error

        this.profile = data as any

        await this.fetchUserPets(userId)
        await this.fetchDailyProgress(userId)
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchUserPets(userId: string) {
      const supabase = useSupabaseClient()
      // apply decay before loading pets
const { error: decayError } = await supabase
  .rpc('apply_pet_decay', { p_user_id: userId });

if (decayError) throw decayError;
      try {
        const { data, error } = await supabase
          .from('user_pets')
          .select('*, pet_species(*)')
          .eq('user_id', userId)

        if (error) throw error

        const rows = (data ?? []) as any[]

        this.pets = rows.map((p) => ({
          ...p,
          species: p.pet_species ?? null,
        }))

        const activeId = this.profile?.active_pet_id

        if (activeId) {
          this.activePet = (this.pets.find((p) => p.id === activeId) ?? null) as any
        } else if (this.pets.length > 0) {
          this.activePet = this.pets[0] as any
          await this.setActivePet(this.pets[0].id)
        } else {
          this.activePet = null
        }
      } catch (err: any) {
        this.error = err.message
      }
    },

    // Fetch today's challenge progress, creating rows if they don't exist yet.
    // Includes action_key + target_count so we can match actions -> challenges.
    async fetchDailyProgress(userId: string) {
      const supabase = useSupabaseClient()
      const today = new Date().toISOString().split('T')[0]

      const selectQuery = `
        id,
        user_id,
        challenge_id,
        progress,
        completed,
        date,
        daily_challenges (
          name,
          reward_gold,
          reward_experience,
          target_count,
          action_key
        )
      `

      try {
        const { data, error } = await supabase
          .from('user_daily_progress')
          .select(selectQuery)
          .eq('user_id', userId)
          .eq('date', today)

        if (error) throw error

        let rows = data || []

        if (rows.length === 0) {
          await this.createDailyProgress(userId)

          const { data: retry } = await supabase
            .from('user_daily_progress')
            .select(selectQuery)
            .eq('user_id', userId)
            .eq('date', today)

          rows = retry || []
        }

        this.dailyProgress = rows.map((row: any) => ({
          id: row.id,
          challenge_id: row.challenge_id,
          progress: row.progress,
          completed: row.completed,
          date: row.date,
          title: row.daily_challenges?.name ?? '',
          reward_gold: row.daily_challenges?.reward_gold ?? 0,
          reward_experience: row.daily_challenges?.reward_experience ?? 0,
          target_count: row.daily_challenges?.target_count ?? 1,
          action_key: row.daily_challenges?.action_key ?? null,
        }))
      } catch (err: any) {
        this.error = err.message
      }
    },

    async createDailyProgress(userId: string) {
      const supabase = useSupabaseClient()
      const today = new Date().toISOString().split('T')[0]

      const { data: challenges } = await supabase
        .from('daily_challenges')
        .select('*')

      if (!challenges) return

      const rows = challenges.map((c) => ({
        user_id: userId,
        challenge_id: c.id,
        date: today,
        progress: 0,
        completed: false,
      }))

      await supabase.from('user_daily_progress').insert(rows)
    },

    // Call this whenever the player does something that might count toward
    // a daily challenge (feeding, battling, leveling up, summoning, logging in).
    // actionKey must match daily_challenges.action_key (e.g. 'FEED_PET').
    async incrementChallengeProgress(actionKey: string, amount = 1) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const entry = this.dailyProgress.find(
          (d) => d.action_key === actionKey && !d.completed
        )
        if (!entry) return

        const newProgress = Math.min(entry.target_count, entry.progress + amount)
        const justCompleted = newProgress >= entry.target_count

        const { error } = await supabase
          .from('user_daily_progress')
          .update({
            progress: newProgress,
            completed: justCompleted,
            completed_at: justCompleted ? new Date().toISOString() : null,
          })
          .eq('id', entry.id)

        if (error) throw error

        entry.progress = newProgress
        entry.completed = justCompleted

        if (justCompleted) {
          await this.addGold(entry.reward_gold)
          if (this.activePet) {
            await this.addExperience(this.activePet.id, entry.reward_experience)
          }
        }

        return justCompleted
      } catch (err: any) {
        this.error = err.message
        return false
      }
    },

    async giveStarterPets(userId: string) {
      const supabase = useSupabaseClient()

      try {
        const { count: existingPetCount, error: countError } = await supabase
          .from('user_pets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (countError) throw countError
        if ((existingPetCount ?? 0) > 0) return

        const { data: species, error: speciesError } = await supabase
          .from('pet_species')
          .select('*')
          .eq('name', 'Mystic Kitten')
          .single()

        if (speciesError) throw speciesError
        if (!species) return

        const { error: petError } = await supabase
          .from('user_pets')
          .insert({
            user_id: userId,
            pet_species_id: species.id,
            level: 1,
            experience: 0,
            current_hp: species.base_hp,
            max_hp: species.base_hp,
            hunger: 30,
            happiness: 80,
            affection: 50,
            nickname: 'Starter Buddy',
          })

        if (petError) throw petError

        await this.fetchUserPets(userId)

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ total_pets_owned: this.pets.length })
          .eq('id', userId)

        if (profileError) throw profileError
      } catch (err: any) {
        this.error = err.message
      }
    },

    async setActivePet(petId: string) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const { error } = await supabase
          .from('profiles')
          .update({ active_pet_id: petId })
          .eq('id', this.profile.id)

        if (error) throw error

        this.activePet = this.pets.find(p => p.id === petId) || null
        if (this.profile) this.profile.active_pet_id = petId
      } catch (err: any) {
        this.error = err.message
      }
    },

    async feedPet(petId: string) {
      const supabase = useSupabaseClient()

      try {
        const pet = this.pets.find(p => p.id === petId)
        if (!pet) return

        const newHunger = Math.max(0, pet.hunger - 40)
        const newHappiness = Math.min(100, pet.happiness + 15)

        const { error } = await supabase
          .from('user_pets')
          .update({
            hunger: newHunger,
            happiness: newHappiness,
          })
          .eq('id', petId)

        if (error) throw error

        pet.hunger = newHunger
        pet.happiness = newHappiness

        await this.addGold(10)
        await this.incrementChallengeProgress('FEED_PET')
      } catch (err: any) {
        this.error = err.message
      }
    },

    async addExperience(petId: string, amount: number) {
      const supabase = useSupabaseClient()

      try {
        const pet = this.pets.find(p => p.id === petId)
        if (!pet || !this.profile) return

        const originalLevel = pet.level

        let newExp = pet.experience + amount
        let newLevel = pet.level
        const expPerLevel = 100

        while (newExp >= expPerLevel) {
          newExp -= expPerLevel
          newLevel += 1
        }

        const { error } = await supabase
          .from('user_pets')
          .update({
            experience: newExp,
            level: newLevel,
          })
          .eq('id', petId)

        if (error) throw error

        pet.experience = newExp
        pet.level = newLevel

        let playerExp = (this.profile.experience ?? 0) + Math.floor(amount / 2)
        let playerLevel = this.profile.level ?? 1

        while (playerExp >= this.nextLevelExp) {
          playerExp -= this.nextLevelExp
          playerLevel += 1
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            experience: playerExp,
            level: playerLevel,
          })
          .eq('id', this.profile.id)

        if (profileError) throw profileError

        this.profile.experience = playerExp
        this.profile.level = playerLevel

        // If the pet leveled up, count it toward the "Level Up" daily challenge.
        if (newLevel > originalLevel) {
          await this.incrementChallengeProgress('LEVEL_UP')
        }
      } catch (err: any) {
        this.error = err.message
      }
    },

    async addGold(amount: number) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const newCoins = Math.max(0, Number(this.profile.coins ?? 0) + amount)

        const { error } = await supabase
          .from('profiles')
          .update({ coins: newCoins })
          .eq('id', this.profile.id)

        if (error) throw error

        this.profile.coins = newCoins
      } catch (err: any) {
        this.error = err.message
      }
    },

    async claimDailyLoginReward() {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return null

        const now = new Date()

        const lastClaim = this.profile.last_daily_claim
          ? new Date(this.profile.last_daily_claim)
          : null

        if (lastClaim && lastClaim.toDateString() === now.toDateString()) {
          return null
        }

        let streak = this.profile.daily_streak || 0

        if (lastClaim) {
          const diffDays = Math.floor(
            (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24)
          )
          streak = diffDays === 1 ? streak + 1 : 1
        } else {
          streak = 1
        }

        const reward = 100 + (streak * 25)

        const { error } = await supabase
          .from('profiles')
          .update({
            coins: Number(this.profile.coins) + reward,
            daily_streak: streak,
            last_daily_claim: now.toISOString(),
          })
          .eq('id', this.profile.id)

        if (error) throw error

        this.profile.coins += reward
        this.profile.daily_streak = streak
        this.profile.last_daily_claim = now.toISOString()

        // Also progress the "Daily Login" challenge
        await this.incrementChallengeProgress('LOGIN')

        return reward
      } catch (err: any) {
        this.error = err.message
        return null
      }
    },
    async fetchActivePetAbilities() {
  const supabase = useSupabaseClient()
  if (!this.activePet?.pet_species_id) return []

  const { data, error } = await supabase
    .from('pet_abilities')
    .select('*')
    .eq('pet_species_id', this.activePet.pet_species_id)
    .order('learn_level', { ascending: true })

  if (error) throw error
  return data ?? []
},
async getAbilityCooldown(abilityKey: string) {
  const supabase = useSupabaseClient()
  if (!this.profile || !this.activePet) return null

  const { data, error } = await supabase
    .from('user_pet_ability_cooldowns')
    .select('cooldown_until')
    .eq('user_id', this.profile.id)
    .eq('pet_id', this.activePet.id)
    .eq('ability_key', abilityKey)
    .single()

  if (error && error.code !== 'PGRST116') throw error // single() no row
  return data?.cooldown_until ? new Date(data.cooldown_until) : null
},

async setAbilityCooldown(abilityKey: string, cooldownMs: number) {
  const supabase = useSupabaseClient()
  if (!this.profile || !this.activePet) return

  const now = new Date()
  const cooldownUntil = new Date(now.getTime() + cooldownMs)

  const { error } = await supabase
    .from('user_pet_ability_cooldowns')
    .upsert({
      user_id: this.profile.id,
      pet_id: this.activePet.id,
      ability_key: abilityKey,
      cooldown_until: cooldownUntil.toISOString(),
      updated_at: now.toISOString(),
    })

  if (error) throw error
},

  },
})