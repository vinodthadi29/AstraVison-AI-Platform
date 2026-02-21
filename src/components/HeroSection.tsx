import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
interface HeroSectionProps {
  onEnterSystem: () => void;
}
export function HeroSection({ onEnterSystem }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="space-y-8">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-astra-violet/10 border border-astra-violet/20 text-astra-violet text-xs font-mono tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-astra-violet animate-pulse" />
            SYSTEM ONLINE v4.0
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tight text-white">
            Universal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-astra-violet to-astra-blue">
              Visual Intelligence
            </span>
          </h1>

          <p className="text-lg text-astra-text-secondary max-w-xl leading-relaxed">
            AstraVision is not just a platform. It is a living digital
            environment designed to process, analyze, and visualize complex data
            streams in real-time.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={onEnterSystem}
              className="group relative px-8 py-4 bg-white text-black font-medium rounded-lg overflow-hidden transition-all hover:scale-105">

              <div className="absolute inset-0 bg-gradient-to-r from-astra-violet to-astra-blue opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <span className="relative flex items-center gap-2">
                Enter System <ArrowRight size={18} />
              </span>
            </button>

            <button className="px-8 py-4 glass-panel text-white font-medium rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
              <Play size={18} className="fill-current" />
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Right: 3D Placeholder */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 1.2,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative h-[500px] w-full">

          <div className="absolute inset-0 bg-gradient-to-br from-astra-violet/20 to-astra-blue/5 rounded-2xl blur-3xl opacity-30" />

          <div className="relative h-full w-full glass-panel rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden group">
            {/* Grid overlay */}
            <div className="absolute inset-0 scan-grid opacity-20" />

            {/* Central 3D Object Placeholder */}
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 border border-astra-violet/30 rounded-full animate-spin-slow" />
              <div
                className="absolute inset-4 border border-astra-blue/30 rounded-full animate-spin-slow"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '15s'
                }} />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-astra-violet/20 rounded-full blur-2xl animate-pulse-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <span className="font-mono text-xs text-astra-text-muted tracking-widest">
                  NEURAL CORE
                  <br />
                  [SPLINE RESERVED]
                </span>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/50" />
            <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/50" />
            <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/50" />
            <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/50" />
          </div>
        </motion.div>
      </div>
    </section>);

}