import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface Image {
  id: string;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

export default function Dashboard() {
  const { token } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/images', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images');
      }

      setImages(data.data || []);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMsg);
      console.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-astra-bg px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Your Images</h1>
          <p className="text-xl text-astra-text-secondary">
            {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 mb-8"
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-astra-violet animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-astra-text-secondary text-lg mb-8">No images yet. Start by uploading some!</p>
            <a
              href="/upload"
              className="inline-block px-8 py-4 bg-gradient-to-r from-astra-violet to-astra-blue rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-astra-violet/50 transition-all"
            >
              Upload Images
            </a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {images.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-black/40 border border-astra-violet/20 rounded-xl overflow-hidden backdrop-blur-xl hover:border-astra-violet/50 transition-all group"
              >
                <div className="h-48 bg-astra-bg/50 flex items-center justify-center text-astra-text-secondary text-sm">
                  Image: {image.filename}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate mb-2">{image.filename}</h3>
                  <p className="text-astra-text-secondary text-sm mb-4">
                    {new Date(image.uploaded_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-astra-violet/20 hover:bg-astra-violet/30 text-astra-violet rounded transition-colors text-sm font-medium">
                      Analyze
                    </button>
                    <button className="flex-1 px-3 py-2 bg-astra-blue/20 hover:bg-astra-blue/30 text-astra-blue rounded transition-colors text-sm font-medium">
                      Search
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
