// Property-based tests for metadata completeness
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ContentManagementSystem } from '@/lib/blog/parser';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Property 25: Metadata Completeness
 * 
 * For any generated blog, the frontmatter metadata SHALL include all required fields:
 * title, slug, description, keywords array, author, publishedAt date, updatedAt date,
 * category, wordCount, and readingTime.
 * 
 * Validates: Requirements 6.8
 */

describe('Property 25: Metadata Completeness', () => {
  const cms = new ContentManagementSystem({
    contentDir: path.join(process.cwd(), 'content', 'blogs'),
    baseUrl: 'https://ak7xapp.com',
  });

  // Arbitrary for generating valid blog metadata
  const blogMetadata = fc.record({
    title: fc.string({ minLength: 10, maxLength: 60 })
      .filter(s => s.trim().length >= 10)
      .map(s => s.replace(/["\\]/g, '')), // Remove quotes and backslashes for YAML safety
    slug: fc.string({ minLength: 5, maxLength: 50 })
      .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
      .filter(s => s.length >= 3),
    description: fc.string({ minLength: 50, maxLength: 160 })
      .filter(s => s.trim().length >= 50)
      .map(s => s.replace(/["\\]/g, '')), // Remove quotes and backslashes for YAML safety
    keywords: fc.array(
      fc.string({ minLength: 3, maxLength: 20 })
        .filter(s => s.trim().length >= 3)
        .map(s => s.replace(/["\\]/g, '')), // Remove quotes and backslashes for YAML safety
      { minLength: 1, maxLength: 10 }
    ),
    author: fc.string({ minLength: 5, maxLength: 50 })
      .filter(s => s.trim().length >= 5)
      .map(s => s.replace(/["\\]/g, '')), // Remove quotes and backslashes for YAML safety
    publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    category: fc.constantFrom('primary', 'cross-platform'),
    targetPlatform: fc.option(fc.constantFrom('goplay11', 'habet', 'dhan7'), { nil: undefined }),
    featuredImage: fc.option(fc.constantFrom('/ss1.webp', '/ss2.webp', '/ss3.webp'), { nil: undefined }),
    wordCount: fc.integer({ min: 1000, max: 5000 }),
    readingTime: fc.integer({ min: 5, max: 25 }),
  });

  it('should extract all required metadata fields from frontmatter', () => {
    fc.assert(
      fc.property(
        blogMetadata,
        async (metadata) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          // Create frontmatter with all fields
          const frontmatter = `---
title: "${metadata.title}"
slug: "${metadata.slug}"
description: "${metadata.description}"
keywords: ${JSON.stringify(metadata.keywords)}
author: "${metadata.author}"
publishedAt: "${metadata.publishedAt.toISOString()}"
updatedAt: "${metadata.updatedAt.toISOString()}"
category: "${metadata.category}"
${metadata.targetPlatform ? `targetPlatform: "${metadata.targetPlatform}"` : ''}
${metadata.featuredImage ? `featuredImage: "${metadata.featuredImage}"` : ''}
wordCount: ${metadata.wordCount}
readingTime: ${metadata.readingTime}
---

# Test Content

This is test content for metadata validation.`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify all required fields are present
            expect(parsed.metadata.title).toBe(metadata.title);
            expect(parsed.metadata.slug).toBe(metadata.slug);
            expect(parsed.metadata.description).toBe(metadata.description);
            expect(parsed.metadata.keywords).toEqual(metadata.keywords);
            expect(parsed.metadata.author).toBe(metadata.author);
            expect(parsed.metadata.publishedAt.toISOString()).toBe(metadata.publishedAt.toISOString());
            expect(parsed.metadata.updatedAt.toISOString()).toBe(metadata.updatedAt.toISOString());
            expect(parsed.metadata.category).toBe(metadata.category);
            expect(parsed.metadata.wordCount).toBe(metadata.wordCount);
            expect(parsed.metadata.readingTime).toBe(metadata.readingTime);
            
            // Verify optional fields
            if (metadata.targetPlatform) {
              expect(parsed.metadata.targetPlatform).toBe(metadata.targetPlatform);
            }
            if (metadata.featuredImage) {
              expect(parsed.metadata.featuredImage).toBe(metadata.featuredImage);
            }
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should throw error when required metadata fields are missing', () => {
    const requiredFields = ['title', 'slug', 'description', 'keywords', 'author', 'publishedAt', 'category'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFields),
        blogMetadata,
        async (fieldToRemove, metadata) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          // Create frontmatter with one required field missing
          const fields: Record<string, any> = {
            title: metadata.title,
            slug: metadata.slug,
            description: metadata.description,
            keywords: metadata.keywords,
            author: metadata.author,
            publishedAt: metadata.publishedAt.toISOString(),
            category: metadata.category,
            wordCount: metadata.wordCount,
            readingTime: metadata.readingTime,
          };
          
          // Remove the selected field
          delete fields[fieldToRemove];
          
          const frontmatterLines = Object.entries(fields).map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${JSON.stringify(value)}`;
            }
            return `${key}: "${value}"`;
          });
          
          const frontmatter = `---
${frontmatterLines.join('\n')}
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            // Should throw error for missing required field
            await expect(cms.parseMarkdown(tempFile)).rejects.toThrow();
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle keywords as both array and string', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.array(fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3), { minLength: 1, maxLength: 5 }),
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3)
        ),
        async (keywords) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const keywordsValue = Array.isArray(keywords) 
            ? JSON.stringify(keywords)
            : `"${keywords}"`;
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description for metadata validation"
keywords: ${keywordsValue}
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Keywords should always be an array
            expect(Array.isArray(parsed.metadata.keywords)).toBe(true);
            
            if (Array.isArray(keywords)) {
              expect(parsed.metadata.keywords).toEqual(keywords);
            } else {
              expect(parsed.metadata.keywords).toEqual([keywords]);
            }
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should default updatedAt to publishedAt when not provided', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
        async (publishedAt) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description for metadata validation"
keywords: ["test"]
author: "Test Author"
publishedAt: "${publishedAt.toISOString()}"
category: "primary"
wordCount: 100
readingTime: 1
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // updatedAt should default to publishedAt
            expect(parsed.metadata.updatedAt.toISOString()).toBe(publishedAt.toISOString());
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate date fields are proper Date objects', () => {
    fc.assert(
      fc.property(
        blogMetadata,
        async (metadata) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "${metadata.title}"
slug: "${metadata.slug}"
description: "${metadata.description}"
keywords: ${JSON.stringify(metadata.keywords)}
author: "${metadata.author}"
publishedAt: "${metadata.publishedAt.toISOString()}"
updatedAt: "${metadata.updatedAt.toISOString()}"
category: "${metadata.category}"
wordCount: ${metadata.wordCount}
readingTime: ${metadata.readingTime}
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify dates are Date objects
            expect(parsed.metadata.publishedAt).toBeInstanceOf(Date);
            expect(parsed.metadata.updatedAt).toBeInstanceOf(Date);
            
            // Verify dates are valid
            expect(isNaN(parsed.metadata.publishedAt.getTime())).toBe(false);
            expect(isNaN(parsed.metadata.updatedAt.getTime())).toBe(false);
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate category is either primary or cross-platform', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('primary', 'cross-platform'),
        async (category) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description for metadata validation"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "${category}"
wordCount: 100
readingTime: 1
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify category is valid
            expect(['primary', 'cross-platform']).toContain(parsed.metadata.category);
            expect(parsed.metadata.category).toBe(category);
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should validate targetPlatform when category is cross-platform', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        async (platform) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description for metadata validation"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "cross-platform"
targetPlatform: "${platform}"
wordCount: 100
readingTime: 1
---

# Test Content`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify targetPlatform is valid
            expect(['goplay11', 'habet', 'dhan7']).toContain(parsed.metadata.targetPlatform);
            expect(parsed.metadata.targetPlatform).toBe(platform);
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
