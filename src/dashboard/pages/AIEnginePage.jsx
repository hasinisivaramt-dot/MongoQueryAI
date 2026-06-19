import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Bot, User, Copy, Check, Download,
  Play, RefreshCw, Sparkles, ChevronRight, ArrowRight,
  Table2, FileJson, FileSpreadsheet, BarChart3,
  Zap, Target, Database, Layers, BookOpen, Network,
} from 'lucide-react';
import { useAuth } from '../store.jsx';
import { ExecutionTimeChart, QueryMethodDonut } from '../components/Charts.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Semantic map ──────────────────────────────────────────────────────────────
const SEMANTIC_MAP = {
  income:'salary', compensation:'salary', wage:'salary', earnings:'salary',
  staff:'employees', workforce:'employees', personnel:'employees', workers:'employees',
  city:'location', place:'location', above:'$gt', over:'$gt', greater:'$gt',
  below:'$lt', under:'$lt', less:'$lt',
  'how many':'countDocuments', count:'countDocuments', total:'aggregate', average:'aggregate',
};

const INTENT_RULES = [
  { intent:'countDocuments',    re:/count|how many|number of/i,              conf:0.95 },
  { intent:'aggregate ($avg)',  re:/average|avg|mean/i,                       conf:0.93 },
  { intent:'aggregate ($sum)',  re:/total|sum/i,                              conf:0.91 },
  { intent:'aggregate ($group)',re:/group by|per |by (dept|city|category)/i,  conf:0.92 },
  { intent:'find + sort',       re:/top \d+|rank|highest|lowest|sort/i,       conf:0.90 },
  { intent:'insertOne',         re:/insert|add|create/i,                      conf:0.88 },
  { intent:'updateMany',        re:/update|change|modify|set/i,               conf:0.87 },
  { intent:'deleteOne',         re:/delete|remove|drop/i,                     conf:0.85 },
  { intent:'find',              re:/.*/,                                       conf:0.82 },
];

function detectIntent(text) {
  for (const r of INTENT_RULES) if (r.re.test(text)) return { intent: r.intent, confidence: r.conf };
  return { intent: 'find', confidence: 0.80 };
}

function extractEntities(text, ws) {
  const t = text.toLowerCase();
  const entities = [];
  const COLORS = { Collection:'#00f5ff', Field:'#4d9eff', Operator:'#a855f7', Value:'#22c55e', Date:'#f59e0b' };

  const collections = ws?.collections?.map(c => c.name) || ['employees','users','orders','products'];
  const found = collections.find(c => t.includes(c)) ||
    ((/staff|worker|personnel/).test(t) ? 'employees' : null) ||
    collections[0];
  if (found) entities.push({ type:'Collection', value:found, color:COLORS.Collection });

  const fieldMap = { salary:['salary','income','compensation','wage'], dept:['dept','department'], location:['location','city','place'], status:['status','state'], age:['age'], price:['price','cost'], total:['total','amount'] };
  Object.entries(fieldMap).forEach(([field, terms]) => {
    if (terms.some(t2 => t.includes(t2))) entities.push({ type:'Field', value:field, color:COLORS.Field });
  });

  const numM = text.match(/\d[\d,.]*/);
  if (numM) {
    const num = numM[0].replace(/,/g,'');
    const op  = /above|over|greater/.test(t) ? '$gt' : /below|under|less/.test(t) ? '$lt' : '$eq';
    entities.push({ type:'Operator', value:op, color:COLORS.Operator });
    entities.push({ type:'Value', value:num, color:COLORS.Value });
  }

  const dates = ['today','yesterday','this month','this week','last 30 days'];
  dates.forEach(d => { if (t.includes(d)) entities.push({ type:'Date', value:d, color:COLORS.Date }); });

  return entities;
}

