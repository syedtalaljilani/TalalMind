import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "../services/storageService";
import { LocationService } from "../services/locationService";
import { AppBlockerSettings, UserSettings } from "../types";
import { GlassCard } from "../components/GlassCard";
import { AppBlockerService } from "../services/appBlockerService";

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [blockerSettings, setBlockerSettings] =
    useState<AppBlockerSettings | null>(null);
  const [officeStart, setOfficeStart] = useState("09:00");
  const [officeEnd, setOfficeEnd] = useState("17:00");
  const [commuteMinutes, setCommuteMinutes] = useState("50");
  const [gymStart, setGymStart] = useState("06:15");
  const [sleepStart, setSleepStart] = useState("22:30");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      StorageService.getSettings(),
      StorageService.getAppBlockerSettings(),
    ]).then(([s, blocker]) => {
      setSettings(s);
      setBlockerSettings(blocker);
      setOfficeStart(s.officeStart);
      setOfficeEnd(s.officeEnd);
      setCommuteMinutes(String(s.commuteMinutes));
      setGymStart(s.gymStart || "06:15");
      setSleepStart(s.sleepStart || "22:30");
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    const updated: UserSettings = {
      ...settings,
      officeStart: officeStart.trim(),
      officeEnd: officeEnd.trim(),
      commuteMinutes: parseInt(commuteMinutes, 10) || 50,
      gymStart: gymStart.trim() || "06:15",
      sleepStart: sleepStart.trim() || "22:30",
      lastUpdated: new Date().toISOString(),
    };

    await StorageService.saveSettings(updated);
    setSettings(updated);
    setSaving(false);
    Alert.alert(
      "Settings Saved",
      "Your schedule, gym workout & Sleep Force timings have been updated.",
    );
  };

  const handleSyncLocation = async () => {
    if (!settings) return;
    const coords = await LocationService.getDeviceLocation();
    if (coords) {
      const updated: UserSettings = {
        ...settings,
        latitude: coords.latitude,
        longitude: coords.longitude,
        cityName: coords.city || "GPS Location",
        lastUpdated: new Date().toISOString(),
      };
      await StorageService.saveSettings(updated);
      setSettings(updated);
      Alert.alert(
        "Location Updated",
        `GPS location updated to: ${coords.city}`,
      );
    } else {
      Alert.alert(
        "Location Error",
        "Unable to fetch GPS coordinates. Please check location permissions.",
      );
    }
  };

  const handleBlockerSave = async (next: AppBlockerSettings) => {
    setBlockerSettings(next);
    await StorageService.saveAppBlockerSettings(next);
  };

  const handlePermissionsRequest = async () => {
    const granted = await AppBlockerService.requestPermissions();
    if (granted) {
      Alert.alert(
        "Permission Ready",
        "Focus mode can now block app distractions.",
      );
    } else {
      Alert.alert(
        "Permission Needed",
        "Please allow usage/access permissions for app blocking.",
      );
    }
  };

  const handleOpenBlockerSettings = async () => {
    await AppBlockerService.openPermissionSettings();
    await AppBlockerService.openOverlaySettings();
  };

  const handleToggleBlocker = async (enabled: boolean) => {
    if (!blockerSettings) return;
    const next = { ...blockerSettings, enabled };
    await handleBlockerSave(next);
    if (!enabled) {
      await AppBlockerService.deactivateBlocking();
    }
  };

  const handleToggleBlockDuringFocus = async (blockDuringFocus: boolean) => {
    if (!blockerSettings) return;
    const next = { ...blockerSettings, blockDuringFocus };
    await handleBlockerSave(next);
  };

  const handleApplyDefaultApps = async () => {
    if (!blockerSettings) return;
    const defaults = [
      "com.instagram.android",
      "com.google.android.youtube",
      "com.facebook.katana",
      "com.snapchat.android",
      "com.disney.disneyplus",
      "com.netflix.mediaclient",
      "com.twitter.android",
      "com.reddit.frontpage",
      "com.whatsapp",
    ];
    const next = { ...blockerSettings, androidBlockedPackages: defaults };
    await handleBlockerSave(next);
    Alert.alert(
      "Default distraction list saved",
      "The common social video apps are ready to be blocked during focus.",
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Configuration</Text>
        <Text style={styles.subtitle}>
          Customize office, gym & sleep force routine
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Focus App Blocker */}
        {blockerSettings && (
          <GlassCard accentColor="#8B5CF6" style={{ marginTop: 12 }}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#8B5CF6"
              />
              <Text style={styles.cardTitle}>Focus App Blocker</Text>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable app blocker</Text>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  blockerSettings.enabled && styles.toggleBtnActive,
                ]}
                onPress={() => handleToggleBlocker(!blockerSettings.enabled)}
              >
                <Text style={styles.toggleBtnText}>
                  {blockerSettings.enabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Block apps during focus sessions</Text>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  blockerSettings.blockDuringFocus && styles.toggleBtnActive,
                ]}
                onPress={() =>
                  handleToggleBlockDuringFocus(
                    !blockerSettings.blockDuringFocus,
                  )
                }
              >
                <Text style={styles.toggleBtnText}>
                  {blockerSettings.blockDuringFocus ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.infoText}>
              Detected packages: {blockerSettings.androidBlockedPackages.length}
            </Text>
            <Text style={styles.infoSubtext}>
              Platform: {Platform.OS === "android" ? "Android" : "iOS"} • Expo
              app blocker integration enabled
            </Text>
            <Text style={styles.infoSubtext}>
              Note: this native blocker works only in a development build or
              production native build, not in Expo Go.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.syncBtn}
                onPress={handlePermissionsRequest}
              >
                <Ionicons name="lock-closed-outline" size={16} color="#FFF" />
                <Text style={styles.syncBtnText}>Grant Permissions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.syncBtnSecondary}
                onPress={handleOpenBlockerSettings}
              >
                <Ionicons name="settings-outline" size={16} color="#FFF" />
                <Text style={styles.syncBtnText}>Open Settings</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.syncBtnSecondary}
              onPress={handleApplyDefaultApps}
            >
              <Ionicons name="apps-outline" size={16} color="#FFF" />
              <Text style={styles.syncBtnText}>
                Use Default Distraction Apps
              </Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Office & Routine Schedule */}
        <GlassCard accentColor="#3B82F6" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="briefcase-outline" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Office Schedule & Commute</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Office Arrival Time (24h format)</Text>
            <TextInput
              style={styles.input}
              value={officeStart}
              onChangeText={setOfficeStart}
              placeholder="09:00"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Office Departure Time (24h format)</Text>
            <TextInput
              style={styles.input}
              value={officeEnd}
              onChangeText={setOfficeEnd}
              placeholder="17:00"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Commute Duration (Minutes each way)
            </Text>
            <TextInput
              style={styles.input}
              value={commuteMinutes}
              onChangeText={setCommuteMinutes}
              keyboardType="number-pad"
              placeholder="50"
              placeholderTextColor="#64748B"
            />
          </View>
        </GlassCard>

        {/* Morning Gym & Sleep Force Routine */}
        <GlassCard accentColor="#EF4444" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness-outline" size={20} color="#EF4444" />
            <Text style={styles.cardTitle}>Gym Workout & Sleep Force</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Morning Gym Start Time (24h format)
            </Text>
            <TextInput
              style={styles.input}
              value={gymStart}
              onChangeText={setGymStart}
              placeholder="06:15"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Sleep Force Routine Start Time (24h format)
            </Text>
            <TextInput
              style={styles.input}
              value={sleepStart}
              onChangeText={setSleepStart}
              placeholder="22:30"
              placeholderTextColor="#64748B"
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save All Schedule Settings"}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* GPS & Location */}
        <GlassCard accentColor="#10B981" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>GPS Prayer Location</Text>
          </View>

          <Text style={styles.infoText}>
            Current Location:{" "}
            <Text style={{ color: "#10B981", fontWeight: "700" }}>
              {settings?.cityName || "Karachi"}
            </Text>
          </Text>
          <Text style={styles.infoSubtext}>
            Lat: {settings?.latitude?.toFixed(4)}, Long:{" "}
            {settings?.longitude?.toFixed(4)}
          </Text>

          <TouchableOpacity style={styles.syncBtn} onPress={handleSyncLocation}>
            <Ionicons name="navigate" size={16} color="#FFF" />
            <Text style={styles.syncBtnText}>Refresh GPS Coordinates</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Offline & Privacy Banner */}
        <GlassCard accentColor="#8B5CF6" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#8B5CF6"
            />
            <Text style={styles.cardTitle}>100% Offline & Private</Text>
          </View>
          <Text style={styles.privacyText}>
            All daily planner data, prayer caches, 503 lesson progress, and task
            checklists are stored directly on your phone via local AsyncStorage.
            No cloud accounts, tracking, or external server dependencies.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A0F",
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2030",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: "#CBD5E1",
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#11121C",
    color: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#26293D",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    color: "#CBD5E1",
    fontSize: 14,
    marginBottom: 4,
  },
  infoSubtext: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  toggleBtn: {
    backgroundColor: "#1E2030",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#8B5CF6",
  },
  toggleBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 11,
  },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
  },
  syncBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
    marginTop: 8,
  },
  syncBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  privacyText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});
