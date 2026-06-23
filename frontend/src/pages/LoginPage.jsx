import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Particle({ width, height, left, top, duration, delay }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ background: 'rgba(99,102,241,0.3)', width, height, left, top }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration, repeat: Infinity, delay }}
    />
  );
}

const INITIAL_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  width: Math.random() * 6 + 2,
  height: Math.random() * 6 + 2,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 3,
  delay: Math.random() * 2,
}));

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to DeadlineAI! 🚀');
    } catch {
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const particles = INITIAL_PARTICLES;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)' }}>

      {/* Particles */}
      {particles.map((p) => <Particle key={p.id} {...p} />)}

      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: '#4f46e5' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{ background: '#8b5cf6' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="p-8 rounded-3xl"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(99,102,241,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <img src="/favicon.png" alt="logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome to DeadlineAI</h1>
            <p className="text-slate-400 text-sm">Your AI-powered productivity companion</p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { emoji: '🧠', text: 'AI Task Planning' },
              { emoji: '📅', text: 'Smart Scheduling' },
              { emoji: '🎯', text: 'Priority Ranking' },
              { emoji: '📊', text: 'Analytics' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <span>{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogle}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white text-lg relative overflow-hidden disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
          >
            {loading ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffffcc" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffffaa" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ffffff88" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Demo note */}
          <p className="text-center text-xs text-slate-600 mt-4">
            No Firebase setup? The app works in demo mode with sample data.
          </p>
        </div>

        {/* Bottom badges */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {['🔒 Secure', '🚀 Gemini AI', '🔥 Firebase', '⚡ Real-time'].map(badge => (
            <span key={badge} className="text-xs text-slate-500 px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {badge}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
