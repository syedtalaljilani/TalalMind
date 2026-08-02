# TalalMind — Daily Planner App

> A powerful personal productivity mobile app built with **Expo React Native**, designed to auto-organize your workday, track prayers, focus sessions, AI learning progress, and enforce healthy sleep habits — all 100% offline.

---

## 📱 Screenshots & Features

### 🗓 Timeline Screen
- Auto-generated **8-hour daily schedule** with:
  - 🏋️ Morning Gym (06:15 AM – 07:30 AM)
  - 🚗 Commute to Office (50 min)
  - 🏢 Office Core Work (2 hrs)
  - 🚀 Ship-a-thon Hackathon (2 hrs)
  - 🍽 Lunch & Rest Break (1.5 hrs)
  - 📚 AI Engineering Study Slot (2 hrs)
  - ☕ Wrap-up Buffer (30 min)
  - 🚗 Evening Commute Home (50 min)
  - 🌙 Sleep Force Wind Down (10:30 PM)
- **LIVE NOW** badge on the currently active block
- **GPS-based Prayer Times** (Fajr, Dhuhr, Asr, Maghrib, Isha) via Al-Adhan API
- **🕌 Office Prayer** tags for prayers falling within office hours
- **Prayer check buttons** directly on timeline cards
- **🔥 Prayer Streak** badge in header (tap to open 30-day checkbook)

### ⏱ Focus Timer (per Work Block)
- Tap the **▶ Focus** button on any work card (Gym, Office, Shipathon, Learning)
- Full-screen **Pomodoro Timer** (25-min work / 5-min break) inside a bottom sheet
- Tracks:
  - ✅ Pomodoros completed
  - 📊 Time utilized vs. allocated (live progress bar)
  - 🕐 Time remaining
- Session saved to **local history** on Done
- **📈 Focus History** button in header shows past sessions grouped by date

### 📚 503 AI Engineering Lessons
- All **503 official lessons** scraped from [aiengineeringfromscratch.com](https://aiengineeringfromscratch.com)
- Organized into **20 Phase Accordions**
- Per-phase completion progress bar
- Active lesson focus card with language/type badges
- Lesson streak tracker 🔥

### ✅ Daily Checklists
- Office tasks & Ship-a-thon tasks
- **Auto-reset at midnight** every day
- Persistent across app restarts

### 🕌 Prayer Checkbook & Streak History
- Tap any prayer card to mark it as offered
- **30-day history modal** with date selector
- Streak calculation: consecutive days with all 5 prayers offered

### 🚀 Productivity Hub (Boost Tab)
- 🍅 **Pomodoro Timer** (25 min work / 5 min break)
- 🔥 **Daily Habit Tracker** (Gym, Learn, Shipathon, Steps, No Social)
- ✅ **Quick Task List** (in-session)
- 📊 **Day Score Card** (Pomodoros | Habits | Tasks)

### 🌙 Sleep Force App Lock
- Full-screen lock overlay from **10:30 PM to Fajr**
- Live **Fajr countdown timer**
- Emergency hold-to-unlock (2 seconds)
- 1-Tap launcher for iOS Screen Time / Android Digital Wellbeing

### ⚙️ Settings Screen
- Customize office hours, commute duration, gym time, sleep lock time
- **GPS sync** button to refresh prayer location
- 100% Offline & Private badge

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 57 / React Native 0.86 |
| Navigation | React Navigation v7 (Bottom Tabs) |
| Storage | AsyncStorage (local only, no cloud) |
| Location | expo-location |
| Prayer API | Al-Adhan API (with offline cache) |
| Icons | @expo/vector-icons (Ionicons) |
| Language | TypeScript |

---

## 📁 Project Structure

```
TalalMind/
├── App.tsx                          # Root with BottomTabNavigator
├── app.json                         # Expo app config
├── src/
│   ├── types/
│   │   └── index.ts                 # All TypeScript interfaces
│   ├── data/
│   │   └── lessons.ts               # 503 AI Engineering lessons dataset
│   ├── services/
│   │   ├── storageService.ts        # AsyncStorage CRUD wrapper
│   │   ├── locationService.ts       # GPS + reverse geocoding
│   │   └── prayerService.ts         # Al-Adhan API + offline cache
│   ├── utils/
│   │   └── timelineUtils.ts         # Daily timeline generator
│   ├── components/
│   │   ├── GlassCard.tsx            # Glassmorphism card container
│   │   ├── TimelineCard.tsx         # Timeline item card
│   │   ├── LessonCard.tsx           # Active lesson focus card
│   │   ├── ChecklistGroup.tsx       # Daily checklist group
│   │   ├── PrayerCheckbookModal.tsx # 30-day prayer log modal
│   │   ├── FocusTimerModal.tsx      # Pomodoro focus timer modal
│   │   ├── FocusHistoryModal.tsx    # Focus session history modal
│   │   └── SleepLockOverlay.tsx     # Sleep force lock overlay
│   └── screens/
│       ├── TimelineScreen.tsx       # Main timeline screen
│       ├── LessonsScreen.tsx        # 503 lessons grouped by phase
│       ├── ChecklistsScreen.tsx     # Office & shipathon checklists
│       ├── ProductivityScreen.tsx   # Pomodoro, habits & quick tasks
│       └── SettingsScreen.tsx       # Configuration & GPS sync
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo Go app on your iOS/Android phone
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/syedtalaljilani/TalalMind.git
cd TalalMind

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## 🔒 Privacy

All data is stored **locally on your device** using AsyncStorage:

| Data | Storage Key |
|---|---|
| User settings | `@daily_planner_settings_v1` |
| Prayer times cache | `@daily_planner_prayer_<date>` |
| Lesson progress | `@daily_planner_lessons_v1` |
| Daily checklists | `@daily_planner_checklists_v1` |
| Prayer history | `@daily_planner_prayer_history_v1` |
| Focus session history | `@daily_planner_focus_history_v1` |

**No accounts. No tracking. No servers.**

---

## 📋 Bottom Navigation Tabs

| Tab | Icon | Screen |
|---|---|---|
| Timeline | ⏰ | Daily 8-hour schedule + prayers |
| Boost | ⌛ | Productivity hub (Pomodoro, habits, tasks) |
| Lessons | 📖 | 503 AI Engineering lessons by phase |
| Tasks | ☑️ | Office & ship-a-thon checklists |
| Settings | ⚙️ | App configuration & GPS sync |

---

## 👤 Built For

**Syed Talal Jilani** — personal productivity mobile app to manage a structured workday including office, ship-a-thon hackathon, AI learning, gym, prayers, and healthy sleep.

---

## 📄 License

Personal use only.
