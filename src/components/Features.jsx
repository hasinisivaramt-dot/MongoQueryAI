import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  MessageSquare, Cpu, Search, BarChart3, GitBranch, PieChart, Shield, Brain
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Natural Language Queries',
    description: 'Type in plain English. Our AI understands intent, context, and nuance to generate precise MongoDB queries instantly.',
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'rgba(0,245,255,0.2)',
    tag: 'NLP Engine',
  },
  {
    icon: Cpu,
    title: 'AI Query Generation',
    description: 'Fine-tuned transformer models generate optimized MongoDB queries with proper indexing hints and performance considerations.',
    gradient: 'from-blue-400 to-purple-500',
    glow: 'rgba(77,158,255,0.2)',
    tag: 'LLM-Powered',
  },
  {
    icon: Search,
    title: 'MongoDB Vector Search',
    description: 'Leverage Atlas Vector Search to find semantically similar documents using embeddings and kNN algorithms.',
    gradient: 'from-purple-400 to-pink-500',
    glow: 'rgba(168,85,247,0.2)',
    tag: 'Atlas Search',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Live dashboards powered by change streams. Watch your data transform in real-time with zero latency overhead.',
    gradient: 'from-green-400 to-cyan-500',
    glow: 'rgba(34,197,94,0.2)',
    tag: 'Change Streams',
  },
  {
    icon: GitBranch,
    title: 'Aggregation Pipelines',
    description: 'Visually compose complex multi-stage aggregation pipelines with drag-and-drop stages and AI optimization.',
    gradient: 'from-orange-400 to-red-500',
    glow: 'rgba(251,146,60,0.2)',
    tag: 'Pipeline Builder',
  },
  {
    icon: PieChart,
    title: 'Smart Visualizations',
    description: 'Auto-generate charts, graphs, and dashboards from query results. D3.js-powered interactive data exploration.',
    gradient: 'from-yellow-400 to-orange-500',
    glow: 'rgba(251,191,36,0.2)',
    tag: 'D3 + Recharts',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II certified. Field-level encryption, RBAC, audit logs, and VPC peering for maximum data protection.',
    gradient: 'from-teal-400 to-cyan-500',
    glow: 'rgba(20,184,166,0.2)',
    tag: 'SOC 2 Certified',
  },
  {
    icon: Brain,
    title: 'Semantic Schema Matching',
    description: 'AI understands your collection structure and automatically maps natural language fields to your actual schema.',
    gradient: 'from-indigo-400 to-blue-500',
    glow: 'rgba(99,102,241,0.2)',
    tag: 'Schema Intelligence',
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative glass border-glow-hover rounded-2xl p-6 cursor-pointer overflow-hidden"
      style={{ borderColor: 'rgba(0,245,255,0.08)' }}
    >
      {/* Hover background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, ${feature.glow} 0%, transparent 60%)` }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/30 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 relative inline-block">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
            style={{ boxShadow: `0 4px 20px ${feature.glow}` }}
          >
            <Icon size={22} className="text-white" />
          </div>
        </div>

        {/* Tag */}
        <div className="mb-3">
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase bg-white/5 px-2 py-1 rounded-md">
            {feature.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-cyan-glow/90 transition-colors duration-300">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
          {feature.description}
        </p>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-2 text-cyan-glow opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
          <span className="font-mono text-xs">Learn more</span>
          <span className="text-lg">→</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-900/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-electric/20 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 orb bg-blue-electric/10" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 orb bg-cyan-glow/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div ref={titleRef} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="section-tag mb-4"
          >
            ◆ Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            Everything you need to
            <br />
            <span className="gradient-text">master MongoDB</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-lg text-slate-400 max-w-2xl mx-auto"
          >
            A complete AI-powered platform designed to make MongoDB accessible, powerful,
            and lightning-fast for teams of all sizes.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
