import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Activity, Key, Copy, Check, Edit3, Save, X,
  LogOut, Trash2, Eye, EyeOff, Bell, Globe, Moon, Zap,
  Database, Sliders, Lock, RefreshCw, ChevronRight,
  AlertCircle, CheckCircle2, Clock, TrendingUp, FileText,
  Palette, Volume2, Mail, Smartphone, Monitor,
} from 'lucide-react';
import { useAuth } from '../store.jsx';

// ─── shared ──────────────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function Toast({ msg, type, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      onAnimationComplete={() => setTimeout(onDone, 1800)}
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl font-mono text-xs flex items-center gap-3 shadow-2xl ${
        type === 'success' ? 'badge-success' : type === 'error' ? 'badge-error' : 'badge-info'
      }`}
    >
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </motion.div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = 'success') => setToast({ msg, type, id: Date.now() });
  const hide = () => setToast(null);
  const el = (
    <AnimatePresence>
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={hide} />}
    </AnimatePresence>
  );
  return { show, el };
}

// ─── ACTIVITY LOG mock ────────────────────────────────────────────────────────
const ACTIVITY = [
  { id: 1, action: 'Query executed',        detail: 'db.employees.find({dept:"Engineering"})', time: '2 min ago',  icon: Zap,        color: '#00f5ff' },
  { id: 2, action: 'Pipeline ran',           detail: '$match → $group → $sort → $limit',         time: '14 min ago', icon: Activity,   color: '#4d9eff' },
  { id: 3, action: 'Collection opened',      detail: 'orders (892,341 documents)',                time: '1 hr ago',   icon: Database,   color: '#a855f7' },
  { id: 4, action: 'API key regenerated',    detail: 'Key ending …c3f9 was replaced',             time: '3 hr ago',   icon: Key,        color: '#f59e0b' },
  { id: 5, action: 'Profile updated',        detail: 'Display name changed',                      time: '1 day ago',  icon: User,       color: '#22c55e' },
  { id: 6, action: 'Password changed',       detail: 'Security update',                           time: '3 days ago', icon: Lock,       color: '#ec4899' },
];

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, logout } = useAuth();
  const { show: showToast, el: toastEl } = useToast();

  const [tab, setTab] = useState('overview');
  const [editing, setEditing]   = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey]   = useState(false);
  const [form, setForm] = useState({
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
    setCopiedKey(true);
    showToast('API key copied');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const saveProfile = () => {
    setEditing(false);
    showToast('Profile updated successfully');
  };

  const STATS = [
    { label: 'Total Queries',   value: user?.queriesUsed?.toLocaleString() || '1,247', icon: Zap,         color: '#00f5ff' },
    { label: 'Success Rate',    value: '98.4%',                                          icon: CheckCircle2, color: '#22c55e' },
    { label: 'Queries / Month', value: '412',                                            icon: TrendingUp,   color: '#4d9eff' },
    { label: 'Collections',     value: '24',                                             icon: Database,     color: '#a855f7' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-4xl">
      {toastEl}

      {/* Profile hero card */}
      <div className="dash-card rounded-2xl p-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center text-white font-display font-black text-3xl shadow-xl shadow-blue-electric/30">
              {(form.name[0] || 'U').toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-navy-950 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Name</label>
                    <input className="dash-input w-full px-3 py-2 rounded-xl text-sm"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Role</label>
                    <input className="dash-input w-full px-3 py-2 rounded-xl text-sm"
                      value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1 block">Bio</label>
                  <textarea className="dash-input w-full px-3 py-2 rounded-xl text-sm resize-none" rows={2}
                    value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfile}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-body flex items-center gap-2">
                    <Save size={12} /> Save
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="btn-outline px-4 py-2 rounded-xl text-xs font-body flex items-center gap-2">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="font-display font-black text-2xl text-white">{form.name}</h2>
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
              className="btn-outline px-4 py-2 rounded-xl text-sm font-body flex items-center gap-2 flex-shrink-0">
              <Edit3 size={13} /> Edit Profile
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/2 border border-white/5 rounded-xl p-3 text-center">
                <Icon size={14} className="mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="font-display font-black text-xl text-white">{s.value}</p>
                <p className="font-mono text-[9px] text-slate-600 mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800/40 rounded-xl p-1 w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-blue-electric to-cyan-mid text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* Overview */}
        {tab === 'overview' && (
          <motion.div key="overview"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="dash-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Account ID',   value: user?.id },
                  { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Plan',         value: user?.plan + ' Plan' },
                  { label: 'Query Usage',  value: `${user?.queriesUsed?.toLocaleString() || 0} / ${user?.queriesLimit?.toLocaleString() || 0}` },
                  { label: 'Connected DB', value: user?.connected || 'Not connected' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                    <span className="font-mono text-xs text-slate-500">{row.label}</span>
                    <span className="font-body text-sm text-slate-200">{row.value}</span>
                  </div>
                ))}
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((user?.queriesUsed || 0) / (user?.queriesLimit || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <motion.div key="activity"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="font-display font-bold text-sm text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-white/4">
                {ACTIVITY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="px-5 py-3.5 flex items-start gap-4 hover:bg-white/2 transition-colors">
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

        {/* Security */}
        {tab === 'security' && (
          <motion.div key="security"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="dash-card rounded-2xl p-5 space-y-5">
              <h3 className="font-display font-bold text-sm text-white mb-2">Change Password</h3>
              {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                <div key={label}>
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                  <input type="password" placeholder="••••••••"
                    className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                </div>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => showToast('Password updated')}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2">
                <Lock size={13} /> Update Password
              </motion.button>
            </div>

            <div className="dash-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm text-white mb-4">Security Settings</h3>
              {[
                { label: 'Two-Factor Authentication', sub: 'Adds extra security to your account', enabled: false },
                { label: 'Session Alerts',            sub: 'Get notified of new sign-ins',         enabled: true  },
                { label: 'Login History',             sub: 'Track all devices that accessed your account', enabled: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-white/4 last:border-0">
                  <div>
                    <p className="font-body text-sm text-slate-200">{item.label}</p>
                    <p className="font-mono text-[10px] text-slate-600">{item.sub}</p>
                  </div>
                  <Toggle defaultOn={item.enabled} onChange={v => showToast(`${item.label} ${v ? 'enabled' : 'disabled'}`)} />
                </div>
              ))}
            </div>

            <div className="dash-card rounded-2xl p-5 border border-red-500/15">
              <h3 className="font-display font-bold text-sm text-red-400 mb-1">Danger Zone</h3>
              <p className="font-mono text-[10px] text-slate-600 mb-4">These actions are irreversible.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => showToast('Sessions cleared', 'info')}
                  className="px-4 py-2 rounded-xl font-body text-sm text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/8 transition-all flex items-center gap-2">
                  <RefreshCw size={13} /> Clear All Sessions
                </button>
                <button onClick={() => showToast('Account deletion requires email confirmation', 'error')}
                  className="px-4 py-2 rounded-xl font-body text-sm text-red-400 border border-red-500/20 hover:bg-red-500/8 transition-all flex items-center gap-2">
                  <Trash2 size={13} /> Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Keys */}
        {tab === 'api' && (
          <motion.div key="api"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="dash-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm text-white mb-1">Your API Key</h3>
              <p className="font-mono text-[10px] text-slate-600 mb-4">Keep this secret. Regenerating will invalidate the current key.</p>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/30 border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-slate-300 overflow-hidden">
                  {showKey ? user?.apiKey : (user?.apiKey || '').replace(/./g, '•').slice(0, 32) + '…'}
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

              <div className="flex gap-3 mt-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => showToast('API key regenerated — previous key invalidated', 'info')}
                  className="btn-outline px-4 py-2.5 rounded-xl text-sm font-body flex items-center gap-2">
                  <RefreshCw size={13} /> Regenerate Key
                </motion.button>
              </div>
            </div>

            <div className="dash-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm text-white mb-4">Usage This Month</h3>
              <div className="space-y-3">
                {[
                  { label: 'API Calls',       val: '14,821', max: 50000, color: '#00f5ff' },
                  { label: 'Query Generate',  val: '1,247',  max: 10000, color: '#4d9eff' },
                  { label: 'Data Exported',   val: '892 MB', max: null,  color: '#a855f7' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-mono text-xs text-slate-500">{item.label}</span>
                      <span className="font-mono text-xs text-slate-300">
                        {item.val}{item.max ? ` / ${item.max.toLocaleString()}` : ''}
                      </span>
                    </div>
                    {item.max && (
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((parseInt(item.val.replace(/,/g, '')) / item.max) * 100, 100)}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(to right, ${item.color}, ${item.color}80)` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── TOGGLE component ─────────────────────────────────────────────────────────
function Toggle({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };
  return (
    <button onClick={toggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
      style={{ background: on ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}>
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ duration: 0.25, type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user } = useAuth();
  const { show: showToast, el: toastEl } = useToast();
  const [section, setSection] = useState('general');

  const [connStr, setConnStr]   = useState(user?.connected ? `mongodb+srv://user:••••••••@${user.connected}/myDB` : '');
  const [saving, setSaving]     = useState(false);
  const [showConn, setShowConn] = useState(false);
  const [aiModel, setAiModel]   = useState('claude-sonnet-4-6');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [tempStr, setTempStr]   = useState('0.1');

  const save = async (label) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    showToast(`${label} saved`);
  };

  const SECTIONS = [
    { id: 'general',   label: 'General',         icon: Sliders  },
    { id: 'mongodb',   label: 'MongoDB Config',   icon: Database },
    { id: 'ai',        label: 'AI Settings',      icon: Zap      },
    { id: 'theme',     label: 'Appearance',        icon: Palette  },
    { id: 'notifs',    label: 'Notifications',    icon: Bell     },
    { id: 'security',  label: 'Security',         icon: Shield   },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {toastEl}

      <div className="flex gap-6 flex-wrap lg:flex-nowrap">
        {/* Section nav */}
        <aside className="w-full lg:w-52 flex-shrink-0">
          <div className="dash-card rounded-2xl p-2 space-y-0.5">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group text-sm font-body
                    ${section === s.id
                      ? 'bg-cyan-glow/8 text-white border-l-2 border-cyan-glow'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/4'}`}>
                  <Icon size={14} className={section === s.id ? 'text-cyan-glow' : 'group-hover:text-slate-300'} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* General */}
            {section === 'general' && (
              <motion.div key="general"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">General Settings</h3>
                  {[
                    { label: 'Display Name', value: user?.name || '', type: 'text' },
                    { label: 'Email Address', value: user?.email || '', type: 'email' },
                    { label: 'Timezone', value: 'Asia/Kolkata (IST)', type: 'text' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">{field.label}</label>
                      <input type={field.type} defaultValue={field.value}
                        className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Language</label>
                    <select className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['English (US)', 'English (UK)', 'Hindi', 'German', 'French', 'Spanish'].map(l => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={saving} onClick={() => save('General settings')}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Changes</>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* MongoDB Config */}
            {section === 'mongodb' && (
              <motion.div key="mongodb"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">MongoDB Configuration</h3>

                  {/* Connection status */}
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
                    <span className="font-mono text-xs text-green-400">Connected · {user?.connected || 'cluster0.mongodb.net'}</span>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Connection String</label>
                    <div className="relative">
                      <input
                        type={showConn ? 'text' : 'password'}
                        value={connStr}
                        onChange={e => setConnStr(e.target.value)}
                        placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
                        className="dash-input w-full px-4 py-3 pr-12 rounded-xl text-sm font-mono"
                      />
                      <button onClick={() => setShowConn(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-glow transition-colors">
                        {showConn ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Default Database</label>
                      <input defaultValue="myDB" className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Connection Timeout</label>
                      <input defaultValue="5000" className="dash-input w-full px-4 py-3 rounded-xl text-sm font-mono" />
                    </div>
                  </div>

                  {[
                    { label: 'Auto-reconnect on disconnect',  defaultOn: true  },
                    { label: 'Enable TLS / SSL',              defaultOn: true  },
                    { label: 'Log slow queries (>100ms)',     defaultOn: true  },
                    { label: 'Enable change streams',         defaultOn: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle defaultOn={item.defaultOn} onChange={v => showToast(`${item.label.split(' ').slice(0,3).join(' ')} ${v ? 'on' : 'off'}`, 'info')} />
                    </div>
                  ))}

                  <div className="flex gap-3 flex-wrap">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => showToast('Connection verified', 'success')}
                      className="btn-outline px-4 py-2.5 rounded-xl text-sm font-body flex items-center gap-2">
                      <CheckCircle2 size={13} /> Test Connection
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      disabled={saving} onClick={() => save('MongoDB config')}
                      className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
                      {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save</>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Settings */}
            {section === 'ai' && (
              <motion.div key="ai"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-5">
                  <h3 className="font-display font-bold text-sm text-white">AI Query Engine</h3>

                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Model</label>
                    <select value={aiModel} onChange={e => setAiModel(e.target.value)}
                      className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-6'].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Max Tokens</label>
                      <span className="font-mono text-xs text-cyan-glow">{maxTokens}</span>
                    </div>
                    <input type="range" min={256} max={4096} step={128}
                      value={maxTokens} onChange={e => setMaxTokens(+e.target.value)}
                      className="w-full accent-cyan-500 cursor-pointer" />
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-[9px] text-slate-700">256</span>
                      <span className="font-mono text-[9px] text-slate-700">4096</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Temperature</label>
                      <span className="font-mono text-xs text-cyan-glow">{tempStr}</span>
                    </div>
                    <input type="range" min={0} max={1} step={0.05}
                      value={parseFloat(tempStr)}
                      onChange={e => setTempStr(parseFloat(e.target.value).toFixed(2))}
                      className="w-full accent-cyan-500 cursor-pointer" />
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-[9px] text-slate-700">Precise (0)</span>
                      <span className="font-mono text-[9px] text-slate-700">Creative (1)</span>
                    </div>
                  </div>

                  {[
                    { label: 'Auto-optimize generated queries', defaultOn: true  },
                    { label: 'Include query explanation',       defaultOn: true  },
                    { label: 'Suggest indexes automatically',   defaultOn: false },
                    { label: 'Enable vector semantic search',   defaultOn: true  },
                    { label: 'Schema auto-detection',           defaultOn: true  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle defaultOn={item.defaultOn} onChange={v => showToast(`${item.label.split(' ').slice(0, 2).join(' ')} ${v ? 'on' : 'off'}`, 'info')} />
                    </div>
                  ))}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={saving} onClick={() => save('AI settings')}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save AI Settings</>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Appearance */}
            {section === 'theme' && (
              <motion.div key="theme"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-5">
                  <h3 className="font-display font-bold text-sm text-white">Appearance</h3>

                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark',    label: 'Dark',    icon: Moon,    preview: 'bg-navy-950 border-cyan-glow/30' },
                        { id: 'darker',  label: 'Midnight',icon: Monitor, preview: 'bg-black border-cyan-glow/20' },
                        { id: 'system',  label: 'System',  icon: Smartphone, preview: 'bg-slate-800 border-slate-600/30' },
                      ].map(t => {
                        const Icon = t.icon;
                        return (
                          <button key={t.id}
                            onClick={() => showToast(`${t.label} theme applied`, 'info')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                              t.id === 'dark'
                                ? 'border-cyan-glow/40 bg-cyan-glow/5'
                                : 'border-white/8 hover:border-white/20'
                            }`}>
                            <div className={`w-10 h-6 rounded-md border ${t.preview}`} />
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
                        { name: 'Cyan',    color: '#00f5ff' },
                        { name: 'Blue',    color: '#4d9eff' },
                        { name: 'Purple',  color: '#a855f7' },
                        { name: 'Green',   color: '#22c55e' },
                        { name: 'Pink',    color: '#ec4899' },
                      ].map(c => (
                        <button key={c.name}
                          onClick={() => showToast(`${c.name} accent applied`, 'info')}
                          className="flex flex-col items-center gap-1.5 group">
                          <div className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-white/30 transition-all"
                            style={{ background: c.color, boxShadow: `0 0 12px ${c.color}50` }} />
                          <span className="font-mono text-[9px] text-slate-600">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { label: 'Reduce motion / animations', defaultOn: false },
                    { label: 'Compact sidebar',            defaultOn: false },
                    { label: 'Show query line numbers',    defaultOn: true  },
                    { label: 'Glassmorphism effects',      defaultOn: true  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle defaultOn={item.defaultOn} onChange={v => showToast(`${item.label.split(' ').slice(0,2).join(' ')} ${v ? 'on' : 'off'}`, 'info')} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notifications */}
            {section === 'notifs' && (
              <motion.div key="notifs"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-1">
                  <h3 className="font-display font-bold text-sm text-white mb-4">Notification Preferences</h3>
                  {[
                    { label: 'Query execution alerts',     sub: 'Notify when query completes',          defaultOn: true  },
                    { label: 'Slow query warnings',        sub: 'Alert when query exceeds 500ms',        defaultOn: true  },
                    { label: 'AI accuracy drops',          sub: 'Notify when accuracy falls below 90%',  defaultOn: true  },
                    { label: 'Index suggestion alerts',    sub: 'When AI detects missing indexes',       defaultOn: false },
                    { label: 'Weekly usage digest',        sub: 'Summary email every Monday',            defaultOn: true  },
                    { label: 'Security alerts',            sub: 'New login attempts / key changes',      defaultOn: true  },
                    { label: 'Product updates',            sub: 'New features and release notes',        defaultOn: false },
                    { label: 'Browser push notifications', sub: 'Desktop alerts while app is open',      defaultOn: true  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
                      <div>
                        <p className="font-body text-sm text-slate-200">{item.label}</p>
                        <p className="font-mono text-[10px] text-slate-600">{item.sub}</p>
                      </div>
                      <Toggle defaultOn={item.defaultOn} onChange={v => showToast(`${item.label.split(' ').slice(0,2).join(' ')} ${v ? 'on' : 'off'}`, 'info')} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security */}
            {section === 'security' && (
              <motion.div key="security-settings"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="dash-card rounded-2xl p-5 space-y-4">
                  <h3 className="font-display font-bold text-sm text-white">Session & Access Control</h3>
                  <div>
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 block">Session Timeout</label>
                    <select className="dash-input w-full px-4 py-3 rounded-xl text-sm bg-navy-800/80">
                      {['30 minutes', '1 hour', '4 hours', '8 hours', 'Never'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {[
                    { label: 'Require re-auth for sensitive ops', defaultOn: true  },
                    { label: 'IP whitelist enforcement',          defaultOn: false },
                    { label: 'Audit log all operations',          defaultOn: true  },
                    { label: 'Block concurrent sessions',         defaultOn: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                      <span className="font-body text-sm text-slate-300">{item.label}</span>
                      <Toggle defaultOn={item.defaultOn} onChange={v => showToast(`${item.label.split(' ').slice(0,2).join(' ')} ${v ? 'on' : 'off'}`, 'info')} />
                    </div>
                  ))}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={saving} onClick={() => save('Security settings')}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-body flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><RefreshCw size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Security Settings</>}
                  </motion.button>
                </div>

                <div className="dash-card rounded-2xl p-5 border border-yellow-500/10">
                  <h3 className="font-display font-bold text-sm text-yellow-400 mb-1">Active Sessions</h3>
                  <p className="font-mono text-[10px] text-slate-600 mb-4">Devices currently signed in to your account</p>
                  {[
                    { device: 'Chrome · Windows 11',    loc: 'Hyderabad, IN',  current: true  },
                    { device: 'Safari · iPhone 15',     loc: 'Hyderabad, IN',  current: false },
                    { device: 'Firefox · macOS Sonoma', loc: 'Mumbai, IN',     current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
                      <div>
                        <p className="font-body text-sm text-slate-200 flex items-center gap-2">
                          {s.device}
                          {s.current && <span className="badge-success px-1.5 py-0.5 rounded-md font-mono text-[9px]">current</span>}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600">{s.loc}</p>
                      </div>
                      {!s.current && (
                        <button onClick={() => showToast('Session revoked', 'info')}
                          className="font-mono text-[10px] text-red-400/70 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/15 hover:bg-red-500/8 transition-all">
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
