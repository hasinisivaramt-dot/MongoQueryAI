import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, File, X, ChevronDown, ChevronUp,
  Search, Sparkles, Database, Tag, Hash, Network,
  BarChart3, Layers, Brain, Check, AlertCircle, RefreshCw,
  Eye, Download, Copy, ZoomIn, List, Grid,
  FileJson, Table, BookOpen, Cpu, Target, TrendingUp,
} from 'lucide-react';

// ─── page variants ────────────────────────────────────────────────────────────
const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeIcon(type) {
  if (type.includes('pdf'))  return { Icon: FileText, color: '#f87171' };
  if (type.includes('json')) return { Icon: FileJson, color: '#4d9eff' };
  if (type.includes('csv'))  return { Icon: Table,    color: '#22c55e' };
  return { Icon: File, color: '#a855f7' };
}

// ─── mock AI analysis results (simulate Anthropic API call) ───────────────────
function generateAnalysis(fileName) {
  return {
    topic:       'Employee Management & Organizational Data',
    summary:     'This document describes an organizational data structure covering employee records, department hierarchies, project assignments, and compensation details. It includes references to MongoDB schema patterns for scalable storage of HR data.',
    wordCount:   2841,
    charCount:   18293,
    sentenceCount: 142,
    readingTime: '11 min',
    language:    'English',
    entities: [
      { text: 'employees',   type: 'COLLECTION', count: 34, color: '#00f5ff' },
      { text: 'departments', type: 'COLLECTION', count: 18, color: '#00f5ff' },
      { text: 'salary',      type: 'FIELD',      count: 22, color: '#4d9eff' },
      { text: 'Hyderabad',   type: 'LOCATION',   count: 9,  color: '#22c55e' },
      { text: 'MongoDB',     type: 'TECHNOLOGY', count: 15, color: '#a855f7' },
      { text: 'ObjectId',    type: 'TYPE',       count: 11, color: '#f59e0b' },
      { text: 'John Smith',  type: 'PERSON',     count: 3,  color: '#ec4899' },
      { text: 'Q3 2025',     type: 'DATE',       count: 5,  color: '#22c55e' },
    ],
    keywords: [
      { word: 'employee', freq: 34, size: 'xl' },
      { word: 'salary',   freq: 22, size: 'lg' },
      { word: 'MongoDB',  freq: 15, size: 'md' },
      { word: 'schema',   freq: 13, size: 'md' },
      { word: 'index',    freq: 11, size: 'sm' },
      { word: 'query',    freq: 9,  size: 'sm' },
      { word: 'aggregate',freq: 8,  size: 'sm' },
      { word: 'pipeline', freq: 7,  size: 'xs' },
      { word: 'find',     freq: 6,  size: 'xs' },
      { word: 'collection',freq: 6, size: 'xs' },
    ],
    suggestedCollections: [
      { name: 'employees',   fields: ['_id','name','email','dept','salary','location','createdAt'], docs: '~10K' },
      { name: 'departments', fields: ['_id','name','managerId','budget','headcount'],               docs: '~50'  },
      { name: 'projects',    fields: ['_id','title','assignees','status','deadline'],               docs: '~200' },
      { name: 'salaries',    fields: ['_id','employeeId','amount','currency','period'],             docs: '~50K' },
    ],
    suggestedIndexes: [
      { collection: 'employees',   fields: '{ dept: 1, salary: -1 }',   type: 'Compound', reason: 'Frequent filter + sort pattern' },
      { collection: 'employees',   fields: '{ email: 1 }',              type: 'Unique',   reason: 'Email lookups for auth' },
      { collection: 'salaries',    fields: '{ employeeId: 1, period: -1 }', type: 'Compound', reason: 'Per-employee history queries' },
    ],
    nlpStages: [
      { name: 'Text Cleaning',           output: 'Removed 142 stop words, normalized whitespace', done: true },
      { name: 'Tokenization',            output: '2,841 tokens identified across 142 sentences',  done: true },
      { name: 'Lemmatization',           output: 'employees→employee, salaries→salary (+28 more)', done: true },
      { name: 'POS Tagging',             output: '834 nouns · 412 verbs · 291 adjectives',        done: true },
      { name: 'Named Entity Recognition',output: '8 entity types · 117 entity occurrences',       done: true },
      { name: 'Semantic Similarity',     output: 'income↔salary 0.94 · staff↔employees 0.91',     done: true },
    ],
    semanticMappings: [
      { input: 'income',      mapped: 'salary',      score: 0.94 },
      { input: 'staff',       mapped: 'employees',   score: 0.91 },
      { input: 'city',        mapped: 'location',    score: 0.88 },
      { input: 'headcount',   mapped: 'count',       score: 0.85 },
      { input: 'compensation',mapped: 'salary',      score: 0.92 },
      { input: 'workforce',   mapped: 'employees',   score: 0.87 },
    ],
    extractedText: `EMPLOYEE MANAGEMENT SYSTEM — SCHEMA DOCUMENTATION

This document outlines the MongoDB schema and data management practices for the Employee Management System used across Hyderabad and Mumbai offices.

## Collections

### employees
Stores all employee records including personal information, department assignment, salary details, and location data.

Fields: _id (ObjectId), name (String), email (String), dept (String), salary (Number), location (String), createdAt (Date), status (String)

### departments
Contains department hierarchy with manager references and budget allocations.

Fields: _id (ObjectId), name (String), managerId (ObjectId ref employees), budget (Number), headcount (Number)

## Relationships
Each employee belongs to exactly one department. Projects can have multiple assignees from different departments. Salary history is tracked separately to support audit trails.

## Query Patterns
Most frequent queries involve filtering employees by department and sorting by salary. Aggregations grouping employees by location and computing average compensation are also common.`,
  };
}

