import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FocusSession } from '../types';
import { StorageService } from '../services/storageService';
import { AchievementService } from '../services/achievementService';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_COLORS } from '../data/achievements';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'gym_workout' | 'office_core' | 'shipathon_block' | 'learning_block';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'gym_workout', label: 'Gym' },
  { key: 'office_core', label: 'Office' },
  { key: 'shipathon_block', label: 'Hackathon' },
  { key: 'learning_block', label: 'Learning' },
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const FocusHistoryModal: React.FC<Props> = ({ visible, onClose }) => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (visible) {
      StorageService.getFocusHistory().then(setSessions);
    }
  }, [visible]);

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.blockType === filter);
  const categorySummary = AchievementService.getCategorySummary(filtered);

  const grouped: Record<string, FocusSession[]> = {};
  filtered.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalMinutes = filtered.reduce((sum, s) => sum + Math.floor(s.utilizedSeconds / 60), 0);
  const totalPomodoros = filtered.reduce((sum, s) => sum + s.pomodorosCompleted, 0);

  const renderSession = (s: FocusSession) => {
    const color = BLOCK_TYPE_COLORS[s.blockType] || '#6366F1';
    const utilPct = Math.min(100, Math.round((s.utilizedSeconds / (s.allocatedMinutes * 60)) * 100));
    const utilMin = Math.floor(s.utilizedSeconds / 60);
    return (
      <View key={s.id} style={styles.sessionCard}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.sessionContent}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>{s.blockTitle}</Text>
            <View style={[styles.typeTag, { backgroundColor: color + '22' }]}>
              <Text style={[styles.typeTagText, { color }]}>{BLOCK_TYPE_LABELS[s.blockType] || s.blockType}</Text>
            </View>
          </View>
          <Text style={styles.sessionSub}>
            {s.startedAt} • {utilMin}m used / {s.allocatedMinutes}m • {s.pomodorosCompleted} 🍅
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${utilPct}%` as `${number}%`, backgroundColor: color }]} />
          </View>
          <Text style={[styles.utilPct, { color }]}>{utilPct}% utilized</Text>
        </View>
      </View>
    );
  };

  const totalByDate: Record<string, { utilized: number; allocated: number; pomodoros: number }> = {};
  filtered.forEach(s => {
    if (!totalByDate[s.date]) totalByDate[s.date] = { utilized: 0, allocated: 0, pomodoros: 0 };
    totalByDate[s.date].utilized += s.utilizedSeconds;
    totalByDate[s.date].allocated += s.allocatedMinutes * 60;
    totalByDate[s.date].pomodoros += s.pomodorosCompleted;
  });

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Ionicons name="bar-chart-outline" size={20} color="#6366F1" />
            <Text style={styles.headerTitle}>Focus History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{totalMinutes}m</Text>
              <Text style={styles.summaryLbl}>Total Time</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{filtered.length}</Text>
              <Text style={styles.summaryLbl}>Sessions</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryVal}>{totalPomodoros}</Text>
              <Text style={styles.summaryLbl}>Pomodoros</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.catBreakdown}>
            {Object.entries(BLOCK_TYPE_LABELS).map(([key, label]) => {
              const data = categorySummary[key];
              if (!data || data.minutes === 0) return null;
              const color = BLOCK_TYPE_COLORS[key];
              return (
                <View key={key} style={[styles.catChip, { borderColor: color + '44' }]}>
                  <View style={[styles.catChipDot, { backgroundColor: color }]} />
                  <Text style={styles.catChipText}>{label}: {data.minutes}m ({data.sessions}s)</Text>
                </View>
              );
            })}
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="timer-outline" size={48} color="#26293D" />
              <Text style={styles.emptyText}>No focus sessions yet.</Text>
              <Text style={styles.emptySubText}>Start a gym, office, or hackathon block to track time!</Text>
            </View>
          ) : (
            <ScrollView>
              {dates.map(date => {
                const totals = totalByDate[date];
                const dayPct = Math.min(100, Math.round((totals.utilized / totals.allocated) * 100));
                return (
                  <View key={date} style={styles.dateGroup}>
                    <View style={styles.dateSummary}>
                      <Text style={styles.dateLabel}>{formatDate(date)}</Text>
                      <Text style={styles.dateTotals}>
                        {Math.floor(totals.utilized / 60)}m • {totals.pomodoros} 🍅 • {dayPct}%
                      </Text>
                    </View>
                    {grouped[date].map(renderSession)}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#12131C', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', padding: 20, paddingBottom: 40,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { padding: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, backgroundColor: '#0D0E17', borderRadius: 12, padding: 12 },
  summaryItem: { alignItems: 'center' },
  summaryVal: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  summaryLbl: { color: '#64748B', fontSize: 10, marginTop: 2 },
  catBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, backgroundColor: '#0D0E17' },
  catChipDot: { width: 6, height: 6, borderRadius: 3 },
  catChipText: { color: '#CBD5E1', fontSize: 10, fontWeight: '600' },
  filterRow: { marginBottom: 12, maxHeight: 36 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#0D0E17', marginRight: 8, borderWidth: 1, borderColor: '#1E2030' },
  filterChipActive: { borderColor: '#6366F1', backgroundColor: '#6366F111' },
  filterChipText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#6366F1' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#475569', fontSize: 13, textAlign: 'center' },
  dateGroup: { marginBottom: 20 },
  dateSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  dateTotals: { color: '#64748B', fontSize: 12 },
  sessionCard: { flexDirection: 'row', backgroundColor: '#0D0E17', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  colorBar: { width: 4 },
  sessionContent: { flex: 1, padding: 10 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  sessionTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '600', flex: 1 },
  typeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeTagText: { fontSize: 9, fontWeight: '700' },
  sessionSub: { color: '#64748B', fontSize: 11, marginBottom: 6 },
  progressBg: { height: 4, backgroundColor: '#1E2030', borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  utilPct: { fontSize: 11, fontWeight: '700' },
});
