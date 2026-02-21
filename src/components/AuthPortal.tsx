import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Fingerprint,
  Eye,
  ArrowRight,
  ShieldCheck,
  Scan } from
'lucide-react';
import { AstraGuardian, GuardianState } from './ui/AstraGuardian';
import { authAPI } from '../lib/api';

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function AuthPortal({ isOpen, onClose }: AuthPortalProps) {
  const [guardianState, setGuardianState] = useState<GuardianState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [typingActivity, setTypingActivity] = useState(0);
  const [keystrokePulse, setKeystrokePulse] = useState(0);
  const [focusedField, setFocusedField] = useState<
    'none' | 'email' | 'password'>(
    'none');
  const activityDecayRef = useRef<ReturnType<typeof setInterval>>();
  const lastKeystrokeRef = useRef(0);
  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setGuardianState('idle');
      setEmail('');
      setPassword('');
      setTypingActivity(0);
      setKeystrokePulse(0);
      setFocusedField('none');
    }
  }, [isOpen]);
  // Decay typing activity over time
  useEffect(() => {
    activityDecayRef.current = setInterval(() => {
      setTypingActivity((prev) => {
        const timeSinceLastKey = Date.now() - lastKeystrokeRef.current;
        if (timeSinceLastKey > 300) {
          return Math.max(0, prev * 0.92); // smooth decay
        }
        return prev;
      });
    }, 50);
    return () => clearInterval(activityDecayRef.current);
  }, []);
  const handleKeystroke = useCallback(() => {
    lastKeystrokeRef.current = Date.now();
    setTypingActivity((prev) => Math.min(1, prev + 0.25));
    setKeystrokePulse((prev) => prev + 1);
  }, []);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    handleKeystroke();
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    handleKeystroke();
  };
  const handleFocus = (field: 'email' | 'password') => {
    setFocusedField(field);
    if (field === 'email') setGuardianState('watching');else
    setGuardianState('alert');
  };
  const handleBlur = () => {
    // Small delay to prevent flicker when tabbing between fields
    setTimeout(() => {
      setFocusedField((prev) => {
        // Only go idle if no field grabbed focus in the meantime
        return prev;
      });
    }, 100);
    setGuardianState('idle');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardianState('scanning');
    setTypingActivity(0);

    try {
      // Try to login first, then register if user doesn't exist
      try {
        await authAPI.login(email, password);
      } catch (loginError) {
        await authAPI.register(email, password);
      }

      setTimeout(() => {
        setGuardianState('approved');
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1500);
    } catch (error) {
      setGuardianState('idle');
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  const handleClose = () => {
    onClose();
  };
  const statusMessages: Record<GuardianState, string> = {
    idle: 'HI THERE! READY WHEN YOU ARE ✦',
    watching: 'OOH, TYPING! LET ME SEE...',
    alert: "DON'T WORRY, I'M NOT PEEKING! 🙈",
    scanning: 'HMMMM... CHECKING EVERYTHING...',
    approved: 'YAY! WELCOME BACK, FRIEND! 🎉'
  };
  const statusColors: Record<GuardianState, string> = {
    idle: 'text-astra-text-secondary',
    watching: 'text-astra-violet',
    alert: 'text-astra-blue',
    scanning: 'text-yellow-400',
    approved: 'text-emerald-400'
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
          {/* Backdrop */}
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.4
          }}
          className="absolute inset-0 bg-black/92 backdrop-blur-lg"
          onClick={handleClose} />


          {/* Main Container */}
          <motion.div
          initial={{
            scale: 0.85,
            opacity: 0,
            y: 30
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.9,
            opacity: 0,
            y: -20
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative w-full max-w-5xl h-[85vh] flex flex-col md:flex-row items-center justify-center pointer-events-none gap-4 p-4">

            {/* Left: 3D Guardian */}
            <div className="w-full md:w-[55%] h-[350px] md:h-full flex flex-col items-center justify-center relative pointer-events-auto">
              {/* Ambient glow behind guardian */}
              <motion.div
              className="absolute inset-0 rounded-full blur-[80px]"
              animate={{
                backgroundColor:
                guardianState === 'approved' ?
                'rgba(16, 185, 129, 0.08)' :
                guardianState === 'scanning' ?
                'rgba(139, 92, 246, 0.12)' :
                'rgba(139, 92, 246, 0.05)'
              }}
              transition={{
                duration: 1
              }} />


              <AstraGuardian
              state={guardianState}
              typingActivity={typingActivity}
              keystrokePulse={keystrokePulse}
              inputLength={
              focusedField === 'email' ? email.length : password.length
              }
              className="z-10" />


              {/* Status Display */}
              <div className="absolute bottom-6 left-0 right-0 text-center z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                  key={guardianState}
                  initial={{
                    opacity: 0,
                    y: 8,
                    filter: 'blur(4px)'
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)'
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    filter: 'blur(4px)'
                  }}
                  transition={{
                    duration: 0.3
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">

                    {guardianState === 'scanning' &&
                  <Scan
                    size={12}
                    className="text-yellow-400 animate-pulse" />

                  }
                    {guardianState === 'approved' &&
                  <ShieldCheck size={12} className="text-emerald-400" />
                  }
                    <span
                    className={`font-mono text-[10px] uppercase tracking-[0.2em] ${statusColors[guardianState]}`}>

                      {statusMessages[guardianState]}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Typing activity indicator */}
                {(guardianState === 'watching' || guardianState === 'alert') &&
              typingActivity > 0.05 &&
              <motion.div
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                className="mt-3 flex justify-center gap-1">

                      {[0, 1, 2, 3, 4].map((i) =>
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-astra-violet"
                  animate={{
                    height:
                    typingActivity > i * 0.2 ?
                    [4, 12 + Math.random() * 8, 4] :
                    4,
                    opacity: typingActivity > i * 0.2 ? 1 : 0.2
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                    repeat: typingActivity > 0.1 ? Infinity : 0,
                    repeatType: 'reverse'
                  }} />

                )}
                    </motion.div>
              }
              </div>
            </div>

            {/* Right: Auth Form */}
            <div className="w-full md:w-[380px] pointer-events-auto">
              <motion.div
              initial={{
                opacity: 0,
                x: 30
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="glass-panel p-8 rounded-2xl border border-white/10 bg-black/70 shadow-2xl relative overflow-hidden">

                {/* Scanning line effect */}
                {guardianState === 'scanning' &&
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-astra-violet to-transparent shadow-[0_0_15px_rgba(139,92,246,0.8)] z-20"
                animate={{
                  top: ['0%', '100%', '0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }} />

              }

                {/* Approved glow */}
                {guardianState === 'approved' &&
              <motion.div
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: [0, 0.15, 0.05]
                }}
                transition={{
                  duration: 1.5
                }}
                className="absolute inset-0 bg-emerald-500 z-0 rounded-2xl" />

              }

                {/* Header */}
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-astra-violet/20 flex items-center justify-center">
                      <Lock size={14} className="text-astra-violet" />
                    </div>
                    <div>
                      <span className="font-mono text-xs tracking-widest text-white block">
                        SECURE ACCESS
                      </span>
                      <span className="font-mono text-[9px] text-astra-text-muted tracking-wider">
                        NEURAL GUARD v4.2
                      </span>
                    </div>
                  </div>
                  <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">

                    <X size={16} />
                  </button>
                </div>

                <form
                onSubmit={handleSubmit}
                className="space-y-5 relative z-10">

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-astra-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${focusedField === 'email' ? 'bg-astra-violet animate-pulse' : 'bg-white/20'}`} />

                      Identity Protocol
                    </label>
                    <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    disabled={
                    guardianState === 'scanning' ||
                    guardianState === 'approved'
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-astra-violet/60 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-300 placeholder:text-white/15 disabled:opacity-40"
                    placeholder="operator@astravision.io" />

                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-astra-text-secondary uppercase tracking-widest flex items-center gap-2">
                      <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${focusedField === 'password' ? 'bg-astra-blue animate-pulse' : 'bg-white/20'}`} />

                      Encryption Key
                      {focusedField === 'password' &&
                    <motion.span
                      initial={{
                        opacity: 0,
                        x: -5
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      className="text-[9px] text-astra-blue/70 ml-auto">

                          guardian averting gaze
                        </motion.span>
                    }
                    </label>
                    <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    disabled={
                    guardianState === 'scanning' ||
                    guardianState === 'approved'
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-astra-blue/60 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 placeholder:text-white/15 disabled:opacity-40"
                    placeholder="••••••••••••" />

                    {/* Password strength visualization */}
                    {password.length > 0 && focusedField === 'password' &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto'
                    }}
                    className="flex gap-1 pt-1">

                        {[1, 2, 3, 4, 5].map((i) =>
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${password.length >= i * 2 ? i <= 2 ? 'bg-red-500' : i <= 4 ? 'bg-yellow-500' : 'bg-emerald-500' : 'bg-white/10'}`} />

                    )}
                      </motion.div>
                  }
                  </div>

                  {/* Submit Button */}
                  <motion.button
                  type="submit"
                  disabled={
                  guardianState === 'scanning' ||
                  guardianState === 'approved' ||
                  !email ||
                  !password
                  }
                  whileHover={
                  guardianState === 'idle' ||
                  guardianState === 'watching' ||
                  guardianState === 'alert' ?
                  {
                    scale: 1.02
                  } :
                  {}
                  }
                  whileTap={
                  guardianState === 'idle' ||
                  guardianState === 'watching' ||
                  guardianState === 'alert' ?
                  {
                    scale: 0.98
                  } :
                  {}
                  }
                  className={`w-full font-medium py-3.5 rounded-lg transition-all duration-500 flex items-center justify-center gap-2 group relative overflow-hidden text-sm ${guardianState === 'approved' ? 'bg-emerald-500 text-white' : guardianState === 'scanning' ? 'bg-astra-violet/60 text-white/80' : 'bg-astra-violet hover:bg-astra-violet/90 disabled:bg-white/5 disabled:text-white/30 text-white'}`}>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {guardianState === 'scanning' ?
                  <>
                        <Eye className="animate-pulse" size={16} />
                        <span>Neural Verification...</span>
                        <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-white/50"
                      initial={{
                        width: '0%'
                      }}
                      animate={{
                        width: '100%'
                      }}
                      transition={{
                        duration: 2.5,
                        ease: 'linear'
                      }} />

                      </> :
                  guardianState === 'approved' ?
                  <motion.div
                    initial={{
                      scale: 0.8
                    }}
                    animate={{
                      scale: 1
                    }}
                    className="flex items-center gap-2">

                        <ShieldCheck size={16} />
                        <span>Access Granted</span>
                      </motion.div> :

                  <>
                        <Fingerprint size={16} />
                        <span>Initialize Session</span>
                        <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform" />

                      </>
                  }
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
                  <p className="text-[9px] text-astra-text-muted font-mono uppercase tracking-widest">
                    AES-256 Encrypted
                  </p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) =>
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-astra-violet/50"
                    animate={{
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      repeat: Infinity
                    }} />

                  )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
