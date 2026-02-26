import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  FileImage,
  RotateCcw,
  Eye,
  Layers,
  Palette,
  Search,
  Sparkles,
  Tag,
  BarChart3,
  Zap
} from 'lucide-react';
import { FileUpload } from './ui/FileUpload';
import { imageAPI, SearchResponse } from '../lib/api';
const SIMILAR_IMAGES = [
{
  id: 1,
  score: 97.2,
  gradient: 'from-violet-600 via-purple-500 to-indigo-600',
  label: 'Near-exact match'
},
{
  id: 2,
  score: 91.8,
  gradient: 'from-blue-600 via-cyan-500 to-teal-500',
  label: 'Structural match'
},
{
  id: 3,
  score: 87.4,
  gradient: 'from-emerald-600 via-green-500 to-teal-500',
  label: 'Color similarity'
},
{
  id: 4,
  score: 82.1,
  gradient: 'from-amber-600 via-orange-500 to-red-500',
  label: 'Pattern match'
},
{
  id: 5,
  score: 76.9,
  gradient: 'from-pink-600 via-rose-500 to-red-500',
  label: 'Contextual match'
},
{
  id: 6,
  score: 71.3,
  gradient: 'from-indigo-600 via-blue-500 to-cyan-500',
  label: 'Semantic match'
}];

const DETECTED_OBJECTS = [
{
  label: 'Primary Subject',
  confidence: 98.7,
  color: 'bg-violet-500'
},
{
  label: 'Background Scene',
  confidence: 94.2,
  color: 'bg-blue-500'
},
{
  label: 'Texture Pattern',
  confidence: 89.1,
  color: 'bg-cyan-500'
},
{
  label: 'Color Composition',
  confidence: 86.5,
  color: 'bg-emerald-500'
},
{
  label: 'Edge Structure',
  confidence: 82.3,
  color: 'bg-amber-500'
},
{
  label: 'Depth Layer',
  confidence: 78.8,
  color: 'bg-pink-500'
}];

const SEMANTIC_LAYERS = [
{
  name: 'Object Detection',
  count: 12,
  icon: Eye
},
{
  name: 'Scene Classification',
  count: 4,
  icon: Layers
},
{
  name: 'Color Analysis',
  count: 8,
  icon: Palette
},
{
  name: 'Pattern Recognition',
  count: 6,
  icon: Search
}];

const COLOR_PALETTE = [
{
  hex: '#8B5CF6',
  name: 'Violet'
},
{
  hex: '#3B82F6',
  name: 'Blue'
},
{
  hex: '#06B6D4',
  name: 'Cyan'
},
{
  hex: '#10B981',
  name: 'Emerald'
},
{
  hex: '#F59E0B',
  name: 'Amber'
},
{
  hex: '#EF4444',
  name: 'Red'
}];

