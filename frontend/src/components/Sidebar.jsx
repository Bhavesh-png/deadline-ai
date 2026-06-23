// @refresh reset
import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Settings, ChevronLeft, ChevronRight, Zap, Brain,
  Trophy, Flame, X, Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#6366f1' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks',     color: '#8b5cf6' },
  { to: '/calendar',  icon: Calendar,        label: 'Calendar',  color: '#06b6d4' },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics', color: '#10b981' },
  { to: '/settings',  icon: Settings,        label: 'Settings',  color: '#f59e0b' },
];

/* ─── Context hook (passed down via props instead of context to avoid cycles) ── */
export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
      return next;
    });
  }, []);

  const openMobile  = useCallback(() => setMobileOpen(true),  []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile };
}

/* ─── Mobile hamburger exported for Navbar use ──────────────────────────────── */
export function MobileMenuButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Open navigation menu"
      className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center mr-2"
      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
    >
      <Menu size={18} className="text-indigo-400" />
    </motion.button>
  );
}

/* ─── Sidebar Core ───────────────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, toggleCollapsed, mobileOpen, closeMobile }) {
  const { userProfile } = useAuth();
  const location = useLocation();
  const overlayRef = useRef(null);
  const stats = userProfile?.stats || { streak: 7, level: 5, totalXP: 1250, tasksCompleted: 23 };

  /* ESC key closes mobile drawer */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && mobileOpen) closeMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, closeMobile]);

  /* lock body scroll when mobile drawer open */
  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = 'hidden'; }
    else            { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* Close mobile when route changes */
  useEffect(() => { closeMobile(); }, [location.pathname, closeMobile]);

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* ─ Logo ─ */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}
      >
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-hidden="true"
        >
          <img src="/favicon.png" alt="logo" className="w-full h-full object-cover" />
        </motion.div>

        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <span className="font-bold text-lg text-white whitespace-nowrap">DeadlineAI</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        {isMobile && (
          <motion.button
            onClick={closeMobile}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close navigation"
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </motion.button>
        )}
      </div>

      {/* ─ Navigation ─ */}
      <nav
        className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        aria-label="Main navigation"
        role="navigation"
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            tabIndex={0}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: collapsed && !isMobile ? 0 : 3, backgroundColor: isActive ? undefined : 'rgba(99,102,241,0.08)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                } ${collapsed && !isMobile ? 'justify-center' : ''}`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${color}25, ${color}15)`,
                  border: `1px solid ${color}30`,
                } : { border: '1px solid transparent' }}
                title={collapsed && !isMobile ? label : undefined}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                    style={{ background: color }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    aria-hidden="true"
                  />
                )}

                {/* Active bg glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl opacity-30"
                    style={{ background: `radial-gradient(circle at 30% 50%, ${color}40, transparent 70%)` }}
                    aria-hidden="true"
                  />
                )}

                <Icon
                  size={20}
                  style={{ color: isActive ? color : undefined }}
                  className="flex-shrink-0 relative z-10"
                />

                <AnimatePresence initial={false}>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {collapsed && !isMobile && (
                  <motion.div
                    initial={{ opacity: 0, x: -4, scale: 0.95 }}
                    whileHover={{ opacity: 1, x: 0, scale: 1 }}
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap pointer-events-none z-50"
                    style={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    {label}
                  </motion.div>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─ Stats Panel ─ */}
      <AnimatePresence initial={false}>
        {(!collapsed || isMobile) && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-3 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.18)',
            }}
            aria-label="Your stats panel"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Your Stats</span>
              <span className="text-xs font-bold" style={{ color: '#a5b4fc' }}>Level {stats.level}</span>
            </div>
            <div className="flex gap-3 text-center">
              {[
                { icon: Flame,  value: stats.streak,             label: 'Streak', color: '#fb923c' },
                { icon: Zap,    value: stats.totalXP,            label: 'XP',     color: '#a78bfa' },
                { icon: Trophy, value: stats.tasksCompleted || 23, label: 'Done', color: '#22d3ee' },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex-1">
                  <div className="flex items-center justify-center gap-1" style={{ color }}>
                    <Icon size={13} aria-hidden="true" />
                    <span className="font-bold text-sm">{value}</span>
                  </div>
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
            {/* XP Bar */}
            <div className="mt-2 h-1.5 bg-slate-700/60 rounded-full overflow-hidden" role="progressbar" aria-label="XP progress">
              <motion.div
                className="h-full rounded-full xp-bar"
                initial={{ width: 0 }}
                animate={{ width: `${((stats.totalXP || 250) % 500) / 5}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed mini-stats */}
      <AnimatePresence initial={false}>
        {collapsed && !isMobile && (
          <motion.div
            key="mini-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 mb-4"
          >
            <div className="flex flex-col items-center gap-0.5" title={`Streak: ${stats.streak} days`}>
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{stats.streak}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR ═══════════════════════════════════════════════════ */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden lg:flex flex-col flex-shrink-0 h-screen overflow-visible z-20"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(12,14,26,0.99) 100%)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          backdropFilter: 'blur(20px)',
        }}
        aria-label="Sidebar navigation"
        role="complementary"
      >
        {sidebarContent(false)}

        {/* Collapse Toggle */}
        <motion.button
          onClick={toggleCollapsed}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full flex items-center justify-center z-30 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            border: '2px solid rgba(15,23,42,0.9)',
            boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
          }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={13} className="text-white" />
          </motion.div>
        </motion.button>
      </motion.aside>

      {/* ═══ MOBILE OVERLAY + DRAWER ════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col lg:hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(12,14,26,0.99) 0%, rgba(10,12,22,1) 100%)',
                borderRight: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
              }}
              aria-label="Mobile navigation menu"
              role="dialog"
              aria-modal="true"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
