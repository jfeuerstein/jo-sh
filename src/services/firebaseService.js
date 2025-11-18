import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
