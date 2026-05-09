/**
 * Property-based tests for backlink distribution
 * Feature: seo-content-strategy
 * Property 9: Backlink Count Requirements
 * Property 10: Backlink Distribution Ratios
 * Property 11: Backlink Density Constraint
 * Validates: Requirements 2.1, 2.2, 2.3, 2.6
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { BacklinkManager } from '@/lib/blog/backlinks';
import type { BacklinkStrategy, SitemapURL } from '@/types/blog';

describe('Property 9: Backlink Count Requirements', () => {
  let backlinkManager: BacklinkManager;
  
  beforeAll(() => {
    // Create mock sitemap URLs
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/page1', platform: 'goplay11' },
      { url: 'https://goplay11.com/page2', platform: 'goplay11' },
      { url: 'https://goplay11.com/page3', platform: 'goplay11' },
    ]);
    
    mockSitemapURLs.set('habet', [
      { url: 'https://habet.com/page1', platform: 'habet' },
      { url: 'https://habet.com/page2', platform: 'habet' },
      { url: 'https://habet.com/page3', platform: 'habet' },
    ]);
    
    mockSitemapURLs.set('dhan7', [
      { url: 'https://dhan7.com/page1', platform: 'dhan7' },
      { url: 'https://dhan7.com/page2', platform: 'dhan7' },
      { url: 'https://dhan7.com/page3', platform: 'dhan7' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 27,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 33,
        habet: 33,
        dhan7: 34,
      },
    };
    
    backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
  });

  it('should generate between 25 and 30 backlinks for primary blogs', async () => {
    fc.assert(
      await fc.asyncProperty(
        fc.integer({ min: 2500, max: 3500 }),
        async (wordCount) => {
          // Generate content with approximately wordCount words
          const words = Array(wordCount).fill('word').join(' ');
          const paragraphs = [];
          
          // Split into paragraphs (300-500 words each)
          for (let i = 0; i < words.length; i += 400) {
            paragraphs.push(words.slice(i, i + 400));
          }
          
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(content, 'primary');
          
          // Should have between 25 and 30 backlinks
          expect(result.backlinks.length).toBeGreaterThanOrEqual(25);
          expect(result.backlinks.length).toBeLessThanOrEqual(30);
        }
      ),
      { numRuns: 10 } // Reduced runs for async tests
    );
  });

  it('should generate at least 5 external and 3 internal links for cross-platform blogs', async () => {
    fc.assert(
      await fc.asyncProperty(
        fc.constantFrom('goplay11', 'habet', 'dhan7'),
        fc.integer({ min: 1500, max: 2000 }),
        async (platform, wordCount) => {
          const words = Array(wordCount).fill('word').join(' ');
          const paragraphs = [];
          
          for (let i = 0; i < words.length; i += 300) {
            paragraphs.push(words.slice(i, i + 300));
          }
          
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(
            content,
            'cross-platform',
            platform as 'goplay11' | 'habet' | 'dhan7'
          );
          
          const internalLinks = result.backlinks.filter(l => l.type === 'internal');
          const externalLinks = result.backlinks.filter(l => l.type === 'external');
          
          // Should have at least 3 internal links
          expect(internalLinks.length).toBeGreaterThanOrEqual(3);
          
          // Should have at least 5 external links
          expect(externalLinks.length).toBeGreaterThanOrEqual(5);
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Property 10: Backlink Distribution Ratios', () => {
  it('should maintain 60% internal and 40% external ratio for primary blogs', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/page1', platform: 'goplay11' },
      { url: 'https://goplay11.com/page2', platform: 'goplay11' },
    ]);
    
    mockSitemapURLs.set('habet', [
      { url: 'https://habet.com/page1', platform: 'habet' },
    ]);
    
    mockSitemapURLs.set('dhan7', [
      { url: 'https://dhan7.com/page1', platform: 'dhan7' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 27,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 33,
        habet: 33,
        dhan7: 34,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    // Generate content
    const content = Array(50).fill('This is a paragraph with some content about gaming and betting.').join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    const internalLinks = result.backlinks.filter(l => l.type === 'internal');
    const externalLinks = result.backlinks.filter(l => l.type === 'external');
    const totalLinks = result.backlinks.length;
    
    // Calculate percentages
    const internalPercentage = (internalLinks.length / totalLinks) * 100;
    const externalPercentage = (externalLinks.length / totalLinks) * 100;
    
    // Should be approximately 60% internal
    expect(internalPercentage).toBeGreaterThanOrEqual(55);
    expect(internalPercentage).toBeLessThanOrEqual(65);
    
    // Should be approximately 40% external (or at least 20%)
    expect(externalPercentage).toBeGreaterThanOrEqual(20);
  });
});

describe('Property 11: Backlink Density Constraint', () => {
  it('should not place more than 3 backlinks in any single paragraph', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/page1', platform: 'goplay11' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 27,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 100,
        habet: 0,
        dhan7: 0,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    fc.assert(
      await fc.asyncProperty(
        fc.integer({ min: 10, max: 50 }),
        async (paragraphCount) => {
          // Generate content with known paragraph boundaries
          const paragraphs = Array(paragraphCount).fill(
            'This is a paragraph with some content about gaming and betting. It has multiple sentences to make it realistic.'
          );
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(content, 'primary');
          
          // Split result content into paragraphs
          const resultParagraphs = result.content.split(/\n\n+/);
          
          // Count links in each paragraph
          for (const paragraph of resultParagraphs) {
            const linkCount = (paragraph.match(/\[.*?\]\(.*?\)/g) || []).length;
            
            // No paragraph should have more than 3 links
            expect(linkCount).toBeLessThanOrEqual(3);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Backlink Distribution - Example-based tests', () => {
  it('should insert backlinks into content', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/page1', platform: 'goplay11' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 10,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 100,
        habet: 0,
        dhan7: 0,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    const content = `
This is the first paragraph about AK7 app.

This is the second paragraph about betting strategies.

This is the third paragraph about game features.

This is the fourth paragraph about downloads.
    `.trim();
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    // Should have backlinks
    expect(result.backlinks.length).toBeGreaterThan(0);
    
    // Content should contain markdown links
    expect(result.content).toMatch(/\[.*?\]\(.*?\)/);
    
    // All backlinks should have anchor text
    result.backlinks.forEach(link => {
      expect(link.anchorText).toBeTruthy();
      expect(link.anchorText.length).toBeGreaterThan(0);
    });
  });

  it('should not use banned anchor text phrases', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/page1', platform: 'goplay11' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 10,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 100,
        habet: 0,
        dhan7: 0,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    const content = Array(20).fill('This is a paragraph with content.').join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    const bannedPhrases = ['click here', 'read more', 'this link', 'here'];
    
    result.backlinks.forEach(link => {
      const anchorLower = link.anchorText.toLowerCase();
      bannedPhrases.forEach(banned => {
        expect(anchorLower).not.toBe(banned);
      });
    });
  });
});
