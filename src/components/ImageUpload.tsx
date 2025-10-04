'use client';

import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onChange: (files: FileList | null) => void;
  value: FileList | null;
  maxFiles?: number;
}

export default function ImageUpload({ onChange, value, maxFiles = 5 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > maxFiles) {
      alert(`Máximo ${maxFiles}: selecciona solo los primeros ${maxFiles}`);
      // Tomar solo los primeros archivos
      const limitedFiles = Array.from(files).slice(0, maxFiles);
      const dataTransfer = new DataTransfer();
      limitedFiles.forEach(file => dataTransfer.items.add(file));
      onChange(dataTransfer.files);
    } else {
      onChange(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <div>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Dropzone */}
      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${value && value.length > 0 ? 'border-green-400 bg-green-50' : ''}
        `}
      >
        <div className="space-y-2">
          <div className="text-4xl">
            {value && value.length > 0 ? '✅' : '📷'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {value && value.length > 0 
              ? `Galería completa (${value.length}/${maxFiles})`
              : 'Arrastra imágenes aquí o haz clic'
            }
          </div>
          <div className="text-xs text-gray-500">
            JPG, PNG, WebP • Máximo {maxFiles} archivos
          </div>
          {value && value.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFiles();
              }}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      {/* Preview de imágenes */}
      {value && value.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Vista previa:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(value).map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-20 object-cover rounded border"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
