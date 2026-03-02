import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadArea() {
  const { token } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: Math.random().toString(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const
    }));
    setFiles([...files, ...newFiles]);

    // Auto-upload
    newFiles.forEach((f) => uploadFile(f.id, f.file));
  };

  const uploadFile = async (fileId: string, file: File) => {
    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading' as const } : f))
    );

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'success' as const } : f
        )
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'error' as const, error: errorMsg } : f
        )
      );
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      uploadFile(fileId, file.file);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-astra-bg px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Upload Images</h1>
          <p className="text-xl text-astra-text-secondary">
            Drag and drop your images or click to select files
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-astra-violet bg-astra-violet/10'
              : 'border-astra-violet/40 hover:border-astra-violet/60 bg-transparent'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <Upload className="w-16 h-16 text-astra-violet/60 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">Drop images here</h3>
          <p className="text-astra-text-secondary mb-4">or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-astra-violet to-astra-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-astra-violet/50 transition-all"
          >
            Select Files
          </button>
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Uploads</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 border border-astra-violet/20 rounded-xl overflow-hidden backdrop-blur-xl hover:border-astra-violet/50 transition-colors"
                >
                  <img
                    src={file.preview}
                    alt="preview"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-white text-sm font-medium truncate mb-3">{file.file.name}</p>
                    <div className="flex items-center justify-between">
                      {file.status === 'success' && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-5 h-5" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      )}
                      {file.status === 'uploading' && (
                        <div className="text-astra-violet text-xs">Uploading...</div>
                      )}
                      {file.status === 'error' && (
                        <div className="text-red-400 text-xs">{file.error}</div>
                      )}
                      {file.status === 'pending' && (
                        <div className="text-gray-400 text-xs">Pending</div>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {file.status === 'error' && (
                      <button
                        onClick={() => retryUpload(file.id)}
                        className="mt-3 w-full py-2 text-xs bg-astra-violet/20 hover:bg-astra-violet/30 text-astra-violet rounded transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
