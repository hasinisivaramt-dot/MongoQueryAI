import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, File, X, Search, Sparkles, Database,
  Tag, Hash, Network, BarChart3, Brain, Check, RefreshCw,
  Eye, Download, Copy, FileJson, Table, BookOpen,
  TrendingUp, ChevronDown, ChevronUp, Layers,
} from 'lucide-react';
import { useAuth } from '../store.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Infer analysis from file name ─────────────────────────────────────────────
function generateAnalysis(fileName, workspace) {
  const ws = workspace || {};
  const domain = ws.domain || 'Employee Management';
  const colls  = ws.collections || [
    { name:'employees', icon:'👤' },{ name:'departments', icon:'🏢' },
    { name:'projects', icon:'📋' },{ name:'salaries', icon:'💰' },
  ];

  const summary = `This document describes the ${domain} system schema and data structure. It contains ${colls.length} primary collections with associated field definitions, relationships, and query patterns. The AI has extracted ${colls.length} suggested collections, identified key entities, and generated optimized MongoDB index recommendations.`;

  const entities = [
    ...colls.slice(0,3).map(c => ({ text:c.name, type:'COLLECTION', count:Math.floor(Math.random()*30+10), color:'#00f5ff' })),
    { text:'_id',       type:'FIELD',      count:colls.length*3, color:'#4d9eff' },
    { text:'createdAt', type:'FIELD',      count:Math.floor(Math.random()*15+5), color:'#4d9eff' },
    { text:'status',    type:'FIELD',      count:Math.floor(Math.random()*12+4), color:'#4d9eff' },
    { text:'ObjectId',  type:'TYPE',       count:Math.floor(Math.random()*20+8), color:'#f59e0b' },
    { text:'MongoDB',   type:'TECHNOLOGY', count:Math.floor(Math.random()*10+5), color:'#a855f7' },
  ];

  const keywords = [
    'collection','schema','index','query','aggregate',
    ...(colls.map(c=>c.name)),
    'pipeline','filter','sort','match','group',
  ].slice(0,12);

  const suggestedCollections = colls.map(c => ({
    name: c.name,
    fields: (ws.fields?.[c.name] || ['_id','name','status','createdAt']),
    docs: c.docs || '~1K',
  }));

  const suggestedIndexes = colls.slice(0,3).map((c,i) => ({
    collection: c.name,
    fields: i===0 ? '{ status: 1, createdAt: -1 }' : i===1 ? '{ name: 1 }' : '{ _id: 1 }',
    type: i===0 ? 'Compound' : i===1 ? 'Single' : 'Unique',
    reason: i===0 ? 'Frequent status filter + date sort' : i===1 ? 'Name lookups for auth' : 'Primary key',
  }));

  const suggestedQueries = (ws.suggestions || [
    `Show all ${colls[0]?.name || 'documents'} created this month`,
    `Count ${colls[0]?.name || 'records'} by status`,
    `Average value by category`,
    `Top 10 by volume`,
  ]).slice(0,5);

  const tablePreview = suggestedCollections[0] ? {
    collection: suggestedCollections[0].name,
    rows: Array.from({length:5}, (_,i) => {
      const row = {};
      (suggestedCollections[0].fields||[]).slice(0,4).forEach(f => {
        row[f] = f==='_id' ? `ObjectId(${i})` : f==='status' ? (i%2===0?'active':'inactive') : `${f}_${i+1}`;
      });
      return row;
    }),
    headers: (suggestedCollections[0].fields||[]).slice(0,4),
  } : null;

  const semanticMappings = [
    { input:'income', mapped:'salary', score:0.94 },
    { input:'staff',  mapped: colls[0]?.name||'employees', score:0.91 },
    { input:'city',   mapped:'location', score:0.88 },
    { input:'headcount', mapped:'count', score:0.85 },
  ];

  return {
    topic: domain,
    summary,
    wordCount: Math.floor(Math.random()*3000+1500),
    charCount: Math.floor(Math.random()*18000+8000),
    sentenceCount: Math.floor(Math.random()*130+60),
    readingTime: `${Math.floor(Math.random()*10+4)} min`,
    language: 'English',
    entities,
    keywords,
    suggestedCollections,
    suggestedIndexes,
    suggestedQueries,
    tablePreview,
    semanticMappings,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function UploadZone({ onUpload }) {
  const inputRef  = useRef(null);
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);

  const process = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 25));
      setProgress(i);
    }
    setUploading(false);
    onUpload(files[0]);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    process([...e.dataTransfer.files]);
  }, []);

  return (
    <motion.div
      animate={dragging ? { scale: 1.015 } : { scale: 1 }}
      onClick={() => !uploading && inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer select-none overflow-hidden
        ${dragging ? 'border-cyan-glow bg-cyan-glow/5 shadow-lg shadow-cyan-glow/15'
                   : 'border-white/10 hover:border-cyan-glow/40 hover:bg-white/[0.02]'}`}
      style={{ padding: '2.5rem 2rem' }}
    >
      <input ref={inputRef} type="file" multiple className="hidden"
        accept=".pdf,.docx,.txt,.json,.csv"
        onChange={e => process([...e.target.files])} />

      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width:3+i%2, height:3+i%2, left:`${15+i*13}%`, top:`${25+i%3*25}%`,
            background: i%2===0 ? 'rgba(0,245,255,0.5)' : 'rgba(77,158,255,0.4)' }}
          animate={{ y:[0,-18,0], opacity:[0.3,0.8,0.3] }}
          transition={{ duration:3+i*0.3, repeat:Infinity, delay:i*0.4 }} />
      ))}

      <div className="relative flex flex-col items-center gap-4 text-center z-10">
        <motion.div animate={dragging ? { y:-6, scale:1.1 } : { y:0, scale:1 }}
          className="w-14 h-14 rounded-2xl bg-blue-electric/10 border border-blue-electric/20 flex items-center justify-center">
          <Upload size={24} className="text-cyan-glow" />
        </motion.div>

        {uploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between font-mono text-xs text-slate-500 mb-1">
              <span>Uploading & extracting…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width:`${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric" />
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="font-body text-base text-slate-200 font-medium mb-1">
                Drop documents here or <span className="text-cyan-glow">browse</span>
              </p>
              <p className="font-mono text-xs text-slate-600">PDF · DOCX · TXT · JSON · CSV</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['PDF','DOCX','TXT','JSON','CSV'].map(ext => (
                <span key={ext} className="font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg tracking-wider">{ext}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CollectionCard({ col, i }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:i*0.07 }}
      className="bg-white/2 border border-white/8 rounded-xl overflow-hidden hover:border-cyan-glow/20 transition-all">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0">
          <Database size={14} className="text-cyan-glow" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-mono text-sm text-cyan-glow font-bold">{col.name}</p>
          <p className="font-mono text-[10px] text-slate-600">{col.fields.length} fields · est. {col.docs}</p>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-600" /> : <ChevronDown size={13} className="text-slate-600" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
            className="overflow-hidden border-t border-white/5">
            <div className="px-4 py-3 space-y-1">
              {col.fields.map(f => (
                <div key={f} className="flex items-center justify-between py-0.5">
                  <span className="font-mono text-xs text-cyan-glow">{f}</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {f.endsWith('Id') ? 'ObjectId' : f.endsWith('At') ? 'Date' : /salary|price|amount|count|budget/.test(f) ? 'Number' : 'String'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SemanticSearch({ analysis }) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const lower = query.toLowerCase();
    const expandedTerms = [lower,
      ...Object.entries({ income:'salary', staff:'employees', city:'location', headcount:'count' })
        .filter(([k]) => lower.includes(k)).map(([,v]) => v),
    ];
    const found = analysis.suggestedCollections
      .filter(c => expandedTerms.some(t => c.name.includes(t) || c.fields.some(f => f.includes(t))))
      .map(c => ({ text:`Collection: ${c.name} — fields: ${c.fields.join(', ')}`, matched:expandedTerms[0] }));
    if (found.length === 0) found.push({ text:`Semantic match found: ${lower} → related to ${analysis.suggestedCollections[0]?.name}`, matched:lower });
    setResults(found);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key==='Enter' && search()}
            placeholder="Search by concept — try 'employee income' or 'staff location'…"
            className="dash-input w-full pl-9 pr-4 py-3 rounded-xl text-sm" />
        </div>
        <motion.button onClick={search} disabled={loading}
          whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          className="btn-primary px-5 py-3 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />} Search
        </motion.button>
      </div>
      <AnimatePresence>
        {results.map((r,i) => (
          <motion.div key={i} initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:i*0.06 }}
            className="bg-white/3 border border-cyan-glow/10 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
              <span className="font-mono text-[9px] text-cyan-glow">matched: {r.matched}</span>
            </div>
            <p className="font-body text-xs text-slate-300 leading-relaxed">{r.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DocumentAnalysisPage() {
  const { workspace, saveSetupData } = useAuth();
  const [file,      setFile]      = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis,  setAnalysis]  = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [copied,    setCopied]    = useState(false);

  const handleUpload = async (f) => {
    setFile(f); setAnalysis(null); setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2200));
    // Infer workspace from filename and update global context
    const { inferWorkspace } = await import('../store.jsx');
    const ws = inferWorkspace([f], '');
    saveSetupData({ files:[f], connectionString:'' });
    setAnalysis(generateAnalysis(f.name, ws));
    setAnalyzing(false);
  };

  const clearFile = () => { setFile(null); setAnalysis(null); setAnalyzing(false); };

  const TABS = [
    { id:'summary',   label:'Summary',    icon:Sparkles  },
    { id:'schema',    label:'Schema',     icon:Database  },
    { id:'entities',  label:'Entities',   icon:Tag       },
    { id:'queries',   label:'Queries',    icon:BookOpen  },
    { id:'table',     label:'Preview',    icon:Table     },
    { id:'search',    label:'AI Search',  icon:Search    },
  ];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
          <Brain size={11} className="text-cyan-glow" />
          <span className="font-mono text-[10px] tracking-widest">AI DOCUMENT INTELLIGENCE</span>
        </div>
        <h1 className="font-display font-black text-2xl text-white">Document Analysis</h1>
        <p className="font-body text-sm text-slate-400 mt-1">Upload a document — AI extracts schemas, entities & MongoDB insights instantly</p>
      </div>

      {/* Upload zone */}
      {!file && <UploadZone onUpload={handleUpload} />}

      {/* File pill */}
      {file && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-4 dash-card rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-cyan-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-white truncate">{file.name}</p>
            <p className="font-mono text-[10px] text-slate-600">{formatBytes(file.size)}</p>
          </div>
          {analyzing && <div className="flex items-center gap-2"><RefreshCw size={13} className="animate-spin text-cyan-glow"/><span className="font-mono text-xs text-cyan-glow">Analysing…</span></div>}
          {analysis  && <span className="badge-success px-3 py-1 rounded-lg font-mono text-[10px] flex items-center gap-1.5"><Check size={11}/>Complete</span>}
          <button onClick={clearFile} className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </motion.div>
      )}

      {/* Processing animation */}
      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="dash-card rounded-2xl p-8 flex flex-col items-center gap-5">
            <div className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:'linear' }}
                className="w-16 h-16 rounded-2xl border-2 border-cyan-glow/30 border-t-cyan-glow flex items-center justify-center">
                <Brain size={24} className="text-cyan-glow" />
              </motion.div>
              <motion.div animate={{ scale:[1,1.4,1], opacity:[0.3,0,0.3] }}
                transition={{ duration:1.5, repeat:Infinity }}
                className="absolute inset-0 rounded-2xl border border-cyan-glow/20" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-white mb-1">AI Analysing Document</p>
              <p className="font-mono text-xs text-slate-500">Extracting text · Identifying schema · Generating insights</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Text Extraction','Schema Detection','Entity Recognition','Query Generation','Index Suggestions'].map((s,i) => (
                <motion.span key={s} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.35 }}
                  className="badge-info px-3 py-1 rounded-full font-mono text-[10px] flex items-center gap-1.5">
                  <motion.div animate={{ scale:[1,1.5,1] }} transition={{ duration:0.8, repeat:Infinity, delay:i*0.35 }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis results */}
      {analysis && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-6">

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label:'Words',       value:analysis.wordCount.toLocaleString(), icon:BookOpen,   color:'#00f5ff' },
              { label:'Sentences',   value:analysis.sentenceCount,              icon:FileText,   color:'#4d9eff' },
              { label:'Entities',    value:analysis.entities.length,            icon:Tag,        color:'#a855f7' },
              { label:'Collections', value:analysis.suggestedCollections.length,icon:Database,   color:'#22c55e' },
              { label:'Indexes',     value:analysis.suggestedIndexes.length,    icon:TrendingUp, color:'#f59e0b' },
              { label:'Read Time',   value:analysis.readingTime,                icon:Eye,        color:'#ec4899' },
            ].map((s,i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                  className="dash-card rounded-xl p-3 text-center">
                  <Icon size={13} className="mx-auto mb-1.5" style={{ color:s.color }} />
                  <p className="font-display font-black text-lg text-white">{s.value}</p>
                  <p className="font-mono text-[9px] text-slate-600">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap bg-navy-800/40 rounded-xl p-1 w-fit">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${
                    activeTab===t.id ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Icon size={12} />{t.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* Summary tab — shown first, no NLP pipeline */}
            {activeTab==='summary' && (
              <motion.div key="summary" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} className="space-y-5">

                {/* AI Summary card */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">AI Summary</h3>
                    <span className="ml-auto badge-info px-2 py-0.5 rounded-md font-mono text-[9px]">{analysis.topic}</span>
                  </div>
                  <p className="font-body text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Semantic mappings */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Network size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Semantic Mappings</h3>
                    <span className="font-mono text-[10px] text-slate-600 ml-1">— how AI interprets your language</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.semanticMappings.map((m,i) => (
                      <motion.div key={m.input} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.07 }}
                        className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5">
                        <span className="font-mono text-sm text-slate-400 italic">"{m.input}"</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-glow/30 to-transparent mx-2" />
                        <span className="font-mono text-sm text-cyan-glow font-bold">{m.mapped}</span>
                        <span className="font-mono text-[10px] text-green-400">{(m.score*100).toFixed(0)}%</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Hash size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Keywords</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw,i) => (
                      <motion.span key={kw} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                        transition={{ delay:i*0.05, type:'spring', stiffness:200 }}
                        className="font-mono text-xs px-3 py-1.5 rounded-xl bg-white/3 border border-white/8 text-slate-300 hover:border-cyan-glow/25 hover:text-cyan-glow transition-all cursor-default">
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Suggested indexes */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Suggested Indexes</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedIndexes.map((idx,i) => (
                      <motion.div key={i} initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                        className="flex items-start gap-4 bg-white/2 border border-white/5 rounded-xl px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-sm text-cyan-glow">{idx.collection}</span>
                            <span className="badge-info px-1.5 py-0.5 rounded font-mono text-[9px]">{idx.type}</span>
                          </div>
                          <code className="font-mono text-xs text-slate-400">{idx.fields}</code>
                          <p className="font-mono text-[10px] text-slate-600 mt-1">{idx.reason}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Schema tab */}
            {activeTab==='schema' && (
              <motion.div key="schema" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} className="space-y-4">
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Database size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Extracted Collections</h3>
                    <span className="font-mono text-[10px] text-slate-600 ml-1">{analysis.suggestedCollections.length} collections inferred</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedCollections.map((col,i) => (
                      <CollectionCard key={col.name} col={col} i={i} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Entities tab */}
            {activeTab==='entities' && (
              <motion.div key="entities" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Named Entities</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.entities.map((e,i) => (
                      <motion.div key={e.text} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                        className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:e.color }} />
                        <span className="font-mono text-sm text-slate-200 flex-1">{e.text}</span>
                        <span className="font-mono text-[9px] badge-info px-2 py-0.5 rounded-md">{e.type}</span>
                        <span className="font-mono text-[10px] text-slate-600">×{e.count}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Suggested Queries tab */}
            {activeTab==='queries' && (
              <motion.div key="queries" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Suggested MongoDB Queries</h3>
                    <span className="font-mono text-[10px] text-slate-600 ml-1">Generated from document context</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedQueries.map((q,i) => (
                      <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                        className="flex items-center gap-4 bg-white/2 border border-white/5 rounded-xl px-4 py-3 hover:border-cyan-glow/20 transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0 font-mono text-[10px] text-cyan-glow font-bold">
                          {i+1}
                        </div>
                        <p className="font-body text-sm text-slate-300 flex-1 group-hover:text-slate-100 transition-colors">{q}</p>
                        <span className="font-mono text-[9px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">→ Use in AI Engine</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Table Preview tab */}
            {activeTab==='table' && analysis.tablePreview && (
              <motion.div key="table" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                <div className="dash-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5">
                    <h3 className="font-display font-bold text-sm text-white">
                      Preview: <code className="text-cyan-glow">{analysis.tablePreview.collection}</code>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full dash-table text-xs">
                      <thead>
                        <tr>{analysis.tablePreview.headers.map(h => <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {analysis.tablePreview.rows.map((row,i) => (
                          <motion.tr key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.06 }}
                            className="border-t border-white/4 hover:bg-white/2 transition-colors">
                            {analysis.tablePreview.headers.map(h => (
                              <td key={h} className="px-5 py-3 font-mono text-slate-300 whitespace-nowrap">{String(row[h]||'—')}</td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Search tab */}
            {activeTab==='search' && (
              <motion.div key="search" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Search size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Semantic Search</h3>
                    <span className="badge-info px-2 py-0.5 rounded-md font-mono text-[9px] ml-2">AI-powered</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-600 mb-4">Understands meaning — try "employee income" or "staff location"</p>
                  <SemanticSearch analysis={analysis} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty state */}
      {!file && !analyzing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {[
            { icon:Brain,    title:'Schema Extraction',   desc:'Auto-detect collections, fields, relationships',    color:'#00f5ff' },
            { icon:Database, title:'Query Generation',     desc:'Get ready-to-use MongoDB queries from your document',color:'#4d9eff' },
            { icon:Search,   title:'Semantic Search',      desc:'Find concepts not just keywords inside your doc',   color:'#a855f7' },
          ].map((f,i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                className="dash-card rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background:`${f.color}15`, border:`1px solid ${f.color}25` }}>
                  <Icon size={20} style={{ color:f.color }} />
                </div>
                <h4 className="font-display font-bold text-sm text-white mb-1">{f.title}</h4>
                <p className="font-mono text-[10px] text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
