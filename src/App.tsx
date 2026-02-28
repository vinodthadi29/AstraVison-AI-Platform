import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, Cpu, Users, Layers, Zap, Eye, Network, Brain } from 'lucide-react';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { AIEntities } from './components/AIEntities';
import { GlobeHero } from './components/ui/GlobeHero';
import { AnimeNavBar } from './components/ui/AnimeNavBar';
import { ContainerScroll } from './components/ui/ContainerScroll';
import { TeamShuffle } from './components/ui/TeamShuffle';

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'search', label: 'Visual Search', icon: Search },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'team', label: 'Team', icon: Users }
];

const teamMembers = [
  { id: 1, name: 'Aswinitha Patta', role: 'Team Lead & Backend', quote: 'Building robust systems.', color: 'bg-astra-violet' },
  { id: 2, name: 'Adilsha Khan Pathan', role: 'Model Training', quote: 'Training neural networks.', color: 'bg-astra-blue' },
  { id: 3, name: 'Vinod Thadi', role: 'Product Architect', quote: 'Designing scalable systems.', color: 'bg-gradient-to-br from-astra-violet to-astra-blue' },
  { id: 4, name: 'Ajay Jada', role: 'Frontend', quote: 'Crafting seamless experiences.', color: 'bg-astra-violet/50' },
  { id: 5, name: 'Venkatesh Sunkara', role: 'API Integration', quote: 'Connecting systems.', color: 'bg-astra-blue/50' }
];

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderSection = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="relative w-full min-h-screen bg-astra-bg">
            <AtmosphericBackground />
            <AIEntities />
            <GlobeHero onEnterSystem={() => setIsAuthOpen(true)} />
          </div>
        );

      case 'search':
        return (
          <div className="relative w-full min-h-screen bg-astra-bg flex flex-col items-center justify-center px-4 py-20">
            <AtmosphericBackground />
            <AIEntities />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl w-full">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">Visual Search</h2>
              <div className="bg-black/40 border border-astra-violet/30 rounded-2xl p-8 backdrop-blur-xl">
                <p className="text-astra-text-secondary text-center mb-8 text-lg">
                  Upload an image to search for similar images using advanced AI embeddings.
                </p>
                <div className="mt-8 border-2 border-dashed border-astra-violet/40 rounded-xl p-12 text-center hover:border-astra-violet/60 transition-colors cursor-pointer">
                  <Search className="w-12 h-12 text-astra-violet/60 mx-auto mb-3" />
                  <p className="text-astra-text-secondary">Drag and drop your image here</p>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'features':
        return (
          <div className="relative w-full min-h-screen bg-astra-bg">
            <AtmosphericBackground />
            <ContainerScroll titleComponent={
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Core Capabilities
              </h2>
            }>
              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                <motion.div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-astra-violet/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6 text-astra-violet" />
                    <h3 className="text-xl font-semibold text-white">Visual Search</h3>
                  </div>
                  <p className="text-astra-text-secondary">Find similar images using deep learning embeddings with MobileNetV2 neural networks.</p>
                </motion.div>
                <motion.div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-astra-blue/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-astra-blue" />
                    <h3 className="text-xl font-semibold text-white">Object Detection</h3>
                  </div>
                  <p className="text-astra-text-secondary">Real-time detection with YOLOv8 and advanced bounding box annotation capabilities.</p>
                </motion.div>
                <motion.div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-astra-violet/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-astra-violet" />
                    <h3 className="text-xl font-semibold text-white">Model Explainability</h3>
                  </div>
                  <p className="text-astra-text-secondary">Grad-CAM heatmaps revealing what the model perceives in every image.</p>
                </motion.div>
                <motion.div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-astra-blue/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="w-6 h-6 text-astra-blue" />
                    <h3 className="text-xl font-semibold text-white">Secure Architecture</h3>
                  </div>
                  <p className="text-astra-text-secondary">JWT authentication with token refresh and enterprise-grade security protocols.</p>
                </motion.div>
              </div>
            </ContainerScroll>
          </div>
        );

      case 'technology':
        return (
          <div className="relative w-full min-h-screen bg-astra-bg py-20 px-4">
            <AtmosphericBackground />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-6xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">Technology Stack</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div whileHover={{ y: -10, borderColor: 'rgba(139, 92, 246, 0.5)' }} className="bg-black/40 border border-astra-violet/20 rounded-xl p-8 backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-astra-violet/20">
                  <h3 className="text-lg font-semibold text-astra-violet mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Frontend
                  </h3>
                  <ul className="text-astra-text-secondary space-y-3 font-mono text-sm">
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Vite</li>
                    <li>• TailwindCSS</li>
                    <li>• Framer Motion</li>
                  </ul>
                </motion.div>
                <motion.div whileHover={{ y: -10, borderColor: 'rgba(59, 130, 246, 0.5)' }} className="bg-black/40 border border-astra-blue/20 rounded-xl p-8 backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-astra-blue/20">
                  <h3 className="text-lg font-semibold text-astra-blue mb-6 flex items-center gap-2">
                    <Network className="w-5 h-5" /> Backend
                  </h3>
                  <ul className="text-astra-text-secondary space-y-3 font-mono text-sm">
                    <li>• Flask 3.0</li>
                    <li>• PostgreSQL 14+</li>
                    <li>• pgvector</li>
                    <li>• SQLAlchemy</li>
                    <li>• Gunicorn</li>
                  </ul>
                </motion.div>
                <motion.div whileHover={{ y: -10, borderColor: 'rgba(139, 92, 246, 0.5)' }} className="bg-black/40 border border-astra-violet/20 rounded-xl p-8 backdrop-blur-xl transition-all hover:shadow-lg hover:shadow-astra-violet/20">
                  <h3 className="text-lg font-semibold text-astra-violet mb-6 flex items-center gap-2">
                    <Brain className="w-5 h-5" /> AI/ML
                  </h3>
                  <ul className="text-astra-text-secondary space-y-3 font-mono text-sm">
                    <li>• TensorFlow 2.14</li>
                    <li>• YOLOv8</li>
                    <li>• OpenCV</li>
                    <li>• PyTorch</li>
                    <li>• Scikit-learn</li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </div>
        );

      case 'team':
        return (
          <div className="relative w-full min-h-screen bg-astra-bg py-20">
            <AtmosphericBackground />
            <div className="relative z-10 max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet the Team</h2>
                <p className="text-astra-text-secondary text-lg">Exceptional minds building the future of spatial intelligence</p>
              </motion.div>
              <TeamShuffle members={teamMembers} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-astra-bg text-white selection:bg-astra-violet/30">
      {/* Anime Navigation Bar */}
      <AnimeNavBar items={navItems} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4"
            onClick={() => setIsAuthOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/60 border border-astra-violet/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center">System Access</h2>

              <div className="space-y-4 mb-8">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/5 border border-astra-violet/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-astra-violet focus:bg-white/10 transition-all"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-gradient-to-r from-astra-violet to-astra-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-astra-violet/50 transition-all mb-3">
                Login
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 border border-astra-violet/30 text-white font-semibold rounded-lg hover:bg-astra-violet/10 transition-all">
                Register
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
