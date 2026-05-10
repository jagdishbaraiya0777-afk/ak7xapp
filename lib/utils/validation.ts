/**
 * URL and content validation utilities
 * Implements Requirements 2.7, 12.4
 */

/**
 * Validates if a URL is well-formed according to RFC 3986
 * 
 * @param url - The URL to validate
 * @returns true if URL is valid, false otherwise
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check for valid protocol (http or https)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL matches any URL in a sitemap list
 * 
 * @param url - The URL to check
 * @param sitemapURLs - Array of sitemap URLs
 * @returns true if URL matches a sitemap URL
 */
export function matchesSitemapURL(url: string, sitemapURLs: string[]): boolean {
  // Normalize URLs for comparison
  const normalizedUrl = normalizeURL(url);
  const normalizedSitemapURLs = sitemapURLs.map(u => normalizeURL(u));
  
  return normalizedSitemapURLs.includes(normalizedUrl);
}

/**
 * Normalizes a URL for comparison
 * - Removes trailing slashes
 * - Converts to lowercase
 * - Removes www. prefix
 * 
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
export function normalizeURL(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove www. prefix
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Remove trailing slash from pathname (except for root path)
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    
    // Reconstruct URL
    return `${urlObj.protocol}//${hostname}${pathname}${urlObj.search}${urlObj.hash}`;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Extracts the domain from a URL
 * 
 * @param url - The URL to extract domain from
 * @returns Domain name or empty string if invalid
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if a URL is internal (same domain as site)
 * 
 * @param url - The URL to check
 * @param siteDomain - The site's domain
 * @returns true if URL is internal
 */
export function isInternalURL(url: string, siteDomain: string): boolean {
  const urlDomain = extractDomain(url);
  const normalizedSiteDomain = siteDomain.toLowerCase().replace(/^www\./, '');
  const normalizedUrlDomain = urlDomain.toLowerCase().replace(/^www\./, '');
  
  return normalizedUrlDomain === normalizedSiteDomain;
}

/**
 * Validates if a URL belongs to a specific platform
 * 
 * @param url - The URL to check
 * @param platform - The platform name
 * @returns true if URL belongs to platform
 */
export function belongsToPlatform(
  url: string,
  platform: 'goplay11' | 'habet' | 'dhan7' | 'ak7'
): boolean {
  const domain = extractDomain(url).toLowerCase();
  
  const platformDomains: Record<string, string[]> = {
    goplay11: ['goplay11.com', 'www.goplay11.com'],
    habet: ['habet.com', 'www.habet.com'],
    dhan7: ['dhan7.com', 'www.dhan7.com'],
    ak7: ['ak7x.games', 'www.ak7x.games', 'ak7-apk.com', 'www.ak7-apk.com'],
  };
  
  const domains = platformDomains[platform] || [];
  return domains.some(d => domain === d || domain.endsWith(`.${d}`));
}

/**
 * Validates an array of URLs
 * 
 * @param urls - Array of URLs to validate
 * @returns Object with valid and invalid URLs
 */
export function validateURLs(urls: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const url of urls) {
    if (isValidURL(url)) {
      valid.push(url);
    } else {
      invalid.push(url);
    }
  }
  
  return { valid, invalid };
}

/**
 * Checks if a URL is accessible (basic format check, not actual HTTP request)
 * 
 * @param url - The URL to check
 * @returns true if URL appears accessible
 */
export function isAccessibleURL(url: string): boolean {
  if (!isValidURL(url)) {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Check for localhost or private IPs (not accessible publicly)
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return false;
    }
    
    // Check for private IP ranges
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(urlObj.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses a sitemap file and extracts URLs
 * Supports both plain text format and XML sitemap format
 * 
 * @param content - Sitemap file content (plain text or XML)
 * @returns Array of valid URLs
 */
export function parseSitemapContent(content: string): string[] {
  const urls: string[] = [];
  
  // Check if content is XML format
  if (content.trim().startsWith('<?xml') || content.includes('<urlset') || content.includes('<loc>')) {
    // Parse XML sitemap format
    return parseXMLSitemap(content);
  }
  
  // Parse plain text format (one URL per line, possibly with metadata)
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Extract URL from line (may have metadata after the URL)
    // Format: URL [timestamp] [changefreq] [priority]
    const parts = trimmed.split(/\s+/);
    const potentialURL = parts[0];
    
    // Validate and add URL
    if (isValidURL(potentialURL)) {
      urls.push(potentialURL);
    }
  }
  
  return urls;
}

/**
 * Parses XML sitemap format and extracts URLs from <loc> tags
 * 
 * @param content - XML sitemap content
 * @returns Array of valid URLs
 */
function parseXMLSitemap(content: string): string[] {
  const urls: string[] = [];
  
  // Use regex to extract URLs from <loc> tags
  // This is a simple parser that works for standard sitemap XML
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(content)) !== null) {
    const url = match[1].trim();
    if (isValidURL(url)) {
      urls.push(url);
    }
  }
  
  return urls;
}
