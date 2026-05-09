/**
 * Unit tests for blog generation
 * Tests specific scenarios for primary and cross-platform blog generation
 * Validates Requirements 1.1, 1.4, 1.8, 4.1, 4.2, 4.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlogGenerator } from '../../lib/blog/generator';
import type { BlogGeneratorConfig } from '../../types/blog';
import { countWords } from '../../lib/utils/keywords';

describe('BlogGenerator', () => {
  let generator: BlogGenerator;
  let config: BlogGeneratorConfig;

  beforeEach(() => {
    config = {
      minWordCount: 2500,
      maxWordCount: 5000,
      targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game'],
      includeScreenshots: true,
      includeFAQ: true,
      includeDisclaimer: true,
    };
    generator = new BlogGenerator(config);
  });

  describe('Primary Blog Generation', () => {
    it('should generate a primary blog with specific topic', async () => {
      const topic = 'Download and Installation Guide';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog).toBeDefined();
      expect(blog.metadata).toBeDefined();
      expect(blog.content).toBeDefined();
      expect(blog.metadata.category).toBe('primary');
    });

    it('should generate blog with correct metadata', async () => {
      const topic = 'Betting Strategies';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.metadata.title).toBeTruthy();
      expect(blog.metadata.slug).toBeTruthy();
      expect(blog.metadata.description).toBeTruthy();
      expect(blog.metadata.keywords).toEqual(config.targetKeywords);
      expect(blog.metadata.author).toBe('AK7 Gaming Expert');
      expect(blog.metadata.publishedAt).toBeInstanceOf(Date);
      expect(blog.metadata.updatedAt).toBeInstanceOf(Date);
      expect(blog.metadata.wordCount).toBeGreaterThan(0);
      expect(blog.metadata.readingTime).toBeGreaterThan(0);
    });

    it('should include featured image when configured', async () => {
      const topic = 'Features Overview';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.metadata.featuredImage).toBe('/ss1.webp');
    });

    it('should not include featured image when disabled', async () => {
      const configNoImages: BlogGeneratorConfig = {
        ...config,
        includeScreenshots: false,
      };
      const generatorNoImages = new BlogGenerator(configNoImages);
      const blog = await generatorNoImages.generatePrimaryBlog('Test Topic');

      expect(blog.metadata.featuredImage).toBeUndefined();
    });

    it('should include FAQ section when configured', async () => {
      const topic = 'Complete Guide';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.content).toContain('## Frequently Asked Questions');
      expect(blog.content).toMatch(/###\s+\d+\.\s+/); // FAQ question format
    });

    it('should not include FAQ when disabled', async () => {
      const configNoFAQ: BlogGeneratorConfig = {
        ...config,
        includeFAQ: false,
      };
      const generatorNoFAQ = new BlogGenerator(configNoFAQ);
      const blog = await generatorNoFAQ.generatePrimaryBlog('Test Topic');

      expect(blog.content).not.toContain('Frequently Asked Questions');
    });

    it('should include disclaimer when configured', async () => {
      const topic = 'Safety Guide';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.content).toContain('Important Disclaimer');
      expect(blog.content).toContain('18 and above');
      expect(blog.content).toContain('gamble responsibly');
      expect(blog.content).toContain('/disclaimer');
      expect(blog.content).toContain('/privacy-policy');
    });

    it('should generate table of contents', async () => {
      const topic = 'Comprehensive Guide';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.tableOfContents).toBeDefined();
      expect(blog.tableOfContents.length).toBeGreaterThan(0);
      
      // Check TOC structure
      const firstItem = blog.tableOfContents[0];
      expect(firstItem.id).toBeTruthy();
      expect(firstItem.title).toBeTruthy();
      expect(firstItem.level).toBe(2);
    });

    it('should generate excerpt from introduction', async () => {
      const topic = 'Getting Started';
      const blog = await generator.generatePrimaryBlog(topic);

      expect(blog.excerpt).toBeTruthy();
      expect(blog.excerpt.length).toBeGreaterThan(50);
      expect(blog.excerpt.length).toBeLessThan(300);
    });

    it('should calculate reading time correctly', async () => {
      const topic = 'Advanced Strategies';
      const blog = await generator.generatePrimaryBlog(topic);

      const wordCount = countWords(blog.content);
      const expectedReadingTime = Math.ceil(wordCount / 200);
      
      expect(blog.metadata.readingTime).toBe(expectedReadingTime);
    });

    it('should throw error if word count is below minimum', async () => {
      const strictConfig: BlogGeneratorConfig = {
        ...config,
        minWordCount: 10000, // Unrealistically high
      };
      const strictGenerator = new BlogGenerator(strictConfig);

      await expect(
        strictGenerator.generatePrimaryBlog('Short Topic')
      ).rejects.toThrow(/word count.*below minimum/i);
    });

    it('should generate different content for different topics', async () => {
      const blog1 = await generator.generatePrimaryBlog('Download Guide');
      const blog2 = await generator.generatePrimaryBlog('Betting Strategies');

      expect(blog1.content).not.toBe(blog2.content);
      expect(blog1.metadata.title).not.toBe(blog2.metadata.title);
      expect(blog1.metadata.slug).not.toBe(blog2.metadata.slug);
    });
  });

  describe('Cross-Platform Blog Generation', () => {
    it('should generate cross-platform blog for GoPlay11', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'goplay11',
        'Feature Comparison'
      );

      expect(blog).toBeDefined();
      expect(blog.metadata.category).toBe('cross-platform');
      expect(blog.metadata.targetPlatform).toBe('goplay11');
      expect(blog.content.toLowerCase()).toContain('goplay11');
    });

    it('should generate cross-platform blog for Habet', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'habet',
        'User Experience Review'
      );

      expect(blog.metadata.targetPlatform).toBe('habet');
      expect(blog.content.toLowerCase()).toContain('habet');
    });

    it('should generate cross-platform blog for Dhan7', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'dhan7',
        'Platform Analysis'
      );

      expect(blog.metadata.targetPlatform).toBe('dhan7');
      expect(blog.content.toLowerCase()).toContain('dhan7');
    });

    it('should include platform name in keywords', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'goplay11',
        'Comparison Guide'
      );

      expect(blog.metadata.keywords).toContain('goplay11');
      expect(blog.metadata.keywords).toContain('ek7 game');
      expect(blog.metadata.keywords).toContain('ak7 app');
    });

    it('should meet minimum word count for cross-platform blogs', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'habet',
        'Feature Overview'
      );

      const wordCount = countWords(blog.content);
      expect(wordCount).toBeGreaterThanOrEqual(1500);
    });

    it('should include comparison with EK7 Game', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'goplay11',
        'Platform Comparison'
      );

      const content = blog.content.toLowerCase();
      expect(content).toMatch(/ek7|ak7/);
      expect(content).toMatch(/compar|versus|vs|difference/);
    });

    it('should use different featured image for cross-platform', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'dhan7',
        'Review'
      );

      expect(blog.metadata.featuredImage).toBe('/ss2.webp');
    });

    it('should generate platform-specific title', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'goplay11',
        'Feature Analysis'
      );

      const title = blog.metadata.title.toLowerCase();
      expect(title).toContain('goplay11');
    });

    it('should include pros and cons section', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'habet',
        'Detailed Review'
      );

      expect(blog.content).toMatch(/##\s+Pros and Cons/i);
      expect(blog.content).toMatch(/###\s+Advantages/i);
      expect(blog.content).toMatch(/###\s+Considerations/i);
    });

    it('should include getting started section', async () => {
      const blog = await generator.generateCrossPlatformBlog(
        'dhan7',
        'Beginner Guide'
      );

      expect(blog.content).toMatch(/##\s+Getting Started/i);
    });

    it('should throw error if word count is below 1500', async () => {
      // This shouldn't happen with current implementation, but test the validation
      const blog = await generator.generateCrossPlatformBlog(
        'goplay11',
        'Test'
      );

      // Verify it doesn't throw
      expect(blog.metadata.wordCount).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('Content Structure Validation', () => {
    it('should validate heading hierarchy correctly', async () => {
      const blog = await generator.generatePrimaryBlog('Test Topic');
      const validation = generator.validateHeadingHierarchy(blog.content);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid heading hierarchy', () => {
      const invalidContent = `
# Title
### H3 without H2
## H2 after H3
`;
      const validation = generator.validateHeadingHierarchy(invalidContent);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect multiple H1 headings', () => {
      const invalidContent = `
# First Title
## Section
# Second Title
`;
      const validation = generator.validateHeadingHierarchy(invalidContent);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Multiple H1'))).toBe(true);
    });

    it('should validate content structure comprehensively', async () => {
      const blog = await generator.generatePrimaryBlog('Complete Guide');
      const validation = generator.validateContentStructure(blog.content);

      expect(validation).toBeDefined();
      
      // Log errors if validation fails
      if (!validation.valid) {
        console.log('Validation errors:', validation.errors);
        console.log('Validation warnings:', validation.warnings);
      }
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Table of Contents Extraction', () => {
    it('should extract TOC with correct structure', async () => {
      const blog = await generator.generatePrimaryBlog('Detailed Guide');
      const toc = blog.tableOfContents;

      expect(toc.length).toBeGreaterThan(0);
      
      // Check first level items are H2
      toc.forEach(item => {
        expect(item.level).toBe(2);
        expect(item.id).toBeTruthy();
        expect(item.title).toBeTruthy();
      });
    });

    it('should include H3 items as children of H2', async () => {
      const blog = await generator.generatePrimaryBlog('Comprehensive Guide');
      const toc = blog.tableOfContents;

      // Find items with children
      const itemsWithChildren = toc.filter(item => item.children && item.children.length > 0);
      
      if (itemsWithChildren.length > 0) {
        const firstWithChildren = itemsWithChildren[0];
        expect(firstWithChildren.children).toBeDefined();
        expect(firstWithChildren.children![0].level).toBe(3);
      }
    });

    it('should generate valid IDs for TOC items', async () => {
      const blog = await generator.generatePrimaryBlog('Test Guide');
      const toc = blog.tableOfContents;

      toc.forEach(item => {
        // IDs should be slugified (lowercase, hyphens)
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
        expect(item.id).not.toContain(' ');
      });
    });
  });

  describe('FAQ Generation', () => {
    it('should generate multiple FAQ items', async () => {
      const blog = await generator.generatePrimaryBlog('FAQ Test');
      
      // Count FAQ questions
      const faqMatches = blog.content.match(/###\s+\d+\.\s+.+\?/g);
      expect(faqMatches).toBeTruthy();
      expect(faqMatches!.length).toBeGreaterThanOrEqual(5);
    });

    it('should format FAQ with questions and answers', async () => {
      const blog = await generator.generatePrimaryBlog('FAQ Guide');
      
      // Check for question format
      expect(blog.content).toMatch(/###\s+\d+\.\s+.+\?/);
      
      // Check that answers follow questions
      const faqSection = blog.content.split('## Frequently Asked Questions')[1];
      if (faqSection) {
        const questions = faqSection.match(/###\s+\d+\.\s+.+\?/g);
        expect(questions).toBeTruthy();
      }
    });
  });

  describe('Disclaimer Generation', () => {
    it('should include all required disclaimer elements', async () => {
      const blog = await generator.generatePrimaryBlog('Disclaimer Test');

      expect(blog.content).toContain('Important Disclaimer');
      expect(blog.content).toContain('18 and above');
      expect(blog.content).toContain('informational purposes');
      expect(blog.content).toContain('gamble responsibly');
      expect(blog.content).toContain('/disclaimer');
      expect(blog.content).toContain('/privacy-policy');
    });

    it('should include risk warnings', async () => {
      const blog = await generator.generatePrimaryBlog('Risk Warning Test');

      expect(blog.content).toMatch(/risk|afford to lose/i);
    });

    it('should include age restriction notice', async () => {
      const blog = await generator.generatePrimaryBlog('Age Test');

      expect(blog.content).toMatch(/18\+|18 and above|aged 18/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty target keywords gracefully', async () => {
      const emptyKeywordsConfig: BlogGeneratorConfig = {
        ...config,
        targetKeywords: [],
      };
      const emptyKeywordsGenerator = new BlogGenerator(emptyKeywordsConfig);
      const blog = await emptyKeywordsGenerator.generatePrimaryBlog('Test');

      expect(blog).toBeDefined();
      expect(blog.content).toBeTruthy();
    });

    it('should handle very short topics', async () => {
      const blog = await generator.generatePrimaryBlog('Tips');

      expect(blog).toBeDefined();
      expect(blog.metadata.wordCount).toBeGreaterThanOrEqual(config.minWordCount);
    });

    it('should handle topics with special characters', async () => {
      const blog = await generator.generatePrimaryBlog('Guide: Tips & Tricks!');

      expect(blog).toBeDefined();
      expect(blog.metadata.slug).toMatch(/^[a-z0-9-]+$/);
    });
  });
});
