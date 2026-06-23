import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, CheckCircle2, Target, Zap, Brain, Trophy } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { getProductivityInsights } from '../services/geminiService';
import { format, subDays } from 'date-fns';
import { IllustrationAnalytics, IllustrationEmpty } from '../components/Illustrations';

// Generate last 7 days labels
const DAYS = Array.from({ length: 7 }, (_, i) => ({
  label: format(subDays(new Date(), 6 - i), 'EEE'),
  date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
}));

const MOCK_WEEKLY = DAYS.map((d, i) => ({
  day: d.label,
  completed: Math.floor(Math.random() * 5) + 1,
  scheduled: Math.floor(Math.random() * 3) + 3,
  score: Math.floor(70 + Math.random() * 25),
}));

const MOCK_PRIORITY_DATA = [
  { name: 'High', value: 3, color: '#ef4444' },
  { name: 'Medium', value: 5, color: '#f59e0b' },
  { name: 'Low', value: 4, color: '#10b981' },
];

function MetricCard({ icon: Icon, label, value, color, change, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22`, border: `1px solid ${color}33` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <motion.div
        className="text-2xl font-black text-white mb-1"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        {value}
      </motion.div>
      <p className="text-sm text-slate-400">{label}</p>
    </motion.div>
  );
}

const customTooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: '12px',
  color: '#e2e8f0',
  fontSize: '12px',
};

export default function AnalyticsPage() {
  const { tasks, stats } = useTasks();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const result = await getProductivityInsights(stats.completed, stats.todo);
        setInsights(result);
      } catch {
        // Use defaults if fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [stats.completed, stats.todo]);

  const completionRate = stats.completionRate || 78;
  const productivityScore = insights?.score || completionRate;

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length || 3, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length || 5, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length || 4, color: '#10b981' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(79,70,229,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <TrendingUp size={26} className="text-green-400" aria-hidden="true"/>
              Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered productivity insights & trends</p>
          </div>
          <IllustrationAnalytics className="w-48 h-32 sm:w-60 sm:h-40 flex-shrink-0 opacity-80" aria-hidden="true"/>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        role="tablist"
        aria-label="Analytics views"
      >
        {['overview', 'trends', 'ai'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{ color: activeTab === tab ? 'white' : '#64748b' }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="analytics-tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #4f46e5)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={CheckCircle2} label="Tasks Completed" value={stats.completed} color="#10b981" change={12} delay={0} />
        <MetricCard icon={Target} label="Completion Rate" value={`${completionRate}%`} color="#6366f1" change={8} delay={0.05} />
        <MetricCard icon={Zap} label="Productivity Score" value={productivityScore} color="#8b5cf6" change={5} delay={0.1} />
        <MetricCard icon={Trophy} label="Best Streak" value="7 days" color="#f59e0b" delay={0.15} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Weekly Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="font-bold text-white mb-4">Weekly Task Completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_WEEKLY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="scheduled" name="Scheduled" fill="rgba(99,102,241,0.2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Productivity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="font-bold text-white mb-4">Productivity Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_WEEKLY}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area
                type="monotone" dataKey="score" name="Score"
                stroke="#8b5cf6" strokeWidth={2}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h3 className="font-bold text-white mb-4">Task Priority</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {priorityData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{name}</span>
                </div>
                <span className="font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white">AI Productivity Report</h3>
            <span className="text-xs text-indigo-400 ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Gemini Generated
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Generating insights...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="text-4xl font-black text-indigo-300">{productivityScore}</div>
                <div>
                  <p className="text-sm text-white font-semibold">Overall Score</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Trend: <span className={insights?.weeklyTrend === 'improving' ? 'text-green-400' : 'text-yellow-400'}>
                      {insights?.weeklyTrend || 'improving'} ↗
                    </span>
                  </p>
                </div>
              </div>

              {/* Insights list */}
              <div className="space-y-2">
                {(insights?.insights || [
                  'You complete most tasks in the morning. Schedule complex work before noon.',
                  'Your task completion rate improved 8% this week. Keep it up!',
                  'Breaking tasks into subtasks increases your completion rate by 40%.',
                ]).map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex gap-3 items-start text-sm"
                  >
                    <span className="text-indigo-400 flex-shrink-0 mt-0.5">💡</span>
                    <p className="text-slate-300">{tip}</p>
                  </motion.div>
                ))}
              </div>

              {insights?.recommendation && (
                <div className="p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <span className="text-cyan-400 font-semibold">🎯 Recommendation: </span>
                  <span className="text-slate-300">{insights.recommendation}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
