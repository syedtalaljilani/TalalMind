import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { StorageService, getTodayDateString } from "./storageService";
import { DEFAULT_PRAYER_TIMES } from "./prayerService";
import { AppBlockerService } from "./appBlockerService";
import { generateDailyTimeline, timeToMinutes } from "../utils/timelineUtils";

const AUTO_BLOCK_KEY = "@talalmind_auto_block_v1";
const EVAL_INTERVAL_MS = 60_000;
const BACKGROUND_TASK_NAME = "talalmind-auto-block";

let started = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

// Global scope — the task must be defined before it can be scheduled.
// Runs even when the app process was killed (WorkManager on Android,
// BGTaskScheduler on iOS), so Sleep Force can auto-enable around midnight.
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    await AutoBlockService.evaluate();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

const inRange = (nowMins: number, start: number, end: number) =>
  start <= nowMins && nowMins < end;

export const AutoBlockService = {
  /** Defaults to ON. */
  async isEnabled(): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(AUTO_BLOCK_KEY);
      return raw === null ? true : raw === "true";
    } catch {
      return true;
    }
  },

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_BLOCK_KEY, String(enabled));
    } catch {
      // ignore
    }
    if (enabled) {
      await AutoBlockService.evaluate();
    } else if (!AppBlockerService.isManualFocusActive()) {
      await AppBlockerService.stopForFocus();
    }
    await AutoBlockService.syncBackgroundTask();
  },

  /**
   * Keep the background task registered only while auto-block is enabled.
   * Runs on a ~15 min minimum interval (WorkManager/BGTaskScheduler),
   * so Sleep Force can still switch blocking on when the app is killed.
   */
  async syncBackgroundTask(): Promise<void> {
    try {
      const enabled = await AutoBlockService.isEnabled();
      const registered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_TASK_NAME,
      );
      if (enabled && !registered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 15,
        });
      } else if (!enabled && registered) {
        await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_NAME);
      }
    } catch (e) {
      console.warn("[AutoBlock] background task sync failed", e);
    }
  },

  async getStatus(): Promise<{
    enabled: boolean;
    monitoring: boolean;
    inWindow: boolean;
    reason: string;
  }> {
    const enabled = await AutoBlockService.isEnabled();
    const { inWindow, reason } = await AutoBlockService.computeWindow();
    return {
      enabled,
      monitoring: AppBlockerService.isMonitoring(),
      inWindow,
      reason,
    };
  },

  /**
   * True when the current time is inside a block window:
   * - Sleep Force: from settings.sleepStart until Fajr (crosses midnight), or
   * - an active focusable timeline block (gym, office core, shipathon, study slots).
   */
  async computeWindow(): Promise<{ inWindow: boolean; reason: string }> {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const settings = await StorageService.getSettings();
    const cachedTimings = await StorageService.getCachedPrayerTimes(
      getTodayDateString(),
    );
    const timings = cachedTimings || DEFAULT_PRAYER_TIMES;
    const fajrMins = timeToMinutes(timings.Fajr || DEFAULT_PRAYER_TIMES.Fajr);
    const sleepStartMins = timeToMinutes(settings.sleepStart || "22:30");

    // Sleep window wraps midnight: [sleepStart, 1440) ∪ [0, Fajr)
    if (nowMins >= sleepStartMins || nowMins < fajrMins) {
      return { inWindow: true, reason: "Sleep Force" };
    }

    const timeline = generateDailyTimeline(timings, settings);
    for (const item of timeline) {
      if (!item.isFocusable || !item.startTime || !item.endTime) continue;
      const start = timeToMinutes(item.startTime);
      const end = timeToMinutes(item.endTime);
      if (inRange(nowMins, start, end)) {
        return { inWindow: true, reason: item.title };
      }
    }

    return { inWindow: false, reason: "No active block window" };
  },

  /** Start/stop native monitoring to match the current schedule. */
  async evaluate(): Promise<void> {
    if (!AppBlockerService.hasNativeModule()) return;
    // A running manual focus session owns the blocker — don't touch it.
    if (AppBlockerService.isManualFocusActive()) return;

    const enabled = await AutoBlockService.isEnabled();
    const { inWindow } = await AutoBlockService.computeWindow();

    if (enabled && inWindow) {
      if (!AppBlockerService.isMonitoring()) {
        AppBlockerService.configureOverlayTheme();
        await AppBlockerService.applyForFocus();
      }
    } else if (AppBlockerService.isMonitoring()) {
      await AppBlockerService.stopForFocus();
    }
  },

  /** Evaluate on launch, then every minute, and whenever the app comes to foreground. */
  start(): void {
    if (started) return;
    started = true;
    void AutoBlockService.evaluate();
    void AutoBlockService.syncBackgroundTask();
    intervalId = setInterval(() => {
      void AutoBlockService.evaluate();
    }, EVAL_INTERVAL_MS);
    AppState.addEventListener("change", (state) => {
      if (state === "active") void AutoBlockService.evaluate();
    });
  },

  stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    started = false;
  },
};
