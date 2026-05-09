/**
 * Backlink management system for strategic link placement
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  Backlink,
  BacklinkStrategy,
  SitemapURL,
  SitemapEntry,
  BacklinkError,
} from '@/types/blog';
import { isValidURL, parseSitemapContent, belongsToPlatform } from '@/lib/utils/validation';

/**
 * BacklinkManager handles strategic placement of internal and external links
 */
export class BacklinkManager {
  private sitemapURLs: Map<string, SitemapURL[]>;

  constructor(
    private strategy: BacklinkStrategy,
    sitemapURLs?: Map<string, SitemapURL[]>
  ) {
    this.sitemapURLs = sitemapURLs || new Map();
  }

  /**
   * Loads sitemap URLs from a file
   * @param platform - Platform name (goplay11, habet, dhan7)
   */
  async loadSitemapURLs(platform: 'goplay11' | 'habet' | 'dhan7'): Promise<SitemapURL[]> {
    const sitemapPath = path.join(process.cwd(), `${platform}-sitemap.text`);
    
    try {
      const content = await fs.readFile(sitemapPath, 'utf-8');
      const urls = this.parseSitemapFile(content, platform);
      this.sitemapURLs.set(platform, urls);
      return urls;
    } catch (error) {
      console.error(`Failed to load sitemap for ${platform}:`, error);
      return [];
    }
  }

  /**
   * Parses sitemap file content
   * @param content - Sitemap file content
   * @param platform - Platform name
   */
  private parseSitemapFile(content: string, platform: 'goplay11' | 'habet' | 'dhan7'): SitemapURL[] {
    const urls = parseSitemapContent(content);
    return urls.map(url => ({
      url,
      platform,
    }));
  }

  /**
   * Inserts backlinks into blog content
   * @param content - Blog content
   * @param blogType - Type of blog (primary or cross-platform)
   * @param targetPlatform - Target platform for cross-platform blogs
   */
  async insertBacklinks(
    content: string,
    blogType: 'primary' | 'cross-platform',
    targetPlatform?: 'goplay11' | 'habet' | 'dhan7'
  ): Promise<{ content: string; backlinks: Backlink[] }> {
    const backlinks: Backlink[] = [];
    
    // Determine link counts based on blog type
    let internalCount: number;
    let externalCount: number;
    
    if (blogType === 'primary') {
      const totalLinks = this.strategy.totalLinks;
      internalCount = Math.ceil(totalLinks * (this.strategy.internalPercentage / 100));
      externalCount = totalLinks - internalCount;
    } else {
      // Cross-platform blogs: 5+ external to target platform, 3+ internal
      internalCount = 3;
      externalCount = 5;
    }
    
    // Select links
    const internalLinks = this.selectInternalLinks(internalCount);
    const externalLinks = this.selectExternalLinks(
      externalCount,
      targetPlatform ? [targetPlatform] : ['goplay11', 'habet', 'dhan7']
    );
    
    const allLinks = [...internalLinks, ...externalLinks];
    
    // Find optimal positions for links
    const positions = this.findOptimalPositions(content, allLinks.length);
    
    // Insert links at positions
    let modifiedContent = content;
    let offset = 0;
    
    for (let i = 0; i < allLinks.length && i < positions.length; i++) {
      const link = allLinks[i];
      const position = positions[i] + offset;
      
      // Generate anchor text based on context
      const context = this.getContext(modifiedContent, position);
      const anchorText = this.generateAnchorText(link.url, context, link.platform);
      
      // Create markdown link
      const markdownLink = `[${anchorText}](${link.url})`;
      
      // Insert link
      modifiedContent = 
        modifiedContent.slice(0, position) +
        markdownLink +
        modifiedContent.slice(position);
      
      offset += markdownLink.length;
      
      // Add to backlinks array
      backlinks.push({
        ...link,
        anchorText,
        position,
      });
    }
    
    // Validate link distribution
    if (!this.validateLinkDistribution(backlinks, modifiedContent)) {
      console.warn('Link distribution validation failed - some paragraphs may have too many links');
    }
    
    return { content: modifiedContent, backlinks };
  }

  /**
   * Selects internal links to Ak7xapp.com pages
   * @param count - Number of internal links to select
   */
  private selectInternalLinks(count: number): Backlink[] {
    const internalPages = [
      { url: 'https://ak7-apk.com/', platform: 'ak7' as const },
      { url: 'https://ak7-apk.com/disclaimer', platform: 'ak7' as const },
      { url: 'https://ak7-apk.com/privacy-policy', platform: 'ak7' as const },
      { url: 'https://ak7-apk.com/contact', platform: 'ak7' as const },
    ];
    
    const links: Backlink[] = [];
    
    for (let i = 0; i < count; i++) {
      const page = internalPages[i % internalPages.length];
      links.push({
        id: `internal-${i}`,
        url: page.url,
        anchorText: '', // Will be generated later
        type: 'internal',
        platform: page.platform,
        position: 0, // Will be set later
        context: '',
      });
    }
    
    return links;
  }

