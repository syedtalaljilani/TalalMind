import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "../components/GlassCard";
import { StorageService, getTodayDateString } from "../services/storageService";
import { AchievementService } from "../services/achievementService";
import {
  GamificationState,
  FocusSession,
  ProductivityState,
  HabitState,
} from "../types";
import { BLOCK_TYPE_COLORS, BLOCK_TYPE_LABELS } from "../data/achievements";

interface QuickTask {
  id: string;
  title: string;
  done: boolean;
}

const WORK_MINS = 25 * 60;
const BREAK_MINS = 5 * 60;

export const ProductivityScreen: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINS);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [pomCount, setPomCount] = useState(0);
  const [taskInput, setTaskInput] = useState("");
  const [productivity, setProductivity] = useState<ProductivityState | null>(
    null,
  );
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [prod, history, game] = await Promise.all([
        StorageService.getProductivityState(),
        StorageService.getFocusHistory(),
        StorageService.getGamification(),
      ]);
      setProductivity(prod);
      setFocusHistory(history);
      setGamification(game);
      setPomCount(prod.pomodoroCount);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer.current!);
            const nextWork = !isWork;
            if (!nextWork) setPomCount((c) => c + 1);
            setIsWork(nextWork);
            setRunning(false);
            setProductivity((curr) => {
              if (!curr) return curr;
              const next = {
                ...curr,
                pomodoroCount: curr.pomodoroCount + (nextWork ? 0 : 1),
              };
              StorageService.saveProductivityState(next);
              return next;
            });
            return nextWork ? WORK_MINS : BREAK_MINS;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
    }

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running, isWork]);

  useEffect(() => {
    if (!productivity) return;
    StorageService.saveProductivityState(productivity);
  }, [productivity]);

  const persistProductivity = (next: ProductivityState) => {
    setProductivity(next);
    StorageService.saveProductivityState(next);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const addTask = () => {
    if (!taskInput.trim() || !productivity) return;
    const nextTasks = [
      { id: Date.now().toString(), title: taskInput.trim(), done: false },
      ...productivity.quickTasks,
    ];
    persistProductivity({ ...productivity, quickTasks: nextTasks });
    setTaskInput("");
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => {
    if (!productivity) return;
    const nextTasks = productivity.quickTasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    );
    persistProductivity({ ...productivity, quickTasks: nextTasks });
  };

  const deleteTask = (id: string) => {
    if (!productivity) return;
    const nextTasks = productivity.quickTasks.filter((task) => task.id !== id);
    persistProductivity({ ...productivity, quickTasks: nextTasks });
  };

  const toggleHabit = (id: string) => {
    if (!productivity) return;
    const nextHabits = productivity.habits.map((habit) => {
      if (habit.id !== id) return habit;
      const completedToday = !habit.completedToday;
      const updated: HabitState = {
        ...habit,
        completedToday,
        streak: completedToday
          ? habit.streak + 1
          : Math.max(0, habit.streak - 1),
        lastCompletedDate: completedToday ? getTodayDateString() : null,
      };
      return updated;
    });
    persistProductivity({ ...productivity, habits: nextHabits });
  };

  const today = getTodayDateString();
  const todaySessions = focusHistory.filter(
    (session) => session.date === today,
  );
  const todayMinutes = todaySessions.reduce(
    (sum, session) => sum + Math.floor(session.utilizedSeconds / 60),
    0,
  );
  const weeklyStats = useMemo(
    () => AchievementService.getWeeklyStats(focusHistory),
    [focusHistory],
  );
  const weeklyMinutes = weeklyStats.reduce(
    (sum, item) => sum + item.minutes,
    0,
  );
  const bestCategory = useMemo(() => {
    const summary = AchievementService.getCategorySummary(focusHistory);
    const entries = Object.entries(summary).sort(
      (a, b) => b[1].minutes - a[1].minutes,
    );
    return entries[0];
  }, [focusHistory]);

  const completedHabits =
    productivity?.habits.filter((habit) => habit.completedToday).length ?? 0;
  const doneTasks =
    productivity?.quickTasks.filter((task) => task.done).length ?? 0;
  const habitCount = productivity?.habits.length ?? 0;
  const taskCount = productivity?.quickTasks.length ?? 0;
  const focusGoalProgress = Math.min(
    100,
    Math.round((todayMinutes / 120) * 100),
  );
  const habitGoalProgress = Math.min(
    100,
    Math.round((completedHabits / Math.max(1, habitCount)) * 100),
  );
  const taskGoalProgress = Math.min(
    100,
    Math.round((doneTasks / Math.max(2, taskCount)) * 100),
  );
  const questBoard = [
    {
      label: "Hit 120m focus today",
      progress: focusGoalProgress,
      color: "#6366F1",
      value: `${todayMinutes}m/120m`,
    },
    {
      label: "Complete 3 habits",
      progress: habitGoalProgress,
      color: "#F59E0B",
      value: `${completedHabits}/3`,
    },
    {
      label: "Finish 2 quick tasks",
      progress: taskGoalProgress,
      color: "#10B981",
      value: `${doneTasks}/2`,
    },
  ];
  const rewardScore = Math.min(
    100,
    Math.round(
      ((completedHabits + doneTasks + Math.min(pomCount, 4)) / 10) * 100,
    ),
  );

  if (!productivity || !gamification) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading productivity data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Productivity Hub</Text>

      <GlassCard accentColor="#6366F1" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="timer-outline" size={20} color="#6366F1" />
          <Text style={styles.cardTitle}>Pomodoro Focus Timer</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pomCount} done</Text>
          </View>
        </View>
        <Text style={styles.phaseLabel}>
          {isWork ? "🧠 Focus Time" : "☕ Break Time"}
        </Text>
        <Text style={styles.timerText}>{fmt(secondsLeft)}</Text>
        <View style={styles.timerBtns}>
          <TouchableOpacity
            style={[
              styles.timerBtn,
              { backgroundColor: running ? "#EF4444" : "#6366F1" },
            ]}
            onPress={() => setRunning((r) => !r)}
          >
            <Ionicons
              name={running ? "pause" : "play"}
              size={22}
              color="#FFF"
            />
            <Text style={styles.timerBtnText}>
              {running ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timerBtn, { backgroundColor: "#26293D" }]}
            onPress={() => {
              setRunning(false);
              setSecondsLeft(isWork ? WORK_MINS : BREAK_MINS);
            }}
          >
            <Ionicons name="stop-circle-outline" size={22} color="#FFF" />
            <Text style={styles.timerBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      <GlassCard accentColor="#10B981" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pulse-outline" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>Focus Pulse</Text>
        </View>
        <View style={styles.scoreGrid}>
          {[
            {
              label: "Today",
              value: `${todayMinutes}m`,
              icon: "today-outline",
              color: "#6366F1",
            },
            {
              label: "This Week",
              value: `${weeklyMinutes}m`,
              icon: "calendar-outline",
              color: "#10B981",
            },
            {
              label: "XP Level",
              value: `L${gamification.level}`,
              icon: "sparkles-outline",
              color: "#F59E0B",
            },
          ].map((item) => (
            <View key={item.label} style={styles.scoreItem}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={[styles.scoreValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.scoreLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightText}>Best block:</Text>
          <Text style={styles.insightValue}>
            {bestCategory
              ? `${BLOCK_TYPE_LABELS[bestCategory[0]] || bestCategory[0]} • ${bestCategory[1].minutes}m`
              : "None yet"}{" "}
          </Text>
        </View>
      </GlassCard>

      <GlassCard accentColor="#F59E0B" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flame-outline" size={20} color="#F59E0B" />
          <Text style={styles.cardTitle}>Daily Habits</Text>
          <View style={[styles.badge, { backgroundColor: "#F59E0B22" }]}>
            <Text style={[styles.badgeText, { color: "#F59E0B" }]}>
              {completedHabits}/{productivity.habits.length}
            </Text>
          </View>
        </View>
        {productivity.habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={styles.habitRow}
            onPress={() => toggleHabit(habit.id)}
          >
            <Ionicons
              name={habit.icon as any}
              size={20}
              color={habit.completedToday ? "#10B981" : "#64748B"}
            />
            <Text
              style={[
                styles.habitName,
                habit.completedToday && { color: "#10B981" },
              ]}
            >
              {habit.name}
            </Text>
            <View style={styles.habitRight}>
              {habit.streak > 0 && (
                <Text style={styles.streakText}>🔥 {habit.streak}</Text>
              )}
              <Ionicons
                name={
                  habit.completedToday ? "checkmark-circle" : "ellipse-outline"
                }
                size={24}
                color={habit.completedToday ? "#10B981" : "#64748B"}
              />
            </View>
          </TouchableOpacity>
        ))}
      </GlassCard>

      <GlassCard accentColor="#8B5CF6" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="game-controller-outline" size={20} color="#8B5CF6" />
          <Text style={styles.cardTitle}>Daily Quest Board</Text>
        </View>
        {questBoard.map((quest) => (
          <View key={quest.label} style={styles.questRow}>
            <View style={styles.questHeader}>
              <Text style={styles.questLabel}>{quest.label}</Text>
              <Text style={styles.questValue}>{quest.value}</Text>
            </View>
            <View style={styles.questBg}>
              <View
                style={[
                  styles.questFill,
                  {
                    width: `${quest.progress}%`,
                    backgroundColor: quest.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
        <View style={styles.rewardRow}>
          <Text style={styles.rewardText}>Reward score</Text>
          <Text style={styles.rewardValue}>{rewardScore}%</Text>
        </View>
      </GlassCard>

      <GlassCard accentColor="#10B981" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="list-outline" size={20} color="#10B981" />
          <Text style={styles.cardTitle}>Quick Tasks</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a task..."
            placeholderTextColor="#64748B"
            value={taskInput}
            onChangeText={setTaskInput}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Ionicons name="add-circle" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>
        {productivity.quickTasks.length === 0 && (
          <Text style={styles.emptyText}>No quick tasks. Add some! ✨</Text>
        )}
        {productivity.quickTasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <TouchableOpacity
              onPress={() => toggleTask(task.id)}
              style={styles.taskCheck}
            >
              <Ionicons
                name={task.done ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={task.done ? "#10B981" : "#64748B"}
              />
            </TouchableOpacity>
            <Text style={[styles.taskText, task.done && styles.taskDone]}>
              {task.title}
            </Text>
            <TouchableOpacity onPress={() => deleteTask(task.id)}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </GlassCard>

      <GlassCard accentColor="#EC4899" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart-outline" size={20} color="#EC4899" />
          <Text style={styles.cardTitle}>Recent Focus History</Text>
        </View>
        {focusHistory.slice(0, 4).map((session) => {
          const color = BLOCK_TYPE_COLORS[session.blockType] || "#6366F1";
          const fontColor = { color };
          return (
            <View key={session.id} style={styles.historyRow}>
              <View style={[styles.historyDot, { backgroundColor: color }]} />
              <View style={styles.historyBody}>
                <Text style={styles.historyTitle}>{session.blockTitle}</Text>
                <Text style={styles.historyMeta}>
                  {session.date} • {Math.floor(session.utilizedSeconds / 60)}m •{" "}
                  {session.pomodorosCompleted} 🍅
                </Text>
              </View>
              <Text style={[styles.historyTag, fontColor]}>
                {BLOCK_TYPE_LABELS[session.blockType] || session.blockType}
              </Text>
            </View>
          );
        })}
      </GlassCard>

      <GlassCard accentColor="#8B5CF6" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
          <Text style={styles.cardTitle}>Game Day Score</Text>
        </View>
        <View style={styles.scoreGrid}>
          {[
            {
              label: "Pomodoros",
              value: pomCount,
              icon: "timer-outline",
              color: "#6366F1",
            },
            {
              label: "Habits Done",
              value: completedHabits,
              icon: "flame-outline",
              color: "#F59E0B",
            },
            {
              label: "Tasks Done",
              value: doneTasks,
              icon: "checkmark-circle-outline",
              color: "#10B981",
            },
          ].map((item) => (
            <View key={item.label} style={styles.scoreItem}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={[styles.scoreValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.scoreLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A0F" },
  scroll: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  heading: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },
  card: { marginBottom: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700", flex: 1 },
  badge: {
    backgroundColor: "#6366F122",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: "#6366F1", fontSize: 12, fontWeight: "700" },
  phaseLabel: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  timerText: {
    color: "#F8FAFC",
    fontSize: 56,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 8,
  },
  timerBtns: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  timerBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2030",
  },
  habitName: { color: "#CBD5E1", fontSize: 14, flex: 1 },
  habitRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakText: { color: "#F59E0B", fontSize: 12, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#11121C",
    color: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#26293D",
    fontSize: 14,
  },
  addBtn: { padding: 4 },
  emptyText: { color: "#64748B", textAlign: "center", paddingVertical: 12 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2030",
  },
  taskCheck: {},
  taskText: { color: "#CBD5E1", fontSize: 14, flex: 1 },
  taskDone: { textDecorationLine: "line-through", color: "#475569" },
  scoreGrid: { flexDirection: "row", justifyContent: "space-around" },
  scoreItem: { alignItems: "center", gap: 4 },
  scoreValue: { fontSize: 28, fontWeight: "800" },
  scoreLabel: { color: "#94A3B8", fontSize: 11 },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  insightText: { color: "#CBD5E1", fontSize: 12 },
  insightValue: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  questRow: { marginBottom: 10 },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  questLabel: { color: "#CBD5E1", fontSize: 12, fontWeight: "600" },
  questValue: { color: "#F8FAFC", fontSize: 11, fontWeight: "700" },
  questBg: {
    height: 6,
    backgroundColor: "#1E2030",
    borderRadius: 4,
    overflow: "hidden",
  },
  questFill: { height: 6, borderRadius: 4 },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E2030",
  },
  rewardText: { color: "#CBD5E1", fontSize: 12 },
  rewardValue: { color: "#8B5CF6", fontSize: 14, fontWeight: "800" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyBody: { flex: 1 },
  historyTitle: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  historyMeta: { color: "#64748B", fontSize: 11, marginTop: 2 },
  historyTag: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  loading: { color: "#64748B", textAlign: "center", marginTop: 100 },
});
