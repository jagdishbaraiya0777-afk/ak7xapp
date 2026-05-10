import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentManagementSystem } from '@/lib/blog/parser';
import { BlogSchema } from '@/components/BlogSchema';
import path from 'path';

// Initialize Content Management System
const cms = new ContentManagementSystem({
  contentDir: path.join(process.cwd(), 'content', 'blogs'),
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ak7x.games',
});

/**
 * Generate static params for all blog posts
 * Requirement 8.3: Implement static site generation (SSG) for all blog pages
 * Requirement 8.7: Generate static paths for blog posts
 */
export async function generateStaticParams() {
  const slugs = await cms.generateStaticPaths();
  
  return slugs.map((slug) => ({
    slug,
  }));
}

/**
 * Generate metadata for blog post page
 * Requirement 8.2: Generate corresponding Next.js page route with proper metadata
 * Requirement 5.1-5.4: Generate SEO-optimized meta tags
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await cms.getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  const { metadata } = blog;
  const canonical = `https://ak7x.games/blog/${metadata.slug}`;
  const featuredImage = metadata.featuredImage
    ? metadata.featuredImage.startsWith('http')
      ? metadata.featuredImage
      : `https://ak7x.games${metadata.featuredImage}`
    : 'https://ak7x.games/ss1.webp';

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: metadata.author }],
    alternates: {
      canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      url: canonical,
      siteName: 'ak7x App',
      locale: 'en_IN',
      publishedTime: metadata.publishedAt.toISOString(),
      modifiedTime: metadata.updatedAt.toISOString(),
      authors: [metadata.author],
      images: [
        {
          url: featuredImage,
          alt: metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [featuredImage],
    },
  };
}

/**
 * Dynamic blog post page component
 * Requirement 8.2: Generate corresponding Next.js page route
 * Requirement 8.7: Implement dynamic routing for blog posts
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await cms.getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const { metadata, content, tableOfContents } = blog;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <BlogSchema
        title={metadata.title}
        description={metadata.description}
        slug={metadata.slug}
        datePublished={metadata.publishedAt.toISOString()}
        dateModified={metadata.updatedAt.toISOString()}
        authorName={metadata.author}
      />
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {metadata.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <time dateTime={metadata.publishedAt.toISOString()}>
            {metadata.publishedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          
          <span>•</span>
          
          <span>{metadata.readingTime} min read</span>
          
          <span>•</span>
          
          <span>By {metadata.author}</span>
        </div>

        {metadata.featuredImage && (
          <div className="mt-6">
            <img
              src={metadata.featuredImage}
              alt={metadata.title}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}
      </header>

      {/* Table of Contents */}
      {tableOfContents.length > 0 && (
        <nav className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            📋 Table of Contents
          </h2>
          <ul className="space-y-3">
            {tableOfContents.map((item) => (
              <li
                key={item.id}
                style={{ marginLeft: `${(item.level - 2) * 1.5}rem` }}
              >
                <a
                  href={`#${item.id}`}
                  className="text-blue-700 hover:text-blue-900 hover:font-semibold dark:text-blue-300 dark:hover:text-blue-100 transition-colors duration-200"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Article Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none [&_.internal-link]:text-blue-600 [&_.internal-link]:hover:text-blue-800 [&_.internal-link]:dark:text-blue-400 [&_.internal-link]:dark:hover:text-blue-300 [&_.external-link]:text-amber-600 [&_.external-link]:hover:text-amber-800 [&_.external-link]:dark:text-amber-400 [&_.external-link]:dark:hover:text-amber-300 [&_.external-link]:after:content-['_↗'] [&_.external-link]:after:ml-1 [&_.external-link]:after:text-xs"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Backlinks (rendered per-blog) */}
      {blog.backlinks && blog.backlinks.length > 0 && (
        <section className="mt-10 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">🔗 Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blog.backlinks.map((link: any) => {
              const isInternal = link.url.includes('ak7x.games') || link.url.startsWith('/');
              const isGoPlay11 = link.url.includes('goplay11');
              const isHabet = link.url.includes('habet');
              const isDhan7 = link.url.includes('dhan7');
              
              let platformIcon = '🔗';
              let platformColor = 'blue';
              
              if (isInternal) {
                platformIcon = '🏠';
                platformColor = 'blue';
              } else if (isGoPlay11) {
                platformIcon = '🎮';
                platformColor = 'purple';
              } else if (isHabet) {
                platformIcon = '🎲';
                platformColor = 'red';
              } else if (isDhan7) {
                platformIcon = '💰';
                platformColor = 'amber';
              }
              
              const colorClasses = {
                blue: 'border-blue-200 dark:border-blue-700',
                purple: 'border-purple-200 dark:border-purple-700',
                red: 'border-red-200 dark:border-red-700',
                amber: 'border-amber-200 dark:border-amber-700',
              };
              
              return (
                <div
                  key={link.id}
                  className={`rounded border ${colorClasses[platformColor as keyof typeof colorClasses]} bg-white dark:bg-gray-800 p-3 hover:shadow-md transition-shadow`}
                >
                  <a
                    href={link.url}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="mr-2">{platformIcon}</span>
                    {link.anchorText || link.url}
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Article Footer */}
      <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
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

      <aside aria-label="Related platforms" className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <p>
          <strong>Our platforms:</strong>{' '}
          <a href="https://ak7-apk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
            ak7 APK
          </a>{' '}
          ·{' '}
          <a href="https://goplay11-apk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
            GoPlay11 Fantasy App
          </a>{' '}
          ·{' '}
          <a href="https://habetapk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
            Habet App
          </a>{' '}
          ·{' '}
          <a href="https://www.dhan7.xyz/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
            Dhan7
          </a>
        </p>
      </aside>
    </article>
  );
}
