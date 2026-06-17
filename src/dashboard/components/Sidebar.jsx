import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, GitBranch, Layers, Activity,
  History, Bookmark, BarChart3, Settings, User, Database,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'query', label: 'Query Generator', icon: Sparkles },
  { id: 'aggregations', label: 'Aggregations', icon: GitBranch },
  { id: 'collections', label: 'Collections', icon: Layers },
  { id: 'ops', label: 'MongoDB Ops', icon: Activity },
  { id: 'history', label: 'Query History', icon: History },
  { id: 'indexes', label: 'Indexes', icon: Bookmark },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <motion.button
        onClick={() => setActivePage(item.id)}
        whileHover={{ x: collapsed ? 0 : 3 }}
        className={`dash-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group
          ${isActive
            ? 'active bg-cyan-glow/6 text-white'
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/4'}`}
      >
        <div className={`flex-shrink-0 relative ${collapsed ? 'mx-auto' : ''}`}>
          <Icon size={17}
            className={`transition-all ${isActive ? 'text-cyan-glow drop-shadow-[0_0_6px_rgba(0,245,255,0.8)]' : 'group-hover:text-slate-300'}`}
          />
          {isActive && (
            <div className="absolute -inset-2 rounded-full bg-cyan-glow/10 blur-sm" />
          )}
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-body text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : ''}`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {isActive && !collapsed && (
          <motion.div layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-glow shadow-[0_0_6px_rgba(0,245,255,0.8)]" />
        )}
      </motion.button>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 228 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="dash-sidebar flex-shrink-0 h-screen flex flex-col relative z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-electric/30">
          <Database size={15} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap">
              <span className="font-display font-bold text-base text-white tracking-tight">
                Mongo<span className="gradient-text-cyan">Query</span>
              </span>
              <span className="text-cyan-glow text-[10px] font-mono ml-1 opacity-70">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DB Status */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-green-500/5 border border-green-500/10 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-green-400 status-dot flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="overflow-hidden">
                <p className="font-mono text-[10px] text-green-400 leading-tight">Connected</p>
                <p className="font-mono text-[9px] text-slate-600 leading-tight truncate max-w-[130px]">cluster0.mongodb.net</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 dash-scroll overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} isActive={activePage === item.id} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="p-2.5 space-y-0.5 border-t border-white/5">
        {BOTTOM_ITEMS.map(item => (
          <NavItem key={item.id} item={item} isActive={activePage === item.id} />
        ))}
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(c => !c)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-[68px] -right-3 w-6 h-6 rounded-full bg-navy-800 border border-cyan-glow/20 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/50 transition-all shadow-lg z-30"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </motion.button>
    </motion.aside>
  );
}
