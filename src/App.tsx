import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, Cpu, Users, Layers } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'search', label: 'Visual Search', icon: Search },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'team', label: 'Team', icon: Users }
];

const teamMembers = [
  { id: 1, name: 'Aswinitha Patta', role: 'Team Lead & Backend', quote: 'Building robust systems.' },
  { id: 2, name: 'Adilsha Khan Pathan', role: 'Model Training', quote: 'Training neural networks.' },
  { id: 3, name: 'Vinod Thadi', role: 'Product Architect', quote: 'Designing scalable systems.' },
  { id: 4, name: 'Ajay Jada', role: 'Frontend', quote: 'Crafting seamless experiences.' },
  { id: 5, name: 'Venkatesh Sunkara', role: 'API Integration', quote: 'Connecting systems.' }
];

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderSection = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                AstraVision
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                AI-Powered Spatial Intelligence Platform
              </p>
              <p className="text-lg text-gray-400 mb-12">
                Advanced visual search, object detection, and model explainability
              </p>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
              >
                Enter System
              </button>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
            <h2 className="text-4xl font-bold text-white mb-8">Visual Search</h2>
            <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full">
              <p className="text-gray-300 text-center">
                Upload an image to search for similar images using advanced AI embeddings.
              </p>
              <div className="mt-8 border-2 border-dashed border-purple-500 rounded-lg p-12 text-center">
                <p className="text-gray-400">Drag and drop your image here</p>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="min-h-screen bg-slate-900 py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-16 text-center">Features</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Visual Search</h3>
                  <p className="text-gray-300">Find similar images using deep learning embeddings with MobileNetV2.</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Object Detection</h3>
                  <p className="text-gray-300">Real-time detection with YOLOv8 and bounding box annotation.</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Model Explainability</h3>
                  <p className="text-gray-300">Grad-CAM heatmaps showing what the model "sees".</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Secure Auth</h3>
                  <p className="text-gray-300">JWT authentication with token refresh and secure storage.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'technology':
        return (
          <div className="min-h-screen bg-slate-900 py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-16 text-center">Technology Stack</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Frontend</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>React 18</li>
                    <li>TypeScript</li>
                    <li>Vite</li>
                    <li>TailwindCSS</li>
                  </ul>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Backend</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>Flask</li>
                    <li>PostgreSQL</li>
                    <li>pgvector</li>
                    <li>SQLAlchemy</li>
                  </ul>
                </div>
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">AI/ML</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>TensorFlow</li>
                    <li>YOLOv8</li>
                    <li>OpenCV</li>
                    <li>PyTorch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="min-h-screen bg-slate-900 py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-white mb-16 text-center">The Team</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-slate-800 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
                    <p className="text-purple-400 text-sm mb-3">{member.role}</p>
                    <p className="text-gray-400 text-sm italic">"{member.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white selection:bg-purple-600/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AstraVision</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAuthOpen(!isAuthOpen)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-all"
          >
            {isAuthOpen ? 'Close' : 'Login'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setIsAuthOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Authentication</h2>

              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all mb-3">
                Login
              </button>

              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all">
                Register
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
