/**
 * Property-based tests for SEO tag completeness
 * Feature: seo-content-strategy
 * Property 16: SEO Tag Completeness
 * Validates: Requirements 5.5, 5.7, 5.9
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MetaTagGenerator } from '@/lib/seo/meta-tags';
import type { BlogContent } from '@/types/blog';

describe('Property 16: SEO Tag Completeness', () => {
  const generator = new MetaTagGenerator();

  it('should generate valid Article schema markup for any blog', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.string({ minLength: 5, maxLength: 30 }),
        (title, slug, keywords, description, author) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug,
              description,
              keywords,
              author,
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 2500,
              readingTime: 10,
            },
            content: 'Test content',
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const schema = generator.generateSchemaMarkup(blog);

          // Should have required schema.org fields
          expect(schema['@context']).toBe('https://schema.org');
          expect(schema['@type']).toBe('Article');
          expect(schema.headline).toBeTruthy();
          expect(schema.description).toBeTruthy();
          expect(schema.author).toBeTruthy();
          expect(schema.author['@type']).toBe('Person');
          expect(schema.author.name).toBeTruthy();
          expect(schema.datePublished).toBeTruthy();
          expect(schema.dateModified).toBeTruthy();
          expect(schema.image).toBeTruthy();
          expect(Array.isArray(schema.image)).toBe(true);
          expect(schema.image.length).toBeGreaterThan(0);
          expect(schema.publisher).toBeTruthy();
          expect(schema.publisher['@type']).toBe('Organization');
          expect(schema.publisher.name).toBeTruthy();
          expect(schema.publisher.logo).toBeTruthy();
          expect(schema.publisher.logo['@type']).toBe('ImageObject');
          expect(schema.publisher.logo.url).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate complete Open Graph tags for any blog', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 50, maxLength: 200 }),
        (title, slug, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug,
              description,
              keywords,
              author: 'Test Author',
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 2500,
              readingTime: 10,
            },
            content: 'Test content',
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const metaTags = generator.generateMetaTags(blog);

          // Should have all required Open Graph tags
          expect(metaTags.ogTitle).toBeTruthy();
          expect(metaTags.ogTitle.length).toBeGreaterThan(0);
          expect(metaTags.ogDescription).toBeTruthy();
          expect(metaTags.ogDescription.length).toBeGreaterThan(0);
          expect(metaTags.ogImage).toBeTruthy();
          expect(metaTags.ogImage.length).toBeGreaterThan(0);
          expect(metaTags.ogType).toBe('article');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate complete Twitter Card tags for any blog', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 50, maxLength: 200 }),
        (title, slug, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug,
              description,
              keywords,
              author: 'Test Author',
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 2500,
              readingTime: 10,
            },
            content: 'Test content',
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const metaTags = generator.generateMetaTags(blog);

          // Should have all required Twitter Card tags
          expect(metaTags.twitterCard).toBe('summary_large_image');
          expect(metaTags.twitterTitle).toBeTruthy();
          expect(metaTags.twitterTitle.length).toBeGreaterThan(0);
          expect(metaTags.twitterDescription).toBeTruthy();
          expect(metaTags.twitterDescription.length).toBeGreaterThan(0);
          expect(metaTags.twitterImage).toBeTruthy();
          expect(metaTags.twitterImage.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate valid canonical URL for any blog', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 5, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting'), { minLength: 1, maxLength: 2 }),
        (title, slug, keywords) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug,
              description: 'Test description',
              keywords,
              author: 'Test Author',
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 2500,
              readingTime: 10,
            },
            content: 'Test content',
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const metaTags = generator.generateMetaTags(blog);

          // Should have valid canonical URL
          expect(metaTags.canonical).toBeTruthy();
          expect(metaTags.canonical).toMatch(/^https?:\/\//);
          expect(metaTags.canonical).toContain(slug);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate completeness of all SEO tags', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (hasOgTitle, hasOgDesc, hasTwitterTitle, hasTwitterDesc) => {
          const metaTags = {
            title: 'Complete Guide to AK7 App - Gaming Platform'.padEnd(55, ' '),
            description: 'Discover everything about AK7 app including features, betting strategies, and download instructions for the best gaming experience'.padEnd(155, ' '),
            keywords: ['ak7 app', 'ak7 betting'],
            canonical: 'https://ak7-apk.com/blog/test',
            ogTitle: hasOgTitle ? 'Test Title' : '',
            ogDescription: hasOgDesc ? 'Test Description' : '',
            ogImage: 'https://ak7-apk.com/image.jpg',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            twitterTitle: hasTwitterTitle ? 'Test Title' : '',
            twitterDescription: hasTwitterDesc ? 'Test Description' : '',
            twitterImage: 'https://ak7-apk.com/image.jpg',
          };

          const validation = generator.validateMetaTags(metaTags);

          // Should flag missing Open Graph tags
          if (!hasOgTitle) {
            expect(validation.errors.some(e => e.includes('Open Graph title'))).toBe(true);
          }
          if (!hasOgDesc) {
            expect(validation.errors.some(e => e.includes('Open Graph description'))).toBe(true);
          }

          // Should flag missing Twitter Card tags
          if (!hasTwitterTitle) {
            expect(validation.errors.some(e => e.includes('Twitter Card title'))).toBe(true);
          }
          if (!hasTwitterDesc) {
            expect(validation.errors.some(e => e.includes('Twitter Card description'))).toBe(true);
          }

          // Should be valid only if all tags are present
          if (hasOgTitle && hasOgDesc && hasTwitterTitle && hasTwitterDesc) {
            expect(validation.valid).toBe(true);
          } else {
            expect(validation.valid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should extract and include images from content in schema markup', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('ss1.webp', 'ss2.webp', 'ss3.webp', 'screenshot.png'), { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        (images, slug) => {
          // Create content with image references
          const imageMarkdown = images.map(img => `![Screenshot](/${img})`).join('\n\n');
          const content = `
# Test Blog

${imageMarkdown}

Some content here.
          `.trim();

          const blog: BlogContent = {
            metadata: {
              title: 'Test Blog',
              slug,
              description: 'Test description',
              keywords: ['ak7 app'],
              author: 'Test Author',
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 2500,
              readingTime: 10,
            },
            content,
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const schema = generator.generateSchemaMarkup(blog);

          // Should include images from content
          expect(schema.image.length).toBeGreaterThan(0);
          
          // All images should be absolute URLs
          schema.image.forEach(img => {
            expect(img).toMatch(/^https?:\/\//);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include featured image in schema markup when present', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/ss1.webp', '/ss2.webp', '/ss3.webp', 'https://example.com/image.jpg'),
        fc.string({ minLength: 10, maxLength: 50 }),
        (featuredImage, slug) => {
          const blog: BlogContent = {
            metadata: {
              title: 'Test Blog',
              slug,
              description: 'Test description',
              keywords: ['ak7 app'],
              author: 'Test Author',
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              featuredImage,
              wordCount: 2500,
              readingTime: 10,
            },
            content: 'Test content',
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };

          const schema = generator.generateSchemaMarkup(blog);

          // Should include featured image
          expect(schema.image.length).toBeGreaterThan(0);
          
          // Featured image should be in the list
          const expectedUrl = featuredImage.startsWith('http')
            ? featuredImage
            : `https://ak7-apk.com${featuredImage}`;
          
          expect(schema.image).toContain(expectedUrl);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('SEO Tag Completeness - Example-based tests', () => {
  const generator = new MetaTagGenerator();

  it('should generate complete SEO tags for a typical blog', () => {
    const blog: BlogContent = {
      metadata: {
        title: 'Complete Guide to AK7 App',
        slug: 'ak7-app-guide',
        description: 'Discover everything about AK7 app including features, betting strategies, and download instructions',
        keywords: ['ak7 app', 'ak7 betting', 'ak7 download'],
        author: 'AK7 Gaming Expert',
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        category: 'primary',
        featuredImage: '/ss1.webp',
        wordCount: 2650,
        readingTime: 13,
      },
      content: `
# Complete Guide to AK7 App

![AK7 App Screenshot](/ss1.webp)

Content here.

![Features](/ss2.webp)
      `,
      excerpt: 'Complete guide',
      tableOfContents: [],
      backlinks: [],
    };

    const metaTags = generator.generateMetaTags(blog);
    const schema = generator.generateSchemaMarkup(blog);
    const validation = generator.validateMetaTags(metaTags);

    // Should have all required meta tags
    expect(metaTags.title).toBeTruthy();
    expect(metaTags.description).toBeTruthy();
    expect(metaTags.canonical).toBe('https://ak7-apk.com/blog/ak7-app-guide');

    // Should have complete Open Graph tags
    expect(metaTags.ogTitle).toBeTruthy();
    expect(metaTags.ogDescription).toBeTruthy();
    expect(metaTags.ogImage).toBeTruthy();
    expect(metaTags.ogType).toBe('article');

    // Should have complete Twitter Card tags
    expect(metaTags.twitterCard).toBe('summary_large_image');
    expect(metaTags.twitterTitle).toBeTruthy();
    expect(metaTags.twitterDescription).toBeTruthy();
    expect(metaTags.twitterImage).toBeTruthy();

    // Should have valid schema markup
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Article');
    expect(schema.image.length).toBeGreaterThanOrEqual(2); // Featured + content images

    // Should pass validation
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it('should handle cross-platform blogs correctly', () => {
    const blog: BlogContent = {
      metadata: {
        title: 'GoPlay11 vs AK7: Complete Comparison',
        slug: 'goplay11-vs-ak7',
        description: 'Compare GoPlay11 and AK7 gaming platforms to find the best option for your gaming needs',
        keywords: ['goplay11', 'ak7 app', 'gaming comparison'],
        author: 'Gaming Expert',
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: 'cross-platform',
        targetPlatform: 'goplay11',
        wordCount: 1800,
        readingTime: 9,
      },
      content: 'Comparison content',
      excerpt: 'Platform comparison',
      tableOfContents: [],
      backlinks: [],
    };

    const metaTags = generator.generateMetaTags(blog);
    const schema = generator.generateSchemaMarkup(blog);

    // Should generate complete tags for cross-platform blogs
    expect(metaTags.title).toBeTruthy();
    expect(metaTags.description).toBeTruthy();
    expect(metaTags.canonical).toContain('goplay11-vs-ak7');
    expect(schema['@type']).toBe('Article');
  });

  it('should validate and report missing tags', () => {
    const incompleteTags = {
      title: 'Short title',
      description: 'Short desc',
      keywords: ['ak7 app'],
      canonical: 'https://ak7-apk.com/blog/test',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      twitterCard: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
    };

    const validation = generator.validateMetaTags(incompleteTags);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);

    // Should report all missing tags
    expect(validation.errors.some(e => e.includes('Open Graph'))).toBe(true);
    expect(validation.errors.some(e => e.includes('Twitter'))).toBe(true);
  });
});
