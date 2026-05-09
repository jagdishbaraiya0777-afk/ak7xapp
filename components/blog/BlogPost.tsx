'use client';

import { BlogContent } from '@/types/blog';
import TableOfContents from './TableOfContents';
import ShareButtons from './ShareButtons';
import RelatedPosts from './RelatedPosts';
import OptimizedImage from './OptimizedImage';
import { useEffect, useState } from 'react';

interface BlogPostProps {
  blog: BlogContent;
  relatedPosts?: Array<{
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    publishedAt: Date;
  }>;
}

/**
 * BlogPost Component
 * 
 * Renders a complete blog post with:
 * - Markdown-to-HTML content rendering
 * - Table of contents for long articles
 * - Metadata display (author, date, reading time)
 * - Share buttons
 * - Related posts
 * 
 * Requirements: 6.2, 6.8
 */
export default function BlogPost({ blog, relatedPosts = [] }: BlogPostProps) {
  const { metadata, content, tableOfContents } = blog;
  const [processedContent, setProcessedContent] = useState(content);

  // Process content to add IDs to headings for TOC navigation
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Add IDs to headings for anchor links
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      heading.id = id;
    });

    setProcessedContent(doc.body.innerHTML);
  }, [content]);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {metadata.title}
        </h1>
        
        {/* Metadata Display - Requirement 6.8 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <time dateTime={metadata.publishedAt.toISOString()}>
            {metadata.publishedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          
          <span aria-hidden="true">•</span>
          
          <span>{metadata.readingTime} min read</span>
          
          <span aria-hidden="true">•</span>
          
          <span>By {metadata.author}</span>
        </div>

        {/* Featured Image */}
        {metadata.featuredImage && (
          <div className="mt-6">
            <OptimizedImage
              src={metadata.featuredImage}
              alt={metadata.title}
              width={1200}
              height={630}
              priority
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}
      </header>

      {/* Table of Contents - Requirement 6.2 */}
      {tableOfContents.length > 0 && (
        <div className="mb-8">
          <TableOfContents items={tableOfContents} />
        </div>
      )}

      {/* Article Content - Markdown-to-HTML rendering */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Share Buttons */}
      <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
        <ShareButtons
          url={`/blog/${metadata.slug}`}
          title={metadata.title}
          description={metadata.description}
        />
      </div>

      {/* Article Footer */}
      <footer className="mt-8">
        <div className="flex flex-wrap gap-2">
          {metadata.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {keyword}
            </span>
          ))}
        </div>
        
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Last updated: {metadata.updatedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </footer>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-12 dark:border-gray-700">
          <RelatedPosts posts={relatedPosts} />
        </div>
      )}
    </article>
  );
}
