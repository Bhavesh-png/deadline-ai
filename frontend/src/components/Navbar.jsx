import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, Plus, Search, User, LogOut, ChevronDown, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import CreateTaskModal from './CreateTaskModal';

const NOTIFICATIONS = [
  { id: 1, text: 'Hackathon project deadline in 7 days!', type: 'warning', time: '2m ago' },
  { id: 2, text: 'AI generated your daily schedule', type: 'info', time: '1h ago' },
  { id: 3, text: 'You completed 3 tasks today! 🎉', type: 'success', time: '3h ago' },
];

export default function Navbar({ mobileMenuButton }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { stats } = useTasks();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const score = Math.min(100, stats.completionRate || 78);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(248, 250, 252, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
        }}>
        {/* Mobile menu button + Search */}
        <div className="flex items-center gap-2">
          {mobileMenuButton}
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search size={16} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all w-64"
              style={{
                background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                color: isDark ? '#e2e8f0' : '#1e293b',
              }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Productivity Score */}
          <motion.div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <Zap size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-300">{score}% Productive</span>
          </motion.div>

          {/* Create Task Button */}
          <motion.button
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Task</span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-500" />}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => { setShowNotifs(s => !s); setShowProfile(false); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{
                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Bell size={16} className="text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: isDark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="p-4 border-b border-indigo-500/10">
                    <h3 className="font-semibold text-sm text-slate-300">Notifications</h3>
                  </div>
                  {NOTIFICATIONS.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-3 hover:bg-indigo-500/5 cursor-pointer border-b border-indigo-500/5 last:border-0"
                    >
                      <p className="text-sm text-slate-300">{n.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              onClick={() => { setShowProfile(s => !s); setShowNotifs(false); }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden"
                style={{ border: '2px solid rgba(99,102,241,0.4)' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: isDark ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="p-4 border-b border-indigo-500/10">
                    <p className="font-semibold text-sm text-slate-200">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Backdrop */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-20"
          onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </>
  );
}
