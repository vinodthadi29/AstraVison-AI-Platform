import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setLocalError('Passwords do not match');
          return;
        }
        await register(email, username, password);
      }
      onClose();
    } catch (err) {
      setLocalError(error || 'An error occurred');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/60 border border-astra-violet/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-astra-text-secondary text-center mb-8 text-sm">
              {isLogin ? 'Sign in to access your images' : 'Join AstraVision today'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {localError && (
                <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm">
                  {localError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                    placeholder="Choose a username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-astra-violet to-astra-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-astra-violet/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setLocalError('');
                }}
                className="w-full text-astra-text-secondary text-sm hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
