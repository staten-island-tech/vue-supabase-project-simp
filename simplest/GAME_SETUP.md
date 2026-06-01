# 🐣 Pet Gatcha Game - Setup & Implementation Guide

## ✨ Overview

This is a fully functional Pet Gatcha Game built with **Vue 3 + Nuxt 4 + Supabase + Pinia + Tailwind CSS**. Players can:
- ✅ Summon/catch pets using gems
- ✅ Feed and care for pets
- ✅ Battle other players
- ✅ Level up and gain experience
- ✅ Manage pet collection
- ✅ Complete daily challenges
- ✅ Earn gold and gems
- ✅ Track progress on leaderboards

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

**Create a new Supabase project:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **API Key** (anon key)

**Create `.env.local` file in project root:**
```env
NUXT_PUBLIC_SUPABASE_URL=your_project_url_here
NUXT_PUBLIC_SUPABASE_KEY=your_api_key_here
```

### 3. Run Database Migrations

1. Open Supabase dashboard → SQL Editor
2. Copy the entire contents of `SUPABASE_SETUP.sql`
3. Paste into SQL Editor and run

This will create:
- `user_profiles` - Player data (level, gold, gems)
- `pet_species` - All available pets
- `user_pets` - Player's pet instances
- `pet_abilities` - Moves/abilities
- `daily_challenges` - Daily tasks
- `user_daily_progress` - Challenge progress
- `battle_records` - PvP battle history

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and start playing!

---

## 🎮 Game Mechanics

### Starting the Game
1. **Sign Up**: Create account with trainer name (e.g., "Ash", "Misty")
2. **Auto Starter Pet**: Get a free "Mystic Kitten" (Common rarity)
3. **Initial Resources**: 500 Gold + 50 Gems

### Progression System

#### Leveling Up
- **Player Level**: Increases when gaining experience
- **Pet Level**: Increases independently
- Each level requires `level * 100` experience points
- Leveling up increases pet stats

#### Currencies
- **💰 Gold**: Earn from battles, feeding pets, daily challenges
  - Feed Pet: +10 Gold
  - Win Battle: +50 Gold
  - Daily Bonus: +300 Gold
- **💎 Gems**: Premium currency (can be purchased or earned)
  - Summon 1 Pet: 10 Gems
  - Summon 10 Pets: 90 Gems (10% discount)

#### Pet Care
- **Hunger** (0-100): Increases over time, reduce by feeding
- **Happiness** (0-100): Affected by care and bonding
- **Affection** (0-100): Increases by bonding with pet
- **All stats decay** if not maintained

### Game Actions

#### 🎰 Summon Pets
Gacha roll with rarity rates:
- 60% Common (blue border)
- 30% Rare (purple border)
- 8% Epic (orange border)
- 2% Legendary (gold border)

#### 🍖 Feed Pets
- Reduces hunger
- Increases happiness
- Rewards: 10 Gold
- Can feed active pet from hub

#### ⚔️ Battle
- PvP battles against random trainers
- 60% win rate
- Rewards: 50 Gold + 50 Experience for winner
- Experience gained even on loss

#### 📋 Daily Challenges
Complete 3 daily tasks to unlock bonuses:
- Feed pets 5 times → +50 Gold
- Win a battle → +100 Gold
- Daily login → +300 Gold

---

## 🗂️ Project Structure

```
simplest/
├── app/
│   ├── app.vue                 # Root component
│   ├── pages/
│   │   ├── index.vue           # Game hub (main gameplay screen)
│   │   ├── signup.vue          # Registration
│   │   └── login.vue           # Login
│   ├── store/
│   │   ├── player.ts           # Pinia store for game state
│   │   └── counter.ts          # (unused example)
│   ├── types/
│   │   └── database.types.ts   # TypeScript interfaces
│   └── assets/css/
│       └── main.css            # Global styles
├── nuxt.config.ts              # Nuxt configuration
├── tailwind.config.js          # Tailwind CSS config
├── SUPABASE_SETUP.sql          # Database schema + seeding
├── package.json
└── README.md
```

---

## 📊 Data Models

