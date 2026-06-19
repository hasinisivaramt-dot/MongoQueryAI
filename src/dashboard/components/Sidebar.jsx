import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, GitBranch, Layers, Activity,
  History, Bookmark, BarChart3, Settings, User, Database,
  ChevronLeft, ChevronRight, Brain, FileSearch,
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

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <motion.button
        onClick={() => setActivePage(item.id)}
        whileHover={{ x: collapsed ? 0 : 4, scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className={`dash-nav-item w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 group relative
          ${isActive
            ? 'active bg-cyan-glow/8 text-white shadow-lg'
            : 'text-slate-500 hover:text-slate-100 hover:bg-white/5'}`}
        style={isActive ? { boxShadow: '0 0 20px rgba(0,245,255,0.08), inset 0 0 20px rgba(0,245,255,0.03)' } : {}}
      >
        {/* Active left bar */}
        {isActive && (
          <motion.div
            layoutId="activeBar"
            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-gradient-to-b from-cyan-glow to-blue-electric"
            style={{ boxShadow: '0 0 8px rgba(0,245,255,0.8)' }}
          />
        )}

        {/* Icon */}
        <div className={`flex-shrink-0 relative ${collapsed ? 'mx-auto' : 'ml-1'}`}>
          <Icon
            size={20}
            className={`transition-all duration-200 ${
              isActive
                ? 'text-cyan-glow drop-shadow-[0_0_8px_rgba(0,245,255,0.9)]'
                : 'group-hover:text-slate-200'}`}
          />
          {isActive && (
            <motion.div
              className="absolute -inset-2.5 rounded-full bg-cyan-glow/12 blur-md"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-body text-[15px] font-semibold whitespace-nowrap overflow-hidden tracking-wide
                ${isActive ? 'text-white' : 'group-hover:text-slate-100'}`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge + active dot */}
        {!collapsed && (
          <>
            {item.badge && !isActive && (
              <span className="ml-auto font-mono text-[9px] bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 px-1.5 py-0.5 rounded-md tracking-wider flex-shrink-0">
                {item.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                className="ml-auto w-2 h-2 rounded-full bg-cyan-glow flex-shrink-0"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px rgba(0,245,255,0.9)' }}
              />
            )}
          </>
        )}
      </motion.button>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="dash-sidebar flex-shrink-0 h-screen flex flex-col relative z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5 flex items-center gap-3 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-electric/30">
          <Database size={17} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap">
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Mongo<span className="gradient-text-cyan">Query</span>
              </span>
              <span className="text-cyan-glow text-[10px] font-mono ml-1 opacity-70">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DB Status */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-500/5 border border-green-500/12 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 status-dot flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="overflow-hidden min-w-0">
                <p className="font-mono text-[11px] text-green-400 leading-tight font-semibold">Connected</p>
                <p className="font-mono text-[10px] text-slate-600 leading-tight truncate">cluster0.mongodb.net</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-1 dash-scroll overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} isActive={activePage === item.id} />
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px mx-3 bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Bottom nav */}
      <div className="p-3 space-y-1">
        {BOTTOM_ITEMS.map(item => (
          <NavItem key={item.id} item={item} isActive={activePage === item.id} />
        ))}
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(c => !c)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-[72px] -right-3.5 w-7 h-7 rounded-full bg-navy-800 border border-cyan-glow/25 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/60 transition-all shadow-xl z-30"
        style={{ boxShadow: '0 0 12px rgba(0,245,255,0.1)' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>
    </motion.aside>
  );
}
