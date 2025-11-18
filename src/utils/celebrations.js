// Celebration detection utilities

export const checkForCelebrations = (completedTasks, tasks, currentStreak, bestStreak, dailyData) => {
  const celebrations = [];

  // Check if this is the first task ever
  const totalCompletedTasksEver = Object.values(dailyData).reduce(
    (sum, day) => sum + day.completed.length,
    completedTasks.length
  );
  if (totalCompletedTasksEver === 1) {
    celebrations.push({ type: 'firstTask' });
  }

  // Check if all tasks are completed
  if (completedTasks.length > 0 && completedTasks.length === tasks.length) {
    celebrations.push({ type: 'allTasksComplete' });
  }

  // Check for streak milestones
  if (currentStreak === 3) {
    celebrations.push({ type: 'streak3', data: { streakCount: 3 } });
  } else if (currentStreak === 7) {
    celebrations.push({ type: 'streak7', data: { streakCount: 7 } });
  } else if (currentStreak === 30) {
    celebrations.push({ type: 'streak30', data: { streakCount: 30 } });
  }

  // Check for personal best
  if (currentStreak > 1 && currentStreak === bestStreak && currentStreak > 1) {
    celebrations.push({ type: 'personalBest', data: { streakCount: currentStreak } });
  }

  return celebrations;
};
