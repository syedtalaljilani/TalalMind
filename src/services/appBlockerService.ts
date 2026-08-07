import { Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import type {
  AndroidBlockableApp,
  IOSBlockedItem,
  PermissionStatus,
} from "expo-app-blocker";

const BLOCKER_SELECTION_KEY = "@talalmind_blocker_selection_v1";

export interface BlockerSelection {
  androidPackages: string[];
  iosItems: IOSBlockedItem[];
  iosSelectionData: string;
}

export interface ApplyResult {
  ok: boolean;
  count: number;
  error?: string;
}

const EMPTY_SELECTION: BlockerSelection = {
  androidPackages: [],
  iosItems: [],
  iosSelectionData: "",
};

let loadedModule: unknown = undefined;
let monitoring = false;
let manualFocusActive = false;

// expo-app-blocker is a custom native module: it only exists inside a
// development/production build, never in Expo Go.
function canUseNativeModule(): boolean {
  if (Constants.executionEnvironment === "storeClient") return false;
  if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
  return true;
}

function blocker(): any {
  if (!canUseNativeModule()) return null;
  if (loadedModule === undefined) {
    try {
      loadedModule = require("expo-app-blocker");
    } catch {
      loadedModule = null;
    }
  }
  return loadedModule;
}

export const AppBlockerService = {
  /** True only if the native module actually loaded in this build. */
  hasNativeModule(): boolean {
    return blocker() !== null;
  },

  isSupported(): boolean {
    return canUseNativeModule() && this.hasNativeModule();
  },

  isMonitoring(): boolean {
    return monitoring;
  },

  /** Set while a manual focus timer session is running (auto-block won't interfere). */
  setManualFocusActive(active: boolean): void {
    manualFocusActive = active;
  },

  isManualFocusActive(): boolean {
    return manualFocusActive;
  },

  async getPermissionStatus(): Promise<PermissionStatus | null> {
    const m = blocker();
    if (!m) return null;
    try {
      return await m.getPermissionStatus();
    } catch {
      return null;
    }
  },

  async requestPermissions(): Promise<PermissionStatus | null> {
    const m = blocker();
    if (!m) return null;
    try {
      return await m.requestPermissions();
    } catch {
      return null;
    }
  },

  /** Request POST_NOTIFICATIONS on Android 13+ (required for the foreground service). */
  async requestNotificationsPermission(): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    const sdk = parseInt(String(Platform.Version), 10) || 0;
    if (sdk < 33) return true;
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  },

  openOverlaySettings(): void {
    const m = blocker();
    if (m && Platform.OS === "android") m.openOverlaySettings?.();
  },

  openUsageStatsSettings(): void {
    const m = blocker();
    if (m && Platform.OS === "android") m.openUsageStatsSettings?.();
  },

  async getInstalledApps(): Promise<AndroidBlockableApp[]> {
    const m = blocker();
    if (!m || Platform.OS !== "android") return [];
    try {
      return await m.getInstalledApps();
    } catch {
      return [];
    }
  },

  async loadSelection(): Promise<BlockerSelection> {
    try {
      const json = await AsyncStorage.getItem(BLOCKER_SELECTION_KEY);
      if (json) return { ...EMPTY_SELECTION, ...JSON.parse(json) };
    } catch {
      // ignore
    }
    return EMPTY_SELECTION;
  },

  async saveSelection(selection: BlockerSelection): Promise<void> {
    try {
      await AsyncStorage.setItem(
        BLOCKER_SELECTION_KEY,
        JSON.stringify(selection),
      );
    } catch {
      // ignore
    }
  },

  /** Theme the Android overlay + notification to match the app. */
  configureOverlayTheme(): void {
    const m = blocker();
    if (!m || Platform.OS !== "android") return;
    try {
      m.configureAndroid({
        overlayTitle: "Focus Time",
        overlayText: "{appName} is blocked until your focus session ends.",
        overlayBackgroundColor: "#0F1424",
        overlayTitleColor: "#F8FAFC",
        overlayTextColor: "#94A3B8",
        overlayTitleFontSize: 24,
        overlayTextFontSize: 15,
        notificationTitle: "App Blocked",
        notificationText: "{appName} is blocked during focus time.",
      });
    } catch {
      // ignore
    }
  },

  async applyForFocus(): Promise<ApplyResult> {
    const m = blocker();
    if (!m) {
      return {
        ok: false,
        count: 0,
        error: "Native module missing — rebuild the app.",
      };
    }
    try {
      const selection = await this.loadSelection();

      if (Platform.OS === "android") {
        if (selection.androidPackages.length === 0) {
          return { ok: false, count: 0, error: "No apps selected." };
        }
        m.setBlockedApps(selection.androidPackages);
        m.startMonitoring();
        monitoring = true;
        return { ok: true, count: selection.androidPackages.length };
      }

      if (Platform.OS === "ios") {
        if (selection.iosItems.length === 0) {
          return { ok: false, count: 0, error: "No apps selected." };
        }
        await m.setBlockConfiguration({
          blockedItems: selection.iosItems,
          isActive: true,
        });
        monitoring = true;
        return { ok: true, count: selection.iosItems.length };
      }

      return { ok: false, count: 0, error: "Unsupported platform." };
    } catch (e) {
      return {
        ok: false,
        count: 0,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },

  async stopForFocus(): Promise<void> {
    monitoring = false;
    const m = blocker();
    if (!m) return;
    try {
      if (Platform.OS === "android") {
        m.stopMonitoring();
      } else if (Platform.OS === "ios") {
        await m.setBlockConfiguration({
          blockedItems: [],
          isActive: false,
        });
      }
    } catch (e) {
      console.warn("[AppBlocker] stopForFocus failed", e);
    }
  },

  async getBlockedCount(): Promise<number> {
    const m = blocker();
    if (!m) return 0;
    try {
      if (Platform.OS === "android") {
        return (m.getBlockedApps() ?? []).length;
      }
      if (Platform.OS === "ios") {
        const config = m.getBlockConfiguration?.();
        return config?.blockedItems?.length ?? 0;
      }
    } catch {
      // ignore
    }
    return 0;
  },
};
