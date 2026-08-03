import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Gym badges
  { id: 'gym_first', title: 'First Rep', description: 'Complete your first gym focus session', icon: 'barbell', color: '#EF4444', category: 'gym', xpReward: 50, requirement: 1, metric: 'sessions', blockType: 'gym_workout' },
  { id: 'gym_5', title: 'Gym Regular', description: 'Complete 5 gym focus sessions', icon: 'fitness', color: '#EF4444', category: 'gym', xpReward: 100, requirement: 5, metric: 'sessions', blockType: 'gym_workout' },
  { id: 'gym_10', title: 'Iron Will', description: 'Complete 10 gym focus sessions', icon: 'trophy', color: '#EF4444', category: 'gym', xpReward: 200, requirement: 10, metric: 'sessions', blockType: 'gym_workout' },
  { id: 'gym_60min', title: 'Hour Power', description: 'Spend 60+ minutes in gym focus', icon: 'time', color: '#EF4444', category: 'gym', xpReward: 75, requirement: 60, metric: 'minutes', blockType: 'gym_workout' },
  { id: 'gym_300min', title: 'Beast Mode', description: 'Spend 300+ minutes in gym focus', icon: 'flame', color: '#EF4444', category: 'gym', xpReward: 250, requirement: 300, metric: 'minutes', blockType: 'gym_workout' },

  // Office badges
  { id: 'office_first', title: 'Clock In', description: 'Complete your first office focus session', icon: 'briefcase', color: '#3B82F6', category: 'office', xpReward: 50, requirement: 1, metric: 'sessions', blockType: 'office_core' },
  { id: 'office_5', title: 'Team Player', description: 'Complete 5 office focus sessions', icon: 'people', color: '#3B82F6', category: 'office', xpReward: 100, requirement: 5, metric: 'sessions', blockType: 'office_core' },
  { id: 'office_10', title: 'Workhorse', description: 'Complete 10 office focus sessions', icon: 'trophy', color: '#3B82F6', category: 'office', xpReward: 200, requirement: 10, metric: 'sessions', blockType: 'office_core' },
  { id: 'office_120min', title: 'Deep Work', description: 'Spend 120+ minutes in office focus', icon: 'time', color: '#3B82F6', category: 'office', xpReward: 100, requirement: 120, metric: 'minutes', blockType: 'office_core' },
  { id: 'office_500min', title: 'Corner Office', description: 'Spend 500+ minutes in office focus', icon: 'star', color: '#3B82F6', category: 'office', xpReward: 300, requirement: 500, metric: 'minutes', blockType: 'office_core' },

  // Hackathon badges
  { id: 'hack_first', title: 'Ship It!', description: 'Complete your first hackathon focus session', icon: 'rocket', color: '#14B8A6', category: 'hackathon', xpReward: 50, requirement: 1, metric: 'sessions', blockType: 'shipathon_block' },
  { id: 'hack_5', title: 'Builder', description: 'Complete 5 hackathon focus sessions', icon: 'construct', color: '#14B8A6', category: 'hackathon', xpReward: 100, requirement: 5, metric: 'sessions', blockType: 'shipathon_block' },
  { id: 'hack_10', title: 'Hackathon Hero', description: 'Complete 10 hackathon focus sessions', icon: 'trophy', color: '#14B8A6', category: 'hackathon', xpReward: 200, requirement: 10, metric: 'sessions', blockType: 'shipathon_block' },
  { id: 'hack_120min', title: 'Code Flow', description: 'Spend 120+ minutes in hackathon focus', icon: 'code-slash', color: '#14B8A6', category: 'hackathon', xpReward: 100, requirement: 120, metric: 'minutes', blockType: 'shipathon_block' },
  { id: 'hack_500min', title: 'Unicorn Builder', description: 'Spend 500+ minutes in hackathon focus', icon: 'diamond', color: '#14B8A6', category: 'hackathon', xpReward: 300, requirement: 500, metric: 'minutes', blockType: 'shipathon_block' },

  // Learning badges
  { id: 'learn_first', title: 'Curious Mind', description: 'Complete your first learning focus session', icon: 'book', color: '#EC4899', category: 'learning', xpReward: 50, requirement: 1, metric: 'sessions', blockType: 'learning_block' },
  { id: 'learn_5', title: 'Scholar', description: 'Complete 5 learning focus sessions', icon: 'school', color: '#EC4899', category: 'learning', xpReward: 100, requirement: 5, metric: 'sessions', blockType: 'learning_block' },
  { id: 'learn_120min', title: 'Knowledge Seeker', description: 'Spend 120+ minutes learning', icon: 'library', color: '#EC4899', category: 'learning', xpReward: 100, requirement: 120, metric: 'minutes', blockType: 'learning_block' },

  // Pomodoro badges
  { id: 'pomo_10', title: 'Tomato Farmer', description: 'Complete 10 pomodoros total', icon: 'nutrition', color: '#F59E0B', category: 'general', xpReward: 75, requirement: 10, metric: 'pomodoros' },
  { id: 'pomo_50', title: 'Pomodoro Pro', description: 'Complete 50 pomodoros total', icon: 'timer', color: '#F59E0B', category: 'general', xpReward: 200, requirement: 50, metric: 'pomodoros' },
  { id: 'pomo_100', title: 'Focus Master', description: 'Complete 100 pomodoros total', icon: 'medal', color: '#F59E0B', category: 'general', xpReward: 500, requirement: 100, metric: 'pomodoros' },

  // Streak badges
  { id: 'streak_3', title: 'On a Roll', description: '3-day focus streak', icon: 'flame', color: '#F97316', category: 'streak', xpReward: 75, requirement: 3, metric: 'streak_days' },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day focus streak', icon: 'flame', color: '#F97316', category: 'streak', xpReward: 150, requirement: 7, metric: 'streak_days' },
  { id: 'streak_30', title: 'Unstoppable', description: '30-day focus streak', icon: 'flame', color: '#F97316', category: 'streak', xpReward: 500, requirement: 30, metric: 'streak_days' },

  // General / XP badges
  { id: 'xp_500', title: 'Rising Star', description: 'Earn 500 total XP', icon: 'star', color: '#6366F1', category: 'general', xpReward: 0, requirement: 500, metric: 'total_xp' },
  { id: 'xp_2000', title: 'Elite Focus', description: 'Earn 2000 total XP', icon: 'star-half', color: '#6366F1', category: 'general', xpReward: 0, requirement: 2000, metric: 'total_xp' },
  { id: 'xp_5000', title: 'Legend', description: 'Earn 5000 total XP', icon: 'ribbon', color: '#6366F1', category: 'general', xpReward: 0, requirement: 5000, metric: 'total_xp' },
  { id: 'util_80', title: 'Time Optimizer', description: 'Hit 80%+ utilization in a session', icon: 'speedometer', color: '#10B981', category: 'general', xpReward: 50, requirement: 80, metric: 'utilization_pct' },
  { id: 'util_100', title: 'Perfect Block', description: 'Hit 100% utilization in a session', icon: 'checkmark-circle', color: '#10B981', category: 'general', xpReward: 100, requirement: 100, metric: 'utilization_pct' },
];

export const XP_PER_POMODORO = 25;
export const XP_PER_FOCUS_MINUTE = 2;
export const XP_BONUS_FULL_UTILIZATION = 50;

export const getLevelFromXP = (xp: number): number => Math.floor(xp / 200) + 1;

export const getXPForNextLevel = (xp: number): { current: number; needed: number; progress: number } => {
  const level = getLevelFromXP(xp);
  const xpForCurrentLevel = (level - 1) * 200;
  const xpInLevel = xp - xpForCurrentLevel;
  return { current: xpInLevel, needed: 200, progress: Math.min(100, Math.round((xpInLevel / 200) * 100)) };
};

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  gym_workout: 'Gym',
  office_core: 'Office',
  shipathon_block: 'Hackathon',
  learning_block: 'Learning',
};

export const BLOCK_TYPE_COLORS: Record<string, string> = {
  gym_workout: '#EF4444',
  office_core: '#3B82F6',
  shipathon_block: '#14B8A6',
  learning_block: '#EC4899',
};
