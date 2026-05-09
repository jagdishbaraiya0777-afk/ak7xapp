import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for search engine directives
 * Requirement 5.10: Configure robots.txt to allow all crawlers and reference sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ak7-apk.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
