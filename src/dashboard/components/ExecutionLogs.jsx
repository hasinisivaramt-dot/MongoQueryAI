import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2, Pause, Play } from 'lucide-react';
import { MOCK_LOGS } from '../store.jsx';

const LEVEL_STYLES = {
  success: { cls: 'text-green-400',  prefix: '✓ SUCCESS', dot: 'bg-green-400'  },
  error:   { cls: 'text-red-400',    prefix: '✗ ERROR',   dot: 'bg-red-400'    },
  warning: { cls: 'text-yellow-400', prefix: '⚠ WARN',    dot: 'bg-yellow-400' },
  info:    { cls: 'text-cyan-glow',  prefix: '· INFO',    dot: 'bg-cyan-400'   },
};

const LIVE_ENTRIES = [
  { level: 'info',    msg: 'Heartbeat ping · cluster0.mongodb.net → 12ms' },
  { level: 'success', msg: 'Index scan: dept_1_salary_1 · 7 keys examined' },
  { level: 'warning', msg: 'Memory usage at 78% — consider pagination' },
  { level: 'info',    msg: 'AI inference complete · tokens used: 842' },
  { level: 'success', msg: 'Connection pool healthy · 8/10 connections active' },
  { level: 'info',    msg: 'Schema cache refreshed · 24 collections mapped' },
  { level: 'success', msg: 'Vector index sync complete · 284,711 embeddings' },
];

export default function ExecutionLogs() {
  const [logs, setLogs]     = useState(MOCK_LOGS);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('all');

  // Ref for the scrollable console div — NOT document scroll
  const consoleRef = useRef(null);
  const userScrolled = useRef(false);

  // Live log stream — runs only when not paused
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const entry = LIVE_ENTRIES[Math.floor(Math.random() * LIVE_ENTRIES.length)];
      const ts    = new Date().toTimeString().slice(0, 8);
      setLogs(l => [...l.slice(-50), { id: Date.now(), ...entry, ts }]);
    }, 3500);
    return () => clearInterval(id);
  }, [paused]);

  // Auto-scroll ONLY the console container — never the page
  useEffect(() => {
    if (paused || userScrolled.current) return;
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, paused]);

  // Detect when the user manually scrolls up inside the console
  const handleConsoleScroll = () => {
    const el = consoleRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolled.current = !atBottom;
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="dash-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/5 flex flex-wrap items-center gap-2">
        <Terminal size={15} className="text-cyan-glow" />
        <span className="font-display font-bold text-sm text-white">Execution Logs</span>
        <div className="flex items-center gap-1.5 ml-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${paused ? 'bg-yellow-400' : 'bg-green-400 status-dot'}`} />
          <span className="font-mono text-[10px] text-slate-500">{paused ? 'Paused' : 'Live'}</span>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {['all', 'success', 'warning', 'error', 'info'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[10px] capitalize transition-all border ${
                filter === lvl
                  ? 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow'
                  : 'border-white/8 text-slate-600 hover:text-slate-300 hover:border-white/20'
              }`}
            >
              {lvl}
            </button>
          ))}

          <button
            onClick={() => {
              setPaused(p => !p);
              userScrolled.current = false;
            }}
            title={paused ? 'Resume live logs' : 'Pause live logs'}
            className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all ml-1"
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>

          <button
            onClick={() => { setLogs([]); userScrolled.current = false; }}
            title="Clear logs"
            className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Console — scrolls itself, never hijacks the page */}
      <div
        ref={consoleRef}
        onScroll={handleConsoleScroll}
        className="log-console p-4 overflow-y-auto dash-scroll space-y-1"
        style={{ height: '260px' }}   // fixed pixel height — no scroll bleed
      >
        <AnimatePresence initial={false}>
          {filtered.map(log => {
            const s = LEVEL_STYLES[log.level] || LEVEL_STYLES.info;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-3 group"
              >
                <span className="text-slate-700 flex-shrink-0 text-[10px] mt-0.5 font-mono">{log.ts}</span>
                <span className={`flex-shrink-0 text-[10px] font-bold w-[62px] font-mono ${s.cls}`}>{s.prefix}</span>
                <span className="text-slate-400 text-[11px] leading-relaxed group-hover:text-slate-200 transition-colors font-mono">
                  {log.msg}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-slate-700 font-mono text-xs text-center py-8">No logs match filter</p>
        )}
      </div>
    </div>
  );
}
