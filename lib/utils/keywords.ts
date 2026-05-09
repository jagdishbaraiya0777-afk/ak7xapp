/**
 * Keyword optimization utilities for SEO content
 * Implements Requirements 7.2, 7.3
 */

/**
 * Calculates keyword density as a percentage
 * Keyword density = (keyword occurrences / total words) * 100
 * 
 * @param content - The content to analyze
 * @param keyword - The keyword to calculate density for
 * @returns Keyword density as a percentage (0-100)
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
  // Normalize content and keyword to lowercase for case-insensitive matching
  const normalizedContent = content.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Handle empty keyword
  if (!normalizedKeyword) {
    return 0;
  }
  
  // Count total words in content
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) {
    return 0;
  }
  
  // Count keyword occurrences (handle multi-word keywords)
  const keywordWords = normalizedKeyword.split(/\s+/).filter(w => w.length > 0);
  const keywordLength = keywordWords.length;
  
  if (keywordLength === 0) {
    return 0;
  }
  
  let occurrences = 0;
  
  if (keywordLength === 1) {
    // Single-word keyword - count whole word matches
    const contentWords = normalizedContent.split(/\s+/);
    occurrences = contentWords.filter(w => w === normalizedKeyword).length;
  } else {
    // Multi-word keyword - use sliding window
    const contentWords = normalizedContent.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i <= contentWords.length - keywordLength; i++) {
      const window = contentWords.slice(i, i + keywordLength).join(' ');
      if (window === normalizedKeyword) {
        occurrences++;
      }
    }
  }
  
  // Calculate density as percentage
  // For multi-word keywords, count each occurrence as keywordLength words
  return (occurrences * keywordLength / totalWords) * 100;
}

/**
 * Calculates keyword density for multiple keywords
 * 
 * @param content - The content to analyze
 * @param keywords - Array of keywords to calculate density for
 * @returns Map of keyword to density percentage
 */
export function calculateKeywordDensities(
  content: string,
  keywords: string[]
): Map<string, number> {
  const densities = new Map<string, number>();
  
  for (const keyword of keywords) {
    densities.set(keyword, calculateKeywordDensity(content, keyword));
  }
  
  return densities;
}

/**
 * Checks if keyword density is within acceptable bounds (1-2%)
 * 
 * @param density - The keyword density percentage
 * @returns true if density is within bounds
 */
export function isKeywordDensityValid(density: number): boolean {
  return density >= 1.0 && density <= 2.0;
}

/**
 * Finds all positions of a keyword in content
 * 
 * @param content - The content to search
 * @param keyword - The keyword to find
 * @returns Array of character positions where keyword appears
 */
export function findKeywordPositions(content: string, keyword: string): number[] {
  const positions: number[] = [];
  const normalizedContent = content.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  
  let position = normalizedContent.indexOf(normalizedKeyword);
  while (position !== -1) {
    positions.push(position);
    position = normalizedContent.indexOf(normalizedKeyword, position + 1);
  }
  
  return positions;
}

/**
 * Checks if keyword appears in the first N words of content
 * 
 * @param content - The content to check
 * @param keyword - The keyword to find
 * @param wordCount - Number of words to check (default: 100)
 * @returns true if keyword appears in first N words
 */
export function keywordInFirstWords(
  content: string,
  keyword: string,
  wordCount: number = 100
): boolean {
  const words = content.trim().split(/\s+/);
  const firstWords = words.slice(0, wordCount).join(' ');
  return firstWords.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Generates semantic variations of a keyword
 * 
 * @param keyword - The base keyword
 * @returns Array of semantic variations
 */
export function generateSemanticVariations(keyword: string): string[] {
  const variations: string[] = [keyword];
  
  // Common variations for gaming/betting keywords
  const patterns = [
    (k: string) => `${k} app`,
    (k: string) => `${k} application`,
    (k: string) => `${k} platform`,
    (k: string) => `${k} game`,
    (k: string) => `${k} gaming`,
    (k: string) => `download ${k}`,
    (k: string) => `${k} download`,
    (k: string) => `${k} apk`,
    (k: string) => `${k} betting`,
    (k: string) => `${k} features`,
  ];
  
  // Generate variations
  for (const pattern of patterns) {
    const variation = pattern(keyword);
    if (!variations.includes(variation)) {
      variations.push(variation);
    }
  }
  
  return variations;
}

/**
 * Detects semantic variations of keywords in content
 * 
 * @param content - The content to analyze
 * @param baseKeyword - The base keyword
 * @returns Array of detected variations
 */
export function detectSemanticVariations(
  content: string,
  baseKeyword: string
): string[] {
  const variations = generateSemanticVariations(baseKeyword);
  const detected: string[] = [];
  
  const normalizedContent = content.toLowerCase();
  
  for (const variation of variations) {
    if (normalizedContent.includes(variation.toLowerCase())) {
      detected.push(variation);
    }
  }
  
  return detected;
}

/**
 * Counts total words in content
 * 
 * @param content - The content to count words in
 * @returns Total word count
 */
export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extracts keywords from headings in markdown content
 * 
 * @param content - Markdown content
 * @param keywords - Keywords to search for
 * @returns Array of keywords found in headings
 */
export function findKeywordsInHeadings(
  content: string,
  keywords: string[]
): string[] {
  const foundKeywords: string[] = [];
  
  // Extract all headings (H2 and H3)
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].toLowerCase());
  }
  
  // Check which keywords appear in headings
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (headings.some(heading => heading.includes(normalizedKeyword))) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}
