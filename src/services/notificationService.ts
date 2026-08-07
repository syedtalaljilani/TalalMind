import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { PrayerTimings, UserSettings } from "../types";
import { generateDailyTimeline, formatTo12Hour } from "../utils/timelineUtils";

const TIMETABLE_CHANNEL = "timetable";
const WATER_CHANNEL = "water";

// Show notifications even while the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let schedulingInFlight = false;

const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const channel = (id: string, name: string) =>
  Platform.OS === "android"
    ? Notifications.setNotificationChannelAsync(id, {
        name,
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      })
    : Promise.resolve(null);

const scheduleDaily = (
  title: string,
  body: string,
  hour: number,
  minute: number,
  channelId: string,
) => {
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId,
    },
  });
};

const parseTime = (time: string): { hour: number; minute: number } => {
  const [h, m] = time.split(":").map(Number);
  return { hour: (h || 0) % 24, minute: m || 0 };
};

export const NotificationService = {
  /** Request permission (if needed) and create Android channels. */
  async ensurePermissions(): Promise<boolean> {
    try {
      await channel(TIMETABLE_CHANNEL, "Timetable");
      await channel(WATER_CHANNEL, "Water Reminders");
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") return true;
      const req = await Notifications.requestPermissionsAsync();
      return req.status === "granted";
    } catch (e) {
      console.warn("[Notifications] permission setup failed", e);
      return false;
    }
  },

  /**
   * (Re)schedule today's timetable + water reminders.
   * Cancels all scheduled notifications first so settings/prayer-time changes
   * take effect. Safe to call repeatedly.
   */
  async reschedule(
    timings?: PrayerTimings,
    settings?: UserSettings,
  ): Promise<void> {
    if (schedulingInFlight) return;
    schedulingInFlight = true;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (timings && settings) {
        await NotificationService.scheduleTimetable(timings, settings);
      }
      await NotificationService.scheduleWater();
    } catch (e) {
      // Notifications are best-effort; never let a scheduling failure break the app.
      console.warn("[Notifications] schedule failed", e);
    } finally {
      schedulingInFlight = false;
    }
  },

  /** Timetable notifications: prayers + focus blocks + sleep force. */
  async scheduleTimetable(
    timings: PrayerTimings,
    settings: UserSettings,
  ): Promise<void> {
    for (const name of prayerOrder) {
      const time = timings[name];
      if (!time) continue;
      const { hour, minute } = parseTime(time);
      await scheduleDaily(
        `🕌 ${name} Prayer`,
        `Time for ${name} salah at ${formatTo12Hour(time)}`,
        hour,
        minute,
        TIMETABLE_CHANNEL,
      );
    }

    const timeline = generateDailyTimeline(timings, settings);
    for (const item of timeline) {
      if (!item.startTime) continue;
      let title: string;
      switch (item.type) {
        case "gym_workout":
          title = "🏋️ Home Workout";
          break;
        case "office_core":
          title = "🏢 Office Core Work";
          break;
        case "shipathon_block":
          title = "🚀 Ship-a-thon Hackathon";
          break;
        case "learning_block":
          title = item.title.includes("FDE")
            ? "🚀 FDE Study Slot"
            : "📚 AI Study Slot";
          break;
        case "sleep_force":
          title = "🌙 Sleep Force";
          break;
        default:
          continue;
      }
      const { hour, minute } = parseTime(item.startTime);
      await scheduleDaily(
        title,
        item.subTitle || `Time for ${item.title} (${formatTo12Hour(item.startTime)})`,
        hour,
        minute,
        TIMETABLE_CHANNEL,
      );
    }
  },

  /** Hourly water reminders through the day. */
  async scheduleWater(): Promise<void> {
    const waterHours = 9;
    const waterEnd = 21;
    for (let hour = waterHours; hour <= waterEnd; hour++) {
      await scheduleDaily(
        "💧 Water Break",
        "Time to hydrate — grab a glass of water!",
        hour,
        0,
        WATER_CHANNEL,
      );
    }
  },
};
