// Unit tests for Content Management System
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ContentManagementSystem } from '@/lib/blog/parser';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Unit tests for ContentManagementSystem
 * 
 * Tests:
 * - Frontmatter parsing with sample blogs
 * - Reading time calculation
 * - Blog filtering and sorting
 * 
 * Validates: Requirements 8.1, 8.4, 6.8
 */

describe('ContentManagementSystem', () => {
  let tempDir: string;
  let cms: ContentManagementSystem;

  beforeAll(() => {
    // Create temporary directory structure
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cms-test-'));
    const primaryDir = path.join(tempDir, 'primary');
    const crossPlatformDir = path.join(tempDir, 'cross-platform');
    
    fs.mkdirSync(primaryDir, { recursive: true });
    fs.mkdirSync(crossPlatformDir, { recursive: true });
    
    // Create sample primary blogs
    const primaryBlog1 = `---
title: "Complete Guide to AK7 App"
slug: "ak7-app-complete-guide"
description: "Discover everything about AK7 app including download instructions and features"
keywords: ["ak7 app", "ak7 betting", "ak7 download"]
author: "AK7 Gaming Expert"
publishedAt: "2024-01-15"
updatedAt: "2024-01-20"
category: "primary"
featuredImage: "/ss1.webp"
wordCount: 2650
readingTime: 13
---

# Complete Guide to AK7 App

The AK7 app is a comprehensive gaming platform that offers exciting betting opportunities.

## Features

- Easy download process
- Secure betting environment
- Multiple game options

## How to Download

Follow these simple steps to download the AK7 app.

## Conclusion

Start your gaming journey with AK7 today!`;

    const primaryBlog2 = `---
title: "AK7 Betting Strategies for Beginners"
slug: "ak7-betting-strategies"
description: "Learn effective betting strategies for AK7 app beginners"
keywords: ["ak7 betting", "betting strategies", "ak7 tips"]
author: "AK7 Gaming Expert"
publishedAt: "2024-01-10"
category: "primary"
wordCount: 2800
readingTime: 14
---

# AK7 Betting Strategies for Beginners

Master the art of betting with these proven strategies.

## Understanding Odds

Learn how to read and interpret betting odds.

## Bankroll Management

Manage your funds effectively for long-term success.`;

    // Create sample cross-platform blog
    const crossPlatformBlog = `---
title: "GoPlay11 vs EK7 Game: Complete Comparison"
slug: "goplay11-vs-ek7-comparison"
description: "Detailed comparison between GoPlay11 and EK7 Game platforms"
keywords: ["goplay11", "ek7 game", "comparison"]
author: "Gaming Analyst"
publishedAt: "2024-01-12"
category: "cross-platform"
targetPlatform: "goplay11"
wordCount: 1650
readingTime: 8
---

# GoPlay11 vs EK7 Game: Complete Comparison

Compare two leading gaming platforms side by side.

## Platform Features

Both platforms offer unique features for gamers.

## User Experience

Discover which platform provides better user experience.`;

    fs.writeFileSync(path.join(primaryDir, 'ak7-app-complete-guide.md'), primaryBlog1);
    fs.writeFileSync(path.join(primaryDir, 'ak7-betting-strategies.md'), primaryBlog2);
    fs.writeFileSync(path.join(crossPlatformDir, 'goplay11-vs-ek7-comparison.md'), crossPlatformBlog);
    
    cms = new ContentManagementSystem({
      contentDir: tempDir,
      baseUrl: 'https://ak7xapp.com',
    });
  });

  afterAll(() => {
    // Cleanup temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Frontmatter Parsing', () => {
    it('should parse frontmatter from primary blog correctly', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      expect(blog!.metadata.title).toBe('Complete Guide to AK7 App');
      expect(blog!.metadata.slug).toBe('ak7-app-complete-guide');
      expect(blog!.metadata.description).toBe('Discover everything about AK7 app including download instructions and features');
      expect(blog!.metadata.keywords).toEqual(['ak7 app', 'ak7 betting', 'ak7 download']);
      expect(blog!.metadata.author).toBe('AK7 Gaming Expert');
      expect(blog!.metadata.category).toBe('primary');
      expect(blog!.metadata.featuredImage).toBe('/ss1.webp');
      expect(blog!.metadata.wordCount).toBe(2650);
      expect(blog!.metadata.readingTime).toBe(13);
    });

    it('should parse frontmatter from cross-platform blog correctly', async () => {
      const blog = await cms.getBlogBySlug('goplay11-vs-ek7-comparison');
      
      expect(blog).not.toBeNull();
      expect(blog!.metadata.title).toBe('GoPlay11 vs EK7 Game: Complete Comparison');
      expect(blog!.metadata.category).toBe('cross-platform');
      expect(blog!.metadata.targetPlatform).toBe('goplay11');
    });

    it('should parse dates correctly', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      expect(blog!.metadata.publishedAt).toBeInstanceOf(Date);
      expect(blog!.metadata.updatedAt).toBeInstanceOf(Date);
      expect(blog!.metadata.publishedAt.toISOString()).toContain('2024-01-15');
      expect(blog!.metadata.updatedAt.toISOString()).toContain('2024-01-20');
    });

    it('should default updatedAt to publishedAt when not provided', async () => {
      const blog = await cms.getBlogBySlug('ak7-betting-strategies');
      
      expect(blog).not.toBeNull();
      expect(blog!.metadata.publishedAt).toBeInstanceOf(Date);
      expect(blog!.metadata.updatedAt).toBeInstanceOf(Date);
      expect(blog!.metadata.updatedAt.toISOString()).toBe(blog!.metadata.publishedAt.toISOString());
    });
  });

  describe('Reading Time Calculation', () => {
    it('should calculate reading time correctly for 200 words', () => {
      const content = 'word '.repeat(200);
      const readingTime = cms.calculateReadingTime(content);
      expect(readingTime).toBe(1); // 200 words / 200 wpm = 1 minute
    });

    it('should calculate reading time correctly for 500 words', () => {
      const content = 'word '.repeat(500);
      const readingTime = cms.calculateReadingTime(content);
      expect(readingTime).toBe(3); // 500 words / 200 wpm = 2.5, rounded up to 3
    });

    it('should calculate reading time correctly for 1000 words', () => {
      const content = 'word '.repeat(1000);
      const readingTime = cms.calculateReadingTime(content);
      expect(readingTime).toBe(5); // 1000 words / 200 wpm = 5 minutes
    });

    it('should handle empty content', () => {
      const readingTime = cms.calculateReadingTime('');
      expect(readingTime).toBe(0);
    });

    it('should ignore markdown syntax in word count', () => {
      const content = '# Heading\n\n**Bold text** and *italic text* with [link](url)';
      const readingTime = cms.calculateReadingTime(content);
      expect(readingTime).toBeGreaterThan(0);
    });
  });

  describe('Blog Retrieval', () => {
    it('should retrieve all blogs', async () => {
      const blogs = await cms.getAllBlogs();
      expect(blogs.length).toBe(3);
    });

    it('should sort blogs by publication date (newest first)', async () => {
      const blogs = await cms.getAllBlogs();
      expect(blogs[0].slug).toBe('ak7-app-complete-guide'); // 2024-01-15
      expect(blogs[1].slug).toBe('goplay11-vs-ek7-comparison'); // 2024-01-12
      expect(blogs[2].slug).toBe('ak7-betting-strategies'); // 2024-01-10
    });

    it('should retrieve blog by slug', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      expect(blog).not.toBeNull();
      expect(blog!.metadata.slug).toBe('ak7-app-complete-guide');
    });

    it('should return null for non-existent slug', async () => {
      const blog = await cms.getBlogBySlug('non-existent-blog');
      expect(blog).toBeNull();
    });
  });

  describe('Blog Filtering', () => {
    it('should filter blogs by primary category', async () => {
      const primaryBlogs = await cms.getBlogsByCategory('primary');
      expect(primaryBlogs.length).toBe(2);
      expect(primaryBlogs.every(blog => blog.category === 'primary')).toBe(true);
    });

    it('should filter blogs by cross-platform category', async () => {
      const crossPlatformBlogs = await cms.getBlogsByCategory('cross-platform');
      expect(crossPlatformBlogs.length).toBe(1);
      expect(crossPlatformBlogs[0].category).toBe('cross-platform');
    });
  });

  describe('Related Blogs', () => {
    it('should find related blogs based on shared keywords', async () => {
      const relatedBlogs = await cms.getRelatedBlogs('ak7-app-complete-guide', 2);
      
      // Should return other blogs, sorted by keyword relevance
      expect(relatedBlogs.length).toBeGreaterThan(0);
      expect(relatedBlogs.length).toBeLessThanOrEqual(2);
      
      // Should not include the current blog
      expect(relatedBlogs.every(blog => blog.slug !== 'ak7-app-complete-guide')).toBe(true);
    });

    it('should return empty array for non-existent blog', async () => {
      const relatedBlogs = await cms.getRelatedBlogs('non-existent-blog', 3);
      expect(relatedBlogs).toEqual([]);
    });

    it('should limit results to requested count', async () => {
      const relatedBlogs = await cms.getRelatedBlogs('ak7-app-complete-guide', 1);
      expect(relatedBlogs.length).toBeLessThanOrEqual(1);
    });
  });

  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe content</p><script>alert("XSS")</script>';
      const sanitized = cms.sanitizeHTML(html);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).toContain('Safe content');
    });

    it('should allow safe HTML tags', () => {
      const html = '<h1>Heading</h1><p>Paragraph</p><a href="/link">Link</a>';
      const sanitized = cms.sanitizeHTML(html);
      expect(sanitized).toContain('<h1>');
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<a');
    });

    it('should remove dangerous attributes', () => {
      const html = '<a href="/link" onclick="alert()">Link</a>';
      const sanitized = cms.sanitizeHTML(html);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('href');
    });

    it('should preserve image tags with safe attributes', () => {
      const html = '<img src="/image.jpg" alt="Description" />';
      const sanitized = cms.sanitizeHTML(html);
      expect(sanitized).toContain('<img');
      expect(sanitized).toContain('src');
      expect(sanitized).toContain('alt');
    });
  });

  describe('Table of Contents Extraction', () => {
    it('should extract table of contents from blog content', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      expect(blog!.tableOfContents.length).toBeGreaterThan(0);
      
      // Verify TOC structure
      const toc = blog!.tableOfContents;
      expect(toc.some(item => item.title.includes('Complete Guide'))).toBe(true);
      expect(toc.some(item => item.title.includes('Features'))).toBe(true);
      expect(toc.some(item => item.title.includes('Download'))).toBe(true);
    });

    it('should assign correct heading levels', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      const toc = blog!.tableOfContents;
      
      // H1 should be level 1
      const h1Items = toc.filter(item => item.level === 1);
      expect(h1Items.length).toBeGreaterThan(0);
      
      // H2 should be level 2
      const h2Items = toc.filter(item => item.level === 2);
      expect(h2Items.length).toBeGreaterThan(0);
    });

    it('should generate URL-friendly IDs', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      const toc = blog!.tableOfContents;
      
      // All IDs should be lowercase and use hyphens
      toc.forEach(item => {
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
        expect(item.id).not.toContain(' ');
        expect(item.id).not.toContain('_');
      });
    });
  });

  describe('Excerpt Generation', () => {
    it('should generate excerpt from blog content', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      expect(blog!.excerpt).toBeTruthy();
      expect(blog!.excerpt.length).toBeLessThanOrEqual(163); // 160 + "..."
    });

    it('should remove markdown syntax from excerpt', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      expect(blog!.excerpt).not.toContain('#');
      expect(blog!.excerpt).not.toContain('**');
      expect(blog!.excerpt).not.toContain('[');
    });

    it('should end with ellipsis if truncated', async () => {
      const blog = await cms.getBlogBySlug('ak7-app-complete-guide');
      
      expect(blog).not.toBeNull();
      if (blog!.excerpt.length > 160) {
        expect(blog!.excerpt).toMatch(/\.\.\.$/);
      }
    });
  });

  describe('Static Path Generation', () => {
    it('should generate static paths for all blogs', async () => {
      const paths = await cms.generateStaticPaths();
      
      expect(paths.length).toBe(3);
      expect(paths).toContain('ak7-app-complete-guide');
      expect(paths).toContain('ak7-betting-strategies');
      expect(paths).toContain('goplay11-vs-ek7-comparison');
    });
  });

  describe('Sitemap Generation', () => {
    it('should generate valid sitemap XML', async () => {
      const sitemap = await cms.generateSitemap();
      
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('</urlset>');
    });

    it('should include all blog URLs in sitemap', async () => {
      const sitemap = await cms.generateSitemap();
      
      expect(sitemap).toContain('/blog/ak7-app-complete-guide');
      expect(sitemap).toContain('/blog/ak7-betting-strategies');
      expect(sitemap).toContain('/blog/goplay11-vs-ek7-comparison');
    });

    it('should include lastmod dates in sitemap', async () => {
      const sitemap = await cms.generateSitemap();
      
      expect(sitemap).toContain('<lastmod>');
      expect(sitemap).toContain('2024-01-');
    });

    it('should include priority and changefreq in sitemap', async () => {
      const sitemap = await cms.generateSitemap();
      
      expect(sitemap).toContain('<priority>');
      expect(sitemap).toContain('<changefreq>');
    });
  });
});
