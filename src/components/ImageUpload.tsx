import React, { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export default function ImageUpload({ onImageSelect, className = "" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        ref={fileInputRef}
        className="hidden"
        id="image-upload"
      />
      
      {!preview ? (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
        >
          <svg 
            className="w-8 h-8 text-gray-400 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-sm text-gray-500">Click to upload an image</span>
        </label>
      ) : (
        <div className="relative">
          <Image
            src={preview}
            alt="Preview"
            width={300}
            height={200}
            className="rounded-lg object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
