# ✅ Game Setup Checklist

## Phase 1: Database Setup (5 min)

- [ ] Create Supabase account at supabase.com
- [ ] Create new project
- [ ] Copy **Project URL** from Settings
- [ ] Copy **API Key (anon)** from Settings
- [ ] Create `.env.local` file with:
  ```
  NUXT_PUBLIC_SUPABASE_URL=your_url
  NUXT_PUBLIC_SUPABASE_KEY=your_key
  ```
- [ ] Open Supabase SQL Editor
- [ ] Copy entire `SUPABASE_SETUP.sql` content
- [ ] Paste and run in SQL Editor
- [ ] Verify all tables created (11 tables total)

## Phase 2: Local Setup (3 min)

- [ ] `npm install` (install dependencies)
- [ ] Verify `.env.local` exists with Supabase credentials
- [ ] `npm run dev` (start dev server)
- [ ] Visit http://localhost:3000

## Phase 3: Test Game Flow (10 min)

### Signup
- [ ] Click "Hatch Your First Pet" on login page
- [ ] Enter email, password (6+ chars), trainer name
- [ ] Click "HATCH NOW"
- [ ] See "Trainer hatched! Redirecting..." message
- [ ] Auto-redirects to login

### Login
- [ ] Use email and password from signup
- [ ] Click "ENTER THE HATCHERY"
- [ ] See loading spinner briefly
- [ ] View game hub with starter pet (🐱 Mystic Kitten)

### Game Hub Features
- [ ] Header shows: Trainer name, Level 1, 500 Gold, 50 Gems
- [ ] Active pet section shows 🐱 with stats
- [ ] Pet Collection grid shows 1 owned pet
- [ ] Click "🍖 FEED ACTIVE PET" button
  - [ ] Should show "+ 10 Gold" notification
  - [ ] Hunger bar should decrease
- [ ] Click "💕 BOND" button
  - [ ] Affection should increase by 5
- [ ] Click "⚔️ BATTLE ARENA" button
  - [ ] Should simulate 2-second battle
  - [ ] Either "🎉 Victory! +50 Gold, +50 EXP" or "😢 Defeat"
- [ ] Click "🎰 SUMMON PETS"
  - [ ] Modal opens
  - [ ] Verify you have 50 gems
  - [ ] Click "Summon 1 (10 💎)"
  - [ ] Should get new pet (40 gems remaining)
  - [ ] Pet appears in collection
- [ ] Click pet in collection to select as active
- [ ] Click "📋 CLAIM REWARDS"
  - [ ] Should get +300 Gold notification
- [ ] Click logout button
  - [ ] Should redirect to login page

## Phase 4: Database Verification (5 min)

Go to Supabase Dashboard → Tables:

- [ ] `user_profiles` table exists with your account
  - [ ] trainer_name = your name
  - [ ] gold = 500+ (after feeding/battles)
  - [ ] gems = 40+ (after summons)
  - [ ] level = 1+
  - [ ] active_pet_id is set

- [ ] `pet_species` table has data
  - [ ] Mystic Kitten (🐱)
  - [ ] Royal Hound (🐶)
  - [ ] And 6 others
  
- [ ] `user_pets` table has 2+ pets
  - [ ] Starter pet
  - [ ] Summoned pets
  
- [ ] `user_daily_progress` table tracks daily challenges

## Phase 5: Verify File Structure (2 min)

```
app/
├── pages/
│   ├── index.vue         ✅ (game hub)
│   ├── signup.vue        ✅ (registration)
│   └── login.vue         ✅ (login)
├── store/
│   └── player.ts         ✅ (state management)
└── types/
    └── database.types.ts ✅ (TypeScript types)

SUPABASE_SETUP.sql       ✅ (database schema)
GAME_SETUP.md            ✅ (documentation)
CHECKLIST.md             ✅ (this file)
```

---

## 🎮 Game Stats After First Play Session

Expected values after playing for ~5 minutes:

| Stat | Value | Source |
|------|-------|--------|
| Trainer Level | 1 | Starting |
| Gold | 500+ | Starting (500) + feeding (10-100) + battles (50) |
| Gems | 40+ | Starting (50) - summons (10) |
| Pets Owned | 2-3 | 1 starter + 1-2 summoned |
| Pet Level | 1 | Just summoned/caught |
| Active Pet XP | 0-100 | From battles/leveling |

---

## 🆘 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Cannot read properties of undefined (reading 'profile')" | Reload page, or `npm run dev` stopped. Restart. |
| Pets not loading | Check Supabase URL/Key in `.env.local` |
| Button clicks do nothing | Check browser console (F12) for errors |
| Database errors | Run `SUPABASE_SETUP.sql` again |
| Gems stay at 50 | Summon button might not be wired - try feeding pets instead |

---

## ✨ Success Indicators

✅ You're good to go if:
- [ ] Can sign up and create account
- [ ] Can login with new account
- [ ] Game hub loads with starter pet
- [ ] Can feed, bond, and battle with pets
- [ ] Can summon new pets (gems decrease)
- [ ] Can switch active pet
- [ ] Gold and gems update correctly
- [ ] All buttons respond with notifications
- [ ] Supabase shows new data in tables

---

**🚀 Ready to play! Start with signup at http://localhost:3000**
