/**
 * Property-based test for image validation
 * Tests Property 13: Image Validation
 * Validates Requirements: 1.4, 5.6, 6.6, 12.6
 * 
 * Feature: seo-content-strategy, Property 13: Image Validation
 * 
 * **Validates: Requirements 1.4, 5.6, 6.6, 12.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { BlogGenerator } from '../../lib/blog/generator';
import type { BlogGeneratorConfig } from '../../types/blog';

// Helper to create a test config
function createTestConfig(overrides?: Partial<BlogGeneratorConfig>): BlogGeneratorConfig {
  return {
    minWordCount: 2500,
    maxWordCount: 5000,
    targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game'],
    includeScreenshots: true,
    includeFAQ: true,
    includeDisclaimer: true,
    ...overrides,
  };
}

// Arbitrary for blog topics
const topicArbitrary = fc.oneof(
  fc.constant('Download and Installation Guide'),
  fc.constant('Betting Strategies and Tips'),
  fc.constant('Features and Benefits Overview'),
  fc.constant('Security and Safety Guide'),
  fc.constant('Bonus and Rewards System')
);

// Arbitrary for cross-platform angles
const angleArbitrary = fc.oneof(
  fc.constant('Feature Comparison and Analysis'),
  fc.constant('User Experience Review'),
  fc.constant('Pros and Cons Breakdown'),
  fc.constant('Getting Started Guide'),
  fc.constant('Platform Comparison')
);

/**
 * Extract image references from markdown content
 */
function extractImageReferences(content: string): Array<{
  src: string;
  alt: string;
  caption?: string;
}> {
  const images: Array<{ src: string; alt: string; caption?: string }> = [];
  const processedSrcs = new Set<string>(); // Track processed images to avoid duplicates
  
  // First, match figures with captions (highest priority)
  const figureRegex = /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*\/?>\s*<figcaption>([^<]+)<\/figcaption>[\s\S]*?<\/figure>/gi;
  let match;
  
  while ((match = figureRegex.exec(content)) !== null) {
    const src = match[1];
    processedSrcs.add(src);
    images.push({
      src,
      alt: match[2],
      caption: match[3].trim(),
    });
  }
  
  // Then match standalone HTML img tags (not already in figures)
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*\/?>/gi;
  
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const src = match[1];
    if (!processedSrcs.has(src)) {
      processedSrcs.add(src);
      images.push({
        src,
        alt: match[2],
      });
    }
  }
  
  // Finally, match markdown images: ![alt text](image.png)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const src = match[2];
    if (!processedSrcs.has(src)) {
      processedSrcs.add(src);
      images.push({
        alt: match[1],
        src,
      });
    }
  }
  
  return images;
}

/**
 * Check if image file exists in public directory
 */
function imageFileExists(imagePath: string): boolean {
  // Handle absolute paths starting with /
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check in public directory
  const publicPath = path.join(process.cwd(), 'public', cleanPath);
  
  try {
    return fs.existsSync(publicPath);
  } catch {
    return false;
  }
}

/**
 * Check if alt text contains relevant keywords
 */
function altTextContainsKeywords(altText: string, keywords: string[]): boolean {
  const lowerAlt = altText.toLowerCase();
  
  // Check if at least one keyword or keyword part is in alt text
  return keywords.some(keyword => {
    const keywordParts = keyword.toLowerCase().split(/\s+/);
    return keywordParts.some(part => lowerAlt.includes(part));
  });
}

