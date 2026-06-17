import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Building2, Rocket, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Rocket,
    price: { monthly: 0, annual: 0 },
    tagline: 'Perfect for side projects',
    color: '#4d9eff',
    gradient: 'from-blue-500/20 to-blue-500/5',
    border: 'rgba(77,158,255,0.2)',
    features: [
      '500 queries / month',
      'Natural language to MongoDB',
      'Basic aggregation pipelines',
      '1 database connection',
      'Community support',
      'Public API access',
      'Basic visualizations',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Zap,
    price: { monthly: 49, annual: 39 },
    tagline: 'For professional developers',
    color: '#00f5ff',
    gradient: 'from-cyan-500/25 to-blue-500/15',
    border: 'rgba(0,245,255,0.4)',
    features: [
      'Unlimited queries',
      'Advanced AI query generation',
      'Vector search integration',
      'Real-time analytics dashboard',
      'Up to 10 database connections',
      'Pipeline visual builder',
      'Smart visualizations',
      'Slack + Email support',
      'API rate: 1000 req/min',
      'Query history & versioning',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: { monthly: 249, annual: 199 },
    tagline: 'For teams at scale',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-purple-500/5',
    border: 'rgba(168,85,247,0.3)',
    features: [
      'Everything in Pro',
      'Unlimited connections',
      'SOC 2 Type II compliance',
      'VPC peering & private endpoints',
      'Field-level encryption',
      'Custom AI model fine-tuning',
      'Semantic schema matching',
      'RBAC & SSO/SAML',
      'Immutable audit logs',
      'Dedicated SLA (99.99%)',
      'White-glove onboarding',
      'Priority 24/7 support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

function PlanCard({ plan, index, annual }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = plan.icon;
  const price = annual ? plan.price.annual : plan.price.monthly;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-3xl overflow-hidden ${
        plan.popular ? 'popular-card scale-105 z-10 shadow-2xl' : 'glass'
      }`}
      style={{
        border: `1px solid ${plan.border}`,
        boxShadow: plan.popular ? `0 0 60px ${plan.color}25` : undefined,
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute top-0 left-0 right-0 py-1.5 text-center font-mono text-xs font-bold tracking-widest"
          style={{
            background: `linear-gradient(135deg, ${plan.color}30, ${plan.color}15)`,
            color: plan.color,
            borderBottom: `1px solid ${plan.color}30`,
          }}
        >
          <Sparkles size={10} className="inline mr-1" />
          {plan.badge}
        </div>
      )}

      <div className={`p-8 flex flex-col h-full ${plan.popular ? 'pt-12' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${plan.color}30, ${plan.color}10)`,
              border: `1px solid ${plan.color}30`,
              boxShadow: `0 4px 20px ${plan.color}20`,
            }}
          >
            <Icon size={22} style={{ color: plan.color }} />
          </div>

          <div className="font-mono text-xs tracking-widest mb-1" style={{ color: plan.color, opacity: 0.6 }}>
            {plan.name.toUpperCase()}
          </div>
          <h3 className="font-display font-black text-2xl text-white mb-1">{plan.name}</h3>
          <p className="font-body text-sm text-slate-500">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-8 pb-8 border-b" style={{ borderColor: `${plan.color}15` }}>
          <div className="flex items-end gap-2">
            <span className="font-display font-black text-5xl text-white">
              {price === 0 ? 'Free' : `$${price}`}
            </span>
            {price > 0 && (
              <span className="font-body text-slate-500 mb-2 text-sm">
                / month{annual ? ' · billed annually' : ''}
              </span>
            )}
          </div>
          {annual && price > 0 && (
            <div className="mt-1 font-mono text-xs" style={{ color: plan.color }}>
              Save ${(plan.price.monthly - plan.price.annual) * 12}/year
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3 mb-10 flex-1">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${plan.color}20` }}
              >
                <Check size={11} style={{ color: plan.color }} />
              </div>
              <span className="font-body text-sm text-slate-300 leading-snug">{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl font-semibold font-body text-sm flex items-center justify-center gap-2 transition-all ${
            plan.popular
              ? 'btn-primary shadow-xl'
              : 'btn-outline'
          }`}
          style={
            !plan.popular
              ? { borderColor: `${plan.color}40`, color: plan.color }
              : {}
          }
        >
          {plan.cta}
          <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-20" />

      {/* Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] orb bg-blue-electric/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="section-tag mb-4"
          >
            ◆ Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl lg:text-6xl text-white mb-6 tracking-tight"
          >
            Simple, transparent
            <br />
            <span className="gradient-text">pricing for all teams</span>
          </motion.h2>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 glass border-glow rounded-full px-6 py-3"
          >
            <span
              className={`font-body text-sm cursor-pointer transition-colors ${!annual ? 'text-white' : 'text-slate-500'}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </span>
            <div
              onClick={() => setAnnual(a => !a)}
              className="relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300"
              style={{ background: annual ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}
            >
              <motion.div
                animate={{ x: annual ? 24 : 2 }}
                transition={{ duration: 0.3, type: 'spring' }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
              />
            </div>
            <span
              className={`font-body text-sm cursor-pointer transition-colors ${annual ? 'text-white' : 'text-slate-500'}`}
              onClick={() => setAnnual(true)}
            >
              Annual
              <span className="ml-2 text-xs font-mono text-green-400">Save 20%</span>
            </span>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} annual={annual} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 font-body text-sm text-slate-600"
        >
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
