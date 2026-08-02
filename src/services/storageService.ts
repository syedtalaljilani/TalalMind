import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, PrayerTimings, LessonProgress, DailyChecklistState, PrayerHistoryState, PrayerName, DailyPrayerCheck, FocusSession } from '../types';

const SETTINGS_KEY = '@daily_planner_settings_v1';
const PRAYER_CACHE_KEY_PREFIX = '@daily_planner_prayer_';
const LESSON_PROGRESS_KEY = '@daily_planner_lessons_v1';
const CHECKLIST_KEY = '@daily_planner_checklists_v1';
const PRAYER_HISTORY_KEY = '@daily_planner_prayer_history_v1';
const FOCUS_HISTORY_KEY = '@daily_planner_focus_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  officeStart: '09:00',
  officeEnd: '17:00',
  commuteMinutes: 50,
  gymStart: '06:15',
  sleepStart: '22:30',
  cityName: 'Auto GPS',
  latitude: 24.8607,
  longitude: 67.0011,
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  completedIds: [],
  lastCompletedDate: null,
  currentStreak: 0,
  bestStreak: 0,
};

export const DEFAULT_OFFICE_TASKS = [
  { id: 'off-1', title: 'Review today’s sprint tickets & PRs', completed: false, category: 'office' as const, createdAt: new Date().toISOString() },
  { id: 'off-2', title: 'Complete high-priority client deliverable', completed: false, category: 'office' as const, createdAt: new Date().toISOString() },
  { id: 'off-3', title: 'Sync with team on blockers', completed: false, category: 'office' as const, createdAt: new Date().toISOString() },
];

export const DEFAULT_SHIPATHON_TASKS = [
  { id: 'ship-1', title: 'Implement core hackathon component', completed: false, category: 'shipathon' as const, createdAt: new Date().toISOString() },
  { id: 'ship-2', title: 'Push updated build to repo & test UI', completed: false, category: 'shipathon' as const, createdAt: new Date().toISOString() },
  { id: 'ship-3', title: 'Prepare demo recording snippet', completed: false, category: 'shipathon' as const, createdAt: new Date().toISOString() },
];

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StorageService = {
  // Settings
  async getSettings(): Promise<UserSettings> {
    try {
      const json = await AsyncStorage.getItem(SETTINGS_KEY);
      return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  // Prayer cache
  async getCachedPrayerTimes(dateStr: string): Promise<PrayerTimings | null> {
    try {
      const json = await AsyncStorage.getItem(PRAYER_CACHE_KEY_PREFIX + dateStr);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async savePrayerTimes(dateStr: string, timings: PrayerTimings): Promise<void> {
    try {
      await AsyncStorage.setItem(PRAYER_CACHE_KEY_PREFIX + dateStr, JSON.stringify(timings));
    } catch (e) {
      console.error('Failed to save prayer cache', e);
    }
  },

  // Lesson Progress
  async getLessonProgress(): Promise<LessonProgress> {
    try {
      const json = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
      return json ? JSON.parse(json) : DEFAULT_LESSON_PROGRESS;
    } catch {
      return DEFAULT_LESSON_PROGRESS;
    }
  },

  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save lesson progress', e);
    }
  },

  // Checklists (with automatic daily reset at midnight)
  async getDailyChecklists(): Promise<DailyChecklistState> {
    const today = getTodayDateString();
    try {
      const json = await AsyncStorage.getItem(CHECKLIST_KEY);
      if (json) {
        const state: DailyChecklistState = JSON.parse(json);
        if (state.date !== today) {
          const resetState: DailyChecklistState = {
            date: today,
            officeTasks: state.officeTasks.map(t => ({ ...t, completed: false })),
            shipathonTasks: state.shipathonTasks.map(t => ({ ...t, completed: false })),
          };
          await StorageService.saveDailyChecklists(resetState);
          return resetState;
        }
        return state;
      }
    } catch (e) {
      console.error('Error fetching checklists', e);
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
    try {
      await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save checklists', e);
    }
  },

  // Prayer History & Daily Streak Checkbook
  async getPrayerHistory(): Promise<PrayerHistoryState> {
    try {
      const json = await AsyncStorage.getItem(PRAYER_HISTORY_KEY);
      if (json) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.error('Error fetching prayer history', e);
    }

    const defaultState: PrayerHistoryState = {
      records: {},
      currentStreak: 0,
      bestStreak: 0,
    };
    return defaultState;
  },

  async savePrayerHistory(state: PrayerHistoryState): Promise<void> {
    try {
      await AsyncStorage.setItem(PRAYER_HISTORY_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save prayer history', e);
    }
  },

  async togglePrayerCheck(dateStr: string, prayerName: PrayerName): Promise<PrayerHistoryState> {
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
      const dStr = d.toISOString().split('T')[0];
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
    try {
      const json = await AsyncStorage.getItem(FOCUS_HISTORY_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveFocusSession(session: FocusSession): Promise<void> {
    try {
      const existing = await StorageService.getFocusHistory();
      const updated = [session, ...existing].slice(0, 200); // keep last 200
      await AsyncStorage.setItem(FOCUS_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save focus session', e);
    }
  },
};
