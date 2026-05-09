/**
 * Property-based tests for URL slug generation
 * Feature: seo-content-strategy
 * Property 17: URL Slug Format
 * Validates: Requirements 5.8
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateSlug, isValidSlug, slugContainsKeyword } from '@/lib/utils/slug';

describe('Property 17: URL Slug Format', () => {
  it('should generate lowercase slugs for any title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);
          
          // Skip empty slugs (can happen with special-char-only titles)
          if (slug.length === 0) return true;
          
          // Should be lowercase
          expect(slug).toBe(slug.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only contain alphanumeric characters and hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);
          
          // Skip empty slugs
          if (slug.length === 0) return true;
          
          // Should only contain alphanumeric and hyphens
          expect(slug).toMatch(/^[a-z0-9-]+$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not start or end with hyphen', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);
          
          // Skip empty slugs
          if (slug.length === 0) return true;
          
          // Should not start or end with hyphen
          expect(slug).not.toMatch(/^-|-$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not have consecutive hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);
          
          // Skip empty slugs
          if (slug.length === 0) return true;
          
          // Should not have consecutive hyphens
          expect(slug).not.toMatch(/--/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass isValidSlug validation for any generated slug', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (title) => {
          const slug = generateSlug(title);
          
          // Skip empty slugs
          if (slug.length === 0) return true;
          
          // Generated slugs should always be valid
          expect(isValidSlug(slug)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve alphanumeric characters from title', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => /[a-zA-Z0-9]/.test(s)),
        (title) => {
          const slug = generateSlug(title);
          
          // Should not be empty if title has alphanumeric chars
          expect(slug.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect keywords in slugs correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (keywords, keywordIndex) => {
          // Ensure we have at least one keyword
          if (keywords.length === 0) return true;
          
          const selectedKeyword = keywords[keywordIndex % keywords.length];
          const title = `Complete Guide to ${selectedKeyword} App`;
          const slug = generateSlug(title);
          
          // Slug should contain the keyword
          expect(slugContainsKeyword(slug, [selectedKeyword])).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('URL Slug Generation - Example-based tests', () => {
  it('should generate correct slug for typical blog titles', () => {
    expect(generateSlug('Complete Guide to AK7 App')).toBe('complete-guide-to-ak7-app');
    expect(generateSlug('AK7 Betting Strategies for Beginners')).toBe('ak7-betting-strategies-for-beginners');
    expect(generateSlug('How to Download and Install AK7 App')).toBe('how-to-download-and-install-ak7-app');
  });

  it('should handle special characters correctly', () => {
    expect(generateSlug('AK7 App: Features & Benefits!')).toBe('ak7-app-features-benefits');
    expect(generateSlug('GoPlay11 vs. AK7 - Which is Better?')).toBe('goplay11-vs-ak7-which-is-better');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(generateSlug('AK7    App   Guide')).toBe('ak7-app-guide');
    expect(generateSlug('AK7---App---Guide')).toBe('ak7-app-guide');
  });

  it('should handle empty or whitespace-only strings', () => {
    expect(generateSlug('')).toBe('');
    expect(generateSlug('   ')).toBe('');
  });

  it('should detect keywords correctly', () => {
    const slug = 'complete-guide-to-ak7-app';
    expect(slugContainsKeyword(slug, ['ak7 app', 'ak7 betting'])).toBe(true);
    expect(slugContainsKeyword(slug, ['goplay11', 'habet'])).toBe(false);
  });
});
