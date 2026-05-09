// Blog type definitions for SEO Content Strategy

export interface BlogMetadata {
  title: string;
  slug: string;
  description: string;
  keywords: string[];
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  category: 'primary' | 'cross-platform';
  targetPlatform?: 'goplay11' | 'habet' | 'dhan7';
  featuredImage?: string;
  wordCount: number;
  readingTime: number;
}

export interface BlogContent {
  metadata: BlogMetadata;
  content: string;
  excerpt: string;
  tableOfContents: TOCItem[];
  backlinks: Backlink[];
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export interface Backlink {
  id: string;
  url: string;
  anchorText: string;
  type: 'internal' | 'external';
  platform?: 'ak7' | 'goplay11' | 'habet' | 'dhan7';
  position: number; // Character position in content
  context: string; // Surrounding text for relevance
}

export interface BacklinkStrategy {
  totalLinks: number;
  internalPercentage: number;
  externalPercentage: number;
  maxLinksPerParagraph: number;
  platforms: {
    goplay11: number;
    habet: number;
    dhan7: number;
  };
}

export interface SitemapURL {
  url: string;
  platform: 'goplay11' | 'habet' | 'dhan7';
  relevance?: string;
}

export interface BlogGeneratorConfig {
  minWordCount: number;
  maxWordCount: number;
  targetKeywords: string[];
  includeScreenshots: boolean;
  includeFAQ: boolean;
  includeDisclaimer: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EEATCriteria {
  experience: {
    firstHandDetails: boolean;
    specificFeatures: boolean;
    userInterfaceDescription: boolean;
    score: number;
  };
  expertise: {
    technicalAccuracy: boolean;
    authorCredentials: boolean;
    detailedExplanations: boolean;
    score: number;
  };
  authoritativeness: {
    citedSources: boolean;
    industryReferences: boolean;
    factualClaims: boolean;
    score: number;
  };
  trustworthiness: {
    disclaimers: boolean;
    responsibleGamingWarnings: boolean;
    ageRestrictions: boolean;
    privacyPolicyLink: boolean;
    noUnrealisticPromises: boolean;
    score: number;
  };
  overallScore: number;
  passed: boolean;
}

export interface BacklinkDistribution {
  blogSlug: string;
  totalLinks: number;
  internal: {
    count: number;
    links: Backlink[];
  };
  external: {
    count: number;
    byPlatform: {
      goplay11: Backlink[];
      habet: Backlink[];
      dhan7: Backlink[];
    };
  };
  distribution: {
    introduction: number;
    bodySections: number[];
    conclusion: number;
  };
}

export interface SitemapEntry {
  url: string;
  platform: 'goplay11' | 'habet' | 'dhan7';
  lastModified?: Date;
  priority?: number;
  relevanceScore?: number;
}

// Error classes
export class BlogGenerationError extends Error {
  constructor(
    public requirement: string,
    public details: string,
    public blogSlug?: string
  ) {
    super(`Blog generation failed: ${requirement} - ${details}`);
    this.name = 'BlogGenerationError';
  }
}

export class BacklinkError extends Error {
  constructor(
    public platform: string,
    public url: string,
    public reason: string
  ) {
    super(`Backlink error for ${platform}: ${url} - ${reason}`);
    this.name = 'BacklinkError';
  }
}
