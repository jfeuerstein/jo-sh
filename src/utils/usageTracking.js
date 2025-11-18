// Usage tracking utilities for the daily todo app
// Tracks user interactions and app usage patterns

import {
  trackUsageEvent,
  startSession as startSessionFirebase,
  endSession as endSessionFirebase,
  loadUsageStats,
} from '../services/firebaseService';

// Session management
let currentSessionId = null;

export const startSession = async (userId) => {
  if (!userId) return;

  try {
    currentSessionId = await startSessionFirebase(userId);
    // Track login event
    await trackUsageEvent(userId, 'login');
  } catch (error) {
    console.error('Error starting session:', error);
  }
};

export const endSession = async (userId) => {
  if (!userId || !currentSessionId) return;

  try {
    await endSessionFirebase(userId, currentSessionId);
    currentSessionId = null;
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

// Task-related tracking
export const trackTaskCreated = async (userId, taskData = {}) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'task_created', {
    taskId: taskData.id,
    points: taskData.points,
    hasFollowUps: taskData.followUps && taskData.followUps.length > 0,
    followUpCount: taskData.followUps?.length || 0,
  });
};

export const trackTaskEdited = async (userId, taskData = {}) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'task_edited', {
    taskId: taskData.id,
    points: taskData.points,
  });
};

export const trackTaskDeleted = async (userId, taskId) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'task_deleted', {
    taskId,
  });
};

export const trackTaskCompleted = async (userId, taskData = {}, hasFollowUpResponses = false) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'task_completed', {
    taskId: taskData.id,
    points: taskData.points,
    hasFollowUpResponses,
    completedAt: new Date().toISOString(),
  });
};

// Streak-related tracking
export const trackStreakAchievement = async (userId, streakData = {}) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'streak_milestone', {
    currentStreak: streakData.current,
    bestStreak: streakData.best,
    isNewBest: streakData.current === streakData.best && streakData.current > 0,
  });
};

// Celebration tracking
export const trackCelebration = async (userId, celebrationType, celebrationData = {}) => {
  if (!userId) return;

  await trackUsageEvent(userId, 'celebration_shown', {
    celebrationType,
    ...celebrationData,
  });
};

// Load usage statistics
export const getUserStats = async (userId) => {
  if (!userId) return null;

  return await loadUsageStats(userId);
};

// Helper to setup session cleanup on page unload
export const setupSessionCleanup = (userId) => {
  if (!userId) return;

  const cleanup = () => {
    if (currentSessionId) {
      // Use sendBeacon for cleanup on page unload
      // This is more reliable than async fetch in unload handlers
      const data = {
        userId,
        sessionId: currentSessionId,
        endTime: new Date().toISOString(),
      };

      // Note: This is a simplified approach. In production, you might want
      // to use a dedicated endpoint or Firebase's offline persistence
      navigator.sendBeacon?.('/api/end-session', JSON.stringify(data));
    }
  };

  window.addEventListener('beforeunload', cleanup);

  return () => {
    window.removeEventListener('beforeunload', cleanup);
  };
};
