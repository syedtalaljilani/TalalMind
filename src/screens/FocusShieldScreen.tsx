import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBlockerService } from "../services/appBlockerService";
import { AutoBlockService } from "../services/autoBlockService";
import type {
  AndroidBlockableApp,
  FamilyActivityPickerSelectionEvent,
  PermissionStatus,
} from "expo-app-blocker";

interface Props {
  onClose: () => void;
}

const GOOGLE_PLAY_APP_IDS = [
  "com.instagram.android",
  "com.google.android.youtube",
  "com.whatsapp",
  "com.facebook.katana",
  "com.twitter.android",
  "com.snapchat.android",
  "com.tiktok.android",
  "com.netflix.mediaclient",
  "com.spotify.music",
  "com.pinterest",
  "tv.twitch.android.app",
  "com.reddit.frontpage",
];

export const FocusShieldScreen: React.FC<Props> = ({ onClose }) => {
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null);
  const [installedApps, setInstalledApps] = useState<AndroidBlockableApp[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [PickerComponent, setPickerComponent] = useState<
    React.ComponentType<any> | null
  >(null);
  const [iosSelectionData, setIosSelectionData] = useState("");
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(AppBlockerService.isSupported());
  const [moduleLoaded, setModuleLoaded] = useState(
    AppBlockerService.hasNativeModule(),
  );
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState("");
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [autoStatus, setAutoStatus] = useState("");

  const refreshAuto = useCallback(async () => {
    const status = await AutoBlockService.getStatus();
    setAutoEnabled(status.enabled);
    setAutoStatus(
      status.monitoring
        ? `Blocking is ON now — ${status.reason}`
        : status.inWindow
          ? `Active window (${status.reason}) — enabling blocking`
          : "Auto-blocks during Sleep Force & focus blocks",
    );
  }, []);

  const refreshPermissions = useCallback(async () => {
    if (!AppBlockerService.isSupported()) return;
    const permission = await AppBlockerService.getPermissionStatus();
    setPermissions(permission);
  }, []);

  const loadAndroid = useCallback(async () => {
    const apps = await AppBlockerService.getInstalledApps();
    setInstalledApps(apps);
    const selection = await AppBlockerService.loadSelection();
    setSelected(selection.androidPackages);
  }, []);

  useEffect(() => {
    AppBlockerService.configureOverlayTheme();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshPermissions();
    });
    return () => sub.remove();
  }, [refreshPermissions]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!AppBlockerService.isSupported()) {
        if (mounted) setLoading(false);
        return;
      }

      await refreshPermissions();

      if (Platform.OS === "ios") {
        const selection = await AppBlockerService.loadSelection();
        if (mounted) setIosSelectionData(selection.iosSelectionData);
        try {
          const m = require("expo-app-blocker");
          if (mounted) setPickerComponent(() => m.FamilyActivityPickerView);
        } catch {
          // not available
        }
      } else if (Platform.OS === "android") {
        await loadAndroid();
      }
      if (mounted) setLoading(false);
    };

    init();
    return () => {
      mounted = false;
    };
  }, [loadAndroid]);

  const handleIosSelection = async (
    event: FamilyActivityPickerSelectionEvent,
  ) => {
    const items = event.items.filter(
      (item) =>
        item.type === "app" ||
        item.type === "category" ||
        item.type === "webDomain",
    );
    setIosSelectionData(event.selectionData);
    await AppBlockerService.saveSelection({
      androidPackages: [],
      iosItems: items,
      iosSelectionData: event.selectionData,
    });
  };

  const toggleBlocked = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((p) => p !== id)
      : [...selected, id];
    setSelected(next);
    AppBlockerService.saveSelection({
      androidPackages: next,
      iosItems: [],
      iosSelectionData: "",
    });
  };

  const renderAutoBlock = () => (
    <View style={styles.autoCard}>
      <View style={styles.autoHeader}>
        <View style={styles.autoTitleRow}>
          <Ionicons
            name="moon-outline"
            size={18}
            color={autoEnabled ? "#6366F1" : "#64748B"}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.autoTitle}>Auto-block schedule</Text>
            <Text style={styles.autoStatus}>{autoStatus}</Text>
          </View>
        </View>
        <Switch
          value={autoEnabled}
          onValueChange={async (v) => {
            setAutoEnabled(v);
            await AutoBlockService.setEnabled(v);
            await refreshAuto();
          }}
          trackColor={{ true: "#6366F1", false: "#26293D" }}
          thumbColor={autoEnabled ? "#F8FAFC" : "#64748B"}
        />
      </View>
      <Text style={styles.autoHint}>
        Blocks the apps below automatically during Sleep Force (sleep start →
        Fajr) and every focus block (gym, office, ship-a-thon, study slots).
        Also checks in the background (every ~15 min) so it kicks in even when
        the app isn't open.
      </Text>
    </View>
  );

  const renderIos = () => {
    const authorized = permissions?.details?.platform === "ios"
      ? (permissions.details as any).authorized
      : false;

    return (
      <View style={styles.body}>
        {renderAutoBlock()}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#38BDF8" />
          <Text style={styles.infoText}>
            Pick apps to block during focus sessions. When your focus timer is
            running, opening them shows a shield until you finish.
          </Text>
        </View>

        {!authorized ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              const result = await AppBlockerService.requestPermissions();
              setPermissions(result);
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>Enable Screen Time</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.pickerCard}>
            {PickerComponent ? (
              <PickerComponent
                initialSelection={iosSelectionData}
                onSelectionChange={handleIosSelection}
                theme="dark"
                style={{ height: 460 }}
              />
            ) : (
              <ActivityIndicator color="#6366F1" />
            )}
          </View>
        )}
      </View>
    );
  };

  const renderAndroid = () => {
    const d = permissions?.details;
    const isAndroid = d?.platform === "android";
    const overlayGranted = isAndroid ? (d as any).overlay : false;
    const usageGranted = isAndroid ? (d as any).usageStats : false;
    const notifGranted = isAndroid ? (d as any).notifications : false;

    const startTest = async () => {
      setTestStatus("");
      const result = await AppBlockerService.applyForFocus();
      if (!result.ok) {
        Alert.alert("Blocking didn't start", result.error ?? "Unknown error");
        return;
      }
      setTesting(true);
      setTestStatus(
        `Blocking is now active on ${result.count} app(s). Open one of them to see the shield. When done, tap "Stop test".`,
      );
      await refreshAuto();
    };

    const stopTest = async () => {
      await AppBlockerService.stopForFocus();
      setTesting(false);
      setTestStatus("Test stopped. Blocking is off.");
      await refreshAuto();
    };

    return (
      <View style={styles.body}>
        {renderAutoBlock()}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#38BDF8" />
          <Text style={styles.infoText}>
            Blocked apps are locked while monitoring is on. Start a focus
            session to auto-enable it, or use the test toggle below to verify
            right now.
          </Text>
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Usage access</Text>
              <Text style={styles.permissionSub}>
                Detects when a blocked app is opened
              </Text>
            </View>
            {usageGranted ? (
              <Text style={styles.grantedText}>Granted ✓</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => AppBlockerService.openUsageStatsSettings()}
              >
                <Text style={styles.smallBtnText}>Grant</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.permissionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Display over other apps</Text>
              <Text style={styles.permissionSub}>
                Shows the blocking overlay on top of blocked apps
              </Text>
            </View>
            {overlayGranted ? (
              <Text style={styles.grantedText}>Granted ✓</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={() => AppBlockerService.openOverlaySettings()}
              >
                <Text style={styles.smallBtnText}>Grant</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.permissionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionSub}>
                Needed by Android to keep the blocker service running
              </Text>
            </View>
            {notifGranted ? (
              <Text style={styles.grantedText}>Granted ✓</Text>
            ) : (
              <TouchableOpacity
                style={styles.smallBtn}
                onPress={async () => {
                  await AppBlockerService.requestNotificationsPermission();
      await refreshPermissions();
      await refreshAuto();
                }}
              >
                <Text style={styles.smallBtnText}>Grant</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <Ionicons
              name={testing ? "shield-checkmark" : "shield-outline"}
              size={18}
              color={testing ? "#10B981" : "#6366F1"}
            />
            <Text style={styles.testTitle}>
              {testing ? "Blocking is ACTIVE" : "Verify blocking"}
            </Text>
            {AppBlockerService.isMonitoring() && !testing && (
              <Text style={styles.testLive}>monitoring active</Text>
            )}
          </View>
          {testStatus ? (
            <Text style={styles.testStatus}>{testStatus}</Text>
          ) : null}
          {testing ? (
            <TouchableOpacity style={styles.stopTestBtn} onPress={stopTest}>
              <Ionicons name="stop-circle-outline" size={16} color="#FFF" />
              <Text style={styles.stopTestText}>Stop test</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.startTestBtn}
              onPress={startTest}
              disabled={selected.length === 0}
            >
              <Ionicons name="play-circle-outline" size={16} color="#FFF" />
              <Text style={styles.startTestText}>
                Start blocking now (test)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.appListHeader}>
          <Text style={styles.appListTitle}>Block these apps</Text>
          <Text style={styles.appListCount}>{selected.length} selected</Text>
        </View>

        {installedApps.length === 0 ? (
          <Text style={styles.emptyText}>
            {loading
              ? "Loading apps..."
              : "No apps found. Grant the permissions above and pull back here."}
          </Text>
        ) : (
          installedApps.map((app) => {
            const isBlocked = selected.includes(app.packageName);
            return (
              <TouchableOpacity
                key={app.packageName}
                style={styles.appRow}
                onPress={() => toggleBlocked(app.packageName)}
              >
                <View style={styles.appIcon}>
                  <Ionicons name="logo-android" size={18} color="#94A3B8" />
                </View>
                <Text style={styles.appName}>{app.name}</Text>
                <Switch
                  value={isBlocked}
                  onValueChange={() => toggleBlocked(app.packageName)}
                  trackColor={{ true: "#6366F1", false: "#26293D" }}
                  thumbColor={isBlocked ? "#F8FAFC" : "#64748B"}
                />
              </TouchableOpacity>
            );
          })
        )}

        <Text style={styles.quickNote}>
          Popular distractions (add manually on Android if not installed):
        </Text>
        <View style={styles.quickRow}>
          {GOOGLE_PLAY_APP_IDS.map((id) => {
            const blocked = selected.includes(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.quickChip, blocked && styles.quickChipActive]}
                onPress={() => toggleBlocked(id)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    blocked && styles.quickChipTextActive,
                  ]}
                >
                  {id.split(".").pop()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Focus Shield</Text>
          <Text style={styles.subtitle}>Block distractions during focus</Text>
        </View>
        <Ionicons name="shield-outline" size={24} color="#38BDF8" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!supported ? (
          <View style={styles.unsupportedCard}>
            <Ionicons name="warning-outline" size={28} color="#F59E0B" />
            <Text style={styles.unsupportedTitle}>Not available here</Text>
            <Text style={styles.unsupportedText}>
              {!moduleLoaded && !AppBlockerService.isSupported()
                ? "The app blocker native module isn't in this build. Rebuild with npx expo run:android (or npx expo run:ios) and try again."
                : "App blocking needs a custom development build. Expo Go doesn't include the required native module. Rebuild the app with npx expo run:ios or npx expo run:android to enable Focus Shield."}
            </Text>
          </View>
        ) : loading ? (
          <ActivityIndicator color="#6366F1" style={{ marginTop: 60 }} />
        ) : Platform.OS === "ios" ? (
          renderIos()
        ) : (
          renderAndroid()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2030",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#11121C",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "#64748B", fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 40 },
  unsupportedCard: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0F1424",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    padding: 24,
    marginTop: 24,
  },
  unsupportedTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  unsupportedText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  body: { gap: 14 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0B1524",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    padding: 14,
  },
  infoText: { color: "#7DD3FC", fontSize: 13, flex: 1, lineHeight: 18 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  pickerCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E2030",
    backgroundColor: "#0F1424",
  },
  permissionCard: {
    backgroundColor: "#0F1424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2030",
    padding: 14,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  permissionTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "700" },
  permissionSub: { color: "#64748B", fontSize: 11, marginTop: 2 },
  grantedText: { color: "#10B981", fontSize: 13, fontWeight: "700" },
  smallBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  smallBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  appListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  appListTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  appListCount: { color: "#6366F1", fontSize: 13, fontWeight: "700" },
  emptyText: { color: "#64748B", textAlign: "center", paddingVertical: 24 },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0F1424",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2030",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  appIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1E2030",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: { color: "#CBD5E1", fontSize: 14, flex: 1, fontWeight: "600" },
  quickNote: { color: "#64748B", fontSize: 12, marginTop: 8, marginBottom: 8 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickChip: {
    backgroundColor: "#11121C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E2030",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickChipActive: {
    backgroundColor: "#6366F122",
    borderColor: "#6366F1",
  },
  quickChipText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  quickChipTextActive: { color: "#6366F1", fontWeight: "800" },
  testCard: {
    backgroundColor: "#0F1424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2030",
    padding: 14,
    marginTop: 4,
  },
  autoCard: {
    backgroundColor: "#0F1424",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2030",
    padding: 14,
  },
  autoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  autoTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  autoTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "800" },
  autoStatus: { color: "#6366F1", fontSize: 11, marginTop: 2 },
  autoHint: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  testTitle: { color: "#F8FAFC", fontSize: 14, fontWeight: "800", flex: 1 },
  testLive: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  testStatus: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  startTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  startTestText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  stopTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  stopTestText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
});
