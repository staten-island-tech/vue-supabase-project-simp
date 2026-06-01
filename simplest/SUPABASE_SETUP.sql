-- SUPABASE SQL MIGRATIONS FOR PET GATCHA GAME
-- Run these queries in your Supabase SQL Editor

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  trainer_name TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  gold INT NOT NULL DEFAULT 500,
  gems INT NOT NULL DEFAULT 50,
  total_pets_owned INT NOT NULL DEFAULT 1,
  active_pet_id UUID REFERENCES user_pets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- PET SPECIES TABLE (Game Data - All Possible Pets)
-- ============================================
CREATE TABLE IF NOT EXISTS pet_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  base_hp INT NOT NULL,
  base_attack INT NOT NULL,
  base_defense INT NOT NULL,
  base_speed INT NOT NULL,
  evolution_level INT DEFAULT 0,
  evolved_form_id UUID REFERENCES pet_species(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_species_rarity ON pet_species(rarity);

-- ============================================
-- USER PETS TABLE (Player's Owned Pets)
-- ============================================
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pet_species_id UUID NOT NULL REFERENCES pet_species(id),
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  current_hp INT NOT NULL,
  max_hp INT NOT NULL,
  hunger INT NOT NULL DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  happiness INT NOT NULL DEFAULT 70 CHECK (happiness >= 0 AND happiness <= 100),
  affection INT NOT NULL DEFAULT 0 CHECK (affection >= 0 AND affection <= 100),
  nickname TEXT,
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX idx_user_pets_pet_species_id ON user_pets(pet_species_id);

-- ============================================
-- PET ABILITIES TABLE (Moves/Abilities)
-- ============================================
CREATE TABLE IF NOT EXISTS pet_abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_species_id UUID NOT NULL REFERENCES pet_species(id) ON DELETE CASCADE,
  ability_name TEXT NOT NULL,
  description TEXT,
  power INT NOT NULL DEFAULT 50,
  accuracy INT NOT NULL DEFAULT 100 CHECK (accuracy >= 0 AND accuracy <= 100),
  learn_level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_abilities_species ON pet_abilities(pet_species_id);

-- ============================================
-- DAILY CHALLENGES TABLE (Game Templates)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  reward_gold INT NOT NULL DEFAULT 50,
  reward_experience INT NOT NULL DEFAULT 30,
  task_type TEXT NOT NULL CHECK (task_type IN ('feed', 'battle', 'login', 'collection', 'level')),
  target_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER DAILY PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id),
  progress INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, date)
);

CREATE INDEX idx_daily_progress_user_date ON user_daily_progress(user_id, date);

-- ============================================
-- BATTLE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS battle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenger_pet_id UUID NOT NULL REFERENCES user_pets(id),
  opponent_pet_id UUID NOT NULL REFERENCES user_pets(id),
  battle_log TEXT, -- JSON string of battle events
  reward_gold INT NOT NULL DEFAULT 50,
  reward_experience INT NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_battle_records_challenger ON battle_records(challenger_id);
CREATE INDEX idx_battle_records_opponent ON battle_records(opponent_id);
CREATE INDEX idx_battle_records_winner ON battle_records(winner_id);

-- ============================================
-- PET EVOLUTION HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS pet_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
  from_species_id UUID NOT NULL REFERENCES pet_species(id),
  to_species_id UUID NOT NULL REFERENCES pet_species(id),
  evolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_evolutions_user_pet ON pet_evolutions(user_pet_id);

-- ============================================
-- SEED STARTER PETS (Insert these into pet_species)
-- ============================================
INSERT INTO pet_species (name, emoji, rarity, base_hp, base_attack, base_defense, base_speed, evolution_level)
VALUES
  ('Mystic Kitten', '🐱', 'common', 45, 49, 49, 45, 16),
  ('Royal Hound', '🐶', 'common', 52, 43, 43, 60, 16),
  ('Flame Fox', '🦊', 'rare', 58, 62, 60, 66, 35),
  ('Forest Drake', '🦎', 'rare', 64, 70, 55, 58, 40),
  ('Aqua Spirit', '🐠', 'rare', 50, 48, 63, 63, 32),
  ('Prismatic Moth', '🦋', 'epic', 60, 77, 72, 72, 45),
  ('Sky Guardian', '🦅', 'epic', 78, 84, 78, 104, 50),
  ('Temporal Dragon', '🐉', 'legendary', 106, 134, 95, 80, 0);
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED ABILITIES FOR STARTER PETS
-- ============================================
INSERT INTO pet_abilities (pet_species_id, ability_name, description, power, accuracy, learn_level)
SELECT id, 'Swift Paw', 'Quick strike dealing damage', 40, 100, 1 FROM pet_species WHERE name = 'Mystic Kitten'
ON CONFLICT DO NOTHING;

INSERT INTO pet_abilities (pet_species_id, ability_name, description, power, accuracy, learn_level)
SELECT id, 'Bark Attack', 'Loud bark damages opponent', 35, 100, 1 FROM pet_species WHERE name = 'Royal Hound'
ON CONFLICT DO NOTHING;

INSERT INTO pet_abilities (pet_species_id, ability_name, description, power, accuracy, learn_level)
SELECT id, 'Flame Burst', 'Fire attack burning opponent', 65, 100, 1 FROM pet_species WHERE name = 'Flame Fox'
ON CONFLICT DO NOTHING;

INSERT INTO pet_abilities (pet_species_id, ability_name, description, power, accuracy, learn_level)
SELECT id, 'Vine Whip', 'Plant-based attack', 45, 100, 1 FROM pet_species WHERE name = 'Forest Drake'
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DAILY CHALLENGES
-- ============================================
INSERT INTO daily_challenges (name, description, reward_gold, reward_experience, task_type, target_count)
VALUES
  ('Feed Your Pets', 'Feed pets 5 times', 50, 30, 'feed', 5),
  ('Win a Battle', 'Win one trainer battle', 100, 50, 'battle', 1),
  ('Daily Login', 'Login to claim bonus', 300, 20, 'login', 1),
  ('Level Up', 'Get your pet to next level', 200, 100, 'level', 1),
  ('Expand Collection', 'Summon 1 new pet', 75, 25, 'collection', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_records ENABLE ROW LEVEL SECURITY;

-- User can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see their own pets
CREATE POLICY "Users can view own pets"
  ON user_pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pets"
  ON user_pets FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only see their own daily progress
CREATE POLICY "Users can view own daily progress"
  ON user_daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress"
  ON user_daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Pet species can be viewed by all authenticated users
ALTER TABLE pet_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pet species"
  ON pet_species FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE pet_abilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pet abilities"
  ON pet_abilities FOR SELECT
  USING (auth.role() = 'authenticated');