export function VisualSearch() {
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'scanning' | 'analyzed'>(
    'idle');
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    try {
      setError(null);
      setUploadedFiles(files);
      if (files.length > 0) {
        const url = URL.createObjectURL(files[0]);
        setPreviewUrl(url);
      }
      setStatus('uploading');
      let p = 10;
      const progressInterval = setInterval(() => {
        p += Math.random() * 15;
        if (p > 85) p = 85;
        setProgress(Math.floor(p));
      }, 200);

      try {
        // Upload and search
        setStatus('scanning');
        const results = await imageAPI.searchByUpload(files[0], 6);
        clearInterval(progressInterval);
        setSearchResults(results);
        setProgress(100);
        setStatus('analyzed');
      } catch (apiError) {
        clearInterval(progressInterval);
        const errorMessage = apiError instanceof Error ? apiError.message : 'Upload failed';
        console.error('[v0] Upload error:', errorMessage);
        setError(`Error: ${errorMessage}. Please ensure backend is running on ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`);
        setStatus('idle');
        setProgress(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('[v0] File handling error:', errorMessage);
      setError(`File error: ${errorMessage}`);
      setStatus('idle');
    }
  };
  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStatus('idle');
    setProgress(0);
    setUploadedFiles([]);
    setPreviewUrl(null);
    setSearchResults(null);
    setError(null);
  };
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-6xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
            Visual Intelligence Scanner
          </h2>
          <p className="text-astra-text-secondary max-w-2xl mx-auto">
            Upload any image to activate the neural analysis grid. Our system
            decomposes visual data into semantic layers and finds similar
            matches.
          </p>
        </div>

        <div className="relative">
          {/* Error Display */}
          {error &&
          <motion.div
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">

              <div className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-300 break-words">
                  {error}
                </p>
              </div>
              <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors shrink-0"
            >
                ✕
              </button>
            </motion.div>
          }

          <AnimatePresence mode="wait">
            {status === 'idle' &&
            <motion.div
              key="idle"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              className="glass-panel rounded-2xl border border-white/10">

                <FileUpload onChange={handleFileUpload} />
              </motion.div>
            }

            {(status === 'uploading' || status === 'scanning') &&
            <motion.div
              key="scanning"
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 1.05
              }}
              className="glass-panel rounded-2xl p-1 relative overflow-hidden h-[400px]">

                <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-astra-violet/10 to-transparent opacity-20" />

                  {previewUrl ?
                <img
                  src={previewUrl}
                  alt="Uploaded"
                  className="max-h-full max-w-full object-contain opacity-40" /> :

                uploadedFiles.length > 0 ?
                <div className="text-center z-10">
                      <p className="text-white font-mono text-sm mb-2">
                        {uploadedFiles[0].name}
                      </p>
                      <p className="text-astra-text-muted font-mono text-xs">
                        {(uploadedFiles[0].size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div> :

                <FileImage className="w-32 h-32 text-white/10" />
                }

                  <div className="absolute inset-0 scan-grid opacity-30" />
                  <div className="absolute inset-x-0 h-[2px] bg-astra-violet shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-scan-line z-10" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-astra-violet animate-pulse">
                      {status === 'uploading' ?
                    'UPLOADING DATA...' :
                    'ANALYZING NEURAL PATTERNS...'}
                    </span>
                    <span className="font-mono text-xs text-white">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                    className="h-full bg-astra-violet"
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: `${progress}%`
                    }} />

                  </div>
                </div>
              </motion.div>
            }

            {status === 'analyzed' &&
            <motion.div
              key="analyzed"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="space-y-6">

                {/* Header */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-display font-bold text-white">
                      Analysis Complete
                    </h3>
                    <p className="text-sm text-astra-text-secondary">
                      {uploadedFiles.length > 0 ?
                    `Analyzed "${uploadedFiles[0].name}" — Found 12 objects, 4 semantic layers, 6 similar matches.` :
                    'Found 12 objects, 4 semantic layers, 6 similar matches.'}
                    </p>
                  </div>
                  <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-astra-text-secondary hover:text-white hover:bg-white/10 transition-all shrink-0">

                    <RotateCcw size={14} />
                    New Scan
                  </button>
                </div>

                {/* Main Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Uploaded Image + Detection */}
                  <div className="space-y-6">
                    {/* Uploaded Image Preview */}
                    {previewUrl &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    transition={{
                      delay: 0.1
                    }}
                    className="glass-panel rounded-xl border border-white/10 p-3 relative overflow-hidden">

                        <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                          <span className="font-mono text-[10px] text-astra-violet uppercase">
                            Source Image
                          </span>
                        </div>
                        <img
                      src={previewUrl}
                      alt="Uploaded"
                      className="w-full h-48 object-cover rounded-lg" />

                      </motion.div>
                  }

                    {/* Detected Objects */}
                    <motion.div
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.2
                    }}
                    className="glass-panel rounded-xl border border-white/10 p-5">

                      <div className="flex items-center gap-2 mb-4">
                        <Tag size={14} className="text-astra-violet" />
                        <h4 className="text-sm font-mono text-white uppercase tracking-wider">
                          Detected Objects
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {DETECTED_OBJECTS.map((obj, i) =>
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 0,
                          x: -10
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: 0.3 + i * 0.05
                        }}
                        className="flex items-center gap-3">

                            <div
                          className={`w-2 h-2 rounded-full ${obj.color}`} />

                            <span className="text-xs text-astra-text-secondary flex-1">
                              {obj.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                              className={`h-full ${obj.color} rounded-full`}
                              initial={{
                                width: 0
                              }}
                              animate={{
                                width: `${obj.confidence}%`
                              }}
                              transition={{
                                delay: 0.4 + i * 0.05,
                                duration: 0.6
                              }} />

                              </div>
                              <span className="text-[10px] font-mono text-white w-10 text-right">
                                {obj.confidence}%
                              </span>
                            </div>
                          </motion.div>
                      )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Column: Similar Images */}
                  <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: 0.3
                  }}
                  className="glass-panel rounded-xl border border-white/10 p-5 lg:col-span-1">

                    <div className="flex items-center gap-2 mb-4">
                      <Search size={14} className="text-astra-blue" />
                      <h4 className="text-sm font-mono text-white uppercase tracking-wider">
                        Similar Matches
                      </h4>
                      <span className="ml-auto text-[10px] font-mono text-astra-text-muted">
                        {SIMILAR_IMAGES.length} found
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {SIMILAR_IMAGES.map((img, i) =>
                    <motion.div
                      key={img.id}
                      initial={{
                        opacity: 0,
                        scale: 0.9
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1
                      }}
                      transition={{
                        delay: 0.4 + i * 0.08
                      }}
                      className="group relative rounded-lg overflow-hidden border border-white/5 cursor-default">

                          <div
                        className={`w-full h-24 bg-gradient-to-br ${img.gradient} opacity-70`} />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-astra-text-muted">
                                {img.label}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-white">
                                {img.score}%
                              </span>
                            </div>
                          </div>
                          {/* Score badge */}
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                              <Sparkles
                            size={8}
                            className="text-astra-violet" />

                              <span className="text-[9px] font-mono text-white">
                                {img.score >= 90 ?
                            'HIGH' :
                            img.score >= 80 ?
                            'MED' :
                            'LOW'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                    )}
                    </div>
                  </motion.div>

                  {/* Right Column: Semantic Layers + Color Palette + Stats */}
                  <div className="space-y-6">
                    {/* Semantic Layers */}
                    <motion.div
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.4
                    }}
                    className="glass-panel rounded-xl border border-white/10 p-5">

                      <div className="flex items-center gap-2 mb-4">
                        <Layers size={14} className="text-cyan-400" />
                        <h4 className="text-sm font-mono text-white uppercase tracking-wider">
                          Semantic Layers
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {SEMANTIC_LAYERS.map((layer, i) =>
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 0,
                          x: 10
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          delay: 0.5 + i * 0.05
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">

                            <layer.icon
                          size={16}
                          className="text-astra-text-secondary shrink-0" />

                            <span className="text-xs text-white flex-1">
                              {layer.name}
                            </span>
                            <span className="text-[10px] font-mono text-astra-violet">
                              {layer.count} items
                            </span>
                          </motion.div>
                      )}
                      </div>
                    </motion.div>

                    {/* Color Palette */}
                    <motion.div
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.5
                    }}
                    className="glass-panel rounded-xl border border-white/10 p-5">

                      <div className="flex items-center gap-2 mb-4">
                        <Palette size={14} className="text-pink-400" />
                        <h4 className="text-sm font-mono text-white uppercase tracking-wider">
                          Color Palette
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        {COLOR_PALETTE.map((color, i) =>
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 0,
                          scale: 0
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1
                        }}
                        transition={{
                          delay: 0.6 + i * 0.05,
                          type: 'spring',
                          stiffness: 300
                        }}
                        className="flex-1 flex flex-col items-center gap-1.5">

                            <div
                          className="w-full aspect-square rounded-lg border border-white/10"
                          style={{
                            backgroundColor: color.hex
                          }} />

                            <span className="text-[8px] font-mono text-astra-text-muted">
                              {color.hex}
                            </span>
                          </motion.div>
                      )}
                      </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.6
                    }}
                    className="grid grid-cols-3 gap-3">

                      {[
                    {
                      label: 'Objects',
                      value: '12',
                      icon: Eye
                    },
                    {
                      label: 'Latency',
                      value: '47ms',
                      icon: Zap
                    },
                    {
                      label: 'Accuracy',
                      value: '98.7%',
                      icon: BarChart3
                    }].
                    map((stat, i) =>
                    <div
                      key={i}
                      className="glass-panel rounded-lg border border-white/5 p-3 text-center">

                          <stat.icon
                        size={14}
                        className="text-astra-text-muted mx-auto mb-1.5" />

                          <p className="text-sm font-bold text-white font-display">
                            {stat.value}
                          </p>
                          <p className="text-[9px] font-mono text-astra-text-muted uppercase">
                            {stat.label}
                          </p>
                        </div>
                    )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </section>);

}
