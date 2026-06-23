import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  BookOpen, UserPlus, Link2, Database, MessageSquare,
  Copy, Check, ChevronDown, Search, GitBranch, Hash,
  Filter, ArrowUpDown, Layers, Network, FileSpreadsheet,
  Table2, FileJson, Sparkles, ArrowRight, Zap, Shield,
  CheckCircle2,
} from 'lucide-react';
import { Navbar, Footer } from './SiteChrome.jsx';

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

// ── Code block with copy ──────────────────────────────────────────────────────
function CodeBlock({ code, label = 'query.js' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-black/40 border border-cyan-glow/15 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <div className="w-2 h-2 rounded-full bg-cyan-glow" />
        <span className="font-mono text-[10px] text-cyan-glow">{label}</span>
        <button onClick={copy} className="ml-auto font-mono text-[10px] text-slate-500 hover:text-cyan-glow flex items-center gap-1 transition-colors">
          {copied ? <><Check size={10} className="text-green-400" />Copied</> : <><Copy size={10} />Copy</>}
        </button>
      </div>
      <pre className="px-4 py-4 font-mono text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function DocsHero() {
  return (
    <section className="relative pt-28 sm:pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] orb bg-blue-electric/12" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 glass border-glow rounded-full px-4 py-2 mb-6 mx-auto">
          <BookOpen size={12} className="text-cyan-glow" />
          <span className="section-tag text-[10px]">Documentation</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-5">
          MongoQuery AI <span className="gradient-text">Documentation</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-body text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Everything you need to start using MongoQuery AI effectively.
        </motion.p>
      </div>
    </section>
  );
}

// ── Introduction ──────────────────────────────────────────────────────────────
function Intro() {
  return (
    <section className="relative py-12 sm:py-16">
      <Reveal className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="glass border-glow rounded-2xl p-6 sm:p-8">
          <p className="font-body text-base text-slate-300 leading-relaxed">
            MongoQuery AI is an AI-powered platform that converts natural language into optimized MongoDB queries, making database interaction faster, easier, and more intuitive.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

// ── Getting Started ───────────────────────────────────────────────────────────
const STEPS = [
  { icon: UserPlus, title: 'Create an account', color: '#00f5ff' },
  { icon: Link2,     title: 'Connect MongoDB',  color: '#4d9eff' },
  { icon: Database,  title: 'Select database and collection', color: '#a855f7' },
  { icon: MessageSquare, title: 'Start asking questions in natural language', color: '#22c55e' },
];

function GettingStarted() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10">
          <p className="section-tag mb-3">◆ 01</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">Getting Started</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="glass border-glow-hover rounded-2xl p-5 h-full relative">
                  <span className="absolute top-4 right-4 font-mono text-xs text-slate-700">{String(i + 1).padStart(2, '0')}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <p className="font-body text-sm text-slate-200 leading-snug">{s.title}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Connecting Database ───────────────────────────────────────────────────────
function ConnectingDB() {
  return (
    <section className="relative py-16 sm:py-20 bg-navy-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-8">
          <p className="section-tag mb-3">◆ 02</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-4">Connecting Your Database</h2>
          <p className="font-body text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Connect using a standard MongoDB connection string. Once connected, MongoQuery AI automatically detects your schema, collections, and field types.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <CodeBlock label="Connection string" code="mongodb+srv://username:password@cluster.mongodb.net/" />
        </Reveal>
        <Reveal delay={0.2} className="mt-5">
          <div className="flex items-start gap-3 px-4 py-3.5 bg-cyan-glow/5 border border-cyan-glow/15 rounded-xl">
            <CheckCircle2 size={16} className="text-cyan-glow flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-slate-300">After connecting, automatic schema detection scans your collections and field types so the AI can map natural language to the correct data instantly.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── AI Query Generation examples ──────────────────────────────────────────────
const QUERY_EXAMPLES = [
  { input: 'Show all users older than 25', query: 'db.users.find({\n  age: { $gt: 25 }\n})' },
  { input: 'Count employees by department', query: 'db.employees.aggregate([\n  { $group: { _id: "$department", count: { $sum: 1 } } }\n])' },
  { input: 'Find top 5 products by price', query: 'db.products.find()\n  .sort({ price: -1 })\n  .limit(5)' },
];

function AIGeneration() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10">
          <p className="section-tag mb-3">◆ 03</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-4">AI Query Generation</h2>
          <p className="font-body text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            The AI converts your natural language input into a precise, optimized MongoDB query — every time.
          </p>
        </Reveal>

        <div className="space-y-6">
          {QUERY_EXAMPLES.map((ex, i) => (
            <Reveal key={ex.input} delay={i * 0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="glass rounded-2xl p-5 flex flex-col justify-center">
                  <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-2">Input</p>
                  <p className="font-body text-sm text-slate-200">"{ex.input}"</p>
                </div>
                <CodeBlock label="Generated query" code={ex.query} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Supported query types ─────────────────────────────────────────────────────
const QUERY_TYPES = [
  { icon: Search,        label: 'Find Queries' },
  { icon: Filter,        label: 'Filter Queries' },
  { icon: ArrowUpDown,   label: 'Sorting' },
  { icon: Layers,        label: 'Projection' },
  { icon: GitBranch,     label: 'Aggregation Pipelines' },
  { icon: Hash,          label: 'Count Operations' },
  { icon: Network,       label: 'Group By' },
  { icon: Search,        label: 'Text Search' },
  { icon: Sparkles,      label: 'Vector Search' },
  { icon: FileSpreadsheet, label: 'Pagination' },
  { icon: Link2,         label: 'Lookup Joins' },
];

function SupportedTypes() {
  return (
    <section className="relative py-16 sm:py-20 bg-navy-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10">
          <p className="section-tag mb-3">◆ 04</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">Supported Query Types</h2>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUERY_TYPES.map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.label} delay={i * 0.04}>
                <div className="glass border-glow-hover rounded-xl px-4 py-3.5 flex items-center gap-2.5 h-full">
                  <Icon size={15} className="text-cyan-glow flex-shrink-0" />
                  <span className="font-mono text-xs text-slate-300">{t.label}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Query Results formats ─────────────────────────────────────────────────────
function QueryResults() {
  const formats = [
    { icon: Table2,         title: 'Interactive Tables', desc: 'Sortable, filterable result grids', color: '#00f5ff' },
    { icon: FileJson,       title: 'JSON',               desc: 'Raw structured output for developers', color: '#4d9eff' },
    { icon: FileSpreadsheet,title: 'CSV Export',          desc: 'One-click download for spreadsheets', color: '#a855f7' },
  ];
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10">
          <p className="section-tag mb-3">◆ 05</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-4">Query Results</h2>
          <p className="font-body text-sm sm:text-base text-slate-400 max-w-2xl">View generated query output in the format that works best for you.</p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {formats.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="glass border-glow-hover rounded-2xl p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5">{f.title}</h3>
                  <p className="font-mono text-[11px] text-slate-500">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Best practices ────────────────────────────────────────────────────────────
const PRACTICES = [
  'Ask clear and descriptive questions',
  'Mention collection names when possible',
  'Include filters and conditions',
  'Review generated queries before execution',
  'Maintain a structured database schema',
];

function BestPractices() {
  return (
    <section className="relative py-16 sm:py-20 bg-navy-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-10">
          <p className="section-tag mb-3">◆ 06</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">Best Practices</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRACTICES.map((p, i) => (
            <Reveal key={p} delay={i * 0.07}>
              <div className="glass rounded-xl px-5 py-4 flex items-start gap-3">
                <Zap size={14} className="text-cyan-glow flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-slate-300">{p}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ Accordion ──────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Can I use plain English?', a: 'Yes. MongoQuery AI is built specifically to understand natural language — you never need to write MongoDB syntax.' },
  { q: 'Do I need MongoDB experience?', a: 'No prior MongoDB knowledge is required. The platform is designed to be beginner-friendly while remaining powerful enough for experienced developers.' },
  { q: 'Does it support aggregation pipelines?', a: 'Yes. The AI can generate multi-stage aggregation pipelines including $match, $group, $lookup, $facet, $project, $sort, and $limit.' },
  { q: 'Can I edit generated queries?', a: 'Absolutely. Every generated query is fully editable before execution, giving you complete control and transparency.' },
  { q: 'Is my database secure?', a: 'Yes. Connection strings are encrypted, never logged in plain text, and your credentials remain scoped to your session only.' },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/8">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/2 transition-colors">
        <span className="font-body text-sm sm:text-base text-white font-medium">{item.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-cyan-glow" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <p className="px-5 pb-4 font-body text-sm text-slate-400 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-10">
          <p className="section-tag mb-3">◆ FAQ</p>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">Frequently Asked Questions</h2>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <FAQItem item={item} isOpen={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function DocsCTA({ onSignup, onNavigate }) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-electric/20 via-navy-950 to-purple-500/10" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <Reveal className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/25 flex items-center justify-center mx-auto mb-6">
          <Shield size={24} className="text-cyan-glow" />
        </div>
        <h2 className="font-display font-black text-2xl sm:text-4xl text-white mb-4 tracking-tight">
          Ready to start querying MongoDB with <span className="gradient-text">AI?</span>
        </h2>
        <p className="font-body text-base text-slate-400 mb-8 max-w-xl mx-auto">
          Experience a faster, smarter, and more intuitive way to interact with your databases using MongoQuery AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onSignup}
            className="btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2">
            <Sparkles size={16} />Get Started<ArrowRight size={16} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('landing')}
            className="btn-outline w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium">
            Back to Home
          </motion.button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DocsPage({ onLogin, onSignup, onNavigate }) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);

  return (
    <div className="relative min-h-screen bg-navy-950 text-white overflow-x-hidden">
      <Navbar onLogin={onLogin} onSignup={onSignup} onNavigate={onNavigate} activePage="docs" />
      <DocsHero />
      <Intro />
      <GettingStarted />
      <ConnectingDB />
      <AIGeneration />
      <SupportedTypes />
      <QueryResults />
      <BestPractices />
      <FAQ />
      <DocsCTA onSignup={onSignup} onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
