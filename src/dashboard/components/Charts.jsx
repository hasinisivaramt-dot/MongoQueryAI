import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Area, AreaChart, Legend
} from 'recharts';
import { generateLineData, DONUT_DATA, COLLECTION_DATA } from '../store.jsx';

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      {label && <p className="font-mono text-[10px] text-slate-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-mono text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="text-white font-bold">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
};

const CardWrapper = ({ title, subtitle, children }) => (
  <div className="dash-card rounded-2xl p-5">
    <div className="mb-4">
      <h3 className="font-display font-bold text-sm text-white">{title}</h3>
      {subtitle && <p className="font-mono text-[10px] text-slate-600 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export function ExecutionTimeChart() {
  const data = useMemo(() => generateLineData(), []);
  return (
    <CardWrapper title="Execution Time History" subtitle="Avg query time (ms) — last 14 days">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip unit="ms" />} />
          <Area type="monotone" dataKey="execTime" name="Exec Time" stroke="#00f5ff"
            strokeWidth={2} fill="url(#execGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}

export function QueryVolumeChart() {
  const data = useMemo(() => generateLineData(), []);
  return (
    <CardWrapper title="Query Volume" subtitle="Queries per day">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4d9eff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4d9eff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="queries" name="Queries" stroke="#4d9eff"
            strokeWidth={2} fill="url(#volGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}

export function AIAccuracyChart() {
  const data = useMemo(() => generateLineData(), []);
  return (
    <CardWrapper title="AI Accuracy Trend" subtitle="Query accuracy % over time">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} interval={3} />
          <YAxis domain={[88, 100]} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip unit="%" />} />
          <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#a855f7"
            strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}

export function QueryMethodDonut() {
  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>;
  };

  return (
    <CardWrapper title="Query Method Distribution" subtitle="By operation type">
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={160}>
          <PieChart>
            <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
              dataKey="value" labelLine={false} label={renderCustomLabel}>
              {DONUT_DATA.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip unit="%" />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {DONUT_DATA.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="font-mono text-[10px] text-slate-400 flex-1 truncate">{d.name}</span>
              <span className="font-mono text-[10px] text-white font-bold">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

export function CollectionUsageChart() {
  return (
    <CardWrapper title="Collection Usage" subtitle="Queries per collection">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={COLLECTION_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5ff" />
              <stop offset="100%" stopColor="#0066ff" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="queries" name="Queries" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardWrapper>
  );
}
