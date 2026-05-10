// Content Management System for parsing and managing blog content
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import DOMPurify from 'isomorphic-dompurify';
import type { BlogMetadata, BlogContent, TOCItem } from '@/types/blog';

export interface ContentManagementSystemConfig {
  contentDir: string;
  baseUrl: string;
}

export class ContentManagementSystem {
  private contentDir: string;
  private baseUrl: string;

  constructor(config: ContentManagementSystemConfig) {
    this.contentDir = config.contentDir;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Parse markdown file with frontmatter extraction
   * Requirement 8.4: Parse markdown content to HTML with proper sanitization
   */
  async parseMarkdown(filePath: string): Promise<BlogContent> {
    try {
      // Read the markdown file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parse frontmatter and content
      const { data, content: rawContent } = matter(fileContent);
      
      // Extract metadata from frontmatter
      const metadata = this.extractFrontmatter(data, filePath);
      
      // Keep blog markdown authoritative. Runtime backlink insertion can introduce
      // unnatural anchors in headings/words, which hurts content quality signals.
      const backlinks: any[] = [];
      const finalMarkdown = rawContent;
      const htmlContent = await this.parseMarkdownToHTML(finalMarkdown);

      // Extract table of contents
      const tableOfContents = this.extractTableOfContents(finalMarkdown);

      // Generate excerpt (first 160 characters of content)
      const excerpt = this.generateExcerpt(finalMarkdown);
      
      return {
        metadata,
        content: htmlContent,
        excerpt,
        tableOfContents,
        backlinks: backlinks as any,
      };
    } catch (error) {
      throw new Error(`Failed to parse markdown file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   * Requirement 8.4: Implement sanitizeHTML() for XSS prevention
   */
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'a', 'strong', 'em', 'code', 'pre',
        'blockquote', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'target', 'rel',
        'src', 'alt', 'width', 'height',
        'class', 'id',
      ],
      ALLOW_DATA_ATTR: false,
    });
  }

  /**
   * Calculate reading time based on word count
   * Requirement 6.8: Calculate reading time based on word count
   * Assumes average reading speed of 200 words per minute
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  }

  /**
   * Get all blogs from the content directory
   * Requirement 8.1: Scan content directory for all blogs
   */
  async getAllBlogs(): Promise<BlogMetadata[]> {
    const blogs: BlogMetadata[] = [];
    
    // Scan primary blogs
    const primaryDir = path.join(this.contentDir, 'primary');
    if (fs.existsSync(primaryDir)) {
      const primaryFiles = fs.readdirSync(primaryDir).filter(file => file.endsWith('.md'));
      for (const file of primaryFiles) {
        const filePath = path.join(primaryDir, file);
        const blog = await this.parseMarkdown(filePath);
        blogs.push(blog.metadata);
      }
    }
    
    // Scan cross-platform blogs
    const crossPlatformDir = path.join(this.contentDir, 'cross-platform');
    if (fs.existsSync(crossPlatformDir)) {
      const crossPlatformFiles = fs.readdirSync(crossPlatformDir).filter(file => file.endsWith('.md'));
      for (const file of crossPlatformFiles) {
        const filePath = path.join(crossPlatformDir, file);
        const blog = await this.parseMarkdown(filePath);
        blogs.push(blog.metadata);
      }
    }
    
    // Sort by publication date (newest first)
    blogs.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    return blogs;
  }

  /**
   * Get a single blog by slug
   * Requirement 8.5: Retrieve single blog by slug
   */
  async getBlogBySlug(slug: string): Promise<BlogContent | null> {
    // Try primary blogs first
    const primaryPath = path.join(this.contentDir, 'primary', `${slug}.md`);
    if (fs.existsSync(primaryPath)) {
      return await this.parseMarkdown(primaryPath);
    }
    
    // Try cross-platform blogs
    const crossPlatformPath = path.join(this.contentDir, 'cross-platform', `${slug}.md`);
    if (fs.existsSync(crossPlatformPath)) {
      return await this.parseMarkdown(crossPlatformPath);
    }
    
    return null;
  }

  /**
   * Get blogs by category
   * Requirement 8.5: Filter blogs by category
   */
  async getBlogsByCategory(category: 'primary' | 'cross-platform'): Promise<BlogMetadata[]> {
    const allBlogs = await this.getAllBlogs();
    return allBlogs.filter(blog => blog.category === category);
  }

  /**
   * Get related blogs based on keywords and category
   * Requirement 8.5: Retrieve related content
   */
  async getRelatedBlogs(slug: string, count: number = 3): Promise<BlogMetadata[]> {
    const currentBlog = await this.getBlogBySlug(slug);
    if (!currentBlog) {
      return [];
    }
    
    const allBlogs = await this.getAllBlogs();
    
    // Filter out the current blog
    const otherBlogs = allBlogs.filter(blog => blog.slug !== slug);
    
    // Calculate relevance score based on shared keywords
    const scoredBlogs = otherBlogs.map(blog => {
      const sharedKeywords = blog.keywords.filter(keyword =>
        currentBlog.metadata.keywords.includes(keyword)
      );
      const score = sharedKeywords.length;
      return { blog, score };
    });
    
    // Sort by relevance score and return top N
    scoredBlogs.sort((a, b) => b.score - a.score);
    return scoredBlogs.slice(0, count).map(item => item.blog);
  }

  /**
   * Generate static paths for Next.js SSG
   * Requirement 8.3, 8.7: Generate static paths for all blogs
   */
  async generateStaticPaths(): Promise<string[]> {
    const blogs = await this.getAllBlogs();
    return blogs.map(blog => blog.slug);
  }

  /**
   * Generate sitemap.xml content
   * Requirement 8.8: Generate sitemap.xml including all blog URLs
   */
  async generateSitemap(): Promise<string> {
    const blogs = await this.getAllBlogs();
    
    const urls = blogs.map(blog => {
      const lastmod = blog.updatedAt.toISOString().split('T')[0];
      return `  <url>
    <loc>${this.baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  /**
   * Extract frontmatter metadata from parsed data
   * Requirement 6.8: Extract all required metadata fields
   */
  private extractFrontmatter(data: any, filePath: string): BlogMetadata {
    // Validate required fields
    const requiredFields = ['title', 'slug', 'description', 'keywords', 'author', 'publishedAt', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required frontmatter field: ${field} in ${filePath}`);
      }
    }
    
    return {
      title: data.title,
      slug: data.slug,
      description: data.description,
      keywords: Array.isArray(data.keywords) ? data.keywords : [data.keywords],
      author: data.author,
      publishedAt: new Date(data.publishedAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(data.publishedAt),
      category: data.category,
      targetPlatform: data.targetPlatform,
      featuredImage: data.featuredImage,
      wordCount: data.wordCount || 0,
      readingTime: data.readingTime || 0,
    };
  }

  /**
   * Convert markdown to HTML using remark
   */
  private async parseMarkdownToHTML(markdown: string): Promise<string> {
    const result = await unified()
      .use(remarkParse)
      .use(remarkHtml, { sanitize: false }) // We'll sanitize separately with DOMPurify
      .process(markdown);
    
    let html = String(result);
    
    // Inject IDs into headings for TOC navigation
    html = this.injectHeadingIds(html);
    
    // Add CSS classes to links for styling
    html = this.addLinkClasses(html);
    
    return this.sanitizeHTML(html);
  }

  /**
   * Inject ID attributes into heading elements for TOC navigation
   */
  private injectHeadingIds(html: string): string {
    // Match headings h2-h6 and extract the text content
    const headingRegex = /(<h[2-6])(>([^<]+)<\/h[2-6]>)/g;
    
    return html.replace(headingRegex, (match, openTag, closeContent, textContent) => {
      const id = this.generateHeadingId(textContent);
      return `${openTag} id="${id}"${closeContent}`;
    });
  }

  /**
   * Add CSS classes to links for internal vs external distinction
   */
  private addLinkClasses(html: string): string {
    // Match all anchor tags
    const linkRegex = /<a\s+href=["']([^"']+)["']([^>]*)>/g;
    
    return html.replace(linkRegex, (match, href, attributes) => {
      // Determine if link is internal or external
      const isInternal = 
        href.startsWith('/') || 
        href.startsWith('https://ak7x.games') ||
        href.includes('localhost');
      
      const className = isInternal ? 'internal-link' : 'external-link';
      let nextAttributes = attributes;
      
      // Check if class attribute already exists
      if (nextAttributes.includes('class=')) {
        // Append to existing class
        nextAttributes = nextAttributes.replace(/class=["']([^"']*)["']/g, `class="$1 ${className}"`);
      } else {
        nextAttributes = ` class="${className}"${nextAttributes}`;
      }

      if (!isInternal) {
        if (!/\btarget=/.test(nextAttributes)) {
          nextAttributes += ' target="_blank"';
        }
        if (!/\brel=/.test(nextAttributes)) {
          nextAttributes += ' rel="noopener"';
        }
      }

      return `<a href="${href}"${nextAttributes}>`;
    });
  }

  /**
   * Extract table of contents from markdown content
   * Requirement 6.2: Generate TOC from heading structure
   */
  private extractTableOfContents(content: string): TOCItem[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const toc: TOCItem[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = this.generateHeadingId(title);
      
      toc.push({
        id,
        title,
        level,
      });
    }
    
    return toc;
  }

  /**
   * Generate a URL-friendly ID from heading text
   */
  private generateHeadingId(heading: string): string {
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Generate excerpt from content (first 160 characters)
   */
  private generateExcerpt(content: string): string {
    // Remove markdown syntax for excerpt
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headings
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .replace(/[*_~`]/g, '') // Remove emphasis markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Take first 160 characters
    if (plainText.length <= 160) {
      return plainText;
    }
    
    // Find last complete word within 160 characters
    const truncated = plainText.substring(0, 160);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    // Remove markdown syntax
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();
    
    // Split by whitespace and count
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }
}
