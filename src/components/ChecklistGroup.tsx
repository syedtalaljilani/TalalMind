import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem } from '../types';
import { GlassCard } from './GlassCard';

interface ChecklistGroupProps {
  title: string;
  category: 'office' | 'shipathon';
  tasks: ChecklistItem[];
  accentColor: string;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, category: 'office' | 'shipathon') => void;
  onDeleteTask: (id: string) => void;
}

export const ChecklistGroup: React.FC<ChecklistGroupProps> = ({
  title,
  category,
  tasks,
  accentColor,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), category);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <GlassCard accentColor={accentColor} style={styles.cardMargin}>
      {/* Title Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: accentColor + '22' }]}>
            <Ionicons
              name={category === 'office' ? 'briefcase' : 'rocket'}
              size={18}
              color={accentColor}
            />
          </View>
          <Text style={styles.groupTitle}>{title}</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={[styles.countText, { color: accentColor }]}>
            {completedCount}/{tasks.length} Done
          </Text>
        </View>
      </View>

      {/* Midnight Reset Banner Info */}
      <View style={styles.resetNotice}>
        <Ionicons name="refresh-circle-outline" size={14} color="#64748B" />
        <Text style={styles.resetNoticeText}>Resets automatically at 00:00 Midnight</Text>
      </View>

      {/* Task Items */}
      <View style={styles.taskList}>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <TouchableOpacity
              style={styles.checkboxTouch}
              onPress={() => onToggleTask(task.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={task.completed ? 'checkbox' : 'square-outline'}
                size={22}
                color={task.completed ? accentColor : '#64748B'}
              />
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}
              >
                {task.title}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onDeleteTask(task.id)}>
              <Ionicons name="trash-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add New Task Inline Input */}
      {isAdding ? (
        <View style={styles.addInputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter task name..."
            placeholderTextColor="#64748B"
            value={newTitle}
            onChangeText={setNewTitle}
            onSubmitEditing={handleAdd}
            autoFocus
          />
          <TouchableOpacity style={[styles.addConfirmBtn, { backgroundColor: accentColor }]} onPress={handleAdd}>
            <Ionicons name="checkmark" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAdding(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={18} color={accentColor} />
          <Text style={[styles.addBtnText, { color: accentColor }]}>Add Task</Text>
        </TouchableOpacity>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardMargin: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#26293D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  resetNoticeText: {
    color: '#64748B',
    fontSize: 11,
  },
  taskList: {
    gap: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#11121C',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#26293D',
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  taskTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#11121C',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
  },
  addConfirmBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#26293D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
