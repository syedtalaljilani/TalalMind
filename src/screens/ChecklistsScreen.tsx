import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StorageService } from '../services/storageService';
import { DailyChecklistState, ChecklistItem } from '../types';
import { ChecklistGroup } from '../components/ChecklistGroup';

export const ChecklistsScreen: React.FC = () => {
  const [checklistState, setChecklistState] = useState<DailyChecklistState | null>(null);

  const loadChecklists = useCallback(async () => {
    const data = await StorageService.getDailyChecklists();
    setChecklistState(data);
  }, []);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  const handleToggleTask = async (taskId: string) => {
    if (!checklistState) return;

    const toggle = (list: ChecklistItem[]) =>
      list.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));

    const updatedState: DailyChecklistState = {
      ...checklistState,
      officeTasks: toggle(checklistState.officeTasks),
      shipathonTasks: toggle(checklistState.shipathonTasks),
    };

    setChecklistState(updatedState);
    await StorageService.saveDailyChecklists(updatedState);
  };

  const handleAddTask = async (title: string, category: 'office' | 'shipathon') => {
    if (!checklistState) return;

    const newTask: ChecklistItem = {
      id: `${category}-${Date.now()}`,
      title,
      completed: false,
      category,
      createdAt: new Date().toISOString(),
    };

    const updatedState: DailyChecklistState = {
      ...checklistState,
      officeTasks: category === 'office' ? [...checklistState.officeTasks, newTask] : checklistState.officeTasks,
      shipathonTasks: category === 'shipathon' ? [...checklistState.shipathonTasks, newTask] : checklistState.shipathonTasks,
    };

    setChecklistState(updatedState);
    await StorageService.saveDailyChecklists(updatedState);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!checklistState) return;

    const updatedState: DailyChecklistState = {
      ...checklistState,
      officeTasks: checklistState.officeTasks.filter((t) => t.id !== taskId),
      shipathonTasks: checklistState.shipathonTasks.filter((t) => t.id !== taskId),
    };

    setChecklistState(updatedState);
    await StorageService.saveDailyChecklists(updatedState);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily Task Checklists</Text>
        <Text style={styles.subtitle}>Office Work & Ship-a-thon Sprint (Midnight Reset)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Office Tasks */}
        <ChecklistGroup
          title="Office Work Tasks"
          category="office"
          tasks={checklistState?.officeTasks || []}
          accentColor="#3B82F6"
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />

        {/* Ship-a-thon Tasks */}
        <ChecklistGroup
          title="Ship-a-thon Hackathon Project"
          category="shipathon"
          tasks={checklistState?.shipathonTasks || []}
          accentColor="#14B8A6"
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2030',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
