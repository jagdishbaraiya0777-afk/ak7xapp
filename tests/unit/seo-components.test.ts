/**
 * Unit tests for SEO components
 * Tests meta tag generation, schema markup structure, and JSON-LD format
 * Requirements: 5.5, 5.7
 */

import { describe, it, expect } from 'vitest';
import type { BlogContent } from '@/types/blog';
import {
  convertToNextMetadata,
  generateBlogMetadata,
  generateBlogListingMetadata,
  validateMetadata,
} from '@/components/seo/MetaTags';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateOrganizationSchema,
  validateSchema,
} from '@/components/seo/StructuredData';
import type { MetaTags } from '@/types/seo';

describe('MetaTags Component', () => {
  describe('convertToNextMetadata', () => {
    it('should convert MetaTags to Next.js Metadata format', () => {
      const metaTags: MetaTags = {
        title: 'Test Blog Post - Ak7xapp',
        description: 'This is a test blog post description that is exactly 150 characters long to meet the SEO requirements for meta descriptions in our system.',
        keywords: ['ak7 app', 'test', 'blog'],
        canonical: 'https://ak7-apk.com/blog/test-post',
        ogTitle: 'Test Blog Post',
        ogDescription: 'Test description',
        ogImage: 'https://ak7-apk.com/test.webp',
        ogType: 'article',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Test Blog Post',
        twitterDescription: 'Test description',
        twitterImage: 'https://ak7-apk.com/test.webp',
      };

      const metadata = convertToNextMetadata(metaTags);

      expect(metadata.title).toBe('Test Blog Post - Ak7xapp');
      expect(metadata.description).toBe(metaTags.description);
      expect(metadata.keywords).toEqual(['ak7 app', 'test', 'blog']);
      expect(metadata.alternates?.canonical).toBe('https://ak7-apk.com/blog/test-post');
      expect(metadata.openGraph?.title).toBe('Test Blog Post');
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });
  });

  describe('generateBlogMetadata', () => {
    it('should generate complete metadata for a blog post', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Complete Guide to AK7 App',
          slug: 'ak7-app-guide',
          description: 'Discover everything about AK7 app including download instructions, features, betting strategies, and how to earn Rs.200 bonus. Complete guide for 2024.',
          keywords: ['ak7 app', 'ak7 betting', 'ak7 download'],
          author: 'AK7 Gaming Expert',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          featuredImage: '/ss1.webp',
          wordCount: 2650,
          readingTime: 13,
        },
        content: '# Complete Guide\n\nContent here...',
        excerpt: 'Discover everything about AK7 app...',
        tableOfContents: [],
        backlinks: [],
      };

      const metadata = generateBlogMetadata(blog, 'https://ak7-apk.com');

      expect(metadata.title).toBe('Complete Guide to AK7 App');
      expect(metadata.description).toContain('AK7 app');
      expect(metadata.keywords).toEqual(['ak7 app', 'ak7 betting', 'ak7 download']);
      expect(metadata.authors).toEqual([{ name: 'AK7 Gaming Expert' }]);
      expect(metadata.alternates?.canonical).toBe('https://ak7-apk.com/blog/ak7-app-guide');
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-15T00:00:00.000Z');
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should use default image if featured image is not provided', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Test Post',
          slug: 'test-post',
          description: 'Test description that is long enough to meet the minimum character requirement for SEO meta descriptions which is 150 characters minimum.',
          keywords: ['test'],
          author: 'Test Author',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          wordCount: 2000,
          readingTime: 10,
        },
        content: 'Content',
        excerpt: 'Excerpt',
        tableOfContents: [],
        backlinks: [],
      };

      const metadata = generateBlogMetadata(blog, 'https://ak7-apk.com');

      expect(metadata.openGraph?.images).toEqual([
        {
          url: 'https://ak7-apk.com/ss1.webp',
          alt: 'Test Post',
          width: 1200,
          height: 630,
        },
      ]);
    });

    it('should convert relative image paths to absolute URLs', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Test Post',
          slug: 'test-post',
          description: 'Test description that is long enough to meet the minimum character requirement for SEO meta descriptions which is 150 characters minimum.',
          keywords: ['test'],
          author: 'Test Author',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          featuredImage: '/images/test.webp',
          wordCount: 2000,
          readingTime: 10,
        },
        content: 'Content',
        excerpt: 'Excerpt',
        tableOfContents: [],
        backlinks: [],
      };

      const metadata = generateBlogMetadata(blog, 'https://ak7-apk.com');

      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: 'https://ak7-apk.com/images/test.webp',
      });
    });
  });

  describe('generateBlogListingMetadata', () => {
    it('should generate metadata for blog listing page', () => {
      const metadata = generateBlogListingMetadata('https://ak7-apk.com');

      expect(metadata.title).toContain('Blog');
      expect(metadata.description).toBeTruthy();
      expect(metadata.keywords).toContain('ak7 app');
      expect(metadata.alternates?.canonical).toBe('https://ak7-apk.com/blog');
      expect(metadata.openGraph?.type).toBe('website');
    });
  });

  describe('validateMetadata', () => {
    it('should pass validation for valid metadata', () => {
      const metadata = {
        title: 'This is a valid title that is between 50 and 60 chars',
        description: 'This is a valid description that is between 150 and 160 characters long to meet the SEO requirements for meta descriptions in our content system.',
        keywords: ['ak7 app', 'test'],
        alternates: {
          canonical: 'https://ak7-apk.com/blog/test',
        },
        openGraph: {
          title: 'Test',
          description: 'Test description',
          images: [{ url: 'https://ak7-apk.com/test.webp' }],
        },
        twitter: {
          card: 'summary_large_image' as const,
          title: 'Test',
          description: 'Test description',
          images: ['https://ak7-apk.com/test.webp'],
        },
      };

      const result = validateMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect title that is too short', () => {
      const metadata = {
        title: 'Short title',
        description: 'This is a valid description that is between 150 and 160 characters long to meet the SEO requirements for meta descriptions in our content system.',
      };

      const result = validateMetadata(metadata);

      expect(result.warnings.some(w => w.includes('Title is short'))).toBe(true);
    });

    it('should detect title that is too long', () => {
      const metadata = {
        title: 'This is a very long title that exceeds the maximum character limit of 60 characters',
        description: 'This is a valid description that is between 150 and 160 characters long to meet the SEO requirements for meta descriptions in our content system.',
      };

      const result = validateMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Title is too long'))).toBe(true);
    });

    it('should detect description that is too short', () => {
      const metadata = {
        title: 'This is a valid title that is between 50 and 60 chars',
        description: 'Short description',
      };

      const result = validateMetadata(metadata);

      expect(result.warnings.some(w => w.includes('Description is short'))).toBe(true);
    });

    it('should detect description that is too long', () => {
      const metadata = {
        title: 'This is a valid title that is between 50 and 60 chars',
        description: 'This is a very long description that exceeds the maximum character limit of 160 characters for meta descriptions which is important for SEO optimization and search engine results.',
      };

      const result = validateMetadata(metadata);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Description is too long'))).toBe(true);
    });

    it('should detect missing Open Graph tags', () => {
      const metadata = {
        title: 'This is a valid title that is between 50 and 60 chars',
        description: 'This is a valid description that is between 150 and 160 characters long to meet the SEO requirements for meta descriptions in our content system.',
      };

      const result = validateMetadata(metadata);

      expect(result.warnings).toContain('Open Graph tags are missing');
    });

    it('should detect missing Twitter Card tags', () => {
      const metadata = {
        title: 'This is a valid title that is between 50 and 60 chars',
        description: 'This is a valid description that is between 150 and 160 characters long to meet the SEO requirements for meta descriptions in our content system.',
      };

      const result = validateMetadata(metadata);

      expect(result.warnings).toContain('Twitter Card tags are missing');
    });
  });
});

