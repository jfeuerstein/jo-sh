import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Get user's tasks reference
const getUserTasksRef = (userId) => {
  return doc(db, 'users', userId, 'data', 'tasks');
};

// Get user's daily data reference
const getUserDailyDataRef = (userId) => {
  return doc(db, 'users', userId, 'data', 'dailyData');
};

// Get user's streaks reference
const getUserStreaksRef = (userId) => {
  return doc(db, 'users', userId, 'data', 'streaks');
};

// Get user's usage tracking reference
const getUserUsageRef = (userId) => {
  return doc(db, 'users', userId, 'data', 'usage');
};

// Load tasks from Firestore
export const loadTasksFromFirestore = async (userId) => {
  try {
    const tasksRef = getUserTasksRef(userId);
    const tasksSnap = await getDoc(tasksRef);

    if (tasksSnap.exists()) {
      return tasksSnap.data().tasks || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading tasks from Firestore:', error);
    return [];
  }
};

// Save tasks to Firestore
export const saveTasksToFirestore = async (userId, tasks) => {
  try {
    const tasksRef = getUserTasksRef(userId);
    await setDoc(tasksRef, { tasks }, { merge: true });
  } catch (error) {
    console.error('Error saving tasks to Firestore:', error);
    throw error;
  }
};

// Load daily data from Firestore
export const loadDailyDataFromFirestore = async (userId) => {
  try {
    const dailyDataRef = getUserDailyDataRef(userId);
    const dailyDataSnap = await getDoc(dailyDataRef);

    if (dailyDataSnap.exists()) {
      return dailyDataSnap.data().dailyData || {};
    }
    return {};
  } catch (error) {
    console.error('Error loading daily data from Firestore:', error);
    return {};
  }
};

// Save daily data to Firestore
export const saveDailyDataToFirestore = async (userId, dailyData) => {
  try {
    const dailyDataRef = getUserDailyDataRef(userId);
    await setDoc(dailyDataRef, { dailyData }, { merge: true });
  } catch (error) {
    console.error('Error saving daily data to Firestore:', error);
    throw error;
  }
};

// Subscribe to real-time tasks updates
export const subscribeToTasks = (userId, callback) => {
  const tasksRef = getUserTasksRef(userId);

  return onSnapshot(tasksRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().tasks || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to tasks:', error);
  });
};

// Subscribe to real-time daily data updates
export const subscribeToDailyData = (userId, callback) => {
  const dailyDataRef = getUserDailyDataRef(userId);

  return onSnapshot(dailyDataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().dailyData || {});
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Error subscribing to daily data:', error);
  });
};

// Load streaks from Firestore
export const loadStreaksFromFirestore = async (userId) => {
  try {
    const streaksRef = getUserStreaksRef(userId);
    const streaksSnap = await getDoc(streaksRef);

    if (streaksSnap.exists()) {
      return streaksSnap.data();
    }
    return { current: 0, best: 0, lastCompletionDate: null };
  } catch (error) {
    console.error('Error loading streaks from Firestore:', error);
    return { current: 0, best: 0, lastCompletionDate: null };
  }
};

// Save streaks to Firestore
export const saveStreaksToFirestore = async (userId, streaks) => {
  try {
    const streaksRef = getUserStreaksRef(userId);
    await setDoc(streaksRef, streaks, { merge: true });
  } catch (error) {
    console.error('Error saving streaks to Firestore:', error);
    throw error;
  }
};

// Track app usage event
export const trackUsageEvent = async (userId, eventType, eventData = {}) => {
  try {
    const usageRef = getUserUsageRef(userId);
    const usageSnap = await getDoc(usageRef);

    const currentUsage = usageSnap.exists() ? usageSnap.data() : {
      sessions: [],
      events: [],
      stats: {
        totalLogins: 0,
        totalTasksCreated: 0,
        totalTasksCompleted: 0,
        totalTasksDeleted: 0,
        totalTasksEdited: 0,
        firstLoginAt: new Date().toISOString(),
        lastLoginAt: null,
      }
    };

    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    // Add event to events array
    const updatedEvents = [...(currentUsage.events || []), event];

    // Keep only last 1000 events to avoid unbounded growth
    const trimmedEvents = updatedEvents.slice(-1000);

    // Update stats based on event type
    const stats = { ...currentUsage.stats };
    switch (eventType) {
      case 'login':
        stats.totalLogins = (stats.totalLogins || 0) + 1;
        stats.lastLoginAt = event.timestamp;
        break;
      case 'task_created':
        stats.totalTasksCreated = (stats.totalTasksCreated || 0) + 1;
        break;
      case 'task_completed':
        stats.totalTasksCompleted = (stats.totalTasksCompleted || 0) + 1;
        break;
      case 'task_deleted':
        stats.totalTasksDeleted = (stats.totalTasksDeleted || 0) + 1;
        break;
      case 'task_edited':
        stats.totalTasksEdited = (stats.totalTasksEdited || 0) + 1;
        break;
      default:
        break;
    }

    await setDoc(usageRef, {
      events: trimmedEvents,
      stats,
    }, { merge: true });
  } catch (error) {
    console.error('Error tracking usage event:', error);
    // Don't throw - usage tracking shouldn't break the app
  }
};

// Start a session
export const startSession = async (userId) => {
  try {
    const usageRef = getUserUsageRef(userId);
    const usageSnap = await getDoc(usageRef);

    const currentUsage = usageSnap.exists() ? usageSnap.data() : {
      sessions: [],
      events: [],
      stats: {
        totalLogins: 0,
        firstLoginAt: new Date().toISOString(),
        lastLoginAt: null,
      }
    };

    const sessionId = `session_${Date.now()}`;
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
    };

    const updatedSessions = [...(currentUsage.sessions || []), session];

    // Keep only last 100 sessions
    const trimmedSessions = updatedSessions.slice(-100);

    await setDoc(usageRef, {
      sessions: trimmedSessions,
      currentSessionId: sessionId,
    }, { merge: true });

    return sessionId;
  } catch (error) {
    console.error('Error starting session:', error);
    return null;
  }
};

// End a session
export const endSession = async (userId, sessionId) => {
  try {
    const usageRef = getUserUsageRef(userId);
    const usageSnap = await getDoc(usageRef);

    if (!usageSnap.exists()) return;

    const currentUsage = usageSnap.data();
    const sessions = currentUsage.sessions || [];

    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, endTime: new Date().toISOString() }
        : session
    );

    await setDoc(usageRef, {
      sessions: updatedSessions,
      currentSessionId: null,
    }, { merge: true });
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

// Load usage stats
export const loadUsageStats = async (userId) => {
  try {
    const usageRef = getUserUsageRef(userId);
    const usageSnap = await getDoc(usageRef);

    if (usageSnap.exists()) {
      return usageSnap.data();
    }
    return {
      sessions: [],
      events: [],
      stats: {
        totalLogins: 0,
        totalTasksCreated: 0,
        totalTasksCompleted: 0,
        totalTasksDeleted: 0,
        totalTasksEdited: 0,
        firstLoginAt: null,
        lastLoginAt: null,
      }
    };
  } catch (error) {
    console.error('Error loading usage stats:', error);
    return {
      sessions: [],
      events: [],
      stats: {},
    };
  }
};
