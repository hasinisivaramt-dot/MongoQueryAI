import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Sparkles } from 'lucide-react';

// Particle system
function Particles() {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? 'rgba(0, 245, 255, 0.8)'
              : p.id % 3 === 1
              ? 'rgba(77, 158, 255, 0.6)'
              : 'rgba(168, 85, 247, 0.5)',
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Typing effect hook
function useTypingEffect(texts, speed = 60) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setDisplayText(current.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(current.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        } else {
          setIsDeleting(false);
          setTextIndex(i => (i + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed]);

  return displayText;
}

// Query mockup card
function QueryCard() {
  const lines = [
    { type: 'comment', text: '// Natural language → MongoDB query' },
    { type: 'keyword', text: 'const', rest: ' result = await MongoQueryAI.query(' },
    { type: 'string', text: '  "Show top 10 users by revenue last 30 days"' },
    { type: 'normal', text: ');' },
    { type: 'comment', text: '' },
    { type: 'comment', text: '// AI-generated aggregation pipeline' },
    { type: 'bracket', text: '[' },
    { type: 'indent', text: '  { $match: { createdAt: { $gte: last30days } } },' },
    { type: 'indent', text: '  { $group: { _id: "$userId", revenue: { $sum: "$amount" } } },' },
    { type: 'indent', text: '  { $sort: { revenue: -1 } }, { $limit: 10 }' },
    { type: 'bracket', text: ']' },
  ];

  const colorMap = {
    comment: 'text-slate-500',
    keyword: 'text-purple-400',
    string: 'text-green-400',
    bracket: 'text-yellow-400',
    indent: 'text-slate-300',
    normal: 'text-slate-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="glass border-glow rounded-2xl overflow-hidden shadow-2xl shadow-blue-electric/20"
        style={{ maxWidth: '520px' }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-glow/10 bg-navy-800/50">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 font-mono text-xs text-slate-500">query.js — MongoQuery AI</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span className="font-mono text-xs text-cyan-glow opacity-60">LIVE</span>
          </div>
        </div>

        {/* Code */}
        <div className="p-5 code-block space-y-0.5">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.08 }}
              className={`${colorMap[line.type]} text-xs leading-6`}
            >
              <span className="text-slate-600 mr-4 select-none text-[10px]">{String(i + 1).padStart(2, '0')}</span>
              {line.type === 'keyword'
                ? <><span className="text-purple-400">{line.text}</span><span className="text-slate-300">{line.rest}</span></>
                : line.text
              }
            </motion.div>
          ))}
        </div>

        {/* Result bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="px-5 py-3 bg-green-500/5 border-t border-green-500/10 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-green-400">Query executed in 42ms · 10 documents returned</span>
        </motion.div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-electric/30 to-transparent" />
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute -top-4 -right-4 glass border-glow rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <Sparkles size={12} className="text-yellow-400" />
        <span className="font-mono text-xs text-slate-300">AI-Powered</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.7 }}
        className="absolute -bottom-4 -left-4 glass border-glow rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
        <span className="font-mono text-xs text-slate-300">99.8% accuracy</span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(springY, [-300, 300], [8, -8]);
  const rotateY = useTransform(springX, [-500, 500], [-8, 8]);

  const typedText = useTypingEffect([
    'MongoDB like never before',
    'smarter with natural language',
    'faster with AI-powered pipelines',
    'at enterprise scale',
  ], 65);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient"
      style={{ paddingTop: '100px' }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Particles */}
      <Particles />

      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 orb bg-blue-electric/20" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 orb bg-cyan-glow/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb bg-purple-600/5" />

      {/* Animated gradient ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-glow/5 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-electric/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border-glow rounded-full px-4 py-2 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span className="section-tag text-[10px]">Powered by AI · Vector Search · MongoDB Atlas</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-black text-5xl lg:text-7xl leading-[1.05] tracking-tight mb-6"
          >
            <span className="text-white">Query </span>
            <span className="gradient-text">MongoDB</span>
            <br />
            <span className="text-white">Like </span>
            <span className="text-slate-200">
              {typedText}
              <span className="cursor text-cyan-glow">|</span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-body text-lg text-slate-400 leading-relaxed mb-10 max-w-xl"
          >
            Transform natural language into powerful MongoDB queries instantly using AI, vector search,
            and intelligent aggregations. No more complex syntax — just describe what you need.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-3 shadow-2xl shadow-blue-electric/30"
            >
              <Sparkles size={18} />
              Try MongoQuery Free
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-outline px-8 py-4 rounded-2xl text-base font-medium flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center">
                <Play size={12} className="text-cyan-glow ml-0.5" />
              </div>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {['🧑‍💻', '👩‍💻', '🧑‍🔬', '👨‍💼', '👩‍🔬'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-navy-700 border-2 border-navy-950 flex items-center justify-center text-sm">
                  {emoji}
                </div>
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

        {/* Right — Code card */}
        <motion.div
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          className="flex justify-center lg:justify-end"
        >
          <QueryCard />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} className="text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