### UserProfile
```typescript
{
  id: UUID                    // Auth user ID
  email: string              // Login email
  trainer_name: string       // Custom trainer name
  level: number             // Player level (1+)
  experience: number        // Current XP
  gold: number             // Gold balance
  gems: number             // Gem balance
  total_pets_owned: number // Collection count
  active_pet_id: UUID      // Currently selected pet
}
```

### UserPet
```typescript
{
  id: UUID
  user_id: UUID
  pet_species_id: UUID
  level: number           // 1-100+
  experience: number      // XP towards next level
  current_hp: number      // Current health
  max_hp: number         // Maximum health
  hunger: number         // 0-100 (0=full, 100=starving)
  happiness: number      // 0-100 (affects obedience)
  affection: number      // 0-100 (relationship bonding)
  nickname: string|null  // Optional custom name
}
```

### PetSpecies
```typescript
{
  id: UUID
  name: string                    // "Mystic Kitten"
  emoji: string                   // 🐱
  rarity: 'common'|'rare'|...     // Drop rarity
  base_hp: number                 // Base stat
  base_attack: number             // Base stat
  base_defense: number            // Base stat
  base_speed: number              // Base stat
  evolution_level: number         // Level to evolve
  evolved_form_id: UUID|null      // Evolved species ID
}
```

---

## 🔑 Key Features Already Implemented

✅ **Authentication**
- Supabase Auth integration
- Signup with trainer name
- Login persistence
- Logout functionality
- Protected routes (auth: true/false)

✅ **Pinia State Management**
- `usePlayerStore()` - centralized game state
- Getters for computed values
- Actions for database operations
- Automatic syncing with Supabase

✅ **UI/UX**
- Polished game interface with Tailwind CSS
- Responsive grid layouts
- Animated components (bounce, pulse, scale)
- Color-coded rarity system
- Real-time stat displays

✅ **Game Mechanics**
- Pet summoning with gacha rates
- Experience and leveling
- Pet care (feed, bond)
- Battle simulation
- Currency management
- Collection tracking

---

## ⚙️ Configuration

### Environment Variables (`.env.local`)
```env
NUXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### Tailwind Classes Used
- `bg-linear-to-r` / `bg-linear-to-b` - Gradients
- `animate-bounce`, `animate-pulse` - Animations
- `hover:scale-105` - Hover transforms
- `border-[color]-500` - Colored borders
- `text-transparent bg-clip-text` - Text gradients

---

## 🐛 Troubleshooting

### Pets not loading?
1. Check Supabase connection in `.env.local`
2. Verify `SUPABASE_SETUP.sql` was fully executed
3. Check browser console for errors

### Can't log in?
1. Confirm signup was completed with trainer name
2. Check `.env.local` has correct Supabase credentials
3. Verify auth is enabled in Supabase dashboard

### Gems not updating?
1. Check player store is initialized (`playerStore.isInitialized`)
2. Verify Supabase RLS policies allow user access
3. Check browser console for database errors

---

## 🎯 Next Steps (Future Features)

1. **Evolve Pets**: Level up to evolution threshold
2. **Pet Abilities**: Learn new moves at specific levels
3. **Battle Tournaments**: Weekly ranked competitions
4. **Pet Trading**: Player-to-player exchange
5. **Alliance System**: Team up with other trainers
6. **Breeding System**: Combine pets to create new ones
7. **Item Shop**: Consumable items for battles
8. **Achievements**: Badges and milestones
9. **Leaderboards**: Global ranking system
10. **Payment Processing**: Real gem purchases via Stripe

---

## 📚 Technologies Used

- **Frontend**: Vue 3 + Nuxt 4.4.2
- **State**: Pinia 3.0.4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS v3.4.19
- **Language**: TypeScript
- **Real-time**: WebSocket (ws)

---

## 🤝 Contributing

To add new features:

1. **Update Database Schema** (SUPABASE_SETUP.sql)
2. **Add TypeScript Types** (app/types/database.types.ts)
3. **Create Store Actions** (app/store/player.ts)
4. **Wire Up UI** (app/pages/*.vue)
5. **Test End-to-End**

---

## 📝 License

MIT - Feel free to use and modify!

---

**Happy gaming! 🎮✨**