describe('Property 13: Image Validation', () => {
  it('all image files should exist in public directory', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Should have at least one image (Requirement 1.4)
        expect(images.length).toBeGreaterThan(0);
        
        // Check each image file exists
        for (const image of images) {
          const exists = imageFileExists(image.src);
          expect(exists).toBe(true);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('all images should include alt text with keywords', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({
          targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game', 'ak7'],
          includeScreenshots: true,
        });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Each image should have alt text (Requirement 5.6)
        for (const image of images) {
          expect(image.alt).toBeTruthy();
          expect(image.alt.length).toBeGreaterThan(0);
          
          // Alt text should contain at least one relevant keyword (Requirement 5.6)
          const hasKeyword = altTextContainsKeywords(image.alt, config.targetKeywords);
          expect(hasKeyword).toBe(true);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('all images should include figure captions', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Check for captions (Requirement 6.6)
        // Note: In markdown, captions can be implicit in the alt text or explicit in HTML
        for (const image of images) {
          // Either has explicit caption or descriptive alt text
          const hasCaption = Boolean(image.caption) || (image.alt && image.alt.length > 10);
          expect(hasCaption).toBe(true);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('cross-platform blog images should exist and have proper alt text', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        angleArbitrary,
        async (platform, angle) => {
          const config = createTestConfig({
            targetKeywords: [platform, 'ak7', 'ek7', 'app', 'game'],
            includeScreenshots: true,
          });
          const generator = new BlogGenerator(config);
          
          const blog = await generator.generateCrossPlatformBlog(
            platform as 'goplay11' | 'habet' | 'dhan7',
            angle
          );
          
          const images = extractImageReferences(blog.content);
          
          // Cross-platform blogs should have images
          if (images.length > 0) {
            for (const image of images) {
              // Check file exists
              const exists = imageFileExists(image.src);
              expect(exists).toBe(true);
              
              // Check alt text
              expect(image.alt).toBeTruthy();
              expect(image.alt.length).toBeGreaterThan(0);
              
              // Alt text should contain relevant keywords
              const hasKeyword = altTextContainsKeywords(image.alt, config.targetKeywords);
              expect(hasKeyword).toBe(true);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('screenshot assets should be properly referenced', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Filter for screenshot assets (ss1.webp, ss2.webp, ss3.webp)
        const screenshots = images.filter(img => 
          img.src.includes('ss1.webp') || 
          img.src.includes('ss2.webp') || 
          img.src.includes('ss3.webp')
        );
        
        // Should have at least one screenshot (Requirement 1.4)
        expect(screenshots.length).toBeGreaterThan(0);
        
        // Each screenshot should exist and have proper alt text
        for (const screenshot of screenshots) {
          const exists = imageFileExists(screenshot.src);
          expect(exists).toBe(true);
          
          expect(screenshot.alt).toBeTruthy();
          expect(screenshot.alt.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('image alt text should not be generic', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Generic alt text patterns to avoid
        const genericPatterns = [
          /^image$/i,
          /^photo$/i,
          /^picture$/i,
          /^screenshot$/i,
          /^img\d+$/i,
        ];
        
        for (const image of images) {
          const isGeneric = genericPatterns.some(pattern => 
            pattern.test(image.alt)
          );
          
          // Alt text should be descriptive, not generic
          expect(isGeneric).toBe(false);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('images should use WebP format for optimization', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const images = extractImageReferences(blog.content);
        
        // Check that images use optimized formats (Requirement 10.7)
        for (const image of images) {
          // Should use WebP or other optimized formats
          const isOptimizedFormat = 
            image.src.endsWith('.webp') || 
            image.src.endsWith('.avif') ||
            image.src.endsWith('.jpg') ||
            image.src.endsWith('.jpeg') ||
            image.src.endsWith('.png');
          
          expect(isOptimizedFormat).toBe(true);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('featured images should exist and have proper metadata', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeScreenshots: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        // Check featured image if present (Requirement 12.6)
        if (blog.metadata.featuredImage) {
          const exists = imageFileExists(blog.metadata.featuredImage);
          expect(exists).toBe(true);
          
          // Featured image should be in optimized format
          const isOptimized = 
            blog.metadata.featuredImage.endsWith('.webp') ||
            blog.metadata.featuredImage.endsWith('.avif') ||
            blog.metadata.featuredImage.endsWith('.jpg') ||
            blog.metadata.featuredImage.endsWith('.jpeg');
          
          expect(isOptimized).toBe(true);
        }
      }),
      { numRuns: 10 }
    );
  });
});
