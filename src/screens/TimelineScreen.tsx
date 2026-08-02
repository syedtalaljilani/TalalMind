import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService, getTodayDateString } from '../services/storageService';
import { LocationService } from '../services/locationService';
import { PrayerService } from '../services/prayerService';
import { UserSettings, PrayerTimings, TimelineItem, PrayerHistoryState, PrayerName } from '../types';
import { generateDailyTimeline, timeToMinutes } from '../utils/timelineUtils';
import { TimelineCard } from '../components/TimelineCard';
import { GlassCard } from '../components/GlassCard';
import { PrayerCheckbookModal } from '../components/PrayerCheckbookModal';
import { SleepLockOverlay } from '../components/SleepLockOverlay';
import { ALL_LESSONS } from '../data/lessons';

export const TimelineScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [prayerTimings, setPrayerTimings] = useState<PrayerTimings | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistoryState>({
    records: {},
    currentStreak: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLessonTitle, setCurrentLessonTitle] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  // Sleep Force Lock State
  const [isSleepLocked, setIsSleepLocked] = useState(false);
  const [emergencyUnlocked, setEmergencyUnlocked] = useState(false);

  const checkSleepLockStatus = useCallback((userSettings: UserSettings, timings: PrayerTimings) => {
    if (emergencyUnlocked) return;

    const now = new Date();
    const currentNowMins = now.getHours() * 60 + now.getMinutes();

    const sleepStartMins = timeToMinutes(userSettings.sleepStart || '22:30');
    const fajrMins = timings.Fajr ? timeToMinutes(timings.Fajr) : 285; // ~04:45 AM

    // Active if after 10:30 PM OR before Fajr AM
    if (currentNowMins >= sleepStartMins || currentNowMins < fajrMins) {
      setIsSleepLocked(true);
    } else {
      setIsSleepLocked(false);
    }
  }, [emergencyUnlocked]);

  const loadData = useCallback(async (forceGps = false) => {
    try {
      const userSettings = await StorageService.getSettings();
      let coords = {
        latitude: userSettings.latitude || 24.8607,
        longitude: userSettings.longitude || 67.0011,
        city: userSettings.cityName || 'Karachi',
      };

      if (forceGps || !userSettings.latitude) {
        const freshCoords = await LocationService.getDeviceLocation();
        if (freshCoords) {
          coords = {
            latitude: freshCoords.latitude,
            longitude: freshCoords.longitude,
            city: freshCoords.city || 'Current Location',
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
          setSettings(userSettings);
        }
      } else {
        setSettings(userSettings);
      }

      // Fetch Prayer Times
      const timings = await PrayerService.getPrayerTimes(coords.latitude, coords.longitude, forceGps);
      setPrayerTimings(timings);

      // Check Sleep Force Lock
      checkSleepLockStatus(userSettings, timings);

      // Fetch Prayer History
      const history = await StorageService.getPrayerHistory();
      setPrayerHistory(history);

      // Fetch active lesson title
      const lessonProgress = await StorageService.getLessonProgress();
      const currentLessonId = (lessonProgress.completedIds.length || 0) + 1;
      const lessonObj = ALL_LESSONS.find((l) => l.id === currentLessonId) || ALL_LESSONS[0];
      setCurrentLessonTitle(lessonObj.title);

      const todayStr = getTodayDateString();
      const todayChecks = history.records[todayStr];

      // Generate 8-hour breakdown timeline with Gym & Sleep Force
      const timeline = generateDailyTimeline(timings, userSettings, lessonObj.title, todayChecks);
      setTimelineItems(timeline);
    } catch (e) {
      console.error('Error loading timeline:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkSleepLockStatus]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      if (prayerTimings && settings) {
        checkSleepLockStatus(settings, prayerTimings);
        const todayStr = getTodayDateString();
        const todayChecks = prayerHistory.records[todayStr];
        setTimelineItems(generateDailyTimeline(prayerTimings, settings, currentLessonTitle, todayChecks));
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, prayerTimings, settings, currentLessonTitle, prayerHistory, checkSleepLockStatus]);

  const handleTogglePrayerCheck = async (dateStr: string, prayerName: PrayerName) => {
    const updatedHistory = await StorageService.togglePrayerCheck(dateStr, prayerName);
    setPrayerHistory(updatedHistory);

    if (prayerTimings && settings) {
      const todayStr = getTodayDateString();
      const todayChecks = updatedHistory.records[todayStr];
      setTimelineItems(generateDailyTimeline(prayerTimings, settings, currentLessonTitle, todayChecks));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const nextPrayerItem = timelineItems.find((item) => item.isPrayer && !item.isPast);
  const todayStr = getTodayDateString();
  const todayRecord = prayerHistory.records[todayStr];
  const todayOfferedCount = todayRecord
    ? ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].filter((p) => todayRecord[p as PrayerName]).length
    : 0;

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Daily Planner</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#10B981" />
            <Text style={styles.locationText}>{settings?.cityName || 'GPS Location'}</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.streakBadgeBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={styles.streakBadgeText}>{prayerHistory.currentStreak}d Streak</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshBtn} onPress={() => onRefresh()}>
            <Ionicons name="refresh" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* Next Prayer & Daily Checkbook Quick Card */}
        <GlassCard active accentColor="#F59E0B" style={styles.highlightCard}>
          <View style={styles.highlightContent}>
            <View style={styles.highlightLeft}>
              <Ionicons name="journal-outline" size={24} color="#F59E0B" />
              <View>
                <Text style={styles.highlightLabel}>DAILY PRAYER CHECKBOOK ({todayOfferedCount}/5)</Text>
                <Text style={styles.highlightTitle}>
                  {nextPrayerItem ? `Next: ${nextPrayerItem.title}` : 'All Prayers Tracked'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.checkbookOpenBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.checkbookOpenText}>Open Log</Text>
              <Ionicons name="chevron-forward" size={14} color="#FBBF24" />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today’s 8-Hour Work & Prayer Schedule</Text>
          <Text style={styles.sectionSubtitle}>Gym (06:15) • Office (2h) • Hackathon (2h) • Learning (2h) • Sleep Force (22:30)</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
        ) : (
          timelineItems.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              onTogglePrayerCheck={(pName) => handleTogglePrayerCheck(getTodayDateString(), pName)}
            />
          ))
        )}
      </ScrollView>

      {/* Prayer Checkbook & History Modal */}
      <PrayerCheckbookModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        prayerHistory={prayerHistory}
        onTogglePrayer={handleTogglePrayerCheck}
      />

      {/* Strict Sleep Force Full-Screen App Lock */}
      <SleepLockOverlay
        visible={isSleepLocked && !emergencyUnlocked}
        fajrTime={prayerTimings?.Fajr || '04:30'}
        onEmergencyUnlock={() => {
          setEmergencyUnlocked(true);
          setIsSleepLocked(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2030',
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B44',
    gap: 4,
  },
  streakBadgeText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161824',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26293D',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  highlightCard: {
    marginBottom: 16,
    backgroundColor: '#1C1917',
  },
  highlightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  highlightLabel: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  highlightTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  checkbookOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B44',
    gap: 4,
  },
  checkbookOpenText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
});
