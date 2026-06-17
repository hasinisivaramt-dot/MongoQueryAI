import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Menu, X, Zap } from 'lucide-react';

const navLinks = ['Features', 'How It Works', 'Pricing', 'Docs', 'About'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong border-b border-cyan-glow/10 shadow-lg shadow-black/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
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

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="text-slate-400 hover:text-cyan-glow font-body text-sm font-medium tracking-wide transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.6)] relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-glow to-blue-neon group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-400 hover:text-white font-body text-sm transition-colors"
          >
            Sign In
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-electric/30"
          >
            <Zap size={14} />
            Get Started
          </motion.button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-cyan-glow transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-cyan-glow/10"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-slate-300 hover:text-cyan-glow text-sm font-medium py-2 border-b border-white/5 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <button className="btn-primary px-5 py-3 rounded-xl text-sm font-semibold mt-2">
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
