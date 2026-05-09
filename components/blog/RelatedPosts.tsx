'use client';

import BlogCard from './BlogCard';

interface RelatedPost {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: Date;
  readingTime?: number;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

/**
 * RelatedPosts Component
 * 
 * Displays related blog posts using:
 * - Category and keyword matching for relevance
 * - Maximum of 3 related posts
 * - BlogCard components for consistent styling
 * 
 * Requirement: 8.5
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  // Limit to 3 related posts
  const displayPosts = posts.slice(0, 3);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Related Articles
      </h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayPosts.map((post) => (
          <BlogCard
            key={post.slug}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            publishedAt={post.publishedAt}
            featuredImage={post.featuredImage}
            readingTime={post.readingTime}
          />
        ))}
      </div>
    </section>
  );
}
