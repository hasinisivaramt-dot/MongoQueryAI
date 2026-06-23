import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './dashboard/store.jsx';
import LandingPage      from './LandingPage.jsx';
import AboutPage        from './AboutPage.jsx';
import HowItWorksPage   from './HowItWorksPage.jsx';
import DocsPage         from './DocsPage.jsx';
import AuthPage         from './auth/AuthPage.jsx';
import SetupPage        from './auth/SetupPage.jsx';
import DashboardShell   from './dashboard/DashboardShell.jsx';

// ── Marketing / auth router ────────────────────────────────────────────────────
// views: 'landing' | 'about' | 'how-it-works' | 'docs' | 'auth' | 'setup' | 'dashboard'
function AppRouter() {
  const { user, logout, saveSetupData } = useAuth();
  const [view, setView] = useState('landing');

  // Restore view on refresh if user is logged in
  useEffect(() => {
    if (user?.setupDone) setView('dashboard');
    else if (user) setView('setup');
  }, [user]);

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view]);

  const navigate = (page) => setView(page);
  const goAuth   = () => setView('auth');
  const goSignup = () => setView('auth');

  const handleAuth    = () => setView('setup');
  const handleSetup   = (data) => { saveSetupData(data); setView('dashboard'); };
  const handleLogout  = () => { logout(); setView('landing'); };

  // Shared props passed to every marketing page
  const marketingProps = {
    onLogin:    goAuth,
    onSignup:   goSignup,
    onNavigate: navigate,
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing'      && <LandingPage    key="landing"    {...marketingProps} />}
      {view === 'about'        && <AboutPage      key="about"      {...marketingProps} />}
      {view === 'how-it-works' && <HowItWorksPage key="how-it-works" {...marketingProps} />}
      {view === 'docs'         && <DocsPage       key="docs"       {...marketingProps} />}
      {view === 'auth'         && (
        <AuthPage key="auth"
          onAuth={handleAuth}
          onBack={() => setView('landing')}
        />
      )}
      {view === 'setup' && (
        <SetupPage key="setup"
          onComplete={handleSetup}
          onBack={() => setView('auth')}
        />
      )}
      {view === 'dashboard' && (
        <DashboardShell key="dashboard"
          onLogout={handleLogout}
        />
      )}
    </AnimatePresence>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
