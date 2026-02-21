import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
export function AIEntities() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = {
    damping: 25,
    stiffness: 150
  };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  // Subtle parallax effect for entities
  const entity1X = useTransform(x, [0, window.innerWidth], [-20, 20]);
  const entity1Y = useTransform(y, [0, window.innerHeight], [-20, 20]);
  const entity2X = useTransform(x, [0, window.innerWidth], [30, -30]);
  const entity2Y = useTransform(y, [0, window.innerHeight], [30, -30]);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Entity 1: The Observer (Top Right) */}
      <motion.div
        style={{
          x: entity1X,
          y: entity1Y
        }}
        className="absolute top-[15%] right-[10%] w-64 h-64 opacity-20">

        <div className="relative w-full h-full">
          {/* Outer Ring */}
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 border border-astra-violet/30 rounded-full border-dashed" />

          {/* Inner Geometric Core */}
          <motion.div
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-8 border border-astra-blue/20 rounded-full" />

          <div className="absolute inset-[40%] bg-astra-violet/10 blur-xl rounded-full animate-pulse-slow" />
        </div>
      </motion.div>

      {/* Entity 2: The Analyst (Bottom Left) */}
      <motion.div
        style={{
          x: entity2X,
          y: entity2Y
        }}
        className="absolute bottom-[20%] left-[5%] w-48 h-48 opacity-15">

        <div className="relative w-full h-full">
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 border border-astra-blue/30 rounded-md rotate-45" />

          <motion.div
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-4 border border-white/10 rounded-full" />

        </div>
      </motion.div>
    </div>);

}