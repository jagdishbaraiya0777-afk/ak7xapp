'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  caption?: string;
  priority?: boolean;
}

/**
 * OptimizedImage Component
 * 
 * Wraps Next.js Image component with:
 * - Automatic optimization
 * - Lazy loading for below-fold images
 * - Figure captions
 * - Alt text (required)
 * - Error handling with fallback
 * 
 * Requirements: 1.4, 5.6, 10.2, 10.3, 10.7
 */
export default function OptimizedImage({
  src,
  alt,
  caption,
  priority = false,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle image load error
  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  // Handle image load success
  const handleLoad = () => {
    setLoading(false);
  };

  // If image failed to load, show fallback
  if (error) {
    return (
      <figure className={className}>
        <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 min-h-[200px] rounded">
          <div className="text-center p-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Image not available
            </p>
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // Render optimized image
  const imageElement = (
    <Image
      src={src}
      alt={alt}
      className={`${className} ${loading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      quality={75}
      {...props}
    />
  );

  // Wrap in figure if caption is provided
  if (caption) {
    return (
      <figure className="my-6">
        {imageElement}
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      </figure>
    );
  }

  return imageElement;
}
