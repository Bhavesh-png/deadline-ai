import { motion } from 'framer-motion';
import Sidebar, { useSidebarState, MobileMenuButton } from './Sidebar';
import Navbar from './Navbar';
import AIAssistant from './AIAssistant';
import { useTheme } from '../context/ThemeContext';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

export default function Layout({ children }) {
  const { isDark } = useTheme();
  const { collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile } = useSidebarState();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #0c0e1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Sidebar (desktop + mobile drawer managed internally) */}
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        closeMobile={closeMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar mobileMenuButton={<MobileMenuButton onClick={openMobile} />} />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full p-4 sm:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
