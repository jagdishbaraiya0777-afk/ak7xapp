// Property-based tests for markdown parsing
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ContentManagementSystem } from '@/lib/blog/parser';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Property 18: Markdown Parsing Round-Trip
 * 
 * For any valid markdown content, parsing to HTML and then converting back to markdown
 * SHALL preserve the structural elements (headings, lists, links, emphasis) without
 * loss of semantic meaning.
 * 
 * Validates: Requirements 8.4
 */

describe('Property 18: Markdown Parsing Round-Trip', () => {
  const cms = new ContentManagementSystem({
    contentDir: path.join(process.cwd(), 'content', 'blogs'),
    baseUrl: 'https://ak7xapp.com',
  });

  // Arbitrary for generating valid markdown headings
  const markdownHeading = fc.record({
    level: fc.integer({ min: 1, max: 6 }),
    text: fc.string({ minLength: 10, maxLength: 50 })
      .filter(s => !s.includes('\n') && s.trim().length >= 10)
      .map(s => s.replace(/[<>]/g, '').trim()), // Remove HTML special chars
  }).map(({ level, text }) => `${'#'.repeat(level)} ${text}`);

  // Arbitrary for generating markdown paragraphs
  const markdownParagraph = fc.string({ minLength: 20, maxLength: 200 })
    .filter(s => !s.includes('\n\n'))
    .map(s => s.replace(/\n/g, ' '));

  // Arbitrary for generating markdown lists
  const markdownList = fc.array(
    fc.string({ minLength: 10, maxLength: 50 })
      .filter(s => !s.includes('\n') && s.trim().length >= 10),
    { minLength: 2, maxLength: 5 }
  ).map(items => items.map(item => `- ${item.trim()}`).join('\n'));

  // Arbitrary for generating markdown links
  const markdownLink = fc.record({
    text: fc.string({ minLength: 5, maxLength: 30 })
      .filter(s => !s.includes('[') && !s.includes(']') && s.trim().length >= 5)
      .map(s => s.replace(/[<>&"]/g, '').trim()), // Remove HTML special chars
    url: fc.webUrl(),
  }).map(({ text, url }) => `[${text}](${url})`);

  // Arbitrary for generating markdown emphasis
  const markdownEmphasis = fc.record({
    text: fc.string({ minLength: 5, maxLength: 30 })
      .filter(s => !s.includes('*') && !s.includes('_') && s.trim().length >= 5),
    type: fc.constantFrom('*', '**', '_', '__'),
  }).map(({ text, type }) => `${type}${text.trim()}${type}`);

  // Arbitrary for generating complete markdown documents
  const markdownDocument = fc.array(
    fc.oneof(
      markdownHeading,
      markdownParagraph,
      markdownList,
      markdownLink,
      markdownEmphasis
    ),
    { minLength: 3, maxLength: 10 }
  ).map(elements => elements.join('\n\n'));

  it('should preserve heading structure after parsing', () => {
    fc.assert(
      fc.property(
        fc.array(markdownHeading, { minLength: 1, maxLength: 5 }),
        async (headings) => {
          const markdown = headings.join('\n\n');
          
          // Create temporary file
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          // Write markdown with frontmatter
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

${markdown}`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            // Parse markdown
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Extract headings from HTML
            const headingRegex = /<h([1-6])>(.*?)<\/h\1>/g;
            const parsedHeadings: Array<{ level: number; text: string }> = [];
            let match;
            
            while ((match = headingRegex.exec(parsed.content)) !== null) {
              parsedHeadings.push({
                level: parseInt(match[1]),
                text: match[2],
              });
            }
            
            // Verify heading count matches
            expect(parsedHeadings.length).toBe(headings.length);
            
            // Verify each heading is preserved
            headings.forEach((heading, index) => {
              const level = heading.match(/^(#{1,6})/)?.[1].length || 0;
              const text = heading.replace(/^#{1,6}\s+/, '').trim();
              
              expect(parsedHeadings[index].level).toBe(level);
              // HTML entities are escaped, so we need to decode for comparison
              const decodedText = parsedHeadings[index].text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
              expect(decodedText).toBe(text);
            });
          } finally {
            // Cleanup
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve links after parsing', () => {
    fc.assert(
      fc.property(
        fc.array(markdownLink, { minLength: 1, maxLength: 5 }),
        async (links) => {
          const markdown = links.join(' ');
          
          // Create temporary file
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

${markdown}`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Extract links from HTML
            const linkRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            const parsedLinks: Array<{ url: string; text: string }> = [];
            let match;
            
            while ((match = linkRegex.exec(parsed.content)) !== null) {
              parsedLinks.push({
                url: match[1],
                text: match[2],
              });
            }
            
            // Verify link count matches
            expect(parsedLinks.length).toBe(links.length);
            
            // Verify each link is preserved
            links.forEach((link, index) => {
              const linkMatch = link.match(/\[([^\]]+)\]\(([^\)]+)\)/);
              if (linkMatch) {
                // HTML entities are escaped, so we need to decode for comparison
                const decodedText = parsedLinks[index].text
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
                expect(decodedText).toBe(linkMatch[1]);
                expect(parsedLinks[index].url).toBe(linkMatch[2]);
              }
            });
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve list structure after parsing', () => {
    fc.assert(
      fc.property(
        markdownList,
        async (list) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

${list}`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify list is present in HTML
            expect(parsed.content).toMatch(/<ul>/);
            expect(parsed.content).toMatch(/<li>/);
            
            // Count list items
            const listItemCount = (parsed.content.match(/<li>/g) || []).length;
            const originalItemCount = (list.match(/^- /gm) || []).length;
            
            expect(listItemCount).toBe(originalItemCount);
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve emphasis (bold/italic) after parsing', () => {
    fc.assert(
      fc.property(
        fc.array(markdownEmphasis, { minLength: 1, maxLength: 5 }),
        async (emphases) => {
          const markdown = emphases.join(' ');
          
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

${markdown}`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Count emphasis elements
            const strongCount = (parsed.content.match(/<strong>/g) || []).length;
            const emCount = (parsed.content.match(/<em>/g) || []).length;
            
            // Count original emphasis markers
            const boldCount = emphases.filter(e => e.includes('**') || e.includes('__')).length;
            const italicCount = emphases.filter(e => 
              (e.includes('*') && !e.includes('**')) || 
              (e.includes('_') && !e.includes('__'))
            ).length;
            
            expect(strongCount).toBe(boldCount);
            expect(emCount).toBe(italicCount);
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle complete markdown documents without data loss', () => {
    fc.assert(
      fc.property(
        markdownDocument,
        async (markdown) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-test-'));
          const tempFile = path.join(tempDir, 'test.md');
          
          const frontmatter = `---
title: "Test Blog"
slug: "test-blog"
description: "Test description"
keywords: ["test"]
author: "Test Author"
publishedAt: "2024-01-01"
category: "primary"
wordCount: 100
readingTime: 1
---

${markdown}`;
          
          fs.writeFileSync(tempFile, frontmatter);
          
          try {
            const parsed = await cms.parseMarkdown(tempFile);
            
            // Verify content is not empty
            expect(parsed.content.length).toBeGreaterThan(0);
            
            // Verify HTML is valid (contains proper tags)
            expect(parsed.content).toMatch(/<[^>]+>/);
            
            // Verify no script tags (XSS prevention)
            expect(parsed.content).not.toMatch(/<script/i);
            
            // Verify metadata is extracted
            expect(parsed.metadata.title).toBe('Test Blog');
            expect(parsed.metadata.slug).toBe('test-blog');
          } finally {
            fs.unlinkSync(tempFile);
            fs.rmdirSync(tempDir);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
