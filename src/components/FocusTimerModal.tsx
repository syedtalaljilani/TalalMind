import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TimelineItem, FocusSession, Achievement } from "../types";
import { StorageService, getTodayDateString } from "../services/storageService";
import { AchievementService } from "../services/achievementService";
import { AppBlockerService } from "../services/appBlockerService";

interface Props {
  visible: boolean;
  block: TimelineItem | null;
  onClose: (
    session?: FocusSession,
    newBadges?: Achievement[],
    xpEarned?: number,
  ) => void;
}

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

export const FocusTimerModal: React.FC<Props> = ({
  visible,
  block,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_WORK);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [utilizedSeconds, setUtilizedSeconds] = useState(0);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [appsBlocked, setAppsBlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
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
      setAppsBlocked(false);
      setHasStarted(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (isWork) {
              setPomodorosCompleted((c) => c + 1);
              setUtilizedSeconds((u) => u + POMODORO_WORK);
              setIsWork(false);
              setSecondsLeft(POMODORO_BREAK);
            } else {
              setIsWork(true);
              setSecondsLeft(POMODORO_WORK);
            }
            setRunning(false);
            return 1;
          }
          if (isWork) setUtilizedSeconds((u) => u + 1);
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

  const handleStartFocus = async () => {
    if (!running) {
      setHasStarted(true);
      const blockerSettings = await StorageService.getAppBlockerSettings();
      if (blockerSettings.enabled && blockerSettings.blockDuringFocus) {
        const activated =
          await AppBlockerService.activateBlocking(blockerSettings);
        setAppsBlocked(activated);
      }
    }
    setRunning((r) => !r);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await AppBlockerService.deactivateBlocking();
    setAppsBlocked(false);

    if (!block) {
      onClose();
      return;
    }
    if (!hasStarted || utilizedSeconds <= 0) {
      onClose();
      return;
    }

    const allocated = block.allocatedMinutes || 60;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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

    const { newBadges, xpEarned } =
      await AchievementService.processFocusSession(session);
    onClose(session, newBadges, xpEarned);
  };

  if (!block) return null;

  const allocatedSecs = (block.allocatedMinutes || 60) * 60;
  const utilPct = Math.min(
    100,
    Math.round((utilizedSeconds / allocatedSecs) * 100),
  );
  const utilMin = Math.floor(utilizedSeconds / 60);
  const ringProgress =
    1 - secondsLeft / (isWork ? POMODORO_WORK : POMODORO_BREAK);
  const estimatedXP = AchievementService.calculateSessionXP({
    id: "",
    blockType: block.type,
    blockTitle: block.title,
    date: "",
    startedAt: "",
    allocatedMinutes: block.allocatedMinutes || 60,
    utilizedSeconds,
    pomodorosCompleted,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.backdrop}>
        <View style={[styles.sheet, { borderColor: block.color + "66" }]}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: block.color + "22" },
              ]}
            >
              <Ionicons name="timer-outline" size={24} color={block.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockTitle}>{block.title}</Text>
              <Text style={styles.blockSub}>
                Allocated: {block.allocatedMinutes} min
              </Text>
            </View>
            <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#F8FAFC" />
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>

          {block.exerciseDescription ? (
            <View style={styles.exerciseDetails}>
              <Text style={styles.detailLabel}>Exercise Plan</Text>
              <Text style={styles.detailText}>{block.exerciseDescription}</Text>
            </View>
          ) : null}

          {appsBlocked && (
            <View style={styles.blockerBanner}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.blockerText}>
                Apps blocked — stay focused!
              </Text>
            </View>
          )}

          <View style={styles.phaseBadge}>
            <Animated.View
              style={[
                styles.phaseDot,
                {
                  backgroundColor: isWork ? block.color : "#10B981",
                  transform: [{ scale: running ? pulseAnim : 1 }],
                },
              ]}
            />
            <Text style={styles.phaseLabel}>
              {isWork ? "🧠 Focus Work" : "☕ Break Time"}
            </Text>
            {running && (
              <Text style={[styles.liveLabel, { color: block.color }]}>
                LIVE
              </Text>
            )}
          </View>

          <View style={styles.timerRing}>
            <View
              style={[styles.ringOuter, { borderColor: block.color + "33" }]}
            >
              <View
                style={[
                  styles.ringInner,
                  {
                    borderColor: block.color,
                    borderTopColor: "transparent",
                    transform: [{ rotate: `${ringProgress * 360}deg` }],
                  },
                ]}
              />
              <View style={styles.timerCenter}>
                <Text style={styles.timerText}>{fmt(secondsLeft)}</Text>
                <Text style={styles.timerPhase}>
                  {isWork ? "focus" : "break"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                { backgroundColor: running ? "#EF4444" : block.color },
              ]}
              onPress={handleStartFocus}
            >
              <Ionicons
                name={running ? "pause" : "play"}
                size={28}
                color="#FFF"
              />
              <Text style={styles.ctrlBtnText}>
                {running ? "Pause" : "Start Focus"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setRunning(false);
                setSecondsLeft(isWork ? POMODORO_WORK : POMODORO_BREAK);
              }}
            >
              <Ionicons name="stop-circle-outline" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.utilSection}>
            <View style={styles.utilRow}>
              <Text style={styles.utilLabel}>Time Utilized</Text>
              <Text style={[styles.utilValue, { color: block.color }]}>
                {utilMin} min / {block.allocatedMinutes} min
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${utilPct}%` as `${number}%`,
                    backgroundColor: block.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.utilPct}>
              {utilPct}% utilized • ~{estimatedXP} XP
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="timer-outline" size={18} color="#F59E0B" />
                <Text style={styles.statValue}>{pomodorosCompleted}</Text>
                <Text style={styles.statLabel}>Pomodoros</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#10B981"
                />
                <Text style={styles.statValue}>{utilPct}%</Text>
                <Text style={styles.statLabel}>Utilized</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="hourglass-outline" size={18} color="#6366F1" />
                <Text style={styles.statValue}>
                  {(block.allocatedMinutes || 0) - utilMin}m
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#12131C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 30,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  blockTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  blockSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E2030",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeTxt: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 12,
  },
  blockerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#10B98122",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#10B98144",
  },
  blockerText: { color: "#10B981", fontSize: 12, fontWeight: "600" },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  phaseDot: { width: 10, height: 10, borderRadius: 5 },
  phaseLabel: { color: "#CBD5E1", fontSize: 14, flex: 1 },
  liveLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  exerciseDetails: {
    backgroundColor: "#11121C",
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  detailLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailText: {
    color: "#F8FAFC",
    fontSize: 13,
    lineHeight: 18,
  },
  timerRing: { alignItems: "center", marginBottom: 20 },
  ringOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ringInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
  },
  timerCenter: { alignItems: "center" },
  timerText: { color: "#F8FAFC", fontSize: 42, fontWeight: "800" },
  timerPhase: {
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  ctrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  ctrlBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  resetBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#1E2030",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  utilSection: { backgroundColor: "#0D0E17", borderRadius: 14, padding: 14 },
  utilRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  utilLabel: { color: "#94A3B8", fontSize: 13 },
  utilValue: { fontSize: 13, fontWeight: "700" },
  progressBg: {
    height: 6,
    backgroundColor: "#1E2030",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: { height: 6, borderRadius: 3 },
  utilPct: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "right",
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#64748B", fontSize: 11 },
});
