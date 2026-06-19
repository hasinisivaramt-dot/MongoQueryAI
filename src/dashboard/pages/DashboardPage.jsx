import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, Copy, Check, Download,
  Table2, FileJson, FileSpreadsheet, BarChart3, RefreshCw,
  Brain, Zap, Database, AlertCircle, X,
} from 'lucide-react';
import { useAuth } from '../store.jsx';
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

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function ChartSkeleton() {
  return (
    <div className="dash-card rounded-2xl p-5 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[180px] w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toCSV(rows, headers) {
  if (!rows?.length || !headers?.length) return '';
  return [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Parse Anthropic streaming response ───────────────────────────────────────
async function callClaude(messages, systemPrompt, onChunk) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  onChunk(text);
  return text;
}

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(workspace) {
  const domain = workspace?.domain || 'general database';
  const colls  = workspace?.collections?.map(c => c.name).join(', ') || 'employees, users, orders';
  return `You are MongoQuery AI, an expert MongoDB assistant specialized in ${domain} databases.

Available collections: ${colls}

When the user asks a natural language question:
1. Give a SHORT plain-English answer (1-2 sentences max)
2. Generate the exact MongoDB query
3. Show sample results as a JSON array (4-6 realistic rows matching the domain)
4. Give one optimization tip

ALWAYS respond in this EXACT JSON format (no markdown fences, raw JSON only):
{
  "explanation": "plain English answer here",
  "query": "db.collection.find({...})",
  "operation": "find|aggregate|countDocuments|insertOne|updateOne|deleteOne",
  "collection": "collectionName",
  "rows": [{"field": "value"}, ...],
  "headers": ["field1", "field2", ...],
  "optimization": "Index tip here",
  "docCount": 42,
  "execTime": 38
}

Keep rows realistic for ${domain}. Headers must match row keys exactly.`;
}

// ── Output card ───────────────────────────────────────────────────────────────
function OutputCard({ msg }) {
  const [view,    setView]    = useState('table');
  const [copied,  setCopied]  = useState(false);
  const [running, setRunning] = useState(false);
  const [executed,setExecuted]= useState(false);

  if (!msg.result) return null;
  const { explanation, query, rows = [], headers = [], optimization, docCount, execTime, error } = msg.result;

  if (error) return (
    <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl">
      <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
      <p className="font-body text-sm text-red-300">{error}</p>
    </div>
  );

  const jsonStr = JSON.stringify(rows, null, 2);
  const csvStr  = toCSV(rows, headers);

  const copy = () => { navigator.clipboard.writeText(query || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const execute = async () => { setRunning(true); await new Promise(r => setTimeout(r, 800)); setRunning(false); setExecuted(true); };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* NL explanation */}
      <div className="dash-card rounded-2xl px-4 py-3">
        <p className="font-body text-sm text-slate-200 leading-relaxed">{explanation}</p>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <span className="flex items-center gap-1 font-mono text-[10px] text-green-400"><Zap size={9} />{docCount} docs</span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500"><RefreshCw size={9} />{execTime}ms</span>
        </div>
      </div>

      {/* Query block */}
      <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 flex-wrap gap-y-2">
          <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
          <span className="font-mono text-[10px] text-cyan-glow">Generated Query</span>
          <div className="ml-auto flex gap-3">
            <button onClick={copy} className="font-mono text-[10px] text-slate-500 hover:text-cyan-glow flex items-center gap-1 transition-colors">
              {copied ? <><Check size={9} className="text-green-400" />Copied</> : <><Copy size={9} />Copy</>}
            </button>
            <button onClick={execute} disabled={running} className="font-mono text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 disabled:opacity-50 transition-colors">
              {running ? <><RefreshCw size={9} className="animate-spin" />Running…</> : <><Zap size={9} />Execute</>}
            </button>
          </div>
        </div>
        <pre className="px-4 py-3 font-mono text-sm text-green-300 overflow-x-auto dash-scroll whitespace-pre-wrap">{query}</pre>
      </div>

      <AnimatePresence>
        {executed && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="badge-success px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2">
            <Check size={11} />Executed · {docCount} documents · {execTime}ms
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization */}
      {optimization && (
        <div className="flex items-start gap-2 px-3 py-2 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
          <Zap size={10} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="font-mono text-[10px] text-yellow-400/80 leading-relaxed">{optimization}</p>
        </div>
      )}

      {/* Output format tabs */}
      {rows.length > 0 && (
        <div className="dash-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 flex-wrap gap-y-2">
            {[
              { id: 'table', icon: Table2,         label: 'Table'  },
              { id: 'json',  icon: FileJson,        label: 'JSON'   },
              { id: 'csv',   icon: FileSpreadsheet, label: 'CSV'    },
              { id: 'chart', icon: BarChart3,       label: 'Charts' },
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
            {view === 'table' && (
              <div className="overflow-x-auto dash-scroll -mx-1">
                <table className="w-full dash-table text-xs min-w-[400px]">
                  <thead><tr>{headers.map(h => <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <motion.tr key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="border-t border-white/4 hover:bg-white/2 transition-colors">
                        {headers.map(h => (
                          <td key={h} className="px-4 py-2.5 font-mono text-slate-300 whitespace-nowrap">
                            {typeof row[h] === 'number' && /salary|price|amount|total|revenue|cost/i.test(h)
                              ? `₹${Number(row[h]).toLocaleString()}` : String(row[h] ?? '—')}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {view === 'json' && (
              <div className="space-y-3">
                <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-56 overflow-y-auto dash-scroll">
                  <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap">{jsonStr}</pre>
                </div>
                <button onClick={() => downloadBlob(jsonStr, 'results.json', 'application/json')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                  <Download size={12} />Download JSON
                </button>
              </div>
            )}
            {view === 'csv' && (
              <div className="space-y-3">
                <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-56 overflow-y-auto dash-scroll">
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{csvStr}</pre>
                </div>
                <button onClick={() => downloadBlob(csvStr, 'results.csv', 'text/csv')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                  <Download size={12} />Download CSV
                </button>
              </div>
            )}
            {view === 'chart' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ExecutionTimeChart /><QueryMethodDonut />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
function AIChat({ workspace }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [history,   setHistory]   = useState([]); // for multi-turn context
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const suggestions = workspace?.suggestions?.slice(0, 4) || [
    'Show employees with salary above 50000',
    'Count records by department',
    'Average salary in Engineering',
    'Top 10 by value',
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { id: Date.now(), role: 'user', text };
    const thinkId = Date.now() + 1;
    setMessages(prev => [...prev, userMsg, { id: thinkId, role: 'ai', thinking: true }]);

    // Build conversation history for Claude
    const newHistory = [...history, { role: 'user', content: text }];

    try {
      let rawText = '';
      await callClaude(newHistory, buildSystemPrompt(workspace), (chunk) => { rawText = chunk; });

      // Parse JSON response
      let result;
      try {
        // Strip any accidental markdown fences
        const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(clean);
      } catch {
        // If JSON parse fails, extract what we can
        result = {
          explanation: rawText.slice(0, 200),
          query: 'db.collection.find({})',
          rows: [], headers: [],
          docCount: 0, execTime: 0,
          optimization: '',
        };
      }

      // Update conversation history
      setHistory([...newHistory, { role: 'assistant', content: rawText }]);

      setMessages(prev => prev.map(m =>
        m.id === thinkId ? { ...m, thinking: false, result } : m
      ));
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === thinkId ? { ...m, thinking: false, result: { error: `Failed to generate query: ${err.message}` } } : m
      ));
    }
    setLoading(false);
  };

  return (
    <div className="dash-card rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 480 }}>
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric/20 to-cyan-glow/20 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0">
          <Brain size={16} className="text-cyan-glow" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base text-white leading-tight">AI Assistant</h2>
          <p className="font-mono text-[10px] text-slate-500 truncate">Ask anything about your {workspace?.domain || 'database'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
          <span className="font-mono text-[10px] text-green-400 hidden sm:block">Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto dash-scroll px-4 sm:px-5 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-6">
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
              <Sparkles size={22} className="text-cyan-glow" />
            </motion.div>
            <div className="text-center px-4">
              <p className="font-body text-sm text-slate-300 mb-1 font-medium">What would you like to know?</p>
              <p className="font-mono text-[10px] text-slate-600">Powered by Claude · understands natural language</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <motion.button key={i} onClick={() => setInput(s)}
                  whileHover={{ scale: 1.02 }}
                  className="text-left px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/8 hover:border-cyan-glow/25 hover:bg-cyan-glow/4 transition-all group">
                  <span className="font-body text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">{s}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === 'user' ? (
              <div className="flex justify-end gap-3">
                <div className="max-w-[85%] sm:max-w-lg bg-blue-electric/15 border border-blue-electric/25 rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="font-body text-sm text-slate-200">{msg.text}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.div animate={msg.thinking ? { rotate: 360 } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-blue-electric/20 border border-cyan-glow/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={13} className="text-cyan-glow" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  {msg.thinking ? (
                    <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                      ))}
                      <span className="font-mono text-xs text-slate-500 ml-1">Generating…</span>
                    </div>
                  ) : (
                    <OutputCard msg={msg} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEnd} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-5 py-4 border-t border-white/5">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Ask anything about your ${workspace?.domain || 'database'}…`}
              rows={2} disabled={loading}
              className="dash-input w-full px-4 py-3 rounded-xl text-sm resize-none" />
          </div>
          <motion.button onClick={send} disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
              ${loading || !input.trim() ? 'bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed' : 'btn-primary shadow-lg shadow-blue-electric/30'}`}>
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
          </motion.button>
        </div>
        <p className="font-mono text-[9px] text-slate-700 mt-1.5">Enter to send · Shift+Enter for new line · Powered by Claude AI</p>
      </div>
    </div>
  );
}

// ── Workspace Banner ──────────────────────────────────────────────────────────
function WorkspaceBanner({ workspace }) {
  if (!workspace) return (
    <div className="glass rounded-2xl px-4 sm:px-5 py-4 border border-cyan-glow/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">Ready</p>
        <h2 className="font-display font-bold text-lg sm:text-xl text-white">Welcome to MongoQuery AI</h2>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
        <span className="font-mono text-xs text-green-400">cluster0.mongodb.net · connected</span>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl px-4 sm:px-5 py-4 border border-cyan-glow/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="badge-info px-2.5 py-0.5 rounded-full font-mono text-[9px] flex items-center gap-1.5">
            <Brain size={9} />AI-ADAPTED
          </div>
          <span className="font-mono text-[10px] text-slate-600">workspace detected</span>
        </div>
        <h2 className="font-display font-bold text-lg sm:text-xl text-white">{workspace.domain} Dashboard</h2>
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
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { workspace } = useAuth();
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartsLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-5 sm:space-y-6">
      <WorkspaceBanner workspace={workspace} />
      <StatCards />
      <AIChat workspace={workspace} />

      {/* Charts with skeleton */}
      {chartsLoaded ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6">
            <div className="xl:col-span-3"><ExecutionTimeChart /></div>
            <div className="xl:col-span-2"><QueryVolumeChart /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <QueryMethodDonut />
            <AIAccuracyChart />
            <div className="sm:col-span-2 lg:col-span-1"><CollectionUsageChart /></div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 sm:gap-6">
            <div className="xl:col-span-3"><ChartSkeleton /></div>
            <div className="xl:col-span-2"><ChartSkeleton /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
          </div>
        </>
      )}
    </motion.div>
  );
}
