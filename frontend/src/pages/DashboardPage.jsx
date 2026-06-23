import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp, Flame,
  Zap, Trophy, Brain, Calendar, ChevronRight, Target, Plus,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { getProductivityInsights } from '../services/geminiService';
import { format, differenceInDays } from 'date-fns';
import { IllustrationDashboard, IllustrationEmpty } from '../components/Illustrations';
import { Link } from 'react-router-dom';

/* ─── Skeleton Loader ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-700/50"/>
        <div className="w-12 h-8 rounded-lg bg-slate-700/50"/>
      </div>
      <div className="h-3 w-20 rounded bg-slate-700/50"/>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, delay, subtext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, boxShadow: `0 20px 40px ${color}18` }}
      className="p-5 rounded-2xl cursor-default transition-shadow"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}20`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <motion.span
          className="text-2xl font-black text-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
        >
          {value}
        </motion.span>
      </div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      {subtext && <p className="text-xs text-slate-600 mt-0.5">{subtext}</p>}
    </motion.div>
  );
}

/* ─── Progress Ring ──────────────────────────────────────────────────────────── */
function ProgressRing({ percent, size = 80, strokeWidth = 6, color = '#6366f1' }) {
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-label={`${percent}% progress`} role="img">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}/>
      <motion.circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (percent / 100) * circ }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ─── Task Item ──────────────────────────────────────────────────────────────── */
