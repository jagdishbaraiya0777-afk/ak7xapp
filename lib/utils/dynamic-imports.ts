'use client';

/**
 * Dynamic component loading utilities for code splitting and performance optimization
 * Enables lazy loading of non-critical components
 */

import dynamic from 'next/dynamic';
import { ComponentType, createElement } from 'react';

// Loading fallback component
const LoadingFallback = () =>
  createElement('div', {
    className: 'animate-pulse bg-gray-200 h-64 rounded-lg',
    'aria-label': 'Loading content',
  });

/**
 * Dynamically load ShareButtons component (non-critical)
 * Delays loading until needed
 */
export const DynamicShareButtons = dynamic(
  () => import('@/components/blog/ShareButtons'),
  {
    loading: LoadingFallback,
    ssr: false, // Client-side only
  }
);

/**
 * Dynamically load RelatedPosts component (non-critical)
 * Delays loading until needed
 */
export const DynamicRelatedPosts = dynamic(
  () => import('@/components/blog/RelatedPosts'),
  {
    loading: LoadingFallback,
    ssr: false, // Client-side only
  }
);

/**
 * Dynamically load TableOfContents component
 * Can be loaded on-demand for better performance
 */
export const DynamicTableOfContents = dynamic(
  () => import('@/components/blog/TableOfContents'),
  {
    loading: LoadingFallback,
    ssr: true, // Server-side render for SEO
  }
);

/**
 * Create a dynamic component with custom loading and error states
 */
export function createDynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    ssr?: boolean;
    loadingMessage?: string;
  }
) {
  return dynamic(importFn, {
    loading: () =>
      createElement(
        'div',
        {
          className: 'animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center',
          role: 'status',
          'aria-label': options?.loadingMessage || 'Loading content',
        },
        createElement('span', { className: 'text-gray-500' }, options?.loadingMessage || 'Loading...')
      ),
    ssr: options?.ssr ?? true,
  });
}
