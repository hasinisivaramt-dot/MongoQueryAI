import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Upload, X, FileText, Image, File, ArrowRight,
  CheckCircle2, AlertCircle, Link2, Loader2, ChevronRight,
  Paperclip, Eye, EyeOff,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const FILE_ICONS = {
  'image/png': Image, 'image/jpeg': Image, 'image/jpg': Image,
  'image/webp': Image, 'image/gif': Image,
  'application/pdf': FileText, 'text/plain': FileText,
  'application/json': FileText, 'text/csv': FileText,
};

function fileIcon(type) {
  return FILE_ICONS[type] || File;
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── sub-components ────────────────────────────────────────────────────────────
function FileChip({ file, onRemove }) {
  const Icon = fileIcon(file.type);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/8 group"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-electric/15 border border-blue-electric/20 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-cyan-glow" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-slate-200 truncate">{file.name}</p>
        <p className="font-mono text-[10px] text-slate-600">{formatBytes(file.size)}</p>
      </div>
      <button
        onClick={() => onRemove(file.name)}
        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

function DropZone({ files, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming) => {
    const next = [...incoming].filter(
      f => !files.some(ex => ex.name === f.name && ex.size === f.size)
    );
    onAdd(next);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles([...e.dataTransfer.files]);
  }, [files]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="space-y-3">
      {/* drop target */}
      <motion.div
        animate={dragging ? { scale: 1.01 } : { scale: 1 }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none
          ${dragging
            ? 'border-cyan-glow bg-cyan-glow/5 shadow-lg shadow-cyan-glow/10'
            : 'border-white/10 hover:border-cyan-glow/40 hover:bg-white/[0.02]'
          }`}
        style={{ padding: '2rem 1.5rem' }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.json,.csv,.png,.jpg,.jpeg,.webp,.xlsx,.docx"
          className="hidden"
          onChange={e => addFiles([...e.target.files])}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            animate={dragging ? { y: -4 } : { y: 0 }}
            className="w-12 h-12 rounded-2xl bg-blue-electric/10 border border-blue-electric/20 flex items-center justify-center"
          >
            <Upload size={20} className="text-cyan-glow" />
          </motion.div>
          <div>
            <p className="font-body text-sm text-slate-300 font-medium">
              Drop files here or <span className="text-cyan-glow">browse</span>
            </p>
            <p className="font-mono text-[11px] text-slate-600 mt-1">
              Screenshots, PDFs, JSON schemas, CSV exports — anything relevant
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {['PNG','JPG','PDF','JSON','CSV','XLSX'].map(ext => (
              <span key={ext} className="font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md tracking-wider">
                {ext}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* file chips */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-slate-500 tracking-widest uppercase px-1">
            {files.length} file{files.length !== 1 ? 's' : ''} attached
          </p>
          <AnimatePresence>
            {files.map(f => (
              <FileChip key={f.name + f.size} file={f} onRemove={onRemove} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ConnectionInput({ value, onChange, status }) {
  const [showFull, setShowFull] = useState(false);

  const masked = value
    ? value.replace(/:([^@/]+)@/, ':••••••••@')
    : '';

  const statusIcon = {
    idle: null,
    checking: <Loader2 size={15} className="text-cyan-glow animate-spin" />,
    ok: <CheckCircle2 size={15} className="text-green-400" />,
    error: <AlertCircle size={15} className="text-red-400" />,
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Link2 size={15} className="text-slate-500" />
        </div>
        <input
          type={showFull ? 'text' : 'password'}
          placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="dash-input w-full pl-10 pr-20 py-3.5 rounded-xl text-sm font-mono"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {statusIcon[status]}
          <button
            type="button"
            onClick={() => setShowFull(s => !s)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showFull ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* status messages */}
      <AnimatePresence>
        {status === 'ok' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-mono text-xs text-green-400 flex items-center gap-1.5 px-1"
          >
            <CheckCircle2 size={11} /> Connection verified — ready to query
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-mono text-xs text-red-400 flex items-center gap-1.5 px-1"
          >
            <AlertCircle size={11} /> Could not reach the cluster — check your string and IP whitelist
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SetupPage({ onComplete }) {
  const [files, setFiles] = useState([]);
  const [connStr, setConnStr] = useState('');
  const [connStatus, setConnStatus] = useState('idle'); // idle | checking | ok | error
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addFiles = (incoming) => setFiles(prev => [...prev, ...incoming]);
  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  const verifyConn = async () => {
    if (!connStr.trim()) return;
    setConnStatus('checking');
    // Simulate a connection check (replace with real ping in production)
    await new Promise(r => setTimeout(r, 1200));
    const looks = /^mongodb(\+srv)?:\/\/.+@.+/.test(connStr.trim());
    setConnStatus(looks ? 'ok' : 'error');
  };

  const canContinue = files.length > 0 || connStr.trim().length > 0;

  const handleContinue = async () => {
    setError('');
    if (!canContinue) {
      setError('Upload at least one file or provide a connection string to continue.');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    onComplete({ files, connectionString: connStr.trim() });
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center relative overflow-hidden px-4 py-16">
      {/* ambient */}
      <div className="absolute inset-0 grid-overlay opacity-15 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-blue-electric/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-glow/6 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
            <Database size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Mongo<span className="gradient-text-cyan">Query</span>
            <span className="text-cyan-glow text-sm font-mono font-light ml-1 opacity-80">AI</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass rounded-3xl border-glow overflow-hidden"
        >
          {/* header band */}
          <div className="px-8 pt-8 pb-6 border-b border-white/5">
            <div className="inline-flex items-center gap-2 bg-cyan-glow/10 border border-cyan-glow/20 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse" />
              <span className="font-mono text-[10px] text-cyan-glow tracking-widest uppercase">Setup your workspace</span>
            </div>
            <h1 className="font-display font-black text-2xl text-white mb-1.5">
              Connect your data
            </h1>
            <p className="font-body text-sm text-slate-400 leading-relaxed">
              Upload relevant files (schemas, screenshots, exports) and/or add your MongoDB connection string. You need at least one to access the dashboard.
            </p>
          </div>

          <div className="px-8 py-7 space-y-8">
            {/* ── Section 1: File upload ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-electric/15 border border-blue-electric/25 flex items-center justify-center">
                  <Paperclip size={12} className="text-cyan-glow" />
                </div>
                <span className="font-mono text-xs text-slate-300 tracking-wider uppercase">Upload files</span>
                <span className="ml-auto font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">
                  optional if conn string provided
                </span>
              </div>
              <DropZone files={files} onAdd={addFiles} onRemove={removeFile} />
            </div>

            {/* divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="font-mono text-[11px] text-slate-600">and / or</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* ── Section 2: MongoDB conn string ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-lg bg-blue-electric/15 border border-blue-electric/25 flex items-center justify-center">
                  <Database size={12} className="text-cyan-glow" />
                </div>
                <span className="font-mono text-xs text-slate-300 tracking-wider uppercase">MongoDB connection string</span>
                <span className="ml-auto font-mono text-[10px] text-slate-600 bg-white/5 border border-white/8 px-2 py-0.5 rounded-md">
                  optional if files provided
                </span>
              </div>

              <ConnectionInput
                value={connStr}
                onChange={(v) => { setConnStr(v); if (connStatus !== 'idle') setConnStatus('idle'); }}
                status={connStatus}
              />

              {connStr.trim() && connStatus === 'idle' && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={verifyConn}
                  className="mt-3 font-mono text-xs text-cyan-glow/70 hover:text-cyan-glow transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight size={12} />
                  Verify connection
                </motion.button>
              )}

              <p className="mt-3 font-mono text-[10px] text-slate-600 leading-relaxed">
                Your credentials are stored only in this session and never sent to our servers.
              </p>
            </div>

            {/* error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="badge-error px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2"
                >
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.button
              onClick={handleContinue}
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.02 } : {}}
              whileTap={!submitting ? { scale: 0.97 } : {}}
              className={`w-full btn-primary py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2
                transition-opacity ${!canContinue ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Setting up workspace…
                </>
              ) : (
                <>
                  Open Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            {/* what this unlocks */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                'AI query generation',
                'Schema auto-detection',
                'Live analytics',
                'Visual pipeline builder',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs font-body text-slate-500">
                  <CheckCircle2 size={11} className="text-cyan-glow/60 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-6 font-body text-xs text-slate-600">
          You can change these settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
