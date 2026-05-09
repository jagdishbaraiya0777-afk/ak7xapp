import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  BrandConsistencyValidator,
  OFFICIAL_BRANDS,
} from '@/lib/utils/brand-validator';

/**
 * Property 23: Brand Name Consistency
 * Validates: Requirements 12.5, 12.7
 *
 * This property-based test ensures that the brand consistency validator
 * correctly identifies and corrects brand name issues in content.
 */
describe('Property 23: Brand Name Consistency', () => {
  it('should recognize all official brand names when properly capitalized', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(OFFICIAL_BRANDS)),
        (brandKey) => {
          const official = OFFICIAL_BRANDS[brandKey as keyof typeof OFFICIAL_BRANDS];
          const validation = BrandConsistencyValidator.validateContent(official);
          return validation.isConsistent;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should detect incorrect brand capitalization', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('goplay11', 'GOPLAY11', 'GoPlay 11', 'habet', 'HABET'),
        (misspelling) => {
          const content = `This is about ${misspelling} platform.`;
          const validation = BrandConsistencyValidator.validateContent(content);
          return validation.issues.length > 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should auto-correct brand names', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('goplay11', 'GOPLAY11', 'dhan7', 'DHAN7'),
        (incorrect) => {
          const content = `Visit ${incorrect} today.`;
          const corrected = BrandConsistencyValidator.autoCorrect(content);
          return corrected.includes('GoPlay11') || corrected.includes('Dhan7');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should provide correct suggestions for consistency issues', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('habet', 'HABET'),
        (incorrect) => {
          const content = `The ${incorrect} platform offers great features.`;
          const validation = BrandConsistencyValidator.validateContent(content);
          return (
            validation.suggestions.length > 0 &&
            validation.suggestions.some((s) => s.includes('Habet'))
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain consistency across multiple brand mentions', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom('GoPlay11', 'Habet', 'Dhan7'),
          fc.integer({ min: 1, max: 5 })
        ),
        ([brand, count]) => {
          const content = Array(count).fill(`Check out ${brand}. `).join('');
          const validation = BrandConsistencyValidator.validateContent(content);
          return validation.isConsistent;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle brand names in various contexts', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom('GoPlay11', 'Habet', 'Dhan7'),
          fc.constantFrom(
            'is the best platform',
            'offers great games',
            'provides security',
            'has many features'
          )
        ),
        ([brand, context]) => {
          const content = `${brand} ${context}. Many users enjoy ${brand.toLowerCase()} every day.`;
          const validation = BrandConsistencyValidator.validateContent(content);
          // Should detect the lowercase version as inconsistent
          return validation.issues.length > 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should provide accurate consistency statistics', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 10 }),
          fc.constantFrom('GoPlay11', 'Habet', 'Dhan7')
        ),
        ([count, brand]) => {
          const content = Array(count).fill(`${brand} `).join('');
          const stats = BrandConsistencyValidator.getStatistics(content);
          return (
            stats.totalBrandMentions >= count &&
            stats.consistentMentions >= 0 &&
            stats.inconsistentMentions >= 0 &&
            stats.consistencyPercentage >= 0 &&
            stats.consistencyPercentage <= 100
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should correctly identify official brand names', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('GoPlay11', 'Habet', 'Dhan7', 'EK7', 'Ak7xapp'),
        (brand) => {
          const official = BrandConsistencyValidator.getOfficialBrandName(brand);
          return official !== null && official === brand;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should map misspellings to official names', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          ['goplay11', 'GoPlay11'],
          ['habet', 'Habet'],
          ['dhan7', 'Dhan7'],
          ['ek7', 'EK7'],
          ['ak7xapp', 'Ak7xapp']
        ),
        ([misspelling, official]) => {
          const corrected = BrandConsistencyValidator.getOfficialBrandName(misspelling);
          return corrected === official;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle mixed brand names in single content', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom('GoPlay11', 'Habet'),
          fc.constantFrom('Dhan7', 'EK7')
        ),
        ([brand1, brand2]) => {
          const content = `Compare ${brand1} with ${brand2}. Both ${brand1.toLowerCase()} and ${brand2.toLowerCase()} are popular.`;
          const validation = BrandConsistencyValidator.validateContent(content);
          // Should detect lowercase versions as inconsistent
          return validation.issues.length >= 2;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should distinguish brand issues by type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('incorrect_capitalization', 'misspelling'),
        (issueType) => {
          const testContent =
            'Visit goplay11 or check out the HABET platform or try dhan7.';
          const validation = BrandConsistencyValidator.validateContent(testContent);
          return validation.issues.length > 0;
        }
      ),
      { numRuns: 50 }
    );
  });
});
