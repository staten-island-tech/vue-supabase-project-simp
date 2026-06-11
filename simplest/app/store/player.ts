import { defineStore } from 'pinia'
import type {
  UserProfile,
  UserPet,
  PetSpecies,
  PetAbility,
  UserDailyProgress,
  DailyChallenge
} from '../types/database.types'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    profile: null as (UserProfile & Record<string, any>) | null,
    activePet: null as (UserPet & { species?: PetSpecies | null; abilities?: PetAbility[] | null }) | null,
    pets: [] as (UserPet & { species?: PetSpecies })[] | [],
    dailyProgress: [] as UserDailyProgress[] | [],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isInitialized: (state) => !!state.profile,
    petCollection: (state) => state.pets,
    activePetLevel: (state) => state.activePet?.level ?? 0,
    activePetName: (state) => state.activePet?.nickname || state.activePet?.species?.name || 'Unknown',

    // ✅ DB uses "coins" not "gold"
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

        // Create user profile in canonical table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            trainer_name: trainerName,
            level: 1,
            experience: 0,
            coins: 500, // starting gold
            total_pets_owned: 1,
            active_pet_id: null,
          })

        if (profileError) throw profileError

        await this.fetchPlayerProfile(userId)
        await this.giveStarterPets(userId)

        this.loading = false
      } catch (err: any) {
        this.error = err.message
        this.loading = false
        throw err
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

  try {
    const { data, error } = await supabase
      .from('user_pets')
      .select('*, pet_species(*)')
      .eq('user_id', userId)

    if (error) throw error

    const pets = (data ?? []) as any[]
    this.pets = pets

    const activeId = this.profile?.active_pet_id

    if (activeId) {
      this.activePet = (pets.find(p => p.id === activeId) ?? null) as any
    } else if (pets.length > 0) {
      this.activePet = pets[0] as any
      await this.setActivePet(pets[0].id)
    } else {
      this.activePet = null
    }
  } catch (err: any) {
    this.error = err.message
  }
},
    async fetchDailyProgress(userId: string) {
      const supabase = useSupabaseClient()
      const today = new Date().toISOString().split('T')[0]

      try {
        const { data, error } = await supabase
          .from('user_daily_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)

        if (error) throw error

        this.dailyProgress = (data || []) as any
      } catch (err: any) {
        this.error = err.message
      }
    },

    async giveStarterPets(userId: string) {
      const supabase = useSupabaseClient()

      try {
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

        // Keep counters in sync (optional, but aligns with your earlier logic)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_pets_owned: this.pets.length, // after refresh this should include new pet
          })
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
      } catch (err: any) {
        this.error = err.message
      }
    },

    async addExperience(petId: string, amount: number) {
      const supabase = useSupabaseClient()

      try {
        const pet = this.pets.find(p => p.id === petId)
        if (!pet || !this.profile) return

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

        // Give player experience too (same model as before)
        let playerExp = this.profile.experience + Math.floor(amount / 2)
        let playerLevel = this.profile.level

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
      } catch (err: any) {
        this.error = err.message
      }
    },

    async addGold(amount: number) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const newCoins = Number(this.profile.coins ?? 0) + amount

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

    async summonPet() {
  const supabase = useSupabaseClient()

  try {
    // Must have an authenticated session; RLS uses auth.uid()
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
    if (sessionErr) throw sessionErr
    const authUserId = sessionData?.session?.user?.id
    if (!authUserId) throw new Error('Not authenticated')

    // Keep your existing guard, but don't trust it for user_id
    if (!this.profile) return null

    const roll = Math.random()
    let rarity: 'common' | 'rare' | 'epic' | 'legendary'

    if (roll < 0.6) rarity = 'common'
    else if (roll < 0.9) rarity = 'rare'
    else if (roll < 0.98) rarity = 'epic'
    else rarity = 'legendary'

    const { data: petSpecies, error: speciesError } = await supabase
      .from('pet_species')
      .select('*')
      .eq('rarity', rarity)
      .limit(1)
      .single()

    if (speciesError) throw speciesError
    if (!petSpecies) return null

    const costInGold =
      rarity === 'legendary' ? 1000 :
      rarity === 'epic' ? 500 :
      100

    // Ensure you have enough gold (use authUserId profile row)
    const currentGold = Number(this.profile.coins ?? 0)
    if (currentGold < costInGold) throw new Error('Not enough gold to summon')

    // IMPORTANT: deduct coins for the authenticated user id
    // (so this method is consistent even if store profile is stale)
    {
      const { error: goldErr } = await supabase
        .from('profiles')
        .update({ coins: currentGold - costInGold })
        .eq('id', authUserId)

      if (goldErr) throw goldErr

      this.profile.coins = currentGold - costInGold
    }

    // ✅ RLS-safe insert: user_id must equal auth.uid()
    const { error: petError } = await supabase
      .from('user_pets')
      .insert({
        user_id: authUserId,
        pet_species_id: petSpecies.id,
        level: 1,
        experience: 0,
        current_hp: petSpecies.base_hp,
        max_hp: petSpecies.base_hp,
        hunger: 50,
        happiness: 70,
        affection: 0,
      })

    if (petError) throw petError

    await this.fetchUserPets(authUserId)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ total_pets_owned: this.pets.length })
      .eq('id', authUserId)

    if (profileError) throw profileError

    return petSpecies
  } catch (err: any) {
    this.error = err.message
    throw err
  }
},

    async completeDailyChallenge(challengeId: string) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const today = new Date().toISOString().split('T')[0]

        const { data: challenge, error: challengeError } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('id', challengeId)
          .single()

        if (challengeError) throw challengeError
        if (!challenge) return

        const { error } = await supabase
          .from('user_daily_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            progress: challenge.target_count,
          })
          .eq('user_id', this.profile.id)
          .eq('challenge_id', challengeId)
          .eq('date', today)

        if (error) throw error

        await this.addGold(challenge.reward_gold)

        if (this.activePet) {
          await this.addExperience(this.activePet.id, challenge.reward_experience)
        }

        await this.fetchDailyProgress(this.profile.id)
      } catch (err: any) {
        this.error = err.message
      }
    },
  },
})