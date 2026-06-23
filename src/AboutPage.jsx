import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Database, Sparkles, MessageSquare, Cpu, Search, BarChart3,
  Shield, Zap, ArrowRight, Check, X, BookOpen,
} from 'lucide-react';
import { Navbar, Footer } from './SiteChrome.jsx';

// ── DB visualization (replaces a stock illustration) ───────────────────────────
function DBVisual() {
  const nodes = [
    { x: 50,  y: 20,  label: 'users',     color: '#00f5ff' },
    { x: 20,  y: 55,  label: 'orders',    color: '#4d9eff' },
    { x: 80,  y: 55,  label: 'products',  color: '#a855f7' },
    { x: 50,  y: 85,  label: 'analytics', color: '#22c55e' },
  ];
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* connecting lines */}
        {nodes.map((n, i) => (
          <motion.line key={i}
            x1="50" y1="50" x2={n.x} y2={n.y}
            stroke={n.color} strokeWidth="0.4" strokeOpacity="0.35"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }} />
        ))}
        {/* center node */}
        <motion.circle cx="50" cy="50" r="9" fill="url(#centerGrad)"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, type: 'spring' }} />
        <defs>
          <radialGradient id="centerGrad">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#0066ff" />
          </radialGradient>
        </defs>
        {/* satellite nodes */}
        {nodes.map((n, i) => (
          <motion.circle key={i} cx={n.x} cy={n.y} r="5" fill={n.color} fillOpacity="0.85"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.5 + i * 0.15, type: 'spring' }} />
        ))}
      </svg>
      {/* Floating labels */}
      {nodes.map((n, i) => (
        <motion.div key={i}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.15 }}
          className="absolute font-mono text-[10px] px-2 py-1 rounded-md glass border border-white/10"
          style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -150%)', color: n.color }}>
          {n.label}
        </motion.div>
      ))}
      {/* Pulse ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-glow/20"
        style={{ width: '60%', height: '60%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }} />
    </div>
  );
}

// ── Section wrapper with fade-in ──────────────────────────────────────────────
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

// ── Hero ──────────────────────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 orb bg-blue-electric/15" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 orb bg-purple-500/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass border-glow rounded-full px-4 py-2 mb-6">
            <Sparkles size={12} className="text-cyan-glow" />
            <span className="section-tag text-[10px]">Our Story</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-5">
            About <span className="gradient-text">MongoQuery AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-display text-xl sm:text-2xl text-cyan-glow/90 mb-6">
            Making MongoDB as easy as having a conversation.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="space-y-4 font-body text-base text-slate-400 leading-relaxed max-w-xl">
            <p>MongoQuery AI is an intelligent AI-powered platform that transforms natural language into optimized MongoDB queries. It simplifies database interaction by allowing users to communicate with MongoDB using plain English instead of writing complex queries manually.</p>
            <p>Our platform combines Artificial Intelligence, Natural Language Processing, and MongoDB technologies to provide a faster, smarter, and more intuitive way to explore and manage data.</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <DBVisual />
        </motion.div>
      </div>
    </section>
  );
}

// ── Our Story ─────────────────────────────────────────────────────────────────
function OurStory() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-navy-900/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal>
          <p className="section-tag mb-4">◆ The Beginning</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-6 tracking-tight">Our Story</h2>
          <div className="space-y-4 font-body text-base text-slate-400 leading-relaxed">
            <p>MongoQuery AI was created with one simple vision: to eliminate the complexity of database querying and make data accessible to everyone.</p>
            <p>Traditional MongoDB interactions require knowledge of query syntax, aggregation pipelines, and optimization techniques, making them difficult for beginners and time-consuming for experienced developers.</p>
            <p>By combining Artificial Intelligence with MongoDB's powerful capabilities, MongoQuery AI bridges the gap between human language and database operations, enabling users to retrieve information naturally and efficiently.</p>
            <p>Today, our platform empowers developers, students, analysts, and businesses to interact with databases through conversation rather than code.</p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative glass border-glow rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-20" />
            <div className="relative z-10 space-y-4">
              {[
                { label: 'Query syntax',     before: true  },
                { label: 'Aggregation pipelines', before: true },
                { label: 'Plain English input',   before: false },
                { label: 'Instant optimized queries', before: false },
              ].map((item, i) => (
                <motion.div key={item.label}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    item.before ? 'border-red-500/15 bg-red-500/5' : 'border-cyan-glow/20 bg-cyan-glow/5'
                  }`}>
                  {item.before
                    ? <X size={14} className="text-red-400 flex-shrink-0" />
                    : <Check size={14} className="text-cyan-glow flex-shrink-0" />}
                  <span className={`font-mono text-sm ${item.before ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Mission ───────────────────────────────────────────────────────────────────
const MISSION = [
  { icon: MessageSquare, text: 'Simplify database interactions through natural language.', color: '#00f5ff' },
  { icon: Cpu,           text: 'Leverage AI to generate intelligent and optimized MongoDB queries.', color: '#4d9eff' },
  { icon: Zap,           text: 'Increase productivity by reducing manual query writing and debugging.', color: '#a855f7' },
  { icon: Database,      text: 'Make modern database technologies accessible to everyone.', color: '#22c55e' },
];

function Mission() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 orb bg-blue-electric/10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12 sm:mb-16">
          <p className="section-tag mb-4">◆ Purpose</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">Our Mission</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MISSION.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.text} delay={i * 0.08}>
                <motion.div whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="glass border-glow-hover rounded-2xl p-6 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}>
                    <Icon size={22} style={{ color: m.color }} />
                  </div>
                  <p className="font-body text-sm text-slate-300 leading-relaxed">{m.text}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── What We Offer ─────────────────────────────────────────────────────────────
const OFFERINGS = [
  { icon: Sparkles,  title: 'AI Query Generation',       desc: 'Generate optimized MongoDB queries instantly from natural language.', color: '#00f5ff' },
  { icon: MessageSquare, title: 'Natural Language Interface', desc: 'Talk to your database the same way you talk to a colleague.', color: '#4d9eff' },
  { icon: Search,    title: 'Intelligent Data Search',   desc: 'Semantic search finds what you mean, not just what you type.', color: '#a855f7' },
  { icon: BarChart3, title: 'Real-Time Analytics',       desc: 'Live dashboards that update as your data changes.', color: '#22c55e' },
  { icon: Zap,       title: 'Smart Query Optimization',  desc: 'Every query is automatically tuned for performance.', color: '#f59e0b' },
  { icon: Shield,    title: 'Secure & Scalable Platform', desc: 'Enterprise-grade security built for teams of any size.', color: '#ec4899' },
];

function WhatWeOffer() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-navy-900/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12 sm:mb-16">
          <p className="section-tag mb-4">◆ Capabilities</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">What We Offer</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFERINGS.map((o, i) => {
            const Icon = o.icon;
            return (
              <Reveal key={o.title} delay={i * 0.07}>
                <motion.div whileHover={{ y: -6 }} className="group relative glass border-glow-hover rounded-2xl p-6 overflow-hidden h-full">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at top left, ${o.color}15, transparent 60%)` }} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${o.color}15`, border: `1px solid ${o.color}25` }}>
                      <Icon size={22} style={{ color: o.color }} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mb-2">{o.title}</h3>
                    <p className="font-body text-sm text-slate-400 leading-relaxed">{o.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Why MongoQuery AI ─────────────────────────────────────────────────────────
function WhyUs() {
  const traditional = [
    'Requires learning MongoDB syntax',
    'Time-consuming query writing',
    'Complex aggregation pipelines',
    'Higher chance of syntax errors',
    'Difficult for non-technical users',
  ];
  const ours = [
    'Ask questions in plain English',
    'AI generates optimized queries instantly',
    'Faster and smarter workflow',
    'Beginner-friendly experience',
    'Increased productivity and accuracy',
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] orb bg-purple-500/8" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12 sm:mb-16">
          <p className="section-tag mb-4">◆ Comparison</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">Why MongoQuery AI?</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <Reveal>
            <div className="glass rounded-3xl p-6 sm:p-8 border border-red-500/15 h-full">
              <h3 className="font-display font-bold text-lg text-slate-400 mb-5">Traditional Database Querying</h3>
              <ul className="space-y-3.5">
                {traditional.map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <X size={15} className="text-red-400/70 flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-slate-400">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="glass border-glow rounded-3xl p-6 sm:p-8 border border-cyan-glow/25 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 orb bg-cyan-glow/15" />
              <h3 className="relative font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
                MongoQuery AI <Sparkles size={16} className="text-cyan-glow" />
              </h3>
              <ul className="relative space-y-3.5">
                {ours.map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <Check size={15} className="text-cyan-glow flex-shrink-0 mt-0.5" />
                    <span className="font-body text-sm text-slate-200">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function AboutCTA({ onSignup, onNavigate }) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <Reveal className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white mb-8 tracking-tight leading-tight">
          Ready to transform the way you interact with <span className="gradient-text">MongoDB?</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onSignup}
            className="btn-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2">
            <Zap size={16} />Get Started<ArrowRight size={16} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('docs')}
            className="btn-outline w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium flex items-center justify-center gap-2">
            <BookOpen size={16} />View Documentation
          </motion.button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AboutPage({ onLogin, onSignup, onNavigate }) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);

  return (
    <div className="relative min-h-screen bg-navy-950 text-white overflow-x-hidden">
      <Navbar onLogin={onLogin} onSignup={onSignup} onNavigate={onNavigate} activePage="about" />
      <AboutHero />
      <OurStory />
      <Mission />
      <WhatWeOffer />
      <WhyUs />
      <AboutCTA onSignup={onSignup} onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
