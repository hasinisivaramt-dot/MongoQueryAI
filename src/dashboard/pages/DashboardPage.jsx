import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Copy, Check, Download,
  Table2, FileJson, FileSpreadsheet, BarChart3, RefreshCw,
  Database, Zap, Brain, ChevronRight, X,
} from 'lucide-react';
import { useAuth, inferWorkspace } from '../store.jsx';
import StatCards from '../components/StatCards.jsx';
import {
  ExecutionTimeChart, QueryVolumeChart, AIAccuracyChart,
  QueryMethodDonut, CollectionUsageChart,
} from '../components/Charts.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── NLP helpers ───────────────────────────────────────────────────────────────
const SEMANTIC = {
  income: 'salary', compensation: 'salary', wage: 'salary', earnings: 'salary',
  staff: 'employees', workforce: 'employees', personnel: 'employees',
  city: 'location', place: 'location', above: '$gt', over: '$gt',
  below: '$lt', under: '$lt', count: 'countDocuments', total: 'aggregate',
};

function detectIntent(t) {
  if (/count|how many/.test(t)) return 'countDocuments';
  if (/average|avg/.test(t))   return 'aggregate-avg';
  if (/total|sum/.test(t))     return 'aggregate-sum';
  if (/group by|per /.test(t)) return 'aggregate-group';
  if (/sort|top \d/.test(t))   return 'find-sort';
  return 'find';
}

