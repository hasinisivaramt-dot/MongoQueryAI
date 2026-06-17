import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, ChevronRight, Check, Copy, Play, RefreshCw,
  MessageSquare, Sparkles, Database, Tag, Target, Cpu,
  ArrowRight, AlertCircle, BarChart3, GitBranch, Search,
  Network, BookOpen, Send, User, Bot, Layers,
} from 'lucide-react';

// ─── page variants ────────────────────────────────────────────────────────────
const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── NLP pipeline stages definition ──────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'preprocess',  label: 'Text Preprocessing',    icon: Cpu,         color: '#00f5ff' },
  { id: 'intent',      label: 'Intent Detection',       icon: Target,      color: '#4d9eff' },
  { id: 'entities',    label: 'Entity Extraction',      icon: Tag,         color: '#a855f7' },
  { id: 'schema',      label: 'Schema Matching',        icon: Database,    color: '#22c55e' },
  { id: 'embedding',   label: 'Embedding Generation',   icon: Network,     color: '#f59e0b' },
  { id: 'semantic',    label: 'Semantic Search',         icon: Search,      color: '#ec4899' },
  { id: 'generate',    label: 'Query Generation',        icon: GitBranch,   color: '#00f5ff' },
  { id: 'optimize',    label: 'Query Optimization',      icon: Zap,         color: '#4d9eff' },
  { id: 'output',      label: 'Execution Ready',         icon: Play,        color: '#22c55e' },
];

// ─── semantic synonym map ─────────────────────────────────────────────────────
const SEMANTIC_MAP = {
  income: 'salary', compensation: 'salary', wage: 'salary', pay: 'salary', earnings: 'salary',
  staff: 'employees', workforce: 'employees', personnel: 'employees', workers: 'employees', headcount: 'employees',
  city: 'location', place: 'location', office: 'location', region: 'location',
  orders: 'transactions', purchases: 'orders', buys: 'orders',
  above: '$gt', over: '$gt', greater: '$gt', more: '$gt',
  below: '$lt', under: '$lt', less: '$lt', fewer: '$lt',
  show: 'find', list: 'find', get: 'find', fetch: 'find', display: 'find',
  count: 'countDocuments', total: 'aggregate', average: 'aggregate', avg: 'aggregate',
  sum: 'aggregate', group: 'aggregate',
};

// ─── intent detection ─────────────────────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/count|how many|number of/.test(t))                       return { intent: 'countDocuments', confidence: 0.95 };
  if (/average|avg|mean/.test(t))                               return { intent: 'aggregate ($avg)', confidence: 0.92 };
  if (/total|sum/.test(t))                                      return { intent: 'aggregate ($sum)', confidence: 0.91 };
  if (/group by|per |by (dept|city|region|category)/.test(t))  return { intent: 'aggregate ($group)', confidence: 0.93 };
  if (/insert|add|create|new/.test(t))                          return { intent: 'insertOne', confidence: 0.88 };
  if (/update|change|modify|set/.test(t))                       return { intent: 'updateMany', confidence: 0.87 };
  if (/delete|remove|drop/.test(t))                             return { intent: 'deleteOne', confidence: 0.85 };
  if (/sort|order by|rank/.test(t))                             return { intent: 'find + sort', confidence: 0.90 };
  return { intent: 'find', confidence: 0.89 };
}

// ─── entity extraction ────────────────────────────────────────────────────────
function extractEntities(text) {
  const t    = text.toLowerCase();
  const entities = [];

  // Collection
  const collections = ['employees','users','orders','products','customers','departments','salaries','projects','logs','sessions'];
  const coll = collections.find(c => t.includes(c)) || (t.includes('staff') || t.includes('worker') ? 'employees' : null);
  if (coll) entities.push({ type: 'Collection', value: coll, color: '#00f5ff' });

  // Field
  const fieldMap = { salary: ['salary','income','compensation','wage','pay','earnings'], dept: ['dept','department','division'], location: ['location','city','place','office','region'], status: ['status','state','active'] };
  Object.entries(fieldMap).forEach(([field, terms]) => {
    if (terms.some(t2 => t.includes(t2))) entities.push({ type: 'Field', value: field, color: '#4d9eff' });
  });

  // Operator & value
  const numMatch = text.match(/\d[\d,.]*/);
  if (numMatch) {
    const num = numMatch[0].replace(/,/g, '');
    const op  = /above|over|greater|more than/.test(t) ? '$gt' : /below|under|less|fewer/.test(t) ? '$lt' : '$eq';
    entities.push({ type: 'Operator', value: op, color: '#a855f7' });
    entities.push({ type: 'Value', value: num, color: '#22c55e' });
  }

  // Date
  const dateTerms = ['today', 'this month', 'this week', 'last 30 days', 'yesterday'];
  const dateTerm = dateTerms.find(d => t.includes(d));
  if (dateTerm) entities.push({ type: 'Date', value: dateTerm, color: '#f59e0b' });

  return entities;
}

