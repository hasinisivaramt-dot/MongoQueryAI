import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Layers, FileText, Timer, CheckCircle2, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { MOCK_STATS } from '../store.jsx';

const ICONS = { Zap, Layers, FileText, Timer, CheckCircle2, Brain };

function AnimatedNumber({ target, suffix, isInView }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (!isInView || ran.current) return;
    ran.current = true;
    const dur = 1600;
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(isFloat ? parseFloat((target * eased).toFixed(1)) : Math.floor(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target]);

  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K';
    return String(n);
  };

  return <span>{fmt(val)}{suffix}</span>;
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = ICONS[stat.icon];
  const pct = ((stat.value - stat.prev) / stat.prev * 100).toFixed(1);
  const up = stat.value > stat.prev;
  // For response time, lower is better
  const positive = stat.id === 'response' ? !up : up;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="stat-card-border dash-card rounded-2xl p-5 cursor-default overflow-hidden group"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, ${stat.color}10, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}25` }}>
            <Icon size={18} style={{ color: stat.color }} />
          </div>

          {/* Trend badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono ${
            positive ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(pct)}%
          </div>
        </div>

        <div className="font-display font-black text-3xl text-white mb-1" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
          <AnimatedNumber target={stat.value} suffix={stat.suffix} isInView={isInView} />
        </div>

        <p className="font-body text-xs text-slate-500 font-medium">{stat.label}</p>

        {/* Progress bar */}
        <div className="mt-3 h-px bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${Math.min((stat.value / (stat.value * 1.3)) * 100, 100)}%` } : {}}
            transition={{ duration: 1.2, delay: index * 0.07 + 0.4 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${stat.color}80, ${stat.color})` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {MOCK_STATS.map((stat, i) => <StatCard key={stat.id} stat={stat} index={i} />)}
    </div>
  );
}
