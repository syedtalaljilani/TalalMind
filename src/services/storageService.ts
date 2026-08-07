import {
  UserSettings,
  PrayerTimings,
  LessonProgress,
  DailyChecklistState,
  PrayerHistoryState,
  PrayerName,
  DailyPrayerCheck,
  FocusSession,
  GamificationState,
  ProductivityState,
  HabitState,
} from "../types";
import { DataStore } from "./dataStore";
const SETTINGS_KEY = "@daily_planner_settings_v1";
const PRAYER_CACHE_KEY_PREFIX = "@daily_planner_prayer_";
const LESSON_PROGRESS_KEY = "@daily_planner_lessons_v1";
const CHECKLIST_KEY = "@daily_planner_checklists_v1";
const PRAYER_HISTORY_KEY = "@daily_planner_prayer_history_v1";
const FOCUS_HISTORY_KEY = "@daily_planner_focus_history_v1";
const GAMIFICATION_KEY = "@daily_planner_gamification_v1";
const PRODUCTIVITY_KEY = "@daily_planner_productivity_v1";

const CORE_KEYS = [
  SETTINGS_KEY,
  LESSON_PROGRESS_KEY,
  CHECKLIST_KEY,
  PRAYER_HISTORY_KEY,
  FOCUS_HISTORY_KEY,
  GAMIFICATION_KEY,
  PRODUCTIVITY_KEY,
];

export const DEFAULT_SETTINGS: UserSettings = {
  officeStart: "09:00",
  officeEnd: "17:00",
  commuteMinutes: 50,
  gymStart: "06:15",
  sleepStart: "22:30",
  cityName: "Auto GPS",
  latitude: null,
  longitude: null,
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_GAMIFICATION: GamificationState = {
  totalXP: 0,
  level: 1,
  unlockedAchievements: [],
  categoryStats: {},
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastActiveDate: null,
};

export const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  completedIds: [],
  lastCompletedDate: null,
  currentStreak: 0,
  bestStreak: 0,
};