describe('StructuredData Component', () => {
  describe('generateArticleSchema', () => {
    it('should generate valid Article schema markup', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Complete Guide to AK7 App',
          slug: 'ak7-app-guide',
          description: 'Discover everything about AK7 app',
          keywords: ['ak7 app', 'ak7 betting'],
          author: 'AK7 Gaming Expert',
          publishedAt: new Date('2024-01-15T10:00:00.000Z'),
          updatedAt: new Date('2024-01-15T10:00:00.000Z'),
          category: 'primary',
          featuredImage: '/ss1.webp',
          wordCount: 2650,
          readingTime: 13,
        },
        content: '# Complete Guide\n\n![Screenshot](/ss2.webp)\n\nContent here...',
        excerpt: 'Discover everything about AK7 app...',
        tableOfContents: [],
        backlinks: [],
      };

      const schema = generateArticleSchema(
        blog,
        'https://ak7-apk.com',
        'Ak7xapp',
        'https://ak7-apk.com/logo.png'
      );

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Complete Guide to AK7 App');
      expect(schema.description).toBe('Discover everything about AK7 app');
      expect(schema.author['@type']).toBe('Person');
      expect(schema.author.name).toBe('AK7 Gaming Expert');
      expect(schema.datePublished).toBe('2024-01-15T10:00:00.000Z');
      expect(schema.dateModified).toBe('2024-01-15T10:00:00.000Z');
      expect(schema.publisher['@type']).toBe('Organization');
      expect(schema.publisher.name).toBe('Ak7xapp');
      expect(schema.publisher.logo['@type']).toBe('ImageObject');
      expect(schema.publisher.logo.url).toBe('https://ak7-apk.com/logo.png');
    });

    it('should extract images from markdown content', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Test Post',
          slug: 'test-post',
          description: 'Test description',
          keywords: ['test'],
          author: 'Test Author',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          wordCount: 2000,
          readingTime: 10,
        },
        content: '# Test\n\n![Image 1](/img1.webp)\n\n![Image 2](/img2.webp)',
        excerpt: 'Test',
        tableOfContents: [],
        backlinks: [],
      };

      const schema = generateArticleSchema(blog, 'https://ak7-apk.com');

      expect(schema.image).toContain('https://ak7-apk.com/img1.webp');
      expect(schema.image).toContain('https://ak7-apk.com/img2.webp');
    });

    it('should include featured image in schema', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Test Post',
          slug: 'test-post',
          description: 'Test description',
          keywords: ['test'],
          author: 'Test Author',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          featuredImage: '/featured.webp',
          wordCount: 2000,
          readingTime: 10,
        },
        content: '# Test',
        excerpt: 'Test',
        tableOfContents: [],
        backlinks: [],
      };

      const schema = generateArticleSchema(blog, 'https://ak7-apk.com');

      expect(schema.image[0]).toBe('https://ak7-apk.com/featured.webp');
    });

    it('should use default image if no images found', () => {
      const blog: BlogContent = {
        metadata: {
          title: 'Test Post',
          slug: 'test-post',
          description: 'Test description',
          keywords: ['test'],
          author: 'Test Author',
          publishedAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          category: 'primary',
          wordCount: 2000,
          readingTime: 10,
        },
        content: '# Test\n\nNo images here',
        excerpt: 'Test',
        tableOfContents: [],
        backlinks: [],
      };

      const schema = generateArticleSchema(blog, 'https://ak7-apk.com');

      expect(schema.image).toEqual(['https://ak7-apk.com/ss1.webp']);
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate valid BreadcrumbList schema', () => {
      const schema = generateBreadcrumbSchema(
        'Complete Guide to AK7 App',
        'ak7-app-guide',
        'https://ak7-apk.com'
      );

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[1].name).toBe('Blog');
      expect(schema.itemListElement[2].name).toBe('Complete Guide to AK7 App');
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate valid WebSite schema', () => {
      const schema = generateWebSiteSchema('https://ak7-apk.com', 'Ak7xapp');

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Ak7xapp');
      expect(schema.url).toBe('https://ak7-apk.com');
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });
  });

  describe('generateOrganizationSchema', () => {
    it('should generate valid Organization schema', () => {
      const schema = generateOrganizationSchema(
        'https://ak7-apk.com',
        'Ak7xapp',
        'https://ak7-apk.com/logo.png'
      );

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Ak7xapp');
      expect(schema.url).toBe('https://ak7-apk.com');
      expect(schema.logo).toBe('https://ak7-apk.com/logo.png');
    });
  });

  describe('validateSchema', () => {
    it('should pass validation for valid schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        description: 'Test description',
        author: {
          '@type': 'Person',
          name: 'Test Author',
        },
        datePublished: '2024-01-15T10:00:00.000Z',
        dateModified: '2024-01-15T10:00:00.000Z',
        image: ['https://ak7-apk.com/test.webp'],
        publisher: {
          '@type': 'Organization',
          name: 'Ak7xapp',
          logo: {
            '@type': 'ImageObject',
            url: 'https://ak7-apk.com/logo.png',
          },
        },
      };

      const result = validateSchema(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing @context', () => {
      const schema = {
        '@type': 'Article',
        headline: 'Test',
        description: 'Test',
        author: { '@type': 'Person', name: 'Test' },
        datePublished: '2024-01-15T10:00:00.000Z',
        dateModified: '2024-01-15T10:00:00.000Z',
        image: ['test.jpg'],
        publisher: {
          '@type': 'Organization',
          name: 'Test',
          logo: { '@type': 'ImageObject', url: 'logo.png' },
        },
      } as any;

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing @context field');
    });

    it('should detect invalid @context value', () => {
      const schema = {
        '@context': 'https://example.com',
        '@type': 'Article',
        headline: 'Test',
        description: 'Test',
        author: { '@type': 'Person', name: 'Test' },
        datePublished: '2024-01-15T10:00:00.000Z',
        dateModified: '2024-01-15T10:00:00.000Z',
        image: ['test.jpg'],
        publisher: {
          '@type': 'Organization',
          name: 'Test',
          logo: { '@type': 'ImageObject', url: 'logo.png' },
        },
      };

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Invalid @context value (must be https://schema.org)'
      );
    });

    it('should detect missing required fields', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
      } as any;

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or empty headline field');
      expect(result.errors).toContain('Missing or empty description field');
      expect(result.errors).toContain('Missing author field');
      expect(result.errors).toContain('Missing datePublished field');
      expect(result.errors).toContain('Missing dateModified field');
      expect(result.errors).toContain('Missing or empty image array');
      expect(result.errors).toContain('Missing publisher field');
    });

    it('should detect invalid date format', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test',
        description: 'Test',
        author: { '@type': 'Person', name: 'Test' },
        datePublished: '2024-01-15',
        dateModified: '2024-01-15',
        image: ['test.jpg'],
        publisher: {
          '@type': 'Organization',
          name: 'Test',
          logo: { '@type': 'ImageObject', url: 'logo.png' },
        },
      };

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Invalid datePublished format (must be ISO 8601)'
      );
      expect(result.errors).toContain(
        'Invalid dateModified format (must be ISO 8601)'
      );
    });

    it('should detect missing author details', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test',
        description: 'Test',
        author: { '@type': 'Person' },
        datePublished: '2024-01-15T10:00:00.000Z',
        dateModified: '2024-01-15T10:00:00.000Z',
        image: ['test.jpg'],
        publisher: {
          '@type': 'Organization',
          name: 'Test',
          logo: { '@type': 'ImageObject', url: 'logo.png' },
        },
      } as any;

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or empty author name');
    });

    it('should detect missing publisher details', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test',
        description: 'Test',
        author: { '@type': 'Person', name: 'Test' },
        datePublished: '2024-01-15T10:00:00.000Z',
        dateModified: '2024-01-15T10:00:00.000Z',
        image: ['test.jpg'],
        publisher: {
          '@type': 'Organization',
          logo: { '@type': 'ImageObject' },
        },
      } as any;

      const result = validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing or empty publisher name');
      expect(result.errors).toContain('Missing or empty publisher logo URL');
    });
  });
});
