import { Platform } from "react-native";
import { AppBlockerSettings } from "../types";

let blockerModule: typeof import("expo-app-blocker") | null = null;
let moduleLoadAttempted = false;

const loadModule = async () => {
  if (moduleLoadAttempted) return blockerModule;
  moduleLoadAttempted = true;
  try {
    blockerModule = await import("expo-app-blocker");
  } catch {
    blockerModule = null;
  }
  return blockerModule;
};

export const AppBlockerService = {
  isAvailable(): boolean {
    return blockerModule !== null;
  },

  async init(): Promise<boolean> {
    const mod = await loadModule();
    if (!mod) return false;

    if (Platform.OS === "android") {
      mod.configureAndroid({
        overlayTitle: "Focus Mode Active",
        overlayText: "{appName} is blocked. Stay focused on TalalMind!",
        overlayBackgroundColor: "#090A0F",
        overlayTitleColor: "#F8FAFC",
        overlayTextColor: "#94A3B8",
        overlayTitleFontSize: 24,
        overlayTextFontSize: 16,
        overlayTitleBold: true,
        overlayPadding: 32,
        notificationTitle: "TalalMind Focus",
        notificationText: "{appName} is blocked. Tap to return.",
      });
      mod.startMonitoring();
    }
    return true;
  },

  async requestPermissions(): Promise<boolean> {
    const mod = await loadModule();
    if (!mod) return false;
    try {
      const result = await mod.requestPermissions();
      return result.allGranted;
    } catch {
      return false;
    }
  },

  async getPermissionStatus(): Promise<{
    granted: boolean;
    available: boolean;
  }> {
    const mod = await loadModule();
    if (!mod) return { granted: false, available: false };
    try {
      const status = await mod.getPermissionStatus();
      return { granted: status.allGranted, available: true };
    } catch {
      return { granted: false, available: true };
    }
  },

  async activateBlocking(settings: AppBlockerSettings): Promise<boolean> {
    if (!settings.enabled || !settings.blockDuringFocus) return false;
    const mod = await loadModule();
    if (!mod) return false;

    try {
      if (
        Platform.OS === "android" &&
        settings.androidBlockedPackages.length > 0
      ) {
        mod.setBlockedApps(settings.androidBlockedPackages);
        mod.startMonitoring();
        return true;
      }
      if (Platform.OS === "ios" && settings.iosSelectionData) {
        const current = await mod.getBlockConfiguration();
        if (current) {
          await mod.setBlockConfiguration({ ...current, isActive: true });
          return true;
        }
        await mod.setBlockConfiguration({ blockedItems: [], isActive: true });
        return true;
      }
    } catch (e) {
      console.warn("App blocker activation failed:", e);
    }
    return false;
  },

  async deactivateBlocking(): Promise<void> {
    const mod = await loadModule();
    if (!mod) return;
    try {
      if (Platform.OS === "ios") {
        await mod.clearAllBlocks();
      }
      if (Platform.OS === "android") {
        mod.setBlockedApps([]);
        mod.stopMonitoring();
      }
    } catch (e) {
      console.warn("App blocker deactivation failed:", e);
    }
  },

  async openPermissionSettings(): Promise<void> {
    const mod = await loadModule();
    if (!mod) return;
    if (Platform.OS === "android") {
      mod.openUsageStatsSettings();
    }
  },

  async openOverlaySettings(): Promise<void> {
    const mod = await loadModule();
    if (!mod) return;
    if (Platform.OS === "android") {
      mod.openOverlaySettings();
    }
  },

  async getInstalledApps(): Promise<{ packageName: string; name: string }[]> {
    const mod = await loadModule();
    if (!mod || Platform.OS !== "android") return [];
    try {
      return await mod.getInstalledApps();
    } catch {
      return [];
    }
  },

  async saveIOSSelection(
    selectionData: string,
    items: unknown[],
  ): Promise<boolean> {
    const mod = await loadModule();
    if (!mod || Platform.OS !== "ios") return false;
    try {
      await mod.setBlockConfiguration({
        blockedItems: items as Parameters<
          typeof mod.setBlockConfiguration
        >[0]["blockedItems"],
        isActive: false,
      });
      return true;
    } catch {
      return false;
    }
  },

  async presentIOSPicker(): Promise<{
    selectionData: string;
    items: unknown[];
  } | null> {
    const mod = await loadModule();
    if (!mod || Platform.OS !== "ios") return null;
    try {
      const items = await mod.presentFamilyActivityPicker();
      return { selectionData: "", items };
    } catch {
      return null;
    }
  },
};
