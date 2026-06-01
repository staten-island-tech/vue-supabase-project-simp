import { defineStore } from 'pinia'
import type { UserProfile, UserPet, PetSpecies, PetAbility, UserDailyProgress } from '../types/database.types'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    profile: null as UserProfile | null,
    activePet: null as (UserPet & { species?: PetSpecies; abilities?: PetAbility[] }) | null,
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
    goldBalance: (state) => state.profile?.gold ?? 0,
    gemBalance: (state) => state.profile?.gems ?? 0,
    trainerLevel: (state) => state.profile?.level ?? 1,
    nextLevelExp: (state) => {
      const level = state.profile?.level ?? 1
      return level * 100 // Simple formula: each level needs level * 100 exp
    },
    dailyChallengesCompleted: (state) => state.dailyProgress.filter(d => d.completed).length,
  },

  actions: {
    async initializeNewPlayer(userId: string, email: string, trainerName: string) {
      const supabase = useSupabaseClient()
      
      try {
        this.loading = true
        this.error = null

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email,
            trainer_name: trainerName,
            level: 1,
            experience: 0,
            gold: 500, // Starting gold
            gems: 50, // Starting gems
            total_pets_owned: 1,
            active_pet_id: null,
          })

        if (profileError) throw profileError

        // Fetch profile
        await this.fetchPlayerProfile(userId)

        // Give starter pets
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
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error

        this.profile = data
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
          .select(`
            *,
            pet_species:pet_species_id(*)
          `)
          .eq('user_id', userId)

        if (error) throw error

        this.pets = data || []

        // Set active pet
        if (this.profile?.active_pet_id) {
          this.activePet = this.pets.find(p => p.id === this.profile?.active_pet_id) || null
        } else if (this.pets.length > 0) {
          const firstPet = this.pets[0]
          if (firstPet) {
            this.activePet = firstPet
            // Auto-set first pet as active
            await this.setActivePet(firstPet.id)
          }
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

        this.dailyProgress = data || []
      } catch (err: any) {
        this.error = err.message
      }
    },

    async giveStarterPets(userId: string) {
      const supabase = useSupabaseClient()

      try {
        // Get starter pet species (Mystic Kitten - common fire cat)
        const { data: species, error: speciesError } = await supabase
          .from('pet_species')
          .select('*')
          .eq('name', 'Mystic Kitten')
          .single()

        if (speciesError) throw speciesError

        // Create starter pet instance
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

        // Fetch updated pets
        await this.fetchUserPets(userId)
      } catch (err: any) {
        this.error = err.message
      }
    },

    async setActivePet(petId: string) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const { error } = await supabase
          .from('user_profiles')
          .update({ active_pet_id: petId })
          .eq('id', this.profile.id)

        if (error) throw error

        this.activePet = this.pets.find(p => p.id === petId) || null
        if (this.profile) {
          this.profile.active_pet_id = petId
        }
      } catch (err: any) {
        this.error = err.message
      }
    },

    async feedPet(petId: string) {
      const supabase = useSupabaseClient()

      try {
        const pet = this.pets.find(p => p.id === petId)
        if (!pet) return

        // Reduce hunger, increase happiness slightly
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

        // Update local state
        pet.hunger = newHunger
        pet.happiness = newHappiness

        // Add 10 gold reward
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

        // Level up logic
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

        // Update pet locally
        pet.experience = newExp
        pet.level = newLevel

        // Give player experience too
        let playerExp = this.profile.experience + Math.floor(amount / 2)
        let playerLevel = this.profile.level

        while (playerExp >= this.nextLevelExp) {
          playerExp -= this.nextLevelExp
          playerLevel += 1
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
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

        const newGold = this.profile.gold + amount

        const { error } = await supabase
          .from('user_profiles')
          .update({ gold: newGold })
          .eq('id', this.profile.id)

        if (error) throw error

        this.profile.gold = newGold
      } catch (err: any) {
        this.error = err.message
      }
    },

    async addGems(amount: number) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const newGems = this.profile.gems + amount

        const { error } = await supabase
          .from('user_profiles')
          .update({ gems: newGems })
          .eq('id', this.profile.id)

        if (error) throw error

        this.profile.gems = newGems
      } catch (err: any) {
        this.error = err.message
      }
    },

    async summonPet() {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        // Simple gacha: 60% common, 30% rare, 8% epic, 2% legendary
        const roll = Math.random()
        let rarity: 'common' | 'rare' | 'epic' | 'legendary'

        if (roll < 0.6) rarity = 'common'
        else if (roll < 0.9) rarity = 'rare'
        else if (roll < 0.98) rarity = 'epic'
        else rarity = 'legendary'

        // Get random pet of that rarity
        const { data: petSpecies, error: speciesError } = await supabase
          .from('pet_species')
          .select('*')
          .eq('rarity', rarity)
          .limit(1)
          .single()

        if (speciesError) throw speciesError

        // Deduct gems
        const costInGems = rarity === 'legendary' ? 100 : rarity === 'epic' ? 50 : 10
        await this.addGems(-costInGems)

        // Create pet instance
        const { error: petError } = await supabase
          .from('user_pets')
          .insert({
            user_id: this.profile.id,
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

        // Update total pets count
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ total_pets_owned: this.profile.total_pets_owned + 1 })
          .eq('id', this.profile.id)

        if (profileError) throw profileError

        this.profile.total_pets_owned += 1

        // Refresh pet list
        await this.fetchUserPets(this.profile.id)

        return petSpecies
      } catch (err: any) {
        this.error = err.message
      }
    },

    async completeDailyChallenge(challengeId: string) {
      const supabase = useSupabaseClient()

      try {
        if (!this.profile) return

        const today = new Date().toISOString().split('T')[0]

        // Find challenge
        const { data: challenge, error: challengeError } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('id', challengeId)
          .single()

        if (challengeError) throw challengeError

        // Mark as completed
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

        // Give rewards
        await this.addGold(challenge.reward_gold)
        if (this.activePet) {
          await this.addExperience(this.activePet.id, challenge.reward_experience)
        }

        // Refresh progress
        await this.fetchDailyProgress(this.profile.id)
      } catch (err: any) {
        this.error = err.message
      }
    },
  },
})
