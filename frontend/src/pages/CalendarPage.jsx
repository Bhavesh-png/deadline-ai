import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Circle, Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { IllustrationCalendar, IllustrationEmpty } from '../components/Illustrations';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, differenceInDays,
} from 'date-fns';

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

function CalendarDay({ date, tasks, currentMonth, selected, onSelect }) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isSelected = isSameDay(date, selected);
  const today = isToday(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t =>
    t.deadline === dateStr && t.status !== 'done'
  );
  const scheduledItems = tasks.flatMap(t =>
    (t.schedule || []).filter(s => s.date === dateStr)
  );

  return (
    <motion.div
      onClick={() => onSelect(date)}
      whileHover={{ scale: 1.02 }}
      className="min-h-24 p-2 rounded-xl cursor-pointer transition-all"
      style={{
        background: isSelected
          ? 'rgba(99,102,241,0.2)'
          : today
          ? 'rgba(99,102,241,0.08)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.5)' : today ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
        opacity: isCurrentMonth ? 1 : 0.3,
      }}
    >
      <div className={`text-sm font-bold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
        today ? 'text-white' : 'text-slate-400'
      }`}
        style={today ? { background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' } : {}}>
        {format(date, 'd')}
      </div>

      {/* Deadline badges */}
      {dayTasks.slice(0, 2).map(t => (
        <div key={t.id} className="text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate"
          style={{
            background: `${PRIORITY_COLORS[t.priority] || '#6366f1'}22`,
            color: PRIORITY_COLORS[t.priority] || '#a5b4fc',
            borderLeft: `2px solid ${PRIORITY_COLORS[t.priority] || '#6366f1'}`,
          }}>
          {t.title}
        </div>
      ))}

      {/* Scheduled items */}
      {scheduledItems.slice(0, 1).map((s, i) => (
        <div key={i} className="text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate"
          style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', borderLeft: '2px solid #06b6d4' }}>
          {s.activity}
        </div>
      ))}

      {dayTasks.length + scheduledItems.length > 2 && (
        <p className="text-xs text-slate-600">+{dayTasks.length + scheduledItems.length - 2} more</p>
      )}
    </motion.div>
  );
}

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = tasks.filter(t =>
    t.deadline === selectedDateStr && t.status !== 'done'
  );
  const selectedSchedule = tasks.flatMap(t =>
    (t.schedule || []).filter(s => s.date === selectedDateStr)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(79,70,229,0.08) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <CalIcon size={26} className="text-cyan-400" aria-hidden="true"/>
              Calendar
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-generated schedules and deadline tracking</p>
          </div>
          <IllustrationCalendar className="w-44 h-28 sm:w-56 sm:h-36 flex-shrink-0 opacity-80" aria-hidden="true"/>
        </div>
      </motion.div>

      {/* Calendar + Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            aria-label="Previous month"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft size={16} className="text-slate-300" />
          </motion.button>
          <span className="text-white font-bold min-w-36 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            aria-label="Next month"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronRight size={16} className="text-slate-300" />
          </motion.button>
          <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
            aria-label="Go to today"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-400"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2" aria-hidden="true">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <motion.div
            key={currentMonth.toString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-7 gap-2"
          >
            {days.map(day => (
              <CalendarDay
                key={day.toString()}
                date={day}
                tasks={tasks}
                currentMonth={currentMonth}
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            ))}
          </motion.div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Circle size={8} className="fill-red-400 text-red-400" />
              <span>High Priority Deadline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={8} className="fill-yellow-400 text-yellow-400" />
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle size={8} className="fill-cyan-400 text-cyan-400" />
              <span>AI Scheduled</span>
            </div>
          </div>
        </div>

        {/* Selected Day Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h3 className="font-bold text-white mb-1">{format(selectedDate, 'EEEE')}</h3>
              <p className="text-slate-400 text-sm mb-4">{format(selectedDate, 'MMMM d, yyyy')}</p>

              {/* Deadlines */}
              {selectedTasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Deadlines</p>
                  <div className="space-y-2">
                    {selectedTasks.map(t => (
                      <div key={t.id} className="p-2 rounded-xl text-sm"
                        style={{
                          background: `${PRIORITY_COLORS[t.priority] || '#6366f1'}11`,
                          borderLeft: `3px solid ${PRIORITY_COLORS[t.priority] || '#6366f1'}`,
                        }}>
                        <p className="font-medium text-slate-200">{t.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">{t.priority} priority</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled */}
              {selectedSchedule.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Scheduled Work</p>
                  <div className="space-y-2">
                    {selectedSchedule.map((s, i) => (
                      <div key={i} className="p-2 rounded-xl text-sm"
                        style={{ background: 'rgba(6,182,212,0.08)', borderLeft: '3px solid #06b6d4' }}>
                        <p className="font-medium text-slate-200">{s.activity}</p>
                        <p className="text-xs text-cyan-400 mt-0.5">{s.hours}h planned</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTasks.length === 0 && selectedSchedule.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-3xl">✨</span>
                  <p className="text-slate-500 text-sm mt-2">Free day!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Upcoming deadlines mini list */}
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-bold text-white text-sm mb-3">Upcoming Deadlines</h3>
            <div className="space-y-2">
              {tasks
                .filter(t => t.status !== 'done' && t.deadline)
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 5)
                .map(t => {
                  const days = differenceInDays(new Date(t.deadline), new Date());
                  return (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate flex-1 mr-2">{t.title}</span>
                      <span className={`font-semibold flex-shrink-0 ${days < 0 ? 'text-red-400' : days <= 2 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
