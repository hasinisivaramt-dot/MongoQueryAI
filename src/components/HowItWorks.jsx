import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Type, BrainCircuit, Code2, LineChart, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Type,
    title: 'Enter Your Query',
    description: 'Type your question in plain English. "Show me the top 10 customers by purchase value this month" — no MongoDB syntax required.',
    code: '"Show top 10 customers\nby revenue this month"',
    color: '#00f5ff',
    bg: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'AI Understands Intent',
    description: 'Our fine-tuned AI models parse your intent, map it to your schema, resolve ambiguities, and plan the optimal query strategy.',
    code: 'Intent: aggregate\nCollection: orders\nField: totalAmount',
    color: '#4d9eff',
    bg: 'from-blue-500/20 to-blue-500/5',
  },
  {
    number: '03',
    icon: Code2,
    title: 'Query Generated',
    description: 'A complete, optimized MongoDB aggregation pipeline is generated with index hints, proper operators, and performance best practices.',
    code: 'db.orders.aggregate([\n  { $group: {...} },\n  { $sort: {...} }\n])',
    color: '#a855f7',
    bg: 'from-purple-500/20 to-purple-500/5',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Results Visualized',
    description: 'Data is returned and automatically visualized with the most appropriate chart type. Export, share, or embed in your dashboard.',
    code: '✓ 10 docs returned\n✓ Rendered as bar chart\n✓ 42ms execution',
    color: '#22c55e',
    bg: 'from-green-500/20 to-green-500/5',
  },
];

function StepCard({ step, index, total }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-14 left-[calc(50%+80px)] right-0 h-px">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.5 }}
            className="h-full origin-left"
            style={{ background: `linear-gradient(to right, ${step.color}40, ${steps[index + 1].color}40)` }}
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.15 + 0.8 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <ArrowRight size={12} style={{ color: steps[index + 1].color, opacity: 0.5 }} />
          </motion.div>
        </div>
      )}

      {/* Step circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="relative mb-6"
      >
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`, border: `1px solid ${step.color}30` }}
        >
          <Icon size={36} style={{ color: step.color }} />
          <div
            className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity"
            style={{ boxShadow: `0 0 40px ${step.color}40` }}
          />
        </div>
        {/* Number badge */}
        <div
          className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-[10px] border"
          style={{ background: step.color, borderColor: step.color, color: '#020817' }}
        >
          {step.number.slice(1)}
        </div>
        {/* Glow */}
        <div
          className="absolute -inset-4 rounded-full opacity-20 blur-xl"
          style={{ background: step.color }}
        />
      </motion.div>

      {/* Step number label */}
      <span className="font-mono text-[10px] tracking-widest mb-2" style={{ color: step.color, opacity: 0.6 }}>
        STEP {step.number}
      </span>

      {/* Title */}
      <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>

      {/* Description */}
      <p className="font-body text-sm text-slate-400 leading-relaxed mb-5 max-w-[220px]">
        {step.description}
      </p>

      {/* Code snippet */}
      <div
        className="glass rounded-xl p-4 w-full max-w-[220px]"
        style={{ borderColor: `${step.color}20` }}
      >
        <pre
          className="font-mono text-xs text-left whitespace-pre-line leading-relaxed"
          style={{ color: step.color, opacity: 0.9 }}
        >
          {step.code}
        </pre>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="section-tag mb-4"
          >
            ◆ Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            From idea to query
            <br />
            <span className="gradient-text">in milliseconds</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-lg text-slate-400 max-w-xl mx-auto"
          >
            Four simple steps. Zero MongoDB expertise required.
            Just describe what you need and watch the magic happen.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} total={steps.length} />
          ))}
        </div>

        {/* Bottom CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-20 glass border-glow rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">
              See it in action
            </h3>
            <p className="text-slate-400 font-body text-sm">
              Try it live with your own data — no credit card required.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 whitespace-nowrap shadow-2xl shadow-blue-electric/30"
          >
            Start Free Trial
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