function buildQuery(text, entities, intentData) {
  const t    = text.toLowerCase();
  const coll = entities.find(e => e.type==='Collection')?.value || 'collection';
  const field= entities.find(e => e.type==='Field')?.value;
  const op   = entities.find(e => e.type==='Operator')?.value;
  const val  = entities.find(e => e.type==='Value')?.value;
  const date = entities.find(e => e.type==='Date')?.value;
  const { intent, confidence } = intentData;

  const docCount  = Math.floor(Math.random()*200+10);
  const execTime  = Math.floor(Math.random()*80+15);
  const numVal    = val && !isNaN(val) ? Number(val) : val ? `"${val}"` : null;

  let query, explanation, optimization, rows, csvHeaders;

  const makeRows = (n=8) => Array.from({ length:Math.min(n,8) }, (_,i) => ({
    _id: `ObjectId(${i+1})`,
    [field||'name']: field==='salary'||field==='price'||field==='total' ? (50000+i*8000) : `item_${i+1}`,
    status: i%2===0?'active':'inactive',
    dept: ['Engineering','Marketing','HR','Finance'][i%4],
  }));

  if (intent==='countDocuments') {
    const filter = field&&op&&val ? `{ ${field}: { ${op}: ${numVal} } }` : '{}';
    query = `db.${coll}.countDocuments(${filter})`;
    explanation = `Found <strong>${docCount} documents</strong> in <code>${coll}</code>${field&&val ? ` where <code>${field}</code> is ${op===$gt?'greater than':'less than'} <strong>${val}</strong>` : ''}.`;
    optimization = `Index on <code>${field||'_id'}</code> prevents full collection scan.`;
    rows = [{ result:docCount, collection:coll }];
    csvHeaders = ['result','collection'];
  } else if (intent.startsWith('aggregate')) {
    const gField = field||'dept';
    query = `db.${coll}.aggregate([\n  { $group: {\n      _id: "$${gField}",\n      count: { $sum: 1 }${field ? `,\n      avg${field.charAt(0).toUpperCase()+field.slice(1)}: { $avg: "$${field}" }` : ''}\n  }},\n  { $sort: { count: -1 } }\n])`;
    explanation = `Grouped <strong>${docCount} documents</strong> from <code>${coll}</code> by <code>${gField}</code>, computing counts and averages.`;
    optimization = `Compound index on <code>{ ${gField}: 1${field?`, ${field}: 1`:''} }</code> speeds up the pipeline.`;
    rows = Array.from({length:6}, (_,i)=>({ [gField]:['Engineering','Marketing','HR','Finance','Product','Design'][i], count:Math.floor(Math.random()*80+10), avg:Math.floor(Math.random()*80000+40000) }));
    csvHeaders = [gField,'count','avg'];
  } else {
    const filterParts = [];
    if (field&&op&&val) filterParts.push(`${field}: { ${op}: ${numVal} }`);
    if (date) filterParts.push(`createdAt: { $gte: new Date(Date.now() - 30*86400000) }`);
    const filter = filterParts.length ? `{ ${filterParts.join(', ')} }` : '{}';
    const sortStr = /top \d|sort|rank/.test(t)&&field ? `\n  .sort({ ${field}: -1 })\n  .limit(10)` : '';
    query = `db.${coll}.find(${filter})${sortStr}`;
    explanation = `Retrieved <strong>${docCount} documents</strong> from <code>${coll}</code>${field&&op&&val ? ` where <code>${field}</code> is ${op==='$gt'?'greater than':'less than'} <strong>${val}</strong>` : ''}${date ? ` (${date})` : ''}.`;
    optimization = field ? `Index on <code>{ ${field}: 1 }</code> avoids full scan.` : `Add a filter to reduce documents scanned.`;
    rows = makeRows(docCount);
    csvHeaders = ['_id', field||'name','status','dept'];
  }

  return { query, explanation, optimization, rows, csvHeaders, docCount, execTime, confidence };
}

