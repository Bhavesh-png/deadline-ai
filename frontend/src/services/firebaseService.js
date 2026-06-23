// Firebase Firestore Service
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, setDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ─── USER ────────────────────────────────────────────────────────────────────

export async function createUserProfile(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      settings: { theme: 'dark', notifications: true, timezone: 'UTC' },
      stats: { streak: 0, totalXP: 0, level: 1, tasksCompleted: 0 },
    });
  }
  return (await getDoc(ref)).data();
}

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserStats(uid, updates) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, updates);
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export async function createTask(userId, taskData) {
  const ref = collection(db, 'tasks');
  const docRef = await addDoc(ref, {
    userId,
    ...taskData,
    status: taskData.status || 'todo',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserTasks(userId) {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeToTasks(userId, callback) {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function updateTask(taskId, updates) {
  const ref = doc(db, 'tasks', taskId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
}

export async function completeSubtask(taskId, subtaskId) {
  const ref = doc(db, 'tasks', taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const task = snap.data();
  const subtasks = (task.subtasks || []).map(st =>
    st.id === subtaskId ? { ...st, done: true } : st
  );
  const allDone = subtasks.every(st => st.done);
  await updateDoc(ref, {
    subtasks,
    status: allDone ? 'done' : task.status,
    updatedAt: serverTimestamp(),
  });
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function saveAnalytics(userId, weekId, data) {
  const ref = doc(db, 'analytics', userId, 'weekly', weekId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getAnalytics(userId) {
  const q = query(
    collection(db, 'analytics', userId, 'weekly'),
    orderBy('updatedAt', 'desc'),
    limit(8)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
