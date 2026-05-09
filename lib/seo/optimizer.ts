/**
 * SEO Optimizer Component
 * Implements SEO optimization including keyword density analysis,
 * heading optimization, image optimization, and content validation
 */

import type { BlogContent } from '@/types/blog';
import type { SEOAnalysis } from '@/types/seo';
import {
  calculateKeywordDensity,
  calculateKeywordDensities,
  findKeywordsInHeadings,
  keywordInFirstWords,
} from '@/lib/utils/keywords';

export class SEOOptimizer {
  /**
   * Analyze keyword density for given content and keywords
   * Returns a map of keyword to density percentage
   */
  analyzeKeywordDensity(content: string, keywords: string[]): Map<string, number> {
    // Remove duplicates from keywords array
    const uniqueKeywords = Array.from(new Set(keywords));
    return calculateKeywordDensities(content, uniqueKeywords);
  }

  /**
   * Optimize headings to ensure keywords appear in H2/H3 tags
   * Returns modified content with optimized headings
   */
  optimizeHeadings(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    const optimizedLines: string[] = [];
    let keywordsInHeadings = 0;
    const usedKeywords = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is an H2 or H3 heading
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      
      if (h2Match || h3Match) {
        const headingText = (h2Match || h3Match)![1];
        const headingLevel = h2Match ? '##' : '###';
        
        // Check if heading already contains a keyword
        const containedKeyword = keywords.find(keyword => 
          headingText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (containedKeyword) {
          keywordsInHeadings++;
          usedKeywords.add(containedKeyword);
          optimizedLines.push(line);
        } else {
          // If we need more keywords in headings, try to add one
          if (keywordsInHeadings < 2) {
            // Find a keyword that hasn't been used yet
            const unusedKeyword = keywords.find(kw => !usedKeywords.has(kw));
            
            if (unusedKeyword) {
              // Integrate keyword naturally into heading
              const optimizedHeading = `${headingLevel} ${headingText} - ${unusedKeyword}`;
              optimizedLines.push(optimizedHeading);
              keywordsInHeadings++;
              usedKeywords.add(unusedKeyword);
            } else {
              optimizedLines.push(line);
            }
          } else {
            optimizedLines.push(line);
          }
        }
      } else {
        optimizedLines.push(line);
      }
    }

    return optimizedLines.join('\n');
  }

  /**
   * Optimize images by ensuring alt text and file names contain keywords
   * Returns modified content with optimized image references
   */
  optimizeImages(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    const optimizedLines: string[] = [];

    for (const line of lines) {
      // Match markdown image syntax: ![alt text](image.jpg)
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      
      if (imageMatch) {
        const altText = imageMatch[1];
        const imagePath = imageMatch[2];
        
        // Check if alt text contains a keyword
        const hasKeyword = keywords.some(keyword => 
          altText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!hasKeyword && altText.length > 0) {
          // Add a keyword to alt text if missing
          const primaryKeyword = keywords[0];
          const optimizedAlt = `${altText} - ${primaryKeyword}`;
          optimizedLines.push(line.replace(altText, optimizedAlt));
        } else if (altText.length === 0) {
          // Generate alt text with keyword if empty
          const primaryKeyword = keywords[0];
          const fileName = imagePath.split('/').pop()?.replace(/\.[^.]+$/, '') || 'image';
          const optimizedAlt = `${fileName} ${primaryKeyword}`;
          optimizedLines.push(line.replace('![]', `![${optimizedAlt}]`));
        } else {
          optimizedLines.push(line);
        }
      } else {
        optimizedLines.push(line);
      }
    }

    return optimizedLines.join('\n');
  }

  /**
   * Ensure primary keyword appears in the first paragraph (first 100 words)
   * Returns modified content with keyword in first paragraph if missing
   */
  ensureKeywordInFirstParagraph(content: string, keyword: string): string {
    // Check if keyword is already in first 100 words
    if (keywordInFirstWords(content, keyword, 100)) {
      return content;
    }

    // Find the first paragraph
    const paragraphs = content.split(/\n\n+/);
    
    if (paragraphs.length === 0) {
      return `The ${keyword} offers great features.\n\n${content}`;
    }

    // Skip headings to find first content paragraph
    let firstParagraphIndex = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      const trimmed = paragraphs[i].trim();
      if (trimmed.length > 0 && !trimmed.startsWith('#')) {
        firstParagraphIndex = i;
        break;
      }
    }

    const firstParagraph = paragraphs[firstParagraphIndex].trim();
    
    // If paragraph is empty or only whitespace, prepend keyword
    if (firstParagraph.length === 0) {
      paragraphs[firstParagraphIndex] = `The ${keyword} offers great features.`;
      return paragraphs.join('\n\n');
    }
    
