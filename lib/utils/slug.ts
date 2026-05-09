/**
 * URL slug generation utility for SEO-friendly URLs
 * Implements Requirements 5.8, 7.8
 */

/**
 * Generates an SEO-friendly URL slug from a title
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Ensures keywords are preserved
 * 
 * @param title - The title to convert to a slug
 * @returns SEO-friendly URL slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces, hyphens, and underscores
    .replace(/[_\s]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates if a slug meets SEO requirements
 * - Must be lowercase
 * - Must use hyphens as separators
 * - Must contain only alphanumeric characters and hyphens
 * - Must not start or end with hyphen
 * 
 * @param slug - The slug to validate
 * @returns true if slug is valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Check if slug is lowercase
  if (slug !== slug.toLowerCase()) {
    return false;
  }
  
  // Check if slug contains only alphanumeric and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }
  
  // Check if slug starts or ends with hyphen
  if (/^-|-$/.test(slug)) {
    return false;
  }
  
  // Check for consecutive hyphens
  if (/--/.test(slug)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a slug contains at least one keyword from the provided list
 * 
 * @param slug - The slug to check
 * @param keywords - Array of keywords to check for
 * @returns true if slug contains at least one keyword
 */
export function slugContainsKeyword(slug: string, keywords: string[]): boolean {
  const slugLower = slug.toLowerCase();
  return keywords.some(keyword => {
    const keywordSlug = generateSlug(keyword);
    return slugLower.includes(keywordSlug);
  });
}