function toCSV(rows, headers) {
  return [headers.join(','), ...rows.map(r=>headers.map(h=>JSON.stringify(r[h]??'')).join(','))].join('\n');
}
function downloadBlob(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], {type:mime}));
  a.download = filename; a.click();
}

// ── Full output card ──────────────────────────────────────────────────────────
function AIOutput({ result, entities, intentData, semanticMappings }) {
  const [view, setView]     = useState('table');
  const [copied, setCopied] = useState(false);
  const [running, setRunning]   = useState(false);
  const [executed, setExecuted] = useState(false);

  if (!result) return null;
  const jsonStr = JSON.stringify(result.rows, null, 2);
  const csvStr  = toCSV(result.rows, result.csvHeaders);

  const copy  = () => { navigator.clipboard.writeText(result.query); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const runQ  = async () => { setRunning(true); await new Promise(r=>setTimeout(r,800)); setRunning(false); setExecuted(true); };

  return (
    <div className="space-y-3">
      {/* NL explanation */}
      <div className="dash-card rounded-2xl px-5 py-4">
        <p className="font-body text-sm text-slate-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: result.explanation }} />
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <Target size={9} className="text-cyan-glow" />{intentData.intent}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
            <BarChart3 size={9} />{(result.confidence*100).toFixed(0)}% confidence
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <Zap size={9} />{result.execTime}ms · {result.docCount} docs
          </span>
        </div>
      </div>

      {/* Query */}
      <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 flex-wrap gap-y-2">
          <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
          <span className="font-mono text-[10px] text-cyan-glow">Generated Query</span>
          <div className="ml-auto flex gap-2">
            <button onClick={copy} className="font-mono text-[10px] text-slate-500 hover:text-cyan-glow flex items-center gap-1 transition-colors">
              {copied ? <><Check size={9} className="text-green-400"/>Copied</> : <><Copy size={9}/>Copy</>}
            </button>
            <button onClick={runQ} disabled={running}
              className="font-mono text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 disabled:opacity-50 transition-colors">
              {running ? <><RefreshCw size={9} className="animate-spin"/>Running…</> : <><Play size={9}/>Execute</>}
            </button>
          </div>
        </div>
        <pre className="px-4 py-4 font-mono text-sm text-green-300 overflow-x-auto dash-scroll">{result.query}</pre>
      </div>

      {/* Execution result */}
      <AnimatePresence>
        {executed && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="badge-success px-4 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2">
            <Check size={12}/> Executed · {result.docCount} documents · {result.execTime}ms
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl">
        <Zap size={11} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
        <p className="font-mono text-[10px] text-yellow-400/80 leading-relaxed"
          dangerouslySetInnerHTML={{__html: result.optimization}}/>
      </div>

      {/* Entity chips */}
      {entities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entities.map((e,i)=>(
            <span key={i} className="flex items-center gap-1.5 bg-white/3 border border-white/8 px-2.5 py-1 rounded-lg font-mono text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:e.color}}/>
              <span className="text-slate-500">{e.type}:</span>
              <span className="text-slate-200">{e.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Semantic mappings */}
      {semanticMappings.length>0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] text-slate-600">Resolved:</span>
          {semanticMappings.map((m,i)=>(
            <span key={i} className="font-mono text-[9px] bg-white/3 border border-white/5 px-2 py-0.5 rounded-md">
              <span className="text-slate-500">"{m.from}"</span>
              <span className="text-slate-600 mx-1">→</span>
              <span className="text-cyan-glow">{m.to}</span>
            </span>
          ))}
        </div>
      )}

      {/* Output formats */}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 flex-wrap">
          {[{id:'table',icon:Table2,label:'Table'},{id:'json',icon:FileJson,label:'JSON'},{id:'csv',icon:FileSpreadsheet,label:'CSV'},{id:'chart',icon:BarChart3,label:'Charts'}].map(v=>{
            const Icon=v.icon;
            return (
              <button key={v.id} onClick={()=>setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${view===v.id?'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30':'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}>
                <Icon size={12}/>{v.label}
              </button>
            );
          })}
        </div>
        <div className="p-4">
          {view==='table' && (
            <div className="overflow-x-auto dash-scroll">
              <table className="w-full dash-table text-xs">
                <thead><tr>{result.csvHeaders.map(h=><th key={h} className="px-4 py-2 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((row,i)=>(
                    <motion.tr key={i} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="border-t border-white/4 hover:bg-white/2 transition-colors">
                      {result.csvHeaders.map(h=>(
                        <td key={h} className="px-4 py-2 font-mono text-slate-300 whitespace-nowrap">
                          {typeof row[h]==='number' ? `₹${Number(row[h]).toLocaleString()}` : String(row[h]??'—')}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {view==='json' && (
            <div className="space-y-3">
              <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-56 overflow-y-auto dash-scroll">
                <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap">{jsonStr}</pre>
              </div>
              <button onClick={()=>downloadBlob(jsonStr,'results.json','application/json')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                <Download size={12}/>Download JSON
              </button>
            </div>
          )}
          {view==='csv' && (
            <div className="space-y-3">
              <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-56 overflow-y-auto dash-scroll">
                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">{csvStr}</pre>
              </div>
              <button onClick={()=>downloadBlob(csvStr,'results.csv','text/csv')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
                <Download size={12}/>Download CSV
              </button>
            </div>
          )}
          {view==='chart' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExecutionTimeChart/><QueryMethodDonut/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIEnginePage() {
  const { workspace } = useAuth();
  const [messages, setMessages]  = useState([]);
  const [input, setInput]        = useState('');
  const [processing, setProcessing] = useState(false);
  const [ctx, setCtx]            = useState(null);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

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

    let resolved = text;
    if (ctx && /^(only|just|filter|with|but|and)\b/i.test(text)) {
      resolved = `${ctx.collection||''} ${text}`.trim();
    }

    const words = resolved.toLowerCase().split(/\s+/);
    const semanticMappings = words.filter(w=>SEMANTIC_MAP[w]).map(w=>({from:w,to:SEMANTIC_MAP[w]}));

    const thinkId = Date.now()+1;
    setMessages(prev => [...prev,
      { id:Date.now(), role:'user', text },
      { id:thinkId, role:'ai', thinking:true },
    ]);

    await new Promise(r=>setTimeout(r,1100));

    const intentData = detectIntent(resolved);
    const entities   = extractEntities(resolved, workspace);
    const result     = buildQuery(resolved, entities, intentData);

    const coll = entities.find(e=>e.type==='Collection')?.value;
    if (coll) setCtx({ collection:coll, lastQuery:resolved });

    setMessages(prev => prev.map(m =>
      m.id===thinkId ? { ...m, thinking:false, result, entities, intentData, semanticMappings } : m
    ));
    setProcessing(false);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
          <Brain size={11} className="text-cyan-glow"/>
          <span className="font-mono text-[10px] tracking-widest">AI ENGINE · NATURAL LANGUAGE → MONGODB</span>
        </div>
        <h1 className="font-display font-black text-2xl text-white">AI Query Engine</h1>
        <p className="font-body text-sm text-slate-400 mt-1">
          Natural language → MongoDB · Intent detection · Semantic schema matching · Conversational memory
          {workspace && <span className="text-cyan-glow ml-2">· Adapted for {workspace.domain}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="dash-card rounded-2xl flex flex-col" style={{minHeight:500}}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <Brain size={15} className="text-cyan-glow"/>
              <span className="font-display font-bold text-sm text-white">Conversational Query Builder</span>
              {ctx && (
                <div className="ml-auto flex items-center gap-1.5 badge-info px-2 py-0.5 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow"/>
                  <span className="font-mono text-[9px]">ctx: {ctx.collection}</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto dash-scroll px-5 py-4 space-y-5">
              {messages.length===0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <motion.div animate={{scale:[1,1.08,1],opacity:[0.5,1,0.5]}} transition={{duration:2.5,repeat:Infinity}}
                    className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
                    <Sparkles size={22} className="text-cyan-glow"/>
                  </motion.div>
                  <div className="text-center">
                    <p className="font-body text-sm text-slate-400 mb-1">Start with a natural language query</p>
                    <p className="font-mono text-[10px] text-slate-600">Try one of the examples →</p>
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id}>
                  {msg.role==='user' ? (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-md bg-blue-electric/15 border border-blue-electric/25 rounded-2xl rounded-tr-sm px-4 py-3">
                        <p className="font-body text-sm text-slate-200">{msg.text}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-white"/>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <motion.div animate={msg.thinking?{rotate:360}:{}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-blue-electric/20 border border-cyan-glow/30 flex items-center justify-center flex-shrink-0">
                        <Bot size={13} className="text-cyan-glow"/>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        {msg.thinking ? (
                          <div className="dash-card rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-2">
                            {[0,1,2].map(i=>(
                              <motion.div key={i} animate={{y:[0,-5,0]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.15}}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-glow"/>
                            ))}
                            <span className="font-mono text-xs text-slate-500 ml-1">Generating…</span>
                          </div>
                        ) : (
                          <AIOutput result={msg.result} entities={msg.entities} intentData={msg.intentData} semanticMappings={msg.semanticMappings}/>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEnd}/>
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-white/5">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                    placeholder="e.g. Show employees with salary above 50000…"
                    rows={2} disabled={processing}
                    className="dash-input w-full px-4 py-3 rounded-xl text-sm resize-none"/>
                </div>
                <motion.button onClick={send} disabled={processing||!input.trim()}
                  whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                    ${processing||!input.trim()?'bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed':'btn-primary shadow-lg shadow-blue-electric/30'}`}>
                  {processing?<RefreshCw size={15} className="animate-spin"/>:<Send size={15}/>}
                </motion.button>
              </div>
              <p className="font-mono text-[9px] text-slate-700 mt-1.5">Enter · Shift+Enter for newline · Conversational context maintained</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={13} className="text-cyan-glow"/>
              <span className="font-display font-bold text-xs text-white">Example Queries</span>
            </div>
            <div className="space-y-1.5">
              {examples.map((ex,i)=>(
                <motion.button key={i} onClick={()=>setInput(ex)} whileHover={{x:3}}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-cyan-glow/20 hover:bg-cyan-glow/3 transition-all group">
                  <div className="flex items-start gap-2">
                    <ChevronRight size={11} className="text-cyan-glow/50 group-hover:text-cyan-glow mt-0.5 flex-shrink-0 transition-colors"/>
                    <span className="font-body text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">{ex}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="dash-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Network size={13} className="text-cyan-glow"/>
              <span className="font-display font-bold text-xs text-white">Semantic Synonyms</span>
            </div>
            <div className="space-y-1.5">
              {[
                {from:'"income"',to:'salary'},{from:'"staff"',to:'employees'},
                {from:'"city"',to:'location'},{from:'"above"',to:'$gt'},
                {from:'"how many"',to:'countDocuments'},{from:'"total"',to:'aggregate'},
              ].map((m,i)=>(
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-slate-500">{m.from}</span>
                  <ArrowRight size={9} className="text-cyan-glow/40 flex-shrink-0"/>
                  <span className="text-cyan-glow">{m.to}</span>
                </div>
              ))}
            </div>
          </div>

          {workspace && (
            <div className="dash-card rounded-2xl p-4 border border-cyan-glow/10">
              <div className="flex items-center gap-2 mb-3">
                <Database size={13} className="text-cyan-glow"/>
                <span className="font-display font-bold text-xs text-white">{workspace.domain}</span>
              </div>
              <div className="space-y-1.5">
                {workspace.collections.map(c=>(
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
