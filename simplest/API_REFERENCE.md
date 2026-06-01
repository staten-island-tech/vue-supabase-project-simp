# 🔌 API Endpoints Reference

This document outlines all API endpoints needed for full game functionality.

## Current Status

**✅ Implemented via Pinia Store + Supabase Client:**
- All read operations (GET)
- All write operations (POST/PATCH)
- Direct database access using Supabase RLS

**⏳ Future Enhancement:**
- Nitro server endpoints for additional security
- Custom business logic
- Rate limiting
- Advanced analytics

---

## 🎮 Game Endpoints

### Player Endpoints

#### GET /api/player/:userId
Fetch player profile and all related data

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "trainer_name": "Ash",
    "level": 5,
    "experience": 250,
    "gold": 1200,
    "gems": 45,
    "total_pets_owned": 3,
    "active_pet_id": "uuid"
  },
  "active_pet": {
    "id": "uuid",
    "level": 3,
    "hunger": 25,
    "happiness": 85,
    "affection": 60
  },
  "pets": [...],
  "daily_progress": [...]
}
```

#### PATCH /api/player/:userId
Update player stats

**Request:**
```json
{
  "level": 6,
  "gold": 1250,
  "gems": 40
}
```

---

### Pet Endpoints

#### GET /api/pets/:userId
Get all pets owned by player

**Response:**
```json
[
  {
    "id": "uuid",
    "nickname": "Sparky",
    "species": {
      "name": "Mystic Kitten",
      "emoji": "🐱",
      "base_hp": 45,
      "base_attack": 49,
      "base_defense": 49,
      "base_speed": 45
    },
    "level": 5,
    "experience": 120,
    "hunger": 30,
    "happiness": 75,
    "affection": 50
  }
]
```

#### GET /api/pet/:petId
Get single pet details with abilities

**Response:**
```json
{
  "id": "uuid",
  "level": 5,
  "experience": 120,
  "current_hp": 45,
  "max_hp": 45,
  "hunger": 30,
  "happiness": 75,
  "affection": 50,
  "abilities": [
    {
      "ability_name": "Swift Paw",
      "power": 40,
      "accuracy": 100,
      "learn_level": 1
    }
  ]
}
```

#### POST /api/pet/:userId/summon
Summon a new pet (gacha)

**Request:**
```json
{
  "count": 1,  // 1 or 10
  "cost_gems": 10
}
```

**Response:**
```json
{
  "success": true,
  "pet": {
    "id": "uuid",
    "species": "Royal Hound",
    "emoji": "🐶",
    "rarity": "common",
    "level": 1
  },
  "gems_remaining": 40
}
```

#### PATCH /api/pet/:petId/feed
Feed a pet

**Request:**
```json
{
  "amount": 1
}
```

**Response:**
```json
{
  "success": true,
  "pet": {
    "hunger": 5,
    "happiness": 85,
    "affection": 52
  },
  "reward_gold": 10
}
```

#### PATCH /api/pet/:petId/bond
Increase affection/bonding

**Request:**
```json
{
  "amount": 5
}
```

**Response:**
```json
{
  "success": true,
  "affection": 55
}
```

#### PATCH /api/pet/:petId/level-up
Level up a pet

**Request:**
```json
{
  "new_level": 6,
  "experience": 0
}
```

**Response:**
```json
{
  "success": true,
  "level": 6,
  "new_stats": {
    "max_hp": 52,
    "base_attack": 56,
    "base_defense": 56,
    "base_speed": 52
  }
}
```

#### POST /api/pet/:petId/evolve
Evolve a pet to next form

**Request:**
```json
{
  "new_species_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "old_species": "Mystic Kitten",
  "new_species": "Feline Warrior",
  "new_stats": {...}
}
```

---

### Battle Endpoints

#### POST /api/battle/start
Initiate a PvP battle

**Request:**
```json
{
  "challenger_id": "uuid",
  "challenger_pet_id": "uuid",
  "opponent_id": "uuid",  // or "random" for AI
  "opponent_pet_id": "uuid"
}
```

**Response:**
```json
{
  "battle_id": "uuid",
  "challenger_pet": {...},
  "opponent_pet": {...}
}
```

#### POST /api/battle/:battleId/move
Execute a move in battle

**Request:**
```json
{
  "ability_id": "uuid",
  "damage_dealt": 35,
  "accuracy_hit": true
}
```

**Response:**
```json
{
  "success": true,
  "opponent_hp": 110,
  "opponent_hp_max": 145,
  "turn": 2
}
```

#### POST /api/battle/:battleId/finish
End battle and award rewards

**Request:**
```json
{
  "winner_id": "uuid",
  "battle_log": "[...]"
}
```

**Response:**
```json
{
  "battle_record": {
    "id": "uuid",
    "winner_id": "uuid",
    "reward_gold": 50,
    "reward_experience": 50
  },
  "winner_stats": {
    "gold": 1250,
    "experience": 300
  }
}
```

#### GET /api/battle/history/:userId
Get player's battle history

**Response:**
```json
[
  {
    "id": "uuid",
    "opponent_name": "Misty",
    "result": "win",
    "reward_gold": 50,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

### Daily Challenge Endpoints

#### GET /api/challenges
Get all available daily challenges

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Feed Your Pets",
    "description": "Feed pets 5 times",
    "reward_gold": 50,
    "reward_experience": 30,
    "task_type": "feed",
    "target_count": 5
  }
]
```

#### GET /api/challenges/:userId/progress
Get player's daily progress for today

**Response:**
```json
[
  {
    "challenge_id": "uuid",
    "name": "Feed Your Pets",
    "progress": 3,
    "target_count": 5,
    "completed": false,
    "reward_gold": 50
  }
]
```

#### PATCH /api/challenges/:userId/progress/:challengeId
Update challenge progress

**Request:**
```json
{
  "progress": 4
}
```

**Response:**
```json
{
  "success": true,
  "progress": 4,
  "target_count": 5,
  "completed": false
}
```

#### POST /api/challenges/:userId/:challengeId/claim
Claim reward for completed challenge

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "rewards": {
    "gold": 50,
    "experience": 30
  }
}
```

