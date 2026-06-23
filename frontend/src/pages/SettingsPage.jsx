import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Moon, Sun, Shield, Globe, Zap,
  Brain, ChevronRight, Check, Key, Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IllustrationSettings } from '../components/Illustrations';
import toast from 'react-hot-toast';

function SettingRow({ icon: Icon, title, description, children, color = '#6366f1' }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <p className="font-medium text-sm text-white">{title}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all"
      style={{ background: value ? 'linear-gradient(135deg, #4f46e5, #8b5cf6)' : 'rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        animate={{ left: value ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailDigest: false,
    aiScheduling: true,
    calendarSync: false,
    dataCollection: true,
    soundEffects: false,
  });
  const [provider, setProvider] = useState(() => localStorage.getItem('ai_provider') || 'gemini');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [nvidiaKey, setNvidiaKey] = useState(() => localStorage.getItem('nvidia_api_key') || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);

  const set = (key) => (val) => {
    setSettings(s => ({ ...s, [key]: val }));
    toast.success('Setting updated!');
  };

  const handleSaveKeys = () => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('nvidia_api_key', nvidiaKey);
    toast.success('AI configuration saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(79,70,229,0.08) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <SettingsIcon size={26} className="text-yellow-400" aria-hidden="true"/>
              Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">Customize your DeadlineAI experience</p>
          </div>
          <IllustrationSettings className="w-40 h-28 sm:w-48 sm:h-32 flex-shrink-0 opacity-80" aria-hidden="true"/>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-indigo-400" />
          Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ border: '2px solid rgba(99,102,241,0.4)' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
                <span className="text-2xl font-bold text-white">
                  {(user?.displayName || 'D')[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-white text-lg">{user?.displayName || 'Demo User'}</p>
            <p className="text-slate-400 text-sm">{user?.email || 'demo@deadlineai.app'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full text-indigo-300"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                Level {userProfile?.stats?.level || 5}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full text-yellow-300"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                {userProfile?.stats?.totalXP || 1250} XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          {isDark ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />}
          Appearance
        </h2>
        <SettingRow
          icon={isDark ? Moon : Sun}
          title="Dark Mode"
          description="Toggle between dark and light themes"
          color={isDark ? '#818cf8' : '#f59e0b'}
        >
          <Toggle value={isDark} onChange={() => toggleTheme()} />
        </SettingRow>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Bell size={18} className="text-cyan-400" />
          Notifications
        </h2>
        <SettingRow icon={Bell} title="Push Notifications" description="Get alerts for upcoming deadlines" color="#06b6d4">
          <Toggle value={settings.notifications} onChange={set('notifications')} />
        </SettingRow>
        <SettingRow icon={Globe} title="Email Digest" description="Daily email summary of your tasks" color="#8b5cf6">
          <Toggle value={settings.emailDigest} onChange={set('emailDigest')} />
        </SettingRow>
        <SettingRow icon={Zap} title="Sound Effects" description="Play sounds for achievements" color="#f59e0b">
          <Toggle value={settings.soundEffects} onChange={set('soundEffects')} />
        </SettingRow>
      </motion.div>

      {/* AI Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Brain size={18} className="text-indigo-400" />
          AI Settings
        </h2>
        <SettingRow icon={Brain} title="AI Auto-Scheduling" description="Let AI automatically create daily schedules" color="#6366f1">
          <Toggle value={settings.aiScheduling} onChange={set('aiScheduling')} />
        </SettingRow>
        <SettingRow icon={Globe} title="Google Calendar Sync" description="Sync AI schedules with Google Calendar" color="#10b981">
          <Toggle value={settings.calendarSync} onChange={set('calendarSync')} />
        </SettingRow>

        {/* Model Provider Selection */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-white">AI Model Provider</p>
            <p className="text-xs text-slate-500 mt-0.5">Select which intelligence provider powers your productivity assistant</p>
          </div>
          
          <div className="flex p-1 rounded-xl bg-slate-950/40 border border-white/5 relative">
            <button
              onClick={() => setProvider('gemini')}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg relative z-10 transition-colors ${
                provider === 'gemini' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Google Gemini
            </button>
            <button
              onClick={() => setProvider('nvidia')}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg relative z-10 transition-colors ${
                provider === 'nvidia' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              NVIDIA NIM
            </button>
            
            {/* Sliding backdrop */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30"
              style={{
                width: 'calc(50% - 6px)',
                left: provider === 'gemini' ? 6 : 'calc(50%)',
              }}
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          </div>
        </div>

        {/* Gemini API Key input */}
        {provider === 'gemini' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Key size={14} className="text-indigo-400" />
              <p className="text-sm font-medium text-white">Google Gemini API Key</p>
            </div>
            <p className="text-xs text-slate-500">Enter your Google AI Studio API key. Leave empty to use system default keys.</p>
            <div className="flex gap-2">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none text-slate-200 placeholder-slate-600 bg-indigo-500/5 border border-indigo-500/10 focus:border-indigo-500/40"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(s => !s)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors bg-white/5 border border-white/10"
              >
                {showGeminiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </motion.div>
        )}

        {/* NVIDIA API Key input */}
        {provider === 'nvidia' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Key size={14} className="text-amber-400" />
              <p className="text-sm font-medium text-white">NVIDIA API Key</p>
            </div>
            <p className="text-xs text-slate-500">Enter your NVIDIA NIM developer API key. Leave empty to use system default keys.</p>
            <div className="flex gap-2">
              <input
                type={showNvidiaKey ? 'text' : 'password'}
                value={nvidiaKey}
                onChange={e => setNvidiaKey(e.target.value)}
                placeholder="nvapi-..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none text-slate-200 placeholder-slate-600 bg-amber-500/5 border border-amber-500/10 focus:border-amber-500/40"
              />
              <button
                type="button"
                onClick={() => setShowNvidiaKey(s => !s)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors bg-white/5 border border-white/10"
              >
                {showNvidiaKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <motion.button
            onClick={handleSaveKeys}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20"
          >
            Save AI Configurations
          </motion.button>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          Privacy
        </h2>
        <SettingRow icon={Shield} title="Usage Analytics" description="Help improve DeadlineAI by sharing anonymized data" color="#10b981">
          <Toggle value={settings.dataCollection} onChange={set('dataCollection')} />
        </SettingRow>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <h2 className="font-bold text-red-400 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Sign Out</p>
            <p className="text-xs text-slate-500">Sign out of your account</p>
          </div>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Sign Out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
