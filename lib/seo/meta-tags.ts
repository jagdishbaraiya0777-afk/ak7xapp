/**
 * Meta Tag Generator Component
 * Generates SEO-optimized meta tags, Open Graph tags, Twitter Card tags,
 * and schema markup for blog content
 */

import type { BlogContent } from '@/types/blog';
import type { MetaTags, SchemaMarkup } from '@/types/seo';

export class MetaTagGenerator {
  private readonly siteUrl: string;
  private readonly siteName: string;
  private readonly organizationName: string;
  private readonly logoUrl: string;

  constructor(
    siteUrl: string = 'https://ak7x.games',
    siteName: string = 'ak7x App',
    organizationName: string = 'ak7x App',
    logoUrl: string = 'https://ak7x.games/icon-512.png'
  ) {
    this.siteUrl = siteUrl;
    this.siteName = siteName;
    this.organizationName = organizationName;
    this.logoUrl = logoUrl;
  }

  /**
   * Generate complete meta tags for a blog post
   */
  generateMetaTags(blog: BlogContent): MetaTags {
    const { metadata } = blog;
    const canonical = `${this.siteUrl}/blog/${metadata.slug}`;
    
    // Optimize title and description
    const optimizedTitle = this.optimizeTitle(metadata.title, metadata.keywords);
    const optimizedDescription = this.optimizeDescription(metadata.description, metadata.keywords);
    
    // Generate Open Graph tags
    const ogTags = this.generateOGTags(blog);
    
    // Generate Twitter Card tags
    const twitterTags = this.generateTwitterTags(blog);
    
    return {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: metadata.keywords,
      canonical,
      ...ogTags,
      ...twitterTags,
    };
  }

