import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimelineItem, FocusSession } from '../types';
import { StorageService, getTodayDateString } from '../services/storageService';

interface Props {
  visible: boolean;
  block: TimelineItem | null;
  onClose: (session?: FocusSession) => void;
}

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

export const FocusTimerModal: React.FC<Props> = ({ visible, block, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_WORK);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [utilizedSeconds, setUtilizedSeconds] = useState(0);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for LIVE indicator
  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [running]);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(POMODORO_WORK);
      setIsWork(true);
      setRunning(false);
      setUtilizedSeconds(0);
      setPomodorosCompleted(0);
      sessionStartRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (running) {
      if (!sessionStartRef.current) sessionStartRef.current = new Date();
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (isWork) {
              setPomodorosCompleted(c => c + 1);
              setUtilizedSeconds(u => u + POMODORO_WORK);
              setIsWork(false);
              setSecondsLeft(POMODORO_BREAK);
            } else {
              setIsWork(true);
              setSecondsLeft(POMODORO_WORK);
            }
            setRunning(false);
            return 1;
          }
          if (isWork) setUtilizedSeconds(u => u + 1);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, isWork]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!block) { onClose(); return; }

    const allocated = block.allocatedMinutes || 60;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const session: FocusSession = {
      id: `${block.id}-${Date.now()}`,
      blockType: block.type,
      blockTitle: block.title,
      date: getTodayDateString(),
      startedAt: timeStr,
      allocatedMinutes: allocated,
      utilizedSeconds,
      pomodorosCompleted,
    };
    await StorageService.saveFocusSession(session);
    onClose(session);
  };

  if (!block) return null;

  const allocatedSecs = (block.allocatedMinutes || 60) * 60;
  const utilPct = Math.min(100, Math.round((utilizedSeconds / allocatedSecs) * 100));
  const utilMin = Math.floor(utilizedSeconds / 60);

  const ringProgress = 1 - secondsLeft / (isWork ? POMODORO_WORK : POMODORO_BREAK);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { borderColor: block.color + '66' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: block.color + '22' }]}>
              <Ionicons name="timer-outline" size={24} color={block.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockTitle}>{block.title}</Text>
              <Text style={styles.blockSub}>Allocated: {block.allocatedMinutes} min</Text>
            </View>
            <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Phase label */}
          <View style={styles.phaseBadge}>
            <Animated.View style={[styles.phaseDot, { backgroundColor: isWork ? block.color : '#10B981', transform: [{ scale: running ? pulseAnim : 1 }] }]} />
            <Text style={styles.phaseLabel}>{isWork ? '🧠 Focus Work' : '☕ Break Time'}</Text>
            {running && <Text style={[styles.liveLabel, { color: block.color }]}>LIVE</Text>}
          </View>

          {/* Ring Timer */}
          <View style={styles.timerRing}>
            <View style={[styles.ringOuter, { borderColor: block.color + '33' }]}>
              <View style={[styles.ringInner, { borderColor: block.color, borderTopColor: 'transparent', transform: [{ rotate: `${ringProgress * 360}deg` }] }]} />
              <View style={styles.timerCenter}>
                <Text style={styles.timerText}>{fmt(secondsLeft)}</Text>
                <Text style={styles.timerPhase}>{isWork ? 'focus' : 'break'}</Text>
              </View>
            </View>
          </View>

          {/* Control buttons */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.ctrlBtn, { backgroundColor: running ? '#EF4444' : block.color }]}
              onPress={() => setRunning(r => !r)}
            >
              <Ionicons name={running ? 'pause' : 'play'} size={28} color="#FFF" />
              <Text style={styles.ctrlBtnText}>{running ? 'Pause' : 'Start Focus'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { setRunning(false); setSecondsLeft(isWork ? POMODORO_WORK : POMODORO_BREAK); }}
            >
              <Ionicons name="stop-circle-outline" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Utilization */}
          <View style={styles.utilSection}>
            <View style={styles.utilRow}>
              <Text style={styles.utilLabel}>Time Utilized</Text>
              <Text style={[styles.utilValue, { color: block.color }]}>{utilMin} min / {block.allocatedMinutes} min</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${utilPct}%` as any, backgroundColor: block.color }]} />
            </View>
            <Text style={styles.utilPct}>{utilPct}% utilized</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="timer-outline" size={18} color="#F59E0B" />
                <Text style={styles.statValue}>{pomodorosCompleted}</Text>
                <Text style={styles.statLabel}>Pomodoros</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                <Text style={styles.statValue}>{utilPct}%</Text>
                <Text style={styles.statLabel}>Utilized</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="hourglass-outline" size={18} color="#6366F1" />
                <Text style={styles.statValue}>{(block.allocatedMinutes || 0) - utilMin}m</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#12131C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  blockSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#1E2030',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  closeTxt: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    flex: 1,
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerRing: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ringOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
  },
  timerCenter: {
    alignItems: 'center',
  },
  timerText: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: '800',
  },
  timerPhase: {
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  ctrlBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#1E2030',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilSection: {
    backgroundColor: '#0D0E17',
    borderRadius: 14,
    padding: 14,
  },
  utilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  utilLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  utilValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#1E2030',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  utilPct: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
  },
});
