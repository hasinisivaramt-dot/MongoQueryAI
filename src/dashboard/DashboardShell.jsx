import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
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

// ── Mobile sidebar drawer (self-contained) ─────────────────────────────────
import {
  LayoutDashboard, Sparkles, GitBranch, Layers, Activity,
  History, Bookmark, BarChart3, Settings, User, Database,
  X, Brain, FileSearch, ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'query',        label: 'Query Generator', icon: Sparkles        },
  { id: 'ai-engine',    label: 'AI Engine',       icon: Brain,  badge: 'AI'  },
  { id: 'doc-analysis', label: 'Doc Analysis',    icon: FileSearch, badge: 'NEW' },
  { id: 'aggregations', label: 'Aggregations',    icon: GitBranch       },
  { id: 'collections',  label: 'Collections',     icon: Layers          },
  { id: 'ops',          label: 'MongoDB Ops',     icon: Activity        },
  { id: 'history',      label: 'Query History',   icon: History         },
  { id: 'indexes',      label: 'Indexes',         icon: Bookmark        },
  { id: 'analytics',    label: 'Analytics',       icon: BarChart3       },
];
const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile',  label: 'Profile',  icon: User     },
];

function MobileDrawer({ activePage, setActivePage, open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const go = (id) => { setActivePage(id); onClose(); };

  const Item = ({ item }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <button onClick={() => go(item.id)}
        className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all relative
          ${isActive ? 'bg-cyan-glow/8 text-white' : 'text-slate-500 hover:text-slate-100 hover:bg-white/5'}`}
        style={isActive ? { boxShadow: '0 0 20px rgba(0,245,255,0.06)' } : {}}>
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gradient-to-b from-cyan-glow to-blue-electric"
            style={{ boxShadow: '0 0 8px rgba(0,245,255,0.8)' }} />
        )}
        <Icon size={20} className={`flex-shrink-0 ml-1 ${isActive ? 'text-cyan-glow drop-shadow-[0_0_8px_rgba(0,245,255,0.9)]' : ''}`} />
        <span className={`font-body text-[15px] font-semibold flex-1 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
        {item.badge && !isActive && (
          <span className="font-mono text-[9px] bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 px-1.5 py-0.5 rounded-md">{item.badge}</span>
        )}
        {isActive && (
          <motion.div className="w-2 h-2 rounded-full bg-cyan-glow flex-shrink-0"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ boxShadow: '0 0 8px rgba(0,245,255,0.9)' }} />
        )}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 dash-sidebar flex flex-col lg:hidden shadow-2xl overflow-hidden">
            {/* Logo header */}
            <div className="px-4 py-5 border-b border-white/5 flex items-center justify-between min-h-[72px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
                  <Database size={17} className="text-white" />
                </div>
                <div>
                  <span className="font-display font-bold text-lg text-white tracking-tight">
                    Mongo<span className="gradient-text-cyan">Query</span>
                  </span>
                  <span className="text-cyan-glow text-[10px] font-mono ml-1 opacity-70">AI</span>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* DB status */}
            <div className="px-3 py-3 border-b border-white/5">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-500/5 border border-green-500/12">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 status-dot flex-shrink-0" />
                <div>
                  <p className="font-mono text-[11px] text-green-400 leading-tight font-semibold">Connected</p>
                  <p className="font-mono text-[10px] text-slate-600 leading-tight">cluster0.mongodb.net</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto dash-scroll">
              {NAV_ITEMS.map(item => <Item key={item.id} item={item} />)}
            </nav>

            <div className="h-px mx-3 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            <div className="p-3 space-y-1">
              {BOTTOM_ITEMS.map(item => <Item key={item.id} item={item} />)}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Desktop sidebar (collapsible) ─────────────────────────────────────────────
function DesktopSidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  const Item = ({ item }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <motion.button onClick={() => setActivePage(item.id)}
        whileHover={{ x: collapsed ? 0 : 4, scale: 1.01 }} whileTap={{ scale: 0.97 }}
        className={`dash-nav-item w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 group relative
          ${isActive ? 'active bg-cyan-glow/8 text-white' : 'text-slate-500 hover:text-slate-100 hover:bg-white/5'}`}
        style={isActive ? { boxShadow: '0 0 20px rgba(0,245,255,0.08)' } : {}}>
        {isActive && (
          <motion.div layoutId="desktopActiveBar"
            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gradient-to-b from-cyan-glow to-blue-electric"
            style={{ boxShadow: '0 0 8px rgba(0,245,255,0.8)' }} />
        )}
        <div className={`flex-shrink-0 relative ${collapsed ? 'mx-auto' : 'ml-1'}`}>
          <Icon size={20} className={`transition-all ${isActive ? 'text-cyan-glow drop-shadow-[0_0_8px_rgba(0,245,255,0.9)]' : 'group-hover:text-slate-200'}`} />
          {isActive && (
            <motion.div className="absolute -inset-2.5 rounded-full bg-cyan-glow/12 blur-md"
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
          )}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-body text-[15px] font-semibold whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'group-hover:text-slate-100'}`}>
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && item.badge && !isActive && (
          <span className="ml-auto font-mono text-[9px] bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 px-1.5 py-0.5 rounded-md flex-shrink-0">{item.badge}</span>
        )}
        {!collapsed && isActive && (
          <motion.div className="ml-auto w-2 h-2 rounded-full bg-cyan-glow flex-shrink-0"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ boxShadow: '0 0 8px rgba(0,245,255,0.9)' }} />
        )}
      </motion.button>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="dash-sidebar flex-shrink-0 h-screen flex-col relative z-20 overflow-hidden hidden lg:flex">
      <div className="px-4 py-5 border-b border-white/5 flex items-center gap-3 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-electric/30">
          <Database size={17} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
              <span className="font-display font-bold text-lg text-white tracking-tight">Mongo<span className="gradient-text-cyan">Query</span></span>
              <span className="text-cyan-glow text-[10px] font-mono ml-1 opacity-70">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="px-3 py-3 border-b border-white/5">
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-500/5 border border-green-500/12 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 status-dot flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                <p className="font-mono text-[11px] text-green-400 leading-tight font-semibold">Connected</p>
                <p className="font-mono text-[10px] text-slate-600 leading-tight truncate">cluster0.mongodb.net</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 dash-scroll overflow-y-auto">
        {NAV_ITEMS.map(item => <Item key={item.id} item={item} />)}
      </nav>
      <div className="h-px mx-3 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="p-3 space-y-1">
        {BOTTOM_ITEMS.map(item => <Item key={item.id} item={item} />)}
      </div>
      <motion.button onClick={() => setCollapsed(c => !c)}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        className="absolute top-[72px] -right-3.5 w-7 h-7 rounded-full bg-navy-800 border border-cyan-glow/25 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/60 transition-all shadow-xl z-30">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>
    </motion.aside>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────────
export default function DashboardShell({ onLogout }) {
  const [activePage,    setActivePage]    = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef(null);

  // Scroll to top on every navigation
  useEffect(() => {
    if (mainRef.current) { mainRef.current.scrollTop = 0; mainRef.current.scrollLeft = 0; }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activePage]);

  const navigate = (page) => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActivePage(page);
  };

  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      {/* Mobile drawer */}
      <MobileDrawer activePage={activePage} setActivePage={navigate}
        open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Desktop sidebar */}
      <DesktopSidebar activePage={activePage} setActivePage={navigate} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-navy-950/90 backdrop-blur-xl sticky top-0 z-20 flex-shrink-0">
          <button onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-400 hover:text-cyan-glow transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center">
              <Database size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-white">
              Mongo<span className="gradient-text-cyan">Query</span>
              <span className="text-cyan-glow text-[10px] font-mono ml-1 opacity-70">AI</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
            <span className="font-mono text-[10px] text-green-400 hidden sm:block">Connected</span>
          </div>
        </div>

        {/* Desktop TopNav */}
        <div className="hidden lg:block">
          <TopNav onLogout={onLogout} activePage={activePage} setActivePage={navigate} />
        </div>

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden dash-scroll p-4 sm:p-6"
          style={{ scrollBehavior: 'auto' }}>
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
