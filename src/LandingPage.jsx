import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Database, Menu, X, Zap, ArrowRight, Play, ChevronDown, Sparkles,
  MessageSquare, Cpu, Search, BarChart3, GitBranch, PieChart, Shield, Brain,
  Type, BrainCircuit, Code2, LineChart,
  TrendingUp, Target, Users, Timer,
  Star, Quote, ChevronLeft, ChevronRight,
  Check, BookOpen, Mail, ExternalLink, Globe, Link2,
} from 'lucide-react';

// ── Navbar ──────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Docs', 'About'];

function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong border-b border-cyan-glow/10 shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-3 cursor-pointer" whileHover={{ scale: 1.02 }}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
              <Database size={18} className="text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow opacity-20 blur-sm" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Mongo<span className="gradient-text-cyan">Query</span>
            <span className="text-cyan-glow ml-1 text-sm font-mono font-light opacity-80">AI</span>
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <motion.a key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="text-slate-400 hover:text-cyan-glow font-body text-sm font-medium tracking-wide transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.6)] relative group">
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-glow to-blue-neon group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            onClick={onLogin}
            className="text-slate-400 hover:text-white font-body text-sm transition-colors">
            Sign In
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={onSignup}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-electric/30">
            <Zap size={14} />
            Get Started
          </motion.button>
        </div>

        <button className="md:hidden text-slate-400 hover:text-cyan-glow transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-cyan-glow/10">
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-slate-300 hover:text-cyan-glow text-sm font-medium py-2 border-b border-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}>{link}</a>
              ))}
              <button onClick={onSignup} className="btn-primary px-5 py-3 rounded-xl text-sm font-semibold mt-2">
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Particles ────────────────────────────────────────────────────────────────
function Particles() {
  const pts = Array.from({ length: 55 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, dur: Math.random() * 8 + 4, delay: Math.random() * 5,
    op: Math.random() * 0.5 + 0.1,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: p.id % 3 === 0 ? 'rgba(0,245,255,0.8)' : p.id % 3 === 1 ? 'rgba(77,158,255,0.6)' : 'rgba(168,85,247,0.5)',
          }}
          animate={{ y: [0, -40, 0], opacity: [p.op, p.op * 2, p.op], scale: [1, 1.5, 1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ── Typing effect ────────────────────────────────────────────────────────────
function useTyping(texts, speed = 65) {
  const [disp, setDisp] = useState('');
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = texts[ti];
    const t = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) { setDisp(cur.slice(0, ci + 1)); setCi(c => c + 1); }
        else setTimeout(() => setDel(true), 2000);
      } else {
        if (ci > 0) { setDisp(cur.slice(0, ci - 1)); setCi(c => c - 1); }
        else { setDel(false); setTi(i => (i + 1) % texts.length); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [ci, del, ti, texts, speed]);

  return disp;
}

// ── Query card mockup ─────────────────────────────────────────────────────────
function QueryCard() {
  const lines = [
    { t: 'comment', s: '// Natural language → MongoDB query' },
    { t: 'kw', s: 'const', rest: ' result = await MongoQueryAI.query(' },
    { t: 'str', s: '  "Show top 10 users by revenue last 30 days"' },
    { t: 'norm', s: ');' },
    { t: 'comment', s: '' },
    { t: 'comment', s: '// AI-generated aggregation pipeline' },
    { t: 'brk', s: '[' },
    { t: 'ind', s: '  { $match: { createdAt: { $gte: last30days } } },' },
    { t: 'ind', s: '  { $group: { _id: "$userId", revenue: { $sum: "$amount" } } },' },
    { t: 'ind', s: '  { $sort: { revenue: -1 } }, { $limit: 10 }' },
    { t: 'brk', s: ']' },
  ];
  const colorMap = { comment: 'text-slate-500', kw: 'text-purple-400', str: 'text-green-400', brk: 'text-yellow-400', ind: 'text-slate-300', norm: 'text-slate-300' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative" style={{ perspective: '1000px' }}>
      <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass border-glow rounded-2xl overflow-hidden shadow-2xl shadow-blue-electric/20" style={{ maxWidth: '520px' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-glow/10 bg-navy-800/50">
          <div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 font-mono text-xs text-slate-500">query.js — MongoQuery AI</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span className="font-mono text-xs text-cyan-glow opacity-60">LIVE</span>
          </div>
        </div>
        <div className="p-5 code-block space-y-0.5">
          {lines.map((line, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.08 }}
              className={`${colorMap[line.t]} text-xs leading-6`}>
              <span className="text-slate-600 mr-4 select-none text-[10px]">{String(i + 1).padStart(2, '0')}</span>
              {line.t === 'kw'
                ? <><span className="text-purple-400">{line.s}</span><span className="text-slate-300">{line.rest}</span></>
                : line.s}
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="px-5 py-3 bg-green-500/5 border-t border-green-500/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-green-400">Query executed in 42ms · 10 documents returned</span>
        </motion.div>
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-electric/30 to-transparent" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }}
        className="absolute -top-4 -right-4 glass border-glow rounded-xl px-3 py-2 flex items-center gap-2">
        <Sparkles size={12} className="text-yellow-400" />
        <span className="font-mono text-xs text-slate-300">AI-Powered</span>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.7 }}
        className="absolute -bottom-4 -left-4 glass border-glow rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
        <span className="font-mono text-xs text-slate-300">99.8% accuracy</span>
      </motion.div>
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onSignup, onLogin }) {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [8, -8]);
  const rotateY = useTransform(springX, [-500, 500], [-8, 8]);
  const typed = useTyping(['MongoDB like never before', 'smarter with natural language', 'faster with AI-powered pipelines', 'at enterprise scale']);

  useEffect(() => {
    const h = (e) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - r.left - r.width / 2);
      mouseY.set(e.clientY - r.top - r.height / 2);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient" style={{ paddingTop: '100px' }}>
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <Particles />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 orb bg-blue-electric/20" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 orb bg-cyan-glow/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-glow/5 animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border-glow rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span className="section-tag text-[10px]">Powered by AI · Vector Search · MongoDB Atlas</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-black text-5xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            <span className="text-white">Query </span><span className="gradient-text">MongoDB</span>
            <br />
            <span className="text-white">Like </span>
            <span className="text-slate-200">{typed}<span className="text-cyan-glow cursor">|</span></span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="font-body text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
            Transform natural language into powerful MongoDB queries instantly using AI, vector search, and intelligent aggregations. No more complex syntax — just describe what you need.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 mb-12">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={onSignup}
              className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 shadow-2xl shadow-blue-electric/30">
              <Sparkles size={18} />Try MongoQuery Free<ArrowRight size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={onSignup}
              className="btn-outline px-8 py-4 rounded-2xl text-base font-medium flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center">
                <Play size={12} className="text-cyan-glow ml-0.5" />
              </div>
              Watch Demo
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {['🧑‍💻','👩‍💻','🧑‍🔬','👨‍💼','👩‍🔬'].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-navy-700 border-2 border-navy-950 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                <span className="text-xs text-slate-400 ml-1">5.0</span>
              </div>
              <p className="text-xs text-slate-500">Trusted by <span className="text-slate-300">10,000+</span> developers</p>
            </div>
          </motion.div>
        </div>

        <motion.div style={{ rotateX, rotateY, transformPerspective: 1000 }}
          className="flex justify-center lg:justify-end">
          <QueryCard />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} className="text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageSquare, title: 'Natural Language Queries', desc: 'Type in plain English. Our AI understands intent, context, and nuance to generate precise MongoDB queries instantly.', gradient: 'from-cyan-400 to-blue-500', glow: 'rgba(0,245,255,0.2)', tag: 'NLP Engine' },
  { icon: Cpu, title: 'AI Query Generation', desc: 'Fine-tuned transformer models generate optimized MongoDB queries with proper indexing hints and performance considerations.', gradient: 'from-blue-400 to-purple-500', glow: 'rgba(77,158,255,0.2)', tag: 'LLM-Powered' },
  { icon: Search, title: 'MongoDB Vector Search', desc: 'Leverage Atlas Vector Search to find semantically similar documents using embeddings and kNN algorithms.', gradient: 'from-purple-400 to-pink-500', glow: 'rgba(168,85,247,0.2)', tag: 'Atlas Search' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards powered by change streams. Watch your data transform in real-time with zero latency overhead.', gradient: 'from-green-400 to-cyan-500', glow: 'rgba(34,197,94,0.2)', tag: 'Change Streams' },
  { icon: GitBranch, title: 'Aggregation Pipelines', desc: 'Visually compose complex multi-stage aggregation pipelines with drag-and-drop stages and AI optimization.', gradient: 'from-orange-400 to-red-500', glow: 'rgba(251,146,60,0.2)', tag: 'Pipeline Builder' },
  { icon: PieChart, title: 'Smart Visualizations', desc: 'Auto-generate charts, graphs, and dashboards from query results. D3.js-powered interactive data exploration.', gradient: 'from-yellow-400 to-orange-500', glow: 'rgba(251,191,36,0.2)', tag: 'D3 + Recharts' },
  { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 Type II certified. Field-level encryption, RBAC, audit logs, and VPC peering for maximum data protection.', gradient: 'from-teal-400 to-cyan-500', glow: 'rgba(20,184,166,0.2)', tag: 'SOC 2 Certified' },
  { icon: Brain, title: 'Semantic Schema Matching', desc: 'AI understands your collection structure and automatically maps natural language fields to your actual schema.', gradient: 'from-indigo-400 to-blue-500', glow: 'rgba(99,102,241,0.2)', tag: 'Schema Intelligence' },
];

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-navy-900/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/20 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 orb bg-blue-electric/10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-20">
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="section-tag mb-4">◆ Capabilities</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Everything you need to<br /><span className="gradient-text">master MongoDB</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
            className="font-body text-lg text-slate-400 max-w-2xl mx-auto">
            A complete AI-powered platform designed to make MongoDB accessible, powerful, and lightning-fast for teams of all sizes.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const cardRef = useRef(null);
            const cardInView = useInView(cardRef, { once: true, margin: '-50px' });
            return (
              <motion.div key={f.title} ref={cardRef}
                initial={{ opacity: 0, y: 40 }} animate={cardInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative glass border-glow-hover rounded-2xl p-6 cursor-pointer overflow-hidden"
                style={{ borderColor: 'rgba(0,245,255,0.08)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(circle at top left, ${f.glow} 0%, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="mb-4 relative inline-block">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg`}
                      style={{ boxShadow: `0 4px 20px ${f.glow}` }}>
                      <Icon size={22} className="text-white" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase bg-white/5 px-2 py-1 rounded-md">{f.tag}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-cyan-glow/90 transition-colors duration-300">{f.title}</h3>
                  <p className="font-body text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { icon: TrendingUp, value: 1000000, suffix: '+', label: 'Queries Generated', sub: 'Every single month', color: '#00f5ff', gradient: 'from-cyan-400 to-blue-500' },
  { icon: Target, value: 99.8, suffix: '%', label: 'Query Accuracy', sub: 'Validated against real data', color: '#4d9eff', gradient: 'from-blue-400 to-indigo-500' },
  { icon: Timer, value: 50, suffix: 'ms', label: 'Avg Response Time', sub: 'End-to-end latency', color: '#a855f7', gradient: 'from-purple-400 to-pink-500' },
  { icon: Users, value: 10000, suffix: '+', label: 'Developers', sub: 'Trust MongoQuery AI', color: '#22c55e', gradient: 'from-green-400 to-teal-500' },
];

function Counter({ target, suffix, isInView }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!isInView || ran.current) return;
    ran.current = true;
    const dur = 2000, start = performance.now();
    const isFloat = String(target).includes('.');
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(isFloat ? parseFloat((target * e).toFixed(1)) : Math.floor(target * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target]);
  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
  return <span>{fmt(val)}{suffix}</span>;
}

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/80 to-navy-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] orb bg-blue-electric/8" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="section-tag mb-4">◆ By the numbers</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white tracking-tight">
            Numbers that<span className="gradient-text"> speak for themselves</span>
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            const cardRef = useRef(null);
            const cardInView = useInView(cardRef, { once: true, margin: '-50px' });
            return (
              <motion.div key={s.label} ref={cardRef}
                initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={cardInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="group relative glass border-glow-hover rounded-3xl p-8 text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${s.color}50, transparent)` }} />
                <div className="relative inline-flex mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 4px 30px ${s.color}30` }}>
                    <Icon size={26} className="text-white" />
                  </div>
                </div>
                <div className="font-display font-black text-5xl lg:text-6xl mb-3 tracking-tight"
                  style={{ color: s.color, textShadow: `0 0 30px ${s.color}60` }}>
                  <Counter target={s.value} suffix={s.suffix} isInView={cardInView} />
                </div>
                <div className="font-display font-bold text-xl text-white mb-1">{s.label}</div>
                <div className="font-body text-sm text-slate-500">{s.sub}</div>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }}
          className="mt-16 text-center">
          <p className="font-body text-sm text-slate-600 mb-6 tracking-wide">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
            {['Stripe','Shopify','Notion','Vercel','Linear','Figma'].map(c => (
              <span key={c} className="font-display font-bold text-xl text-slate-700 hover:text-slate-400 transition-colors cursor-pointer tracking-tight">{c}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  { name: 'Starter', icon: 'Rocket', price: { m: 0, a: 0 }, tagline: 'Perfect for side projects', color: '#4d9eff', border: 'rgba(77,158,255,0.2)', popular: false,
    features: ['500 queries / month','Natural language to MongoDB','Basic aggregation pipelines','1 database connection','Community support'], cta: 'Start for Free' },
  { name: 'Pro', icon: 'Zap', price: { m: 49, a: 39 }, tagline: 'For professional developers', color: '#00f5ff', border: 'rgba(0,245,255,0.4)', popular: true, badge: 'Most Popular',
    features: ['Unlimited queries','Advanced AI query generation','Vector search integration','Real-time analytics dashboard','Up to 10 database connections','Pipeline visual builder','Smart visualizations','Slack + Email support'], cta: 'Start Pro Trial' },
  { name: 'Enterprise', icon: 'Building', price: { m: 249, a: 199 }, tagline: 'For teams at scale', color: '#a855f7', border: 'rgba(168,85,247,0.3)', popular: false,
    features: ['Everything in Pro','Unlimited connections','SOC 2 Type II compliance','VPC peering & private endpoints','Field-level encryption','Custom AI model fine-tuning','RBAC & SSO/SAML','Priority 24/7 support'], cta: 'Contact Sales' },
];

function Pricing({ onSignup }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] orb bg-blue-electric/10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="section-tag mb-4">◆ Pricing</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            Simple, transparent<br /><span className="gradient-text">pricing for all teams</span>
          </motion.h2>
          <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 glass border-glow rounded-full px-6 py-3">
            <span className={`font-body text-sm cursor-pointer transition-colors ${!annual ? 'text-white' : 'text-slate-500'}`} onClick={() => setAnnual(false)}>Monthly</span>
            <div onClick={() => setAnnual(a => !a)} className="relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300"
              style={{ background: annual ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}>
              <motion.div animate={{ x: annual ? 24 : 2 }} transition={{ duration: 0.3, type: 'spring' }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" />
            </div>
            <span className={`font-body text-sm cursor-pointer transition-colors ${annual ? 'text-white' : 'text-slate-500'}`} onClick={() => setAnnual(true)}>
              Annual <span className="ml-1 text-xs font-mono text-green-400">Save 20%</span>
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.price.a : plan.price.m;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 50, scale: 0.97 }} animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`relative flex flex-col rounded-3xl overflow-hidden ${plan.popular ? 'popular-card scale-105 z-10 shadow-2xl' : 'glass'}`}
                style={{ border: `1px solid ${plan.border}`, boxShadow: plan.popular ? `0 0 60px ${plan.color}25` : undefined }}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 py-1.5 text-center font-mono text-xs font-bold tracking-widest"
                    style={{ background: `linear-gradient(135deg, ${plan.color}30, ${plan.color}15)`, color: plan.color, borderBottom: `1px solid ${plan.color}30` }}>
                    <Sparkles size={10} className="inline mr-1" />{plan.badge}
                  </div>
                )}
                <div className={`p-8 flex flex-col h-full ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="mb-8">
                    <div className="font-mono text-xs tracking-widest mb-1" style={{ color: plan.color, opacity: 0.6 }}>{plan.name.toUpperCase()}</div>
                    <h3 className="font-display font-black text-2xl text-white mb-1">{plan.name}</h3>
                    <p className="font-body text-sm text-slate-500">{plan.tagline}</p>
                  </div>
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: `${plan.color}15` }}>
                    <div className="flex items-end gap-2">
                      <span className="font-display font-black text-5xl text-white">{price === 0 ? 'Free' : `$${price}`}</span>
                      {price > 0 && <span className="font-body text-slate-500 mb-2 text-sm">/ month</span>}
                    </div>
                  </div>
                  <ul className="flex flex-col gap-3 mb-10 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${plan.color}20` }}>
                          <Check size={11} style={{ color: plan.color }} />
                        </div>
                        <span className="font-body text-sm text-slate-300 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={onSignup}
                    className={`w-full py-4 rounded-2xl font-semibold font-body text-sm flex items-center justify-center gap-2 transition-all ${plan.popular ? 'btn-primary shadow-xl' : 'btn-outline'}`}
                    style={!plan.popular ? { borderColor: `${plan.color}40`, color: plan.color } : {}}>
                    {plan.cta}<ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
          className="text-center mt-10 font-body text-sm text-slate-600">
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA({ onSignup }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] orb bg-blue-electric" />
      <div className="absolute inset-0 grid-overlay opacity-25" />
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
          className="font-display font-black text-5xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.05]">
          Start Building Smarter<br /><span className="gradient-text">MongoDB Queries Today</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
          className="font-body text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Join 10,000+ engineers who've made MongoDB effortless.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-5 mb-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onSignup}
            className="btn-primary px-10 py-5 rounded-2xl text-lg font-semibold flex items-center gap-3 shadow-2xl shadow-blue-electric/40">
            <Sparkles size={20} />Get Started Free<ArrowRight size={18} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="btn-outline px-10 py-5 rounded-2xl text-lg font-medium flex items-center gap-3">
            <BookOpen size={18} />Read the Docs
          </motion.button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
          {['✓ No credit card required','✓ 14-day Pro trial','✓ Cancel anytime','✓ SOC 2 certified'].map(item => (
            <span key={item} className="font-body text-sm">
              <span className="text-cyan-glow opacity-70">{item.split(' ')[0]}</span> {item.slice(2)}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product: ['Features','How It Works','Pricing','Changelog','Roadmap'],
  Developers: ['Documentation','API Reference','SDKs','GitHub','Examples'],
  Company: ['About','Blog','Careers','Press','Contact'],
  Legal: ['Privacy Policy','Terms of Service','Security','Cookies','GDPR'],
};

function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-navy-950">
      <div className="absolute inset-0 grid-overlay opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
                <Database size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Mongo<span className="gradient-text-cyan">Query</span>
                <span className="text-cyan-glow ml-1 text-sm font-mono font-light opacity-80">AI</span>
              </span>
            </div>
            <p className="font-body text-sm text-slate-500 leading-relaxed mb-6 max-w-[200px]">
              AI-powered MongoDB query generation for modern developers.
            </p>
            <div className="flex items-center gap-3">
              {[Code2, X, Link2, Mail].map((Icon, i) => (
                <motion.a key={i} href="#" whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/8 text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all">
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-5">{cat}</h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="font-body text-sm text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1 group">
                      {link}
                      {['GitHub','API Reference'].includes(link) && <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-slate-600">© 2025 MongoQuery AI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage({ onLogin, onSignup }) {
  // Always land at the very top when this view mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="relative min-h-screen bg-navy-950 text-white">
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <Hero onSignup={onSignup} onLogin={onLogin} />
      <Features />
      <StatsSection />
      <Pricing onSignup={onSignup} />
      <CTA onSignup={onSignup} />
      <Footer />
    </div>
  );
}
