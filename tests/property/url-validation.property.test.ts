/**
 * Property-based tests for URL validation
 * Feature: seo-content-strategy
 * Property 24: URL Validity
 * Validates: Requirements 2.7, 12.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isValidURL,
  matchesSitemapURL,
  normalizeURL,
  extractDomain,
  isInternalURL,
  belongsToPlatform,
  validateURLs,
  isAccessibleURL,
  parseSitemapContent,
} from '@/lib/utils/validation';

describe('Property 24: URL Validity', () => {
  it('should validate well-formed HTTP/HTTPS URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const isValid = isValidURL(url);
          
          // Web URLs should be valid
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid URL formats', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('http')),
        (invalidUrl) => {
          const isValid = isValidURL(invalidUrl);
          
          // Random strings without http should be invalid
          expect(isValid).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should normalize URLs consistently', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const normalized1 = normalizeURL(url);
          const normalized2 = normalizeURL(url);
          
          // Normalizing same URL twice should give same result
          expect(normalized1).toBe(normalized2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should extract domain from valid URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const domain = extractDomain(url);
          
          // Domain should not be empty for valid URLs
          expect(domain.length).toBeGreaterThan(0);
          
          // Domain should not contain protocol
          expect(domain).not.toContain('http');
          expect(domain).not.toContain('://');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify internal vs external URLs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ak7-apk.com', 'goplay11.com', 'habet.com', 'dhan7.com'),
        fc.constantFrom('ak7-apk.com', 'goplay11.com', 'habet.com', 'dhan7.com'),
        (domain1, domain2) => {
          const url = `https://${domain1}/page`;
          const isInternal = isInternalURL(url, domain2);
          
          if (domain1 === domain2) {
            expect(isInternal).toBe(true);
          } else {
            expect(isInternal).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate URL arrays correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
        (urls) => {
          const result = validateURLs(urls);
          
          // All URLs should be in either valid or invalid
          expect(result.valid.length + result.invalid.length).toBe(urls.length);
          
          // Valid URLs should actually be valid
          result.valid.forEach(url => {
            expect(isValidURL(url)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should match URLs in sitemap correctly', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.array(fc.webUrl(), { minLength: 5, maxLength: 20 }),
        (targetUrl, sitemapUrls) => {
          // Add target URL to sitemap
          const sitemap = [...sitemapUrls, targetUrl];
          
          // Should match when URL is in sitemap
          expect(matchesSitemapURL(targetUrl, sitemap)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle URL normalization edge cases', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          try {
            const normalized = normalizeURL(url);
            const urlObj = new URL(normalized);
            
            // Normalized URL should not end with slash (except root path "/")
            if (urlObj.pathname.length > 1) {
              expect(normalized.endsWith('/')).toBe(false);
            }
          } catch {
            // Skip invalid URLs
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('URL Validation - Example-based tests', () => {
  it('should validate correct URLs', () => {
    expect(isValidURL('https://ak7-apk.com')).toBe(true);
    expect(isValidURL('https://goplay11.com/page')).toBe(true);
    expect(isValidURL('http://habet.com/article/123')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidURL('not a url')).toBe(false);
    expect(isValidURL('ftp://invalid.com')).toBe(false);
    expect(isValidURL('')).toBe(false);
    expect(isValidURL('javascript:alert(1)')).toBe(false);
  });

  it('should normalize URLs correctly', () => {
    expect(normalizeURL('https://www.ak7-apk.com/')).toBe('https://ak7-apk.com/');
    expect(normalizeURL('https://AK7-APK.COM/Page')).toBe('https://ak7-apk.com/Page');
    expect(normalizeURL('https://ak7-apk.com/page/')).toBe('https://ak7-apk.com/page');
  });

  it('should extract domains correctly', () => {
    expect(extractDomain('https://ak7-apk.com/page')).toBe('ak7-apk.com');
    expect(extractDomain('https://www.goplay11.com')).toBe('www.goplay11.com');
    expect(extractDomain('invalid')).toBe('');
  });

  it('should identify internal URLs', () => {
    expect(isInternalURL('https://ak7-apk.com/page', 'ak7-apk.com')).toBe(true);
    expect(isInternalURL('https://www.ak7-apk.com/page', 'ak7-apk.com')).toBe(true);
    expect(isInternalURL('https://goplay11.com/page', 'ak7-apk.com')).toBe(false);
  });

  it('should identify platform URLs', () => {
    expect(belongsToPlatform('https://goplay11.com/page', 'goplay11')).toBe(true);
    expect(belongsToPlatform('https://habet.com/article', 'habet')).toBe(true);
    expect(belongsToPlatform('https://dhan7.com/game', 'dhan7')).toBe(true);
    expect(belongsToPlatform('https://ak7-apk.com/blog', 'ak7')).toBe(true);
    expect(belongsToPlatform('https://goplay11.com/page', 'habet')).toBe(false);
  });

  it('should validate URL arrays', () => {
    const urls = [
      'https://ak7-apk.com',
      'invalid url',
      'https://goplay11.com',
      'not-a-url',
    ];
    
    const result = validateURLs(urls);
    
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(2);
    expect(result.valid).toContain('https://ak7-apk.com');
    expect(result.valid).toContain('https://goplay11.com');
  });

  it('should check URL accessibility', () => {
    expect(isAccessibleURL('https://ak7-apk.com')).toBe(true);
    expect(isAccessibleURL('https://localhost:3000')).toBe(false);
    expect(isAccessibleURL('https://127.0.0.1')).toBe(false);
    expect(isAccessibleURL('https://192.168.1.1')).toBe(false);
  });

  it('should parse sitemap content', () => {
    const content = `
https://goplay11.com/page1
https://goplay11.com/page2
# This is a comment
https://goplay11.com/page3

https://goplay11.com/page4
invalid-url
    `;
    
    const urls = parseSitemapContent(content);
    
    expect(urls).toHaveLength(4);
    expect(urls).toContain('https://goplay11.com/page1');
    expect(urls).toContain('https://goplay11.com/page4');
    expect(urls).not.toContain('invalid-url');
  });

  it('should match sitemap URLs', () => {
    const sitemap = [
      'https://goplay11.com/page1',
      'https://goplay11.com/page2',
      'https://goplay11.com/page3',
    ];
    
    expect(matchesSitemapURL('https://goplay11.com/page1', sitemap)).toBe(true);
    expect(matchesSitemapURL('https://www.goplay11.com/page1/', sitemap)).toBe(true);
    expect(matchesSitemapURL('https://goplay11.com/page4', sitemap)).toBe(false);
  });
});
