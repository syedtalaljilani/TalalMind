import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FocusSession } from '../types';
import { StorageService } from '../services/storageService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const blockColors: Record<string, string> = {
  gym_workout: '#EF4444',
  office_core: '#3B82F6',
  shipathon_block: '#14B8A6',
  learning_block: '#EC4899',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const fmtMinSec = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

export const FocusHistoryModal: React.FC<Props> = ({ visible, onClose }) => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    if (visible) {
      StorageService.getFocusHistory().then(setSessions);
    }
  }, [visible]);

  const grouped: Record<string, FocusSession[]> = {};
  sessions.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const renderSession = (s: FocusSession) => {
    const color = blockColors[s.blockType] || '#6366F1';
    const utilPct = Math.min(100, Math.round((s.utilizedSeconds / (s.allocatedMinutes * 60)) * 100));
    const utilMin = Math.floor(s.utilizedSeconds / 60);
    return (
      <View key={s.id} style={styles.sessionCard}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.sessionContent}>
          <Text style={styles.sessionTitle}>{s.blockTitle}</Text>
          <Text style={styles.sessionSub}>
            {s.startedAt} • {utilMin}m used / {s.allocatedMinutes}m allocated • {s.pomodorosCompleted} 🍅
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${utilPct}%` as any, backgroundColor: color }]} />
          </View>
          <Text style={[styles.utilPct, { color }]}>{utilPct}% utilized</Text>
        </View>
      </View>
    );
  };

  // Daily totals
  const totalByDate: Record<string, { utilized: number; allocated: number; pomodoros: number }> = {};
  sessions.forEach(s => {
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

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="timer-outline" size={48} color="#26293D" />
              <Text style={styles.emptyText}>No focus sessions yet.</Text>
              <Text style={styles.emptySubText}>Start a work block to track your sessions!</Text>
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
                        {Math.floor(totals.utilized / 60)}m utilized • {totals.pomodoros} 🍅 • {dayPct}%
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
    backgroundColor: '#12131C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 40,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#475569', fontSize: 13, textAlign: 'center' },
  dateGroup: { marginBottom: 20 },
  dateSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  dateTotals: { color: '#64748B', fontSize: 12 },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#0D0E17',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  colorBar: { width: 4 },
  sessionContent: { flex: 1, padding: 10 },
  sessionTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  sessionSub: { color: '#64748B', fontSize: 11, marginBottom: 6 },
  progressBg: { height: 4, backgroundColor: '#1E2030', borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  utilPct: { fontSize: 11, fontWeight: '700' },
});
