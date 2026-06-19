import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Clock, Copy, Play, Check, Layers, Bookmark,
  Activity, GitBranch, ChevronRight, Plus, RefreshCw,
  AlertCircle, Database, Zap, Download, Table2,
  FileJson, FileSpreadsheet, BarChart3, X, Brain,
} from 'lucide-react';
import { MOCK_QUERIES, COLLECTION_DATA } from '../store.jsx';
import { useAuth } from '../store.jsx';
import QueryGenerator from '../components/QueryGenerator.jsx';
import ExecutionLogs from '../components/ExecutionLogs.jsx';
import { ExecutionTimeChart, QueryMethodDonut } from '../components/Charts.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const STATUS_BADGE = { success:'badge-success', warning:'badge-warning', error:'badge-error' };

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  return (
    <motion.div initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:20, scale:0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl font-mono text-xs flex items-center gap-3 shadow-2xl ${
        type==='success'?'badge-success':type==='error'?'badge-error':'badge-info'}`}>
      {type==='success' ? <Check size={14}/> : <AlertCircle size={14}/>}
      {msg}
    </motion.div>
  );
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type='success') => setToast({ msg, type, id:Date.now() });
  const hide = () => setToast(null);
  const el = (
    <AnimatePresence>
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={hide}/>}
    </AnimatePresence>
  );
  return { show, el };
}

// ── Download helpers ──────────────────────────────────────────────────────────
function toCSV(rows, keys) {
  return [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k]??'')).join(','))].join('\n');
}
function downloadBlob(content, filename, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type:mime }));
  a.download = filename; a.click();
}

// ── Full results panel (table + JSON + CSV + charts) ─────────────────────────
function ResultsPanel({ query, onClose }) {
  const [view, setView] = useState('table');
  const keys = ['_id','name','dept','salary','status'];
  const rows = Array.from({length:8}, (_,i) => ({
    _id: `ObjectId(${i})`,
    name: ['Arjun','Priya','Marcus','Sarah','Daniel','Leila','James','Kavya'][i],
    dept: ['Engineering','HR','Marketing','Finance'][i%4],
    salary: 45000+i*8500,
    status: i%2===0?'active':'inactive',
  }));
  const jsonStr = JSON.stringify(rows, null, 2);
  const csvStr  = toCSV(rows, keys);

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className="mt-4 dash-card rounded-2xl overflow-hidden border border-cyan-glow/15">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-cyan-glow/3">
        <Brain size={13} className="text-cyan-glow"/>
        <span className="font-mono text-[10px] text-cyan-glow tracking-widest">QUERY RESULTS</span>
        <span className="ml-auto font-mono text-[10px] text-slate-500">{rows.length} docs · {Math.floor(Math.random()*80+15)}ms</span>
        <button onClick={onClose} className="text-slate-600 hover:text-red-400 transition-colors"><X size={13}/></button>
      </div>

      <div className="px-4 pt-3 pb-2">
        <div className="dash-card rounded-xl px-4 py-3 mb-3">
          <p className="font-body text-xs text-slate-300 leading-relaxed">
            Found <strong className="text-white">{rows.length} documents</strong> matching your query. Results include name, department, salary, and status fields.
          </p>
        </div>
        <code className="block font-mono text-xs text-green-300 bg-black/30 border border-white/8 rounded-xl px-4 py-3 mb-3 overflow-x-auto">{query}</code>
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-1 mb-3 flex-wrap">
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

        {view==='table' && (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full dash-table text-xs">
              <thead><tr>{keys.map(k=><th key={k} className="px-4 py-2 text-left">{k}</th>)}</tr></thead>
              <tbody>
                {rows.map((row,i)=>(
                  <motion.tr key={i} initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                    className="border-t border-white/4 hover:bg-white/2 transition-colors">
                    {keys.map(k=>(
                      <td key={k} className="px-4 py-2 font-mono text-slate-300 whitespace-nowrap">
                        {k==='salary'?`₹${Number(row[k]).toLocaleString()}`:String(row[k]||'—')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {view==='json' && (
          <div className="space-y-2">
            <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-52 overflow-y-auto dash-scroll">
              <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap">{jsonStr}</pre>
            </div>
            <button onClick={()=>downloadBlob(jsonStr,'results.json','application/json')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-outline font-mono text-xs">
              <Download size={12}/>Download JSON
            </button>
          </div>
        )}
        {view==='csv' && (
          <div className="space-y-2">
            <div className="bg-black/30 border border-white/8 rounded-xl p-4 max-h-52 overflow-y-auto dash-scroll">
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
    </motion.div>
  );
}

// ── Query History ─────────────────────────────────────────────────────────────
export function QueryHistoryPage() {
  const [copiedId,  setCopiedId]  = useState(null);
  const [runningId, setRunningId] = useState(null);
  const [openResult,setOpenResult]= useState(null);
  const { show: showToast, el: toastEl } = useToast();

  const copy = (id, q) => {
    navigator.clipboard.writeText(q).then(() => {
      setCopiedId(id); showToast('Query copied to clipboard');
      setTimeout(()=>setCopiedId(null),2000);
    });
  };

  const rerun = async (q) => {
    setRunningId(q.id);
    await new Promise(r=>setTimeout(r,900));
    setRunningId(null);
    setOpenResult(q.id);
    showToast(`Query executed · opening full results`);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-4">
      {toastEl}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <History size={16} className="text-cyan-glow"/>
          <h2 className="font-display font-bold text-base text-white">Query History</h2>
          <span className="ml-auto badge-info px-2.5 py-1 rounded-lg font-mono text-[10px]">{MOCK_QUERIES.length} queries</span>
        </div>

        <div className="divide-y divide-white/4">
          {MOCK_QUERIES.map((q,i) => (
            <div key={q.id}>
              <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                className="px-5 py-4 hover:bg-white/2 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`${STATUS_BADGE[q.status]} px-2 py-0.5 rounded-full font-mono text-[10px] capitalize`}>{q.status}</span>
                      <span className="font-mono text-[10px] text-slate-600 flex items-center gap-1"><Clock size={9}/>{q.ts}</span>
                      {q.status!=='error' && (
                        <><span className="font-mono text-[10px] text-green-400">{q.time}ms</span>
                        <span className="font-mono text-[10px] text-blue-neon">{q.docs} docs</span></>
                      )}
                    </div>
                    <p className="font-body text-sm text-slate-300 mb-2">{q.nl}</p>
                    <code className="font-mono text-xs text-cyan-glow/80 bg-white/3 px-3 py-1.5 rounded-lg block truncate">{q.query}</code>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>copy(q.id,q.query)}
                      className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all">
                      {copiedId===q.id ? <Check size={11} className="text-green-400"/> : <Copy size={11}/>}
                    </button>
                    <button onClick={()=>rerun(q)} disabled={runningId===q.id}
                      title="Re-run and view full results"
                      className="w-7 h-7 rounded-lg glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-green-400 hover:border-green-400/30 transition-all disabled:opacity-40">
                      {runningId===q.id ? <RefreshCw size={11} className="animate-spin text-green-400"/> : <Play size={11}/>}
                    </button>
                  </div>
                </div>
              </motion.div>
              {/* Inline full results on re-run */}
              <AnimatePresence>
                {openResult===q.id && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="overflow-hidden px-5 pb-4">
                    <ResultsPanel query={q.query} onClose={()=>setOpenResult(null)}/>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Collections ───────────────────────────────────────────────────────────────
export function CollectionsPage() {
  const { workspace } = useAuth();
  const { show: showToast, el: toastEl } = useToast();
  const [selected, setSelected] = useState(null);
  const [viewDocs, setViewDocs] = useState(null);

  // Use workspace collections if available, else fall back to mock
  const collections = workspace?.collections
    ? workspace.collections.map(c => ({
        name: c.name,
        docs: c.docs,
        size: c.size,
        queries: Math.floor(Math.random()*15000+1000),
        icon: c.icon,
        color: c.color,
        fields: workspace.fields?.[c.name] || ['_id','name','status','createdAt'],
      }))
    : COLLECTION_DATA.map(c => ({ ...c, icon:'📄', color:'#00f5ff', fields:['_id','name','status','createdAt'] }));

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      {workspace && (
        <div className="badge-info px-4 py-2 rounded-xl font-mono text-[10px] flex items-center gap-2 w-fit">
          <Brain size={11}/> Auto-detected from {workspace.domain} workspace
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-slate-600">{collections.length} collections · cluster0.mongodb.net</p>
        <button onClick={()=>showToast('Collection creation coming soon','info')}
          className="btn-outline px-4 py-2 rounded-xl text-sm flex items-center gap-2 font-body">
          <Plus size={14}/>New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {collections.map((col,i) => (
          <motion.div key={col.name} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            onClick={()=>setSelected(selected===col.name?null:col.name)}
            className={`dash-card rounded-2xl p-5 cursor-pointer transition-all ${selected===col.name?'border-cyan-glow/30 bg-cyan-glow/3':''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:`${col.color}15`, border:`1px solid ${col.color}25` }}>
                {col.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold truncate" style={{ color:col.color }}>{col.name}</p>
                <p className="font-mono text-[10px] text-slate-600">{typeof col.docs==='string'?col.docs:col.docs.toLocaleString()} documents</p>
              </div>
              <ChevronRight size={14} className={`text-slate-600 transition-transform flex-shrink-0 ${selected===col.name?'rotate-90 text-cyan-glow':''}`}/>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Size',    val:col.size||'—'  },
                { label:'Queries', val:col.queries?.toLocaleString()||'—' },
                { label:'Fields',  val:col.fields?.length||4 },
              ].map(s=>(
                <div key={s.label} className="bg-white/3 rounded-xl p-2.5 text-center">
                  <p className="font-display font-bold text-sm text-white">{s.val}</p>
                  <p className="font-mono text-[9px] text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selected===col.name && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="mt-4 pt-4 border-t border-white/5 space-y-2 overflow-hidden">
                  <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-2">Schema Fields</p>
                  {(col.fields||[]).map(f=>(
                    <div key={f} className="flex items-center justify-between">
                      <span className="font-mono text-xs" style={{ color:col.color }}>{f}</span>
                      <span className="font-mono text-[10px] text-slate-600">
                        {f.endsWith('Id')?'ObjectId':f.endsWith('At')?'Date':/salary|price|amount|budget/.test(f)?'Number':'String'}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <button onClick={e=>{e.stopPropagation();setViewDocs(col.name);showToast(`Opening ${col.name} documents…`,'info');}}
                      className="flex-1 py-2 rounded-xl btn-outline text-xs font-mono">View Docs</button>
                    <button onClick={e=>{e.stopPropagation();showToast(`Querying ${col.name}…`,'info');}}
                      className="flex-1 py-2 rounded-xl btn-primary text-xs font-mono">Query</button>
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

// ── Query Generator page ──────────────────────────────────────────────────────
export function QueryGeneratorPage() {
  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <QueryGenerator />
      {/* Single execution log — no duplicate */}
    </motion.div>
  );
}

// ── Aggregations ──────────────────────────────────────────────────────────────
const STAGE_OPS = ['$match','$group','$sort','$limit','$project','$lookup','$unwind','$facet','$count'];

const STAGE_EXPLANATIONS = {
  '$match':   'Filters documents — like WHERE in SQL',
  '$group':   'Groups documents by a field and computes aggregates',
  '$sort':    'Orders the result set by specified fields',
  '$limit':   'Restricts the number of output documents',
  '$project': 'Reshapes documents — include/exclude fields',
  '$lookup':  'Performs a left outer join with another collection',
  '$unwind':  'Deconstructs an array field into separate documents',
  '$facet':   'Runs multiple aggregation pipelines in parallel',
  '$count':   'Counts documents and outputs the total',
};

export function AggregationsPage() {
  const { workspace } = useAuth();
  const { show: showToast, el: toastEl } = useToast();

  // Auto-generate stages from workspace
  const defaultColl = workspace?.collections?.[0]?.name || 'employees';
  const defaultField = workspace?.fields?.[defaultColl]?.[3] || 'salary';

  const [stages, setStages] = useState([
    { id:1, op:'$match',  config:`{ status: "active" }`,              color:'#00f5ff' },
    { id:2, op:'$group',  config:`{ _id: "$dept", count: { $sum: 1 }, avg${defaultField.charAt(0).toUpperCase()+defaultField.slice(1)}: { $avg: "$${defaultField}" } }`, color:'#4d9eff' },
    { id:3, op:'$sort',   config:`{ avg${defaultField.charAt(0).toUpperCase()+defaultField.slice(1)}: -1 }`, color:'#a855f7' },
    { id:4, op:'$limit',  config:'10',                                color:'#22c55e' },
  ]);
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [editing,  setEditing]  = useState(null);

  const COLORS = ['#00f5ff','#4d9eff','#a855f7','#22c55e','#f59e0b','#ec4899','#06b6d4','#8b5cf6'];

  const addStage = () => {
    const op = STAGE_OPS[stages.length % STAGE_OPS.length];
    setStages(s=>[...s,{ id:Date.now(), op, config:'{}', color:COLORS[s.length%COLORS.length] }]);
    showToast(`Stage ${op} added`);
  };

  const runPipeline = async () => {
    setRunning(true); setResult(null);
    await new Promise(r=>setTimeout(r,1400));
    setResult({ docs:Math.floor(Math.random()*20+3), time:Math.floor(Math.random()*100+40) });
    setRunning(false);
    showToast('Pipeline executed successfully');
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      {workspace && (
        <div className="badge-info px-4 py-2 rounded-xl font-mono text-[10px] flex items-center gap-2 w-fit">
          <Brain size={11}/> Pipeline auto-generated for {workspace.domain} · collection: <strong>{defaultColl}</strong>
        </div>
      )}

      <div className="dash-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch size={16} className="text-cyan-glow"/>
          <h2 className="font-display font-bold text-base text-white">Visual Pipeline Builder</h2>
          <span className="ml-auto badge-info px-3 py-1 rounded-lg font-mono text-[10px]">
            {stages.length} stage{stages.length!==1?'s':''}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {stages.map((stage,i) => (
            <motion.div key={stage.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:i*0.07 }}
              className="flex items-start gap-4 group">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold"
                  style={{ background:`${stage.color}20`, border:`1px solid ${stage.color}30`, color:stage.color }}>
                  {i+1}
                </div>
                {i<stages.length-1 && <div className="w-px h-6 mt-1" style={{ background:`${stage.color}30` }}/>}
              </div>
              <div className="flex-1 bg-white/2 border border-white/5 rounded-xl p-4 hover:border-cyan-glow/15 transition-all">
                <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
                  <div>
                    <span className="font-mono text-sm font-bold" style={{ color:stage.color }}>{stage.op}</span>
                    <span className="font-mono text-[10px] text-slate-600 ml-3">{STAGE_EXPLANATIONS[stage.op]}</span>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>setEditing(editing===stage.id?null:stage.id)}
                      className="font-mono text-[10px] text-slate-600 hover:text-cyan-glow px-2 py-1 rounded-lg hover:bg-white/5 transition-all">
                      {editing===stage.id?'Done':'Edit'}
                    </button>
                    <button onClick={()=>{setStages(s=>s.filter(x=>x.id!==stage.id));showToast('Stage removed','info');}}
                      className="font-mono text-[10px] text-red-400/60 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/5 transition-all">
                      Remove
                    </button>
                  </div>
                </div>
                {editing===stage.id ? (
                  <textarea className="dash-input w-full px-3 py-2 rounded-lg text-xs font-mono resize-none" rows={3}
                    value={stage.config}
                    onChange={e=>setStages(s=>s.map(x=>x.id===stage.id?{...x,config:e.target.value}:x))}/>
                ) : (
                  <code className="font-mono text-xs text-slate-400 block">{stage.config}</code>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="mb-4 badge-success px-4 py-3 rounded-xl font-mono text-xs flex items-center gap-3">
              <Check size={14}/>
              Pipeline executed · {result.docs} documents returned · {result.time}ms
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 flex-wrap">
          <button onClick={addStage} className="btn-outline px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 font-body">
            <Plus size={14}/>Add Stage
          </button>
          <motion.button onClick={runPipeline} disabled={running||stages.length===0}
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            className={`btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 font-body disabled:opacity-60 ${running?'ai-processing':''}`}>
            {running ? <><RefreshCw size={14} className="animate-spin"/>Running…</> : <><Play size={14}/>Run Pipeline</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Indexes ───────────────────────────────────────────────────────────────────
export function IndexesPage() {
  const { workspace } = useAuth();
  const { show: showToast, el: toastEl } = useToast();

  // Dynamic indexes from workspace
  const collections = workspace?.collections || [{ name:'employees',color:'#00f5ff' }];
  const [indexes, setIndexes] = useState(() => {
    const base = [];
    collections.forEach((c,ci) => {
      const fields = workspace?.fields?.[c.name] || ['_id','name','status'];
      base.push({ id:ci*10+1, collection:c.name, name:'_id_', fields:'{ _id: 1 }', type:'Unique', size:'1.2 MB', usage:18420+ci*1000 });
      if (fields[3]) base.push({ id:ci*10+2, collection:c.name, name:`${fields[3]}_-1`, fields:`{ ${fields[3]}: -1 }`, type:'Single', size:'840 KB', usage:8000+ci*500 });
      if (fields[2]&&fields[3]) base.push({ id:ci*10+3, collection:c.name, name:`${fields[2]}_1_${fields[3]}_-1`, fields:`{ ${fields[2]}: 1, ${fields[3]}: -1 }`, type:'Compound', size:'1.1 MB', usage:5000+ci*300 });
    });
    return base.slice(0,8);
  });

  const [analyzing, setAnalyzing] = useState(null);
  const [analysis,  setAnalysis]  = useState({});

  const analyzeIndex = async (idx) => {
    setAnalyzing(idx.id);
    await new Promise(r=>setTimeout(r,900));
    setAnalysis(a=>({ ...a, [idx.id]:`Selectivity: ${(Math.random()*0.5+0.5).toFixed(2)} · Avg scan: ${Math.floor(Math.random()*50+5)} docs · Status: Healthy` }));
    setAnalyzing(null);
    showToast(`Index "${idx.name}" analyzed`);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      {workspace && (
        <div className="badge-info px-4 py-2 rounded-xl font-mono text-[10px] flex items-center gap-2 w-fit">
          <Brain size={11}/> Indexes auto-generated for {workspace.domain} · {indexes.length} indexes detected
        </div>
      )}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          <Bookmark size={16} className="text-cyan-glow"/>
          <h2 className="font-display font-bold text-base text-white">Index Manager</h2>
          <span className="font-mono text-[10px] text-slate-600 ml-1">{indexes.length} indexes</span>
          <button onClick={()=>showToast('Index creation wizard — coming soon','info')}
            className="ml-auto btn-outline px-4 py-2 rounded-xl text-sm font-body flex items-center gap-2">
            <Plus size={13}/>Create Index
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full dash-table">
            <thead>
              <tr>{['Collection','Index Name','Fields','Type','Size','Usage','Actions'].map(h=>(
                <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {indexes.map((idx,i) => (
                <motion.tr key={idx.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-cyan-glow whitespace-nowrap">{idx.collection}</td>
                  <td className="px-5 py-3 font-mono text-sm text-cyan-glow/70 whitespace-nowrap">{idx.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{idx.fields}</td>
                  <td className="px-5 py-3"><span className="badge-info px-2 py-0.5 rounded-md font-mono text-[10px] whitespace-nowrap">{idx.type}</span></td>
                  <td className="px-5 py-3 font-mono text-sm text-slate-400">{idx.size}</td>
                  <td className="px-5 py-3 font-mono text-sm text-white font-bold">{idx.usage.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={()=>analyzeIndex(idx)} disabled={analyzing===idx.id}
                        className="font-mono text-[10px] px-2.5 py-1.5 rounded-lg border border-white/8 text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all disabled:opacity-40 flex items-center gap-1">
                        {analyzing===idx.id ? <><RefreshCw size={9} className="animate-spin"/>Analysing…</> : 'Analyse'}
                      </button>
                      {idx.type!=='Unique' && (
                        <button onClick={()=>{setIndexes(ix=>ix.filter(x=>x.id!==idx.id));showToast(`Index "${idx.name}" dropped`,'info');}}
                          className="font-mono text-[10px] px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all">
                          Drop
                        </button>
                      )}
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
export function MongoOpsPage() {
  const { workspace } = useAuth();
  const { show: showToast, el: toastEl } = useToast();
  const [running, setRunning] = useState(null);
  const [output,  setOutput]  = useState({});

  const coll = workspace?.collections?.[0]?.name || 'employees';

  const OPS_LIST = [
    { name:'find',          desc:'Retrieve documents matching a filter',   color:'#00f5ff', example:`db.${coll}.find({ status: "active" }).limit(10)` },
    { name:'aggregate',     desc:'Run an aggregation pipeline',            color:'#4d9eff', example:`db.${coll}.aggregate([{ $group: { _id: "$dept", count: { $sum: 1 } } }])` },
    { name:'insertOne',     desc:'Insert a single document',               color:'#22c55e', example:`db.${coll}.insertOne({ name: "New Record", status: "active", createdAt: new Date() })` },
    { name:'updateOne',     desc:'Update a single matching document',      color:'#f59e0b', example:`db.${coll}.updateOne({ _id: ObjectId("...") }, { $set: { status: "inactive" } })` },
    { name:'deleteOne',     desc:'Delete a single matching document',      color:'#ec4899', example:`db.${coll}.deleteOne({ _id: ObjectId("...") })` },
    { name:'countDocuments',desc:'Count documents matching a filter',      color:'#a855f7', example:`db.${coll}.countDocuments({ status: "active" })` },
    { name:'replaceOne',    desc:'Replace an entire document',             color:'#06b6d4', example:`db.${coll}.replaceOne({ _id: ObjectId("...") }, { name: "Replaced", status: "active" })` },
    { name:'createIndex',   desc:'Create an index on a field',             color:'#8b5cf6', example:`db.${coll}.createIndex({ status: 1, createdAt: -1 })` },
    { name:'dropIndex',     desc:'Remove an existing index',               color:'#f87171', example:`db.${coll}.dropIndex("status_1_createdAt_-1")` },
    { name:'bulkWrite',     desc:'Perform multiple write operations',      color:'#34d399', example:`db.${coll}.bulkWrite([\n  { insertOne: { document: { name: "A" } } },\n  { updateOne: { filter: { name: "B" }, update: { $set: { status: "active" } } } }\n])` },
  ];

  const runOp = async (op) => {
    setRunning(op.name);
    await new Promise(r=>setTimeout(r,800));
    const fakeResult = op.name==='countDocuments'
      ? `{ count: ${Math.floor(Math.random()*500+50)} }`
      : op.name==='insertOne'
      ? `{ acknowledged: true, insertedId: ObjectId("${Math.random().toString(16).slice(2,26)}") }`
      : op.name==='aggregate'
      ? `[\n  { _id: "Engineering", count: 42 },\n  { _id: "HR", count: 18 },\n  { _id: "Marketing", count: 31 }\n]`
      : `{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }`;
    setOutput(o=>({ ...o, [op.name]:fakeResult }));
    setRunning(null);
    showToast(`db.${op.name}() executed`);
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}
      {workspace && (
        <div className="badge-info px-4 py-2 rounded-xl font-mono text-[10px] flex items-center gap-2 w-fit">
          <Brain size={11}/> Operations shown for {workspace.domain} · active collection: <strong>{coll}</strong>
        </div>
      )}
      <div className="dash-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={16} className="text-cyan-glow"/>
          <h2 className="font-display font-bold text-base text-white">MongoDB Operations</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 rounded-full bg-green-400 status-dot"/>
            <span className="font-mono text-[10px] text-green-400">cluster0 · connected</span>
          </div>
        </div>
        <div className="space-y-4">
          {OPS_LIST.map((op,i) => (
            <motion.div key={op.name} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
              className="bg-white/2 border border-white/5 rounded-xl p-4 hover:border-cyan-glow/15 transition-all">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold" style={{ color:op.color }}>db.{coll}.{op.name}()</span>
                  <span className="font-body text-xs text-slate-500">{op.desc}</span>
                </div>
                <motion.button onClick={()=>runOp(op)} disabled={running===op.name}
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  className="px-3 py-1.5 rounded-lg font-mono text-[11px] text-green-400 border border-green-500/20 hover:bg-green-500/8 transition-all flex items-center gap-1.5 disabled:opacity-40 whitespace-nowrap">
                  {running===op.name ? <><RefreshCw size={11} className="animate-spin"/>Running…</> : <><Play size={11}/>Run</>}
                </motion.button>
              </div>
              <code className="font-mono text-[11px] text-slate-500 block mb-2 bg-black/20 px-3 py-2 rounded-lg">{op.example}</code>
              <AnimatePresence>
                {output[op.name] && (
                  <motion.pre initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="font-mono text-[11px] text-slate-300 bg-black/30 p-3 rounded-lg overflow-x-auto"
                    style={{ whiteSpace:'pre-wrap' }}>
                    {output[op.name]}
                  </motion.pre>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