function buildChatQuery(text, ws) {
  const t    = text.toLowerCase();
  const coll = ws?.collections?.[0]?.name || 'employees';
  const numM = text.match(/\d[\d,]*/);
  const num  = numM ? numM[0].replace(/,/g, '') : null;
  const op   = /above|over|greater/.test(t) ? '$gt' : /below|under|less/.test(t) ? '$lt' : null;
  const field= /salary|income|compensation|wage/.test(t) ? 'salary'
             : /age/.test(t) ? 'age'
             : /price|cost/.test(t) ? 'price'
             : /amount|total/.test(t) ? 'total'
             : null;
  const intent = detectIntent(t);

  let query, explanation, rows, csvHeaders;

  if (intent === 'countDocuments') {
    const filter = field && op && num ? `{ ${field}: { ${op}: ${num} } }` : '{}';
    const cnt = Math.floor(Math.random() * 200 + 20);
    query = `db.${coll}.countDocuments(${filter})`;
    explanation = `Found **${cnt} documents** in \`${coll}\`${field && num ? ` where \`${field}\` is ${op === '$gt' ? 'greater than' : 'less than'} ${num}` : ''}.`;
    rows = [{ result: cnt, collection: coll, filter: filter || '{}' }];
    csvHeaders = ['result', 'collection', 'filter'];
  } else if (intent.startsWith('aggregate')) {
    const cnt = Math.floor(Math.random() * 8 + 2);
    query = `db.${coll}.aggregate([\n  { $group: { _id: "$dept", count: { $sum: 1 }, avg: { $avg: "$${field||'salary'}" } } },\n  { $sort: { avg: -1 } }\n])`;
    explanation = `Grouped \`${coll}\` by department — found **${cnt} groups**. Results sorted by average ${field || 'salary'} descending.`;
    rows = Array.from({ length: cnt }, (_, i) => ({
      dept: ['Engineering','Marketing','HR','Finance','Product','Design','Sales','Legal'][i % 8],
      count: Math.floor(Math.random() * 80 + 10),
      avg: Math.floor(Math.random() * 80000 + 40000),
    }));
    csvHeaders = ['dept','count','avg'];
  } else {
    const filter = field && op && num ? `{ ${field}: { ${op}: ${num} } }` : '{}';
    const cnt = Math.floor(Math.random() * 120 + 15);
    const sortStr = /top \d|sort|rank/.test(t) ? `\n  .sort({ ${field||'salary'}: -1 })\n  .limit(10)` : '';
    query = `db.${coll}.find(${filter})${sortStr}`;
    explanation = `Retrieved **${cnt} documents** from \`${coll}\`${field && op && num ? ` where \`${field}\` is ${op === '$gt' ? 'greater than' : 'less than'} **${num}**` : ''}.`;
    // Generate realistic rows based on collection
    const sampleFields = ws?.fields?.[coll] || ['_id','name','status'];
    rows = Array.from({ length: Math.min(cnt, 8) }, (_, i) => {
      const row = {};
      sampleFields.forEach(f => {
        if (f === '_id') row[f] = `507f...${String(i).padStart(3,'0')}`;
        else if (f === 'salary' || f === 'price' || f === 'amount' || f === 'total') row[f] = Math.floor(Math.random() * 100000 + 30000);
        else if (f === 'count' || f === 'age' || f === 'cgpa') row[f] = Math.floor(Math.random() * 80 + 18);
        else if (f === 'status') row[f] = ['active','inactive'][i % 2];
        else if (f === 'dept' || f === 'department') row[f] = ['Engineering','HR','Marketing','Finance'][i % 4];
        else row[f] = `${f}_value_${i + 1}`;
      });
      return row;
    });
    csvHeaders = sampleFields;
  }

  return { query, explanation, rows, csvHeaders, docCount: rows.length, execTime: Math.floor(Math.random() * 80 + 15) };
}

// ── CSV / JSON generators ──────────────────────────────────────────────────────
function toCSV(rows, headers) {
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))];
  return lines.join('\n');
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── Output Panel ──────────────────────────────────────────────────────────────
function OutputPanel({ result }) {
  const [view, setView]     = useState('table');
  const [copied, setCopied] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [csvOpen,  setCsvOpen]  = useState(false);

  if (!result) return null;

  const jsonStr = JSON.stringify(result.rows, null, 2);
  const csvStr  = toCSV(result.rows, result.csvHeaders);
  const headers = result.csvHeaders;

  const copyQuery = () => {
    navigator.clipboard.writeText(result.query);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">

      {/* Explanation */}
      <div className="dash-card rounded-2xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={14} className="text-cyan-glow" />
          <span className="font-mono text-[10px] text-cyan-glow tracking-widest">AI RESPONSE</span>
        </div>
        <p className="font-body text-sm text-slate-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: result.explanation.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.+?)`/g, '<code class="text-cyan-glow bg-white/5 px-1 rounded">$1</code>') }} />
        <div className="flex gap-4 mt-3 font-mono text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Zap size={9} className="text-green-400" />{result.docCount} documents</span>
          <span className="flex items-center gap-1"><RefreshCw size={9} />{result.execTime}ms</span>
        </div>
      </div>

      {/* Generated Query */}
      <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
          <span className="font-mono text-[10px] text-cyan-glow">Generated Query</span>
          <button onClick={copyQuery} className="ml-auto font-mono text-[10px] text-slate-500 hover:text-cyan-glow flex items-center gap-1 transition-colors">
            {copied ? <><Check size={10} className="text-green-400" />Copied</> : <><Copy size={10} />Copy</>}
          </button>
        </div>
        <pre className="px-4 py-4 font-mono text-sm text-green-300 overflow-x-auto dash-scroll whitespace-pre-wrap">{result.query}</pre>
      </div>

      {/* View toggle + output formats */}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 flex-wrap gap-y-2">
          {[
            { id: 'table', icon: Table2,        label: 'Table'  },
            { id: 'json',  icon: FileJson,       label: 'JSON'   },
            { id: 'csv',   icon: FileSpreadsheet,label: 'CSV'    },
            { id: 'chart', icon: BarChart3,      label: 'Charts' },
          ].map(v => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  view === v.id ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}>
                <Icon size={12} />{v.label}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {/* Table */}
          {view === 'table' && (
            <div className="overflow-x-auto dash-scroll">
              <table className="w-full dash-table text-xs">
                <thead>
                  <tr>{headers.map(h => <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <motion.tr key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-t border-white/4 hover:bg-white/2 transition-colors">
                      {headers.map(h => (
                        <td key={h} className="px-4 py-2.5 font-mono text-slate-300 whitespace-nowrap">
                          {typeof row[h] === 'number' && (h === 'salary' || h === 'avg' || h === 'amount' || h === 'total' || h === 'price')
                            ? `₹${Number(row[h]).toLocaleString()}`
                            : String(row[h] ?? '—')}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* JSON */}
          {view === 'json' && (
            <div className="space-y-3">
              <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-64 overflow-y-auto dash-scroll">
                <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap">{jsonStr}</pre>
              </div>
              <button
                onClick={() => downloadBlob(jsonStr, 'results.json', 'application/json')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                <Download size={12} /> Download JSON
              </button>
            </div>
          )}

          {/* CSV */}
          {view === 'csv' && (
            <div className="space-y-3">
              <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-64 overflow-y-auto dash-scroll">
                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{csvStr}</pre>
              </div>
              <button
                onClick={() => downloadBlob(csvStr, 'results.csv', 'text/csv')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                <Download size={12} /> Download CSV
              </button>
            </div>
          )}

          {/* Charts */}
          {view === 'chart' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExecutionTimeChart />
              <QueryMethodDonut />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
function AIChat({ workspace }) {
  const [messages, setMessages]  = useState([]);
  const [input, setInput]        = useState('');
  const [loading, setLoading]    = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { id: Date.now(), role: 'user', text };
    const thinkId = Date.now() + 1;
    setMessages(prev => [...prev, userMsg, { id: thinkId, role: 'ai', thinking: true }]);

    await new Promise(r => setTimeout(r, 1100));
    const result = buildChatQuery(text, workspace);

    setMessages(prev => prev.map(m =>
      m.id === thinkId ? { ...m, thinking: false, result } : m
    ));
    setLoading(false);
  };

  const suggestions = workspace?.suggestions?.slice(0, 4) || [
    'Show employees with salary above 50000',
    'Count employees by department',
    'Average salary in Engineering',
    'Top 10 by salary',
  ];

  return (
    <div className="dash-card rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 480 }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric/20 to-cyan-glow/20 border border-cyan-glow/20 flex items-center justify-center">
          <Brain size={16} className="text-cyan-glow" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-white leading-tight">AI Assistant</h2>
          <p className="font-mono text-[10px] text-slate-500">Ask anything about your {workspace?.domain || 'database'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
          <span className="font-mono text-[10px] text-green-400">Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto dash-scroll px-5 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-8">
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
              <Sparkles size={22} className="text-cyan-glow" />
            </motion.div>
            <div className="text-center">
              <p className="font-body text-sm text-slate-300 mb-1 font-medium">What would you like to know?</p>
              <p className="font-mono text-[10px] text-slate-600">I understand natural language — no SQL or MongoDB syntax needed</p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {suggestions.map((s, i) => (
                <motion.button key={i} onClick={() => setInput(s)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  className="text-left px-3.5 py-2 rounded-xl bg-white/3 border border-white/8 hover:border-cyan-glow/25 hover:bg-cyan-glow/4 transition-all group">
                  <span className="font-body text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{s}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end gap-3">
                <div className="max-w-lg bg-blue-electric/15 border border-blue-electric/25 rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="font-body text-sm text-slate-200">{msg.text}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.div
                  animate={msg.thinking ? { rotate: 360 } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-blue-electric/20 border border-cyan-glow/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={13} className="text-cyan-glow" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  {msg.thinking ? (
                    <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2">
                      {[0,1,2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                      ))}
                      <span className="font-mono text-xs text-slate-500 ml-1">Generating query…</span>
                    </div>
                  ) : (
                    <OutputPanel result={msg.result} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEnd} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-white/5">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Ask anything about your ${workspace?.domain || 'database'}…`}
              rows={2} disabled={loading}
              className="dash-input w-full px-4 py-3 rounded-xl text-sm resize-none"
            />
          </div>
          <motion.button onClick={send} disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
              ${loading || !input.trim() ? 'bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed' : 'btn-primary shadow-lg shadow-blue-electric/30'}`}>
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
          </motion.button>
        </div>
        <p className="font-mono text-[9px] text-slate-700 mt-1.5">Enter to send · Shift+Enter new line · Results include Table · JSON · CSV · Charts</p>
      </div>
    </div>
  );
}

// ── Dynamic Workspace Banner ───────────────────────────────────────────────────
function WorkspaceBanner({ workspace }) {
  if (!workspace) return (
    <div className="glass rounded-2xl px-5 py-4 border border-cyan-glow/10 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">Ready</p>
        <h2 className="font-display font-bold text-xl text-white">Welcome to MongoQuery AI</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
        <span className="font-mono text-xs text-green-400">cluster0.mongodb.net · connected</span>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-5 py-4 border border-cyan-glow/15 flex items-center justify-between flex-wrap gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="badge-info px-2.5 py-0.5 rounded-full font-mono text-[9px] flex items-center gap-1.5">
            <Brain size={9} /> AI-ADAPTED
          </div>
          <span className="font-mono text-[10px] text-slate-600">workspace detected</span>
        </div>
        <h2 className="font-display font-bold text-xl text-white">{workspace.domain} Dashboard</h2>
        <p className="font-mono text-[10px] text-slate-500 mt-0.5">
          {workspace.collections.length} collections · {workspace.suggestions.length} AI suggestions ready
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {workspace.collections.slice(0, 3).map(c => (
          <span key={c.name} className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-slate-400">
            {c.icon} {c.name}
          </span>
        ))}
        {workspace.collections.length > 3 && (
          <span className="font-mono text-[10px] text-slate-600">+{workspace.collections.length - 3} more</span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { workspace } = useAuth();

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">

      <WorkspaceBanner workspace={workspace} />
      <StatCards />

      {/* AI Chat (replaces execution logs) */}
      <AIChat workspace={workspace} />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3"><ExecutionTimeChart /></div>
        <div className="xl:col-span-2"><QueryVolumeChart /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QueryMethodDonut />
        <AIAccuracyChart />
        <CollectionUsageChart />
      </div>

    </motion.div>
  );
}
