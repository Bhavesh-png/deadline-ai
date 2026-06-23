import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { IllustrationAI } from './Illustrations';

const GREETING = "Hi! I'm your DeadlineAI assistant. I can help you plan tasks, beat deadlines, and stay productive. What would you like to work on today? 🚀";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: GREETING, time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { tasks, stats } = useTasks();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        userName: user?.displayName || 'User',
        totalTasks: stats.total,
        completedToday: stats.completed,
        upcomingDeadlines: tasks.filter(t => t.status !== 'done').slice(0, 3).map(t => t.title),
      };
      const reply = await chatWithAI(userMsg.text, context);
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: reply, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'assistant',
        text: "I'm having trouble connecting right now. Please check your Gemini API key and try again.",
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = ['Plan my day', 'What\'s overdue?', 'Boost my productivity'];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: open ? '0 0 0 0 rgba(99,102,241,0)' : ['0 0 0 0 rgba(99,102,241,0.4)', '0 0 0 15px rgba(99,102,241,0)'] }}
        transition={{ duration: 2, repeat: open ? 0 : Infinity }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: 480,
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(139,92,246,0.2))', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
              <motion.div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={16} className="text-white" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm text-white">DeadlineAI Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-slate-400">Powered by Gemini</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
              {/* Welcome illustration — only shown with greeting message */}
              {messages.length === 1 && (
                <div className="flex justify-center pt-2 pb-1">
                  <IllustrationAI className="w-40 h-28 opacity-70" aria-hidden="true"/>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
                      : 'bg-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-300" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm text-white'
                      : 'rounded-tl-sm text-slate-200'
                  }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #4f46e5, #8b5cf6)'
                        : 'rgba(99,102,241,0.1)',
                      border: msg.role === 'assistant' ? '1px solid rgba(99,102,241,0.15)' : 'none',
                    }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full text-indigo-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your tasks..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-slate-200 placeholder-slate-500"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
              >
                {loading ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
