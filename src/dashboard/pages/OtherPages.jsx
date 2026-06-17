import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Clock, Copy, Play, Check, Layers, Bookmark,
  Activity, GitBranch, ChevronRight, Plus, Trash2,
  RefreshCw, AlertCircle, Terminal
} from 'lucide-react';
import { MOCK_QUERIES, COLLECTION_DATA } from '../store.jsx';
import QueryGenerator from '../components/QueryGenerator.jsx';
import ExecutionLogs from '../components/ExecutionLogs.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const STATUS_BADGE = {
  success: 'badge-success',
  warning: 'badge-warning',
  error:   'badge-error',
};

// ── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl font-mono text-xs flex items-center gap-3 shadow-2xl ${
        type === 'success' ? 'badge-success' : type === 'error' ? 'badge-error' : 'badge-info'
      }`}
    >
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </motion.div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = 'success') => setToast({ msg, type, id: Date.now() });
  const hide = () => setToast(null);
  const el = (
    <AnimatePresence>
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={hide} />}
    </AnimatePresence>
  );
  return { show, el };
}

// ── Query History ─────────────────────────────────────────────────────────────
export function QueryHistoryPage() {
  const [copiedId, setCopiedId] = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [results, setResults] = useState({});
  const { show: showToast, el: toastEl } = useToast();

  const copy = (id, q) => {
    navigator.clipboard.writeText(q).then(() => {
      setCopiedId(id);
      showToast('Query copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const rerun = async (q) => {
    setRunningId(q.id);
    await new Promise(r => setTimeout(r, 900));
    setResults(r => ({ ...r, [q.id]: { docs: q.docs || Math.floor(Math.random() * 50 + 1), time: Math.floor(Math.random() * 80 + 15) } }));
    setRunningId(null);
    showToast(`Query executed · ${results[q.id]?.docs ?? '—'} docs returned`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
      {toastEl}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <History size={16} className="text-cyan-glow" />
          <h2 className="font-display font-bold text-base text-white">Query History</h2>
          <span className="ml-auto badge-info px-2.5 py-1 rounded-lg font-mono text-[10px]">
            {MOCK_QUERIES.length} queries
          </span>
        </div>

        <div className="divide-y divide-white/4">
          {MOCK_QUERIES.map((q, i) => (
            <motion.div key={q.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-5 py-4 hover:bg-white/2 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`${STATUS_BADGE[q.status]} px-2 py-0.5 rounded-full font-mono text-[10px] capitalize`}>
                      {q.status}
                    </span>
                    <span className="font-mono text-[10px] text-slate-600 flex items-center gap-1">
                      <Clock size={9} /> {q.ts}
                    </span>
                    {q.status !== 'error' && (
                      <>
                        <span className="font-mono text-[10px] text-slate-600">·</span>
                        <span className="font-mono text-[10px] text-green-400">{q.time}ms</span>
                        <span className="font-mono text-[10px] text-slate-600">·</span>
                        <span className="font-mono text-[10px] text-blue-neon">{q.docs} docs</span>
                      </>
                    )}
                  </div>
                  <p className="font-body text-sm text-slate-300 mb-2">{q.nl}</p>
                  <code className="font-mono text-xs text-cyan-glow/80 bg-white/3 px-3 py-1.5 rounded-lg block truncate">
                    {q.query}
                  </code>
                  {/* Inline re-run result */}
                  <AnimatePresence>
                    {results[q.id] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 badge-success px-3 py-1.5 rounded-lg font-mono text-[10px] flex items-center gap-2 inline-flex">
                        <Check size={10} />
                        Re-executed · {results[q.id].docs} docs · {results[q.id].time}ms
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copy(q.id, q.query)}
                    title="Copy query"
                    className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all"
                  >
                    {copiedId === q.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  </button>
                  <button
                    onClick={() => rerun(q)}
                    title="Re-run query"
                    disabled={runningId === q.id}
                    className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-green-400 hover:border-green-400/30 transition-all disabled:opacity-40"
                  >
                    {runningId === q.id
                      ? <RefreshCw size={11} className="animate-spin text-green-400" />
                      : <Play size={11} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Collections ───────────────────────────────────────────────────────────────
export function CollectionsPage() {
  const [selected, setSelected] = useState(null);
  const { show: showToast, el: toastEl } = useToast();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-slate-600">{COLLECTION_DATA.length} collections · cluster0.mongodb.net</p>
        <button
          onClick={() => showToast('Collection creation coming soon', 'info')}
          className="btn-outline px-4 py-2 rounded-xl text-sm flex items-center gap-2 font-body"
        >
          <Plus size={14} /> New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {COLLECTION_DATA.map((col, i) => (
          <motion.div key={col.name}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelected(selected === col.name ? null : col.name)}
            className={`dash-card rounded-2xl p-5 cursor-pointer transition-all ${
              selected === col.name ? 'border-cyan-glow/30 bg-cyan-glow/3' : ''
            }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
                <Layers size={18} className="text-cyan-glow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-cyan-glow font-bold truncate">{col.name}</p>
                <p className="font-mono text-[10px] text-slate-600">{col.docs.toLocaleString()} documents</p>
              </div>
              <ChevronRight size={14} className={`text-slate-600 transition-transform flex-shrink-0 ${selected === col.name ? 'rotate-90 text-cyan-glow' : ''}`} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Size', val: col.size },
                { label: 'Queries', val: col.queries.toLocaleString() },
                { label: 'Indexes', val: Math.floor(col.name.length % 4) + 2 },
              ].map(s => (
                <div key={s.label} className="bg-white/3 rounded-xl p-2.5 text-center">
                  <p className="font-display font-bold text-sm text-white">{s.val}</p>
                  <p className="font-mono text-[9px] text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selected === col.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/5 space-y-2 overflow-hidden"
                >
                  <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-2">Sample Schema</p>
                  {['_id: ObjectId', 'name: String', 'createdAt: Date', 'status: String', 'metadata: Object'].map(f => (
                    <div key={f} className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-glow">{f.split(':')[0]}</span>
                      <span className="font-mono text-[10px] text-slate-600">{f.split(':')[1]?.trim()}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={e => { e.stopPropagation(); showToast(`Querying ${col.name}…`, 'info'); }}
                      className="flex-1 py-2 rounded-xl btn-outline text-xs font-mono text-center"
                    >
                      Query
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); showToast(`Dropped ${col.name}`, 'error'); }}
                      className="flex-1 py-2 rounded-xl font-mono text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                    >
                      Drop
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Query Generator (full page) ───────────────────────────────────────────────
export function QueryGeneratorPage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <QueryGenerator />
      <ExecutionLogs />
    </motion.div>
  );
}

