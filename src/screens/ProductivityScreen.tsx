import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, ScrollView, Keyboard, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';

interface QuickTask {
  id: string;
  title: string;
  done: boolean;
}

interface HabitItem {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completedToday: boolean;
}

const DEFAULT_HABITS: HabitItem[] = [
  { id: '1', name: 'Morning Gym', icon: 'barbell-outline', streak: 0, completedToday: false },
  { id: '2', name: 'Read / Learn', icon: 'book-outline', streak: 0, completedToday: false },
  { id: '3', name: 'Ship-a-thon', icon: 'rocket-outline', streak: 0, completedToday: false },
  { id: '4', name: 'Walk 5000 Steps', icon: 'walk-outline', streak: 0, completedToday: false },
  { id: '5', name: 'No Social After 9PM', icon: 'moon-outline', streak: 0, completedToday: false },
];

export const ProductivityScreen: React.FC = () => {
  // ── Pomodoro ─────────────────────────────────────
  const WORK_MINS = 25 * 60;
  const BREAK_MINS = 5 * 60;
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINS);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [pomCount, setPomCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer.current!);
            const nextWork = !isWork;
            if (!nextWork) setPomCount(c => c + 1);
            setIsWork(nextWork);
            setRunning(false);
            return nextWork ? WORK_MINS : BREAK_MINS;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timer.current) clearInterval(timer.current);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [running, isWork]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  // ── Quick Tasks ───────────────────────────────────
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [taskInput, setTaskInput] = useState('');

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(prev => [{ id: Date.now().toString(), title: taskInput.trim(), done: false }, ...prev]);
    setTaskInput('');
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  // ── Habit Tracker ─────────────────────────────────
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const toggleHabit = (id: string) => setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h));

  const completedHabits = habits.filter(h => h.completedToday).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>Productivity Hub</Text>

      {/* Pomodoro Timer */}
      <GlassCard accentColor="#6366F1" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="timer-outline" size={20} color="#6366F1" />
          <Text style={styles.cardTitle}>Pomodoro Focus Timer</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pomCount} done</Text>
          </View>
        </View>
        <Text style={styles.phaseLabel}>{isWork ? '🧠 Focus Time' : '☕ Break Time'}</Text>
        <Text style={styles.timerText}>{fmt(secondsLeft)}</Text>
        <View style={styles.timerBtns}>
          <TouchableOpacity
            style={[styles.timerBtn, { backgroundColor: running ? '#EF4444' : '#6366F1' }]}
            onPress={() => setRunning(r => !r)}
          >
            <Ionicons name={running ? 'pause' : 'play'} size={22} color="#FFF" />
            <Text style={styles.timerBtnText}>{running ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.timerBtn, { backgroundColor: '#26293D' }]} onPress={() => { setRunning(false); setSecondsLeft(isWork ? WORK_MINS : BREAK_MINS); }}>
            <Ionicons name="stop-circle-outline" size={22} color="#FFF" />
            <Text style={styles.timerBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Habit Tracker */}
      <GlassCard accentColor="#F59E0B" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="flame-outline" size={20} color="#F59E0B" />
          <Text style={styles.cardTitle}>Daily Habits</Text>
          <View style={[styles.badge, { backgroundColor: '#F59E0B22' }]}>
            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{completedHabits}/{habits.length}</Text>
          </View>
        </View>
        {habits.map(habit => (
          <TouchableOpacity key={habit.id} style={styles.habitRow} onPress={() => toggleHabit(habit.id)}>
            <Ionicons name={habit.icon as any} size={20} color={habit.completedToday ? '#10B981' : '#64748B'} />
            <Text style={[styles.habitName, habit.completedToday && { color: '#10B981' }]}>{habit.name}</Text>
            <View style={styles.habitRight}>
              {habit.streak > 0 && <Text style={styles.streakText}>🔥 {habit.streak}</Text>}
              <Ionicons name={habit.completedToday ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={habit.completedToday ? '#10B981' : '#64748B'} />
            </View>
          </TouchableOpacity>
        ))}
      </GlassCard>

      {/* Quick Task List */}
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
        {tasks.length === 0 && <Text style={styles.emptyText}>No quick tasks. Add some! ✨</Text>}
        {tasks.map(task => (
          <View key={task.id} style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(task.id)} style={styles.taskCheck}>
              <Ionicons name={task.done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={task.done ? '#10B981' : '#64748B'} />
            </TouchableOpacity>
            <Text style={[styles.taskText, task.done && styles.taskDone]}>{task.title}</Text>
            <TouchableOpacity onPress={() => deleteTask(task.id)}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </GlassCard>

      {/* Daily Score Card */}
      <GlassCard accentColor="#EC4899" style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart-outline" size={20} color="#EC4899" />
          <Text style={styles.cardTitle}>Day Score</Text>
        </View>
        <View style={styles.scoreGrid}>
          {[
            { label: 'Pomodoros', value: pomCount, icon: 'timer-outline', color: '#6366F1' },
            { label: 'Habits Done', value: completedHabits, icon: 'flame-outline', color: '#F59E0B' },
            { label: 'Tasks Done', value: tasks.filter(t => t.done).length, icon: 'checkmark-circle-outline', color: '#10B981' },
          ].map(item => (
            <View key={item.label} style={styles.scoreItem}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={[styles.scoreValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.scoreLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090A0F' },
  scroll: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  heading: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', marginBottom: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: '#6366F122', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#6366F1', fontSize: 12, fontWeight: '700' },
  phaseLabel: { color: '#CBD5E1', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  timerText: { color: '#F8FAFC', fontSize: 56, fontWeight: '800', textAlign: 'center', marginVertical: 8 },
  timerBtns: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 },
  timerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  timerBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#1E2030' },
  habitName: { color: '#CBD5E1', fontSize: 14, flex: 1 },
  habitRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#11121C', color: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#26293D', fontSize: 14 },
  addBtn: { padding: 4 },
  emptyText: { color: '#64748B', textAlign: 'center', paddingVertical: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E2030' },
  taskCheck: {},
  taskText: { color: '#CBD5E1', fontSize: 14, flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: '#475569' },
  scoreGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  scoreItem: { alignItems: 'center', gap: 4 },
  scoreValue: { fontSize: 28, fontWeight: '800' },
  scoreLabel: { color: '#94A3B8', fontSize: 11 },
});
