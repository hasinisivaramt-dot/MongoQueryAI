import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './dashboard/store.jsx';
import AuthPage from './auth/AuthPage.jsx';
import SetupPage from './auth/SetupPage.jsx';
import DashboardShell from './dashboard/DashboardShell.jsx';
import LandingPage from './LandingPage.jsx';
import './dashboard/theme.css';

function AppRouter() {
  const { user, logout, saveSetupData } = useAuth();
  const [view, setView] = useState('landing');

  // Scroll to top whenever the top-level view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  const goTo = (v) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setView(v);
  };

  const handleAuth     = () => goTo('setup');
  const handleSetup    = (data) => { saveSetupData(data); goTo('dashboard'); };
  const handleLogout   = () => { logout(); goTo('landing'); };

  // Already logged in with setup done — skip straight to dashboard
  if (user && user.setupDone && view === 'landing') {
    return <DashboardShell onLogout={handleLogout} />;
  }

  // Logged in but setup not done yet
  if (user && !user.setupDone && view === 'landing') {
    return <SetupPage onComplete={handleSetup} />;
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <motion.div key="landing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <LandingPage onLogin={() => goTo('auth')} onSignup={() => goTo('auth')} />
        </motion.div>
      )}

      {view === 'auth' && (
        <motion.div key="auth"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}>
          <AuthPage onAuth={handleAuth} onBack={() => goTo('landing')} />
        </motion.div>
      )}

      {view === 'setup' && user && (
        <motion.div key="setup"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}>
          <SetupPage onComplete={handleSetup} />
        </motion.div>
      )}

      {view === 'dashboard' && user && (
        <motion.div key="dashboard"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <DashboardShell onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
