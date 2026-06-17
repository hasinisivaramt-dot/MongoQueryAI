import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Target, Zap, Users } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: 1000000,
    suffix: '+',
    display: '1M+',
    label: 'Queries Generated',
    sublabel: 'Every single month',
    color: '#00f5ff',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Target,
    value: 99.8,
    suffix: '%',
    display: '99.8%',
    label: 'Query Accuracy',
    sublabel: 'Validated against real data',
    color: '#4d9eff',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Zap,
    value: 50,
    suffix: 'ms',
    display: '50ms',
    label: 'Avg Response Time',
    sublabel: 'End-to-end latency',
    color: '#a855f7',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    display: '10K+',
    label: 'Developers',
    sublabel: 'Trust MongoQuery AI',
    color: '#22c55e',
    gradient: 'from-green-400 to-teal-500',
  },
];

function AnimatedCounter({ target, suffix, display, isInView }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isInView || done) return;
    setDone(true);

    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = String(target).includes('.');

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? parseFloat((target * eased).toFixed(1))
        : Math.floor(target * eased);
      setCount(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, target, done]);

  const formatted = count >= 1000000
    ? (count / 1000000).toFixed(1) + 'M'
    : count >= 1000
    ? (count / 1000).toFixed(1) + 'K'
    : String(count);

  return (
    <span>
      {formatted}{suffix}
    </span>
  );
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative glass border-glow-hover rounded-3xl p-8 text-center overflow-hidden"
    >
      {/* Background radial glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(circle at center, ${stat.color}12, transparent 70%)` }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${stat.color}50, transparent)` }}
      />

      {/* Icon */}
      <div className="relative inline-flex mb-6">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: `0 4px 30px ${stat.color}30` }}
        >
          <Icon size={26} className="text-white" />
        </div>
        <motion.div
          className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
          style={{ background: stat.color, filter: 'blur(12px)' }}
        />
      </div>

      {/* Number */}
      <div
        className="font-display font-black text-5xl lg:text-6xl mb-3 tracking-tight"
        style={{
          color: stat.color,
          textShadow: `0 0 30px ${stat.color}60, 0 0 60px ${stat.color}20`,
        }}
      >
        <AnimatedCounter
          target={stat.value}
          suffix={stat.suffix}
          display={stat.display}
          isInView={isInView}
        />
      </div>

      {/* Label */}
      <div className="font-display font-bold text-xl text-white mb-1">
        {stat.label}
      </div>

      {/* Sublabel */}
      <div className="font-body text-sm text-slate-500">
        {stat.sublabel}
      </div>

      {/* Bottom glow line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: index * 0.12 + 0.5 }}
        className="absolute bottom-0 left-8 right-8 h-px origin-left"
        style={{ background: `linear-gradient(to right, transparent, ${stat.color}40, transparent)` }}
      />
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/80 to-navy-950" />

      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] orb bg-blue-electric/8" />

      {/* Grid */}
      <div className="absolute inset-0 grid-overlay opacity-15" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="section-tag mb-4"
          >
            ◆ By the numbers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white tracking-tight"
          >
            Numbers that
            <span className="gradient-text"> speak for themselves</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Bottom logos band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-sm text-slate-600 mb-6 tracking-wide">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
            {['Stripe', 'Shopify', 'Notion', 'Vercel', 'Linear', 'Figma'].map((company) => (
              <span
                key={company}
                className="font-display font-bold text-xl text-slate-700 hover:text-slate-400 transition-colors cursor-pointer tracking-tight"
              >
                {company}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