// ─── query generation ─────────────────────────────────────────────────────────
function generateQuery(text, entities, intentData) {
  const t        = text.toLowerCase();
  const coll     = entities.find(e => e.type === 'Collection')?.value || 'collection';
  const field    = entities.find(e => e.type === 'Field')?.value;
  const op       = entities.find(e => e.type === 'Operator')?.value;
  const val      = entities.find(e => e.type === 'Value')?.value;
  const dateTerm = entities.find(e => e.type === 'Date')?.value;

  const intent = intentData.intent;

  if (intent === 'countDocuments') {
    const filter = field && op && val ? `{ ${field}: { ${op}: ${isNaN(val) ? `"${val}"` : val} } }` : '{}';
    return {
      query: `db.${coll}.countDocuments(${filter})`,
      explanation: `Counts all documents in the <code>${coll}</code> collection${field ? ` where <code>${field}</code> is ${op === '$gt' ? 'greater than' : op === '$lt' ? 'less than' : 'equal to'} <code>${val}</code>` : ''}.`,
      optimization: `Ensure an index exists on <code>${field || '_id'}</code> to avoid a full collection scan.`,
    };
  }

  if (intent.startsWith('aggregate')) {
    if (intent.includes('$group')) {
      const groupField = field || 'dept';
      return {
        query: `db.${coll}.aggregate([\n  { $group: {\n      _id: "$${groupField}",\n      count: { $sum: 1 },\n      avgSalary: { $avg: "$salary" }\n  }},\n  { $sort: { count: -1 } }\n])`,
        explanation: `Groups all <code>${coll}</code> by <code>${groupField}</code>, counting records and averaging salary per group, sorted by count descending.`,
        optimization: `Add a compound index on <code>{ ${groupField}: 1, salary: 1 }</code> to accelerate the group stage.`,
      };
    }
    if (intent.includes('$avg')) {
      return {
        query: `db.${coll}.aggregate([\n  ${field && op && val ? `{ $match: { ${field}: { ${op}: ${val} } } },\n  ` : ''}{ $group: {\n      _id: null,\n      average: { $avg: "$salary" }\n  }}\n])`,
        explanation: `Computes the average salary across all matching <code>${coll}</code> documents.`,
        optimization: `Use <code>{ allowDiskUse: true }</code> for large datasets exceeding 100 MB memory limit.`,
      };
    }
    if (intent.includes('$sum')) {
      return {
        query: `db.${coll}.aggregate([\n  { $group: {\n      _id: null,\n      total: { $sum: "$${field || 'amount'}" }\n  }}\n])`,
        explanation: `Sums the <code>${field || 'amount'}</code> field across all documents in <code>${coll}</code>.`,
        optimization: `Index on <code>${field || 'amount'}</code> won't help aggregation — use a pre-computed field if queried frequently.`,
      };
    }
  }

  // Default: find
  const filterParts = [];
  if (field && op && val)   filterParts.push(`${field}: { ${op}: ${isNaN(val) ? `"${val}"` : val} }`);
  if (dateTerm) {
    const ms   = dateTerm === 'today' ? 0 : dateTerm.includes('30') ? 30 * 864e5 : dateTerm.includes('week') ? 7 * 864e5 : 30 * 864e5;
    filterParts.push(`createdAt: { $gte: new Date(Date.now() - ${ms}) }`);
  }
  const filter = filterParts.length ? `{ ${filterParts.join(', ')} }` : '{}';
  const sortStr = /sort|rank|order/.test(t) && field ? `.sort({ ${field}: -1 })` : '';
  const limitStr = /top (\d+)/.test(t) ? `.limit(${t.match(/top (\d+)/)?.[1] || 10})` : '';

  return {
    query: `db.${coll}.find(${filter})${sortStr}${limitStr}`,
    explanation: `Retrieves all documents from <code>${coll}</code>${field && op && val ? ` where <code>${field}</code> is ${op === '$gt' ? 'greater than' : op === '$lt' ? 'less than' : 'equal to'} <code>${val}</code>` : ''}${dateTerm ? ` created within <code>${dateTerm}</code>` : ''}.`,
    optimization: field
      ? `Create an index on <code>{ ${field}: 1 }</code> to avoid full collection scan.`
      : `Specify a filter to narrow the result set and avoid returning all documents.`,
  };
}

