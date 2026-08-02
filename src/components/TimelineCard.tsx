import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimelineItem, PrayerName } from '../types';
import { GlassCard } from './GlassCard';
import { formatTo12Hour } from '../utils/timelineUtils';

interface TimelineCardProps {
  item: TimelineItem;
  onTogglePrayerCheck?: (prayerName: PrayerName) => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ item, onTogglePrayerCheck }) => {
  const getIconName = (name: string): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case 'car':
        return 'car-sport-outline';
      case 'briefcase':
        return 'briefcase-outline';
      case 'rocket':
        return 'rocket-outline';
      case 'restaurant':
        return 'restaurant-outline';
      case 'book-open':
        return 'book-outline';
      case 'checkmark-done':
        return 'checkmark-done-circle-outline';
      case 'sun':
        return 'sunny-outline';
      case 'sunset':
        return 'partly-sunny-outline';
      case 'barbell':
        return 'barbell-outline';
      case 'bed':
        return 'bed-outline';
      case 'moon':
        return 'moon-outline';
      case 'home':
        return 'home-outline';
      default:
        return 'time-outline';
    }
  };

  return (
    <GlassCard active={item.isCurrentActive} accentColor={item.color}>
      <View style={styles.container}>
        {/* Left Indicator & Time */}
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, item.isCurrentActive && { color: item.color, fontWeight: '700' }]}>
            {formatTo12Hour(item.startTime)}
          </Text>
          {item.endTime && (
            <Text style={styles.endTimeText}>
              to {formatTo12Hour(item.endTime)}
            </Text>
          )}
        </View>

        {/* Icon & Title Column */}
        <View style={styles.contentColumn}>
          <View style={styles.headerRow}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={getIconName(item.iconName)} size={20} color={item.color} />
            </View>

            <View style={styles.titleContainer}>
              <View style={styles.titleBadgeRow}>
                <Text style={[styles.title, item.isPast && styles.pastText]}>{item.title}</Text>
                {item.isCurrentActive && (
                  <View style={[styles.activeBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.activeBadgeText}>LIVE NOW</Text>
                  </View>
                )}
                {item.badgeText && !item.isCurrentActive && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badgeText}</Text>
                  </View>
                )}
              </View>

              {item.subTitle && (
                <Text style={[styles.subTitle, item.isPast && styles.pastText]}>
                  {item.subTitle}
                </Text>
              )}
            </View>

            {/* Prayer Tick Button on Timeline Card */}
            {item.isPrayer && item.prayerName && (
              <TouchableOpacity
                style={[
                  styles.prayerCheckBtn,
                  item.isPrayerChecked && styles.prayerCheckBtnDone,
                ]}
                onPress={() => onTogglePrayerCheck && onTogglePrayerCheck(item.prayerName!)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.isPrayerChecked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={item.isPrayerChecked ? '#10B981' : '#64748B'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeColumn: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#26293D',
    paddingRight: 10,
    justifyContent: 'center',
  },
  timeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  endTimeText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  pastText: {
    opacity: 0.6,
  },
  badge: {
    backgroundColor: '#26293D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  prayerCheckBtn: {
    padding: 6,
    marginLeft: 6,
  },
  prayerCheckBtnDone: {
    opacity: 1,
  },
});
