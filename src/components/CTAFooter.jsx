import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Sparkles, Database, X,
  BookOpen, Code2, Mail, ExternalLink, Zap, Link2, Globe
} from 'lucide-react';

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] orb bg-blue-electric"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] orb bg-cyan-glow"
      />

      {/* Grid */}
      <div className="absolute inset-0 grid-overlay opacity-25" />

      {/* Ring decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-glow/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-blue-electric/5" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 glass border-glow rounded-full px-5 py-2 mb-10"
        >
          <Zap size={12} className="text-yellow-400" />
          <span className="section-tag text-[10px]">Start building today — free forever on Starter</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-display font-black text-5xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.05]"
        >
          Start Building Smarter
          <br />
          <span className="gradient-text">MongoDB Queries Today</span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="font-body text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Join 10,000+ engineers who've made MongoDB effortless.
          No complex syntax. No hours of documentation. Just describe what you need.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-5 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-10 py-5 rounded-2xl text-lg font-semibold flex items-center gap-3 shadow-2xl shadow-blue-electric/40"
          >
            <Sparkles size={20} />
            Get Started Free
            <ArrowRight size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline px-10 py-5 rounded-2xl text-lg font-medium flex items-center gap-3"
          >
            <BookOpen size={18} />
            Read the Docs
          </motion.button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-slate-600"
        >
          {[
            '✓ No credit card required',
            '✓ 14-day Pro trial',
            '✓ Cancel anytime',
            '✓ SOC 2 certified',
          ].map((item) => (
            <span key={item} className="font-body text-sm">
              <span className="text-cyan-glow opacity-70">{item.split(' ')[0]}</span>{' '}
              {item.slice(2)}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const footerLinks = {
  Product: ['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'],
  Developers: ['Documentation', 'API Reference', 'SDKs', 'GitHub', 'Examples'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'Cookies', 'GDPR'],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-navy-950">
      <div className="absolute inset-0 grid-overlay opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
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
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Code2, label: 'GitHub', href: '#' },
                { icon: X, label: 'X / Twitter', href: '#' },
                { icon: Link2, label: 'LinkedIn', href: '#' },
                { icon: Mail, label: 'Email', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={label}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/8 text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-5">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-sm text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1 group"
                    >
                      {link}
                      {(link === 'GitHub' || link === 'API Reference') && (
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-slate-600">
            © 2025 MongoQuery AI, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600">
              All systems operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: BookOpen, label: 'Docs' },
              { icon: Code2, label: 'GitHub' },
              { icon: Globe, label: 'API' },
              { icon: Mail, label: 'Contact' },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                className="font-body text-xs text-slate-600 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <Icon size={12} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