// ── Aggregations ──────────────────────────────────────────────────────────────
const DEFAULT_STAGES = [
  { id: 1, op: '$match',  config: '{ dept: "Engineering", salary: { $gt: 60000 } }', color: '#00f5ff' },
  { id: 2, op: '$group',  config: '{ _id: "$location", avgSalary: { $avg: "$salary" }, count: { $sum: 1 } }', color: '#4d9eff' },
  { id: 3, op: '$sort',   config: '{ avgSalary: -1 }', color: '#a855f7' },
  { id: 4, op: '$limit',  config: '10', color: '#22c55e' },
];

const STAGE_OPS = ['$match','$group','$sort','$limit','$project','$lookup','$unwind','$count'];

export function AggregationsPage() {
  const [stages, setStages]     = useState(DEFAULT_STAGES);
  const [running, setRunning]   = useState(false);
  const [result, setResult]     = useState(null);
  const [editing, setEditing]   = useState(null);
  const { show: showToast, el: toastEl } = useToast();

  const addStage = () => {
    const op = STAGE_OPS[stages.length % STAGE_OPS.length];
    const colors = ['#00f5ff','#4d9eff','#a855f7','#22c55e','#f59e0b','#ec4899'];
    setStages(s => [...s, { id: Date.now(), op, config: '{}', color: colors[s.length % colors.length] }]);
    showToast(`Stage ${op} added`);
  };

  const removeStage = (id) => {
    setStages(s => s.filter(x => x.id !== id));
    showToast('Stage removed', 'info');
  };

  const runPipeline = async () => {
    setRunning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1400));
    setResult({ docs: Math.floor(Math.random() * 20 + 3), time: Math.floor(Math.random() * 100 + 40) });
    setRunning(false);
    showToast('Pipeline executed successfully');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      <div className="dash-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch size={16} className="text-cyan-glow" />
          <h2 className="font-display font-bold text-base text-white">Visual Pipeline Builder</h2>
          <span className="ml-auto badge-info px-3 py-1 rounded-lg font-mono text-[10px]">
            {stages.length} stage{stages.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {stages.map((stage, i) => (
            <motion.div key={stage.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-4 group">
              {/* Connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold"
                  style={{ background: `${stage.color}20`, border: `1px solid ${stage.color}30`, color: stage.color }}>
                  {i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div className="w-px h-6 mt-1" style={{ background: `${stage.color}30` }} />
                )}
              </div>

              {/* Stage card */}
              <div className="flex-1 bg-white/2 border border-white/5 rounded-xl p-4 hover:border-cyan-glow/15 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold" style={{ color: stage.color }}>{stage.op}</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditing(editing === stage.id ? null : stage.id)}
                      className="font-mono text-[10px] text-slate-600 hover:text-cyan-glow px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
                    >
                      {editing === stage.id ? 'Done' : 'Edit'}
                    </button>
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="font-mono text-[10px] text-red-400/60 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/5 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {editing === stage.id ? (
                  <textarea
                    className="dash-input w-full px-3 py-2 rounded-lg text-xs font-mono resize-none"
                    rows={3}
                    value={stage.config}
                    onChange={e => setStages(s => s.map(x => x.id === stage.id ? { ...x, config: e.target.value } : x))}
                  />
                ) : (
                  <code className="font-mono text-xs text-slate-400 block">{stage.config}</code>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 badge-success px-4 py-3 rounded-xl font-mono text-xs flex items-center gap-3">
              <Check size={14} />
              Pipeline executed · {result.docs} documents returned · {result.time}ms
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 flex-wrap">
          <button onClick={addStage}
            className="btn-outline px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 font-body">
            <Plus size={14} /> Add Stage
          </button>
          <motion.button
            onClick={runPipeline}
            disabled={running || stages.length === 0}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className={`btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 font-body disabled:opacity-60 ${running ? 'ai-processing' : ''}`}
          >
            {running
              ? <><RefreshCw size={14} className="animate-spin" /> Running…</>
              : <><Play size={14} /> Run Pipeline</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Indexes ───────────────────────────────────────────────────────────────────
const DEFAULT_INDEXES = [
  { id: 1, name: '_id_',              fields: '{ _id: 1 }',               type: 'Unique',      size: '1.2 MB',  usage: 18420 },
  { id: 2, name: 'dept_1_salary_1',   fields: '{ dept: 1, salary: 1 }',   type: 'Compound',    size: '840 KB',  usage: 12350 },
  { id: 3, name: 'createdAt_-1',      fields: '{ createdAt: -1 }',         type: 'Single',      size: '320 KB',  usage: 8921  },
  { id: 4, name: 'email_text',        fields: '{ email: "text" }',         type: 'Text',        size: '2.1 MB',  usage: 3241  },
  { id: 5, name: 'location_2dsphere', fields: '{ location: "2dsphere" }',  type: 'Geospatial',  size: '480 KB',  usage: 891   },
];

export function IndexesPage() {
  const [indexes, setIndexes] = useState(DEFAULT_INDEXES);
  const [analyzing, setAnalyzing] = useState(null);
  const [analysis, setAnalysis]   = useState({});
  const { show: showToast, el: toastEl } = useToast();

  const analyzeIndex = async (idx) => {
    setAnalyzing(idx.id);
    await new Promise(r => setTimeout(r, 900));
    setAnalysis(a => ({
      ...a,
      [idx.id]: `Selectivity: ${(Math.random() * 0.5 + 0.5).toFixed(2)} · Avg scan: ${Math.floor(Math.random() * 50 + 5)} docs · Status: Healthy`
    }));
    setAnalyzing(null);
    showToast(`Index "${idx.name}" analyzed`);
  };

  const dropIndex = (idx) => {
    if (idx.type === 'Unique') { showToast('Cannot drop primary index', 'error'); return; }
    setIndexes(i => i.filter(x => x.id !== idx.id));
    showToast(`Index "${idx.name}" dropped`, 'info');
  };

  const createIndex = () => showToast('Index creation wizard — coming soon', 'info');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <Bookmark size={16} className="text-cyan-glow" />
          <h2 className="font-display font-bold text-base text-white">Index Manager</h2>
          <span className="font-mono text-[10px] text-slate-600 ml-1">{indexes.length} indexes</span>
          <button onClick={createIndex} className="ml-auto btn-outline px-4 py-2 rounded-xl text-sm font-body flex items-center gap-2">
            <Plus size={13} /> Create Index
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full dash-table">
            <thead>
              <tr>
                {['Index Name','Fields','Type','Size','Usage','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indexes.map((idx, i) => (
                <motion.tr key={idx.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 font-mono text-sm text-cyan-glow whitespace-nowrap">{idx.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{idx.fields}</td>
                  <td className="px-5 py-3">
                    <span className="badge-info px-2 py-0.5 rounded-md font-mono text-[10px] whitespace-nowrap">{idx.type}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-sm text-slate-400">{idx.size}</td>
                  <td className="px-5 py-3 font-mono text-sm text-white font-bold">{idx.usage.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => analyzeIndex(idx)}
                        disabled={analyzing === idx.id}
                        className="font-mono text-[10px] px-2.5 py-1.5 rounded-lg border border-white/8 text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all disabled:opacity-40 flex items-center gap-1"
                      >
                        {analyzing === idx.id
                          ? <><RefreshCw size={9} className="animate-spin" /> Analyzing…</>
                          : 'Analyze'}
                      </button>
                      <button
                        onClick={() => dropIndex(idx)}
                        className="font-mono text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all"
                      >
                        Drop
                      </button>
                    </div>
                    {analysis[idx.id] && (
                      <p className="font-mono text-[9px] text-slate-600 mt-1 max-w-[200px]">{analysis[idx.id]}</p>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ── MongoDB Ops ───────────────────────────────────────────────────────────────
const OPS_LIST = [
  {
    name: 'currentOp',
    desc: 'Show currently running operations',
    color: '#00f5ff',
    result: '{\n  "inprog": [\n    { "op": "query", "ns": "myDB.employees", "secs_running": 0, "client": "127.0.0.1" }\n  ]\n}',
  },
  {
    name: 'serverStatus',
    desc: 'MongoDB server statistics and uptime',
    color: '#4d9eff',
    result: '{\n  "host": "cluster0-shard-00-00",\n  "version": "7.0.4",\n  "uptime": 1284921,\n  "connections": { "current": 8, "available": 992 }\n}',
  },
  {
    name: 'dbStats',
    desc: 'Database size and collection count',
    color: '#22c55e',
    result: '{\n  "db": "myDB",\n  "collections": 24,\n  "dataSize": 14721048,\n  "indexSize": 4823012,\n  "storageSize": 20971520\n}',
  },
  {
    name: 'getProfilingStatus',
    desc: 'Query profiler level and slow threshold',
    color: '#a855f7',
    result: '{\n  "was": 1,\n  "slowms": 100,\n  "sampleRate": 1.0\n}',
  },
  {
    name: 'listDatabases',
    desc: 'List all databases on this cluster',
    color: '#f59e0b',
    result: '{\n  "databases": [\n    { "name": "myDB", "sizeOnDisk": 20971520 },\n    { "name": "admin", "sizeOnDisk": 40960 }\n  ]\n}',
  },
];

export function MongoOpsPage() {
  const [running, setRunning] = useState(null);
  const [output, setOutput]   = useState({});
  const { show: showToast, el: toastEl } = useToast();

  const runOp = async (op) => {
    setRunning(op.name);
    await new Promise(r => setTimeout(r, 800));
    setOutput(o => ({ ...o, [op.name]: op.result }));
    setRunning(null);
    showToast(`db.${op.name}() executed`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      <div className="dash-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={16} className="text-cyan-glow" />
          <h2 className="font-display font-bold text-base text-white">MongoDB Operations</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
            <span className="font-mono text-[10px] text-green-400">cluster0 · connected</span>
          </div>
        </div>

        <div className="space-y-4">
          {OPS_LIST.map((op, i) => (
            <motion.div key={op.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/2 border border-white/5 rounded-xl p-4 hover:border-cyan-glow/15 transition-all">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold" style={{ color: op.color }}>
                    db.{op.name}()
                  </span>
                  <span className="font-body text-xs text-slate-500">{op.desc}</span>
                </div>
                <motion.button
                  onClick={() => runOp(op)}
                  disabled={running === op.name}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="px-3 py-1.5 rounded-lg font-mono text-[11px] text-green-400 border border-green-500/20 hover:bg-green-500/8 transition-all flex items-center gap-1.5 disabled:opacity-40 whitespace-nowrap"
                >
                  {running === op.name
                    ? <><RefreshCw size={11} className="animate-spin" /> Running…</>
                    : <><Play size={11} /> Run</>}
                </motion.button>
              </div>

              <AnimatePresence>
                {output[op.name] && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-mono text-[11px] text-slate-400 bg-black/30 p-3 rounded-lg overflow-x-auto"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {output[op.name]}
                  </motion.pre>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      <ExecutionLogs />
    </motion.div>
  );
}
