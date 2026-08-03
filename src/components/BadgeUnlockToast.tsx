import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types';

interface Props {
  badge: Achievement | null;
  xpEarned?: number;
  onDismiss: () => void;
}

export const BadgeUnlockToast: React.FC<Props> = ({ badge, xpEarned, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (badge) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      ]).start();

      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-120);
      scaleAnim.setValue(0.5);
    }
  }, [badge]);

  if (!badge) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.toast} onPress={onDismiss} activeOpacity={0.9}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }], backgroundColor: badge.color + '33' }]}>
          <Ionicons name={badge.icon as keyof typeof Ionicons.glyphMap} size={32} color={badge.color} />
        </Animated.View>
        <View style={styles.content}>
          <Text style={styles.unlockLabel}>BADGE UNLOCKED!</Text>
          <Text style={styles.badgeTitle}>{badge.title}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>
          {(xpEarned !== undefined && xpEarned > 0) && (
            <Text style={[styles.xpText, { color: badge.color }]}>+{xpEarned} XP earned</Text>
          )}
        </View>
        <Ionicons name="close" size={18} color="#64748B" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12131C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#6366F144',
    gap: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  unlockLabel: { color: '#F59E0B', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  badgeTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  badgeDesc: { color: '#94A3B8', fontSize: 11, marginTop: 1 },
  xpText: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
