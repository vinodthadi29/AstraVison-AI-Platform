import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Video,
  Radio,
  Cpu,
  Layers,
  Brain,
  Tag,
  ScanSearch,
  Sparkles,
  Activity,
  Clock,
  Server } from
'lucide-react';
export function TechnologySection() {
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-8 p-4">
      {/* Main Architecture Flow */}
      <div className="flex-1 relative flex flex-col justify-between py-4">
        {/* Animated Connecting Lines Background */}
        <div className="absolute inset-0 z-0 flex justify-center gap-20 pointer-events-none">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-full w-[1px] bg-white/5 relative overflow-hidden">

              <motion.div
              className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-transparent via-astra-violet to-transparent"
              animate={{
                top: ['-20%', '120%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'linear'
              }} />

            </div>
          )}
        </div>

        {/* INPUT LAYER */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <TechCard
            icon={Camera}
            title="Image Input"
            status="ACTIVE"
            delay={0} />

          <TechCard
            icon={Video}
            title="Video Stream"
            status="ACTIVE"
            delay={0.1} />

          <TechCard
            icon={Radio}
            title="Sensor Data"
            status="ACTIVE"
            delay={0.2} />

        </div>

        {/* PROCESSING CORE */}
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
          <TechCard
            icon={Cpu}
            title="Pre-processor"
            status="OPTIMIZED"
            delay={0.3} />

          <TechCard
            icon={Layers}
            title="Feature Extractor"
            status="RUNNING"
            delay={0.4} />

        </div>

        {/* NEURAL ENGINE (Central) */}
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0
            }}
            whileInView={{
              scale: 1,
              opacity: 1
            }}
            viewport={{
              once: true
            }}
            className="bg-black/60 backdrop-blur-xl border border-astra-violet/50 rounded-2xl p-8 text-center relative overflow-hidden group">

            <div className="absolute inset-0 bg-astra-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-astra-violet to-transparent opacity-30 blur-sm animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-astra-violet/20 flex items-center justify-center border border-astra-violet/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <Brain className="w-8 h-8 text-astra-violet" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-1">
                  AstraVision Neural Core
                </h3>
                <p className="text-sm text-astra-text-secondary font-mono">
                  v4.2.0 • Transformer Architecture
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* OUTPUT LAYER */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <TechCard
            icon={Tag}
            title="Classification"
            status="READY"
            delay={0.5} />

          <TechCard
            icon={ScanSearch}
            title="Detection"
            status="READY"
            delay={0.6} />

          <TechCard
            icon={Sparkles}
            title="Generation"
            status="READY"
            delay={0.7} />

        </div>
      </div>

      {/* Sidebar Metrics */}
      <div className="w-full md:w-64 flex flex-col gap-4 relative z-10">
        <MetricCard
          icon={Activity}
          label="Throughput"
          value="2.4M req/s"
          color="text-emerald-400" />

        <MetricCard
          icon={Clock}
          label="Latency"
          value="<12ms"
          color="text-astra-blue" />

        <MetricCard
          icon={Server}
          label="Uptime"
          value="99.99%"
          color="text-astra-violet" />


        <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-mono text-astra-text-secondary uppercase mb-3">
            System Logs
          </h4>
          <div className="space-y-2 font-mono text-[10px] text-astra-text-muted">
            <p>{'>'} Initializing core systems...</p>
            <p>{'>'} Neural weights loaded</p>
            <p>{'>'} Edge nodes connected (24)</p>
            <p className="text-emerald-500">{'>'} System operational</p>
          </div>
        </div>
      </div>
    </div>);

}
function TechCard({ icon: Icon, title, status, delay }: any) {
  return (
    <motion.div
      initial={{
        y: 20,
        opacity: 0
      }}
      whileInView={{
        y: 0,
        opacity: 1
      }}
      viewport={{
        once: true
      }}
      transition={{
        delay,
        duration: 0.5
      }}
      whileHover={{
        y: -5,
        backgroundColor: 'rgba(255,255,255,0.08)'
      }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 text-center transition-colors cursor-default">

      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/80">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-500">
            {status}
          </span>
        </div>
      </div>
    </motion.div>);

}
function MetricCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>

        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-astra-text-secondary font-mono uppercase">
          {label}
        </p>
        <p className="text-xl font-bold text-white font-display">{value}</p>
      </div>
    </div>);

}