  /**
   * Selects external links to partner platforms
   * @param count - Number of external links to select
   * @param platforms - Platforms to select from
   */
  private selectExternalLinks(
    count: number,
    platforms: ('goplay11' | 'habet' | 'dhan7')[]
  ): Backlink[] {
    const links: Backlink[] = [];
    const platformCounts = new Map<string, number>();
    
    // Distribute links evenly across platforms
    for (let i = 0; i < count; i++) {
      const platform = platforms[i % platforms.length];
      platformCounts.set(platform, (platformCounts.get(platform) || 0) + 1);
    }
    
    // Select URLs from each platform
    for (const [platform, linkCount] of platformCounts.entries()) {
      const platformURLs = this.sitemapURLs.get(platform) || [];
      
      for (let i = 0; i < linkCount; i++) {
        if (platformURLs.length === 0) {
          console.warn(`No sitemap URLs available for platform: ${platform}`);
          continue;
        }
        
        const sitemapURL = platformURLs[i % platformURLs.length];
        links.push({
          id: `external-${platform}-${i}`,
          url: sitemapURL.url,
          anchorText: '', // Will be generated later
          type: 'external',
          platform: sitemapURL.platform,
          position: 0, // Will be set later
          context: '',
        });
      }
    }
    
    return links;
  }

  /**
   * Finds optimal positions for links in content
   * Distributes links evenly throughout the content
   * @param content - Blog content
   * @param linkCount - Number of links to place
   */
  private findOptimalPositions(content: string, linkCount: number): number[] {
    const positions: number[] = [];
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\n+/);
    const paragraphPositions: number[] = [];
    let currentPos = 0;
    
    for (const paragraph of paragraphs) {
      paragraphPositions.push(currentPos);
      currentPos += paragraph.length + 2; // +2 for \n\n
    }
    
    // Distribute links evenly across paragraphs
    const step = Math.max(1, Math.floor(paragraphs.length / linkCount));
    
    for (let i = 0; i < linkCount && i * step < paragraphPositions.length; i++) {
      const paragraphIndex = Math.min(i * step, paragraphPositions.length - 1);
      const paragraphStart = paragraphPositions[paragraphIndex];
      const paragraphLength = paragraphs[paragraphIndex]?.length || 0;
      
      // Place link in the middle of the paragraph
      const position = paragraphStart + Math.floor(paragraphLength / 2);
      positions.push(position);
    }
    
    return positions.sort((a, b) => a - b);
  }

  /**
   * Gets context around a position in content
   * @param content - Blog content
   * @param position - Position in content
   * @param contextLength - Length of context to extract
   */
  private getContext(content: string, position: number, contextLength: number = 50): string {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(content.length, position + contextLength);
    return content.slice(start, end);
  }

  /**
   * Generates contextually relevant anchor text
   * @param url - URL to link to
   * @param context - Surrounding text context
   * @param platform - Platform name
   */
  private generateAnchorText(
    url: string,
    context: string,
    platform?: 'ak7' | 'goplay11' | 'habet' | 'dhan7'
  ): string {
    // Platform-specific anchor texts
    const platformAnchors: Record<string, string[]> = {
      ak7: [
        'AK7 app',
        'EK7 game',
        'AK7 betting platform',
        'download AK7',
        'AK7 features',
      ],
      goplay11: [
        'GoPlay11 platform',
        'GoPlay11 gaming',
        'GoPlay11 features',
        'GoPlay11 app',
        'GoPlay11 betting',
      ],
      habet: [
        'Habet platform',
        'Habet gaming',
        'Habet features',
        'Habet app',
        'Habet betting',
      ],
      dhan7: [
        'Dhan7 platform',
        'Dhan7 gaming',
        'Dhan7 features',
        'Dhan7 app',
        'Dhan7 betting',
      ],
    };
    
    // Select anchor text based on platform
    if (platform && platformAnchors[platform]) {
      const anchors = platformAnchors[platform];
      return anchors[Math.floor(Math.random() * anchors.length)];
    }
    
    // Default anchor texts
    const defaultAnchors = [
      'learn more',
      'explore features',
      'get started',
      'discover more',
      'find out more',
    ];
    
    return defaultAnchors[Math.floor(Math.random() * defaultAnchors.length)];
  }

  /**
   * Validates link distribution in content
   * Ensures no paragraph has more than maxLinksPerParagraph links
   * @param backlinks - Array of backlinks
   * @param content - Blog content
   */
  private validateLinkDistribution(backlinks: Backlink[], content: string): boolean {
    const paragraphs = content.split(/\n\n+/);
    let currentPos = 0;
    
    for (const paragraph of paragraphs) {
      const paragraphEnd = currentPos + paragraph.length;
      
      // Count links in this paragraph
      const linksInParagraph = backlinks.filter(
        link => link.position >= currentPos && link.position < paragraphEnd
      ).length;
      
      if (linksInParagraph > this.strategy.maxLinksPerParagraph) {
        return false;
      }
      
      currentPos = paragraphEnd + 2; // +2 for \n\n
    }
    
    return true;
  }
}
