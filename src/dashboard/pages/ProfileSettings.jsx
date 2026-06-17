import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, Shield, Bell, Palette, Activity, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../store.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="dash-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
          <Icon size={16} className="text-cyan-glow" />
        </div>
        <h3 className="font-display font-bold text-base text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, mono, secret, copyable }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/4">
      <span className="font-mono text-xs text-slate-500 w-40 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`${mono ? 'font-mono' : 'font-body'} text-sm text-slate-300 truncate`}>
          {secret && !show ? '••••••••••••••••' : value}
        </span>
        {secret && (
          <button onClick={() => setShow(s => !s)} className="text-slate-600 hover:text-slate-400 flex-shrink-0">
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        )}
        {copyable && (
          <button onClick={copy} className="text-slate-600 hover:text-cyan-glow flex-shrink-0 transition-colors">
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const usagePct = Math.round((user?.queriesUsed / user?.queriesLimit) * 100);
  const activities = [
    { action: 'Generated query', target: 'db.employees.find(…)', time: '2 min ago', color: '#00f5ff' },
    { action: 'Executed pipeline', target: 'db.orders.aggregate(…)', time: '8 min ago', color: '#4d9eff' },
    { action: 'Exported CSV', target: '142 documents', time: '28 min ago', color: '#22c55e' },
    { action: 'Changed settings', target: 'AI Model → claude-sonnet-4-6', time: '1h ago', color: '#a855f7' },
    { action: 'Logged in', target: 'cluster0.mongodb.net', time: '2h ago', color: '#f59e0b' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-4xl">
      {/* Profile header */}
      <div className="dash-card rounded-2xl p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-electric to-cyan-glow flex items-center justify-center text-white font-display font-black text-3xl shadow-lg shadow-blue-electric/30">
            {user?.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-navy-950 status-dot" />
        </div>
        <div className="flex-1">
          <h2 className="font-display font-black text-2xl text-white">{user?.name}</h2>
          <p className="font-body text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge-info px-3 py-1 rounded-full font-mono text-xs">{user?.plan} Plan</span>
            <span className="font-mono text-xs text-slate-600">Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} className="btn-outline px-5 py-2.5 rounded-xl text-sm">
          Edit Profile
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Account Details" icon={User}>
          <Field label="User ID" value={user?.id} mono copyable />
          <Field label="Name" value={user?.name} />
          <Field label="Email" value={user?.email} />
          <Field label="Plan" value={user?.plan} />
          <Field label="API Key" value={user?.apiKey} mono secret copyable />
        </SectionCard>

        <SectionCard title="API Usage" icon={Activity}>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="font-body text-sm text-slate-400">Queries Used</span>
              <span className="font-display font-black text-2xl text-white">{user?.queriesUsed?.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${usagePct}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-600">{usagePct}% of {user?.queriesLimit?.toLocaleString()} used</span>
              <span className="font-mono text-[10px] text-cyan-glow">{(user?.queriesLimit - user?.queriesUsed)?.toLocaleString()} remaining</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Today', value: '127' },
              { label: 'This week', value: '891' },
              { label: 'This month', value: '3,421' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className="font-display font-black text-lg text-white">{s.value}</p>
                <p className="font-mono text-[10px] text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent Activity" icon={Activity}>
        <div className="space-y-3">
          {activities.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 py-2 border-b border-white/4">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
              <span className="font-body text-sm text-slate-400 w-36 flex-shrink-0">{a.action}</span>
              <span className="font-mono text-xs text-slate-500 flex-1 truncate">{a.target}</span>
              <span className="font-mono text-[10px] text-slate-700 flex-shrink-0">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}

export function SettingsPage() {
  const [dbUri, setDbUri] = useState('mongodb+srv://cluster0.mongodb.net/myDB');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-6');
  const [maxTokens, setMaxTokens] = useState('1000');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ on, setOn }) => (
    <button onClick={() => setOn(v => !v)}
      className="relative w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0"
      style={{ background: on ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}>
      <motion.div animate={{ x: on ? 20 : 2 }} transition={{ duration: 0.2, type: 'spring' }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
    </button>
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-3xl">
      <SectionCard title="MongoDB Connection" icon={Key}>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 block">Connection URI</label>
            <input value={dbUri} onChange={e => setDbUri(e.target.value)}
              className="dash-input w-full px-4 py-3 rounded-xl text-sm font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 block">Database Name</label>
              <input defaultValue="myDB" className="dash-input w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 block">Auth Method</label>
              <select className="dash-input w-full px-4 py-3 rounded-xl text-sm">
                <option>SCRAM-SHA-256</option>
                <option>X.509 Certificate</option>
                <option>AWS IAM</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.02 }}
              className="px-4 py-2 rounded-xl badge-success font-mono text-xs font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 status-dot" /> Test Connection
            </motion.button>
            <span className="font-mono text-xs text-green-400">● Connected · 12ms latency</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="AI Model Settings" icon={Activity}>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 block">Model</label>
            <select value={aiModel} onChange={e => setAiModel(e.target.value)}
              className="dash-input w-full px-4 py-3 rounded-xl text-sm">
              <option value="claude-sonnet-4-6">claude-sonnet-4-6 (Recommended)</option>
              <option value="claude-opus-4-6">claude-opus-4-6 (Max accuracy)</option>
              <option value="claude-haiku-4-5">claude-haiku-4-5 (Fastest)</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-2 block">Max Tokens: {maxTokens}</label>
            <input type="range" min="256" max="4096" step="256" value={maxTokens}
              onChange={e => setMaxTokens(e.target.value)}
              className="w-full accent-cyan-400 cursor-pointer" />
            <div className="flex justify-between font-mono text-[10px] text-slate-700 mt-1">
              <span>256</span><span>4096</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-body text-sm text-white">Schema Intelligence</p>
              <p className="font-mono text-[10px] text-slate-600">Auto-detect collection structure</p>
            </div>
            <Toggle on={true} setOn={() => {}} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications" icon={Bell}>
        {[
          { label: 'Email Alerts', sub: 'Query errors and warnings', on: notifEmail, set: setNotifEmail },
          { label: 'Slack Integration', sub: 'Post results to Slack channel', on: notifSlack, set: setNotifSlack },
          { label: 'Browser Push', sub: 'Real-time browser notifications', on: true, set: () => {} },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/4">
            <div>
              <p className="font-body text-sm text-white">{item.label}</p>
              <p className="font-mono text-[10px] text-slate-600">{item.sub}</p>
            </div>
            <Toggle on={item.on} setOn={item.set} />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Security" icon={Shield}>
        <div className="space-y-3">
          {[
            { label: 'Two-Factor Auth', enabled: true },
            { label: 'Session Timeout', value: '3600s' },
            { label: 'IP Allowlist', value: '0.0.0.0/0' },
            { label: 'Audit Logging', enabled: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/4">
              <span className="font-body text-sm text-slate-300">{item.label}</span>
              {item.enabled !== undefined
                ? <span className="badge-success px-2.5 py-1 rounded-full font-mono text-[10px]">Enabled</span>
                : <span className="font-mono text-sm text-cyan-glow">{item.value}</span>}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Save */}
      <motion.button onClick={save} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className={`btn-primary px-8 py-3.5 rounded-2xl font-semibold text-sm flex items-center gap-2 ${saved ? '!bg-green-500' : ''}`}>
        {saved ? <><Check size={15} /> Saved!</> : 'Save Settings'}
      </motion.button>
    </motion.div>
  );
}
