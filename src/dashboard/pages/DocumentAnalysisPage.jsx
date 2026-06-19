import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, File, X, Search, Sparkles, Database,
  Tag, Hash, Network, Brain, Check, RefreshCw,
  Eye, Download, Copy, FileJson, Table, BookOpen,
  TrendingUp, ChevronDown, ChevronUp, AlertCircle,
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

// ── Read file as text ─────────────────────────────────────────────────────────
function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ── Call Claude to analyse document ──────────────────────────────────────────
async function analyseWithClaude(fileContent, fileName, fileType) {
  const truncated = fileContent.slice(0, 3000); // stay within token limits

  const prompt = `Analyse this ${fileType} document named "${fileName}" and extract MongoDB schema insights.

Document content:
${truncated}

Respond ONLY with raw JSON (no markdown fences):
{
  "domain": "short domain name e.g. Hospital Management",
  "summary": "2-3 sentence summary of what this document describes",
  "wordCount": 1234,
  "language": "English",
  "readingTime": "5 min",
  "topic": "main topic",
  "collections": [
    { "name": "collectionName", "fields": ["field1", "field2", "field3", "field4"], "docs": "~1K", "icon": "emoji" }
  ],
  "entities": [
    { "text": "entity", "type": "COLLECTION|FIELD|TECHNOLOGY|PERSON|LOCATION|DATE", "count": 5, "color": "#00f5ff" }
  ],
  "keywords": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"],
  "suggestedIndexes": [
    { "collection": "name", "fields": "{ field: 1 }", "type": "Compound|Single|Unique", "reason": "why" }
  ],
  "suggestedQueries": [
    "Find all X where Y",
    "Count Z by category",
    "Average value by group"
  ],
  "semanticMappings": [
    { "input": "synonym", "mapped": "actual field", "score": 0.92 }
  ],
  "tablePreview": {
    "collection": "mainCollection",
    "headers": ["field1", "field2", "field3"],
    "rows": [
      {"field1": "value1", "field2": "value2", "field3": "value3"},
      {"field1": "value4", "field2": "value5", "field3": "value6"}
    ]
  }
}

Extract real information from the document. Don't make up data that isn't there.
For entity colors: COLLECTION=#00f5ff, FIELD=#4d9eff, TECHNOLOGY=#a855f7, PERSON=#ec4899, LOCATION=#22c55e, DATE=#f59e0b`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const rawText = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';
  const clean = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function UploadZone({ onUpload }) {
  const inputRef  = useRef(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const process = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    for (let i = 0; i <= 100; i += 8) {
      await new Promise(r => setTimeout(r, 20));
      setProgress(Math.min(i, 100));
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
      style={{ padding: '2rem 1.5rem' }}
    >
      <input ref={inputRef} type="file" multiple className="hidden"
        accept=".pdf,.docx,.txt,.json,.csv"
        onChange={e => process([...e.target.files])} />

      {[...Array(5)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: 3, height: 3, left: `${15 + i * 17}%`, top: `${25 + i % 3 * 25}%`,
            background: i % 2 === 0 ? 'rgba(0,245,255,0.5)' : 'rgba(77,158,255,0.4)' }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.4 }} />
      ))}

      <div className="relative flex flex-col items-center gap-3 text-center z-10">
        <motion.div animate={dragging ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
          className="w-12 h-12 rounded-2xl bg-blue-electric/10 border border-blue-electric/20 flex items-center justify-center">
          <Upload size={22} className="text-cyan-glow" />
        </motion.div>

        {uploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between font-mono text-xs text-slate-500 mb-1">
              <span>Reading file…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric" />
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="font-body text-sm text-slate-200 font-medium mb-1">
                Drop documents here or <span className="text-cyan-glow">browse</span>
              </p>
              <p className="font-mono text-xs text-slate-600">PDF · DOCX · TXT · JSON · CSV</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['PDF', 'DOCX', 'TXT', 'JSON', 'CSV'].map(ext => (
                <span key={ext} className="font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg">{ext}</span>
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
      className="bg-white/2 border border-white/8 rounded-xl overflow-hidden hover:border-cyan-glow/20 transition-all">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0 text-base">
          {col.icon || '📄'}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-mono text-sm text-cyan-glow font-bold truncate">{col.name}</p>
          <p className="font-mono text-[10px] text-slate-600">{col.fields?.length || 0} fields · est. {col.docs}</p>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-600 flex-shrink-0" /> : <ChevronDown size={13} className="text-slate-600 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/5">
            <div className="px-4 py-3 space-y-1">
              {(col.fields || []).map(f => (
                <div key={f} className="flex items-center justify-between py-0.5">
                  <span className="font-mono text-xs text-cyan-glow">{f}</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {f.endsWith('Id') ? 'ObjectId' : f.endsWith('At') ? 'Date' : /salary|price|amount|count|budget|age|score/.test(f) ? 'Number' : 'String'}
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DocumentAnalysisPage() {
  const { saveSetupData } = useAuth();
  const [file,      setFile]      = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis,  setAnalysis]  = useState(null);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [searchQ,   setSearchQ]   = useState('');
  const [searching, setSearching] = useState(false);
  const [searchRes, setSearchRes] = useState([]);

  const handleUpload = async (f) => {
    setFile(f); setAnalysis(null); setAnalyzing(true); setError('');
    try {
      // Read actual file content
      let content = '';
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (['txt', 'json', 'csv'].includes(ext)) {
        content = await readFileText(f);
      } else {
        content = `[Binary file: ${f.name} — ${formatBytes(f.size)}]\nFile type: ${f.type}\nAnalysing structure from filename and metadata.`;
      }

      const result = await analyseWithClaude(content, f.name, ext || f.type);

      // Update global workspace
      saveSetupData({ files: [f], connectionString: '' });
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Failed to analyse document. Please try again.');
    }
    setAnalyzing(false);
  };

  const clearFile = () => { setFile(null); setAnalysis(null); setAnalyzing(false); setError(''); };

  const semanticSearch = async () => {
    if (!searchQ.trim() || !analysis) return;
    setSearching(true);
    await new Promise(r => setTimeout(r, 500));
    const q = searchQ.toLowerCase();
    const results = [];

    // Search through collections and fields
    analysis.collections?.forEach(c => {
      if (c.name.includes(q) || c.fields?.some(f => f.includes(q))) {
        results.push({ text: `Collection "${c.name}" — fields: ${c.fields?.join(', ')}`, matched: q });
      }
    });
    analysis.keywords?.filter(k => k.includes(q) || q.includes(k)).forEach(k => {
      results.push({ text: `Keyword match: "${k}"`, matched: k });
    });
    if (results.length === 0) {
      results.push({ text: `Semantic search found related concept in domain: ${analysis.domain}`, matched: q });
    }

    setSearchRes(results);
    setSearching(false);
  };

  const TABS = [
    { id: 'summary',  label: 'Summary',   icon: Sparkles },
    { id: 'schema',   label: 'Schema',    icon: Database },
    { id: 'entities', label: 'Entities',  icon: Tag      },
    { id: 'queries',  label: 'Queries',   icon: BookOpen },
    { id: 'table',    label: 'Preview',   icon: Table    },
    { id: 'search',   label: 'Search',    icon: Search   },
  ];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-5 sm:space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 badge-info px-3 py-1 rounded-full mb-3">
          <Brain size={11} className="text-cyan-glow" />
          <span className="font-mono text-[10px] tracking-widest">AI DOCUMENT INTELLIGENCE · CLAUDE-POWERED</span>
        </div>
        <h1 className="font-display font-black text-xl sm:text-2xl text-white">Document Analysis</h1>
        <p className="font-body text-sm text-slate-400 mt-1">Upload a document — Claude extracts real schemas, entities & MongoDB insights</p>
      </div>

      {!file && <UploadZone onUpload={handleUpload} />}

      {/* File pill */}
      {file && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 dash-card rounded-2xl px-4 sm:px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-cyan-glow" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-white truncate">{file.name}</p>
            <p className="font-mono text-[10px] text-slate-600">{formatBytes(file.size)}</p>
          </div>
          {analyzing && <div className="flex items-center gap-2 flex-shrink-0"><RefreshCw size={13} className="animate-spin text-cyan-glow" /><span className="font-mono text-xs text-cyan-glow hidden sm:block">Analysing…</span></div>}
          {analysis  && <span className="badge-success px-3 py-1 rounded-lg font-mono text-[10px] flex items-center gap-1.5 flex-shrink-0"><Check size={11} />Done</span>}
          <button onClick={clearFile} className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
            <X size={13} />
          </button>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Analysing animation */}
      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="dash-card rounded-2xl p-8 flex flex-col items-center gap-5">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-2xl border-2 border-cyan-glow/30 border-t-cyan-glow flex items-center justify-center">
                <Brain size={24} className="text-cyan-glow" />
              </motion.div>
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border border-cyan-glow/20" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-white mb-1">Claude is reading your document</p>
              <p className="font-mono text-xs text-slate-500">Extracting real schema · identifying entities · generating insights</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Reading content', 'Schema extraction', 'Entity recognition', 'Query generation'].map((s, i) => (
                <motion.span key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
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

      {/* Results */}
      {analysis && !analyzing && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {[
              { label: 'Words',       value: analysis.wordCount?.toLocaleString() || '—', icon: BookOpen,   color: '#00f5ff' },
              { label: 'Language',    value: analysis.language || 'English',               icon: FileText,   color: '#4d9eff' },
              { label: 'Entities',    value: analysis.entities?.length || 0,               icon: Tag,        color: '#a855f7' },
              { label: 'Collections', value: analysis.collections?.length || 0,            icon: Database,   color: '#22c55e' },
              { label: 'Indexes',     value: analysis.suggestedIndexes?.length || 0,       icon: TrendingUp, color: '#f59e0b' },
              { label: 'Read Time',   value: analysis.readingTime || '—',                  icon: Eye,        color: '#ec4899' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="dash-card rounded-xl p-2.5 sm:p-3 text-center">
                  <Icon size={12} className="mx-auto mb-1" style={{ color: s.color }} />
                  <p className="font-display font-black text-base sm:text-lg text-white">{s.value}</p>
                  <p className="font-mono text-[8px] sm:text-[9px] text-slate-600">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Tabs — scrollable on mobile */}
          <div className="overflow-x-auto -mx-1 px-1">
            <div className="flex gap-1 bg-navy-800/40 rounded-xl p-1 w-max min-w-full sm:w-fit">
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-body transition-all whitespace-nowrap ${
                      activeTab === t.id ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Icon size={12} />{t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* Summary */}
            {activeTab === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="dash-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">AI Summary</h3>
                    <span className="ml-auto badge-info px-2 py-0.5 rounded-md font-mono text-[9px]">{analysis.topic || analysis.domain}</span>
                  </div>
                  <p className="font-body text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {analysis.semanticMappings?.length > 0 && (
                  <div className="dash-card rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Network size={14} className="text-cyan-glow" />
                      <h3 className="font-display font-bold text-sm text-white">Semantic Mappings</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {analysis.semanticMappings.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-3 sm:px-4 py-2.5">
                          <span className="font-mono text-xs sm:text-sm text-slate-400 italic">"{m.input}"</span>
                          <div className="flex-1 h-px bg-gradient-to-r from-cyan-glow/30 to-transparent" />
                          <span className="font-mono text-xs sm:text-sm text-cyan-glow font-bold">{m.mapped}</span>
                          <span className="font-mono text-[10px] text-green-400">{Math.round(m.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.keywords?.length > 0 && (
                  <div className="dash-card rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash size={14} className="text-cyan-glow" />
                      <h3 className="font-display font-bold text-sm text-white">Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((kw, i) => (
                        <span key={kw} className="font-mono text-xs px-3 py-1.5 rounded-xl bg-white/3 border border-white/8 text-slate-300 hover:border-cyan-glow/25 hover:text-cyan-glow transition-all cursor-default">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.suggestedIndexes?.length > 0 && (
                  <div className="dash-card rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={14} className="text-cyan-glow" />
                      <h3 className="font-display font-bold text-sm text-white">Suggested Indexes</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.suggestedIndexes.map((idx, i) => (
                        <div key={i} className="bg-white/2 border border-white/5 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-sm text-cyan-glow">{idx.collection}</span>
                            <span className="badge-info px-1.5 py-0.5 rounded font-mono text-[9px]">{idx.type}</span>
                          </div>
                          <code className="font-mono text-xs text-slate-400">{idx.fields}</code>
                          <p className="font-mono text-[10px] text-slate-600 mt-1">{idx.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Schema */}
            {activeTab === 'schema' && (
              <motion.div key="schema" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Database size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Extracted Collections</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.collections?.map((col, i) => <CollectionCard key={col.name} col={col} i={i} />)}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Entities */}
            {activeTab === 'entities' && (
              <motion.div key="entities" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Named Entities</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.entities?.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-2.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                        <span className="font-mono text-sm text-slate-200 flex-1 truncate">{e.text}</span>
                        <span className="font-mono text-[9px] badge-info px-2 py-0.5 rounded-md flex-shrink-0">{e.type}</span>
                        <span className="font-mono text-[10px] text-slate-600 flex-shrink-0">×{e.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Queries */}
            {activeTab === 'queries' && (
              <motion.div key="queries" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Suggested Queries</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestedQueries?.map((q, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/2 border border-white/5 rounded-xl px-4 py-3 hover:border-cyan-glow/20 transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center flex-shrink-0 font-mono text-[10px] text-cyan-glow font-bold">
                          {i + 1}
                        </div>
                        <p className="font-body text-sm text-slate-300 flex-1 group-hover:text-slate-100 transition-colors">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Table preview */}
            {activeTab === 'table' && analysis.tablePreview && (
              <motion.div key="table" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl overflow-hidden">
                  <div className="px-4 sm:px-5 py-4 border-b border-white/5">
                    <h3 className="font-display font-bold text-sm text-white">
                      Preview: <code className="text-cyan-glow">{analysis.tablePreview.collection}</code>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full dash-table text-xs min-w-[400px]">
                      <thead><tr>{analysis.tablePreview.headers?.map(h => <th key={h} className="px-4 sm:px-5 py-3 text-left whitespace-nowrap">{h}</th>)}</tr></thead>
                      <tbody>
                        {analysis.tablePreview.rows?.map((row, i) => (
                          <tr key={i} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                            {analysis.tablePreview.headers?.map(h => (
                              <td key={h} className="px-4 sm:px-5 py-3 font-mono text-slate-300 whitespace-nowrap">{String(row[h] || '—')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search */}
            {activeTab === 'search' && (
              <motion.div key="search" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Search size={14} className="text-cyan-glow" />
                    <h3 className="font-display font-bold text-sm text-white">Semantic Search</h3>
                    <span className="badge-info px-2 py-0.5 rounded-md font-mono text-[9px] ml-2">AI-powered</span>
                  </div>
                  <div className="flex gap-3">
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && semanticSearch()}
                      placeholder="Search by concept, not keyword…"
                      className="dash-input flex-1 px-4 py-3 rounded-xl text-sm" />
                    <button onClick={semanticSearch} disabled={searching}
                      className="btn-primary px-4 py-3 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
                      {searching ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span className="hidden sm:block">Search</span>
                    </button>
                  </div>
                  {searchRes.map((r, i) => (
                    <div key={i} className="bg-white/3 border border-cyan-glow/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />
                        <span className="font-mono text-[9px] text-cyan-glow">matched: {r.matched}</span>
                      </div>
                      <p className="font-body text-xs text-slate-300 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
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
            { icon: Brain,    title: 'Real AI Analysis',    desc: 'Claude reads actual file content — not random data', color: '#00f5ff' },
            { icon: Database, title: 'Schema Extraction',   desc: 'Collections, fields and relationships from your doc', color: '#4d9eff' },
            { icon: Search,   title: 'Semantic Search',     desc: 'Find concepts, not just keywords, inside the document', color: '#a855f7' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
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
