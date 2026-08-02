import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrayerHistoryState, PrayerName } from '../types';
import { GlassCard } from './GlassCard';

interface PrayerCheckbookModalProps {
  visible: boolean;
  onClose: () => void;
  prayerHistory: PrayerHistoryState;
  onTogglePrayer: (dateStr: string, prayerName: PrayerName) => void;
}

export const PrayerCheckbookModal: React.FC<PrayerCheckbookModalProps> = ({
  visible,
  onClose,
  prayerHistory,
  onTogglePrayer,
}) => {
  const prayersList: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Generate past 30 days list
  const pastDays: string[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    pastDays.push(dateStr);
  }

  const [selectedDate, setSelectedDate] = useState<string>(pastDays[0]);

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

    const todayStr = pastDays[0];
    if (dateStr === todayStr) {
      return `Today (${dayName}, ${monthName} ${d})`;
    }
    return `${dayName}, ${monthName} ${d}`;
  };

  const selectedRecord = prayerHistory.records[selectedDate] || {
    Fajr: false,
    Sunrise: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  };

  const completedCount = prayersList.filter((p) => selectedRecord[p]).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="journal-outline" size={22} color="#F59E0B" />
              <Text style={styles.modalTitle}>Daily Prayer Checkbook</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody}>
            {/* Prayer Streak Banner */}
            <GlassCard accentColor="#F59E0B">
              <View style={styles.streakRow}>
                <View style={styles.streakItem}>
                  <Ionicons name="flame" size={28} color="#F59E0B" />
                  <View>
                    <Text style={styles.streakValue}>{prayerHistory.currentStreak} Days</Text>
                    <Text style={styles.streakLabel}>Current Prayer Streak</Text>
                  </View>
                </View>

                <View style={styles.streakItem}>
                  <Ionicons name="trophy" size={24} color="#FBBF24" />
                  <View>
                    <Text style={styles.streakValue}>{prayerHistory.bestStreak} Days</Text>
                    <Text style={styles.streakLabel}>Best Record</Text>
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* Date Selector Horizontal Ribbon */}
            <Text style={styles.sectionTitle}>Select History Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRibbon}>
              {pastDays.map((dateStr) => {
                const rec = prayerHistory.records[dateStr];
                const count = prayersList.filter((p) => rec && rec[p]).length;
                const isSelected = dateStr === selectedDate;

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                      {dateStr === pastDays[0] ? 'Today' : dateStr.split('-').slice(1).join('/')}
                    </Text>
                    <Text style={[styles.dateChipSub, isSelected && { color: '#FFF' }]}>
                      {count}/5
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Checkbook for Selected Date */}
            <View style={styles.checkbookContainer}>
              <View style={styles.checkbookHeader}>
                <Text style={styles.checkbookDate}>{formatDateLabel(selectedDate)}</Text>
                <Text style={styles.checkbookStatus}>{completedCount}/5 Prayers Offered</Text>
              </View>

              {prayersList.map((pName) => {
                const checked = selectedRecord[pName];
                return (
                  <TouchableOpacity
                    key={pName}
                    style={[styles.prayerRow, checked && styles.prayerRowChecked]}
                    onPress={() => onTogglePrayer(selectedDate, pName)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.prayerRowLeft}>
                      <Ionicons
                        name={checked ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={checked ? '#10B981' : '#64748B'}
                      />
                      <Text style={[styles.prayerNameText, checked && styles.prayerNameChecked]}>
                        {pName} Prayer
                      </Text>
                    </View>

                    <Text style={styles.statusBadgeText}>
                      {checked ? 'Offered ✓' : 'Tap to Check'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#090A0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#1E2030',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2030',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakValue: {
    color: '#FBBF24',
    fontSize: 18,
    fontWeight: '800',
  },
  streakLabel: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  dateRibbon: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateChip: {
    backgroundColor: '#161824',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26293D',
  },
  dateChipSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  dateChipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  dateChipTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  dateChipSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  checkbookContainer: {
    backgroundColor: '#161824',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26293D',
    marginBottom: 20,
  },
  checkbookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#26293D',
  },
  checkbookDate: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  checkbookStatus: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#11121C',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#26293D',
  },
  prayerRowChecked: {
    borderColor: '#10B98144',
    backgroundColor: '#10B98111',
  },
  prayerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerNameText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  prayerNameChecked: {
    color: '#10B981',
    fontWeight: '700',
  },
  statusBadgeText: {
    color: '#64748B',
    fontSize: 12,
  },
});
