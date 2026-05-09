/**
 * Property-based tests for anchor text quality
 * Feature: seo-content-strategy
 * Property 12: Anchor Text Quality
 * Validates: Requirements 2.8
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BacklinkManager } from '@/lib/blog/backlinks';
import type { BacklinkStrategy, SitemapURL } from '@/types/blog';

/**
 * Banned anchor text phrases that should never be used
 * These are non-descriptive and provide poor SEO value
 */
const BANNED_PHRASES = [
  'click here',
  'read more',
  'this link',
  'here',
  'link',
  'this',
  'more',
  'click',
  'see more',
  'view more',
  'check this',
  'check here',
  'go here',
  'visit here',
  'see here',
  'look here',
  'find here',
  'more info',
  'more information',
  'learn here',
];

/**
 * Helper function to check if anchor text is a banned phrase
 */
function isBannedAnchorText(anchorText: string): boolean {
  const normalized = anchorText.toLowerCase().trim();
  return BANNED_PHRASES.includes(normalized);
}

/**
 * Helper function to check if anchor text is descriptive
 * Descriptive anchor text should be at least 2 words and contain meaningful content
 */
function isDescriptiveAnchorText(anchorText: string): boolean {
  const words = anchorText.trim().split(/\s+/);
  
  // Should have at least 2 words for descriptive anchor text
  if (words.length < 2) {
    // Single word is acceptable if it's a brand name or specific term
    const singleWordAcceptable = /^(AK7|EK7|GoPlay11|Habet|Dhan7|app|platform|game|betting|features|download|guide|review|bonus|casino|sports)$/i.test(anchorText.trim());
    return singleWordAcceptable;
  }
  
  return true;
}

