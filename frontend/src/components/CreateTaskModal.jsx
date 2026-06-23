import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Brain, Calendar, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import toast from 'react-hot-toast';

const STEPS = ['Describe Task', 'AI Analysis', 'Review & Create'];

export default function CreateTaskModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const { addTask } = useTasks();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setStep(1);
    try {
      const result = await addTask(input);
      setAnalysis(result);
      setStep(2);
    } catch {
      toast.error('Analysis failed. Please try again.');
      setStep(0);
    }
  };

  const handleCreate = () => {
    toast.success('Task created successfully! 🎉');
    onClose();
    setStep(0);
    setInput('');
    setAnalysis(null);
  };

  const handleClose = () => {
    if (step === 1) return; // Don't close while analyzing
    onClose();
    setStep(0);
    setInput('');
    setAnalysis(null);
  };

  const priorityColors = {
    high: 'text-red-400 bg-red-500/10 border-red-500/30',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-green-400 bg-green-500/10 border-green-500/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15,23,42,0.98)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Create AI Task</h2>
                    <p className="text-xs text-slate-400">Powered by Gemini</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              {/* Step Indicators */}
              <div className="flex px-6 pt-4 gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step ? 'bg-green-500 text-white' :
                      i === step ? 'bg-indigo-500 text-white' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${i === step ? 'text-indigo-300' : 'text-slate-500'}`}>{s}</span>
                    {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-700" />}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Step 0: Input */}
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <p className="text-slate-400 text-sm mb-4">
                        Describe your task in natural language. AI will analyze, break it down, and create a schedule.
                      </p>
                      <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder='e.g. "Complete my hackathon project by June 29" or "Prepare quarterly report for next Friday"'
                        rows={4}
                        className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleAnalyze()}
                      />
                      <p className="text-xs text-slate-600 mt-2">Press Ctrl+Enter to analyze</p>

                      {/* Examples */}
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Quick Examples</p>
                        {[
                          'Build a mobile app in 2 weeks',
                          'Study for finals next Monday',
                          'Write blog post by tomorrow',
                        ].map(ex => (
                          <button key={ex} onClick={() => setInput(ex)}
                            className="block w-full text-left text-sm px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-indigo-500/10 transition-colors"
                            style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                            "{ex}"
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Analyzing */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(139,92,246,0.2))' }}
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles size={36} className="text-indigo-400" />
                      </motion.div>
                      <h3 className="font-semibold text-white mb-2">AI is analyzing your task...</h3>
                      <p className="text-sm text-slate-400 mb-6">Gemini is breaking down complexity and creating your schedule</p>
                      <div className="space-y-2">
                        {['🔍 Extracting deadlines and priorities...', '📋 Breaking into subtasks...', '📅 Generating personalized schedule...'].map((msg, i) => (
                          <motion.div key={msg} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.8 }}
                            className="text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Loader2 size={12} className="animate-spin text-indigo-400" />
                            {msg}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Review */}
                  {step === 2 && analysis && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-lg">{analysis.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[analysis.priority] || priorityColors.medium}`}>
                              {analysis.priority} priority
                            </span>
                            <span className="text-xs text-slate-500">~{analysis.estimatedHours}h total</span>
                            <span className="text-xs text-slate-500">Due: {analysis.deadline}</span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-400">{analysis.urgency}/10</div>
                      </div>

                      {analysis.recommendation && (
                        <div className="px-3 py-2 rounded-lg text-sm text-cyan-300"
                          style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                          💡 {analysis.recommendation}
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Subtasks ({analysis.subtasks?.length})</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {(analysis.subtasks || []).map((st, i) => (
                            <motion.div key={st.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-indigo-500/5">
                              <CheckCircle2 size={14} className="text-slate-600" />
                              <span className="text-slate-300 flex-1">{st.title}</span>
                              <span className="text-xs text-slate-500">{st.estimatedHours}h</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {analysis.schedule?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">AI Schedule</p>
                          <div className="space-y-1 max-h-28 overflow-y-auto">
                            {analysis.schedule.slice(0, 4).map((day, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs py-1">
                                <Calendar size={12} className="text-indigo-400 flex-shrink-0" />
                                <span className="text-slate-500">{day.date}:</span>
                                <span className="text-slate-300">{day.activity}</span>
                              </div>
                            ))}
                            {analysis.schedule.length > 4 && (
                              <p className="text-xs text-slate-600 pl-4">+{analysis.schedule.length - 4} more days...</p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                {step === 0 && (
                  <>
                    <button onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleAnalyze}
                      disabled={!input.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
                    >
                      <Sparkles size={16} />
                      Analyze with AI
                      <ChevronRight size={16} />
                    </motion.button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <button onClick={() => setStep(0)}
                      className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                      ← Redo
                    </button>
                    <motion.button
                      onClick={handleCreate}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
                    >
                      ✓ Create Task
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