// ─── sub-components ───────────────────────────────────────────────────────────
function UploadZone({ onUpload }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const process = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 4) {
      await new Promise(r => setTimeout(r, 30));
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
      style={{ padding: '3rem 2rem' }}
    >
      <input ref={inputRef} type="file" multiple className="hidden"
        accept=".pdf,.docx,.txt,.json,.csv"
        onChange={e => process([...e.target.files])} />

      {/* Animated background particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
            left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 30}%`,
            background: i % 2 === 0 ? 'rgba(0,245,255,0.5)' : 'rgba(77,158,255,0.4)',
          }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="relative flex flex-col items-center gap-4 text-center z-10">
        <motion.div animate={dragging ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-blue-electric/10 border border-blue-electric/20 flex items-center justify-center">
          <Upload size={26} className="text-cyan-glow" />
        </motion.div>

        {uploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between font-mono text-xs text-slate-500 mb-1">
              <span>Uploading & extracting…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric" />
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="font-body text-base text-slate-200 font-medium mb-1">
                Drop documents here or <span className="text-cyan-glow">browse</span>
              </p>
              <p className="font-mono text-xs text-slate-600">
                PDF · DOCX · TXT · JSON · CSV — up to 50 MB
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['PDF','DOCX','TXT','JSON','CSV'].map(ext => (
                <span key={ext} className="font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg tracking-wider">
                  {ext}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function NLPPipeline({ stages, running }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="dash-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-white/5 hover:bg-white/2 transition-colors">
        <Cpu size={15} className="text-cyan-glow" />
        <span className="font-display font-bold text-sm text-white">NLP Processing Pipeline</span>
        <span className="ml-auto">{open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="p-5 space-y-3">
              {stages.map((stage, i) => (
                <motion.div key={stage.name}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-start gap-4">
                  <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                    <motion.div
                      animate={running && !stage.done ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${stage.done ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5 border border-white/10'}`}>
                      {stage.done
                        ? <Check size={11} className="text-green-400" />
                        : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                    </motion.div>
                    {i < stages.length - 1 && (
                      <div className={`w-px h-5 mt-1 ${stage.done ? 'bg-green-500/30' : 'bg-white/5'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className={`font-mono text-xs font-bold mb-0.5 ${stage.done ? 'text-white' : 'text-slate-600'}`}>
                      {stage.name}
                    </p>
                    {stage.done && (
                      <p className="font-mono text-[10px] text-slate-500">{stage.output}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WordCloud({ keywords }) {
  const sizes = { xl: 'text-2xl', lg: 'text-xl', md: 'text-base', sm: 'text-sm', xs: 'text-xs' };
  const colors = ['text-cyan-glow', 'text-blue-400', 'text-purple-400', 'text-green-400', 'text-yellow-400', 'text-pink-400'];
  return (
    <div className="dash-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Hash size={14} className="text-cyan-glow" />
        <h3 className="font-display font-bold text-sm text-white">Keyword Cloud</h3>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[100px]">
        {keywords.map((kw, i) => (
          <motion.span key={kw.word}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.15 }}
            className={`${sizes[kw.size]} ${colors[i % colors.length]} font-display font-bold cursor-default transition-all`}
            title={`Frequency: ${kw.freq}`}>
            {kw.word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function EntityCard({ entity }) {
  const typeBadge = {
    COLLECTION: 'badge-info',
    FIELD:      'badge-info',
    LOCATION:   'badge-success',
    TECHNOLOGY: 'badge-warning',
    PERSON:     'bg-pink-500/15 border border-pink-500/30 text-pink-400',
    DATE:       'badge-success',
    TYPE:       'badge-warning',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5 hover:border-cyan-glow/20 transition-all">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entity.color }} />
      <span className="font-mono text-sm text-slate-200 flex-1">{entity.text}</span>
      <span className={`${typeBadge[entity.type] || 'badge-info'} font-mono text-[9px] px-2 py-0.5 rounded-md`}>
        {entity.type}
      </span>
      <span className="font-mono text-[10px] text-slate-600">×{entity.count}</span>
    </motion.div>
  );
}

function SchemaCard({ col, i }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
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
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/5">
            <div className="px-4 py-3 grid grid-cols-1 gap-1">
              {col.fields.map(f => {
                const [name, type] = f.split(':').map(s => s.trim());
                const actualName = name || f;
                const actualType = type || (f.includes('Id') ? 'ObjectId' : f.includes('At') ? 'Date' : f === 'salary' || f === 'budget' ? 'Number' : 'String');
                return (
                  <div key={f} className="flex items-center justify-between py-1">
                    <span className="font-mono text-xs text-cyan-glow">{actualName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{actualType}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SemanticSearch({ extractedText }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const SEMANTIC_SYNONYMS = {
    salary: ['income', 'compensation', 'wage', 'pay', 'remuneration', 'earnings'],
    employees: ['staff', 'workforce', 'personnel', 'workers', 'team', 'headcount'],
    location: ['city', 'place', 'office', 'region', 'area', 'branch'],
    department: ['dept', 'division', 'unit', 'group', 'team'],
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    await new Promise(r => setTimeout(r, 700));
    // Simple semantic simulation
    const lower = query.toLowerCase();
    let expandedTerms = [lower];
    Object.entries(SEMANTIC_SYNONYMS).forEach(([canonical, synonyms]) => {
      if (synonyms.some(s => lower.includes(s)) || lower.includes(canonical)) {
        expandedTerms = [...expandedTerms, canonical, ...synonyms];
      }
    });
    const sentences = extractedText.split(/[.\n]+/).filter(s => s.trim().length > 20);
    const found = sentences
      .filter(s => expandedTerms.some(t => s.toLowerCase().includes(t)))
      .slice(0, 4)
      .map(s => ({ text: s.trim(), matched: expandedTerms.find(t => s.toLowerCase().includes(t)) || lower }));
    setResults(found);
    setSearching(false);
  };

  return (
    <div className="dash-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Search size={14} className="text-cyan-glow" />
        <h3 className="font-display font-bold text-sm text-white">Semantic Search</h3>
        <span className="ml-2 badge-info px-2 py-0.5 rounded-md font-mono text-[9px]">AI-powered</span>
      </div>
      <p className="font-mono text-[10px] text-slate-600">Understands meaning — try "employee income" or "staff location"</p>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search by concept, not keyword…"
            className="dash-input w-full pl-9 pr-4 py-3 rounded-xl text-sm" />
        </div>
        <motion.button onClick={search} disabled={searching}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-primary px-5 py-3 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
          {searching ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Search
        </motion.button>
      </div>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2">
            <p className="font-mono text-[10px] text-slate-600">{results.length} semantically relevant passages found</p>
            {results.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/3 border border-cyan-glow/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                  <span className="font-mono text-[9px] text-cyan-glow">matched: {r.matched}</span>
                </div>
                <p className="font-body text-xs text-slate-300 leading-relaxed">{r.text}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
        {results.length === 0 && query && !searching && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-mono text-xs text-slate-600 text-center py-2">
            No matching passages found — try different terms
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBar({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[10px] text-slate-500">{label}</span>
        <span className="font-mono text-[10px] text-slate-300">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }}
          animate={{ width: `${Math.min((parseInt(String(value).replace(/[^0-9]/g, '')) / max) * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function DocumentAnalysisPage() {
  const [file, setFile]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis]   = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [copied, setCopied]       = useState(false);

  const handleUpload = async (f) => {
    setFile(f);
    setAnalysis(null);
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2800));
    setAnalysis(generateAnalysis(f.name));
    setAnalyzing(false);
  };

  const clearFile = () => { setFile(null); setAnalysis(null); setAnalyzing(false); };

  const copyText = () => {
    navigator.clipboard.writeText(analysis?.extractedText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: 'insights',   label: 'Insights',    icon: Sparkles  },
    { id: 'entities',   label: 'Entities',    icon: Tag       },
    { id: 'schema',     label: 'Schema',      icon: Database  },
    { id: 'search',     label: 'AI Search',   icon: Search    },
    { id: 'text',       label: 'Extracted',   icon: FileText  },
  ];

  const { Icon: FIcon, color: fColor } = file ? fileTypeIcon(file.type) : { Icon: File, color: '#a855f7' };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
            <Brain size={11} className="text-cyan-glow" />
            <span className="font-mono text-[10px] tracking-widest">AI DOCUMENT INTELLIGENCE</span>
          </div>
          <h1 className="font-display font-black text-2xl text-white">Document Analysis</h1>
          <p className="font-body text-sm text-slate-400 mt-1">Upload documents · AI extracts schemas, entities & MongoDB insights</p>
        </div>
      </div>

      {/* Upload zone */}
      {!file && <UploadZone onUpload={handleUpload} />}

      {/* File pill + re-upload */}
      {file && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 dash-card rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${fColor}15`, border: `1px solid ${fColor}20` }}>
            <FIcon size={18} style={{ color: fColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-white truncate">{file.name}</p>
            <p className="font-mono text-[10px] text-slate-600">{formatBytes(file.size)} · {file.type || 'text/plain'}</p>
          </div>
          {analyzing && (
            <div className="flex items-center gap-2">
              <RefreshCw size={13} className="animate-spin text-cyan-glow" />
              <span className="font-mono text-xs text-cyan-glow">Analysing…</span>
            </div>
          )}
          {analysis && (
            <span className="badge-success px-3 py-1 rounded-lg font-mono text-[10px] flex items-center gap-1.5">
              <Check size={11} /> Complete
            </span>
          )}
          <button onClick={clearFile}
            className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </motion.div>
      )}

      {/* AI Processing animation */}
      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="dash-card rounded-2xl p-8 flex flex-col items-center gap-5">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-2xl border-2 border-cyan-glow/30 border-t-cyan-glow flex items-center justify-center">
                <Brain size={24} className="text-cyan-glow" />
              </motion.div>
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border border-cyan-glow/20" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-white mb-1">AI Analysing Document</p>
              <p className="font-mono text-xs text-slate-500">Extracting text · NLP preprocessing · Entity recognition · Schema inference</p>
            </div>
            {/* stage pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {['Text Extraction', 'Tokenization', 'NER', 'Schema Mapping', 'Insight Generation'].map((s, i) => (
                <motion.span key={s}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
                  className="badge-info px-3 py-1 rounded-full font-mono text-[10px] flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.4 }}
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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Words',       value: analysis.wordCount.toLocaleString(), icon: BookOpen,   color: '#00f5ff' },
              { label: 'Sentences',   value: analysis.sentenceCount,              icon: List,       color: '#4d9eff' },
              { label: 'Entities',    value: analysis.entities.length,            icon: Tag,        color: '#a855f7' },
              { label: 'Collections', value: analysis.suggestedCollections.length,icon: Database,   color: '#22c55e' },
              { label: 'Indexes',     value: analysis.suggestedIndexes.length,    icon: TrendingUp, color: '#f59e0b' },
              { label: 'Read Time',   value: analysis.readingTime,                icon: Eye,        color: '#ec4899' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="dash-card rounded-xl p-3 text-center">
                  <Icon size={13} className="mx-auto mb-1.5" style={{ color: s.color }} />
                  <p className="font-display font-black text-lg text-white">{s.value}</p>
                  <p className="font-mono text-[9px] text-slate-600">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* NLP Pipeline */}
          <NLPPipeline stages={analysis.nlpStages} running={false} />

          {/* Tabs */}
          <div className="flex gap-1 flex-wrap bg-navy-800/40 rounded-xl p-1 w-fit">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${
                    activeTab === t.id
                      ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300'}`}>
                  <Icon size={12} />{t.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* Insights tab */}
            {activeTab === 'insights' && (
              <motion.div key="insights"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-5">
                {/* Summary card */}
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
                    {analysis.semanticMappings.map((m, i) => (
                      <motion.div key={m.input} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5">
                        <span className="font-mono text-sm text-slate-400 italic">"{m.input}"</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-glow/30 to-transparent mx-2" />
                        <span className="font-mono text-sm text-cyan-glow font-bold">{m.mapped}</span>
                        <span className="font-mono text-[10px] text-green-400">{(m.score * 100).toFixed(0)}%</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Word cloud */}
                <WordCloud keywords={analysis.keywords} />

                {/* Suggested indexes */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Suggested Indexes</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedIndexes.map((idx, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
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

            {/* Entities tab */}
            {activeTab === 'entities' && (
              <motion.div key="entities"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Named Entities</h3>
                    <span className="ml-auto font-mono text-[10px] text-slate-600">{analysis.entities.length} entities detected</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.entities.map((e, i) => (
                      <motion.div key={e.text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}>
                        <EntityCard entity={e} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Entity type breakdown */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Entity Distribution</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { type: 'COLLECTION', count: 2, color: '#00f5ff' },
                      { type: 'FIELD',      count: 1, color: '#4d9eff' },
                      { type: 'TECHNOLOGY', count: 1, color: '#a855f7' },
                      { type: 'LOCATION',   count: 1, color: '#22c55e' },
                      { type: 'DATE',       count: 1, color: '#22c55e' },
                      { type: 'TYPE',       count: 1, color: '#f59e0b' },
                      { type: 'PERSON',     count: 1, color: '#ec4899' },
                    ].map(item => (
                      <StatBar key={item.type} label={item.type} value={item.count} max={3} color={item.color} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Schema tab */}
            {activeTab === 'schema' && (
              <motion.div key="schema"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Database size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Extracted Schema</h3>
                    <span className="font-mono text-[10px] text-slate-600 ml-1">{analysis.suggestedCollections.length} collections inferred</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedCollections.map((col, i) => (
                      <SchemaCard key={col.name} col={col} i={i} />
                    ))}
                  </div>
                </div>

                {/* Relationship diagram (text-based) */}
                <div className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Network size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Relationships</h3>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      { from: 'employees', to: 'departments', via: 'dept (String ref)', type: 'N:1' },
                      { from: 'employees', to: 'projects',    via: 'assignees (array)', type: 'N:M' },
                      { from: 'salaries',  to: 'employees',   via: 'employeeId (ref)',  type: 'N:1' },
                    ].map((r, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5">
                        <span className="text-cyan-glow">{r.from}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-cyan-glow/30 to-transparent" />
                          <span className="text-[10px] text-slate-500">{r.via}</span>
                          <div className="h-px flex-1 bg-gradient-to-l from-cyan-glow/30 to-transparent" />
                        </div>
                        <span className="text-slate-400">{r.to}</span>
                        <span className="badge-info px-1.5 py-0.5 rounded font-mono text-[9px]">{r.type}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Search tab */}
            {activeTab === 'search' && (
              <motion.div key="search"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <SemanticSearch extractedText={analysis.extractedText} />
              </motion.div>
            )}

            {/* Extracted text tab */}
            {activeTab === 'text' && (
              <motion.div key="text"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                    <FileText size={14} className="text-cyan-glow" />
                    <span className="font-display font-bold text-sm text-white">Extracted Content</span>
                    <span className="font-mono text-[10px] text-slate-600 ml-1">
                      {analysis.wordCount.toLocaleString()} words · {analysis.language}
                    </span>
                    <button onClick={copyText}
                      className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-slate-500 hover:text-cyan-glow transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                      {copied ? <><Check size={11} className="text-green-400" /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <div className="p-5 code-output rounded-none max-h-96 overflow-y-auto dash-scroll">
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {analysis.extractedText}
                    </pre>
                  </div>
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
            { icon: Brain,    title: 'NLP Analysis',       desc: 'Tokenization, NER, POS tagging, lemmatization',    color: '#00f5ff' },
            { icon: Database, title: 'Schema Extraction',  desc: 'Auto-detect collections, fields, relationships',   color: '#4d9eff' },
            { icon: Search,   title: 'Semantic Search',    desc: 'Find concepts, not just keywords, inside your doc',color: '#a855f7' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="dash-card rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  <Icon size={20} style={{ color: f.color }} />
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
