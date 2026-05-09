/**
 * Property-based tests for meta tag generation
 * Feature: seo-content-strategy
 * Property 14: Meta Tag Length Constraints
 * Property 15: Meta Tag Keyword Presence
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MetaTagGenerator } from '@/lib/seo/meta-tags';
import type { BlogContent } from '@/types/blog';

describe('Property 14: Meta Tag Length Constraints', () => {
  const generator = new MetaTagGenerator();

  it('should generate meta titles between 50 and 60 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 50, maxLength: 200 }),
        (title, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug: 'test-slug',
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

          // Meta title should be between 50 and 60 characters
          expect(metaTags.title.length).toBeGreaterThanOrEqual(50);
          expect(metaTags.title.length).toBeLessThanOrEqual(60);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate meta descriptions between 150 and 160 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 50, maxLength: 200 }),
        (title, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug: 'test-slug',
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

          // Meta description should be between 150 and 160 characters
          expect(metaTags.description.length).toBeGreaterThanOrEqual(150);
          expect(metaTags.description.length).toBeLessThanOrEqual(160);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate meta tag lengths correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 40, max: 70 }),
        fc.integer({ min: 140, max: 170 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting'), { minLength: 1, maxLength: 2 }),
        (titleLength, descLength, keywords) => {
          const title = 'a'.repeat(titleLength);
          const description = 'b'.repeat(descLength);

          const metaTags = {
            title,
            description,
            keywords,
            canonical: 'https://ak7-apk.com/blog/test',
            ogTitle: title,
            ogDescription: description,
            ogImage: 'https://ak7-apk.com/image.jpg',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            twitterTitle: title,
            twitterDescription: description,
            twitterImage: 'https://ak7-apk.com/image.jpg',
          };

          const validation = generator.validateMetaTags(metaTags);

          // Should flag errors if lengths are out of bounds
          if (titleLength < 50 || titleLength > 60) {
            expect(validation.errors.some(e => e.includes('title'))).toBe(true);
          }

          if (descLength < 150 || descLength > 160) {
            expect(validation.errors.some(e => e.includes('description'))).toBe(true);
          }

          // Should be valid only if both are in range
          const titleValid = titleLength >= 50 && titleLength <= 60;
          const descValid = descLength >= 150 && descLength <= 160;
          const keywordInTitle = keywords.some(kw => title.includes(kw));
          const keywordInDesc = keywords.some(kw => description.includes(kw));

          if (titleValid && descValid && keywordInTitle && keywordInDesc) {
            expect(validation.valid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 15: Meta Tag Keyword Presence', () => {
  const generator = new MetaTagGenerator();

  it('should ensure meta title contains at least one target keyword', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game', 'ak7 download'), { minLength: 1, maxLength: 4 }),
        fc.string({ minLength: 50, maxLength: 150 }),
        (title, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug: 'test-slug',
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

          // Meta title should contain at least one keyword
          const titleLower = metaTags.title.toLowerCase();
          const hasKeyword = keywords.some(kw => titleLower.includes(kw.toLowerCase()));

          expect(hasKeyword).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ensure meta description contains at least one target keyword', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game', 'ak7 download'), { minLength: 1, maxLength: 4 }),
        fc.string({ minLength: 50, maxLength: 150 }),
        (title, keywords, description) => {
          const blog: BlogContent = {
            metadata: {
              title,
              slug: 'test-slug',
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

          // Meta description should contain at least one keyword
          const descLower = metaTags.description.toLowerCase();
          const hasKeyword = keywords.some(kw => descLower.includes(kw.toLowerCase()));

          expect(hasKeyword).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate keyword presence in meta tags', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting'), { minLength: 1, maxLength: 2 }),
        (includeInTitle, includeInDesc, keywords) => {
          const keyword = keywords[0];
          const title = includeInTitle 
            ? `Complete Guide to ${keyword}`.padEnd(55, ' ')
            : 'Complete Guide to Gaming'.padEnd(55, ' ');
          const description = includeInDesc
            ? `Learn about ${keyword} features and strategies`.padEnd(155, ' ')
            : 'Learn about gaming features and strategies'.padEnd(155, ' ');

          const metaTags = {
            title,
            description,
            keywords,
            canonical: 'https://ak7-apk.com/blog/test',
            ogTitle: title,
            ogDescription: description,
            ogImage: 'https://ak7-apk.com/image.jpg',
            ogType: 'article',
            twitterCard: 'summary_large_image',
            twitterTitle: title,
            twitterDescription: description,
            twitterImage: 'https://ak7-apk.com/image.jpg',
          };

          const validation = generator.validateMetaTags(metaTags);

          // Should flag error if keyword not in title
          if (!includeInTitle) {
            expect(validation.errors.some(e => e.includes('title') && e.includes('keyword'))).toBe(true);
          }

          // Should flag error if keyword not in description
          if (!includeInDesc) {
            expect(validation.errors.some(e => e.includes('description') && e.includes('keyword'))).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve keywords when optimizing meta tags', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('ak7 app', 'ak7 betting', 'ek7 game'), { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 20, maxLength: 40 }),
        (keywords, titleBase) => {
          const blog: BlogContent = {
            metadata: {
              title: `${titleBase} ${keywords[0]}`,
              slug: 'test-slug',
              description: `A comprehensive guide about ${keywords[0]} and related topics`,
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

          // All original keywords should still be present in the keywords array
          keywords.forEach(kw => {
            expect(metaTags.keywords).toContain(kw);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Meta Tag Generation - Example-based tests', () => {
  const generator = new MetaTagGenerator();

  it('should generate complete meta tags for a blog', () => {
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
      content: 'Test content',
      excerpt: 'Test excerpt',
      tableOfContents: [],
      backlinks: [],
    };

    const metaTags = generator.generateMetaTags(blog);

    // Should have all required fields
    expect(metaTags.title).toBeTruthy();
    expect(metaTags.description).toBeTruthy();
    expect(metaTags.keywords).toEqual(blog.metadata.keywords);
    expect(metaTags.canonical).toBe('https://ak7-apk.com/blog/ak7-app-guide');

    // Should have Open Graph tags
    expect(metaTags.ogTitle).toBeTruthy();
    expect(metaTags.ogDescription).toBeTruthy();
    expect(metaTags.ogImage).toBeTruthy();
    expect(metaTags.ogType).toBe('article');

    // Should have Twitter Card tags
    expect(metaTags.twitterCard).toBe('summary_large_image');
    expect(metaTags.twitterTitle).toBeTruthy();
    expect(metaTags.twitterDescription).toBeTruthy();
    expect(metaTags.twitterImage).toBeTruthy();

    // Should meet length constraints
    expect(metaTags.title.length).toBeGreaterThanOrEqual(50);
    expect(metaTags.title.length).toBeLessThanOrEqual(60);
    expect(metaTags.description.length).toBeGreaterThanOrEqual(150);
    expect(metaTags.description.length).toBeLessThanOrEqual(160);
  });

  it('should generate schema markup with all required fields', () => {
    const blog: BlogContent = {
      metadata: {
        title: 'AK7 Betting Strategies',
        slug: 'ak7-betting-strategies',
        description: 'Learn the best betting strategies for AK7 app',
        keywords: ['ak7 betting', 'ak7 app'],
        author: 'Gaming Expert',
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
        category: 'primary',
        featuredImage: '/ss1.webp',
        wordCount: 2500,
        readingTime: 12,
      },
      content: `
# AK7 Betting Strategies

![AK7 App Screenshot](/ss1.webp)

Content here.

![Features](/ss2.webp)
      `,
      excerpt: 'Betting strategies',
      tableOfContents: [],
      backlinks: [],
    };

    const schema = generator.generateSchemaMarkup(blog);

    // Should have required schema.org fields
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe(blog.metadata.title);
    expect(schema.description).toBe(blog.metadata.description);
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBe(blog.metadata.author);
    expect(schema.datePublished).toBeTruthy();
    expect(schema.dateModified).toBeTruthy();
    expect(schema.image.length).toBeGreaterThan(0);
    expect(schema.publisher['@type']).toBe('Organization');
    expect(schema.publisher.name).toBeTruthy();
    expect(schema.publisher.logo['@type']).toBe('ImageObject');
    expect(schema.publisher.logo.url).toBeTruthy();
  });

  it('should validate meta tags and return errors', () => {
    const invalidTags = {
      title: 'Short', // Too short
      description: 'Also short', // Too short
      keywords: ['ak7 app'],
      canonical: 'https://ak7-apk.com/blog/test',
      ogTitle: 'Test',
      ogDescription: 'Test',
      ogImage: 'https://ak7-apk.com/image.jpg',
      ogType: 'article',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Test',
      twitterDescription: 'Test',
      twitterImage: 'https://ak7-apk.com/image.jpg',
    };

    const validation = generator.validateMetaTags(invalidTags);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some(e => e.includes('title'))).toBe(true);
    expect(validation.errors.some(e => e.includes('description'))).toBe(true);
  });

  it('should handle blogs without featured images', () => {
    const blog: BlogContent = {
      metadata: {
        title: 'Test Blog',
        slug: 'test-blog',
        description: 'Test description',
        keywords: ['ak7 app'],
        author: 'Test Author',
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: 'primary',
        wordCount: 2500,
        readingTime: 10,
      },
      content: 'Content without images',
      excerpt: 'Test excerpt',
      tableOfContents: [],
      backlinks: [],
    };

    const metaTags = generator.generateMetaTags(blog);
    const schema = generator.generateSchemaMarkup(blog);

    // Should use default image
    expect(metaTags.ogImage).toContain('ss1.webp');
    expect(metaTags.twitterImage).toContain('ss1.webp');
    expect(schema.image.length).toBeGreaterThan(0);
  });
});
