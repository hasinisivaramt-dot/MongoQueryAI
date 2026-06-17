import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Lead Backend Engineer',
    company: 'Fintech Scale',
    avatar: '👨‍💻',
    color: '#00f5ff',
    rating: 5,
    text: "MongoQuery AI has completely changed how our team interacts with MongoDB. What used to take 30 minutes of complex aggregation pipeline design now takes 5 seconds. The accuracy is genuinely stunning — it even suggested index optimizations we hadn't thought of.",
  },
  {
    name: 'Sarah Chen',
    role: 'Data Platform Lead',
    company: 'Stripe',
    avatar: '👩‍🔬',
    color: '#4d9eff',
    rating: 5,
    text: "We process billions of documents in MongoDB and were skeptical that AI could handle our complexity. We were wrong. MongoQuery AI generates production-grade aggregation pipelines that would take our engineers hours to write. It's now a core part of our data toolchain.",
  },
  {
    name: 'Marcus Williams',
    role: 'CTO',
    company: 'DevOps Unicorn',
    avatar: '🧑‍💼',
    color: '#a855f7',
    rating: 5,
    text: "The vector search integration alone is worth the price of admission. Being able to do semantic queries against our MongoDB Atlas cluster with just natural language has opened up entirely new product capabilities we're shipping to customers.",
  },
  {
    name: 'Priya Nair',
    role: 'Senior Software Engineer',
    company: 'Notion',
    avatar: '👩‍💻',
    color: '#22c55e',
    rating: 5,
    text: "I onboarded our entire engineering team in an afternoon. Non-database engineers can now query MongoDB for their feature work without bugging the data team. The schema intelligence is incredible — it just understands our data model without any configuration.",
  },
  {
    name: 'Daniel Park',
    role: 'VP of Engineering',
    company: 'SaaS Startup',
    avatar: '👨‍🔬',
    color: '#f59e0b',
    rating: 5,
    text: "We migrated from a SQL-heavy architecture to MongoDB and MongoQuery AI made the transition seamless. It even translates SQL-like thinking into proper MongoDB patterns. The real-time analytics dashboard is genuinely beautiful and our stakeholders love it.",
  },
  {
    name: 'Leila Hassan',
    role: 'Principal Engineer',
    company: 'Global E-Commerce',
    avatar: '👩‍🎨',
    color: '#ec4899',
    rating: 5,
    text: "Security and compliance were our biggest concerns — we're in a regulated industry. The enterprise tier gave us everything: VPC peering, field-level encryption, immutable audit logs. MongoQuery AI passed our security review first time. That never happens.",
  },
];

function TestimonialCard({ testimonial, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative glass border-glow-hover rounded-3xl p-7 flex flex-col gap-5 h-full overflow-hidden"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(ellipse at top left, ${testimonial.color}12, transparent 60%)` }}
      />

      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(to right, transparent, ${testimonial.color}50, transparent)` }}
      />

      {/* Quote icon */}
      <div className="absolute top-6 right-6 opacity-10">
        <Quote size={40} style={{ color: testimonial.color }} />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Text */}
      <p className="font-body text-sm text-slate-300 leading-relaxed flex-1 relative z-10">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-white/5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl border"
          style={{
            background: `${testimonial.color}15`,
            borderColor: `${testimonial.color}30`,
          }}
        >
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-display font-bold text-white text-sm">{testimonial.name}</div>
          <div className="font-body text-xs text-slate-500">
            {testimonial.role} · <span style={{ color: testimonial.color, opacity: 0.8 }}>{testimonial.company}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-navy-900/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-electric/15 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 orb bg-purple-600/10" />
      <div className="absolute bottom-20 left-10 w-72 h-72 orb bg-blue-electric/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="section-tag mb-4"
          >
            ◆ Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            Loved by
            <span className="gradient-text"> world-class engineers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-lg text-slate-400 max-w-xl mx-auto"
          >
            Join thousands of developers who have transformed their MongoDB workflow.
          </motion.p>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {visible.map((t, i) => (
              <TestimonialCard key={t.name} testimonial={t} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-glow hover:border-cyan-glow/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </motion.button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="transition-all duration-300"
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === page ? '24px' : '8px',
                    height: '8px',
                    background: i === page ? '#00f5ff' : 'rgba(255,255,255,0.15)',
                  }}
                />
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-glow hover:border-cyan-glow/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