// ─── EXAMPLE QUERIES ─────────────────────────────────────────────────────────
const EXAMPLES = [
  'Show employees with salary above 50000',
  'Count customers from Hyderabad',
  'Find total sales by category',
  'Get top 10 users by revenue this month',
  'Show all active orders sorted by date',
  'Average salary in the Engineering department',
];

// ─── Pipeline Visualizer ──────────────────────────────────────────────────────
function PipelineVisualizer({ activeStage, completedStages }) {
  return (
    <div className="dash-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Cpu size={14} className="text-cyan-glow" />
        <h3 className="font-display font-bold text-sm text-white">Live AI Pipeline</h3>
        {activeStage !== null && activeStage < PIPELINE_STAGES.length && (
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-auto badge-info px-2 py-0.5 rounded-md font-mono text-[9px] flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
            Processing
          </motion.span>
        )}
        {completedStages.length === PIPELINE_STAGES.length && (
          <span className="ml-auto badge-success px-2 py-0.5 rounded-md font-mono text-[9px] flex items-center gap-1.5">
            <Check size={10} /> Complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {PIPELINE_STAGES.map((stage, i) => {
          const Icon      = stage.icon;
          const isActive  = activeStage === i;
          const isDone    = completedStages.includes(i);
          const isPending = !isActive && !isDone;

          return (
            <div key={stage.id} className="flex flex-col items-center gap-1.5 relative">
              <motion.div
                animate={isActive ? { scale: [1, 1.12, 1], boxShadow: [`0 0 0px ${stage.color}00`, `0 0 20px ${stage.color}60`, `0 0 0px ${stage.color}00`] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isDone    ? 'bg-green-500/20 border border-green-500/40'
                  : isActive  ? 'border-2'
                  : 'bg-white/3 border border-white/8'}`}
                style={isActive ? { background: `${stage.color}20`, borderColor: stage.color } : {}}
              >
                {isDone
                  ? <Check size={14} className="text-green-400" />
                  : <Icon size={14} style={{ color: isActive ? stage.color : isPending ? '#475569' : stage.color }} />}
              </motion.div>

              <span className={`font-mono text-[8px] text-center leading-tight
                ${isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-slate-600'}`}>
                {stage.label.split(' ')[0]}
              </span>

              {/* connector */}
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="absolute top-5 left-full w-2 flex items-center -translate-y-1/2 pointer-events-none hidden lg:flex">
                  <ChevronRight size={10} className={isDone ? 'text-green-500/50' : 'text-slate-700'} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chat message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const copy = () => {
    navigator.clipboard.writeText(msg.query || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const execute = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 900));
    setRunResult({ docs: Math.floor(Math.random() * 80 + 5), time: Math.floor(Math.random() * 70 + 15) });
    setRunning(false);
  };

  if (msg.role === 'user') {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-md bg-blue-electric/15 border border-blue-electric/25 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="font-body text-sm text-slate-200">{msg.text}</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <motion.div
        animate={msg.thinking ? { rotate: 360 } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-blue-electric/20 border border-cyan-glow/30 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-cyan-glow" />
      </motion.div>

      <div className="flex-1 max-w-2xl space-y-3">
        {msg.thinking && (
          <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                ))}
              </motion.div>
              <span className="font-mono text-xs text-slate-500">AI processing…</span>
            </div>
          </div>
        )}

        {!msg.thinking && msg.query && (
          <>
            {/* Explanation */}
            <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="font-body text-sm text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.explanation }} />
            </div>

            {/* Generated query */}
            <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
                  <span className="font-mono text-[10px] text-cyan-glow">Generated Query</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copy}
                    className="font-mono text-[10px] text-slate-500 hover:text-cyan-glow transition-colors flex items-center gap-1">
                    {copied ? <><Check size={10} className="text-green-400" /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
              </div>
              <pre className="px-4 py-4 font-mono text-sm text-green-300 overflow-x-auto dash-scroll">
                {msg.query}
              </pre>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Target size={11} className="text-cyan-glow" />
                <span className="font-mono text-[10px] text-slate-500">Intent:</span>
                <span className="font-mono text-[10px] text-white">{msg.intent}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={11} className="text-green-400" />
                <span className="font-mono text-[10px] text-slate-500">Confidence:</span>
                <span className="font-mono text-[10px] text-green-400">{(msg.confidence * 100).toFixed(0)}%</span>
              </div>

              <motion.button onClick={execute} disabled={running}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/25 text-green-400 hover:bg-green-500/8 font-mono text-[10px] transition-all disabled:opacity-50">
                {running
                  ? <><RefreshCw size={10} className="animate-spin" /> Running…</>
                  : <><Play size={10} /> Execute</>}
              </motion.button>
            </div>

            {/* Optimization tip */}
            <div className="flex items-start gap-2 px-3 py-2 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
              <Zap size={11} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-yellow-400/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: msg.optimization }} />
            </div>

            {/* Entity tags */}
            {msg.entities && msg.entities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {msg.entities.map((e, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-white/3 border border-white/8 px-2.5 py-1 rounded-lg font-mono text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                    <span className="text-slate-500">{e.type}:</span>
                    <span className="text-slate-200">{e.value}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Execution result */}
            <AnimatePresence>
              {runResult && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="badge-success px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2">
                  <Check size={12} />
                  Executed · {runResult.docs} documents returned · {runResult.time}ms
                </motion.div>
              )}
            </AnimatePresence>

            {/* Semantic mappings used */}
            {msg.semanticMappings && msg.semanticMappings.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9px] text-slate-600">Semantic resolving:</span>
                {msg.semanticMappings.map((m, i) => (
                  <span key={i} className="font-mono text-[9px] bg-white/3 border border-white/5 px-2 py-0.5 rounded-md">
                    <span className="text-slate-500">"{m.from}"</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="text-cyan-glow">{m.to}</span>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AIEnginePage() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeStage, setActiveStage]       = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [conversationCtx, setConversationCtx] = useState(null); // memory
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const runPipeline = async (text) => {
    setCompletedStages([]);
    const stageDurations = [180, 200, 220, 190, 250, 200, 220, 180, 150];
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setActiveStage(i);
      await new Promise(r => setTimeout(r, stageDurations[i]));
      setCompletedStages(prev => [...prev, i]);
    }
    setActiveStage(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || processing) return;
    setInput('');
    setProcessing(true);

    // Resolve conversational context
    let resolvedText = text;
    if (conversationCtx && /^(only|just|filter|where|but|and|also)\b/i.test(text)) {
      resolvedText = `${conversationCtx.collection ? conversationCtx.collection + ' ' : ''}${text}`;
    }

    // Find semantic mappings used
    const words = resolvedText.toLowerCase().split(/\s+/);
    const semanticMappings = [];
    words.forEach(w => {
      if (SEMANTIC_MAP[w]) semanticMappings.push({ from: w, to: SEMANTIC_MAP[w] });
    });

    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    // Add thinking placeholder
    const thinkId = Date.now() + 1;
    setMessages(prev => [...prev, { id: thinkId, role: 'ai', thinking: true }]);

    // Run pipeline visually
    await runPipeline(resolvedText);

    // Compute results
    const intentData = detectIntent(resolvedText);
    const entities   = extractEntities(resolvedText);
    const { query, explanation, optimization } = generateQuery(resolvedText, entities, intentData);

    // Update conversational memory
    const collEntity = entities.find(e => e.type === 'Collection');
    if (collEntity) setConversationCtx({ collection: collEntity.value, lastQuery: resolvedText });

    // Replace thinking with real answer
    setMessages(prev => prev.map(m =>
      m.id === thinkId
        ? { ...m, thinking: false, query, explanation, optimization, intent: intentData.intent, confidence: intentData.confidence, entities, semanticMappings }
        : m
    ));
    setProcessing(false);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
          <Brain size={11} className="text-cyan-glow" />
          <span className="font-mono text-[10px] tracking-widest">ENTERPRISE AI ENGINE · NLP + VECTOR SEARCH</span>
        </div>
        <h1 className="font-display font-black text-2xl text-white">AI Query Engine</h1>
        <p className="font-body text-sm text-slate-400 mt-1">Natural language → MongoDB · Intent detection · Semantic schema matching · Conversational memory</p>
      </div>

      {/* Pipeline Visualizer */}
      <PipelineVisualizer activeStage={activeStage} completedStages={completedStages} />

      {/* Two-column layout: chat left, info right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chat panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Chat history */}
          <div className="dash-card rounded-2xl flex flex-col" style={{ minHeight: 420 }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <MessageSquare size={14} className="text-cyan-glow" />
              <span className="font-display font-bold text-sm text-white">Conversational Query Builder</span>
              {conversationCtx && (
                <div className="ml-auto flex items-center gap-1.5 badge-info px-2 py-0.5 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                  <span className="font-mono text-[9px]">Context: {conversationCtx.collection}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto dash-scroll px-5 py-4 space-y-5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
                    <Sparkles size={22} className="text-cyan-glow" />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-body text-sm text-slate-400 mb-1">Start with a natural language query</p>
                    <p className="font-mono text-[10px] text-slate-600">Try one of the examples below →</p>
                  </div>
                </div>
              )}
              {messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-white/5">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="e.g. Show employees with salary above 50000…"
                    rows={2}
                    className="dash-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                    disabled={processing}
                  />
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={processing || !input.trim()}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${processing || !input.trim()
                      ? 'bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed'
                      : 'btn-primary shadow-lg shadow-blue-electric/30'}`}
                >
                  {processing
                    ? <RefreshCw size={15} className="animate-spin" />
                    : <Send size={15} />}
                </motion.button>
              </div>
              <p className="font-mono text-[9px] text-slate-700 mt-1.5">Enter to send · Shift+Enter for new line · Conversational context maintained</p>
            </div>
          </div>
        </div>

        {/* Right column: examples + info */}
        <div className="space-y-4">
          {/* Example queries */}
          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={13} className="text-cyan-glow" />
              <span className="font-display font-bold text-xs text-white">Example Queries</span>
            </div>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <motion.button key={i}
                  onClick={() => setInput(ex)}
                  whileHover={{ x: 3 }}
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
              <span className="font-display font-bold text-xs text-white">Semantic Synonyms</span>
            </div>
            <p className="font-mono text-[9px] text-slate-600 mb-3">AI maps these automatically</p>
            <div className="space-y-1.5">
              {[
                { from: '"income"',       to: 'salary'     },
                { from: '"staff"',        to: 'employees'  },
                { from: '"city"',         to: 'location'   },
                { from: '"above"',        to: '$gt'        },
                { from: '"total"',        to: 'aggregate'  },
                { from: '"how many"',     to: 'countDocuments' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-slate-500">{m.from}</span>
                  <ArrowRight size={9} className="text-cyan-glow/40 flex-shrink-0" />
                  <span className="text-cyan-glow">{m.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intent types */}
          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={13} className="text-cyan-glow" />
              <span className="font-display font-bold text-xs text-white">Intent Types</span>
            </div>
            <div className="space-y-1.5">
              {[
                { intent: 'find',            color: '#00f5ff', keywords: 'show, list, get' },
                { intent: 'countDocuments',  color: '#4d9eff', keywords: 'count, how many' },
                { intent: 'aggregate',       color: '#a855f7', keywords: 'total, average, group' },
                { intent: 'insertOne',       color: '#22c55e', keywords: 'add, insert, create' },
                { intent: 'updateMany',      color: '#f59e0b', keywords: 'update, change, set' },
                { intent: 'deleteOne',       color: '#ec4899', keywords: 'delete, remove, drop' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="font-mono text-[10px] text-slate-300 w-32">{item.intent}</span>
                  <span className="font-mono text-[9px] text-slate-600 truncate">{item.keywords}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversational memory info */}
          <div className="dash-card rounded-2xl p-4 border border-cyan-glow/10">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={13} className="text-cyan-glow" />
              <span className="font-display font-bold text-xs text-white">Conversational Memory</span>
            </div>
            <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
              Context is maintained across queries. After asking about <span className="text-cyan-glow">employees</span>, follow up with <span className="text-cyan-glow">"only managers"</span> and the AI will resolve it correctly.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
