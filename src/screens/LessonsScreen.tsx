import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALL_LESSONS } from '../data/lessons';
import { FDE_LESSONS } from '../data/fdeRoadmap';
import { Lesson, LessonProgress } from '../types';
import { StorageService, getTodayDateString } from '../services/storageService';
import { LessonCard } from '../components/LessonCard';

interface PhaseGroup {
  name: string;
  lessons: Lesson[];
  completedCount: number;
}

type CurriculumKey = 'ai' | 'fde';

interface CurriculumMeta {
  key: CurriculumKey;
  label: string;
  title: string;
  icon: 'code-slash' | 'rocket';
  color: string;
  accent: string;
  lessons: Lesson[];
}

const CURRICULA: CurriculumMeta[] = [
  {
    key: 'ai',
    label: 'AI from Scratch',
    title: 'AI Engineering From Scratch',
    icon: 'code-slash',
    color: '#EC4899',
    accent: '#EC489922',
    lessons: ALL_LESSONS,
  },
  {
    key: 'fde',
    label: 'FDE Roadmap',
    title: 'Founding Engineer / FDE (AI + CV)',
    icon: 'rocket',
    color: '#38BDF8',
    accent: '#38BDF822',
    lessons: FDE_LESSONS,
  },
];

const DAILY_MINUTES: Record<CurriculumKey, number> = { ai: 60, fde: 60 };

