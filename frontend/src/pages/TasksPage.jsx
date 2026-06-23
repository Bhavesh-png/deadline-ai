import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, Trash2, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Tag, Calendar, Loader2, Brain,
  GripVertical,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { differenceInDays, format } from 'date-fns';
import CreateTaskModal from '../components/CreateTaskModal';
import { IllustrationTasks, IllustrationEmpty } from '../components/Illustrations';
import toast from 'react-hot-toast';

const STATUSES = [
  { key: 'todo',        label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  { key: 'in_progress', label: 'In Progress',  color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
  { key: 'done',        label: 'Done',         color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
];

const PRIORITY_COLORS = {
  high:   { text: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
  medium: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
  low:    { text: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)'  },
};

/* ─── Tab Bar ────────────────────────────────────────────────────────────────── */
const VIEWS = ['Board', 'List'];

function ViewTab({ views, active, onChange }) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      role="tablist"
      aria-label="View selection"
    >
      {views.map(v => (
        <button
          key={v}
          role="tab"
          aria-selected={active === v}
          onClick={() => onChange(v)}
          className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: active === v ? 'white' : '#64748b' }}
        >
          {active === v && (
            <motion.div
              layoutId="view-tab-bg"
              className="absolute inset-0 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              aria-hidden="true"
            />
          )}
          <span className="relative z-10">{v}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Task Card ──────────────────────────────────────────────────────────────── */
function TaskCard({ task, onDelete, onStatusChange, onToggleSubtask }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && task.status !== 'done';
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const completedSubs = (task.subtasks || []).filter(s => s.done).length;
  const totalSubs = (task.subtasks || []).length;
  const progress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete toggle */}
          <button
            onClick={() => onStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
            aria-label={`Mark ${task.title} ${task.status === 'done' ? 'incomplete' : 'complete'}`}
            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
            style={{ borderColor: task.status === 'done' ? '#10b981' : 'rgba(99,102,241,0.45)' }}
          >
            {task.status === 'done' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <CheckCircle2 size={12} className="text-green-400" />
              </motion.div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
              {task.title}
            </p>
            {task.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: pc.text, background: pc.bg, borderColor: pc.border }}>
              {task.priority}
            </span>
            <button
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 flex-wrap">
          {task.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
              <Calendar size={11} aria-hidden="true"/>
              {isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock size={11} aria-hidden="true"/> {task.estimatedHours}h
            </div>
          )}
          {(task.tags || []).slice(0, 2).map(tag => (
            <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
              <Tag size={9} aria-hidden="true"/> {tag}
            </div>
          ))}
        </div>

        {/* Progress */}
        {totalSubs > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Subtasks</span><span>{completedSubs}/{totalSubs}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {totalSubs > 0 && (
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
            {expanded ? 'Hide' : 'Show'} subtasks
          </button>
        )}
      </div>

      {/* Subtasks */}
      <AnimatePresence>
        {expanded && totalSubs > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="p-4 space-y-2">
              {(task.subtasks || []).map(st => (
                <div key={st.id} className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    aria-label={`Toggle subtask: ${st.title}`}
                    className="w-4 h-4 rounded flex items-center justify-center border flex-shrink-0"
                    style={{ borderColor: st.done ? '#10b981' : 'rgba(99,102,241,0.3)' }}
                  >
                    {st.done && <CheckCircle2 size={10} className="text-green-400"/>}
                  </button>
                  <span className={`text-sm ${st.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{st.title}</span>
                  {st.estimatedHours && <span className="ml-auto text-xs text-slate-600">{st.estimatedHours}h</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── List Row ───────────────────────────────────────────────────────────────── */
function TaskListRow({ task, onDelete, onStatusChange }) {
  const daysLeft = task.deadline ? differenceInDays(new Date(task.deadline), new Date()) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0 && task.status !== 'done';
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      whileHover={{ backgroundColor: 'rgba(99,102,241,0.04)' }}
      className="flex items-center gap-4 p-3 rounded-xl border transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <button
        onClick={() => onStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
        aria-label={`Toggle ${task.title}`}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: task.status === 'done' ? '#10b981' : 'rgba(99,102,241,0.4)' }}
      >
        {task.status === 'done' && <CheckCircle2 size={11} className="text-green-400"/>}
      </button>
      <span className={`flex-1 text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
        {task.title}
      </span>
      {task.deadline && (
        <span className={`text-xs flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
          {isOverdue ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
        </span>
      )}
      <span className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: pc.text, background: pc.bg, borderColor: pc.border }}>
        {task.priority}
      </span>
      <span className="text-xs px-2 py-0.5 rounded-full text-slate-500 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {task.status.replace('_', ' ')}
      </span>
      <button onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
        <Trash2 size={13}/>
      </button>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function TasksPage() {
  const { tasks, editTask, removeTask, toggleSubtask, analyzing } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [view, setView] = useState('Board');

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return t.status !== 'done' && t.deadline && differenceInDays(new Date(t.deadline), new Date()) < 0;
    return t.priority === filter || t.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
    if (sortBy === 'priority') { const o = { high: 0, medium: 1, low: 2 }; return (o[a.priority] || 1) - (o[b.priority] || 1); }
    return 0;
  });

  const kanban = STATUSES.map(s => ({ ...s, tasks: sorted.filter(t => t.status === s.key) }));

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    editTask(draggableId, { status: destination.droppableId });
    toast.success(`Moved to ${STATUSES.find(s => s.key === destination.droppableId)?.label}`);
  };

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
    { key: 'high', label: '🔴 High' },
    { key: 'overdue', label: '⚠ Overdue' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Task Board</h1>
            <p className="text-slate-400 text-sm mt-0.5">{tasks.length} total tasks · AI-powered Kanban</p>
          </div>
          {tasks.length > 0 && (
            <IllustrationTasks className="w-20 h-14 opacity-70 hidden sm:block" aria-hidden="true"/>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ViewTab views={VIEWS} active={view} onChange={setView} />
          <motion.button
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
            aria-label="Create new AI task"
          >
            {analyzing ? <Loader2 size={15} className="animate-spin"/> : <Plus size={15}/>}
            <Brain size={13}/>
            AI Task
          </motion.button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Task filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filter === f.key ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f.key ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)'}`,
              color: filter === f.key ? '#a5b4fc' : '#64748b',
            }}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          <button
            onClick={() => setSortBy(s => s === 'deadline' ? 'priority' : 'deadline')}
            className="px-3 py-1.5 rounded-xl text-xs text-indigo-400 transition-colors hover:text-indigo-300"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}
            aria-label={`Sort by ${sortBy === 'deadline' ? 'priority' : 'deadline'}`}
          >
            {sortBy === 'deadline' ? 'By Deadline' : 'By Priority'}
          </button>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tasks.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-16 gap-4"
          >
            <IllustrationEmpty className="w-36 h-28" />
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">No tasks yet</h3>
              <p className="text-slate-500 text-sm mt-1">Let AI break down your first goal into an actionable plan.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
            >
              <Brain size={16}/> Create AI Task
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Board / List Views ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === 'Board' && tasks.length > 0 && (
          <motion.div
            key="board"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kanban.map(col => (
                  <div
                    key={col.key}
                    className="rounded-2xl p-4 flex flex-col"
                    style={{ background: col.bg, border: `1px solid ${col.color}18` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} aria-hidden="true"/>
                        <span className="font-semibold text-sm text-slate-300">{col.label}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {col.tasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-24 flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.03] ring-1 ring-indigo-500/20' : ''}`}
                        >
                          <AnimatePresence>
                            {col.tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{ ...provided.draggableProps.style, marginBottom: '10px', opacity: snapshot.isDragging ? 0.85 : 1 }}
                                  >
                                    <div className="flex items-center gap-1 mb-1 text-slate-600" {...provided.dragHandleProps}>
                                      <GripVertical size={12} aria-label="Drag handle"/>
                                    </div>
                                    <TaskCard
                                      task={task}
                                      onDelete={removeTask}
                                      onStatusChange={(id, status) => editTask(id, { status })}
                                      onToggleSubtask={toggleSubtask}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                          {col.tasks.length === 0 && (
                            <div className="text-center py-8 text-slate-600 text-sm">
                              <p className="text-2xl mb-1" aria-hidden="true">
                                {col.key === 'done' ? '🎯' : col.key === 'in_progress' ? '⚡' : '📝'}
                              </p>
                              <p>No {col.label.toLowerCase()} tasks</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>

                    <button
                      onClick={() => setShowCreate(true)}
                      className="w-full mt-3 py-2 text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 rounded-xl transition-all border border-dashed border-slate-800 hover:border-indigo-500/30"
                      aria-label={`Add task to ${col.label}`}
                    >
                      + Add task
                    </button>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </motion.div>
        )}

        {view === 'List' && tasks.length > 0 && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Header row */}
            <div className="flex items-center gap-4 px-3 pb-2 text-xs text-slate-600 uppercase tracking-wider border-b border-white/5">
              <span className="w-5 flex-shrink-0"/>
              <span className="flex-1">Task</span>
              <span className="w-12 flex-shrink-0">Due</span>
              <span className="w-16 flex-shrink-0">Priority</span>
              <span className="w-20 flex-shrink-0">Status</span>
              <span className="w-7 flex-shrink-0"/>
            </div>
            <AnimatePresence>
              {sorted.map(task => (
                <TaskListRow
                  key={task.id}
                  task={task}
                  onDelete={removeTask}
                  onStatusChange={(id, status) => editTask(id, { status })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