---

### Leaderboard Endpoints

#### GET /api/leaderboard?limit=100&offset=0
Get global leaderboard

**Response:**
```json
[
  {
    "rank": 1,
    "trainer_name": "Champion",
    "level": 50,
    "total_pets_owned": 42,
    "win_rate": 0.75
  }
]
```

#### GET /api/leaderboard/:userId/rank
Get player's rank and nearby players

**Response:**
```json
{
  "player_rank": 523,
  "nearby": [
    {
      "rank": 522,
      "trainer_name": "SomePlayer",
      "level": 15
    },
    {
      "rank": 523,
      "trainer_name": "You",
      "level": 15
    },
    {
      "rank": 524,
      "trainer_name": "OtherPlayer",
      "level": 14
    }
  ]
}
```

---

### Shop Endpoints

#### GET /api/shop/packages
Get available gem packages

**Response:**
```json
[
  {
    "id": "gold_bundle",
    "name": "Gold Bundle",
    "gems_amount": 5000,
    "price_usd": 4.99,
    "icon": "💰"
  },
  {
    "id": "gem_pack_50",
    "name": "Popular Gem Pack",
    "gems_amount": 50,
    "price_usd": 9.99,
    "icon": "💎"
  }
]
```

#### POST /api/shop/:userId/purchase
Process gem purchase

**Request:**
```json
{
  "package_id": "gem_pack_50",
  "payment_token": "stripe_token_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "uuid",
  "gems_added": 50,
  "gems_total": 95
}
```

---

## 🔐 Authentication

All endpoints require Supabase Auth header:

```
Authorization: Bearer {JWT_TOKEN}
```

The token is automatically added by `useSupabaseClient()` in Nuxt.

---

## 📊 Database Queries (Supabase Direct)

Current implementation uses direct Supabase queries from the Pinia store:

```typescript
// Example: Fetch player profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Example: Update pet hunger
const { error } = await supabase
  .from('user_pets')
  .update({ hunger: newHunger })
  .eq('id', petId)
```

---

## 🚀 Future Implementation Plan

To convert to Nitro server endpoints:

1. Create `/server/api/` directory
2. Add endpoint files:
   ```
   server/api/
   ├── player/
   │   └── [id].get.ts
   ├── pet/
   │   ├── summon.post.ts
   │   └── feed.patch.ts
   ├── battle/
   │   └── start.post.ts
   └── leaderboard.get.ts
   ```
3. Import Supabase client in server context
4. Update Pinia store actions to use `$fetch()` instead of direct client

---

## 📝 Rate Limits (Recommended)

- **Summoning**: 10 per minute per player
- **Battles**: 30 per minute per player
- **Feeding**: 50 per minute per player
- **Profile Updates**: 100 per minute per player

---

**All endpoints currently work via Pinia + Supabase client! 🎉**
