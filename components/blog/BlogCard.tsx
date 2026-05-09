'use client';

import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date;
  featuredImage?: string;
  readingTime?: number;
}

/**
 * BlogCard Component
 * 
 * Displays a blog post card in listing views with:
 * - Title
 * - Excerpt
 * - Publication date
 * - Featured image
 * - Hover effects
 * - Responsive design
 * 
 * Requirement: 8.6
 */
export default function BlogCard({
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage,
  readingTime,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
        {/* Featured Image */}
        {featuredImage && (
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <OptimizedImage
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-3">
            {excerpt}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={publishedAt.toISOString()}>
              {publishedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            
            {readingTime && (
              <>
                <span aria-hidden="true">•</span>
                <span>{readingTime} min read</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
