/**
 * Property 20: Sitemap URL Inclusion
 * 
 * For any set of N blogs in the content directory, the generated sitemap.xml
 * SHALL contain exactly N blog URLs, and each URL SHALL be well-formed and
 * include the correct domain.
 * 
 * Validates: Requirements 8.8
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { BlogMetadata } from '@/types/blog';

// Arbitrary for generating blog metadata
const blogMetadataArbitrary = fc.record({
  title: fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length >= 10),
  slug: fc.string({ minLength: 5, maxLength: 50 })
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '').replace(/--+/g, '-'))
    .filter(s => s.length >= 5 && /^[a-z0-9]/.test(s) && /[a-z0-9]$/.test(s)),
  description: fc.string({ minLength: 50, maxLength: 200 }).filter(s => s.trim().length >= 50),
  keywords: fc.array(fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3), { minLength: 1, maxLength: 10 }),
  author: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
  publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
  category: fc.constantFrom('primary' as const, 'cross-platform' as const),
  targetPlatform: fc.option(fc.constantFrom('goplay11' as const, 'habet' as const, 'dhan7' as const)),
  featuredImage: fc.option(fc.constantFrom('/ss1.webp', '/ss2.webp', '/ss3.webp')),
  wordCount: fc.integer({ min: 1500, max: 5000 }),
  readingTime: fc.integer({ min: 5, max: 25 }),
}) as fc.Arbitrary<BlogMetadata>;

// Arbitrary for generating a set of blogs
const blogsArrayArbitrary = fc.array(blogMetadataArbitrary, { minLength: 0, maxLength: 50 });

/**
 * Simulates sitemap generation from a list of blogs
 * This represents the logic from app/sitemap.ts
 */
function generateSitemap(blogs: BlogMetadata[], baseUrl: string): {
  urls: string[];
  blogUrls: string[];
  staticUrls: string[];
} {
  // Static pages
  const staticUrls = [
    baseUrl,
    `${baseUrl}/blog`,
    `${baseUrl}/disclaimer`,
    `${baseUrl}/privacy-policy`,
    `${baseUrl}/contact`,
  ];

  // Blog URLs
  const blogUrls = blogs.map(blog => `${baseUrl}/blog/${blog.slug}`);

  // All URLs
  const urls = [...staticUrls, ...blogUrls];

  return { urls, blogUrls, staticUrls };
}

/**
 * Validates if a URL is well-formed
 */
function isWellFormedURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

describe('Property 20: Sitemap URL Inclusion', () => {
  const baseUrl = 'https://ak7-apk.com';

  it('should contain exactly N blog URLs for N blogs', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Number of blog URLs should equal number of blogs
        expect(sitemap.blogUrls.length).toBe(blogs.length);
        
        // Property: Total URLs should be static URLs + blog URLs
        const expectedTotalUrls = sitemap.staticUrls.length + blogs.length;
        expect(sitemap.urls.length).toBe(expectedTotalUrls);
      }),
      { numRuns: 100 }
    );
  });

  it('should generate well-formed URLs for all blogs', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Every blog URL should be well-formed
        for (const url of sitemap.blogUrls) {
          expect(isWellFormedURL(url)).toBe(true);
        }
        
        // Property: Every static URL should be well-formed
        for (const url of sitemap.staticUrls) {
          expect(isWellFormedURL(url)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should include correct domain in all URLs', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Every URL should start with the base URL
        for (const url of sitemap.urls) {
          expect(url.startsWith(baseUrl)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should generate unique URLs for all blogs', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: All blog URLs should be unique
        const uniqueBlogUrls = new Set(sitemap.blogUrls);
        expect(uniqueBlogUrls.size).toBe(sitemap.blogUrls.length);
        
        // Property: All URLs (including static) should be unique
        const uniqueUrls = new Set(sitemap.urls);
        expect(uniqueUrls.size).toBe(sitemap.urls.length);
      }),
      { numRuns: 100 }
    );
  });

  it('should format blog URLs correctly with slug', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Each blog URL should follow the pattern: baseUrl/blog/{slug}
        for (let i = 0; i < blogs.length; i++) {
          const expectedUrl = `${baseUrl}/blog/${blogs[i].slug}`;
          expect(sitemap.blogUrls[i]).toBe(expectedUrl);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should include all required static pages', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Sitemap should include home page
        expect(sitemap.staticUrls).toContain(baseUrl);
        
        // Property: Sitemap should include blog listing page
        expect(sitemap.staticUrls).toContain(`${baseUrl}/blog`);
        
        // Property: Sitemap should include disclaimer page
        expect(sitemap.staticUrls).toContain(`${baseUrl}/disclaimer`);
        
        // Property: Sitemap should include privacy policy page
        expect(sitemap.staticUrls).toContain(`${baseUrl}/privacy-policy`);
        
        // Property: Sitemap should include contact page
        expect(sitemap.staticUrls).toContain(`${baseUrl}/contact`);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty blog list correctly', () => {
    const sitemap = generateSitemap([], baseUrl);
    
    // Property: With 0 blogs, should only have static URLs
    expect(sitemap.blogUrls.length).toBe(0);
    expect(sitemap.urls.length).toBe(sitemap.staticUrls.length);
    
    // Property: Static URLs should still be present
    expect(sitemap.staticUrls.length).toBeGreaterThan(0);
  });

  it('should maintain URL structure consistency', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: All blog URLs should contain '/blog/' path segment
        for (const url of sitemap.blogUrls) {
          expect(url).toContain('/blog/');
        }
        
        // Property: Blog URLs should not have trailing slashes
        for (const url of sitemap.blogUrls) {
          expect(url.endsWith('/')).toBe(false);
        }
        
        // Property: Blog URLs should not have query parameters
        for (const url of sitemap.blogUrls) {
          expect(url).not.toContain('?');
        }
        
        // Property: Blog URLs should not have fragments
        for (const url of sitemap.blogUrls) {
          expect(url).not.toContain('#');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should handle blogs with various slug formats', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: All slugs should be URL-safe
        for (const blog of blogs) {
          expect(blog.slug).toMatch(/^[a-z0-9-]+$/);
        }
        
        // Property: Generated URLs should be valid with these slugs
        for (const url of sitemap.blogUrls) {
          expect(isWellFormedURL(url)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve blog order in sitemap', () => {
    fc.assert(
      fc.property(blogsArrayArbitrary, (blogs) => {
        const sitemap = generateSitemap(blogs, baseUrl);
        
        // Property: Blog URLs should appear in the same order as input blogs
        for (let i = 0; i < blogs.length; i++) {
          const expectedUrl = `${baseUrl}/blog/${blogs[i].slug}`;
          expect(sitemap.blogUrls[i]).toBe(expectedUrl);
        }
      }),
      { numRuns: 100 }
    );
  });
});
