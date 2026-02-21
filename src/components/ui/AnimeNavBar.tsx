import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { BoxIcon } from 'lucide-react';
interface NavItem {
  id: string;
  label: string;
  icon: BoxIcon;
}
interface NavBarProps {
  items: NavItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  className?: string;
}
export function AnimeNavBar({
  items,
  activeTab,
  setActiveTab,
  className
}: NavBarProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div className={cn('fixed top-5 left-0 right-0 z-[9999]', className)}>
      <div className="flex justify-center pt-6">
        <motion.div
          className="flex items-center gap-3 bg-black/50 border border-white/10 backdrop-blur-lg py-2 px-2 rounded-full shadow-2xl shadow-black/50 relative"
          initial={{
            y: -20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}>

          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  'relative cursor-pointer text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2',
                  'text-white/70 hover:text-white',
                  isActive && 'text-white'
                )}>

                {isActive &&
                <motion.div
                  className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.03, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}>

                    <div className="absolute inset-0 bg-astra-violet/25 rounded-full blur-md" />
                    <div className="absolute inset-[-4px] bg-astra-violet/20 rounded-full blur-xl" />
                    <div className="absolute inset-[-8px] bg-astra-violet/15 rounded-full blur-2xl" />

                    <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-astra-violet/20 to-transparent"
                    style={{
                      animation: 'shine 3s ease-in-out infinite'
                    }} />

                  </motion.div>
                }

                <span className="relative z-10 hidden md:inline">
                  {item.label}
                </span>
                <Icon
                  size={18}
                  strokeWidth={2.5}
                  className="md:hidden relative z-10" />


                <AnimatePresence>
                  {isHovered && !isActive &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8
                    }}
                    className="absolute inset-0 bg-white/10 rounded-full -z-10" />

                  }
                </AnimatePresence>

                {isActive &&
                <motion.div
                  layoutId="anime-mascot"
                  className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}>

                    <div className="relative w-12 h-12">
                      <motion.div
                      className="absolute w-10 h-10 bg-white rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      animate={
                      hoveredTab ?
                      {
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                        transition: {
                          duration: 0.5,
                          ease: 'easeInOut'
                        }
                      } :
                      {
                        y: [0, -3, 0],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      }
                      }>

                        {/* Eyes */}
                        <motion.div
                        className="absolute w-2 h-2 bg-black rounded-full"
                        animate={
                        hoveredTab ?
                        {
                          scaleY: [1, 0.2, 1]
                        } :
                        {}
                        }
                        style={{
                          left: '25%',
                          top: '40%'
                        }} />

                        <motion.div
                        className="absolute w-2 h-2 bg-black rounded-full"
                        animate={
                        hoveredTab ?
                        {
                          scaleY: [1, 0.2, 1]
                        } :
                        {}
                        }
                        style={{
                          right: '25%',
                          top: '40%'
                        }} />


                        {/* Blush */}
                        <motion.div
                        className="absolute w-2 h-1.5 bg-pink-300 rounded-full opacity-60"
                        style={{
                          left: '15%',
                          top: '55%'
                        }} />

                        <motion.div
                        className="absolute w-2 h-1.5 bg-pink-300 rounded-full opacity-60"
                        style={{
                          right: '15%',
                          top: '55%'
                        }} />


                        {/* Mouth */}
                        <motion.div
                        className="absolute w-4 h-2 border-b-2 border-black rounded-full"
                        animate={
                        hoveredTab ?
                        {
                          scaleY: 1.5,
                          y: -1
                        } :
                        {
                          scaleY: 1,
                          y: 0
                        }
                        }
                        style={{
                          left: '30%',
                          top: '60%'
                        }} />

                      </motion.div>
                    </div>
                  </motion.div>
                }
              </button>);

          })}
        </motion.div>
      </div>
    </div>);

}