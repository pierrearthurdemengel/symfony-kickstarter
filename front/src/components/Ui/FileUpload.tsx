import { useState, useRef, useCallback } from 'react';
import type { MediaObject } from '@/types';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onUpload: (media: MediaObject) => void;
  label?: string;
}

// URL de base pour l'upload
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'auth_token';

export default function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  onUpload,
  label = 'Selectionner un fichier',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation du fichier avant upload
  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept !== '*' && accept !== '*/*') {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const isValid = acceptedTypes.some((type) => {
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return file.type.startsWith(`${category}/`);
          }
          return file.type === type;
        });
        if (!isValid) {
          return `Type de fichier non autorise. Types acceptes : ${accept}`;
        }
      }
      if (file.size > maxSize) {
        const maxMb = (maxSize / (1024 * 1024)).toFixed(1);
        return `Fichier trop volumineux. Taille maximale : ${maxMb} Mo`;
      }
      return null;
    },
    [accept, maxSize],
  );

  // Upload du fichier via XMLHttpRequest pour suivre la progression
  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);
      setProgress(0);

      // Preview si c'est une image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem(TOKEN_KEY);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const media = JSON.parse(xhr.responseText) as MediaObject;
          onUpload(media);
          setProgress(null);
        } else {
          setError(`Erreur lors de l'upload (${xhr.status})`);
          setProgress(null);
          setPreview(null);
        }
      });

      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setError("Erreur reseau lors de l'upload");
        setProgress(null);
        setPreview(null);
      });

      xhr.open('POST', `${BASE_URL}/media`);
      xhr.setRequestHeader('Accept', 'application/ld+json');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    },
    [validateFile, onUpload],
  );

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset de l'input pour permettre de re-selectionner le meme fichier
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
            : 'border-secondary-300 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500'
        }`}
      >
        {/* Preview de l'image */}
        {preview ? (
          <img src={preview} alt="Apercu" className="mb-4 h-24 w-24 rounded-lg object-cover" />
        ) : (
          <svg
            className="mb-3 h-10 w-10 text-secondary-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        )}

        <p className="mb-1 text-sm text-secondary-600 dark:text-gray-400">{label}</p>
        <p className="text-xs text-secondary-400 dark:text-gray-500">
          Glissez-deposez ou cliquez pour parcourir
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Barre de progression */}
      {isUploading && progress !== null && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-secondary-500 dark:text-gray-400">
            <span>Upload en cours...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-primary-600 transition-all dark:bg-primary-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && <p className="mt-2 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
}
