import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Bot, User, Copy, Check, Download,
  Play, RefreshCw, Sparkles, ChevronRight, ArrowRight,
  Table2, FileJson, FileSpreadsheet, BarChart3,
  Zap, Target, Database, BookOpen, Network, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../store.jsx';
import { ExecutionTimeChart, QueryMethodDonut } from '../components/Charts.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

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

function buildSystemPrompt(workspace) {
  const domain = workspace?.domain || 'general database';
  const colls  = workspace?.collections?.map(c => c.name).join(', ') || 'employees, users, orders';
  return `You are MongoQuery AI, an expert MongoDB query assistant for ${domain} databases.

Available collections: ${colls}

Respond ONLY with raw JSON (no markdown fences):
{
  "explanation": "1-2 sentence plain English answer",
  "query": "exact MongoDB query string",
  "operation": "find|aggregate|countDocuments|insertOne|updateOne|deleteOne",
  "collection": "collectionName",
  "intent": "what operation type this is",
  "confidence": 0.95,
  "entities": [{"type": "Collection|Field|Operator|Value", "value": "name", "color": "#00f5ff"}],
  "rows": [{"field": "value"}, ...],
  "headers": ["field1", "field2"],
  "optimization": "index suggestion",
  "semanticMappings": [{"from": "original word", "to": "resolved term"}],
  "docCount": 42,
  "execTime": 38
}

For entities: Collection=#00f5ff, Field=#4d9eff, Operator=#a855f7, Value=#22c55e
Include 4-6 realistic rows matching the ${domain} domain.`;
}

async function callClaude(messages, systemPrompt) {
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
  return data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
}

