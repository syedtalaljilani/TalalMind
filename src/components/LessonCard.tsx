import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson, LessonProgress } from '../types';
import { GlassCard } from './GlassCard';

interface LessonCardProps {
  lesson: Lesson;
  progress: LessonProgress;
  totalLessons: number;
  onToggleComplete: (id: number) => void;
  onNextLesson: () => void;
  onPrevLesson: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  progress,
  totalLessons,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
}) => {
  const isCompleted = progress.completedIds.includes(lesson.id);
  const percentage = Math.round((progress.completedIds.length / totalLessons) * 100);

  return (
    <GlassCard active={!isCompleted} accentColor="#EC4899">
      {/* Progress & Streak Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <View style={styles.moduleTag}>
            <Text style={styles.moduleTagText}>{lesson.module}</Text>
          </View>
          {lesson.lang && lesson.lang !== '—' && (
            <View style={[styles.moduleTag, { backgroundColor: '#3B82F622', borderColor: '#3B82F644' }]}>
              <Text style={[styles.moduleTagText, { color: '#60A5FA' }]}>{lesson.lang}</Text>
            </View>
          )}
          {lesson.type && (
            <View style={[styles.moduleTag, { backgroundColor: '#10B98122', borderColor: '#10B98144' }]}>
              <Text style={[styles.moduleTagText, { color: '#34D399' }]}>{lesson.type}</Text>
            </View>
          )}
        </View>

        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{progress.currentStreak} Day Streak</Text>
        </View>
      </View>

      {/* Lesson Title & Details */}
      <View style={styles.body}>
        <Text style={styles.lessonNumber}>
          Lesson {lesson.id} of {totalLessons}
        </Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {progress.completedIds.length} / {totalLessons} Completed ({percentage}%)
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.navBtn} onPress={onPrevLesson} disabled={lesson.id === 1}>
          <Ionicons name="chevron-back" size={20} color={lesson.id === 1 ? '#475569' : '#94A3B8'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeBtn, isCompleted ? styles.completeBtnActive : styles.completeBtnNormal]}
          onPress={() => onToggleComplete(lesson.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.completeBtnText}>
            {isCompleted ? 'Completed Today! ✓' : 'Mark Lesson as Done'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={onNextLesson} disabled={lesson.id === totalLessons}>
          <Ionicons name="chevron-forward" size={20} color={lesson.id === totalLessons ? '#475569' : '#94A3B8'} />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTag: {
    backgroundColor: '#EC489922',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EC489944',
  },
  moduleTagText: {
    color: '#F472B6',
    fontSize: 11,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    marginBottom: 14,
  },
  lessonNumber: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  lessonDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#26293D',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#26293D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  completeBtnNormal: {
    backgroundColor: '#EC4899',
  },
  completeBtnActive: {
    backgroundColor: '#10B981',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
