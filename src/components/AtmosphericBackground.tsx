import React from 'react';
import { motion } from 'framer-motion';
export function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-astra-bg">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#06060B] to-[#06060B] opacity-40" />

      {/* Moving volumetric fogs */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.2, 1],
          x: [-20, 20, -20]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-astra-violet rounded-full blur-[120px] opacity-20 mix-blend-screen" />


      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1.2, 1, 1.2],
          x: [20, -20, 20]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-astra-blue rounded-full blur-[140px] opacity-10 mix-blend-screen" />


      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }} />

    </div>);

}