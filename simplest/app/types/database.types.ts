// User/Player Profile
export interface UserProfile {
  id: string
  email: string
  trainer_name: string
  level: number
  experience: number
  coins: number          // ✅ rename gold -> coins
  gems: number
  total_pets_owned: number
  active_pet_id: string | null
  created_at: string
  updated_at: string
}

// Pet base data (species/template)
export interface PetSpecies {
  id: string
  name: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  base_hp: number
  base_attack: number
  base_defense: number
  base_speed: number
  evolution_level: number
  evolved_form_id: string | null
  created_at: string
}

// User's pet instance
export interface UserPet {
  id: string
  user_id: string
  pet_species_id: string
  level: number
  experience: number
  current_hp: number
  max_hp: number
  hunger: number // 0-100, 0 = full, 100 = starving
  happiness: number // 0-100, 0 = sad, 100 = very happy
  affection: number // 0-100, relationship bonding
   
nickname
: 
string
 | 
null

  
caught_at
: 
string
 | 
null

  
updated_at
: 
string
 | 
null
}

// Pet ability/move
export interface PetAbility {
  id: string
  pet_species_id: string
  ability_name: string
  description: string
  power: number
  accuracy: number
  learn_level: number
}

// Daily challenge template
export interface DailyChallenge {
  id: string
  name: string
  description: string
  reward_gold: number
  reward_experience: number
  task_type: 'feed' | 'battle' | 'login' | 'collection' | 'level'
  target_count: number
}

// User's daily challenge progress
export interface UserDailyProgress {
  id: string
  user_id: string
  challenge_id: string
  progress: number
  completed: boolean
  completed_at: string | null
  date: string
}

// Battle/Match record
export interface BattleRecord {
  id: string
  challenger_id: string
  opponent_id: string
  winner_id: string
  challenger_pet_id: string
  opponent_pet_id: string
  battle_log: string // JSON string of move-by-move log
  reward_gold: number
  reward_experience: number
  created_at: string
}

// Pet evolution history
export interface PetEvolution {
  id: string
  user_pet_id: string
  from_species_id: string
  to_species_id: string
  evolved_at: string
}
