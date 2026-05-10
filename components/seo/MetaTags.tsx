/**
 * MetaTags Component
 * Helper utilities for generating Next.js metadata objects
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
 */

import type { Metadata } from 'next';
import type { MetaTags as MetaTagsType } from '@/types/seo';
import type { BlogContent } from '@/types/blog';

/**
 * Convert MetaTags type to Next.js Metadata object
 * This helper bridges our custom MetaTags interface with Next.js's Metadata type
 */
export function convertToNextMetadata(tags: MetaTagsType): Metadata {
  return {
    title: tags.title,
    description: tags.description,
    keywords: tags.keywords,
    alternates: {
      canonical: tags.canonical,
    },
    openGraph: {
      title: tags.ogTitle,
      description: tags.ogDescription,
      images: [
        {
          url: tags.ogImage,
          alt: tags.ogTitle,
        },
      ],
      type: tags.ogType as 'website' | 'article',
    },
    twitter: {
      card: tags.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player',
      title: tags.twitterTitle,
      description: tags.twitterDescription,
      images: [tags.twitterImage],
    },
  };
}

/**
 * Generate complete Next.js Metadata object from BlogContent
 * This is the primary function to use in generateMetadata() functions
 */
export function generateBlogMetadata(
  blog: BlogContent,
  siteUrl: string = 'https://ak7x.games'
): Metadata {
  const { metadata } = blog;
  const canonical = `${siteUrl}/blog/${metadata.slug}`;
  
  // Ensure featured image is absolute URL
  const featuredImageUrl = metadata.featuredImage
    ? metadata.featuredImage.startsWith('http')
      ? metadata.featuredImage
      : `${siteUrl}${metadata.featuredImage}`
    : `${siteUrl}/ss1.webp`;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: metadata.author }],
    alternates: {
      canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      url: canonical,
      siteName: 'ak7x App',
      locale: 'en_IN',
      publishedTime: metadata.publishedAt.toISOString(),
      modifiedTime: metadata.updatedAt.toISOString(),
      authors: [metadata.author],
      images: [
        {
          url: featuredImageUrl,
          alt: metadata.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [featuredImageUrl],
    },
  };
}

/**
 * Generate metadata for blog listing page
 */
export function generateBlogListingMetadata(
  siteUrl: string = 'https://ak7x.games'
): Metadata {
  return {
    title: 'Blog - ak7x App | Latest Gaming News & Guides',
    description: 'Discover the latest gaming news, guides, and tips for ak7x app users. Expert insights on gameplay strategy and safety.',
    keywords: ['ak7x app', 'ak7x game', 'ak7x games', 'gaming blog', 'betting guides'],
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    openGraph: {
      title: 'Blog - ak7x App',
      description: 'Latest gaming news, guides, and tips',
      type: 'website',
      url: `${siteUrl}/blog`,
      siteName: 'ak7x App',
      locale: 'en_IN',
      images: [
        {
          url: `${siteUrl}/ss1.webp`,
          alt: 'ak7x App Blog',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog - ak7x App',
      description: 'Latest gaming news, guides, and tips',
      images: [`${siteUrl}/ss1.webp`],
    },
  };
}

/**
 * Validate metadata meets SEO requirements
 * Requirements: 5.2, 5.4 (title 50-60 chars, description 150-160 chars)
 */
export function validateMetadata(metadata: Metadata): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract title string (handle both string and object formats)
  let titleString = '';
  if (typeof metadata.title === 'string') {
    titleString = metadata.title;
  } else if (metadata.title && typeof metadata.title === 'object') {
    if ('absolute' in metadata.title && typeof metadata.title.absolute === 'string') {
      titleString = metadata.title.absolute;
    } else if ('default' in metadata.title && typeof metadata.title.default === 'string') {
      titleString = metadata.title.default;
    }
  }

  // Validate title
  if (titleString) {
    if (titleString.length < 50) {
      warnings.push(`Title is short: ${titleString.length} characters (recommended 50-60)`);
    }
    if (titleString.length > 60) {
      errors.push(`Title is too long: ${titleString.length} characters (maximum 60)`);
    }
  } else {
    warnings.push('Title is missing or empty');
  }

  // Validate description
  if (metadata.description) {
    if (metadata.description.length < 150) {
      warnings.push(`Description is short: ${metadata.description.length} characters (recommended 150-160)`);
    }
    if (metadata.description.length > 160) {
      errors.push(`Description is too long: ${metadata.description.length} characters (maximum 160)`);
    }
  } else {
    errors.push('Description is required');
  }

  // Validate keywords
  if (!metadata.keywords || (Array.isArray(metadata.keywords) && metadata.keywords.length === 0)) {
    warnings.push('No keywords specified');
  }

  // Validate Open Graph
  if (!metadata.openGraph) {
    warnings.push('Open Graph tags are missing');
  } else {
    if (!metadata.openGraph.title) {
      warnings.push('Open Graph title is missing');
    }
    if (!metadata.openGraph.description) {
      warnings.push('Open Graph description is missing');
    }
    if (!metadata.openGraph.images) {
      warnings.push('Open Graph image is missing');
    } else if (Array.isArray(metadata.openGraph.images) && metadata.openGraph.images.length === 0) {
      warnings.push('Open Graph image is missing');
    }
  }

  // Validate Twitter Card
  if (!metadata.twitter) {
    warnings.push('Twitter Card tags are missing');
  } else {
    if (!metadata.twitter.title) {
      warnings.push('Twitter Card title is missing');
    }
    if (!metadata.twitter.description) {
      warnings.push('Twitter Card description is missing');
    }
    if (!metadata.twitter.images || (Array.isArray(metadata.twitter.images) && metadata.twitter.images.length === 0)) {
      warnings.push('Twitter Card image is missing');
    }
  }

  // Validate canonical
  if (!metadata.alternates?.canonical) {
    warnings.push('Canonical URL is missing');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
