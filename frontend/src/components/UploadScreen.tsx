'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Loader2, Camera, X } from 'lucide-react';
import Image from 'next/image';

interface UploadScreenProps {
  onStart: (data: { session_id: string; websocket_url: string; user_email: string }) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onStart }) => {
  const [images, setImages] = useState<File[]>([]);
  const [email, setEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const compressed = await Promise.all(
      acceptedFiles.slice(0, 5 - images.length).map(async (file) => {
        try {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 800,
            useWebWorker: true
          };
          return await imageCompression(file, options);
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
      // images to base64
      const base64Images = await Promise.all(images.map(async (file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
      }));

      // For now calling mock endpoint or actual if we have env
      const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onStart({
          session_id: "mock-" + Math.random().toString(36).substr(2, 9),
          websocket_url: "wss://echo.websocket.org",
          user_email: email
        });
      } else {
        const response = await fetch('/api/start-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: email, images: base64Images })
        });
        const data = await response.json();
        onStart({ ...data, user_email: email });
      }
    } catch (error) {
      alert("Failed to start session. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-memento-cream">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <Image src="/logo.svg" alt="Memento" width={256} height={75} className="mx-auto mb-2" />
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
          <div className="flex flex-col items-center space-y-2">
            <Camera size={48} className="text-memento-navy/40" />
            <p className="text-lg font-medium">Click or drag & drop photos here</p>
            <p className="text-sm text-memento-charcoal/50">JPEG, PNG only (max 5)</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((file, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden border border-memento-navy/10 relative group">
                <img src={URL.createObjectURL(file)} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages(images.filter((_, index) => index !== i));
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
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
            className="w-full px-4 py-4 rounded-lg border border-memento-navy/20 focus:outline-none focus:ring-2 focus:ring-memento-copper bg-white"
            placeholder="your@email.com"
            required
          />

          <button
            onClick={handleStart}
            disabled={!isValid || isUploading}
            className="w-full bg-memento-navy text-white py-4 rounded-lg font-semibold disabled:opacity-50 hover:bg-memento-navy/90 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <span>🎤 Start My Story</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
