// Storage utilities for the daily todo app
// Uses Firestore for authenticated users, localStorage as fallback

import {
  loadTasksFromFirestore,
  saveTasksToFirestore,
  loadDailyDataFromFirestore,
  saveDailyDataToFirestore,
  loadStreaksFromFirestore,
  saveStreaksToFirestore,
} from '../services/firebaseService';

const STORAGE_KEYS = {
  TASKS: 'joshTodoTasks',
  DAILY_DATA: 'joshTodoDailyData',
  STREAKS: 'joshTodoStreaks',
};

// Get today's date as a string (YYYY-MM-DD format)
export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Task Management
export const loadTasks = async (userId = null) => {
  if (userId) {
    return await loadTasksFromFirestore(userId);
  }

  // Fallback to localStorage
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = async (tasks, userId = null) => {
  if (userId) {
    await saveTasksToFirestore(userId, tasks);
    return;
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

// Daily Data Management (tracks completion per day)
export const loadDailyData = async (userId = null) => {
  if (userId) {
    return await loadDailyDataFromFirestore(userId);
  }

  // Fallback to localStorage
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading daily data:', error);
    return {};
  }
};

export const saveDailyData = async (dailyData, userId = null) => {
  if (userId) {
    await saveDailyDataToFirestore(userId, dailyData);
    return;
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_DATA, JSON.stringify(dailyData));
  } catch (error) {
    console.error('Error saving daily data:', error);
  }
};

export const getTodayData = async (userId = null) => {
  const dailyData = await loadDailyData(userId);
  const today = getTodayString();
  return dailyData[today] || { completed: [], totalPoints: 0 };
};

export const saveTodayData = async (completedTasks, totalPoints, userId = null) => {
  const dailyData = await loadDailyData(userId);
  const today = getTodayString();
  dailyData[today] = { completed: completedTasks, totalPoints };
  await saveDailyData(dailyData, userId);
};

// Streak Management
export const loadStreaks = async (userId = null) => {
  if (userId) {
    return await loadStreaksFromFirestore(userId);
  }

  // Fallback to localStorage
  try {
    const streaks = localStorage.getItem(STORAGE_KEYS.STREAKS);
    return streaks ? JSON.parse(streaks) : { current: 0, best: 0, lastCompletionDate: null };
  } catch (error) {
    console.error('Error loading streaks:', error);
    return { current: 0, best: 0, lastCompletionDate: null };
  }
};

export const saveStreaks = async (streaks, userId = null) => {
  if (userId) {
    await saveStreaksToFirestore(userId, streaks);
    return;
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streaks));
  } catch (error) {
    console.error('Error saving streaks:', error);
  }
};

// Calculate streak based on daily data
export const calculateStreak = async (userId = null) => {
  const dailyData = await loadDailyData(userId);
  const dates = Object.keys(dailyData).sort().reverse();

  if (dates.length === 0) {
    const streaks = { current: 0, best: 0, lastCompletionDate: null };
    if (userId) {
      await saveStreaks(streaks, userId);
    }
    return streaks;
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date();
  let lastCompletionDate = null;

  // Calculate current streak (from today backwards)
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    const currentDateStr = dates[i];

    // Check if tasks were completed on this date
    if (dailyData[currentDateStr].completed.length > 0) {
      if (!lastCompletionDate) {
        lastCompletionDate = currentDateStr;
      }

      if (currentDateStr === expectedDateStr) {
        if (i === 0 || currentDateStr === getTodayString()) {
          currentStreak++;
        }
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);

        // Move to previous day
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Gap in streak
        tempStreak = 1;
        expectedDate = new Date(date);
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
    }
  }

  const streaks = {
    current: currentStreak,
    best: bestStreak,
    lastCompletionDate,
  };

  // Save calculated streaks to Firebase
  if (userId) {
    await saveStreaks(streaks, userId);
  }

  return streaks;
};

// Generate default task templates
export const getDefaultTasks = () => [
  {
    id: Date.now(),
    name: 'morning routine',
    points: 10,
    followUps: [
      { type: 'rating', label: 'how do you feel?', required: false },
    ],
  },
];
