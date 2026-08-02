import { PrayerTimings } from '../types';
import { StorageService, getTodayDateString } from './storageService';

export const DEFAULT_PRAYER_TIMES: PrayerTimings = {
  Fajr: '04:45',
  Sunrise: '06:05',
  Dhuhr: '12:30',
  Asr: '16:00',
  Maghrib: '19:15',
  Isha: '20:30',
};

// Simple helper to format time string "HH:MM (PKT)" -> "HH:MM"
const cleanTimeString = (rawTime: string): string => {
  if (!rawTime) return '12:00';
  return rawTime.split(' ')[0].trim();
};

export const PrayerService = {
  async getPrayerTimes(latitude: number, longitude: number, forceRefresh = false): Promise<PrayerTimings> {
    const today = getTodayDateString();

    // Check cache first if not force refresh
    if (!forceRefresh) {
      const cached = await StorageService.getCachedPrayerTimes(today);
      if (cached) {
        return cached;
      }
    }

    try {
      // Format DD-MM-YYYY for AlAdhan API
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.code === 200 && data.data && data.data.timings) {
        const t = data.data.timings;
        const timings: PrayerTimings = {
          Fajr: cleanTimeString(t.Fajr),
          Sunrise: cleanTimeString(t.Sunrise),
          Dhuhr: cleanTimeString(t.Dhuhr),
          Asr: cleanTimeString(t.Asr),
          Maghrib: cleanTimeString(t.Maghrib),
          Isha: cleanTimeString(t.Isha),
        };

        // Cache result locally
        await StorageService.savePrayerTimes(today, timings);
        return timings;
      }
    } catch (e) {
      console.warn('Network request failed for prayer times, falling back to cache or defaults:', e);
    }

    // Try cached value if available, else default fallback
    const cached = await StorageService.getCachedPrayerTimes(today);
    return cached || DEFAULT_PRAYER_TIMES;
  },
};
