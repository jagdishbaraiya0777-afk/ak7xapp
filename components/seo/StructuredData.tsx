/**
 * StructuredData Component
 * Renders JSON-LD schema markup for SEO
 * Requirement 5.5: Implement Article schema markup with proper structured data
 */

import type { SchemaMarkup } from '@/types/seo';
import type { BlogContent } from '@/types/blog';

interface StructuredDataProps {
  schema: SchemaMarkup;
}

/**
 * StructuredData component renders JSON-LD schema markup
 * This must be a client component to render script tags properly
 */
export function StructuredData({ schema }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}

/**
 * Generate Article schema markup from BlogContent
 * This follows schema.org Article specification
 */
export function generateArticleSchema(
  blog: BlogContent,
  siteUrl: string = 'https://ak7x.games',
  organizationName: string = 'ak7x App',
  logoUrl: string = 'https://ak7x.games/icon-512.png'
): SchemaMarkup {
  const { metadata, content } = blog;
  
  // Extract images from content
  const imageMatches = content.match(/!\[.*?\]\((.*?)\)/g) || [];
  const images = imageMatches
    .map((match) => {
      const urlMatch = match.match(/\((.*?)\)/);
      if (urlMatch) {
        const imagePath = urlMatch[1];
        // Convert relative paths to absolute URLs
        if (imagePath.startsWith('/')) {
          return `${siteUrl}${imagePath}`;
        } else if (imagePath.startsWith('http')) {
          return imagePath;
        } else {
          return `${siteUrl}/${imagePath}`;
        }
      }
      return '';
    })
    .filter((url) => url.length > 0);
  
  // Add featured image if available
  if (metadata.featuredImage) {
    const featuredImageUrl = metadata.featuredImage.startsWith('http')
      ? metadata.featuredImage
      : `${siteUrl}${metadata.featuredImage}`;
    
    if (!images.includes(featuredImageUrl)) {
      images.unshift(featuredImageUrl);
    }
  }
  
  // Ensure at least one image
  if (images.length === 0) {
    images.push(`${siteUrl}/ss1.webp`);
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
    image: images,
    publisher: {
      '@type': 'Organization',
      name: organizationName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
  };
}

/**
 * Generate BreadcrumbList schema for blog navigation
 */
export function generateBreadcrumbSchema(
  blogTitle: string,
  blogSlug: string,
  siteUrl: string = 'https://ak7x.games'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blogTitle,
        item: `${siteUrl}/blog/${blogSlug}`,
      },
    ],
  };
}

/**
 * Generate WebSite schema for the main site
 */
export function generateWebSiteSchema(
  siteUrl: string = 'https://ak7x.games',
  siteName: string = 'ak7x App'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(
  siteUrl: string = 'https://ak7x.games',
  organizationName: string = 'ak7x App',
  logoUrl: string = 'https://ak7x.games/icon-512.png'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizationName,
    url: siteUrl,
    logo: logoUrl,
    sameAs: [
      // Add social media profiles here if available
    ],
  };
}

/**
 * Validate schema markup structure
 */
export function validateSchema(schema: SchemaMarkup): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate required fields
  if (!schema['@context']) {
    errors.push('Missing @context field');
  } else if (schema['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context value (must be https://schema.org)');
  }
  
  if (!schema['@type']) {
    errors.push('Missing @type field');
  } else if (schema['@type'] !== 'Article') {
    errors.push('Invalid @type value (expected Article)');
  }
  
  if (!schema.headline || schema.headline.length === 0) {
    errors.push('Missing or empty headline field');
  }
  
  if (!schema.description || schema.description.length === 0) {
    errors.push('Missing or empty description field');
  }
  
  if (!schema.author) {
    errors.push('Missing author field');
  } else {
    if (!schema.author['@type']) {
      errors.push('Missing author @type field');
    }
    if (!schema.author.name || schema.author.name.length === 0) {
      errors.push('Missing or empty author name');
    }
  }
  
  if (!schema.datePublished) {
    errors.push('Missing datePublished field');
  } else {
    // Validate ISO 8601 format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!dateRegex.test(schema.datePublished)) {
      errors.push('Invalid datePublished format (must be ISO 8601)');
    }
  }
  
  if (!schema.dateModified) {
    errors.push('Missing dateModified field');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!dateRegex.test(schema.dateModified)) {
      errors.push('Invalid dateModified format (must be ISO 8601)');
    }
  }
  
  if (!schema.image || schema.image.length === 0) {
    errors.push('Missing or empty image array');
  }
  
  if (!schema.publisher) {
    errors.push('Missing publisher field');
  } else {
    if (!schema.publisher['@type']) {
      errors.push('Missing publisher @type field');
    }
    if (!schema.publisher.name || schema.publisher.name.length === 0) {
      errors.push('Missing or empty publisher name');
    }
    if (!schema.publisher.logo) {
      errors.push('Missing publisher logo field');
    } else {
      if (!schema.publisher.logo['@type']) {
        errors.push('Missing publisher logo @type field');
      }
      if (!schema.publisher.logo.url || schema.publisher.logo.url.length === 0) {
        errors.push('Missing or empty publisher logo URL');
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Render multiple schema markups
 * Useful for combining Article + Breadcrumb schemas
 */
export function MultipleStructuredData({ schemas }: { schemas: any[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2),
          }}
        />
      ))}
    </>
  );
}