function TaskItem({ task, onToggle }) {
  const daysLeft = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && task.status !== 'done';
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.02)' }}
      className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer group transition-colors"
      role="listitem"
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-label={`Mark ${task.title} as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
        style={{ borderColor: task.status === 'done' ? '#10b981' : 'rgba(99,102,241,0.4)' }}
      >
        {task.status === 'done' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <CheckCircle2 size={12} className="text-green-400" />
          </motion.div>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </p>
        {task.deadline && (
          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            {isOverdue ? `⚠ Overdue by ${Math.abs(daysLeft)}d` : daysLeft === 0 ? '🔥 Due today' : `Due in ${daysLeft}d`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: priorityColors[task.priority] || '#6366f1' }} />
        <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </motion.div>
  );
}

/* ─── Achievement Badge ──────────────────────────────────────────────────────── */
function AchievementBadge({ emoji, label, earned }) {
  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
      style={{
        background: earned ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${earned ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)'}`,
        opacity: earned ? 1 : 0.35,
      }}
      role="img"
      aria-label={`${label} badge ${earned ? '(earned)' : '(locked)'}`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { tasks, stats, editTask } = useTasks();
  const { user, userProfile } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const upcomingTasks = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.deadline || '9999') - new Date(b.deadline || '9999'))
    .slice(0, 5);

  useEffect(() => {
    let cancelled = false;
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const result = await getProductivityInsights(stats.completed, stats.todo);
        if (!cancelled) setInsights(result);
      } catch { /* use defaults */ }
      finally { if (!cancelled) setLoadingInsights(false); }
    };
    fetchInsights();
    return () => { cancelled = true; };
  }, [stats.completed, stats.todo]);

  const productivityScore = insights?.score || stats.completionRate || 78;
  const xpToNext = 500 - ((userProfile?.stats?.totalXP || 250) % 500);
  const handleToggle = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    editTask(taskId, { status: task.status === 'done' ? 'todo' : 'done' });
  };
  const todayStr = format(new Date(), 'EEEE, MMMM d');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Hero Header with illustration ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-slate-500 text-sm">{todayStr}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {stats.overdue > 0
                ? `⚠️ You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}. Let's catch up!`
                : stats.todo > 0
                  ? `You have ${stats.todo} tasks to complete. Keep it up!`
                  : '🎉 All caught up! You\'re crushing it today.'}
            </p>
          </div>
          <IllustrationDashboard className="w-48 h-32 sm:w-56 sm:h-36 flex-shrink-0 opacity-85" />
        </div>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} aria-hidden="true"/>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={CheckCircle2} label="Completed"  value={stats.completed}          color="#10b981" delay={0}    subtext="total tasks" />
        <StatCard icon={Clock}        label="In Progress" value={stats.inProgress}         color="#6366f1" delay={0.05} subtext="active now" />
        <StatCard icon={AlertTriangle} label="Overdue"   value={stats.overdue}            color="#ef4444" delay={0.1}  subtext="need attention" />
        <StatCard icon={TrendingUp}   label="Completion" value={`${stats.completionRate}%`} color="#06b6d4" delay={0.15} subtext="this period" />
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Tasks + AI Insights */}
        <div className="lg:col-span-2 space-y-5">

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-indigo-400" aria-hidden="true"/>
                Upcoming Tasks
              </h2>
              <Link to="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                View all <ChevronRight size={12}/>
              </Link>
            </div>

            {upcomingTasks.length > 0 ? (
              <div className="space-y-0.5" role="list" aria-label="Upcoming tasks">
                {upcomingTasks.map(t => <TaskItem key={t.id} task={t} onToggle={handleToggle} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-3">
                <IllustrationEmpty className="w-32 h-24 opacity-60" />
                <div className="text-center">
                  <p className="text-slate-400 text-sm font-medium">All caught up!</p>
                  <p className="text-slate-600 text-xs mt-1">No pending tasks. Time to add new goals.</p>
                </div>
                <Link to="/tasks">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
                  >
                    <Plus size={14}/> Add Task
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} className="text-indigo-400" aria-hidden="true"/>
              <h2 className="font-bold text-white">AI Insights</h2>
              <span className="text-xs text-indigo-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                Gemini
              </span>
            </div>
            {loadingInsights ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 rounded-full animate-pulse bg-slate-800/80" style={{ width: `${60 + i * 12}%` }} aria-hidden="true"/>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(insights?.insights || [
                  'You complete most tasks in the morning — schedule important work before noon.',
                  'Your average completion rate is improving week over week.',
                  'Consider breaking large tasks into 2-hour focused sessions.',
                ]).map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-indigo-400 mt-0.5 flex-shrink-0" aria-hidden="true">💡</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
                {insights?.recommendation && (
                  <div className="mt-3 p-3 rounded-xl text-sm text-cyan-300" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.18)' }}>
                    🎯 {insights.recommendation}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Productivity Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Zap size={18} className="text-indigo-400" aria-hidden="true"/> Productivity Score
            </h2>
            <div className="relative inline-flex items-center justify-center">
              <ProgressRing
                percent={productivityScore} size={120} strokeWidth={8}
                color={productivityScore >= 80 ? '#10b981' : productivityScore >= 60 ? '#f59e0b' : '#ef4444'}
              />
              <div className="absolute text-center">
                <motion.span className="text-3xl font-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {productivityScore}
                </motion.span>
                <p className="text-xs text-slate-500">/ 100</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              {productivityScore >= 80 ? '🔥 Excellent! You\'re on fire!' : productivityScore >= 60 ? '⚡ Good progress!' : '💪 Let\'s improve!'}
            </p>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" aria-hidden="true"/> Achievements
            </h2>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)' }}>
              <Flame size={22} className="text-orange-400" aria-hidden="true"/>
              <div>
                <span className="text-2xl font-black text-orange-400">{userProfile?.stats?.streak || 7}</span>
                <p className="text-xs text-slate-400">Day streak 🔥</p>
              </div>
            </div>
            {/* XP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Level {userProfile?.stats?.level || 5}</span>
                <span>{xpToNext} XP to next</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-label="XP progress bar">
                <motion.div
                  className="h-full rounded-full xp-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${((userProfile?.stats?.totalXP || 250) % 500) / 5}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <AchievementBadge emoji="⚡" label="Fast Mover" earned />
              <AchievementBadge emoji="🎯" label="On Target"  earned />
              <AchievementBadge emoji="🔥" label="7d Streak"  earned />
              <AchievementBadge emoji="🏆" label="Slayer"     earned={stats.completed >= 10} />
              <AchievementBadge emoji="🧠" label="AI Master"  earned />
              <AchievementBadge emoji="🚀" label="Rocket"     earned={stats.completed >= 5} />
            </div>
          </motion.div>

          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" aria-hidden="true"/> Today's Schedule
            </h2>
            {(() => {
              const todayItems = tasks.flatMap(t => (t.schedule || []).filter(s => s.date === format(new Date(), 'yyyy-MM-dd'))).slice(0, 4);
              return todayItems.length > 0 ? (
                <div className="space-y-2">
                  {todayItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" aria-hidden="true"/>
                      <div>
                        <p className="text-slate-300">{item.activity}</p>
                        <p className="text-xs text-slate-600">{item.hours}h scheduled</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No schedule for today. Create a task to get started!</p>
              );
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
