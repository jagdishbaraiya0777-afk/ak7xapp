/**
 * Property-based tests for E-E-A-T compliance validation
 * Feature: seo-content-strategy
 * Property 21: E-E-A-T Trust Signals
 * Property 22: Responsible Gaming Compliance
 * Validates: Requirements 3.2, 3.4, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EEATValidator } from '@/lib/blog/validator';
import { BlogContent, BlogMetadata } from '@/types/blog';

// Arbitraries for generating test data
const authorArbitrary = fc.constantFrom(
  'Gaming Expert',
  'AK7 Specialist',
  'Betting Analyst',
  'Industry Professional',
  'John Doe'
);

const contentWithTrustSignalsArbitrary = fc.record({
  hasDisclaimer: fc.boolean(),
  hasPrivacyLink: fc.boolean(),
  hasAuthorCredentials: fc.boolean(),
  hasSpecificFeatures: fc.boolean(),
  fillerWords: fc.integer({ min: 50, max: 200 }),
}).map(({ hasDisclaimer, hasPrivacyLink, hasAuthorCredentials, hasSpecificFeatures, fillerWords }) => {
  const parts: string[] = [];
  
  // Add filler content
  parts.push(Array(fillerWords).fill('word').join(' '));
  
  // Add trust signals based on flags
  if (hasDisclaimer) {
    parts.push('This is for informational purposes only. See our [disclaimer](/disclaimer) for more details.');
  }
  
  if (hasPrivacyLink) {
    parts.push('Read our [privacy policy](/privacy-policy) to understand how we handle your data.');
  }
  
  if (hasAuthorCredentials) {
    parts.push('Our team of gaming experts with years of experience has tested this thoroughly.');
  }
  
  if (hasSpecificFeatures) {
    parts.push('The app features include registration, login, deposit, withdrawal, gameplay options, and bonus rewards.');
  }
  
  return {
    content: parts.join(' '),
    hasDisclaimer,
    hasPrivacyLink,
    hasAuthorCredentials,
    hasSpecificFeatures,
  };
});

const contentWithResponsibleGamingArbitrary = fc.record({
  hasResponsibleGaming: fc.boolean(),
  hasAgeRestriction: fc.boolean(),
  hasUnrealisticPromises: fc.boolean(),
  fillerWords: fc.integer({ min: 50, max: 200 }),
}).map(({ hasResponsibleGaming, hasAgeRestriction, hasUnrealisticPromises, fillerWords }) => {
  const parts: string[] = [];
  
  // Add filler content
  parts.push(Array(fillerWords).fill('word').join(' '));
  
  // Add responsible gaming signals
  if (hasResponsibleGaming) {
    parts.push('Please play responsibly. Gambling can be addictive and may lead to financial problems.');
  }
  
  if (hasAgeRestriction) {
    parts.push('This service is only available for users 18+ years of age. Age restrictions apply.');
  }
  
  if (hasUnrealisticPromises) {
    parts.push('You can make guaranteed income and get rich quick with easy money!');
  }
  
  return {
    content: parts.join(' '),
    hasResponsibleGaming,
    hasAgeRestriction,
    hasUnrealisticPromises,
  };
});

describe('Property 21: E-E-A-T Trust Signals', () => {
  const validator = new EEATValidator();

  it('should detect disclaimer links in any content', () => {
    fc.assert(
      fc.property(
        contentWithTrustSignalsArbitrary,
        ({ content, hasDisclaimer }) => {
          const result = validator.hasDisclaimers(content);
          
          if (hasDisclaimer) {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect privacy policy links in any content', () => {
    fc.assert(
      fc.property(
        contentWithTrustSignalsArbitrary,
        ({ content, hasPrivacyLink }) => {
          const result = validator.checkTrustworthiness(content);
          
          if (hasPrivacyLink) {
            expect(result.privacyPolicyLink).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect author credentials in content or author name', () => {
    fc.assert(
      fc.property(
        contentWithTrustSignalsArbitrary,
        authorArbitrary,
        ({ content, hasAuthorCredentials }, author) => {
          const result = validator.checkExpertise(content, author);
          
          if (hasAuthorCredentials || author.toLowerCase().includes('expert')) {
            expect(result.authorCredentials).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect specific app features in content', () => {
    fc.assert(
      fc.property(
        contentWithTrustSignalsArbitrary,
        ({ content, hasSpecificFeatures }) => {
          const result = validator.checkExperience(content);
          
          if (hasSpecificFeatures) {
            expect(result.specificFeatures).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate experience score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        (content) => {
          const result = validator.checkExperience(content);
          
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate expertise score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        authorArbitrary,
        (content, author) => {
          const result = validator.checkExpertise(content, author);
          
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate authoritativeness score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        (content) => {
          const result = validator.checkAuthoritativeness(content);
          
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate trustworthiness score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        (content) => {
          const result = validator.checkTrustworthiness(content);
          
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate overall score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        authorArbitrary,
        (content, author) => {
          const mockBlog: BlogContent = {
            metadata: {
              title: 'Test Blog',
              slug: 'test-blog',
              description: 'Test description',
              keywords: ['test'],
              author,
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 1000,
              readingTime: 5,
            },
            content,
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };
          
          const result = validator.validateContent(mockBlog);
          
          expect(result.overallScore).toBeGreaterThanOrEqual(0);
          expect(result.overallScore).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when overall score >= 0.7', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        authorArbitrary,
        (content, author) => {
          const mockBlog: BlogContent = {
            metadata: {
              title: 'Test Blog',
              slug: 'test-blog',
              description: 'Test description',
              keywords: ['test'],
              author,
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 1000,
              readingTime: 5,
            },
            content,
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };
          
          const result = validator.validateContent(mockBlog);
          
          if (result.overallScore >= 0.7) {
            expect(result.passed).toBe(true);
          } else {
            expect(result.passed).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 22: Responsible Gaming Compliance', () => {
  const validator = new EEATValidator();

  it('should detect responsible gaming warnings in any content', () => {
    fc.assert(
      fc.property(
        contentWithResponsibleGamingArbitrary,
        ({ content, hasResponsibleGaming }) => {
          const result = validator.hasResponsibleGamingWarnings(content);
          
          if (hasResponsibleGaming) {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect age restrictions (18+) in any content', () => {
    fc.assert(
      fc.property(
        contentWithResponsibleGamingArbitrary,
        ({ content, hasAgeRestriction }) => {
          const result = validator.hasAgeRestrictions(content);
          
          if (hasAgeRestriction) {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect unrealistic promises in any content', () => {
    fc.assert(
      fc.property(
        contentWithResponsibleGamingArbitrary,
        ({ content, hasUnrealisticPromises }) => {
          const result = validator.hasUnrealisticPromises(content);
          
          if (hasUnrealisticPromises) {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should penalize trustworthiness score when unrealistic promises are present', () => {
    fc.assert(
      fc.property(
        contentWithResponsibleGamingArbitrary,
        ({ content, hasUnrealisticPromises }) => {
          const result = validator.checkTrustworthiness(content);
          
          if (hasUnrealisticPromises) {
            expect(result.noUnrealisticPromises).toBe(false);
          } else {
            expect(result.noUnrealisticPromises).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should improve trustworthiness score with all compliance signals', () => {
    const compliantContent = `
      This is an informational article about gaming. Please read our [disclaimer](/disclaimer) 
      and [privacy policy](/privacy-policy) for more information.
      
      This service is only for users 18+ years of age. Please play responsibly and be aware 
      that gambling can be addictive. Set limits and never bet more than you can afford to lose.
      
      We provide factual information based on research and testing. No guaranteed winnings or 
      income are promised. All gaming involves risk.
    `;
    
    const result = validator.checkTrustworthiness(compliantContent);
    
    expect(result.disclaimers).toBe(true);
    expect(result.responsibleGamingWarnings).toBe(true);
    expect(result.ageRestrictions).toBe(true);
    expect(result.privacyPolicyLink).toBe(true);
    expect(result.noUnrealisticPromises).toBe(true);
    expect(result.score).toBe(1.0);
  });

  it('should fail trustworthiness with missing compliance signals', () => {
    const nonCompliantContent = `
      Download this app and start making guaranteed income today! Get rich quick with our 
      easy money system. 100% win rate guaranteed!
    `;
    
    const result = validator.checkTrustworthiness(nonCompliantContent);
    
    expect(result.disclaimers).toBe(false);
    expect(result.responsibleGamingWarnings).toBe(false);
    expect(result.ageRestrictions).toBe(false);
    expect(result.privacyPolicyLink).toBe(false);
    expect(result.noUnrealisticPromises).toBe(false);
    expect(result.score).toBe(0.0);
  });
});

describe('E-E-A-T Report Generation', () => {
  const validator = new EEATValidator();

  it('should generate a non-empty report for any content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 100, maxLength: 2000 }),
        authorArbitrary,
        (content, author) => {
          const mockBlog: BlogContent = {
            metadata: {
              title: 'Test Blog',
              slug: 'test-blog',
              description: 'Test description',
              keywords: ['test'],
              author,
              publishedAt: new Date(),
              updatedAt: new Date(),
              category: 'primary',
              wordCount: 1000,
              readingTime: 5,
            },
            content,
            excerpt: 'Test excerpt',
            tableOfContents: [],
            backlinks: [],
          };
          
          const criteria = validator.validateContent(mockBlog);
          const report = validator.generateEEATReport(criteria);
          
          expect(report).toBeTruthy();
          expect(report.length).toBeGreaterThan(0);
          expect(report).toContain('E-E-A-T COMPLIANCE REPORT');
          expect(report).toContain('Overall Score');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include all four E-E-A-T dimensions in report', () => {
    const content = 'Test content for report generation';
    const mockBlog: BlogContent = {
      metadata: {
        title: 'Test Blog',
        slug: 'test-blog',
        description: 'Test description',
        keywords: ['test'],
        author: 'Test Author',
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: 'primary',
        wordCount: 1000,
        readingTime: 5,
      },
      content,
      excerpt: 'Test excerpt',
      tableOfContents: [],
      backlinks: [],
    };
    
    const criteria = validator.validateContent(mockBlog);
    const report = validator.generateEEATReport(criteria);
    
    expect(report).toContain('EXPERIENCE:');
    expect(report).toContain('EXPERTISE:');
    expect(report).toContain('AUTHORITATIVENESS:');
    expect(report).toContain('TRUSTWORTHINESS:');
  });

  it('should include recommendations when validation fails', () => {
    const poorContent = 'Short content without any trust signals or details.';
    const mockBlog: BlogContent = {
      metadata: {
        title: 'Test Blog',
        slug: 'test-blog',
        description: 'Test description',
        keywords: ['test'],
        author: 'Test Author',
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: 'primary',
        wordCount: 1000,
        readingTime: 5,
      },
      content: poorContent,
      excerpt: 'Test excerpt',
      tableOfContents: [],
      backlinks: [],
    };
    
    const criteria = validator.validateContent(mockBlog);
    const report = validator.generateEEATReport(criteria);
    
    if (!criteria.passed) {
      expect(report).toContain('RECOMMENDATIONS:');
    }
  });
});
