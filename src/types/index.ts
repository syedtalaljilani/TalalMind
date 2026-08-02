export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface UserSettings {
  officeStart: string; // e.g. "09:00"
  officeEnd: string;   // e.g. "17:00"
  commuteMinutes: number; // e.g. 50
  gymStart: string;    // e.g. "06:15"
  sleepStart: string;  // e.g. "22:30"
  cityName: string;
  latitude: number | null;
  longitude: number | null;
  lastUpdated: string;
}

export type TimelineItemType = 
  | 'prayer' 
  | 'gym_workout'
  | 'commute_to_office' 
  | 'office_core' 
  | 'shipathon_block' 
  | 'lunch_break' 
  | 'learning_block' 
  | 'wrapup_buffer' 
  | 'commute_to_home'
  | 'sleep_force';

export interface TimelineItem {
  id: string;
  title: string;
  subTitle?: string;
  startTime: string; // "HH:MM"
  endTime?: string;   // "HH:MM"
  type: TimelineItemType;
  iconName: string;
  badgeText?: string;
  color: string;
  isPrayer?: boolean;
  prayerName?: PrayerName;
  isCurrentActive?: boolean;
  isPast?: boolean;
  isPrayerChecked?: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  module: string;
  description: string;
  type?: string;
  lang?: string;
  url?: string;
  completed?: boolean;
  completedDate?: string;
}

export interface LessonProgress {
  completedIds: number[];
  lastCompletedDate: string | null;
  currentStreak: number;
  bestStreak: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'office' | 'shipathon';
  createdAt: string;
}

export interface DailyChecklistState {
  date: string;
  officeTasks: ChecklistItem[];
  shipathonTasks: ChecklistItem[];
}

export type DailyPrayerCheck = Record<PrayerName, boolean>;

export interface PrayerHistoryState {
  records: Record<string, DailyPrayerCheck>;
  currentStreak: number;
  bestStreak: number;
}
