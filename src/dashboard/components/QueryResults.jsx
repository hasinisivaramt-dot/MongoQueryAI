import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, ArrowUpDown,
  FileJson, FileText, Check, RefreshCw
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../store.jsx';

const STATUS_BADGE = {
  active:   'badge-success',
  inactive: 'badge-error',
};

function Toast({ msg, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      onAnimationComplete={() => setTimeout(onDone, 1600)}
      className="absolute top-2 right-4 z-50 badge-success px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2 shadow-xl"
    >
      <Check size={12} /> {msg}
    </motion.div>
  );
}

export default function QueryResults() {
  const [filter, setFilter]   = useState('');
  const [page, setPage]       = useState(0);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [toast, setToast]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const PER_PAGE = 5;

  const showToast = (msg) => setToast({ msg, id: Date.now() });

  const sorted = useMemo(() => {
    let d = [...MOCK_DOCUMENTS];
    if (filter) {
      d = d.filter(r =>
        Object.values(r).some(v => String(v).toLowerCase().includes(filter.toLowerCase()))
      );
    }
    d.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return d;
  }, [filter, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible    = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: 'query_results.json'
    });
    a.click();
    showToast(`Exported ${sorted.length} documents as JSON`);
  };

  const exportCSV = () => {
    const keys = Object.keys(sorted[0] || {});
    const csv  = [keys.join(','), ...sorted.map(r => keys.map(k => `"${r[k]}"`).join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'query_results.csv'
    });
    a.click();
    showToast(`Exported ${sorted.length} documents as CSV`);
  };

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 700));
    setRefreshing(false);
    showToast('Results refreshed');
  };

  const COLS = [
    { key: '_id',    label: 'Document ID' },
    { key: 'name',   label: 'Name'        },
    { key: 'dept',   label: 'Department'  },
    { key: 'salary', label: 'Salary'      },
    { key: 'status', label: 'Status'      },
    { key: 'joined', label: 'Joined'      },
  ];

  return (
    <div className="dash-card rounded-2xl overflow-hidden relative">
      <AnimatePresence>
        {toast && (
          <Toast key={toast.id} msg={toast.msg} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex flex-wrap items-center gap-3">
        <div>
          <h3 className="font-display font-bold text-sm text-white">Query Results</h3>
          <p className="font-mono text-[10px] text-slate-600">{sorted.length} documents · employees</p>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Filter */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(0); }}
              placeholder="Filter…"
              className="dash-input pl-8 pr-3 py-2 rounded-xl text-xs w-36"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            title="Refresh results"
            className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-cyan-glow' : ''} />
          </button>

          {/* Export JSON */}
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[11px] text-slate-400 hover:text-cyan-glow border border-white/8 hover:border-cyan-glow/25 transition-all"
          >
            <FileJson size={12} /> JSON
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[11px] text-slate-400 hover:text-green-400 border border-white/8 hover:border-green-500/25 transition-all"
          >
            <FileText size={12} /> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto dash-scroll">
        <table className="w-full dash-table">
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col.key}
                  className="px-4 py-3 text-left cursor-pointer hover:text-cyan-glow transition-colors whitespace-nowrap select-none"
                  onClick={() => toggleSort(col.key)}>
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <ArrowUpDown size={10}
                      className={`transition-colors ${sortKey === col.key ? 'text-cyan-glow' : 'text-slate-700'}`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {visible.map((row, i) => (
                <motion.tr key={row._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-white/4 hover:bg-cyan-glow/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-600 max-w-[90px] truncate">{row._id}</td>
                  <td className="px-4 py-3 font-body text-sm text-white whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3">
                    <span className="badge-info px-2 py-0.5 rounded-md font-mono text-[10px]">{row.dept}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-green-400 font-bold">
                    ${row.salary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${STATUS_BADGE[row.status] ?? 'badge-info'} px-2.5 py-1 rounded-full font-mono text-[10px] capitalize`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.joined}</td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-slate-600">
                  No documents match your filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
        <span className="font-mono text-[10px] text-slate-600">
          Showing {Math.min(page * PER_PAGE + 1, sorted.length)}–{Math.min((page + 1) * PER_PAGE, sorted.length)} of {sorted.length}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={13} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-7 h-7 rounded-lg font-mono text-[11px] transition-all ${
                i === page
                  ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30'
                  : 'glass border border-white/8 text-slate-500 hover:text-white'
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow disabled:opacity-30 transition-all"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
