import {
  FocusSession, GamificationState, Achievement, UnlockedAchievement,
  CategoryStats, TimelineItemType,
} from '../types';
import { ACHIEVEMENTS, XP_PER_POMODORO, XP_PER_FOCUS_MINUTE, XP_BONUS_FULL_UTILIZATION, getLevelFromXP } from '../data/achievements';
import { StorageService, getTodayDateString } from './storageService';

const DEFAULT_CATEGORY_STATS: CategoryStats = {
  totalSessions: 0,
  totalMinutes: 0,
  totalPomodoros: 0,
  bestUtilizationPct: 0,
};

export const DEFAULT_GAMIFICATION: GamificationState = {
  totalXP: 0,
  level: 1,
  unlockedAchievements: [],
  categoryStats: {},
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastActiveDate: null,
};

const getMetricValue = (
  achievement: Achievement,
  state: GamificationState,
  sessions: FocusSession[],
  sessionUtilPct?: number,
): number => {
  const blockSessions = achievement.blockType
    ? sessions.filter(s => s.blockType === achievement.blockType)
    : sessions;

  switch (achievement.metric) {
    case 'sessions':
      return blockSessions.length;
    case 'minutes':
      return Math.floor(blockSessions.reduce((sum, s) => sum + s.utilizedSeconds, 0) / 60);
    case 'pomodoros':
      return sessions.reduce((sum, s) => sum + s.pomodorosCompleted, 0);
    case 'streak_days':
      return state.dailyStreak;
    case 'total_xp':
      return state.totalXP;
    case 'utilization_pct':
      return sessionUtilPct ?? 0;
    default:
      return 0;
  }
};

export const AchievementService = {
  calculateSessionXP(session: FocusSession): number {
    const minutes = Math.floor(session.utilizedSeconds / 60);
    let xp = minutes * XP_PER_FOCUS_MINUTE;
    xp += session.pomodorosCompleted * XP_PER_POMODORO;

    const utilPct = Math.round((session.utilizedSeconds / (session.allocatedMinutes * 60)) * 100);
    if (utilPct >= 100) xp += XP_BONUS_FULL_UTILIZATION;
    else if (utilPct >= 80) xp += Math.round(XP_BONUS_FULL_UTILIZATION / 2);

    return xp;
  },

  async processFocusSession(session: FocusSession): Promise<{
    state: GamificationState;
    newBadges: Achievement[];
    xpEarned: number;
  }> {
    const state = await StorageService.getGamification();
    const sessions = await StorageService.getFocusHistory();
    const today = getTodayDateString();
    const xpEarned = this.calculateSessionXP(session);

    // Update daily streak
    if (state.lastActiveDate === today) {
      // same day, no streak change
    } else if (state.lastActiveDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (state.lastActiveDate === yesterdayStr) {
        state.dailyStreak += 1;
      } else {
        state.dailyStreak = 1;
      }
    } else {
      state.dailyStreak = 1;
    }
    state.lastActiveDate = today;
    state.bestDailyStreak = Math.max(state.bestDailyStreak, state.dailyStreak);

    // Update category stats
    const catKey = session.blockType;
    const catStats = state.categoryStats[catKey] || { ...DEFAULT_CATEGORY_STATS };
    catStats.totalSessions += 1;
    catStats.totalMinutes += Math.floor(session.utilizedSeconds / 60);
    catStats.totalPomodoros += session.pomodorosCompleted;
    const utilPct = Math.round((session.utilizedSeconds / (session.allocatedMinutes * 60)) * 100);
    catStats.bestUtilizationPct = Math.max(catStats.bestUtilizationPct, utilPct);
    state.categoryStats[catKey] = catStats;

    // Add XP
    state.totalXP += xpEarned;
    state.level = getLevelFromXP(state.totalXP);

    // Check achievements
    const allSessions = [session, ...sessions];
    const sessionUtilPct = utilPct;
    const alreadyUnlocked = new Set(state.unlockedAchievements.map(a => a.achievementId));
    const newBadges: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (alreadyUnlocked.has(achievement.id)) continue;
      const value = getMetricValue(achievement, state, allSessions, sessionUtilPct);
      if (value >= achievement.requirement) {
        state.unlockedAchievements.push({
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
        });
        if (achievement.xpReward > 0) {
          state.totalXP += achievement.xpReward;
        }
        newBadges.push(achievement);
      }
    }

    state.level = getLevelFromXP(state.totalXP);
    await StorageService.saveGamification(state);

    return { state, newBadges, xpEarned };
  },

  getCategorySummary(sessions: FocusSession[]): Record<string, { minutes: number; sessions: number; pomodoros: number }> {
    const summary: Record<string, { minutes: number; sessions: number; pomodoros: number }> = {};
    for (const s of sessions) {
      if (!summary[s.blockType]) {
        summary[s.blockType] = { minutes: 0, sessions: 0, pomodoros: 0 };
      }
      summary[s.blockType].minutes += Math.floor(s.utilizedSeconds / 60);
      summary[s.blockType].sessions += 1;
      summary[s.blockType].pomodoros += s.pomodorosCompleted;
    }
    return summary;
  },

  getWeeklyStats(sessions: FocusSession[]): { date: string; minutes: number }[] {
    const days: { date: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateStr);
      const minutes = daySessions.reduce((sum, s) => sum + Math.floor(s.utilizedSeconds / 60), 0);
      days.push({ date: dateStr, minutes });
    }
    return days;
  },

  isAchievementUnlocked(state: GamificationState, achievementId: string): boolean {
    return state.unlockedAchievements.some(a => a.achievementId === achievementId);
  },

  getProgressForAchievement(
    achievement: Achievement,
    state: GamificationState,
    sessions: FocusSession[],
  ): { current: number; required: number; pct: number } {
    const current = getMetricValue(achievement, state, sessions);
    return {
      current: Math.min(current, achievement.requirement),
      required: achievement.requirement,
      pct: Math.min(100, Math.round((current / achievement.requirement) * 100)),
    };
  },
};
