// SEO type definitions for SEO Content Strategy

export interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  author: {
    '@type': string;
    name: string;
  };
  datePublished: string;
  dateModified: string;
  image: string[];
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
}

export interface SEOAnalysis {
  keywordDensity: Map<string, number>;
  titleOptimization: boolean;
  metaDescriptionOptimization: boolean;
  headingStructure: boolean;
  imageAltText: boolean;
  internalLinks: number;
  externalLinks: number;
  readabilityScore: number;
  recommendations: string[];
}

export interface SEOConfig {
  site: {
    name: string;
    url: string;
    description: string;
    logo: string;
  };
  targetKeywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  optimization: {
    minKeywordDensity: number;
    maxKeywordDensity: number;
    minWordCount: number;
    maxWordCount: number;
    minInternalLinks: number;
    maxLinksPerParagraph: number;
  };
  schema: {
    organizationName: string;
    organizationType: string;
    contactEmail: string;
  };
}

export interface SEOValidationResult {
  valid: boolean;
  errors: Array<{
    rule: string;
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
  }>;
  warnings: string[];
}
