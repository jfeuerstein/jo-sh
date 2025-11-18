// localStorage utilities for the daily todo app

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
export const loadTasks = () => {
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

// Daily Data Management (tracks completion per day)
export const loadDailyData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_DATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading daily data:', error);
    return {};
  }
};

export const saveDailyData = (dailyData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_DATA, JSON.stringify(dailyData));
  } catch (error) {
    console.error('Error saving daily data:', error);
  }
};

export const getTodayData = () => {
  const dailyData = loadDailyData();
  const today = getTodayString();
  return dailyData[today] || { completed: [], totalPoints: 0 };
};

export const saveTodayData = (completedTasks, totalPoints) => {
  const dailyData = loadDailyData();
  const today = getTodayString();
  dailyData[today] = { completed: completedTasks, totalPoints };
  saveDailyData(dailyData);
};

// Streak Management
export const loadStreaks = () => {
  try {
    const streaks = localStorage.getItem(STORAGE_KEYS.STREAKS);
    return streaks ? JSON.parse(streaks) : { current: 0, best: 0, lastCompletionDate: null };
  } catch (error) {
    console.error('Error loading streaks:', error);
    return { current: 0, best: 0, lastCompletionDate: null };
  }
};

export const saveStreaks = (streaks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streaks));
  } catch (error) {
    console.error('Error saving streaks:', error);
  }
};

// Calculate streak based on daily data
export const calculateStreak = () => {
  const dailyData = loadDailyData();
  const dates = Object.keys(dailyData).sort().reverse();

  if (dates.length === 0) {
    return { current: 0, best: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date();

  // Calculate current streak (from today backwards)
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    const currentDateStr = dates[i];

    // Check if tasks were completed on this date
    if (dailyData[currentDateStr].completed.length > 0) {
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

  return { current: currentStreak, best: bestStreak };
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