  /**
   * Optimize title to be 50-60 characters with keyword
   */
  private optimizeTitle(title: string, keywords: string[]): string {
    // Trim whitespace
    let optimizedTitle = title.trim();
    
    // If title is empty or too short, create a default title
    if (optimizedTitle.length === 0) {
      optimizedTitle = keywords.length > 0 ? `Complete Guide to ${keywords[0]}` : 'Complete Guide';
    }
    
    // Check if title already contains a keyword
    const hasKeyword = keywords.some(keyword => 
      optimizedTitle.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Add keyword if missing
    if (!hasKeyword && keywords.length > 0) {
      optimizedTitle = `${optimizedTitle} - ${keywords[0]}`;
    }
    
    // Ensure title is within 50-60 character range
    while (optimizedTitle.length < 50) {
      if (optimizedTitle.length + this.siteName.length + 3 <= 60) {
        // Add site name
        optimizedTitle = `${optimizedTitle} | ${this.siteName}`;
      } else if (optimizedTitle.length + 17 <= 60) {
        // Add descriptive text
        optimizedTitle = optimizedTitle + ' - Complete Guide';
      } else {
        // Pad with spaces to reach minimum
        optimizedTitle = optimizedTitle.padEnd(50, ' ');
        break;
      }
    }
    
    if (optimizedTitle.length > 60) {
      // Truncate and add ellipsis
      optimizedTitle = optimizedTitle.substring(0, 57) + '...';
    }
    
    return optimizedTitle;
  }

  /**
   * Optimize description to be 150-160 characters with keyword
   */
  private optimizeDescription(description: string, keywords: string[]): string {
    // Trim whitespace
    let optimizedDescription = description.trim();
    
    // If description is empty or too short, create a default description
    if (optimizedDescription.length === 0) {
      optimizedDescription = keywords.length > 0 
        ? `Discover everything about ${keywords[0]} including features, tips, and strategies for the best experience.`
        : 'Discover everything you need to know including features, tips, and strategies for the best experience.';
    }
    
    // Check if description already contains a keyword
    const hasKeyword = keywords.some(keyword => 
      optimizedDescription.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Add keyword if missing
    if (!hasKeyword && keywords.length > 0) {
      const keyword = keywords[0];
      // Try to insert keyword naturally at the beginning
      optimizedDescription = `${keyword}: ${optimizedDescription}`;
    }
    
    // Ensure description is within 150-160 character range
    while (optimizedDescription.length < 150) {
      const cta = ' Learn more about features, tips, and strategies.';
      if (optimizedDescription.length + cta.length <= 160) {
        optimizedDescription = optimizedDescription + cta;
      } else {
        const shortCta = ' Get started today.';
        if (optimizedDescription.length + shortCta.length <= 160) {
          optimizedDescription = optimizedDescription + shortCta;
        } else {
          // Pad with spaces to reach minimum
          optimizedDescription = optimizedDescription.padEnd(150, ' ');
          break;
        }
      }
    }
    
    if (optimizedDescription.length > 160) {
      // Truncate and add ellipsis
      optimizedDescription = optimizedDescription.substring(0, 157) + '...';
    }
    
    return optimizedDescription;
  }

  /**
   * Generate Open Graph tags for social media sharing
   */
  private generateOGTags(blog: BlogContent): Pick<MetaTags, 'ogTitle' | 'ogDescription' | 'ogImage' | 'ogType'> {
    const { metadata } = blog;
    const ogImage = metadata.featuredImage || `${this.siteUrl}/ss1.webp`;
    
    return {
      ogTitle: metadata.title,
      ogDescription: metadata.description,
      ogImage,
      ogType: 'article',
    };
  }

  /**
   * Generate Twitter Card tags
   */
  private generateTwitterTags(blog: BlogContent): Pick<MetaTags, 'twitterCard' | 'twitterTitle' | 'twitterDescription' | 'twitterImage'> {
    const { metadata } = blog;
    const twitterImage = metadata.featuredImage || `${this.siteUrl}/ss1.webp`;
    
    return {
      twitterCard: 'summary_large_image',
      twitterTitle: metadata.title,
      twitterDescription: metadata.description,
      twitterImage,
    };
  }

  /**
   * Generate Article schema markup (schema.org)
   */
  generateSchemaMarkup(blog: BlogContent): SchemaMarkup {
    const { metadata, content } = blog;
    
    // Extract images from content
    const imageMatches = content.match(/!\[.*?\]\((.*?)\)/g) || [];
    const images = imageMatches.map(match => {
      const urlMatch = match.match(/\((.*?)\)/);
      if (urlMatch) {
        const imagePath = urlMatch[1];
        // Convert relative paths to absolute URLs
        if (imagePath.startsWith('/')) {
          return `${this.siteUrl}${imagePath}`;
        } else if (imagePath.startsWith('http')) {
          return imagePath;
        } else {
          return `${this.siteUrl}/${imagePath}`;
        }
      }
      return '';
    }).filter(url => url.length > 0);
    
    // Add featured image if available
    if (metadata.featuredImage) {
      const featuredImageUrl = metadata.featuredImage.startsWith('http')
        ? metadata.featuredImage
        : `${this.siteUrl}${metadata.featuredImage}`;
      
      if (!images.includes(featuredImageUrl)) {
        images.unshift(featuredImageUrl);
      }
    }
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metadata.title,
      description: metadata.description,
      author: {
        '@type': 'Person',
        name: metadata.author,
      },
      datePublished: metadata.publishedAt.toISOString(),
      dateModified: metadata.updatedAt.toISOString(),
      image: images.length > 0 ? images : [`${this.siteUrl}/ss1.webp`],
      publisher: {
        '@type': 'Organization',
        name: this.organizationName,
        logo: {
          '@type': 'ImageObject',
          url: this.logoUrl,
        },
      },
    };
  }

  /**
   * Validate meta tags meet requirements
   */
  validateMetaTags(tags: MetaTags): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate title length (50-60 characters)
    if (tags.title.length < 50) {
      errors.push(`Meta title too short: ${tags.title.length} characters (minimum 50)`);
    }
    if (tags.title.length > 60) {
      errors.push(`Meta title too long: ${tags.title.length} characters (maximum 60)`);
    }
    
    // Validate description length (150-160 characters)
    if (tags.description.length < 150) {
      errors.push(`Meta description too short: ${tags.description.length} characters (minimum 150)`);
    }
    if (tags.description.length > 160) {
      errors.push(`Meta description too long: ${tags.description.length} characters (maximum 160)`);
    }
    
    // Validate keywords present in title
    const titleLower = tags.title.toLowerCase();
    const hasKeywordInTitle = tags.keywords.some(kw => titleLower.includes(kw.toLowerCase()));
    if (!hasKeywordInTitle) {
      errors.push('Meta title does not contain any target keywords');
    }
    
    // Validate keywords present in description
    const descLower = tags.description.toLowerCase();
    const hasKeywordInDesc = tags.keywords.some(kw => descLower.includes(kw.toLowerCase()));
    if (!hasKeywordInDesc) {
      errors.push('Meta description does not contain any target keywords');
    }
    
    // Validate canonical URL format
    if (!tags.canonical.startsWith('http')) {
      errors.push('Canonical URL must be absolute (start with http/https)');
    }
    
    // Validate Open Graph tags
    if (!tags.ogTitle || tags.ogTitle.length === 0) {
      errors.push('Open Graph title is missing');
    }
    if (!tags.ogDescription || tags.ogDescription.length === 0) {
      errors.push('Open Graph description is missing');
    }
    if (!tags.ogImage || tags.ogImage.length === 0) {
      errors.push('Open Graph image is missing');
    }
    if (!tags.ogType || tags.ogType.length === 0) {
      errors.push('Open Graph type is missing');
    }
    
    // Validate Twitter Card tags
    if (!tags.twitterCard || tags.twitterCard.length === 0) {
      errors.push('Twitter Card type is missing');
    }
    if (!tags.twitterTitle || tags.twitterTitle.length === 0) {
      errors.push('Twitter Card title is missing');
    }
    if (!tags.twitterDescription || tags.twitterDescription.length === 0) {
      errors.push('Twitter Card description is missing');
    }
    if (!tags.twitterImage || tags.twitterImage.length === 0) {
      errors.push('Twitter Card image is missing');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
