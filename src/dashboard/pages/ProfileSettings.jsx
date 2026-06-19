import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Activity, Key, Copy, Check, Edit3, Save, X,
  LogOut, Trash2, Eye, EyeOff, Bell, Zap,
  Database, Sliders, Lock, RefreshCw,
  AlertCircle, CheckCircle2, Clock, TrendingUp, FileText,
  Palette, Mail, Smartphone, Monitor, Moon,
} from 'lucide-react';
import { useAuth } from '../store.jsx';

const pv = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Persist settings to sessionStorage ───────────────────────────────────────
function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  const setPersistedState = useCallback((value) => {
    setState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      try { sessionStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);

  return [state, setPersistedState];
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-4 sm:px-5 py-3 rounded-2xl font-mono text-xs flex items-center gap-3 shadow-2xl max-w-[calc(100vw-2rem)] ${
        type === 'success' ? 'badge-success' : type === 'error' ? 'badge-error' : 'badge-info'}`}>
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      <span className="truncate">{msg}</span>
    </motion.div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = 'success') => setToast({ msg, type, id: Date.now() });
  const hide  = () => setToast(null);
  const el = (
    <AnimatePresence>
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={hide} />}
    </AnimatePresence>
  );
  return { show, el };
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
      style={{ background: value ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}>
      <motion.div animate={{ x: value ? 22 : 2 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md" />
    </button>
  );
}

// ── Activity log (mock) ───────────────────────────────────────────────────────
const ACTIVITY = [
  { id: 1, action: 'Query executed',       detail: 'db.employees.find({dept:"Engineering"})', time: '2 min ago',  icon: Zap,        color: '#00f5ff' },
  { id: 2, action: 'Pipeline ran',          detail: '$match → $group → $sort → $limit',         time: '14 min ago', icon: Activity,   color: '#4d9eff' },
  { id: 3, action: 'Collection opened',     detail: 'orders (892,341 documents)',                time: '1 hr ago',   icon: Database,   color: '#a855f7' },
  { id: 4, action: 'API key regenerated',   detail: 'Key ending …c3f9 was replaced',             time: '3 hr ago',   icon: Key,        color: '#f59e0b' },
  { id: 5, action: 'Profile updated',       detail: 'Display name changed',                      time: '1 day ago',  icon: User,       color: '#22c55e' },
  { id: 6, action: 'Password changed',      detail: 'Security update',                           time: '3 days ago', icon: Lock,       color: '#ec4899' },
];

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, logout } = useAuth();
  const { show: showToast, el: toastEl } = useToast();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey]   = useState(false);
  const [form, setForm] = usePersistedState('mqai_profile_form', {
    name:  user?.name  || '',
    email: user?.email || '',
    role:  'Senior Engineer',
    bio:   'Building data-driven applications with MongoDB and AI.',
  });

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: User     },
    { id: 'activity',  label: 'Activity',  icon: Activity },
    { id: 'security',  label: 'Security',  icon: Shield   },
    { id: 'api',       label: 'API Keys',  icon: Key      },
  ];

  const copyKey = () => {
    navigator.clipboard.writeText(user?.apiKey || '');
    setCopiedKey(true); showToast('API key copied');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const STATS = [
    { label: 'Total Queries',  value: user?.queriesUsed?.toLocaleString() || '1,247', icon: Zap,          color: '#00f5ff' },
    { label: 'Success Rate',   value: '98.4%',                                         icon: CheckCircle2, color: '#22c55e' },
    { label: 'Queries/Month',  value: '412',                                            icon: TrendingUp,   color: '#4d9eff' },
    { label: 'Collections',    value: '24',                                             icon: Database,     color: '#a855f7' },
  ];

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-5 sm:space-y-6 max-w-4xl">
      {toastEl}

      {/* Profile hero */}
      <div className="dash-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <div className="relative flex-shrink-0 self-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center text-white font-display font-black text-2xl sm:text-3xl shadow-xl shadow-blue-electric/30">
              {(form.name?.[0] || 'U').toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-navy-950" />
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Name</label>
                    <input className="dash-input w-full px-3 py-2 rounded-xl text-sm"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Role</label>
                    <input className="dash-input w-full px-3 py-2 rounded-xl text-sm"
                      value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Bio</label>
                  <textarea className="dash-input w-full px-3 py-2 rounded-xl text-sm resize-none" rows={2}
                    value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); showToast('Profile saved'); }}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-body flex items-center gap-2">
                    <Save size={12} />Save
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="btn-outline px-4 py-2 rounded-xl text-xs font-body flex items-center gap-2">
                    <X size={12} />Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="font-display font-black text-xl sm:text-2xl text-white">{form.name}</h2>
                  <span className="badge-info px-2.5 py-0.5 rounded-lg font-mono text-[10px]">{user?.plan} Plan</span>
                </div>
                <p className="font-mono text-sm text-slate-500 mb-1">{form.role}</p>
                <p className="font-body text-sm text-slate-400 mb-1">{user?.email}</p>
                <p className="font-body text-sm text-slate-500 italic">{form.bio}</p>
              </>
            )}
          </div>

          {!editing && (
            <button onClick={() => setEditing(true)}
              className="btn-outline px-4 py-2 rounded-xl text-sm font-body flex items-center gap-2 flex-shrink-0 self-start">
              <Edit3 size={13} />Edit
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/5">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
                <Icon size={14} className="mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="font-display font-black text-lg sm:text-xl text-white">{s.value}</p>
                <p className="font-mono text-[9px] text-slate-600 mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Usage bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] text-slate-600">Query Usage</span>
            <span className="font-mono text-[10px] text-cyan-glow">
              {Math.round(((user?.queriesUsed || 0) / (user?.queriesLimit || 1)) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }}
              animate={{ width: `${Math.min(((user?.queriesUsed || 0) / (user?.queriesLimit || 1)) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric" />
          </div>
          <p className="font-mono text-[10px] text-slate-600 mt-1">
            {(user?.queriesUsed || 0).toLocaleString()} / {(user?.queriesLimit || 0).toLocaleString()} queries
          </p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 bg-navy-800/40 rounded-xl p-1 w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-body transition-all whitespace-nowrap ${
                  tab === t.id ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <Icon size={13} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card rounded-2xl p-4 sm:p-5">
              <h3 className="font-display font-bold text-sm text-white mb-4">Account Information</h3>
              <div className="space-y-1">
                {[
                  { label: 'Account ID',   value: user?.id },
                  { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Plan',         value: `${user?.plan} Plan` },
                  { label: 'Connected DB', value: user?.connected || 'Not connected' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0 gap-3">
                    <span className="font-mono text-xs text-slate-500 flex-shrink-0">{row.label}</span>
                    <span className="font-body text-sm text-slate-200 truncate text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'activity' && (
          <motion.div key="activity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-white/5">
                <h3 className="font-display font-bold text-sm text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-white/4">
                {ACTIVITY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="px-4 sm:px-5 py-3.5 flex items-start gap-3 sm:gap-4 hover:bg-white/2 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}15`, border: `1px solid ${item.color}20` }}>
                        <Icon size={13} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-slate-200">{item.action}</p>
                        <p className="font-mono text-xs text-slate-500 truncate">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} className="text-slate-600" />
                        <span className="font-mono text-[10px] text-slate-600">{item.time}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-4">
              <h3 className="font-display font-bold text-sm text-white">Change Password</h3>
              {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                <div key={label}>
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                  <input type="password" placeholder="••••••••" className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
              ))}
              <button onClick={() => showToast('Password updated')}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2">
                <Lock size={13} />Update Password
              </button>
            </div>
            <div className="dash-card rounded-2xl p-4 sm:p-5 border border-red-500/15">
              <h3 className="font-display font-bold text-sm text-red-400 mb-1">Danger Zone</h3>
              <p className="font-mono text-[10px] text-slate-600 mb-4">These actions are irreversible.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => showToast('Sessions cleared', 'info')}
                  className="px-4 py-2 rounded-xl font-body text-sm text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/8 transition-all flex items-center gap-2">
                  <RefreshCw size={13} />Clear Sessions
                </button>
                <button onClick={() => showToast('Account deletion requires email confirmation', 'error')}
                  className="px-4 py-2 rounded-xl font-body text-sm text-red-400 border border-red-500/20 hover:bg-red-500/8 transition-all flex items-center gap-2">
                  <Trash2 size={13} />Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'api' && (
          <motion.div key="api" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card rounded-2xl p-4 sm:p-5">
              <h3 className="font-display font-bold text-sm text-white mb-1">Your API Key</h3>
              <p className="font-mono text-[10px] text-slate-600 mb-4">Keep this secret. Regenerating invalidates the current key.</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 bg-black/30 border border-white/8 rounded-xl px-3 sm:px-4 py-3 font-mono text-xs text-slate-300 overflow-hidden min-w-0">
                  <span className="block truncate">
                    {showKey ? user?.apiKey : (user?.apiKey || '').replace(/./g, '•').slice(0, 24) + '…'}
                  </span>
                </div>
                <button onClick={() => setShowKey(s => !s)}
                  className="w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow transition-all flex-shrink-0">
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={copyKey}
                  className="w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-cyan-glow transition-all flex-shrink-0">
                  {copiedKey ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                </button>
              </div>
              <button onClick={() => showToast('API key regenerated', 'info')}
                className="btn-outline px-4 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 mt-4">
                <RefreshCw size={13} />Regenerate Key
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user } = useAuth();
  const { show: showToast, el: toastEl } = useToast();
  const [section, setSection] = useState('general');
  const [saving,  setSaving]  = useState(false);

  // Persisted settings
  const [generalSettings, setGeneralSettings]   = usePersistedState('mqai_settings_general', {
    name: user?.name || '', email: user?.email || '', timezone: 'Asia/Kolkata (IST)', language: 'English (US)',
  });
  const [connSettings, setConnSettings]         = usePersistedState('mqai_settings_conn', {
    connStr: '', defaultDB: 'myDB', timeout: '5000', autoReconnect: true, tls: true, slowQuery: true, changeStreams: false,
  });
  const [aiSettings, setAiSettings]             = usePersistedState('mqai_settings_ai', {
    model: 'claude-sonnet-4-6', maxTokens: 1000, temperature: 0.1, autoOptimize: true, includeExplanation: true, suggestIndexes: false, vectorSearch: true, schemaDetection: true,
  });
  const [themeSettings, setThemeSettings]       = usePersistedState('mqai_settings_theme', {
    theme: 'dark', accent: '#00f5ff', reduceMotion: false, compactSidebar: false, lineNumbers: true, glassmorphism: true,
  });
  const [notifSettings, setNotifSettings]       = usePersistedState('mqai_settings_notifs', {
    queryAlerts: true, slowQuery: true, aiAccuracy: true, indexSuggestions: false, weeklyDigest: true, securityAlerts: true, productUpdates: false, browserPush: true,
  });
  const [securitySettings, setSecuritySettings] = usePersistedState('mqai_settings_security', {
    sessionTimeout: '1 hour', requireReauth: true, ipWhitelist: false, auditLog: true, blockConcurrent: false,
  });

  const save = async (label) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    showToast(`${label} saved`);
  };

  const SECTIONS = [
    { id: 'general',  label: 'General',        icon: Sliders  },
    { id: 'mongodb',  label: 'MongoDB Config',  icon: Database },
    { id: 'ai',       label: 'AI Settings',     icon: Zap      },
    { id: 'theme',    label: 'Appearance',      icon: Palette  },
    { id: 'notifs',   label: 'Notifications',   icon: Bell     },
    { id: 'security', label: 'Security',        icon: Shield   },
  ];

  const SaveBtn = ({ label }) => (
    <button onClick={() => save(label)} disabled={saving}
      className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
      {saving ? <><RefreshCw size={13} className="animate-spin" />Saving…</> : <><Save size={13} />{label}</>}
    </button>
  );

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="space-y-5 sm:space-y-6">
      {toastEl}

      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
        {/* Section nav — horizontal on mobile, vertical on desktop */}
        <aside className="w-full sm:w-52 flex-shrink-0">
          <div className="dash-card rounded-2xl p-2">
            {/* Mobile: horizontal scroll */}
            <div className="flex sm:flex-col gap-1 overflow-x-auto pb-1 sm:pb-0 dash-scroll">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setSection(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-body whitespace-nowrap sm:whitespace-normal w-auto sm:w-full flex-shrink-0 sm:flex-shrink
                      ${section === s.id
                        ? 'bg-cyan-glow/8 text-white border-l-0 sm:border-l-2 border-cyan-glow'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/4'}`}>
                    <Icon size={14} className={section === s.id ? 'text-cyan-glow' : ''} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {section === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">General Settings</h3>
                  {[
                    { label: 'Display Name', key: 'name',     type: 'text'  },
                    { label: 'Email',        key: 'email',    type: 'email' },
                    { label: 'Timezone',     key: 'timezone', type: 'text'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">{f.label}</label>
                      <input type={f.type} value={generalSettings[f.key]}
                        onChange={e => setGeneralSettings(s => ({ ...s, [f.key]: e.target.value }))}
                        className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Language</label>
                    <select value={generalSettings.language}
                      onChange={e => setGeneralSettings(s => ({ ...s, language: e.target.value }))}
                      className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['English (US)', 'English (UK)', 'Hindi', 'German', 'French', 'Spanish'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <SaveBtn label="Save Changes" />
                </div>
              </motion.div>
            )}

            {section === 'mongodb' && (
              <motion.div key="mongodb" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">MongoDB Configuration</h3>
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
                    <span className="font-mono text-xs text-green-400">Connected · {user?.connected || 'cluster0.mongodb.net'}</span>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Connection String</label>
                    <input type="password" value={connSettings.connStr}
                      onChange={e => setConnSettings(s => ({ ...s, connStr: e.target.value }))}
                      placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
                      className="dash-input w-full px-4 py-3 rounded-xl text-sm font-mono" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Default Database</label>
                      <input value={connSettings.defaultDB}
                        onChange={e => setConnSettings(s => ({ ...s, defaultDB: e.target.value }))}
                        className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Timeout (ms)</label>
                      <input value={connSettings.timeout}
                        onChange={e => setConnSettings(s => ({ ...s, timeout: e.target.value }))}
                        className="dash-input w-full px-4 py-3 rounded-xl text-sm font-mono" />
                    </div>
                  </div>
                  {[
                    { label: 'Auto-reconnect on disconnect',  key: 'autoReconnect' },
                    { label: 'Enable TLS / SSL',              key: 'tls'           },
                    { label: 'Log slow queries (>100ms)',     key: 'slowQuery'     },
                    { label: 'Enable change streams',         key: 'changeStreams'  },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle value={connSettings[item.key]} onChange={v => setConnSettings(s => ({ ...s, [item.key]: v }))} />
                    </div>
                  ))}
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => showToast('Connection verified')} className="btn-outline px-4 py-2.5 rounded-xl text-sm font-body flex items-center gap-2">
                      <CheckCircle2 size={13} />Test Connection
                    </button>
                    <SaveBtn label="Save" />
                  </div>
                </div>
              </motion.div>
            )}

            {section === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-5">
                  <h3 className="font-display font-bold text-sm text-white">AI Query Engine</h3>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Model</label>
                    <select value={aiSettings.model} onChange={e => setAiSettings(s => ({ ...s, model: e.target.value }))}
                      className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-6'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Max Tokens</label>
                      <span className="font-mono text-xs text-cyan-glow">{aiSettings.maxTokens}</span>
                    </div>
                    <input type="range" min={256} max={4096} step={128} value={aiSettings.maxTokens}
                      onChange={e => setAiSettings(s => ({ ...s, maxTokens: +e.target.value }))}
                      className="w-full accent-cyan-500 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Temperature</label>
                      <span className="font-mono text-xs text-cyan-glow">{aiSettings.temperature.toFixed(2)}</span>
                    </div>
                    <input type="range" min={0} max={1} step={0.05} value={aiSettings.temperature}
                      onChange={e => setAiSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                      className="w-full accent-cyan-500 cursor-pointer" />
                  </div>
                  {[
                    { label: 'Auto-optimize queries',       key: 'autoOptimize'       },
                    { label: 'Include explanation',         key: 'includeExplanation'  },
                    { label: 'Suggest indexes',             key: 'suggestIndexes'      },
                    { label: 'Enable vector semantic search',key:'vectorSearch'        },
                    { label: 'Schema auto-detection',       key: 'schemaDetection'     },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle value={aiSettings[item.key]} onChange={v => setAiSettings(s => ({ ...s, [item.key]: v }))} />
                    </div>
                  ))}
                  <SaveBtn label="Save AI Settings" />
                </div>
              </motion.div>
            )}

            {section === 'theme' && (
              <motion.div key="theme" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-5">
                  <h3 className="font-display font-bold text-sm text-white">Appearance</h3>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark',    label: 'Dark',    icon: Moon    },
                        { id: 'darker',  label: 'Midnight',icon: Monitor },
                        { id: 'system',  label: 'System',  icon: Smartphone },
                      ].map(t => {
                        const Icon = t.icon;
                        return (
                          <button key={t.id} onClick={() => { setThemeSettings(s => ({ ...s, theme: t.id })); showToast(`${t.label} theme applied`, 'info'); }}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                              themeSettings.theme === t.id ? 'border-cyan-glow/40 bg-cyan-glow/5' : 'border-white/8 hover:border-white/20'}`}>
                            <div className={`w-10 h-6 rounded-md border ${t.id === 'dark' ? 'bg-navy-950 border-cyan-glow/30' : t.id === 'darker' ? 'bg-black border-cyan-glow/20' : 'bg-slate-800 border-slate-600/30'}`} />
                            <Icon size={12} className="text-slate-400" />
                            <span className="font-mono text-[10px] text-slate-400">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 block">Accent Color</label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { name: 'Cyan',   color: '#00f5ff' },
                        { name: 'Blue',   color: '#4d9eff' },
                        { name: 'Purple', color: '#a855f7' },
                        { name: 'Green',  color: '#22c55e' },
                        { name: 'Pink',   color: '#ec4899' },
                      ].map(c => (
                        <button key={c.name} onClick={() => { setThemeSettings(s => ({ ...s, accent: c.color })); showToast(`${c.name} accent applied`, 'info'); }}
                          className="flex flex-col items-center gap-1.5 group">
                          <div className={`w-8 h-8 rounded-full border-2 transition-all ${themeSettings.accent === c.color ? 'border-white scale-110' : 'border-transparent group-hover:border-white/30'}`}
                            style={{ background: c.color, boxShadow: `0 0 12px ${c.color}50` }} />
                          <span className="font-mono text-[9px] text-slate-600">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    { label: 'Reduce motion / animations', key: 'reduceMotion'    },
                    { label: 'Compact sidebar',            key: 'compactSidebar'  },
                    { label: 'Show query line numbers',    key: 'lineNumbers'     },
                    { label: 'Glassmorphism effects',      key: 'glassmorphism'   },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle value={themeSettings[item.key]} onChange={v => setThemeSettings(s => ({ ...s, [item.key]: v }))} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {section === 'notifs' && (
              <motion.div key="notifs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-1">
                  <h3 className="font-display font-bold text-sm text-white mb-4">Notification Preferences</h3>
                  {[
                    { label: 'Query execution alerts',      sub: 'Notify when query completes',        key: 'queryAlerts'      },
                    { label: 'Slow query warnings',         sub: 'Alert when query exceeds 500ms',     key: 'slowQuery'        },
                    { label: 'AI accuracy drops',           sub: 'Notify if accuracy falls below 90%', key: 'aiAccuracy'       },
                    { label: 'Index suggestion alerts',     sub: 'When AI detects missing indexes',    key: 'indexSuggestions' },
                    { label: 'Weekly usage digest',         sub: 'Summary email every Monday',         key: 'weeklyDigest'     },
                    { label: 'Security alerts',             sub: 'New login attempts / key changes',   key: 'securityAlerts'   },
                    { label: 'Product updates',             sub: 'New features and release notes',     key: 'productUpdates'   },
                    { label: 'Browser push notifications',  sub: 'Desktop alerts while app is open',   key: 'browserPush'      },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0 gap-3">
                      <div className="min-w-0">
                        <p className="font-body text-sm text-slate-200">{item.label}</p>
                        <p className="font-mono text-[10px] text-slate-600">{item.sub}</p>
                      </div>
                      <Toggle value={notifSettings[item.key]} onChange={v => { setNotifSettings(s => ({ ...s, [item.key]: v })); showToast(`${item.label.split(' ').slice(0, 2).join(' ')} ${v ? 'on' : 'off'}`, 'info'); }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {section === 'security' && (
              <motion.div key="security-s" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="dash-card rounded-2xl p-4 sm:p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">Session & Access Control</h3>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Session Timeout</label>
                    <select value={securitySettings.sessionTimeout}
                      onChange={e => setSecuritySettings(s => ({ ...s, sessionTimeout: e.target.value }))}
                      className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['15 minutes', '30 minutes', '1 hour', '6 hours', '12 hours', '24 hours'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  {[
                    { label: 'Require re-auth for sensitive ops', key: 'requireReauth'   },
                    { label: 'IP whitelist enforcement',          key: 'ipWhitelist'     },
                    { label: 'Audit log all operations',          key: 'auditLog'        },
                    { label: 'Block concurrent sessions',         key: 'blockConcurrent' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle value={securitySettings[item.key]} onChange={v => setSecuritySettings(s => ({ ...s, [item.key]: v }))} />
                    </div>
                  ))}
                  <SaveBtn label="Save Security Settings" />
                </div>

                {/* Active sessions */}
                <div className="dash-card rounded-2xl p-4 sm:p-5 border border-yellow-500/10">
                  <h3 className="font-display font-bold text-sm text-yellow-400 mb-4">Active Sessions</h3>
                  {[
                    { device: 'Chrome · Windows 11',    loc: 'Hyderabad, IN', current: true  },
                    { device: 'Safari · iPhone 15',     loc: 'Hyderabad, IN', current: false },
                    { device: 'Firefox · macOS Sonoma', loc: 'Mumbai, IN',    current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0 gap-3">
                      <div className="min-w-0">
                        <p className="font-body text-sm text-slate-200 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{s.device}</span>
                          {s.current && <span className="badge-success px-1.5 py-0.5 rounded-md font-mono text-[9px] flex-shrink-0">current</span>}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600">{s.loc}</p>
                      </div>
                      {!s.current && (
                        <button onClick={() => showToast('Session revoked', 'info')}
                          className="font-mono text-[10px] text-red-400/70 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/15 hover:bg-red-500/8 transition-all flex-shrink-0">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
