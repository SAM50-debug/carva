"use client";

import { motion, Variants } from "framer-motion";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

type RuleSection = { title: string; content: string[] };


export default function RulesClient({ rules }: { rules: RuleSection[] }) {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Ambient */}
      <div className="ambient-bg">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="mb-16 text-center"
        >
          <span className="inline-block px-4 py-1.5 bg-white/[0.06] text-white/40 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-white/8">
            Guidelines
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Rules & <span className="text-brand-red">Guidelines</span>
          </h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto">
            Essential information for all participants of CARAVAN '26.
          </p>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
          className="relative rounded-3xl p-8 md:p-10 mb-16 overflow-hidden border border-brand-red/20"
          style={{ background: "linear-gradient(135deg, rgba(210,27,33,0.2) 0%, rgba(210,27,33,0.06) 100%)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-3xl" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-brand-red/20 border border-brand-red/40 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-brand-red uppercase tracking-widest mb-2">Important Note</h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed">
                Registration and participation in the Inter-University Competition shall be considered as acceptance of all General Rules and the specific rules of the respective event.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rule Cards */}
        <div className="space-y-6">
          {rules.map((rule, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                style={{ willChange: "transform, opacity" }}
                className="group glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
              >
                <div className="card-glow" />
                <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-6">{rule.title}</h3>
                <motion.ul
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  {rule.content.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      style={{ willChange: "transform, opacity" }}
                      className="flex items-start text-white/50 font-medium text-lg leading-relaxed"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-3 mr-4 shrink-0" />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            );
          })}
        </div>

        {/* Entry Fee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="mt-10 glass-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
        >
          <div className="card-glow" />
          <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-8">Entry Fee</h3>
          <div className="overflow-hidden rounded-2xl border border-white/10 mb-4 p-6 bg-white/[0.03]">
            <p className="text-xl font-bold text-brand-red text-center">Registration is free</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
