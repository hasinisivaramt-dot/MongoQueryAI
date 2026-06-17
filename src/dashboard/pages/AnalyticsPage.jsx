import { motion } from 'framer-motion';
import {
  ExecutionTimeChart, QueryVolumeChart, AIAccuracyChart,
  QueryMethodDonut, CollectionUsageChart
} from '../components/Charts.jsx';
import { COLLECTION_DATA } from '../store.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyticsPage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Queries Today', value: '3,842', delta: '+12%', color: '#00f5ff' },
          { label: 'Avg Execution Time', value: '42ms', delta: '-8ms', color: '#4d9eff' },
          { label: 'AI Accuracy', value: '97.8%', delta: '+0.6%', color: '#a855f7' },
          { label: 'Error Rate', value: '0.8%', delta: '-0.3%', color: '#22c55e' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} className="dash-card rounded-2xl p-5">
            <p className="font-mono text-[10px] text-slate-600 mb-1 uppercase tracking-widest">{s.label}</p>
            <p className="font-display font-black text-3xl text-white" style={{ textShadow: `0 0 20px ${s.color}40` }}>
              {s.value}
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: s.color }}>{s.delta} vs yesterday</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutionTimeChart />
        <QueryVolumeChart />
        <AIAccuracyChart />
        <QueryMethodDonut />
      </div>

      <CollectionUsageChart />

      {/* Collection table */}
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-display font-bold text-sm text-white">Collection Analytics</h3>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">Detailed stats per collection</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full dash-table">
            <thead>
              <tr>
                {['Collection', 'Documents', 'Size', 'Queries', 'Utilization'].map(h => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLLECTION_DATA.map((row, i) => (
                <motion.tr key={row.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 font-mono text-sm text-cyan-glow">{row.name}</td>
                  <td className="px-5 py-3 font-mono text-sm text-slate-300">{row.docs.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-sm text-slate-400">{row.size}</td>
                  <td className="px-5 py-3 font-mono text-sm text-white font-bold">{row.queries.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-blue-electric"
                          style={{ width: `${Math.min((row.queries / 20000) * 100, 100)}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                        {Math.round((row.queries / 20000) * 100)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
