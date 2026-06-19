import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar.jsx';
import TopNav from './components/TopNav.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import { ProfilePage, SettingsPage } from './pages/ProfileSettings.jsx';
import DocumentAnalysisPage from './pages/DocumentAnalysisPage.jsx';
import AIEnginePage from './pages/AIEnginePage.jsx';
import {
  QueryHistoryPage, CollectionsPage, QueryGeneratorPage,
  AggregationsPage, IndexesPage, MongoOpsPage,
} from './pages/OtherPages.jsx';

const PAGES = {
  dashboard:      DashboardPage,
  query:          QueryGeneratorPage,
  'ai-engine':    AIEnginePage,
  'doc-analysis': DocumentAnalysisPage,
  aggregations:   AggregationsPage,
  collections:    CollectionsPage,
  ops:            MongoOpsPage,
  history:        QueryHistoryPage,
  indexes:        IndexesPage,
  analytics:      AnalyticsPage,
  settings:       SettingsPage,
  profile:        ProfilePage,
};

export default function DashboardShell({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');
  const mainRef = useRef(null);

  // Scroll BOTH the main panel and window to top on every page change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activePage]);

  const navigate = (page) => {
    // Scroll immediately before state update to prevent flash
    if (mainRef.current) mainRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActivePage(page);
  };

  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={navigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onLogout={onLogout} activePage={activePage} setActivePage={navigate} />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden dash-scroll p-6"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="fixed inset-0 grid-overlay opacity-10 pointer-events-none" />
          <div className="fixed top-0 right-0 w-[600px] h-[400px] rounded-full bg-blue-electric/5 blur-[120px] pointer-events-none" />
          <div className="fixed bottom-0 left-64 w-[400px] h-[300px] rounded-full bg-cyan-glow/4 blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <PageComponent key={activePage} />
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
