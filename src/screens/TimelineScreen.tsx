import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService, getTodayDateString } from "../services/storageService";
import { LocationService } from "../services/locationService";
import * as Location from "expo-location";
import { PrayerService } from "../services/prayerService";
import { NotificationService } from "../services/notificationService";
import {
  UserSettings,
  PrayerTimings,
  TimelineItem,
  PrayerHistoryState,
  PrayerName,
  FocusSession,
  Achievement,
  GamificationState,
} from "../types";
import { generateDailyTimeline, timeToMinutes } from "../utils/timelineUtils";
import { TimelineCard } from "../components/TimelineCard";
import { GlassCard } from "../components/GlassCard";
import { PrayerCheckbookModal } from "../components/PrayerCheckbookModal";
import { FocusTimerModal } from "../components/FocusTimerModal";
import { FocusHistoryModal } from "../components/FocusHistoryModal";
import { BadgeUnlockToast } from "../components/BadgeUnlockToast";
import { getXPForNextLevel } from "../data/achievements";
import { ALL_LESSONS } from "../data/lessons";

export const TimelineScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [prayerTimings, setPrayerTimings] = useState<PrayerTimings | null>(
    null,
  );
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistoryState>({
    records: {},
    currentStreak: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLessonTitle, setCurrentLessonTitle] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionMode, setPermissionMode] = useState<
    "permission" | "services"
  >("permission");

  // Focus Timer state
  const [focusBlock, setFocusBlock] = useState<TimelineItem | null>(null);
  const [focusHistoryVisible, setFocusHistoryVisible] = useState(false);
  const [gamification, setGamification] = useState<GamificationState | null>(
    null,
  );
  const [toastBadge, setToastBadge] = useState<Achievement | null>(null);
  const [toastXP, setToastXP] = useState(0);

  const loadData = useCallback(async (forceGps = false) => {
    try {
      // Phase 1 — instant paint from local cache (no GPS, no network waits)
      const userSettings = await StorageService.getSettings();
      setSettings(userSettings);

      const [history, gam, lessonProgress, cachedTimings] = await Promise.all([
        StorageService.getPrayerHistory(),
        StorageService.getGamification(),
        StorageService.getLessonProgress(),
        StorageService.getCachedPrayerTimes(getTodayDateString()),
      ]);
      setPrayerHistory(history);
      setGamification(gam);

      const currentLessonId = (lessonProgress.completedIds.length || 0) + 1;
      const lessonObj =
        ALL_LESSONS.find((l) => l.id === currentLessonId) || ALL_LESSONS[0];
      setCurrentLessonTitle(lessonObj.title);

      if (cachedTimings) {
        setPrayerTimings(cachedTimings);
        const todayStr = getTodayDateString();
        setTimelineItems(
          generateDailyTimeline(
            cachedTimings,
            userSettings,
            lessonObj.title,
            history.records[todayStr],
          ),
        );
      }
      setLoading(false);

      // Phase 2 — background hydration: GPS coords (if needed) + fresh prayer times
      let coords = {
        latitude: userSettings.latitude || 24.8607,
        longitude: userSettings.longitude || 67.0011,
        city: userSettings.cityName || "Karachi",
      };

      if (
        forceGps ||
        userSettings.latitude == null ||
        userSettings.longitude == null
      ) {
        const freshCoords = await LocationService.getDeviceLocation();
        if (freshCoords) {
          coords = {
            latitude: freshCoords.latitude,
            longitude: freshCoords.longitude,
            city: freshCoords.city || "Current Location",
          };
          const updatedSettings = {
            ...userSettings,
            latitude: coords.latitude,
            longitude: coords.longitude,
            cityName: coords.city,
          };
          await StorageService.saveSettings(updatedSettings);
          setSettings(updatedSettings);
        } else {
          setSettings({
            ...userSettings,
            cityName: userSettings.cityName || "GPS Location",
          });
        }
      }

      const timings = await PrayerService.getPrayerTimes(
        coords.latitude,
        coords.longitude,
        forceGps,
      );
      setPrayerTimings(timings);

      const todayStr = getTodayDateString();
      const freshHistory = await StorageService.getPrayerHistory();
      const todayChecks = freshHistory.records[todayStr];
      setTimelineItems(
        generateDailyTimeline(timings, userSettings, lessonObj.title, todayChecks),
      );

      // Keep timetable + water notifications in sync with fresh prayer times.
      void NotificationService.reschedule(timings, userSettings);
    } catch (e) {
      console.error("Error loading timeline:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      const userSettings = await StorageService.getSettings();
      const permission = await LocationService.getPermissionStatus();

      if (permission === Location.PermissionStatus.GRANTED) {
        const servicesEnabled =
          await LocationService.isLocationServicesEnabled();
        if (!servicesEnabled) {
          setPermissionMode("services");
          setPermissionModalVisible(true);
          return;
        }
        loadData();
        return;
      }

      if (permission === Location.PermissionStatus.UNDETERMINED) {
        setPermissionMode("permission");
        setPermissionModalVisible(true);
        return;
      }

      loadData();
    };

    initializeApp();
    const timer = setInterval(() => {
      if (prayerTimings && settings) {
        const todayStr = getTodayDateString();
        const todayChecks = prayerHistory.records[todayStr];
        setTimelineItems(
          generateDailyTimeline(
            prayerTimings,
            settings,
            currentLessonTitle,
            todayChecks,
          ),
        );
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, prayerTimings, settings, currentLessonTitle, prayerHistory]);

  // Reload the timeline when Supabase syncs updated settings or today's prayer cache
  useEffect(() => {
    const todayPrayerKey = `@daily_planner_prayer_${getTodayDateString()}`;
    const unsub = StorageService.subscribe((key) => {
      if (key === "@daily_planner_settings_v1" || key === todayPrayerKey) {
        loadData();
      }
    });
    return unsub;
  }, [loadData]);

  const handleTogglePrayerCheck = async (
    dateStr: string,
    prayerName: PrayerName,
  ) => {
    const updatedHistory = await StorageService.togglePrayerCheck(
      dateStr,
      prayerName,
    );
    setPrayerHistory(updatedHistory);

    if (prayerTimings && settings) {
      const todayStr = getTodayDateString();
      const todayChecks = updatedHistory.records[todayStr];
      setTimelineItems(
        generateDailyTimeline(
          prayerTimings,
          settings,
          currentLessonTitle,
          todayChecks,
        ),
      );
    }
  };

  const handleStartFocus = (item: TimelineItem) => {
    setFocusBlock(item);
  };

  const handleFocusDone = async (
    _session?: FocusSession,
    newBadges?: Achievement[],
    xpEarned?: number,
  ) => {
    setFocusBlock(null);
    if (xpEarned) setToastXP(xpEarned);
    if (newBadges && newBadges.length > 0) {
      setToastBadge(newBadges[0]);
    }
    const gam = await StorageService.getGamification();
    setGamification(gam);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handlePermissionAllow = async () => {
    setPermissionModalVisible(false);

    if (permissionMode === "permission") {
      const granted = await LocationService.requestPermission();
      if (!granted) {
        loadData();
        return;
      }

      const servicesEnabled = await LocationService.isLocationServicesEnabled();
      if (!servicesEnabled) {
        await LocationService.openLocationSettings();
      }
      loadData();
      return;
    }

    await LocationService.openLocationSettings();
    loadData();
  };

  const nextPrayerItem = timelineItems.find(
    (item) => item.isPrayer && !item.isPast,
  );
  const headerRightActions = (
    <View style={styles.headerRightActions}>
      {gamification && (
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>Lv.{gamification.level}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => setFocusHistoryVisible(true)}
      >
        <Ionicons name="bar-chart-outline" size={16} color="#6366F1" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.streakBadgeBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="flame" size={18} color="#F59E0B" />
        <Text style={styles.streakBadgeText}>
          {prayerHistory.currentStreak}d Streak
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.refreshBtn} onPress={() => onRefresh()}>
        <Ionicons name="refresh" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
  const todayStr = getTodayDateString();
  const todayRecord = prayerHistory.records[todayStr];
  const todayOfferedCount = todayRecord
    ? ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].filter(
        (p) => todayRecord[p as PrayerName],
      ).length
    : 0;

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Daily Planner</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#10B981" />
            <Text style={styles.locationText}>
              {settings?.cityName || "GPS Location"}
            </Text>
          </View>
        </View>
        {headerRightActions}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      >
        {/* XP Progress Card */}
        {gamification && (
          <GlassCard accentColor="#6366F1" style={styles.xpCard}>
            <View style={styles.xpRow}>
              <View style={styles.xpLevelBadge}>
                <Text style={styles.xpLevelNum}>{gamification.level}</Text>
              </View>
              <View style={styles.xpDetails}>
                <Text style={styles.xpTitle}>
                  {gamification.totalXP} XP • {gamification.dailyStreak}d streak
                  🔥
                </Text>
                <View style={styles.xpBarBg}>
                  <View
                    style={[
                      styles.xpBarFill,
                      {
                        width:
                          `${getXPForNextLevel(gamification.totalXP).progress}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <TouchableOpacity onPress={() => setFocusHistoryVisible(true)}>
                <Ionicons name="chevron-forward" size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* Next Prayer & Daily Checkbook Quick Card */}
        <GlassCard active accentColor="#F59E0B" style={styles.highlightCard}>
          <View style={styles.highlightContent}>
            <View style={styles.highlightLeft}>
              <Ionicons name="journal-outline" size={24} color="#F59E0B" />
              <View>
                <Text style={styles.highlightLabel}>
                  DAILY PRAYER CHECKBOOK ({todayOfferedCount}/5)
                </Text>
                <Text style={styles.highlightTitle}>
                  {nextPrayerItem
                    ? `Next: ${nextPrayerItem.title}`
                    : "All Prayers Tracked"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.checkbookOpenBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.checkbookOpenText}>Open Log</Text>
              <Ionicons name="chevron-forward" size={14} color="#FBBF24" />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today’s 8-Hour Work & Prayer Schedule
          </Text>
          <Text style={styles.sectionSubtitle}>
            Gym (06:15) • Office (2h) • Hackathon (2h) • AI (1h) • FDE (1h) •
            Sleep Force (22:30)
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6366F1"
            style={{ marginTop: 40 }}
          />
        ) : (
          timelineItems.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              onTogglePrayerCheck={(pName) =>
                handleTogglePrayerCheck(getTodayDateString(), pName)
              }
              onStartFocus={handleStartFocus}
            />
          ))
        )}
      </ScrollView>

      <Modal
        transparent
        visible={permissionModalVisible}
        animationType="fade"
        onRequestClose={() => setPermissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconWrap}>
              <Ionicons name="location" size={26} color="#F8FAFC" />
            </View>
            <Text style={styles.permissionTitle}>
              {permissionMode === "permission"
                ? "Enable location access"
                : "Turn on location services"}
            </Text>
            <Text style={styles.permissionText}>
              {permissionMode === "permission"
                ? "TalalMind uses your location to show accurate prayer times and personalize your daily rhythm."
                : "Your emulator or device location services are currently off. Turn them on so TalalMind can fetch your city and prayer timings."}
            </Text>
            <View style={styles.permissionActions}>
              <TouchableOpacity
                style={styles.permissionSecondaryBtn}
                onPress={() => {
                  setPermissionModalVisible(false);
                  loadData();
                }}
              >
                <Text style={styles.permissionSecondaryText}>Maybe later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.permissionPrimaryBtn}
                onPress={handlePermissionAllow}
              >
                <Text style={styles.permissionPrimaryText}>
                  {permissionMode === "permission"
                    ? "Allow access"
                    : "Open settings"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prayer Checkbook & History Modal */}
      <PrayerCheckbookModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        prayerHistory={prayerHistory}
        onTogglePrayer={handleTogglePrayerCheck}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        visible={focusBlock !== null}
        block={focusBlock}
        onClose={handleFocusDone}
      />

      {/* Focus Session History Modal */}
      <FocusHistoryModal
        visible={focusHistoryVisible}
        onClose={() => setFocusHistoryVisible(false)}
      />

      {/* Badge Unlock Toast */}
      <BadgeUnlockToast
        badge={toastBadge}
        xpEarned={toastXP}
        onDismiss={() => {
          setToastBadge(null);
          setToastXP(0);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#090A0F",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2030",
  },
  appTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelChip: {
    backgroundColor: "#6366F122",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6366F144",
  },
  levelChipText: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "800",
  },
  xpCard: { marginBottom: 12 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  xpLevelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F122",
    borderWidth: 1,
    borderColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  xpLevelNum: { color: "#6366F1", fontSize: 14, fontWeight: "800" },
  xpDetails: { flex: 1 },
  xpTitle: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  xpBarBg: {
    height: 4,
    backgroundColor: "#1E2030",
    borderRadius: 2,
    overflow: "hidden",
  },
  xpBarFill: { height: 4, backgroundColor: "#6366F1", borderRadius: 2 },
  streakBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B44",
    gap: 4,
  },
  streakBadgeText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  permissionCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 24,
    alignItems: "center",
  },
  permissionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  permissionTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  permissionSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  permissionSecondaryText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  permissionPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#6366F1",
    alignItems: "center",
  },
  permissionPrimaryText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F122",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6366F144",
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#161824",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26293D",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  highlightCard: {
    marginBottom: 16,
    backgroundColor: "#1C1917",
  },
  highlightContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  highlightLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  highlightLabel: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  highlightTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  checkbookOpenBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B44",
    gap: 4,
  },
  checkbookOpenText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
});