export const LessonsScreen: React.FC = () => {
  const [progress, setProgress] = useState<LessonProgress>({
    completedIds: [],
    lastCompletedDate: null,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [activeCurriculum, setActiveCurriculum] = useState<CurriculumKey>('ai');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<Record<CurriculumKey, number>>({ ai: 0, fde: 0 });
  const [searchQuery, setSearchQuery] = useState<Record<CurriculumKey, string>>({ ai: '', fde: '' });
  const [expandedPhases, setExpandedPhases] = useState<Record<CurriculumKey, Record<string, boolean>>>({ ai: {}, fde: {} });

  const activeLessons = CURRICULA.find((c) => c.key === activeCurriculum)!.lessons;

  const loadProgress = useCallback(async () => {
    const p = await StorageService.getLessonProgress();
    setProgress(p);

    CURRICULA.forEach((c) => {
      // Auto navigate to the first uncompleted lesson of each curriculum
      const nextUncompletedIndex = c.lessons.findIndex((l) => !p.completedIds.includes(l.id));
      if (nextUncompletedIndex !== -1) {
        setSelectedLessonIndex((prev) => ({ ...prev, [c.key]: nextUncompletedIndex }));
        // Auto expand the phase containing the current uncompleted lesson
        const activePhase = c.lessons[nextUncompletedIndex].module;
        setExpandedPhases((prev) => ({
          ...prev,
          [c.key]: { ...prev[c.key], [activePhase]: true },
        }));
      }
    });
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleToggleComplete = async (lessonId: number) => {
    const today = getTodayDateString();
    const isCompleted = progress.completedIds.includes(lessonId);
    let newCompletedIds: number[];

    if (isCompleted) {
      newCompletedIds = progress.completedIds.filter((id) => id !== lessonId);
    } else {
      newCompletedIds = [...progress.completedIds, lessonId];
    }

    // Streak calculation logic
    let newStreak = progress.currentStreak;
    let lastDate = progress.lastCompletedDate;

    if (!isCompleted) {
      if (lastDate === null) {
        newStreak = 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];

        if (lastDate === today) {
          // Already completed a lesson today, streak stays
        } else if (lastDate === yStr) {
          newStreak += 1;
        } else {
          newStreak = 1; // Reset if missed a day
        }
      }
      lastDate = today;
    }

    const updatedProgress: LessonProgress = {
      completedIds: newCompletedIds,
      lastCompletedDate: lastDate,
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, progress.bestStreak),
    };

    setProgress(updatedProgress);
    await StorageService.saveLessonProgress(updatedProgress);
  };

  const togglePhaseExpand = (phaseName: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [activeCurriculum]: {
        ...prev[activeCurriculum],
        [phaseName]: !prev[activeCurriculum]?.[phaseName],
      },
    }));
  };

  // Group lessons by phase module
  const phaseGroups: PhaseGroup[] = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    const q = searchQuery[activeCurriculum].toLowerCase().trim();
    activeLessons.forEach((lesson) => {
      const matchesSearch =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.module.toLowerCase().includes(q) ||
        lesson.id.toString() === q;

      if (matchesSearch) {
        if (!map[lesson.module]) {
          map[lesson.module] = [];
        }
        map[lesson.module].push(lesson);
      }
    });

    return Object.keys(map).map((phaseName) => {
      const lessons = map[phaseName];
      const completedCount = lessons.filter((l) => progress.completedIds.includes(l.id)).length;
      return {
        name: phaseName,
        lessons,
        completedCount,
      };
    });
  }, [searchQuery, activeCurriculum, activeLessons, progress.completedIds]);

  const toggleExpandAll = (expand: boolean) => {
    const state: Record<string, boolean> = {};
    phaseGroups.forEach((pg) => {
      state[pg.name] = expand;
    });
    setExpandedPhases((prev) => ({ ...prev, [activeCurriculum]: state }));
  };

  const currentLesson = activeLessons[selectedLessonIndex[activeCurriculum]] || activeLessons[0];
  const curriculumProgress = progress.completedIds.filter((id) =>
    activeLessons.some((l) => l.id === id),
  ).length;
  const overallPct = Math.round((curriculumProgress / activeLessons.length) * 100);
  const activeMeta = CURRICULA.find((c) => c.key === activeCurriculum)!;

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Learning Center</Text>
        <Text style={styles.subtitle}>Two tracks • 1 hr each daily</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Curriculum Cards */}
        <View style={styles.tabRow}>
          {CURRICULA.map((curriculum) => {
            const isActive = curriculum.key === activeCurriculum;
            const doneCount = progress.completedIds.filter((id) =>
              curriculum.lessons.some((l) => l.id === id),
            ).length;
            const pct = Math.round((doneCount / curriculum.lessons.length) * 100);

            return (
              <TouchableOpacity
                key={curriculum.key}
                style={[
                  styles.tabCard,
                  isActive && { borderColor: curriculum.color, backgroundColor: curriculum.accent },
                ]}
                onPress={() => setActiveCurriculum(curriculum.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.tabIconWrap, { backgroundColor: curriculum.accent }]}>
                  <Ionicons name={curriculum.icon} size={20} color={curriculum.color} />
                </View>
                <Text style={[styles.tabLabel, isActive && { color: curriculum.color }]}>
                  {curriculum.label}
                </Text>
                <Text style={styles.tabMeta}>
                  {doneCount}/{curriculum.lessons.length} • {pct}%
                </Text>
                <Text style={styles.tabDaily}>{DAILY_MINUTES[curriculum.key]} min daily</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main Focus Lesson Card */}
        <LessonCard
          lesson={currentLesson}
          progress={{ ...progress, completedIds: progress.completedIds.filter((id) => activeLessons.some((l) => l.id === id)) }}
          totalLessons={activeLessons.length}
          index={selectedLessonIndex[activeCurriculum]}
          onToggleComplete={handleToggleComplete}
          onPrevLesson={() =>
            setSelectedLessonIndex((prev) => ({
              ...prev,
              [activeCurriculum]: Math.max(0, prev[activeCurriculum] - 1),
            }))
          }
          onNextLesson={() =>
            setSelectedLessonIndex((prev) => ({
              ...prev,
              [activeCurriculum]: Math.min(activeLessons.length - 1, prev[activeCurriculum] + 1),
            }))
          }
        />

        {/* Grouped Catalog Section */}
        <View style={styles.catalogSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Curriculum Phase Groups</Text>

            <View style={styles.expandControls}>
              <TouchableOpacity onPress={() => toggleExpandAll(true)}>
                <Text style={styles.expandControlText}>Expand All</Text>
              </TouchableOpacity>
              <Text style={styles.expandDivider}>•</Text>
              <TouchableOpacity onPress={() => toggleExpandAll(false)}>
                <Text style={styles.expandControlText}>Collapse All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Filter ${activeLessons.length} lessons by title, phase, or #...`}
              placeholderTextColor="#64748B"
              value={searchQuery[activeCurriculum]}
              onChangeText={(text) =>
                setSearchQuery((prev) => ({ ...prev, [activeCurriculum]: text }))
              }
            />
            {searchQuery[activeCurriculum] !== '' && (
              <TouchableOpacity
                onPress={() => setSearchQuery((prev) => ({ ...prev, [activeCurriculum]: '' }))}
              >
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Render Phase Groups */}
          {phaseGroups.map((group) => {
            const isExpanded = expandedPhases[activeCurriculum]?.[group.name] || searchQuery[activeCurriculum] !== '';
            const allGroupDone = group.completedCount === group.lessons.length && group.lessons.length > 0;

            return (
              <View key={group.name} style={styles.phaseCard}>
                {/* Phase Header Accordion */}
                <TouchableOpacity
                  style={styles.phaseHeader}
                  onPress={() => togglePhaseExpand(group.name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.phaseTitleRow}>
                    <Ionicons
                      name={allGroupDone ? 'checkmark-done-circle' : 'folder-open-outline'}
                      size={20}
                      color={allGroupDone ? '#10B981' : activeMeta.color}
                    />
                    <Text style={styles.phaseNameText}>{group.name}</Text>
                  </View>

                  <View style={styles.phaseRightInfo}>
                    <View style={[styles.badge, allGroupDone && styles.badgeDone]}>
                      <Text style={[styles.badgeText, allGroupDone && styles.badgeTextDone]}>
                        {group.completedCount}/{group.lessons.length}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>

                {/* Lessons in Phase */}
                {isExpanded && (
                  <View style={styles.lessonsContainer}>
                    {group.lessons.map((lesson) => {
                      const done = progress.completedIds.includes(lesson.id);
                      const isSelected = lesson.id === currentLesson.id;
                      const globalIdx = activeLessons.findIndex((l) => l.id === lesson.id);

                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          style={[
                            styles.lessonItemRow,
                            isSelected && styles.selectedItemRow,
                          ]}
                          onPress={() =>
                            setSelectedLessonIndex((prev) => ({ ...prev, [activeCurriculum]: globalIdx }))
                          }
                          activeOpacity={0.7}
                        >
                          <TouchableOpacity
                            style={styles.checkboxTouch}
                            onPress={() => handleToggleComplete(lesson.id)}
                          >
                            <Ionicons
                              name={done ? 'checkmark-circle' : 'ellipse-outline'}
                              size={20}
                              color={done ? '#10B981' : '#64748B'}
                            />
                          </TouchableOpacity>

                          <View style={styles.lessonTextContainer}>
                            <Text
                              style={[
                                styles.lessonItemTitle,
                                done && styles.lessonItemTitleDone,
                                isSelected && { color: activeMeta.color, fontWeight: '700' },
                              ]}
                            >
                              {lesson.title}
                            </Text>

                            <View style={styles.metaRow}>
                              {lesson.lang && lesson.lang !== '—' && (
                                <Text style={styles.langTag}>{lesson.lang}</Text>
                              )}
                              {lesson.type && (
                                <Text style={styles.typeTag}>{lesson.type}</Text>
                              )}
                            </View>
                          </View>

                          {isSelected && (
                            <View style={styles.activeFocusBadge}>
                              <Text style={styles.activeFocusText}>FOCUS</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabCard: {
    flex: 1,
    backgroundColor: '#161824',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#26293D',
    padding: 14,
    gap: 6,
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  tabMeta: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  tabDaily: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  catalogSection: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  expandControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandControlText: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '600',
  },
  expandDivider: {
    color: '#475569',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161824',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#26293D',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  phaseCard: {
    backgroundColor: '#161824',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#26293D',
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1A1C29',
  },
  phaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  phaseNameText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  phaseRightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: '#EC489922',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeDone: {
    backgroundColor: '#10B98122',
  },
  badgeText: {
    color: '#F472B6',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextDone: {
    color: '#34D399',
  },
  lessonsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#11121C',
    gap: 6,
  },
  lessonItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161824',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26293D',
  },
  selectedItemRow: {
    borderColor: '#EC4899',
    backgroundColor: '#EC489911',
  },
  checkboxTouch: {
    marginRight: 10,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonItemTitle: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  lessonItemTitleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  langTag: {
    color: '#60A5FA',
    fontSize: 10,
    backgroundColor: '#3B82F611',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeTag: {
    color: '#34D399',
    fontSize: 10,
    backgroundColor: '#10B98111',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeFocusBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeFocusText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
