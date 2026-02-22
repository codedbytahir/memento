import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { api } from '../utils/api';
import { Loader2 } from 'lucide-react';

const UploadScreen = ({ onStart }) => {
  const [images, setImages] = useState([]);
  const [email, setEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const compressed = await Promise.all(
      acceptedFiles.slice(0, 5 - images.length).map(async (file) => {
        try {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 800,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(file, options);
          return compressedFile;
        } catch (error) {
          console.error("Compression error:", error);
          return file;
        }
      })
    );
    setImages([...images, ...compressed]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 5 - images.length
  });

  const isValid = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && images.length > 0;

  const handleStart = async () => {
    if (!isValid) return;
    setIsUploading(true);
    try {
      const data = await api.startSession(email, images);
      onStart(data);
    } catch (error) {
      alert("Failed to start session. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <img src="/logo.svg" alt="Memento" className="h-24 mx-auto mb-2" />
          <h1 className="text-4xl font-serif font-bold text-memento-navy">Preserve Your Story</h1>
          <p className="text-memento-charcoal/70 mt-3 font-medium">Capture the moments that matter, forever.</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
            isDragActive ? 'border-memento-copper bg-memento-copper/5' : 'border-memento-navy/30 hover:border-memento-copper'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-lg">📸 Click or drag & drop photos here</p>
          <p className="text-sm text-memento-charcoal/50 mt-1">JPEG, PNG only (max 5)</p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden border border-memento-navy/10 relative group">
                <img src={URL.createObjectURL(img)} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages(images.filter((_, index) => index !== i));
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 rounded-lg border border-memento-navy/20 focus:outline-none focus:ring-2 focus:ring-memento-copper"
            placeholder="your@email.com"
            required
          />

          <button
            onClick={handleStart}
            disabled={!isValid || isUploading}
            className="w-full bg-memento-navy text-white py-4 rounded-lg font-semibold disabled:opacity-50 hover:bg-memento-navy/90 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <span>🎤 Start My Story</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
