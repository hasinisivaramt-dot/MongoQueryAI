import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, ChevronDown, LogOut, User, Settings,
  Database, Zap, X
} from 'lucide-react';
import { useAuth } from '../store.jsx';

const PAGE_TITLES = {
  dashboard: 'Dashboard', query: 'Query Generator', aggregations: 'Aggregations',
  collections: 'Collections', ops: 'MongoDB Ops', history: 'Query History',
  indexes: 'Indexes', analytics: 'Analytics', settings: 'Settings', profile: 'Profile',
};

const NOTIFICATIONS = [
  { id: 1, type: 'success', msg: 'Query executed successfully — 42ms', time: '2m ago' },
  { id: 2, type: 'warning', msg: 'Slow query detected: 840ms response', time: '8m ago' },
  { id: 3, type: 'info',    msg: 'AI model updated: claude-sonnet-4-6', time: '1h ago' },
  { id: 4, type: 'success', msg: 'Index created: dept_1_salary_1', time: '2h ago' },
];

export default function TopNav({ onLogout, activePage, setActivePage }) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const closeAll = () => { setShowProfile(false); setShowNotifs(false); };

  const navigate = (page) => {
    closeAll();
    setActivePage(page);
  };

  const SEARCH_PAGES = Object.entries(PAGE_TITLES).map(([id, label]) => ({ id, label }));
  const searchResults = query.trim().length > 0
    ? SEARCH_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-navy-950/90 backdrop-blur-xl flex items-center px-6 gap-4 sticky top-0 z-20 flex-shrink-0">

        {/* Page title */}
        <div className="flex items-center gap-3 mr-2 flex-shrink-0">
          <h1 className="font-display font-bold text-lg text-white leading-none">
            {PAGE_TITLES[activePage] || 'Dashboard'}
          </h1>
          <span className="font-mono text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded-md hidden sm:inline">
            MongoQuery AI
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-sm relative hidden md:block">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 150)}
            placeholder="Jump to page, search queries…"
            className="dash-input w-full pl-9 pr-4 py-2 rounded-xl text-sm"
          />
          <AnimatePresence>
            {showSearch && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-xl border border-cyan-glow/15 overflow-hidden z-50 shadow-xl shadow-black/40"
              >
                {searchResults.map(r => (
                  <button key={r.id}
                    onMouseDown={() => { navigate(r.id); setQuery(''); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-body text-slate-300 hover:bg-cyan-glow/6 hover:text-white transition-colors flex items-center gap-3">
                    <Search size={11} className="text-cyan-glow opacity-60" />
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">

          {/* DB status chip */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/5 border border-green-500/15 cursor-default">
            <div className="w-2 h-2 rounded-full bg-green-400 status-dot flex-shrink-0" />
            <span className="font-mono text-xs text-green-400 truncate max-w-[160px]">
              cluster0.mongodb.net
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifs(s => !s); setShowProfile(false); }}
              className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-400 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all relative"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-glow" />
            </motion.button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 glass-strong rounded-2xl border border-white/8 overflow-hidden z-50 shadow-2xl shadow-black/50"
                >
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-white">Notifications</span>
                    <span className="badge-info px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {NOTIFICATIONS.length} new
                    </span>
                  </div>
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="px-4 py-3 border-b border-white/4 hover:bg-white/3 transition-colors flex items-start gap-3 cursor-default">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.type === 'success' ? 'bg-green-400' :
                        n.type === 'warning' ? 'bg-yellow-400' : 'bg-cyan-glow'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-body text-xs text-slate-300 leading-snug">{n.msg}</p>
                        <p className="font-mono text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => { navigate('history'); }}
                    className="w-full px-4 py-2.5 font-mono text-xs text-cyan-glow hover:bg-cyan-glow/5 transition-colors text-left"
                  >
                    View query history →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowProfile(s => !s); setShowNotifs(false); }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border border-white/8 hover:border-cyan-glow/20 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user?.avatar || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-body text-xs font-medium text-white leading-tight truncate max-w-[90px]">
                  {user?.name}
                </p>
                <p className="font-mono text-[10px] text-cyan-glow leading-tight">{user?.plan}</p>
              </div>
              <ChevronDown size={12} className={`text-slate-500 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-52 glass-strong rounded-2xl border border-white/8 overflow-hidden z-50 shadow-2xl shadow-black/50"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="font-body text-sm text-white font-medium truncate">{user?.name}</p>
                    <p className="font-mono text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-block badge-info px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {user?.plan} Plan
                    </span>
                  </div>

                  {/* Nav items */}
                  {[
                    { icon: User,     label: 'My Profile', page: 'profile'  },
                    { icon: Settings, label: 'Settings',   page: 'settings' },
                    { icon: Database, label: 'Collections',page: 'collections' },
                    { icon: Zap,      label: 'Analytics',  page: 'analytics' },
                  ].map(item => (
                    <button key={item.page}
                      onClick={() => navigate(item.page)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left group"
                    >
                      <item.icon size={14} className="group-hover:text-cyan-glow transition-colors" />
                      <span className="font-body text-sm">{item.label}</span>
                    </button>
                  ))}

                  <div className="border-t border-white/5">
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                    >
                      <LogOut size={14} />
                      <span className="font-body text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Click-outside backdrop */}
      {(showProfile || showNotifs) && (
        <div className="fixed inset-0 z-10" onClick={closeAll} />
      )}
    </>
  );
}
