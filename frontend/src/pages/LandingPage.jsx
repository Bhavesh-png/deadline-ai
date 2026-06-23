import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Zap, Target, Calendar, BarChart3, Shield,
  ArrowRight, Star, CheckCircle, Users, TrendingUp, Clock,
  ExternalLink, Globe, Share2, Play
} from 'lucide-react';

// ─── Particle System ──────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      // Connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(Math.floor(start));
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="p-6 rounded-2xl cursor-pointer group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `1px solid ${color}33` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-bold text-white mb-2 text-lg">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Agent Node ───────────────────────────────────────────────────────────────
function AgentNode({ label, icon: Icon, x, y, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring' }}
      className="absolute flex flex-col items-center gap-2"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
        animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.3)', '0 0 35px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      >
        <Icon size={22} className="text-white" />
      </motion.div>
      <span className="text-xs font-semibold text-slate-300 text-center whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Brain, title: 'AI Planning Agent', description: 'Automatically breaks your goals into actionable subtasks with effort estimates.', color: '#6366f1', delay: 0 },
  { icon: Target, title: 'Smart Prioritization', description: 'Ranks tasks by urgency × importance matrix so you always work on what matters.', color: '#8b5cf6', delay: 0.1 },
  { icon: Calendar, title: 'Dynamic Scheduling', description: 'Creates personalized daily schedules and automatically reschedules missed items.', color: '#06b6d4', delay: 0.2 },
  { icon: Zap, title: 'Proactive Reminders', description: 'Context-aware reminders that adapt to your work patterns and energy levels.', color: '#f59e0b', delay: 0.3 },
  { icon: BarChart3, title: 'Productivity Analytics', description: 'Deep insights into your completion rates, streaks, and productivity trends.', color: '#10b981', delay: 0.4 },
  { icon: Shield, title: 'Never Miss Deadlines', description: 'Proactive alerts and rescheduling ensure no deadline slips through the cracks.', color: '#ef4444', delay: 0.5 },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Software Engineer', text: 'DeadlineAI transformed how I manage sprint tasks. My on-time delivery rate went from 65% to 94%!', avatar: '👩‍💻', rating: 5 },
  { name: 'Marcus Johnson', role: 'Product Manager', text: 'The AI scheduling is incredible. It understands context and creates realistic timelines automatically.', avatar: '👨‍💼', rating: 5 },
  { name: 'Priya Patel', role: 'PhD Student', text: 'Managing thesis deadlines, coursework, and research became so much easier. I can\'t live without it.', avatar: '👩‍🎓', rating: 5 },
];

const AGENTS = [
  { label: 'Planning', icon: Brain, x: 50, y: 15, delay: 0.2 },
  { label: 'Priority', icon: Target, x: 80, y: 40, delay: 0.4 },
  { label: 'Scheduler', icon: Calendar, x: 70, y: 75, delay: 0.6 },
  { label: 'Reminder', icon: Zap, x: 30, y: 75, delay: 0.8 },
  { label: 'Reflection', icon: BarChart3, x: 20, y: 40, delay: 1.0 },
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0f172a', color: '#f8fafc' }}>

      {/* ─── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">DeadlineAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'AI Agents', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <ParticleField />

        {/* Mouse follow glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 50%)`,
        }} />

        {/* Background gradients */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: '#4f46e5' }} />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{ background: '#8b5cf6' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc',
            }}
          >
            <Sparkle />
            Powered by Google Gemini AI · Built for Vibe2Ship Hackathon
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
          >
            Never Miss Another
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Deadline Again
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your AI-powered productivity companion that breaks down goals, prioritizes tasks,
            creates dynamic schedules, and adapts when life happens. Meet your deadlines — every time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
              >
                Start For Free <ArrowRight size={20} />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-slate-300"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Play size={18} className="text-indigo-400" /> Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: 50000, suffix: '+', label: 'Tasks Completed' },
              { value: 94, suffix: '%', label: 'On-Time Rate' },
              { value: 12000, suffix: '+', label: 'Happy Users' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-white">
                  <Counter to={value} suffix={suffix} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6"
        >
          <div className="rounded-t-2xl overflow-hidden"
            style={{
              background: 'rgba(30,27,75,0.8)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderBottom: 'none',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -20px 60px rgba(99,102,241,0.15)',
            }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-500/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-slate-500 ml-2">DeadlineAI Dashboard</span>
            </div>
            <div className="p-4 grid grid-cols-4 gap-3">
              {['Tasks Due Today: 3', 'AI Score: 94%', 'Streak: 7 days', 'XP: 1,250'].map((item, i) => (
                <motion.div key={item}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background: 'rgba(99,102,241,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Everything you need to
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> crush deadlines</span>
            </motion.h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Five specialized AI agents work together to keep you productive, focused, and on schedule.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ─── AI Agents Showcase ───────────────────────────────────────────── */}
      <section id="ai-agents" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-black mb-6"
              >
                5 AI Agents working
                <br />
                <span style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  in perfect harmony
                </span>
              </motion.h2>
              <div className="space-y-4">
                {AGENTS.map(({ label }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-slate-300">
                    <CheckCircle size={18} className="text-indigo-400 flex-shrink-0" />
                    <span className="font-medium">{label} Agent</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative h-80">
              {/* Center Gemini node */}
              <div className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10 }}>
                <motion.div
                  className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain size={30} className="text-white" />
                </motion.div>
                <p className="text-xs text-center text-indigo-300 mt-2 font-semibold">Gemini</p>
              </div>
              {/* Connecting lines SVG */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {AGENTS.map(({ x, y, label }) => (
                  <motion.line key={label}
                    x1="50%" y1="50%"
                    x2={`${x}%`} y2={`${y}%`}
                    stroke="rgba(99,102,241,0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                ))}
              </svg>
              {/* Agent Nodes */}
              {AGENTS.map(agent => <AgentNode key={agent.label} {...agent} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'rgba(99,102,241,0.03)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-12">Loved by <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thousands</span></h2>
          <div className="relative overflow-hidden" style={{ height: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8"
              >
                <p className="text-slate-300 text-lg leading-relaxed mb-4">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{TESTIMONIALS[testimonialIdx].avatar}</span>
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{TESTIMONIALS[testimonialIdx].name}</p>
                    <p className="text-slate-500 text-xs">{TESTIMONIALS[testimonialIdx].role}</p>
                  </div>
                  <div className="flex ml-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-indigo-400 w-6' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <h2 className="text-4xl font-black mb-4">Ready to beat every deadline?</h2>
            <p className="text-slate-400 mb-8">Join 12,000+ professionals who never miss a deadline.</p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
                className="px-10 py-4 rounded-2xl text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
              >
                Get Started Free — No Credit Card Needed
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-indigo-500/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}>
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">DeadlineAI</span>
            <span className="text-slate-500 text-sm">· Built for Vibe2Ship 2026</span>
          </div>
          <div className="flex gap-4">
            {[ExternalLink, Globe, Share2].map((Icon, i) => (
              <motion.a key={i} href="#" whileHover={{ scale: 1.2, color: '#6366f1' }}
                className="text-slate-500 hover:text-indigo-400 transition-colors">
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
          <p className="text-slate-600 text-sm">© 2026 DeadlineAI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="currentColor" opacity="0.8" />
    </svg>
  );
}
