import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTo12Hour } from '../utils/timelineUtils';

interface SleepLockOverlayProps {
  visible: boolean;
  fajrTime: string;
  onEmergencyUnlock: () => void;
}

export const SleepLockOverlay: React.FC<SleepLockOverlayProps> = ({
  visible,
  fajrTime,
  onEmergencyUnlock,
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const [fH, fM] = (fajrTime || '04:30').split(':').map(Number);

      const target = new Date();
      if (now.getHours() >= 12) {
        target.setDate(target.getDate() + 1);
      }
      target.setHours(fH, fM, 0, 0);

      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeftStr('00h 00m 00s');
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      setTimeLeftStr(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [fajrTime]);

  const handleHoldUnlock = () => {
    let current = 0;
    const holdInterval = setInterval(() => {
      current += 0.2;
      setHoldProgress(current);
      if (current >= 1) {
        clearInterval(holdInterval);
        onEmergencyUnlock();
        setHoldProgress(0);
      }
    }, 200);
  };

  const openSystemAppBlocker = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=SCREEN_TIME');
      } else {
        await Linking.openSettings();
      }
    } catch {
      Linking.openSettings();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        {/* Sleep Lock Header */}
        <View style={styles.header}>
          <Ionicons name="moon-sharp" size={64} color="#818CF8" />
          <Text style={styles.lockBadge}>🌙 ALL APPS LOCKED • SLEEP FORCE ACTIVE</Text>
          <Text style={styles.lockTitle}>Device Strict Lock Mode</Text>
        </View>

        {/* Countdown to Fajr */}
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>TIME REMAINING UNTIL FAJR ({formatTo12Hour(fajrTime || '04:30')})</Text>
          <Text style={styles.countdownText}>{timeLeftStr}</Text>
        </View>

        {/* Device All-App Locking Info Box */}
        <View style={styles.appBlockerBox}>
          <View style={styles.appBlockerHeader}>
            <Ionicons name="lock-closed" size={20} color="#F59E0B" />
            <Text style={styles.appBlockerTitle}>All Device Apps Locked Until Fajr</Text>
          </View>
          <Text style={styles.appBlockerDesc}>
            To automatically block ALL phone apps (WhatsApp, Instagram, YouTube, Games) at 10:30 PM:
            {'\n'}• <Text style={{ fontWeight: '700', color: '#FFF' }}>Android</Text>: Enable "Display Over Other Apps" & "Usage Access" in Phone Settings.
            {'\n'}• <Text style={{ fontWeight: '700', color: '#FFF' }}>iOS</Text>: Turn on Screen Time Downtime (10:30 PM - 04:30 AM).
          </Text>

          <TouchableOpacity style={styles.syncSystemBtn} onPress={openSystemAppBlocker}>
            <Ionicons name="shield-checkmark" size={16} color="#000" />
            <Text style={styles.syncSystemBtnText}>Grant Phone App Locking Permissions</Text>
          </TouchableOpacity>
        </View>

        {/* Motivation Message */}
        <View style={styles.messageBox}>
          <Ionicons name="bed" size={20} color="#38BDF8" />
          <Text style={styles.messageText}>
            “Deep sleep is non-negotiable for high performance, memory consolidation, and peak gym recovery. Put down your phone.”
          </Text>
        </View>

        {/* Emergency Unlock Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.emergencyBtn}
            onPressIn={handleHoldUnlock}
            onPressOut={() => setHoldProgress(0)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-open-outline" size={18} color="#94A3B8" />
            <Text style={styles.emergencyBtnText}>
              {holdProgress > 0 ? `Unlocking (${Math.round(holdProgress * 100)}%)...` : 'Emergency Unlock (Hold 2s)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030408',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 45,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  lockBadge: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  lockTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  countdownBox: {
    backgroundColor: '#0F1222',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2442',
    width: '100%',
  },
  countdownLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  countdownText: {
    color: '#38BDF8',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appBlockerBox: {
    backgroundColor: '#17130B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B44',
    width: '100%',
  },
  appBlockerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  appBlockerTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
  },
  appBlockerDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  syncSystemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  syncSystemBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D111A',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  messageText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B26',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    gap: 8,
  },
  emergencyBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
});
