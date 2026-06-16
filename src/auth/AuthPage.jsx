import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Eye, EyeOff, Zap, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../dashboard/store.jsx';

function Particles() {
  const pts = Array.from({ length: 28 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 1, dur: Math.random() * 6 + 4, delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            background: p.id % 2 === 0 ? 'rgba(0,245,255,0.6)' : 'rgba(77,158,255,0.4)' }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

export default function AuthPage({ onAuth, onBack }) {
  const [mode, setMode]       = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const { login, signup }     = useAuth();

  // Scroll to top when auth page mounts
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    if (mode === 'signup' && !form.name) { setError('Name is required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    try {
      mode === 'login' ? login(form.email, form.password) : signup(form.name, form.email, form.password);
      onAuth();
    } catch {
      setError('Authentication failed. Please try again.');
    }
    setLoading(false);
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    login('demo@mongoquery.ai', 'demo123');
    onAuth();
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center relative overflow-hidden">
      <Particles />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-electric/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-glow/8 blur-[80px]" />

      {/* Back to landing */}
      <motion.button
        onClick={onBack}
        whileHover={{ x: -3 }}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-cyan-glow font-body text-sm transition-colors z-10"
      >
        <ArrowLeft size={16} />
        Back to home
      </motion.button>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center shadow-lg shadow-blue-electric/30">
            <Database size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Mongo<span className="gradient-text-cyan">Query</span>
            <span className="text-cyan-glow text-sm font-mono font-light ml-1 opacity-80">AI</span>
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="glass rounded-3xl p-8 border-glow">

          {/* Tab switcher */}
          <div className="flex gap-1 bg-navy-800/50 rounded-xl p-1 mb-8">
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium font-body capitalize transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit} className="flex flex-col gap-4">

              {mode === 'signup' && (
                <div>
                  <label className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-2 block">Full Name</label>
                  <input type="text" placeholder="Arjun Mehta"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
              )}

              <div>
                <label className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-2 block">Email</label>
                <input type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
              </div>

              <div>
                <label className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-2 block">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="dash-input w-full px-4 py-3 pr-12 rounded-xl text-sm" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-glow transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="text-right -mt-1">
                  <button type="button" className="font-body text-xs text-slate-500 hover:text-cyan-glow transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="badge-error px-4 py-2.5 rounded-xl text-xs font-mono">
                  {error}
                </motion.div>
              )}

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                className="btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-60">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                ) : (
                  <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={16} /></>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/5" />
            <span className="font-mono text-xs text-slate-600">or</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <motion.button onClick={demoLogin} disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full btn-outline py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <Zap size={15} className="text-cyan-glow" />
            Try Demo Account — no signup needed
          </motion.button>

          {mode === 'signup' && (
            <div className="mt-5 space-y-2">
              {['14-day Pro trial, free', 'No credit card required', 'SOC 2 certified platform'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-body text-slate-500">
                  <Check size={12} className="text-cyan-glow flex-shrink-0" />{f}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <p className="text-center mt-6 font-body text-xs text-slate-600">
          By continuing you agree to our{' '}
          <a href="#" className="text-slate-500 hover:text-cyan-glow transition-colors">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-slate-500 hover:text-cyan-glow transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