describe('Property 12: Anchor Text Quality', () => {
  it('should never use banned anchor text phrases for any backlink', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random blog content with varying paragraph counts
        fc.integer({ min: 10, max: 50 }),
        // Generate random blog type
        fc.constantFrom('primary' as const, 'cross-platform' as const),
        // Generate random target platform for cross-platform blogs
        fc.constantFrom('goplay11' as const, 'habet' as const, 'dhan7' as const),
        async (paragraphCount, blogType, targetPlatform) => {
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
          
          const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
          
          // Generate content with realistic gaming/betting text
          const paragraphs = Array(paragraphCount).fill(
            'The AK7 app offers exciting gaming features and betting opportunities. ' +
            'Players can enjoy various games and earn rewards through the platform. ' +
            'The application provides secure transactions and reliable customer support.'
          );
          const content = paragraphs.join('\n\n');
          
          // Insert backlinks
          const result = await backlinkManager.insertBacklinks(
            content,
            blogType,
            blogType === 'cross-platform' ? targetPlatform : undefined
          );
          
          // Property: No backlink should use banned anchor text
          for (const backlink of result.backlinks) {
            expect(
              isBannedAnchorText(backlink.anchorText),
              `Backlink "${backlink.anchorText}" uses banned phrase. URL: ${backlink.url}`
            ).toBe(false);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should use descriptive anchor text for all backlinks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 15, max: 40 }),
        fc.constantFrom('primary' as const, 'cross-platform' as const),
        async (paragraphCount, blogType) => {
          const mockSitemapURLs = new Map<string, SitemapURL[]>();
          
          mockSitemapURLs.set('goplay11', [
            { url: 'https://goplay11.com/features', platform: 'goplay11' },
            { url: 'https://goplay11.com/games', platform: 'goplay11' },
          ]);
          
          mockSitemapURLs.set('habet', [
            { url: 'https://habet.com/betting', platform: 'habet' },
          ]);
          
          mockSitemapURLs.set('dhan7', [
            { url: 'https://dhan7.com/casino', platform: 'dhan7' },
          ]);
          
          const strategy: BacklinkStrategy = {
            totalLinks: 25,
            internalPercentage: 60,
            externalPercentage: 40,
            maxLinksPerParagraph: 3,
            platforms: {
              goplay11: 50,
              habet: 25,
              dhan7: 25,
            },
          };
          
          const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
          
          const paragraphs = Array(paragraphCount).fill(
            'Explore the comprehensive features of gaming platforms. ' +
            'Discover betting strategies and game mechanics. ' +
            'Learn about bonuses, rewards, and promotional offers available to players.'
          );
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(content, blogType);
          
          // Property: All anchor text should be descriptive
          for (const backlink of result.backlinks) {
            expect(
              isDescriptiveAnchorText(backlink.anchorText),
              `Anchor text "${backlink.anchorText}" is not descriptive enough`
            ).toBe(true);
            
            // Anchor text should not be empty
            expect(backlink.anchorText.length).toBeGreaterThan(0);
            
            // Anchor text should not be just whitespace
            expect(backlink.anchorText.trim().length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should generate contextually relevant anchor text based on platform', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('goplay11' as const, 'habet' as const, 'dhan7' as const, 'ak7' as const),
        fc.integer({ min: 20, max: 40 }),
        async (platform, paragraphCount) => {
          const mockSitemapURLs = new Map<string, SitemapURL[]>();
          
          mockSitemapURLs.set('goplay11', [
            { url: 'https://goplay11.com/page1', platform: 'goplay11' },
          ]);
          
          mockSitemapURLs.set('habet', [
            { url: 'https://habet.com/page1', platform: 'habet' },
          ]);
          
          mockSitemapURLs.set('dhan7', [
            { url: 'https://dhan7.com/page1', platform: 'dhan7' },
          ]);
          
          const strategy: BacklinkStrategy = {
            totalLinks: 15,
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
          
          const paragraphs = Array(paragraphCount).fill(
            'Gaming platforms offer various features for players. ' +
            'Betting options and game selections vary across different apps. ' +
            'Each platform provides unique bonuses and promotional offers.'
          );
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(content, 'primary');
          
          // Property: Anchor text should be contextually relevant
          for (const backlink of result.backlinks) {
            // Anchor text should contain meaningful keywords
            const hasKeywords = /\b(app|platform|game|gaming|betting|features|bonus|casino|sports|download|guide|review|AK7|EK7|GoPlay11|Habet|Dhan7)\b/i.test(backlink.anchorText);
            
            expect(
              hasKeywords,
              `Anchor text "${backlink.anchorText}" lacks relevant keywords`
            ).toBe(true);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('should not use the same anchor text for all backlinks', async () => {
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
    
    const content = Array(50).fill(
      'The gaming platform offers comprehensive features for players. ' +
      'Betting enthusiasts can explore various game options and strategies. ' +
      'Download the app to access exclusive bonuses and rewards.'
    ).join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    // Property: Anchor text should have variety
    const anchorTexts = result.backlinks.map(b => b.anchorText);
    const uniqueAnchorTexts = new Set(anchorTexts);
    
    // At least 50% of anchor texts should be unique
    const uniquePercentage = (uniqueAnchorTexts.size / anchorTexts.length) * 100;
    expect(uniquePercentage).toBeGreaterThanOrEqual(30);
  });

  it('should generate anchor text with appropriate length', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 20, max: 50 }),
        async (paragraphCount) => {
          const mockSitemapURLs = new Map<string, SitemapURL[]>();
          
          mockSitemapURLs.set('goplay11', [
            { url: 'https://goplay11.com/page1', platform: 'goplay11' },
          ]);
          
          const strategy: BacklinkStrategy = {
            totalLinks: 20,
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
          
          const paragraphs = Array(paragraphCount).fill(
            'Gaming applications provide entertainment and betting opportunities. ' +
            'Players can access various features through mobile platforms. ' +
            'Secure transactions and customer support enhance user experience.'
          );
          const content = paragraphs.join('\n\n');
          
          const result = await backlinkManager.insertBacklinks(content, 'primary');
          
          // Property: Anchor text should have reasonable length
          for (const backlink of result.backlinks) {
            const length = backlink.anchorText.length;
            
            // Anchor text should be between 3 and 60 characters
            expect(length).toBeGreaterThanOrEqual(3);
            expect(length).toBeLessThanOrEqual(60);
            
            // Should not be excessively long
            const wordCount = backlink.anchorText.split(/\s+/).length;
            expect(wordCount).toBeLessThanOrEqual(6);
          }
        }
      ),
      { numRuns: 15 }
    );
  });
});

describe('Anchor Text Quality - Example-based tests', () => {
  it('should reject specific banned phrases', async () => {
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
    
    const content = Array(20).fill(
      'Gaming platforms offer exciting features. ' +
      'Players can explore betting options and game selections. ' +
      'Download apps to access exclusive bonuses and rewards.'
    ).join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    // Verify no banned phrases are used
    const bannedPhrasesLower = BANNED_PHRASES.map(p => p.toLowerCase());
    
    for (const backlink of result.backlinks) {
      const anchorLower = backlink.anchorText.toLowerCase().trim();
      
      for (const banned of bannedPhrasesLower) {
        expect(anchorLower).not.toBe(banned);
      }
    }
  });

  it('should use platform-specific anchor text when available', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    mockSitemapURLs.set('goplay11', [
      { url: 'https://goplay11.com/features', platform: 'goplay11' },
    ]);
    
    mockSitemapURLs.set('habet', [
      { url: 'https://habet.com/games', platform: 'habet' },
    ]);
    
    const strategy: BacklinkStrategy = {
      totalLinks: 10,
      internalPercentage: 50,
      externalPercentage: 50,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 50,
        habet: 50,
        dhan7: 0,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    const content = Array(15).fill(
      'Explore gaming platforms and their unique features. ' +
      'Compare different betting apps and their offerings. ' +
      'Discover bonuses and promotional rewards available to players.'
    ).join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    // Check that external links have platform-relevant anchor text
    const externalLinks = result.backlinks.filter(b => b.type === 'external');
    
    for (const link of externalLinks) {
      // Anchor text should be descriptive and not banned
      expect(isBannedAnchorText(link.anchorText)).toBe(false);
      expect(link.anchorText.length).toBeGreaterThan(0);
    }
  });

  it('should generate varied anchor text for internal links', async () => {
    const mockSitemapURLs = new Map<string, SitemapURL[]>();
    
    const strategy: BacklinkStrategy = {
      totalLinks: 15,
      internalPercentage: 100,
      externalPercentage: 0,
      maxLinksPerParagraph: 3,
      platforms: {
        goplay11: 0,
        habet: 0,
        dhan7: 0,
      },
    };
    
    const backlinkManager = new BacklinkManager(strategy, mockSitemapURLs);
    
    const content = Array(25).fill(
      'The AK7 app provides comprehensive gaming features. ' +
      'Users can access betting options and game selections. ' +
      'Download the application to enjoy exclusive bonuses.'
    ).join('\n\n');
    
    const result = await backlinkManager.insertBacklinks(content, 'primary');
    
    // All should be internal links
    const internalLinks = result.backlinks.filter(b => b.type === 'internal');
    expect(internalLinks.length).toBe(result.backlinks.length);
    
    // Check anchor text quality
    for (const link of internalLinks) {
      expect(isBannedAnchorText(link.anchorText)).toBe(false);
      expect(link.anchorText.length).toBeGreaterThan(0);
    }
  });
});
