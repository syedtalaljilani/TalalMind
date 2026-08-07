import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TimelineItem, FocusSession, Achievement } from "../types";
import { StorageService, getTodayDateString } from "../services/storageService";
import { AchievementService } from "../services/achievementService";
import { AppBlockerService } from "../services/appBlockerService";
import { AutoBlockService } from "../services/autoBlockService";

interface Props {
  visible: boolean;
  block: TimelineItem | null;
  onClose: (
    session?: FocusSession,
    newBadges?: Achievement[],
    xpEarned?: number,
  ) => void;
}

const POMODORO_BREAK = 5 * 60;
const WATER_GOAL_ML = 2000;
const GLASS_ML = 250;
const HALF_GLASS_ML = 125;
const SIP_ML = 50;

const getWorkSeconds = (allocatedMinutes?: number) =>
  (allocatedMinutes || 60) * 60;

export const FocusTimerModal: React.FC<Props> = ({
  visible,
  block,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getWorkSeconds(block?.allocatedMinutes),
  );
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [utilizedSeconds, setUtilizedSeconds] = useState(0);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [waterToday, setWaterToday] = useState(0);
  const [showWaterReminder, setShowWaterReminder] = useState(false);
  const [blockStatus, setBlockStatus] = useState<{
    active: boolean;
    count: number;
    error?: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setSecondsLeft(getWorkSeconds(block?.allocatedMinutes));
      setIsWork(true);
      setRunning(false);
      setUtilizedSeconds(0);
      setPomodorosCompleted(0);
      setHasStarted(false);
      setShowWaterReminder(false);
      setBlockStatus(null);
      StorageService.getWaterToday().then(setWaterToday);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      AppBlockerService.setManualFocusActive(false);
      AppBlockerService.stopForFocus();
      void AutoBlockService.evaluate();
    };
  }, [visible]);

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
    if (running) {
      const workSeconds = getWorkSeconds(block?.allocatedMinutes);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (isWork) {
              setPomodorosCompleted((c) => c + 1);
              setUtilizedSeconds((u) => u + workSeconds);
              setIsWork(false);
              setShowWaterReminder(true);
              return POMODORO_BREAK;
            } else {
              setIsWork(true);
              return workSeconds;
            }
          }
          if (isWork) setUtilizedSeconds((u) => u + 1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running, isWork, block]);

  const handleStartFocus = async () => {
    if (!running) {
      if (!hasStarted) {
        setHasStarted(true);
        AppBlockerService.configureOverlayTheme();
        const result = await AppBlockerService.applyForFocus();
        if (result.ok) {
          AppBlockerService.setManualFocusActive(true);
        }
        setBlockStatus({
          active: result.ok,
          count: result.count,
          error: result.error,
        });
      }
    }

    setRunning((r) => !r);
  };

  const handleLogWater = async (amountMl: number) => {
    const total = await StorageService.logWaterToday(amountMl);
    setWaterToday(total);
    setShowWaterReminder(false);
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
  const waterPct = Math.min(100, Math.round((waterToday / WATER_GOAL_ML) * 100));
  const workSeconds = getWorkSeconds(block.allocatedMinutes);
  const ringProgress =
    1 - secondsLeft / (isWork ? workSeconds : POMODORO_BREAK);
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
              {isWork ? "🧠 Focus Work" : "💧 Water Break"}
            </Text>
            {running && (
              <Text style={[styles.liveLabel, { color: block.color }]}>
                LIVE
              </Text>
            )}
          </View>

          {blockStatus && (
            <View
              style={[
                styles.blockBanner,
                blockStatus.active
                  ? styles.blockBannerActive
                  : styles.blockBannerError,
              ]}
            >
              <Ionicons
                name={blockStatus.active ? "shield-checkmark" : "warning"}
                size={16}
                color={blockStatus.active ? "#10B981" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.blockBannerText,
                  { color: blockStatus.active ? "#6EE7B7" : "#FCD34D" },
                ]}
              >
                {blockStatus.active
                  ? `Shield on — ${blockStatus.count} app${blockStatus.count === 1 ? "" : "s"} blocked while this timer runs`
                  : `Shield off: ${blockStatus.error ?? "unknown error"}`}
              </Text>
            </View>
          )}

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
                  {isWork ? "focus" : "water break"}
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
                setSecondsLeft(
                  isWork
                    ? getWorkSeconds(block.allocatedMinutes)
                    : POMODORO_BREAK,
                );
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

          {!isWork && (
            <View
              style={[
                styles.waterSection,
                showWaterReminder && styles.waterSectionRemind,
              ]}
            >
              <View style={styles.waterHeader}>
                <View style={styles.waterTitleRow}>
                  <Ionicons name="water-outline" size={18} color="#38BDF8" />
                  <Text style={styles.waterTitle}>Water Break</Text>
                </View>
                <Text style={styles.waterTotal}>
                  {waterToday} / {WATER_GOAL_ML} ml today
                </Text>
              </View>

              <View style={styles.waterPrompt}>
                <Ionicons name="cafe-outline" size={18} color="#7DD3FC" />
                <Text style={styles.waterPromptText}>
                  How much water did you drink this break?
                </Text>
              </View>

              {showWaterReminder && (
                <View style={styles.waterReminder}>
                  <Ionicons name="water" size={16} color="#38BDF8" />
                  <Text style={styles.waterReminderText}>
                    Time to hydrate — grab a glass of water!
                  </Text>
                </View>
              )}

              <View style={styles.waterActions}>
                <TouchableOpacity
                  style={styles.waterBtn}
                  onPress={() => handleLogWater(SIP_ML)}
                >
                  <Ionicons name="water" size={16} color="#38BDF8" />
                  <Text style={styles.waterBtnText}>Sip</Text>
                  <Text style={styles.waterBtnSub}>{SIP_ML}ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waterBtn}
                  onPress={() => handleLogWater(HALF_GLASS_ML)}
                >
                  <Ionicons name="water" size={16} color="#38BDF8" />
                  <Text style={styles.waterBtnText}>Half Glass</Text>
                  <Text style={styles.waterBtnSub}>{HALF_GLASS_ML}ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waterBtn}
                  onPress={() => handleLogWater(GLASS_ML)}
                >
                  <Ionicons name="water" size={16} color="#38BDF8" />
                  <Text style={styles.waterBtnText}>Glass</Text>
                  <Text style={styles.waterBtnSub}>{GLASS_ML}ml</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${waterPct}%` as `${number}%`,
                      backgroundColor: "#38BDF8",
                    },
                  ]}
                />
              </View>
              <Text style={styles.waterHint}>
                {waterPct >= 100
                  ? "Daily goal reached — keep it up! 💧"
                  : `${WATER_GOAL_ML - waterToday} ml to go today`}
              </Text>
            </View>
          )}
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
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  phaseDot: { width: 10, height: 10, borderRadius: 5 },
  phaseLabel: { color: "#CBD5E1", fontSize: 14, flex: 1 },
  liveLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  blockBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  blockBannerActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  blockBannerError: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  blockBannerText: { fontSize: 12, fontWeight: "600", flex: 1 },
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
  waterSection: {
    marginTop: 12,
    backgroundColor: "#0D0E17",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.15)",
  },
  waterSectionRemind: {
    backgroundColor: "#0B1524",
    borderColor: "rgba(56, 189, 248, 0.55)",
  },
  waterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  waterTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  waterTitle: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  waterTotal: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  waterHint: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  waterReminder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  waterReminderText: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  waterPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#11121C",
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  waterPromptText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  waterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
  },
  waterBtn: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    backgroundColor: "#11121C",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  waterBtnText: { color: "#F8FAFC", fontSize: 12, fontWeight: "700" },
  waterBtnSub: { color: "#38BDF8", fontSize: 10 },
});