export const DEFAULT_OFFICE_TASKS = [
  {
    id: "off-1",
    title: "Review today’s sprint tickets & PRs",
    completed: false,
    category: "office" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "off-2",
    title: "Complete high-priority client deliverable",
    completed: false,
    category: "office" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "off-3",
    title: "Sync with team on blockers",
    completed: false,
    category: "office" as const,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SHIPATHON_TASKS = [
  {
    id: "ship-1",
    title: "Implement core hackathon component",
    completed: false,
    category: "shipathon" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ship-2",
    title: "Push updated build to repo & test UI",
    completed: false,
    category: "shipathon" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ship-3",
    title: "Prepare demo recording snippet",
    completed: false,
    category: "shipathon" as const,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_HABITS: HabitState[] = [
  {
    id: "1",
    name: "Morning Gym",
    icon: "barbell-outline",
    streak: 0,
    completedToday: false,
    lastCompletedDate: null,
  },
  {
    id: "2",
    name: "Read / Learn",
    icon: "book-outline",
    streak: 0,
    completedToday: false,
    lastCompletedDate: null,
  },
  {
    id: "3",
    name: "Ship-a-thon",
    icon: "rocket-outline",
    streak: 0,
    completedToday: false,
    lastCompletedDate: null,
  },
  {
    id: "4",
    name: "Walk 5000 Steps",
    icon: "walk-outline",
    streak: 0,
    completedToday: false,
    lastCompletedDate: null,
  },
  {
    id: "5",
    name: "No Social After 9PM",
    icon: "moon-outline",
    streak: 0,
    completedToday: false,
    lastCompletedDate: null,
  },
];

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const StorageService = {
  async init(): Promise<void> {
    await DataStore.init(CORE_KEYS);
  },

  subscribe(fn: (key: string) => void): () => void {
    return DataStore.subscribe(fn);
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const stored = await DataStore.get(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    await DataStore.set(SETTINGS_KEY, settings);
  },

  // Prayer cache
  async getCachedPrayerTimes(dateStr: string): Promise<PrayerTimings | null> {
    const stored = await DataStore.get(PRAYER_CACHE_KEY_PREFIX + dateStr);
    return stored ?? null;
  },

  async savePrayerTimes(
    dateStr: string,
    timings: PrayerTimings,
  ): Promise<void> {
    await DataStore.set(PRAYER_CACHE_KEY_PREFIX + dateStr, timings);
  },

  // Lesson Progress
  async getLessonProgress(): Promise<LessonProgress> {
    const stored = await DataStore.get(LESSON_PROGRESS_KEY);
    return stored ?? DEFAULT_LESSON_PROGRESS;
  },

  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    await DataStore.set(LESSON_PROGRESS_KEY, progress);
  },

  // Checklists (with automatic daily reset at midnight)
  async getDailyChecklists(): Promise<DailyChecklistState> {
    const today = getTodayDateString();
    const stored = await DataStore.get(CHECKLIST_KEY);
    if (stored) {
      const state: DailyChecklistState = stored;
      if (state.date !== today) {
        const resetState: DailyChecklistState = {
          date: today,
          officeTasks: state.officeTasks.map((t) => ({
            ...t,
            completed: false,
          })),
          shipathonTasks: state.shipathonTasks.map((t) => ({
            ...t,
            completed: false,
          })),
        };
        await StorageService.saveDailyChecklists(resetState);
        return resetState;
      }
      return state;
    }

    const newState: DailyChecklistState = {
      date: today,
      officeTasks: DEFAULT_OFFICE_TASKS,
      shipathonTasks: DEFAULT_SHIPATHON_TASKS,
    };
    await StorageService.saveDailyChecklists(newState);
    return newState;
  },

  async saveDailyChecklists(state: DailyChecklistState): Promise<void> {
    await DataStore.set(CHECKLIST_KEY, state);
  },

  // Prayer History & Daily Streak Checkbook
  async getPrayerHistory(): Promise<PrayerHistoryState> {
    const stored = await DataStore.get(PRAYER_HISTORY_KEY);
    if (stored) {
      return stored;
    }
    const defaultState: PrayerHistoryState = {
      records: {},
      currentStreak: 0,
      bestStreak: 0,
    };
    return defaultState;
  },

  async savePrayerHistory(state: PrayerHistoryState): Promise<void> {
    await DataStore.set(PRAYER_HISTORY_KEY, state);
  },

  async togglePrayerCheck(
    dateStr: string,
    prayerName: PrayerName,
  ): Promise<PrayerHistoryState> {
    const history = await StorageService.getPrayerHistory();
    const records = { ...history.records };

    const dayRecord: DailyPrayerCheck = records[dateStr] || {
      Fajr: false,
      Sunrise: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
    };

    dayRecord[prayerName] = !dayRecord[prayerName];
    records[dateStr] = dayRecord;

    // Calculate prayer streak (days where all 5 obligatory prayers Fajr, Dhuhr, Asr, Maghrib, Isha were offered)
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const rec = records[dStr];

      if (rec && rec.Fajr && rec.Dhuhr && rec.Asr && rec.Maghrib && rec.Isha) {
        currentStreak++;
      } else {
        if (i === 0) {
          // If today isn't fully completed yet, continue checking yesterday for ongoing streak
          continue;
        }
        break;
      }
    }

    const newState: PrayerHistoryState = {
      records,
      currentStreak,
      bestStreak: Math.max(currentStreak, history.bestStreak),
    };

    await StorageService.savePrayerHistory(newState);
    return newState;
  },

  // Focus Session History
  async getFocusHistory(): Promise<FocusSession[]> {
    const stored = await DataStore.get(FOCUS_HISTORY_KEY);
    return Array.isArray(stored) ? stored : [];
  },

  async saveFocusSession(session: FocusSession): Promise<void> {
    const existing = await StorageService.getFocusHistory();
    const updated = [session, ...existing].slice(0, 500);
    await DataStore.set(FOCUS_HISTORY_KEY, updated);
  },

  // Gamification
  async getGamification(): Promise<GamificationState> {
    const stored = await DataStore.get(GAMIFICATION_KEY);
    return stored
      ? { ...DEFAULT_GAMIFICATION, ...stored }
      : DEFAULT_GAMIFICATION;
  },

  async saveGamification(state: GamificationState): Promise<void> {
    await DataStore.set(GAMIFICATION_KEY, state);
  },

  // Productivity (habits, quick tasks, pomodoro)
  async getProductivityState(): Promise<ProductivityState> {
    const today = getTodayDateString();
    const stored = await DataStore.get(PRODUCTIVITY_KEY);
    if (stored) {
      const state: ProductivityState = stored;
      if (state.date !== today) {
        const resetHabits = state.habits.map((h) => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          const keepStreak = h.lastCompletedDate === yesterdayStr;
          return {
            ...h,
            completedToday: false,
            streak: keepStreak ? h.streak : 0,
          };
        });
        const resetState: ProductivityState = {
          date: today,
          habits: resetHabits,
          pomodoroCount: 0,
          quickTasks: [],
          waterMl: 0,
        };
        await StorageService.saveProductivityState(resetState);
        return resetState;
      }
      return { ...state, waterMl: state.waterMl ?? 0 };
    }

    const newState: ProductivityState = {
      date: today,
      habits: DEFAULT_HABITS,
      pomodoroCount: 0,
      quickTasks: [],
      waterMl: 0,
    };
    await StorageService.saveProductivityState(newState);
    return newState;
  },

  async saveProductivityState(state: ProductivityState): Promise<void> {
    await DataStore.set(PRODUCTIVITY_KEY, state);
  },

  // Water tracking
  async getWaterToday(): Promise<number> {
    const state = await StorageService.getProductivityState();
    return state.waterMl ?? 0;
  },

  async logWaterToday(amountMl: number): Promise<number> {
    const state = await StorageService.getProductivityState();
    const waterMl = (state.waterMl ?? 0) + amountMl;
    await StorageService.saveProductivityState({ ...state, waterMl });
    return waterMl;
  },
};
