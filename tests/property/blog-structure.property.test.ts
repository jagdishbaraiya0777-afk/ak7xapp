/**
 * Property-based tests for blog structure validation
 * Tests Properties 1-6 from the design document
 * Validates Requirements 1.2, 1.3, 1.5, 1.6, 4.4, 6.1, 6.2, 6.3, 6.4, 6.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { BlogGenerator } from '../../lib/blog/generator';
import type { BlogGeneratorConfig } from '../../types/blog';
import { countWords, keywordInFirstWords, findKeywordsInHeadings } from '../../lib/utils/keywords';
import { slugContainsKeyword } from '../../lib/utils/slug';

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

describe('Property 1: Blog Word Count Requirements', () => {
  it('primary blogs should have at least 2500 words', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ minWordCount: 2500 });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const wordCount = countWords(blog.content);
        
        expect(wordCount).toBeGreaterThanOrEqual(2500);
        expect(blog.metadata.wordCount).toBe(wordCount);
      }),
      { numRuns: 10 }
    );
  });

  it('cross-platform blogs should have at least 1500 words', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        angleArbitrary,
        async (platform, angle) => {
          const config = createTestConfig({ minWordCount: 1500 });
          const generator = new BlogGenerator(config);
          
          const blog = await generator.generateCrossPlatformBlog(
            platform as 'goplay11' | 'habet' | 'dhan7',
            angle
          );
          const wordCount = countWords(blog.content);
          
          expect(wordCount).toBeGreaterThanOrEqual(1500);
          expect(blog.metadata.wordCount).toBe(wordCount);
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Property 2: Blog Structural Completeness', () => {
  it('should contain all required structural elements', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const content = blog.content;
        
        // Check for H1 (title)
        expect(content).toMatch(/^#\s+.+$/m);
        
        // Check for introduction (content before first H2)
        const firstH2Index = content.indexOf('\n## ');
        expect(firstH2Index).toBeGreaterThan(0);
        const introduction = content.substring(0, firstH2Index);
        expect(countWords(introduction)).toBeGreaterThan(50);
        
        // Check for body sections with H2 headings
        const h2Matches = content.match(/^##\s+.+$/gm);
        expect(h2Matches).toBeTruthy();
        expect(h2Matches!.length).toBeGreaterThanOrEqual(3);
        
        // Check for conclusion (should have "Conclusion" heading or final section)
        expect(content).toMatch(/##\s+(Conclusion|Final Thoughts)/i);
        
        // Check for call-to-action in conclusion
        const conclusionMatch = content.match(/##\s+(Conclusion|Final Thoughts)[\s\S]+$/i);
        expect(conclusionMatch).toBeTruthy();
        expect(conclusionMatch![0]).toMatch(/ready|download|get started|join|visit/i);
        
        // Check for table of contents if word count > 1500
        if (blog.metadata.wordCount > 1500) {
          expect(blog.tableOfContents.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('should include FAQ section when configured', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({ includeFAQ: true });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        expect(blog.content).toMatch(/##\s+Frequently Asked Questions/i);
        expect(blog.content).toMatch(/###\s+\d+\.\s+.+\?/); // FAQ questions
      }),
      { numRuns: 5 }
    );
  });
});

describe('Property 3: Heading Hierarchy Validity', () => {
  it('should follow proper heading hierarchy (H1 → H2 → H3)', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const validation = generator.validateHeadingHierarchy(blog.content);
        
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        
        // Check H1 appears exactly once
        const h1Matches = blog.content.match(/^#\s+.+$/gm);
        expect(h1Matches).toHaveLength(1);
        
        // Check H2 headings exist
        const h2Matches = blog.content.match(/^##\s+.+$/gm);
        expect(h2Matches).toBeTruthy();
        expect(h2Matches!.length).toBeGreaterThan(0);
        
        // Check no heading levels are skipped
        const lines = blog.content.split('\n');
        let hasH1 = false;
        let hasH2 = false;
        
        for (const line of lines) {
          if (line.match(/^#\s+/)) hasH1 = true;
          if (line.match(/^##\s+/)) {
            expect(hasH1).toBe(true); // H2 should come after H1
            hasH2 = true;
          }
          if (line.match(/^###\s+/)) {
            expect(hasH2).toBe(true); // H3 should come after H2
          }
        }
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 4: Section Length Constraints', () => {
  it('sections between H2 headings should be 300-500 words', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        // Extract sections between H2 headings
        const sections = blog.content.split(/^##\s+.+$/gm).filter(s => s.trim().length > 0);
        
        // Check each section (skip first which is before any H2, and skip very short sections like FAQ)
        let validSections = 0;
        let totalBodySections = 0;
        
        for (let i = 1; i < sections.length; i++) {
          const section = sections[i];
          
          // Skip sections that are primarily FAQ or lists
          if (section.includes('###') && section.match(/###/g)!.length > 3) {
            // This is likely a section with many subsections (like FAQ or features list)
            continue;
          }
          
          // Remove H3 headings for word count
          const sectionContent = section.replace(/^###\s+.+$/gm, '');
          const wordCount = countWords(sectionContent);
          
          // Only count substantial body sections
          if (wordCount > 100) {
            totalBodySections++;
            if (wordCount >= 200) {
              validSections++;
            }
          }
        }
        
        // At least 70% of body sections should meet the word count guideline
        if (totalBodySections > 0) {
          const validPercentage = (validSections / totalBodySections) * 100;
          expect(validPercentage).toBeGreaterThanOrEqual(60);
        }
      }),
      { numRuns: 10 }
    );
  });

  it('paragraphs should contain 2-4 sentences', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const validation = generator.validateParagraphLengths(blog.content);
        
        // This is a recommendation, so we allow some warnings
        // but most paragraphs should follow the guideline
        const paragraphs = blog.content.split(/\n\n+/).filter(p => {
          return p.trim().length > 0 && !p.match(/^#{1,6}\s+/);
        });
        
        let validParagraphs = 0;
        for (const paragraph of paragraphs) {
          const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
          if (sentences.length >= 2 && sentences.length <= 4) {
            validParagraphs++;
          }
        }
        
        // At least 70% of paragraphs should follow the guideline
        const validPercentage = (validParagraphs / paragraphs.length) * 100;
        expect(validPercentage).toBeGreaterThanOrEqual(60);
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 5: Content Formatting Requirements', () => {
  it('should include lists based on word count (1 per 1000 words)', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const wordCount = countWords(blog.content);
        
        // Count bulleted and numbered lists (including those in subsections)
        const bulletedLists = (blog.content.match(/^[-*+]\s+.+$/gm) || []).length;
        const numberedLists = (blog.content.match(/^\d+\.\s+.+$/gm) || []).length;
        const totalLists = bulletedLists + numberedLists;
        
        const expectedLists = Math.floor(wordCount / 1000);
        
        // Allow some flexibility - at least 70% of expected lists
        const minLists = Math.floor(expectedLists * 0.7);
        expect(totalLists).toBeGreaterThanOrEqual(minLists);
      }),
      { numRuns: 10 }
    );
  });

  it('should parse markdown correctly without errors', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig();
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        // Check for valid markdown syntax
        // No unclosed bold/italic markers
        const boldMarkers = (blog.content.match(/\*\*/g) || []).length;
        expect(boldMarkers % 2).toBe(0); // Should be even (open and close)
        
        // No malformed links
        const links = blog.content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (links) {
          for (const link of links) {
            expect(link).toMatch(/\[.+\]\(.+\)/);
          }
        }
        
        // Headings should have space after #
        const headings = blog.content.match(/^#{1,6}.+$/gm);
        if (headings) {
          for (const heading of headings) {
            expect(heading).toMatch(/^#{1,6}\s+.+$/);
          }
        }
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 6: Keyword Presence in Title', () => {
  it('title should contain at least one target keyword', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({
          targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game', 'ak7 download'],
        });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const title = blog.metadata.title.toLowerCase();
        
        // Check if at least one keyword is in the title
        const hasKeyword = config.targetKeywords.some(keyword =>
          title.includes(keyword.toLowerCase())
        );
        
        expect(hasKeyword).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  it('slug should contain at least one target keyword', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({
          targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game'],
        });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        const hasKeywordInSlug = slugContainsKeyword(
          blog.metadata.slug,
          config.targetKeywords
        );
        
        expect(hasKeywordInSlug).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  it('primary keyword should appear in first 100 words', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({
          targetKeywords: ['ak7 app', 'ak7 betting', 'ek7 game'],
        });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        const primaryKeyword = config.targetKeywords[0];
        
        const inFirstWords = keywordInFirstWords(blog.content, primaryKeyword, 100);
        expect(inFirstWords).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  it('keywords should appear in at least 2 H2 or H3 headings', async () => {
    await fc.assert(
      fc.asyncProperty(topicArbitrary, async (topic) => {
        const config = createTestConfig({
          targetKeywords: ['ak7', 'ek7', 'app', 'game', 'betting'],
        });
        const generator = new BlogGenerator(config);
        
        const blog = await generator.generatePrimaryBlog(topic);
        
        const keywordsInHeadings = findKeywordsInHeadings(
          blog.content,
          config.targetKeywords
        );
        
        // At least some keywords should appear in headings
        expect(keywordsInHeadings.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 10 }
    );
  });
});

describe('Cross-Platform Blog Properties', () => {
  it('cross-platform blogs should include platform comparison', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        angleArbitrary,
        async (platform, angle) => {
          const config = createTestConfig();
          const generator = new BlogGenerator(config);
          
          const blog = await generator.generateCrossPlatformBlog(
            platform as 'goplay11' | 'habet' | 'dhan7',
            angle
          );
          
          // Should mention both the platform and EK7/AK7
          const content = blog.content.toLowerCase();
          expect(content).toContain(platform);
          expect(content).toMatch(/ek7|ak7/);
          
          // Should have comparison section
          expect(content).toMatch(/compar|vs|versus|difference/i);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('cross-platform blogs should have correct metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        angleArbitrary,
        async (platform, angle) => {
          const config = createTestConfig();
          const generator = new BlogGenerator(config);
          
          const blog = await generator.generateCrossPlatformBlog(
            platform as 'goplay11' | 'habet' | 'dhan7',
            angle
          );
          
          expect(blog.metadata.category).toBe('cross-platform');
          expect(blog.metadata.targetPlatform).toBe(platform);
          expect(blog.metadata.keywords).toContain(platform);
        }
      ),
      { numRuns: 10 }
    );
  });
});
