/* eslint-disable react-refresh/only-export-components */
// @refresh reset
// Task Context – Global task state management
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToTasks, createTask, updateTask, deleteTask } from '../services/firebaseService';
import { analyzeTask, generateSchedule } from '../services/geminiService';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

// Demo tasks for when Firebase is not configured
const DEMO_TASKS = [
  {
    id: 'task-1',
    title: 'Vibe2Ship Hackathon Project',
    description: 'Complete my Vibe2Ship hackathon project by June 29.',
    priority: 'high',
    status: 'in_progress',
    deadline: '2026-06-29',
    estimatedHours: 24,
    urgency: 9,
    tags: ['hackathon', 'development', 'deadline-critical'],
    subtasks: [
      { id: 's1', title: 'Finalize idea and architecture', done: true, estimatedHours: 2 },
      { id: 's2', title: 'Design UI/UX', done: true, estimatedHours: 4 },
      { id: 's3', title: 'Build frontend', done: false, estimatedHours: 8 },
      { id: 's4', title: 'Integrate Gemini API', done: false, estimatedHours: 4 },
      { id: 's5', title: 'Testing', done: false, estimatedHours: 3 },
      { id: 's6', title: 'Record demo video', done: false, estimatedHours: 2 },
      { id: 's7', title: 'Submit project', done: false, estimatedHours: 1 },
    ],
    schedule: [
      { date: '2026-06-23', activity: 'Finalize idea and architecture', hours: 3 },
      { date: '2026-06-24', activity: 'Build frontend', hours: 8 },
      { date: '2026-06-25', activity: 'Integrate backend', hours: 5 },
      { date: '2026-06-26', activity: 'Add AI features', hours: 4 },
      { date: '2026-06-27', activity: 'Testing', hours: 3 },
      { date: '2026-06-28', activity: 'Deployment and documentation', hours: 2 },
      { date: '2026-06-29', activity: 'Final submission', hours: 1 },
    ],
    aiAnalysis: { effort: 8, urgency: 9, tags: ['critical'] },
    createdAt: { toDate: () => new Date() },
  },
  {
    id: 'task-2',
    title: 'Q2 Project Report',
    description: 'Prepare quarterly report for management review',
    priority: 'medium',
    status: 'todo',
    deadline: '2026-06-30',
    estimatedHours: 8,
    urgency: 6,
    tags: ['report', 'management'],
    subtasks: [
      { id: 's1', title: 'Gather data', done: false, estimatedHours: 2 },
      { id: 's2', title: 'Write analysis', done: false, estimatedHours: 3 },
      { id: 's3', title: 'Create presentation', done: false, estimatedHours: 3 },
    ],
    schedule: [],
    createdAt: { toDate: () => new Date() },
  },
  {
    id: 'task-3',
    title: 'Learn TypeScript',
    description: 'Complete TypeScript fundamentals course',
    priority: 'low',
    status: 'done',
    deadline: '2026-06-20',
    estimatedHours: 12,
    urgency: 3,
    tags: ['learning', 'typescript'],
    subtasks: [
      { id: 's1', title: 'Basics and types', done: true, estimatedHours: 4 },
      { id: 's2', title: 'Generics', done: true, estimatedHours: 4 },
      { id: 's3', title: 'Advanced patterns', done: true, estimatedHours: 4 },
    ],
    schedule: [],
    createdAt: { toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  },
];

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user || user.uid === 'demo-user-123') {
      const timer = setTimeout(() => {
        setTasks(DEMO_TASKS);
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);
    const unsub = subscribeToTasks(user.uid, (fetchedTasks) => {
      setTasks(fetchedTasks.length > 0 ? fetchedTasks : DEMO_TASKS);
      setLoading(false);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [user]);

  const addTask = useCallback(async (userInput) => {
    setAnalyzing(true);
    try {
      toast.loading('AI is analyzing your task...', { id: 'analyzing' });
      const analysis = await analyzeTask(userInput);
      const schedule = await generateSchedule(analysis.title, analysis.subtasks, analysis.deadline);

      const newTask = {
        ...analysis,
        schedule,
        status: 'todo',
        userId: user?.uid,
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };

      if (user && user.uid !== 'demo-user-123') {
        const id = await createTask(user.uid, newTask);
        newTask.id = id;
      } else {
        newTask.id = `task-${Date.now()}`;
        setTasks(prev => [newTask, ...prev]);
      }

      toast.success('Task created with AI schedule!', { id: 'analyzing' });
      return newTask;
    } catch (err) {
      toast.error('Failed to create task', { id: 'analyzing' });
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [user]);

  const editTask = useCallback(async (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    if (user && user.uid !== 'demo-user-123') {
      await updateTask(taskId, updates);
    }
  }, [user]);

  const removeTask = useCallback(async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (user && user.uid !== 'demo-user-123') {
      await deleteTask(taskId);
    }
    toast.success('Task deleted');
  }, [user]);

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      const subtasks = (task.subtasks || []).map(st =>
        st.id === subtaskId ? { ...st, done: !st.done } : st
      );
      const allDone = subtasks.every(st => st.done);
      return { ...task, subtasks, status: allDone ? 'done' : task.status };
    }));
  }, []);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      overdue: tasks.filter(t => {
        if (t.status === 'done') return false;
        return t.deadline && new Date(t.deadline) < new Date();
      }).length,
      completionRate: tasks.length
        ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
        : 0,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, analyzing, addTask, editTask, removeTask, toggleSubtask, stats }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
