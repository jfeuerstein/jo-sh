import React, { useState, useEffect } from 'react';
import './App.css';
import TaskCreator from './components/TaskCreator';
import TaskList from './components/TaskList';
import FollowUpModal from './components/FollowUpModal';
import PointsTracker from './components/PointsTracker';
import StreakTracker from './components/StreakTracker';
import Calendar from './components/Calendar';
import CelebrationModal from './components/CelebrationModal';
import Button from './components/Button';
import {
  loadTasks,
  saveTasks,
  getTodayData,
  saveTodayData,
  calculateStreak,
  loadDailyData,
} from './utils/storage';
import { checkForCelebrations } from './utils/celebrations';

function App() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [followUpTask, setFollowUpTask] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Load tasks and completed tasks on mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    const todayData = getTodayData();
    setTasks(loadedTasks);
    setCompletedTasks(todayData.completed || []);

    // Calculate streaks
    const calculatedStreaks = calculateStreak();
    setStreaks(calculatedStreaks);
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  // Save completed tasks whenever they change
  useEffect(() => {
    const totalPoints = completedTasks.reduce((sum, ct) => {
      const task = tasks.find((t) => t.id === ct.taskId);
      return sum + (task?.points || 0);
    }, 0);
    saveTodayData(completedTasks, totalPoints);

    // Recalculate streaks when tasks are completed
    if (completedTasks.length > 0) {
      const calculatedStreaks = calculateStreak();
      setStreaks(calculatedStreaks);
    }
  }, [completedTasks, tasks]);

  const handleSaveTask = (task) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      setEditingTask(null);
    } else {
      // Add new task
      setTasks([...tasks, task]);
    }
    setIsCreatorOpen(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreatorOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('are you sure you want to delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      // Also remove from completed if it was completed
      setCompletedTasks(completedTasks.filter((ct) => ct.taskId !== taskId));
    }
  };

  const handleCompleteTask = (task) => {
    setFollowUpTask(task);
  };

  const handleFollowUpComplete = (responses) => {
    const newCompletedTask = {
      taskId: followUpTask.id,
      completedAt: new Date().toISOString(),
      followUpResponses: responses,
    };

    const newCompletedTasks = [...completedTasks, newCompletedTask];
    setCompletedTasks(newCompletedTasks);
    setFollowUpTask(null);

    // Check for celebrations
    const dailyData = loadDailyData();
    const newStreaks = calculateStreak();
    const celebrations = checkForCelebrations(
      newCompletedTasks,
      tasks,
      newStreaks.current,
      newStreaks.best,
      dailyData
    );

    // Show first celebration if any
    if (celebrations.length > 0) {
      setCelebration({
        type: celebrations[0].type,
        data: celebrations[0].data,
      });
    }
  };

  const handleLogoClick = () => {
    setLogoClickCount(logoClickCount + 1);
    if (logoClickCount + 1 === 5) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setLogoClickCount(0);
      }, 3000);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <pre className="app-logo" onClick={handleLogoClick}>
┌────────────────────┐
│   jo-sh daily      │
│   ▓▓▓░░░░░         │
└────────────────────┘
          </pre>
          {showEasterEgg && (
            <div className="easter-egg">
              <pre>
you found the secret!
  keep being awesome
    ✨
              </pre>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <StreakTracker currentStreak={streaks.current} bestStreak={streaks.best} />

          <PointsTracker tasks={tasks} completedTasks={completedTasks} />

          <section className="tasks-section">
            <div className="section-header">
              <h2 className="section-title">today's tasks</h2>
              <Button variant="primary" onClick={() => setIsCreatorOpen(true)}>
                + new task
              </Button>
            </div>
            <TaskList
              tasks={tasks}
              completedTasks={completedTasks}
              onComplete={handleCompleteTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </section>

          <section className="calendar-section">
            <h2 className="section-title">calendar</h2>
            <Calendar />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>built with the josh-thetic</p>
      </footer>

      <TaskCreator
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editTask={editingTask}
      />

      <FollowUpModal
        isOpen={!!followUpTask}
        task={followUpTask}
        onComplete={handleFollowUpComplete}
        onCancel={() => setFollowUpTask(null)}
      />

      <CelebrationModal
        isOpen={!!celebration}
        onClose={() => setCelebration(null)}
        celebrationType={celebration?.type}
        customData={celebration?.data}
      />
    </div>
  );
}

export default App;