// ── Output card ───────────────────────────────────────────────────────────────
function AIOutputCard({ result }) {
  const [view,    setView]    = useState('table');
  const [copied,  setCopied]  = useState(false);
  const [running, setRunning] = useState(false);
  const [executed,setExecuted]= useState(false);

  if (!result) return null;

  if (result.error) return (
    <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl">
      <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
      <p className="font-body text-sm text-red-300">{result.error}</p>
    </div>
  );

  const { explanation, query, operation, confidence, entities = [], rows = [], headers = [], optimization, semanticMappings = [], docCount, execTime } = result;
  const jsonStr = JSON.stringify(rows, null, 2);
  const csvStr  = toCSV(rows, headers);

  const copy = () => { navigator.clipboard.writeText(query || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const execute = async () => { setRunning(true); await new Promise(r => setTimeout(r, 900)); setRunning(false); setExecuted(true); };

  return (
    <div className="space-y-3">
      {/* Explanation */}
      <div className="dash-card rounded-2xl px-4 py-3">
        <p className="font-body text-sm text-slate-200 leading-relaxed">{explanation}</p>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {operation && <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500"><Target size={9} className="text-cyan-glow" />{operation}</span>}
          {confidence && <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400"><BarChart3 size={9} />{(confidence * 100).toFixed(0)}%</span>}
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500"><Zap size={9} />{execTime}ms · {docCount} docs</span>
        </div>
      </div>

      {/* Generated query */}
      <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 flex-wrap gap-y-2">
          <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
          <span className="font-mono text-[10px] text-cyan-glow">Generated Query</span>
          <div className="ml-auto flex gap-3">
            <button onClick={copy} className="font-mono text-[10px] text-slate-500 hover:text-cyan-glow flex items-center gap-1 transition-colors">
              {copied ? <><Check size={9} className="text-green-400" />Copied</> : <><Copy size={9} />Copy</>}
            </button>
            <button onClick={execute} disabled={running} className="font-mono text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 disabled:opacity-50 transition-colors">
              {running ? <><RefreshCw size={9} className="animate-spin" />Running…</> : <><Play size={9} />Execute</>}
            </button>
          </div>
        </div>
        <pre className="px-4 py-3 font-mono text-sm text-green-300 overflow-x-auto dash-scroll whitespace-pre-wrap">{query}</pre>
      </div>

      <AnimatePresence>
        {executed && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="badge-success px-4 py-2 rounded-xl font-mono text-xs flex items-center gap-2">
            <Check size={11} />Executed · {docCount} docs · {execTime}ms
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

      {/* Entity chips */}
      {entities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entities.map((e, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-white/3 border border-white/8 px-2.5 py-1 rounded-lg font-mono text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
              <span className="text-slate-500">{e.type}:</span>
              <span className="text-slate-200">{e.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Semantic mappings */}
      {semanticMappings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] text-slate-600">Resolved:</span>
          {semanticMappings.map((m, i) => (
            <span key={i} className="font-mono text-[9px] bg-white/3 border border-white/5 px-2 py-0.5 rounded-md">
              <span className="text-slate-500">"{m.from}"</span>
              <span className="text-slate-600 mx-1">→</span>
              <span className="text-cyan-glow">{m.to}</span>
            </span>
          ))}
        </div>
      )}

      {/* Output formats */}
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
                  <thead><tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <motion.tr key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="border-t border-white/4 hover:bg-white/2 transition-colors">
                        {headers.map(h => (
                          <td key={h} className="px-4 py-2 font-mono text-slate-300 whitespace-nowrap">
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
                <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-52 overflow-y-auto dash-scroll">
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
                <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-52 overflow-y-auto dash-scroll">
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
    </div>
  );
}

// ── Main AI Engine Page ───────────────────────────────────────────────────────
export default function AIEnginePage() {
  const { workspace } = useAuth();
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [processing,  setProcessing]  = useState(false);
  const [apiHistory,  setApiHistory]  = useState([]);
  const [mobileInfo,  setMobileInfo]  = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const examples = workspace?.suggestions || [
    'Show employees with salary above 50000',
    'Count customers from Hyderabad',
    'Find total sales by category',
    'Get top 10 users by revenue this month',
    'Average salary in Engineering',
    'Show all active orders sorted by date',
  ];

  const send = async () => {
    const text = input.trim();
    if (!text || processing) return;
    setInput('');
    setProcessing(true);

    const thinkId = Date.now() + 1;
    setMessages(prev => [...prev,
      { id: Date.now(), role: 'user', text },
      { id: thinkId, role: 'ai', thinking: true },
    ]);

    const newHistory = [...apiHistory, { role: 'user', content: text }];

    try {
      const rawText = await callClaude(newHistory, buildSystemPrompt(workspace));
      let result;
      try {
        const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(clean);
      } catch {
        result = { explanation: rawText.slice(0, 300), query: '', rows: [], headers: [], docCount: 0, execTime: 0, error: null };
      }
      setApiHistory([...newHistory, { role: 'assistant', content: rawText }]);
      setMessages(prev => prev.map(m => m.id === thinkId ? { ...m, thinking: false, result } : m));
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === thinkId ? { ...m, thinking: false, result: { error: err.message } } : m
      ));
    }
    setProcessing(false);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-5 sm:space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
          <Brain size={11} className="text-cyan-glow" />
          <span className="font-mono text-[10px] tracking-widest">AI ENGINE · CLAUDE-POWERED</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl text-white">AI Query Engine</h1>
        <p className="font-body text-sm text-slate-400 mt-1">
          Natural language → MongoDB · Conversational memory · All output formats
          {workspace && <span className="text-cyan-glow ml-2">· {workspace.domain}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Chat panel */}
        <div className="lg:col-span-2">
          <div className="dash-card rounded-2xl flex flex-col" style={{ minHeight: 500 }}>
            <div className="px-4 sm:px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <Brain size={15} className="text-cyan-glow" />
              <span className="font-display font-bold text-sm text-white">Conversational Builder</span>
              {apiHistory.length > 0 && (
                <div className="ml-auto flex items-center gap-1.5 badge-info px-2 py-0.5 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                  <span className="font-mono text-[9px]">{apiHistory.length / 2} turns</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto dash-scroll px-4 sm:px-5 py-4 space-y-5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
                    <Sparkles size={22} className="text-cyan-glow" />
                  </motion.div>
                  <p className="font-body text-sm text-slate-400 text-center">Start with a natural language query</p>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.role === 'user' ? (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-[85%] sm:max-w-md bg-blue-electric/15 border border-blue-electric/25 rounded-2xl rounded-tr-sm px-4 py-3">
                        <p className="font-body text-sm text-slate-200">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <motion.div animate={msg.thinking ? { rotate: 360 } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-blue-electric/20 border border-cyan-glow/30 flex items-center justify-center flex-shrink-0">
                        <Bot size={13} className="text-cyan-glow" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        {msg.thinking ? (
                          <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2">
                            {[0, 1, 2].map(i => (
                              <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                            ))}
                            <span className="font-mono text-xs text-slate-500 ml-1">Claude is thinking…</span>
                          </div>
                        ) : (
                          <AIOutputCard result={msg.result} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-white/5">
              <div className="flex gap-3 items-end">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask in plain English…"
                  rows={2} disabled={processing}
                  className="dash-input w-full px-4 py-3 rounded-xl text-sm resize-none flex-1" />
                <motion.button onClick={send} disabled={processing || !input.trim()}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${processing || !input.trim() ? 'bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed' : 'btn-primary shadow-lg shadow-blue-electric/30'}`}>
                  {processing ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                </motion.button>
              </div>
              <p className="font-mono text-[9px] text-slate-700 mt-1.5">Enter · Shift+Enter for newline · Context remembered across turns</p>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Examples */}
          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={13} className="text-cyan-glow" />
              <span className="font-display font-bold text-xs text-white">Example Queries</span>
            </div>
            <div className="space-y-1.5">
              {examples.map((ex, i) => (
                <motion.button key={i} onClick={() => setInput(ex)} whileHover={{ x: 3 }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-cyan-glow/20 hover:bg-cyan-glow/3 transition-all group">
                  <div className="flex items-start gap-2">
                    <ChevronRight size={11} className="text-cyan-glow/50 group-hover:text-cyan-glow mt-0.5 flex-shrink-0 transition-colors" />
                    <span className="font-body text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">{ex}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Semantic map */}
          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Network size={13} className="text-cyan-glow" />
              <span className="font-display font-bold text-xs text-white">Claude understands</span>
            </div>
            <div className="space-y-1.5">
              {[
                { from: '"income"',   to: 'salary'           },
                { from: '"staff"',    to: 'employees'        },
                { from: '"city"',     to: 'location'         },
                { from: '"above"',    to: '$gt'              },
                { from: '"how many"', to: 'countDocuments'   },
                { from: '"total"',    to: 'aggregate ($sum)' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-slate-500">{m.from}</span>
                  <ArrowRight size={9} className="text-cyan-glow/40 flex-shrink-0" />
                  <span className="text-cyan-glow">{m.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace collections */}
          {workspace && (
            <div className="dash-card rounded-2xl p-4 border border-cyan-glow/10">
              <div className="flex items-center gap-2 mb-3">
                <Database size={13} className="text-cyan-glow" />
                <span className="font-display font-bold text-xs text-white">{workspace.domain}</span>
              </div>
              <div className="space-y-1.5">
                {workspace.collections.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-[10px] font-mono">
                    <span>{c.icon}</span>
                    <span className="text-cyan-glow">{c.name}</span>
                    <span className="ml-auto text-slate-600">{c.docs}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
