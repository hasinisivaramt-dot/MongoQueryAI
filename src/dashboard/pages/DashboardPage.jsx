import { motion } from 'framer-motion';
import StatCards from '../components/StatCards.jsx';
import QueryGenerator from '../components/QueryGenerator.jsx';
import QueryResults from '../components/QueryResults.jsx';
import ExecutionLogs from '../components/ExecutionLogs.jsx';
import {
  ExecutionTimeChart, QueryVolumeChart, AIAccuracyChart,
  QueryMethodDonut, CollectionUsageChart
} from '../components/Charts.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="space-y-6">

      {/* Quick welcome banner */}
      <div className="glass rounded-2xl px-5 py-4 border border-cyan-glow/10 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">Good morning</p>
          <h2 className="font-display font-bold text-xl text-white">Welcome back to MongoQuery AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
          <span className="font-mono text-xs text-green-400">cluster0.mongodb.net · connected</span>
        </div>
      </div>

      {/* Stats */}
      <StatCards />

      {/* Query Generator + Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <QueryGenerator />
        </div>
        <div className="xl:col-span-2 grid grid-rows-2 gap-6">
          <ExecutionTimeChart />
          <QueryVolumeChart />
        </div>
      </div>

      {/* Secondary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QueryMethodDonut />
        <AIAccuracyChart />
        <CollectionUsageChart />
      </div>

      {/* Results table */}
      <QueryResults />

      {/* Execution logs — self-contained scroll, never hijacks page */}
      <ExecutionLogs />
    </motion.div>
  );
}
