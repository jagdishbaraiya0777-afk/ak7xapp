import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { ContentManagementSystem } from '@/lib/blog/parser';
import path from 'path';

// Initialize Content Management System
const cms = new ContentManagementSystem({
  contentDir: path.join(process.cwd(), 'content', 'blogs'),
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ak7-apk.com',
});

/**
 * Metadata for blog listing page
 */
export const metadata: Metadata = {
  title: 'Blog - AK7 App | Gaming Tips, Strategies & Updates',
  description: 'Explore comprehensive guides, betting strategies, and the latest updates about AK7 app, EK7 game, and related gaming platforms.',
  keywords: ['ak7 app', 'ak7 betting', 'ek7 game', 'gaming blog', 'betting strategies'],
  openGraph: {
    title: 'Blog - AK7 App',
    description: 'Explore comprehensive guides, betting strategies, and the latest updates about AK7 app and EK7 game.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - AK7 App',
    description: 'Explore comprehensive guides, betting strategies, and the latest updates about AK7 app and EK7 game.',
  },
};

/**
 * Blog listing page component
 * Requirement 8.5: Implement blog listing page showing all available blogs
 * Requirement 8.6: Display title, excerpt, publication date, and featured image
 */
export default async function BlogListingPage() {
  // Get all blogs sorted by publication date (newest first)
  const blogs = await cms.getAllBlogs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 text-white">
      <Header />
      <div className="mt-6" />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white/70 px-5 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          Back to home
        </Link>
        <Link
          href="https://cp7.me/BYPZW8/30i50zd"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Download APK
        </Link>
      </div>

      {/* Page Header */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Blog
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Discover expert guides, strategies, and insights about AK7 app, EK7 game, and the gaming world.
        </p>
      </header>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No blog posts available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.slug}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Featured Image */}
              {blog.featuredImage && (
                <Link href={`/blog/${blog.slug}`} className="block">
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
              )}

              {/* Card Content */}
              <div className="flex flex-1 flex-col p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {blog.category === 'primary' ? 'Featured' : 'Cross-Platform'}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {blog.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="mb-4 flex-1 text-gray-600 dark:text-gray-400">
                  {blog.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <time dateTime={blog.publishedAt.toISOString()}>
                    {blog.publishedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span>{blog.readingTime} min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Category Filters (Optional Enhancement) */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
        </p>
      </div>
    </div>
  );
}