    // Insert keyword naturally at the beginning of the first sentence
    const sentences = firstParagraph.split(/\.\s+/);
    if (sentences.length > 0 && sentences[0].trim().length > 0) {
      // Add keyword to first sentence
      const firstSentence = sentences[0].trim();
      
      // Check if we can add "featuring keyword" naturally
      if (firstSentence.split(/\s+/).length < 10) {
        // Short sentence, add featuring
        const optimizedSentence = `${firstSentence} featuring ${keyword}`;
        sentences[0] = optimizedSentence;
      } else {
        // Longer sentence, prepend keyword phrase
        sentences[0] = `The ${keyword} is important. ${firstSentence}`;
      }
      
      paragraphs[firstParagraphIndex] = sentences.join('. ');
    } else {
      // If no proper sentence, just prepend keyword
      paragraphs[firstParagraphIndex] = `The ${keyword} offers great features. ${firstParagraph}`;
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Validate SEO compliance and return analysis with recommendations
   */
  validateSEO(blog: BlogContent): SEOAnalysis {
    const { content, metadata } = blog;
    const keywords = metadata.keywords;
    
    // Analyze keyword density
    const keywordDensity = this.analyzeKeywordDensity(content, keywords);
    
    // Check title optimization
    const titleOptimization = keywords.some(keyword => 
      metadata.title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check meta description optimization
    const metaDescriptionOptimization = Boolean(metadata.description) && keywords.some(keyword => 
      metadata.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check heading structure
    const headingsWithKeywords = findKeywordsInHeadings(content, keywords);
    const headingStructure = headingsWithKeywords.length >= 2;
    
    // Check image alt text
    const imageMatches = content.match(/!\[(.*?)\]\((.*?)\)/g) || [];
    const imageAltText = imageMatches.every(img => {
      const altMatch = img.match(/!\[(.*?)\]/);
      const alt = altMatch ? altMatch[1] : '';
      return alt.length > 0 && keywords.some(kw => alt.toLowerCase().includes(kw.toLowerCase()));
    });
    
    // Count links
    const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
    
    // Calculate readability score (simplified - based on avg sentence length)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgSentenceLength = words.length / sentences.length;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 2));
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check keyword density bounds (1-2%)
    keywordDensity.forEach((density, keyword) => {
      if (density < 1.0) {
        recommendations.push(`Increase density of "${keyword}" (currently ${density.toFixed(2)}%, target 1-2%)`);
      } else if (density > 2.0) {
        recommendations.push(`Reduce density of "${keyword}" (currently ${density.toFixed(2)}%, target 1-2%)`);
      }
    });
    
    if (!titleOptimization) {
      recommendations.push('Add target keyword to title');
    }
    
    if (!metaDescriptionOptimization) {
      recommendations.push('Add target keyword to meta description');
    }
    
    if (!headingStructure) {
      recommendations.push('Ensure at least 2 H2/H3 headings contain target keywords');
    }
    
    if (!imageAltText && imageMatches.length > 0) {
      recommendations.push('Add keywords to image alt text');
    }
    
    if (internalLinks < 15) {
      recommendations.push(`Add more internal links (currently ${internalLinks}, target 15+)`);
    }
    
    if (avgSentenceLength > 25) {
      recommendations.push('Reduce average sentence length for better readability');
    }
    
    // Check if primary keyword is in first 100 words
    const primaryKeyword = keywords[0];
    if (primaryKeyword && !keywordInFirstWords(content, primaryKeyword, 100)) {
      recommendations.push(`Ensure "${primaryKeyword}" appears in first 100 words`);
    }

    return {
      keywordDensity,
      titleOptimization,
      metaDescriptionOptimization,
      headingStructure,
      imageAltText,
      internalLinks,
      externalLinks,
      readabilityScore,
      recommendations,
    };
  }

  /**
   * Optimize complete blog content
   * Applies all optimization methods and returns optimized blog
   */
  async optimizeContent(blog: BlogContent): Promise<BlogContent> {
    const { content, metadata } = blog;
    const keywords = metadata.keywords;
    
    // Apply optimizations
    let optimizedContent = content;
    
    // Ensure keyword in first paragraph
    if (keywords.length > 0) {
      optimizedContent = this.ensureKeywordInFirstParagraph(optimizedContent, keywords[0]);
    }
    
    // Optimize headings
    optimizedContent = this.optimizeHeadings(optimizedContent, keywords);
    
    // Optimize images
    optimizedContent = this.optimizeImages(optimizedContent, keywords);
    
    return {
      ...blog,
      content: optimizedContent,
    };
  }
}
