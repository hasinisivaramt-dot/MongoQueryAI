import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Menu, X, Zap, Code2, Link2, Mail, ExternalLink,
} from 'lucide-react';

// ── Navbar ────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features',     href: '#features',  page: 'landing' },
  { label: 'How It Works', href: '#',           page: 'how-it-works' },
  { label: 'Pricing',      href: '#pricing',    page: 'landing' },
  { label: 'Docs',         href: '#',           page: 'docs' },
  { label: 'About',        href: '#',           page: 'about' },
];

export function Navbar({ onLogin, onSignup, onNavigate, activePage = 'landing' }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (link) => {
    setMobileOpen(false);
    if (link.page !== 'landing') {
      onNavigate(link.page);
    } else if (link.href.startsWith('#') && link.href.length > 1) {
      onNavigate('landing');
      // Allow the landing page to mount, then scroll to anchor
      setTimeout(() => {
        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      onNavigate('landing');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong border-b border-cyan-glow/10 shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate('landing')}
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link, i) => {
            const isActive = link.page === activePage;
            return (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                onClick={() => handleNavClick(link)}
                className={`font-body text-sm font-medium tracking-wide transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.6)] relative group ${
                  isActive ? 'text-cyan-glow' : 'text-slate-400 hover:text-cyan-glow'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-cyan-glow to-blue-electric transition-all duration-300 ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </motion.button>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            onClick={onLogin}
            className="text-slate-400 hover:text-white font-body text-sm transition-colors"
          >
            Sign In
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={onSignup}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-electric/30"
          >
            <Zap size={14} />Get Started
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-glow transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-cyan-glow/10 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`text-left text-sm font-medium py-3 border-b border-white/5 transition-colors ${
                    link.page === activePage ? 'text-cyan-glow' : 'text-slate-300 hover:text-cyan-glow'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => { setMobileOpen(false); onLogin(); }}
                  className="btn-outline px-5 py-3 rounded-xl text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileOpen(false); onSignup(); }}
                  className="btn-primary px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Zap size={14} />Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product:    ['Features', 'How It Works', 'Pricing', 'Changelog', 'Roadmap'],
  Developers: ['Documentation', 'API Reference', 'SDKs', 'GitHub', 'Examples'],
  Company:    ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal:      ['Privacy Policy', 'Terms of Service', 'Security', 'Cookies', 'GDPR'],
};

export function Footer({ onNavigate }) {
  const handleLinkClick = (link) => {
    if (link === 'About') onNavigate('about');
    else if (link === 'How It Works') onNavigate('how-it-works');
    else if (link === 'Documentation' || link === 'API Reference') onNavigate('docs');
    else onNavigate('landing');
  };

  return (
    <footer className="relative border-t border-white/5 bg-navy-950">
      <div className="absolute inset-0 grid-overlay opacity-10" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 sm:gap-10 mb-10 sm:mb-16">
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
                <Database size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Mongo<span className="gradient-text-cyan">Query</span>
                <span className="text-cyan-glow ml-1 text-sm font-mono font-light opacity-80">AI</span>
              </span>
            </div>
            <p className="font-body text-sm text-slate-500 leading-relaxed mb-5 max-w-[220px]">
              AI-powered MongoDB query generation for modern developers.
            </p>
            <div className="flex items-center gap-3">
              {[Code2, X, Link2, Mail].map((Icon, i) => (
                <motion.a
                  key={i} href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/8 text-slate-500 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat} className="col-span-1">
              <h4 className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mb-4 sm:mb-5">{cat}</h4>
              <ul className="flex flex-col gap-2 sm:gap-3">
                {links.map(link => (
                  <li key={link}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="font-body text-sm text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1 group text-left"
                    >
                      {link}
                      {['GitHub', 'API Reference'].includes(link) && (
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6 sm:mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-slate-600 text-center sm:text-left">© 2025 MongoQuery AI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
