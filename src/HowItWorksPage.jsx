import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Link2, MessageSquare, Brain, GitBranch, Play, Table2,
  TrendingUp, ArrowRight, ArrowDown, Sparkles, Zap, Check,
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

// ── Hero with animated workflow preview ───────────────────────────────────────
function WorkflowPreview() {
  const stages = ['Question', 'AI', 'Query', 'Results'];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.2, type: 'spring' }}
            className="glass border-glow rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-2 h-2 rounded-full bg-cyan-glow" />
            <span className="font-mono text-xs sm:text-sm text-slate-200">{s}</span>
          </motion.div>
          {i < stages.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.2 }}>
              <ArrowRight size={16} className="text-cyan-glow/50" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function HowHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] orb bg-blue-electric/12" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 glass border-glow rounded-full px-4 py-2 mb-6 mx-auto">
          <Zap size={12} className="text-cyan-glow" />
          <span className="section-tag text-[10px]">The Process</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight mb-5">
          How <span className="gradient-text">MongoQuery AI</span> Works
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-body text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-12">
          From natural language to intelligent MongoDB queries in seconds.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <WorkflowPreview />
        </motion.div>
      </div>
    </section>
  );
}

// ── Step block ─────────────────────────────────────────────────────────────────
function StepBlock({ num, icon: Icon, title, subtitle, children, color, reverse, codeBlock }) {
  return (
    <Reveal>
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className={reverse ? 'lg:order-2' : ''}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-lg flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
              {num}
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent hidden sm:block" />
            <Icon size={22} style={{ color }} />
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-1">{title}</h3>
          <p className="font-mono text-xs mb-4" style={{ color }}>{subtitle}</p>
          <div className="font-body text-sm sm:text-base text-slate-400 leading-relaxed">{children}</div>
        </div>

        <div className={reverse ? 'lg:order-1' : ''}>
          {codeBlock ? (
            <div className="bg-black/40 border rounded-2xl overflow-hidden" style={{ borderColor: `${color}25` }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                <span className="font-mono text-[10px]" style={{ color }}>{codeBlock.label}</span>
              </div>
              <pre className="px-4 py-4 font-mono text-sm text-green-300 overflow-x-auto whitespace-pre-wrap">{codeBlock.code}</pre>
            </div>
          ) : (
            <div className="glass border-glow rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[180px]">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={28} style={{ color }} />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

// ── Steps section ─────────────────────────────────────────────────────────────
function Steps() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-navy-900/30" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-20 sm:space-y-28">

        <StepBlock num="1" icon={Link2} title="Secure Database Connection" subtitle="STEP 1 — CONNECT" color="#00f5ff">
          Connect your MongoDB Atlas cluster or local MongoDB database securely using a connection string. The platform automatically detects your collections and schema.
        </StepBlock>

        <StepBlock num="2" icon={MessageSquare} title="Natural Language Input" subtitle="STEP 2 — ASK" color="#4d9eff" reverse
          codeBlock={{ label: 'Example questions', code: `"Show all customers from Hyderabad"\n"Find products above ₹500"\n"Count employees by department"` }}>
          Type your request in plain English. No MongoDB knowledge required.
        </StepBlock>

        <StepBlock num="3" icon={Brain} title="Intelligent Language Processing" subtitle="STEP 3 — UNDERSTAND" color="#a855f7">
          The AI analyzes your request, identifies intent, collections, filters, sorting requirements, and relationships between data to understand exactly what you want.
        </StepBlock>

        <StepBlock num="4" icon={GitBranch} title="Smart MongoDB Query Creation" subtitle="STEP 4 — GENERATE" color="#22c55e" reverse
          codeBlock={{ label: 'Generated query', code: `db.customers.find({\n  city: "Hyderabad"\n}).sort({ createdAt: -1 })` }}>
          MongoQuery AI generates optimized MongoDB queries using best practices while ensuring transparency and efficiency.
        </StepBlock>

        <StepBlock num="5" icon={Play} title="Execute on Database" subtitle="STEP 5 — RUN" color="#f59e0b">
          The generated query is executed securely on the connected MongoDB database, retrieving only the required information with optimal performance.
        </StepBlock>

        <StepBlock num="6" icon={Table2} title="Interactive Results" subtitle="STEP 6 — VIEW" color="#ec4899" reverse>
          <div className="space-y-3">
            <p className="mb-4">Display results in multiple formats:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Interactive Table', 'JSON Output', 'CSV Export'].map(f => (
                <div key={f} className="glass border border-white/8 rounded-xl px-3 py-2.5 text-center">
                  <span className="font-mono text-xs text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </StepBlock>

        <StepBlock num="7" icon={TrendingUp} title="Data-Driven Decisions" subtitle="STEP 7 — DECIDE" color="#00f5ff">
          Analyze retrieved data instantly and make informed decisions using AI-powered database interactions.
        </StepBlock>

      </div>
    </section>
  );
}

// ── Full workflow diagram ──────────────────────────────────────────────────────
const FLOW_STEPS = [
  { label: 'User Question',        icon: MessageSquare, color: '#00f5ff' },
  { label: 'AI Understanding',     icon: Brain,          color: '#4d9eff' },
  { label: 'Intent Analysis',      icon: Sparkles,       color: '#a855f7' },
  { label: 'Query Generation',     icon: GitBranch,      color: '#22c55e' },
  { label: 'Query Optimization',   icon: Zap,            color: '#f59e0b' },
  { label: 'Database Execution',   icon: Play,           color: '#ec4899' },
  { label: 'Results',              icon: Table2,         color: '#00f5ff' },
  { label: 'Insights',             icon: TrendingUp,     color: '#4d9eff' },
];

function WorkflowDiagram() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] orb bg-cyan-glow/8" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12 sm:mb-16">
          <p className="section-tag mb-4">◆ End-to-End</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">Complete Workflow</h2>
        </Reveal>

        {/* Horizontal on desktop, vertical on mobile */}
        <Reveal delay={0.1}>
          <div className="hidden lg:flex items-center justify-between gap-2">
            {FLOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2 flex-shrink-0">
                    <motion.div
                      animate={{ boxShadow: [`0 0 0px ${s.color}00`, `0 0 16px ${s.color}50`, `0 0 0px ${s.color}00`] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </motion.div>
                    <span className="font-mono text-[9px] text-slate-400 text-center max-w-[80px] leading-tight">{s.label}</span>
                  </motion.div>
                  {i < FLOW_STEPS.length - 1 && (
                    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.05 }}
                      className="flex-1 h-px bg-gradient-to-r from-cyan-glow/30 to-cyan-glow/10 mx-1 origin-left" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile vertical flow */}
          <div className="lg:hidden flex flex-col items-center gap-3">
            {FLOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 glass border border-white/8 rounded-2xl px-4 py-3 w-full max-w-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                      <Icon size={16} style={{ color: s.color }} />
                    </div>
                    <span className="font-mono text-xs text-slate-300">{s.label}</span>
                  </motion.div>
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowDown size={14} className="text-cyan-glow/40 my-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function HowCTA({ onSignup }) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <Reveal className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white mb-6 tracking-tight">
          See it for yourself
        </h2>
        <p className="font-body text-base text-slate-400 mb-8 max-w-xl mx-auto">
          Connect a database and ask your first question in under a minute.
        </p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={onSignup}
          className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold inline-flex items-center gap-2">
          <Sparkles size={16} />Try MongoQuery Free<ArrowRight size={16} />
        </motion.button>
      </Reveal>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HowItWorksPage({ onLogin, onSignup, onNavigate }) {
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);

  return (
    <div className="relative min-h-screen bg-navy-950 text-white overflow-x-hidden">
      <Navbar onLogin={onLogin} onSignup={onSignup} onNavigate={onNavigate} activePage="how-it-works" />
      <HowHero />
      <Steps />
      <WorkflowDiagram />
      <HowCTA onSignup={onSignup} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
