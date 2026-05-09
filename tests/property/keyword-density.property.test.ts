/**
 * Property-based tests for keyword density calculation
 * Feature: seo-content-strategy
 * Property 8: Keyword Density Bounds
 * Validates: Requirements 7.2, 7.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateKeywordDensity,
  calculateKeywordDensities,
  isKeywordDensityValid,
  findKeywordPositions,
  keywordInFirstWords,
  countWords,
  findKeywordsInHeadings,
} from '@/lib/utils/keywords';

describe('Property 8: Keyword Density Bounds', () => {
  it('should return density between 0 and 100 for any content and keyword', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 1000 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (content, keyword) => {
          const density = calculateKeywordDensity(content, keyword);
          
          // Density should be between 0 and 100
          expect(density).toBeGreaterThanOrEqual(0);
          expect(density).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 density for keyword not in content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 1000 }).filter(s => !s.includes('xyz123')),
        (content) => {
          const density = calculateKeywordDensity(content, 'xyz123');
          
          // Density should be 0 if keyword not present
          expect(density).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate higher density when keyword appears more frequently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ak7', 'app', 'betting', 'game', 'download'),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 50, max: 200 }),
        (keyword, occurrences, fillerWords) => {
          // Create content with known keyword occurrences
          const keywordParts = Array(occurrences).fill(keyword);
          const fillerParts = Array(fillerWords).fill('word');
          const content = [...keywordParts, ...fillerParts].join(' ');
          
          const density = calculateKeywordDensity(content, keyword);
          
          // Density should be positive when keyword is present
          expect(density).toBeGreaterThan(0);
          
          // Density should be approximately (occurrences / total words) * 100
          const totalWords = occurrences + fillerWords;
          const expectedDensity = (occurrences / totalWords) * 100;
          expect(Math.abs(density - expectedDensity)).toBeLessThan(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 10 }),
        fc.integer({ min: 10, max: 50 }),
        (keyword, fillerWords) => {
          const filler = Array(fillerWords).fill('word').join(' ');
          const contentLower = `${keyword.toLowerCase()} ${filler}`;
          const contentUpper = `${keyword.toUpperCase()} ${filler}`;
          
          const densityLower = calculateKeywordDensity(contentLower, keyword);
          const densityUpper = calculateKeywordDensity(contentUpper, keyword);
          
          // Densities should be equal regardless of case
          expect(Math.abs(densityLower - densityUpper)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate density correctly for 1-2% range', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 5 }),
        (density) => {
          const isValid = isKeywordDensityValid(density);
          
          if (density >= 1.0 && density <= 2.0) {
            expect(isValid).toBe(true);
          } else {
            expect(isValid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should find all keyword positions correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (keyword, occurrences) => {
          // Create content with known keyword positions
          const parts: string[] = [];
          for (let i = 0; i < occurrences; i++) {
            parts.push(keyword);
            parts.push('filler');
          }
          const content = parts.join(' ');
          
          const positions = findKeywordPositions(content, keyword);
          
          // Should find at least the number of occurrences
          expect(positions.length).toBeGreaterThanOrEqual(occurrences);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly detect keyword in first N words', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ak7', 'app', 'betting', 'game', 'download'),
        fc.integer({ min: 10, max: 50 }),
        fc.integer({ min: 10, max: 100 }),
        (keyword, beforeWords, afterWords) => {
          const before = Array(beforeWords).fill('word').join(' ');
          const after = Array(afterWords).fill('word').join(' ');
          
          // Keyword at start
          const contentStart = `${keyword} ${before} ${after}`;
          expect(keywordInFirstWords(contentStart, keyword, beforeWords + 10)).toBe(true);
          
          // Keyword after first N words
          const contentEnd = `${before} ${after} ${keyword}`;
          expect(keywordInFirstWords(contentEnd, keyword, beforeWords)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should count words correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('word', 'test', 'content', 'blog', 'article'), { minLength: 1, maxLength: 100 }),
        (words) => {
          const content = words.join(' ');
          const count = countWords(content);
          
          // Word count should match array length
          expect(count).toBe(words.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Keyword Density Calculation - Example-based tests', () => {
  it('should calculate correct density for known content', () => {
    const content = 'ak7 app is the best ak7 app for gaming. Download ak7 app today.';
    const density = calculateKeywordDensity(content, 'ak7 app');
    
    // "ak7 app" appears 3 times (6 words total) in 13 words = 46.15%
    expect(density).toBeCloseTo(46.15, 1);
  });

  it('should handle multi-word keywords', () => {
    const content = 'The ak7 betting platform offers great ak7 betting features.';
    const density = calculateKeywordDensity(content, 'ak7 betting');
    
    // "ak7 betting" appears 2 times (4 words total) in 9 words = 44.44%
    expect(density).toBeCloseTo(44.44, 1);
  });

  it('should validate density bounds correctly', () => {
    expect(isKeywordDensityValid(0.5)).toBe(false); // Too low
    expect(isKeywordDensityValid(1.0)).toBe(true);  // Lower bound
    expect(isKeywordDensityValid(1.5)).toBe(true);  // Within range
    expect(isKeywordDensityValid(2.0)).toBe(true);  // Upper bound
    expect(isKeywordDensityValid(2.5)).toBe(false); // Too high
  });

  it('should find keywords in markdown headings', () => {
    const content = `
# Main Title

## AK7 App Features

Some content here.

### AK7 Betting Strategies

More content.

## Other Section

Final content.
    `;
    
    const found = findKeywordsInHeadings(content, ['ak7 app', 'ak7 betting', 'goplay11']);
    
    expect(found).toContain('ak7 app');
    expect(found).toContain('ak7 betting');
    expect(found).not.toContain('goplay11');
  });

  it('should detect keyword in first 100 words', () => {
    const first100 = Array(100).fill('word').join(' ');
    const after = Array(50).fill('word').join(' ');
    
    const contentWithKeyword = `ak7 app ${first100}`;
    const contentWithoutKeyword = `${first100} ${after} ak7 app`;
    
    expect(keywordInFirstWords(contentWithKeyword, 'ak7 app', 100)).toBe(true);
    expect(keywordInFirstWords(contentWithoutKeyword, 'ak7 app', 100)).toBe(false);
  });

  it('should calculate densities for multiple keywords', () => {
    const content = 'ak7 app is great. ak7 betting is fun. Download ak7 app now.';
    const densities = calculateKeywordDensities(content, ['ak7 app', 'ak7 betting']);
    
    expect(densities.get('ak7 app')).toBeGreaterThan(0);
    expect(densities.get('ak7 betting')).toBeGreaterThan(0);
  });
});
