'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Camera, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UploadZoneProps {
  onStart: (data: { sessionId: string; websocket_url: string; email: string }) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onStart }) => {
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

      const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

      if (isDev) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onStart({
          sessionId: "mock-" + Math.random().toString(36).substr(2, 9),
          websocket_url: "wss://echo.websocket.org",
          email: email
        });
      } else {
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, images: base64Images })
        });
        const data = await response.json();
        onStart({ ...data, email: email });
      }
    } catch (error) {
      alert("Failed to start session. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer bg-white shadow-inner ${
          isDragActive ? 'border-copper bg-copper/5 ring-4 ring-copper/10' : 'border-navy/30 hover:border-copper hover:ring-4 hover:ring-copper/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-copper/20 text-copper' : 'bg-navy/5 text-navy/40'}`}>
            <Camera size={48} />
          </div>
          <div>
            <p className="text-xl font-bold text-navy">📸 Upload Photos (0/5)</p>
            <p className="text-charcoal-light font-medium mt-1">Drag & drop or click to select</p>
          </div>
          <p className="text-xs text-charcoal/40 uppercase tracking-widest font-bold">JPEG, PNG only • MAX 500KB PER IMAGE</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 animate-fade-in">
          {images.map((file, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-navy/10 relative group shadow-md transition-transform hover:scale-105">
              <img src={URL.createObjectURL(file)} alt={`Upload ${i}`} className="w-full h-full object-cover" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImages(images.filter((_, index) => index !== i));
                }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 pt-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          label="Your Email Address"
          required
        />

        <Button
          onClick={handleStart}
          disabled={!isValid || isUploading}
          isLoading={isUploading}
          variant="navy"
          size="lg"
          className="w-full h-16 text-lg shadow-xl"
        >
          🎤 Start My Story
        </Button>
      </div>
    </div>
  );
};

export default UploadZone;
