import React, { useState, useEffect, useMemo } from "react";
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
import { StorageService, getTodayDateString } from "../services/storageService";
import { LocationService } from "../services/locationService";
import { NotificationService } from "../services/notificationService";
import { UserSettings } from "../types";
import { GlassCard } from "../components/GlassCard";

interface Props {
  onOpenShield?: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onOpenShield }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [officeStart, setOfficeStart] = useState("09:00");
  const [officeEnd, setOfficeEnd] = useState("17:00");
  const [commuteMinutes, setCommuteMinutes] = useState("50");
  const [gymStart, setGymStart] = useState("06:15");
  const [sleepStart, setSleepStart] = useState("22:30");
  const [saving, setSaving] = useState(false);
  const [installedApps, setInstalledApps] = useState<
    {
      packageName: string;
      name: string;
    }[]
  >([]);
  const [loadingInstalledApps, setLoadingInstalledApps] = useState(false);
  const [installedAppsError, setInstalledAppsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    StorageService.getSettings().then((s) => {
      setSettings(s);
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

    const cachedTimings = await StorageService.getCachedPrayerTimes(
      getTodayDateString(),
    );
    await NotificationService.reschedule(cachedTimings ?? undefined, updated);

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
        {/* Focus Shield */}
        <GlassCard accentColor="#38BDF8" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={20} color="#38BDF8" />
            <Text style={styles.cardTitle}>Focus Shield</Text>
          </View>
          <Text style={styles.shieldText}>
            Block distracting apps while your focus timer is running. Pick which
            apps (Instagram, YouTube, TikTok, etc.) to lock during focus
            sessions.
          </Text>
          <TouchableOpacity
            style={styles.shieldBtn}
            onPress={onOpenShield}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFF" />
            <Text style={styles.shieldBtnText}>Manage Blocked Apps</Text>
          </TouchableOpacity>
        </GlassCard>

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

        {/* Sync & Privacy Banner */}
        <GlassCard accentColor="#8B5CF6" style={{ marginTop: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#8B5CF6"
            />
            <Text style={styles.cardTitle}>Synced to Cloud</Text>
          </View>
          <Text style={styles.privacyText}>
            Daily planner data, prayer caches, lesson progress, and task
            checklists sync to your private Supabase project under an anonymous
            profile. A local copy is kept on your phone so the app still works
            offline.
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
  helpText: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  appListSection: {
    marginBottom: 16,
  },
  subSectionLabel: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#11121C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26293D",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  appItemSelected: {
    borderColor: "#10B981",
    backgroundColor: "#0F172A",
  },
  appItemName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  appItemPackage: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  appItemToggle: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "700",
  },
  privacyText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
  },
  shieldText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  shieldBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#38BDF8",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  shieldBtnText: {
    color: "#0B1524",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});
