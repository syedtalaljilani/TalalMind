import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { StorageService } from '../services/storageService';
import { AchievementService } from '../services/achievementService';
import { GamificationState, FocusSession } from '../types';
import {
  ACHIEVEMENTS, getXPForNextLevel, BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS,
} from '../data/achievements';

type FilterCategory = 'all' | 'gym' | 'office' | 'hackathon' | 'learning' | 'streak' | 'general';

const FILTER_TABS: { key: FilterCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'gym', label: 'Gym', icon: 'barbell-outline' },
  { key: 'office', label: 'Office', icon: 'briefcase-outline' },
  { key: 'hackathon', label: 'Hackathon', icon: 'rocket-outline' },
  { key: 'learning', label: 'Learn', icon: 'book-outline' },
  { key: 'streak', label: 'Streaks', icon: 'flame-outline' },
  { key: 'general', label: 'General', icon: 'star-outline' },
];

export const AchievementsScreen: React.FC = () => {
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [g, s] = await Promise.all([
      StorageService.getGamification(),
      StorageService.getFocusHistory(),
    ]);
    setGamification(g);
    setSessions(s);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (!gamification) {
    return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  }

  const levelInfo = getXPForNextLevel(gamification.totalXP);
  const unlockedIds = new Set(gamification.unlockedAchievements.map(a => a.achievementId));
  const filtered = filter === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === filter);
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
  const categorySummary = AchievementService.getCategorySummary(sessions);
  const weeklyStats = AchievementService.getWeeklyStats(sessions);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#6366F1" />}
    >
      <Text style={styles.heading}>Achievements</Text>

      {/* Level & XP Card */}
      <GlassCard accentColor="#6366F1" style={styles.card}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNum}>{gamification.level}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={styles.xpTotal}>{gamification.totalXP} XP</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${levelInfo.progress}%` as `${number}%` }]} />
            </View>
            <Text style={styles.xpSub}>{levelInfo.current}/{levelInfo.needed} XP to Level {gamification.level + 1}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
            <Text style={styles.statVal}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
            <Text style={styles.statLbl}>Badges</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={18} color="#F97316" />
            <Text style={styles.statVal}>{gamification.dailyStreak}d</Text>
            <Text style={styles.statLbl}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="timer" size={18} color="#6366F1" />
            <Text style={styles.statVal}>{sessions.length}</Text>
            <Text style={styles.statLbl}>Sessions</Text>
          </View>
        </View>
      </GlassCard>

      {/* Category Time Breakdown */}
      <GlassCard accentColor="#10B981" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart-outline" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>Time by Category</Text>
        </View>
        {Object.keys(BLOCK_TYPE_LABELS).map(key => {
          const data = categorySummary[key] || { minutes: 0, sessions: 0, pomodoros: 0 };
          const color = BLOCK_TYPE_COLORS[key] || '#6366F1';
          const maxMin = Math.max(...Object.values(categorySummary).map(d => d.minutes), 1);
          const barPct = Math.round((data.minutes / maxMin) * 100);
          return (
            <View key={key} style={styles.catRow}>
              <View style={styles.catLabel}>
                <View style={[styles.catDot, { backgroundColor: color }]} />
                <Text style={styles.catName}>{BLOCK_TYPE_LABELS[key]}</Text>
              </View>
              <View style={styles.catBarBg}>
                <View style={[styles.catBarFill, { width: `${barPct}%` as `${number}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.catMin, { color }]}>{data.minutes}m</Text>
            </View>
          );
        })}
      </GlassCard>

      {/* Weekly Chart */}
      <GlassCard accentColor="#EC4899" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={20} color="#EC4899" />
          <Text style={styles.cardTitle}>This Week</Text>
        </View>
        <View style={styles.weekChart}>
          {weeklyStats.map(day => {
            const maxMin = Math.max(...weeklyStats.map(d => d.minutes), 1);
            const h = Math.max(4, Math.round((day.minutes / maxMin) * 80));
            const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
            return (
              <View key={day.date} style={styles.weekBar}>
                <Text style={styles.weekMin}>{day.minutes > 0 ? `${day.minutes}m` : ''}</Text>
                <View style={[styles.weekBarFill, { height: h, backgroundColor: day.minutes > 0 ? '#6366F1' : '#1E2030' }]} />
                <Text style={styles.weekDay}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Ionicons name={tab.icon as keyof typeof Ionicons.glyphMap} size={14} color={filter === tab.key ? '#6366F1' : '#64748B'} />
            <Text style={[styles.filterText, filter === tab.key && styles.filterTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Badge Grid */}
      <View style={styles.badgeGrid}>
        {filtered.map(achievement => {
          const unlocked = unlockedIds.has(achievement.id);
          const progress = AchievementService.getProgressForAchievement(achievement, gamification, sessions);
          return (
            <View key={achievement.id} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
              <View style={[styles.badgeIcon, { backgroundColor: unlocked ? achievement.color + '22' : '#1E2030' }]}>
                <Ionicons
                  name={achievement.icon as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={unlocked ? achievement.color : '#475569'}
                />
              </View>
              <Text style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]} numberOfLines={1}>
                {achievement.title}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>{achievement.description}</Text>
              {unlocked ? (
                <View style={[styles.unlockedTag, { backgroundColor: achievement.color + '22' }]}>
                  <Ionicons name="checkmark-circle" size={12} color={achievement.color} />
                  <Text style={[styles.unlockedText, { color: achievement.color }]}>+{achievement.xpReward} XP</Text>
                </View>
              ) : (
                <View style={styles.progressSection}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress.pct}%` as `${number}%`, backgroundColor: achievement.color }]} />
                  </View>
                  <Text style={styles.progressText}>{progress.current}/{progress.required}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090A0F' },
  scroll: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  loading: { color: '#64748B', textAlign: 'center', marginTop: 100 },
  heading: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  levelBadge: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#6366F122',
    borderWidth: 2, borderColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
  },
  levelNum: { color: '#6366F1', fontSize: 24, fontWeight: '800' },
  levelLabel: { color: '#6366F1', fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  xpInfo: { flex: 1 },
  xpTotal: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  xpBarBg: { height: 8, backgroundColor: '#1E2030', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: 8, backgroundColor: '#6366F1', borderRadius: 4 },
  xpSub: { color: '#64748B', fontSize: 11 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#1E2030', paddingTop: 12 },
  statBox: { alignItems: 'center', gap: 2 },
  statVal: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  statLbl: { color: '#64748B', fontSize: 10 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 90 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  catBarBg: { flex: 1, height: 6, backgroundColor: '#1E2030', borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: 6, borderRadius: 3 },
  catMin: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  weekChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, paddingTop: 8 },
  weekBar: { alignItems: 'center', flex: 1 },
  weekMin: { color: '#64748B', fontSize: 9, marginBottom: 2, height: 14 },
  weekBarFill: { width: 20, borderRadius: 4, marginBottom: 4 },
  weekDay: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  filterScroll: { marginBottom: 12 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#12131C', marginRight: 8, borderWidth: 1, borderColor: '#1E2030',
  },
  filterTabActive: { borderColor: '#6366F1', backgroundColor: '#6366F111' },
  filterText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#6366F1' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: {
    width: '47%', backgroundColor: '#12131C', borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: '#1E2030',
  },
  badgeLocked: { opacity: 0.7 },
  badgeIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  badgeTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '700', marginBottom: 2 },
  badgeTitleLocked: { color: '#94A3B8' },
  badgeDesc: { color: '#64748B', fontSize: 10, marginBottom: 8, lineHeight: 14 },
  unlockedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  unlockedText: { fontSize: 10, fontWeight: '700' },
  progressSection: { gap: 2 },
  progressBg: { height: 4, backgroundColor: '#1E2030', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { color: '#64748B', fontSize: 9, textAlign: 'right' },
});
