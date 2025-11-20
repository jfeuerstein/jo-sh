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
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import {
  saveTasks,
  getTodayData,
  saveTodayData,
  calculateStreak,
  loadDailyData,
} from './utils/storage';
import { subscribeToTasks } from './services/firebaseService';
import { checkForCelebrations } from './utils/celebrations';
import {
  startSession,
  endSession,
  trackTaskCreated,
  trackTaskEdited,
  trackTaskDeleted,
  trackTaskCompleted,
  trackCelebration,
} from './utils/usageTracking';

function App() {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [followUpTask, setFollowUpTask] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load tasks and completed tasks on mount or when user changes
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Start session and track login
        await startSession(currentUser.uid);

        const todayData = await getTodayData(currentUser.uid);
        setCompletedTasks(todayData.completed || []);

        // Calculate streaks
        const calculatedStreaks = await calculateStreak(currentUser.uid);
        setStreaks(calculatedStreaks);

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time task updates
    const unsubscribe = subscribeToTasks(currentUser.uid, (updatedTasks) => {
      setIsSyncing(true);
      setTasks(updatedTasks);
      // Reset syncing flag after state update
      setTimeout(() => setIsSyncing(false), 0);
    });

    // Setup cleanup for session and subscription on component unmount
    return () => {
      if (currentUser) {
        endSession(currentUser.uid);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Save tasks whenever they change (but not when syncing from Firestore)
  useEffect(() => {
    if (!currentUser || loading || isSyncing) return;

    const saveData = async () => {
      try {
        await saveTasks(tasks, currentUser.uid);
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };

    saveData();
  }, [tasks, currentUser, loading, isSyncing]);

  // Save completed tasks whenever they change
  useEffect(() => {
    if (!currentUser || loading) return;

    const saveData = async () => {
      try {
        const totalPoints = completedTasks.reduce((sum, ct) => {
          const task = tasks.find((t) => t.id === ct.taskId);
          return sum + (task?.points || 0);
        }, 0);
        await saveTodayData(completedTasks, totalPoints, currentUser.uid);

        // Recalculate streaks when tasks are completed
        if (completedTasks.length > 0) {
          const calculatedStreaks = await calculateStreak(currentUser.uid);
          setStreaks(calculatedStreaks);
        }
      } catch (error) {
        console.error('Error saving completed tasks:', error);
      }
    };

    saveData();
  }, [completedTasks, tasks, currentUser, loading]);

  const handleSaveTask = async (task) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      setEditingTask(null);
      // Track task edit
      await trackTaskEdited(currentUser?.uid, task);
    } else {
      // Add new task
      setTasks([...tasks, task]);
      // Track task creation
      await trackTaskCreated(currentUser?.uid, task);
    }
    setIsCreatorOpen(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreatorOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('are you sure you want to delete this task?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      // Also remove from completed if it was completed
      setCompletedTasks(completedTasks.filter((ct) => ct.taskId !== taskId));
      // Track task deletion
      await trackTaskDeleted(currentUser?.uid, taskId);
    }
  };

  const handleCompleteTask = (task) => {
    setFollowUpTask(task);
  };

  const handleFollowUpComplete = async (responses) => {
    const newCompletedTask = {
      taskId: followUpTask.id,
      completedAt: new Date().toISOString(),
      followUpResponses: responses,
    };

    const newCompletedTasks = [...completedTasks, newCompletedTask];
    setCompletedTasks(newCompletedTasks);

    // Track task completion
    await trackTaskCompleted(
      currentUser?.uid,
      followUpTask,
      Object.keys(responses).length > 0
    );

    setFollowUpTask(null);

    // Check for celebrations
    try {
      const dailyData = await loadDailyData(currentUser?.uid);
      const newStreaks = await calculateStreak(currentUser?.uid);
      const celebrations = checkForCelebrations(
        newCompletedTasks,
        tasks,
        newStreaks.current,
        newStreaks.best,
        dailyData
      );

      // Show first celebration if any
      if (celebrations.length > 0) {
        const celebrationData = {
          type: celebrations[0].type,
          data: celebrations[0].data,
        };
        setCelebration(celebrationData);
        // Track celebration shown
        await trackCelebration(
          currentUser?.uid,
          celebrations[0].type,
          celebrations[0].data
        );
      }
    } catch (error) {
      console.error('Error checking celebrations:', error);
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

  const handleLogout = async () => {
    try {
      // End session before logout
      await endSession(currentUser?.uid);
      await logout();
      setTasks([]);
      setCompletedTasks([]);
      setStreaks({ current: 0, best: 0 });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show login screen if not authenticated
  if (!currentUser) {
    return <Login />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <pre className="app-logo" onClick={handleLogoClick}>
┌────────────────────┐<br />
│   jo-sh daily      │<br />
│   ▓▓▓░░░░░         │<br />
└────────────────────┘
            </pre>
            <div className="header-actions">
              <span className="user-email">{currentUser.email}</span>
              <Button variant="secondary" onClick={handleLogout}>
                logout
              </Button>
            </div>
          </div>
          {showEasterEgg && (
            <div className="easter-egg">
              <pre>
stop clicking me
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
