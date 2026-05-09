import { MetadataRoute } from 'next';
import { ContentManagementSystem } from '@/lib/blog/parser';
import path from 'path';

/**
 * Dynamic sitemap generation for Next.js
 * Requirement 8.8: Generate sitemap.xml including all blog URLs
 * Includes all blog posts and static pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ak7-apk.com';

  // Initialize Content Management System
  const cms = new ContentManagementSystem({
    contentDir: path.join(process.cwd(), 'content', 'blogs'),
    baseUrl,
  });

  // Get all blog posts
  const blogs = await cms.getAllBlogs();

  // Generate blog post URLs
  const blogUrls: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Combine all URLs
  return [...staticPages, ...blogUrls];
}
