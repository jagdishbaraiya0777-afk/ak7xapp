#!/usr/bin/env ts-node

/**
 * Content Generation Script
 * Orchestrates the generation of all 19 SEO-optimized blogs (10 primary + 9 cross-platform)
 * 
 * Usage: npx ts-node scripts/generate-blogs.ts
 */

import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';
import { BlogGenerator } from '@/lib/blog/generator';
import { BacklinkManager } from '@/lib/blog/backlinks';
import { SEOOptimizer } from '@/lib/seo/optimizer';
import { EEATValidator } from '@/lib/blog/validator';
import { MetaTagGenerator } from '@/lib/seo/meta-tags';
import type { BlogMetadata } from '@/types/blog';

// Configuration
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(process.cwd(), 'content', 'blogs');
const SITEMAP_DIR = process.env.SITEMAP_DIR || path.join(process.cwd(), 'content');

// Sitemap files
const SITEMAP_FILES = {
  goplay11: path.join(SITEMAP_DIR, 'goplay11-sitemap.text'),
  habet: path.join(SITEMAP_DIR, 'habet-sitemap.text'),
  dhan7: path.join(SITEMAP_DIR, 'dhan7-sitemap.text'),
};

// Primary blog topics (10)
const PRIMARY_TOPICS = [
  {
    title: 'How to Start Playing Online Games Safely',
    keyword: 'safe online gaming',
    description: 'Complete guide to starting online gaming with security best practices',
  },
  {
    title: 'Top Online Gaming Platforms Compared',
    keyword: 'online gaming platforms comparison',
    description: 'In-depth comparison of leading online gaming platforms and their features',
  },
  {
    title: 'Understanding Online Gaming Regulations',
    keyword: 'online gaming regulations',
    description: 'Guide to gaming regulations across different regions and jurisdictions',
  },
  {
    title: 'Gaming Strategy Tips for Beginners',
    keyword: 'gaming strategy for beginners',
    description: 'Essential strategies and tips for new online gamers',
  },
  {
    title: 'How to Manage Your Gaming Bankroll',
    keyword: 'gaming bankroll management',
    description: 'Best practices for managing your gaming budget effectively',
  },
  {
    title: 'Responsible Gaming Practices',
    keyword: 'responsible gaming',
    description: 'Comprehensive guide to responsible gaming habits and limits',
  },
  {
    title: 'Online Gaming Security Best Practices',
    keyword: 'online gaming security',
    description: 'Protect yourself with these essential gaming security practices',
  },
  {
    title: 'Mobile Gaming vs Desktop Gaming',
    keyword: 'mobile gaming vs desktop',
    description: 'Complete comparison of mobile and desktop gaming experiences',
  },
  {
    title: 'Getting Started with Live Gaming',
    keyword: 'live gaming for beginners',
    description: 'Introduction to live gaming and how to get started',
  },
  {
    title: 'Gaming Community and Social Features',
    keyword: 'gaming community features',
    description: 'Explore gaming communities and social aspects of online gaming',
  },
];

// Cross-platform topics (3 per platform × 3 platforms = 9)
const CROSS_PLATFORM_TOPICS = [
  // GoPlay11
  {
    platform: 'goplay11',
    title: 'GoPlay11 Review: Complete Platform Overview',
    keyword: 'GoPlay11 review',
    description: 'Comprehensive review of GoPlay11 gaming platform',
  },
  {
    platform: 'goplay11',
    title: 'GoPlay11 vs Other Platforms: Feature Comparison',
    keyword: 'GoPlay11 comparison',
    description: 'Detailed comparison of GoPlay11 with competing platforms',
  },
  {
    platform: 'goplay11',
    title: 'Getting Started on GoPlay11',
    keyword: 'GoPlay11 getting started',
    description: 'Step-by-step guide to getting started on GoPlay11',
  },
  // Habet
  {
    platform: 'habet',
    title: 'Habet Gaming Platform Guide',
    keyword: 'Habet gaming guide',
    description: 'Complete guide to using the Habet gaming platform',
  },
  {
    platform: 'habet',
    title: 'Habet Features and Benefits',
    keyword: 'Habet platform features',
    description: 'Explore the features and benefits of Habet gaming',
  },
  {
    platform: 'habet',
    title: 'Habet Gameplay Tips and Strategies',
    keyword: 'Habet tips and strategies',
    description: 'Advanced strategies for gaming on Habet',
  },
  // Dhan7
  {
    platform: 'dhan7',
    title: 'Dhan7 Platform Review',
    keyword: 'Dhan7 review',
    description: 'In-depth review of the Dhan7 gaming platform',
  },
  {
    platform: 'dhan7',
    title: 'Dhan7 Gaming Experience',
    keyword: 'Dhan7 gaming experience',
    description: 'What to expect from the Dhan7 gaming platform',
  },
  {
    platform: 'dhan7',
    title: 'Dhan7 Security and Trust',
    keyword: 'Dhan7 security',
    description: 'Security features and trustworthiness of Dhan7 platform',
  },
];

interface GenerationStats {
  totalBlogs: number;
  successfulBlogs: number;
  failedBlogs: string[];
  eeatIssues: string[];
  seoWarnings: string[];
  startTime: Date;
  endTime?: Date;
}

const stats: GenerationStats = {
  totalBlogs: PRIMARY_TOPICS.length + CROSS_PLATFORM_TOPICS.length,
  successfulBlogs: 0,
  failedBlogs: [],
  eeatIssues: [],
  seoWarnings: [],
  startTime: new Date(),
};

/**
 * Initialize all components needed for blog generation
 */
async function initializeComponents() {
  console.log('🔧 Initializing blog generation components...');

  try {
    // Remove stale generated content so the build only sees the current output set.
    await rm(path.join(CONTENT_DIR, 'primary'), { recursive: true, force: true });
    await rm(path.join(CONTENT_DIR, 'cross-platform'), { recursive: true, force: true });

    const defaultConfig = {
      minWordCount: 2500,
      maxWordCount: 8000,
      targetKeywords: ['ak7 app', 'ek7 game', 'online gaming'],
      includeScreenshots: true,
      includeFAQ: true,
      includeDisclaimer: true,
    };

    const blogGenerator = new BlogGenerator(defaultConfig);
    const defaultBacklinkStrategy = {
      totalLinks: 25,
      internalPercentage: 60,
      externalPercentage: 40,
      maxLinksPerParagraph: 2,
      platforms: {
        goplay11: 8,
        habet: 8,
        dhan7: 9,
      },
    };

    const backlinkManager = new BacklinkManager(defaultBacklinkStrategy);
    const seoOptimizer = new SEOOptimizer();
    const eeatValidator = new EEATValidator();
    const metaTagGenerator = new MetaTagGenerator();

    // Load sitemaps
    console.log('📡 Loading sitemap data...');
    // BacklinkManager exposes per-platform loader; load each sitemap file used by the strategy
    await backlinkManager.loadSitemapURLs('goplay11');
    await backlinkManager.loadSitemapURLs('habet');
    await backlinkManager.loadSitemapURLs('dhan7');

    return {
      blogGenerator,
      backlinkManager,
      seoOptimizer,
      eeatValidator,
      metaTagGenerator,
    };
  } catch (error) {
    console.error('❌ Failed to initialize components:', error);
    throw error;
  }
}

/**
 * Generate a single blog post
 */
async function generateBlog(
  topic: any,
  components: any,
  isPrimary: boolean
) {
  const blogType = isPrimary ? 'primary' : topic.platform;
  console.log(`\n📝 Generating ${blogType} blog: ${topic.title}`);

  try {
    let blog;

    if (isPrimary) {
      // Generate primary blog
      blog = await components.blogGenerator.generatePrimaryBlog(topic.title);
    } else {
      // Generate cross-platform blog
      blog = await components.blogGenerator.generateCrossPlatformBlog(
        topic.platform,
        topic.title
      );
    }

    // Apply SEO optimization
    console.log('  🔍 Applying SEO optimization...');
    // The SEOOptimizer works on a BlogContent object; pass the generated blog through it
    try {
      const optimized = await components.seoOptimizer.optimizeContent(blog);
      blog.content = optimized.content;
      // Run analysis to extract metrics and recommendations
      var seoAnalysis = components.seoOptimizer.validateSEO(optimized);
    } catch (e) {
      console.warn('  ⚠️ SEO optimization failed:', e);
      var seoAnalysis = { readabilityScore: 0, recommendations: [] } as any;
    }

    // Validate E-E-A-T
    console.log('  ✅ Validating E-E-A-T compliance...');
    const eeatAnalysis = components.eeatValidator.validateContent(blog);
    if (!eeatAnalysis.passed) {
      const report = components.eeatValidator.generateEEATReport(eeatAnalysis);
      stats.eeatIssues.push(`${topic.title}: ${report}`);
      console.warn('  ⚠️  E-E-A-T issues found:', report.split('\n').slice(0,3).join(' | '));
    }

    // Insert backlinks
    if (isPrimary) {
      console.log('  🔗 Inserting backlinks...');
      const backlinkResult = await components.backlinkManager.insertBacklinks(
        blog.content,
        'primary'
      );
      blog.content = backlinkResult.content;
    } else {
      // Cross-platform blogs get fewer backlinks
      const backlinkResult = await components.backlinkManager.insertBacklinks(
        blog.content,
        'cross-platform',
        topic.platform
      );
      blog.content = backlinkResult.content;
    }

    // Generate meta tags
    console.log('  📋 Generating meta tags...');
    const metaTags = components.metaTagGenerator.generateMetaTags(blog);
    const schemaMarkup = components.metaTagGenerator.generateSchemaMarkup(blog);

    const metadata: BlogMetadata = {
      ...blog.metadata,
      excerpt: blog.excerpt || topic.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      featured: false,
      metaTags,
      schemaMarkup,
      eeatScore: eeatAnalysis.overallScore,
      seoScore: (seoAnalysis && seoAnalysis.readabilityScore) || 0,
      wordCount: blog.content.split(/\s+/).length,
    } as BlogMetadata;

    return {
      success: true,
      blog: {
        ...blog,
        metadata,
      },
      eeatAnalysis,
      seoAnalysis,
    };
  } catch (error) {
    console.error(`  ❌ Failed to generate blog: ${error}`);
    stats.failedBlogs.push(topic.title);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Write blog to file system
 */
async function writeBlogToFile(blog: any, isPrimary: boolean) {
  try {
    const subdir = isPrimary ? 'primary' : 'cross-platform';
    const blogDir = path.join(CONTENT_DIR, subdir);
    await mkdir(blogDir, { recursive: true });

    const slug = blog.metadata.slug;
    const filename = `${slug}.md`;
    const filepath = path.join(blogDir, filename);

    // Create frontmatter
    const frontmatter = `---
title: ${JSON.stringify(blog.metadata.title)}
slug: ${JSON.stringify(slug)}
excerpt: ${JSON.stringify(blog.metadata.excerpt)}
description: ${JSON.stringify(blog.metadata.description)}
keywords: ${JSON.stringify(blog.metadata.keywords)}
author: ${JSON.stringify(blog.metadata.author)}
category: ${JSON.stringify(blog.metadata.category)}
${blog.metadata.targetPlatform ? `targetPlatform: ${JSON.stringify(blog.metadata.targetPlatform)}\n` : ''}createdAt: ${JSON.stringify(blog.metadata.createdAt.toISOString())}
publishedAt: ${JSON.stringify(blog.metadata.publishedAt.toISOString())}
featured: ${blog.metadata.featured}
wordCount: ${blog.metadata.wordCount}
eeatScore: ${blog.metadata.eeatScore}
seoScore: ${blog.metadata.seoScore}
---

${blog.content}
`;

    await writeFile(filepath, frontmatter, 'utf-8');
    console.log(`  ✅ Saved to ${filepath}`);

    return filepath;
  } catch (error) {
    console.error(`  ❌ Failed to write blog file: ${error}`);
    throw error;
  }
}

/**
 * Main generation workflow
 */
async function main() {
  console.log('🚀 Starting blog content generation...\n');

  try {
    const components = await initializeComponents();

    // Generate primary blogs
    console.log('\n📚 Generating primary blogs...');
    console.log(`=====================================`);

    for (const topic of PRIMARY_TOPICS) {
      const result = await generateBlog(topic, components, true);

      if (result.success) {
        await writeBlogToFile(result.blog, true);
        stats.successfulBlogs++;
      }
    }

    // Generate cross-platform blogs
    console.log('\n🌐 Generating cross-platform blogs...');
    console.log(`=====================================`);

    for (const topic of CROSS_PLATFORM_TOPICS) {
      const result = await generateBlog(topic, components, false);

      if (result.success) {
        await writeBlogToFile(result.blog, false);
        stats.successfulBlogs++;
      }
    }

    // Finalize stats
    stats.endTime = new Date();

    // Print summary report
    printSummaryReport(stats);
  } catch (error) {
    console.error('❌ Fatal error during generation:', error);
    process.exit(1);
  }
}

/**
 * Print generation summary report
 */
function printSummaryReport(stats: GenerationStats) {
  const duration = stats.endTime
    ? (stats.endTime.getTime() - stats.startTime.getTime()) / 1000
    : 0;

  console.log('\n\n📊 Generation Summary Report');
  console.log('=====================================');
  console.log(`Total Blogs Planned: ${stats.totalBlogs}`);
  console.log(`Successfully Generated: ${stats.successfulBlogs}`);
  console.log(`Failed: ${stats.failedBlogs.length}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);

  if (stats.failedBlogs.length > 0) {
    console.log('\n❌ Failed Blogs:');
    stats.failedBlogs.forEach((blog) => console.log(`  - ${blog}`));
  }

  if (stats.eeatIssues.length > 0) {
    console.log('\n⚠️  E-E-A-T Issues Found:');
    stats.eeatIssues.slice(0, 5).forEach((issue) => console.log(`  - ${issue}`));
    if (stats.eeatIssues.length > 5) {
      console.log(`  ... and ${stats.eeatIssues.length - 5} more`);
    }
  }

  console.log('\n✨ Generation complete!');

  if (stats.successfulBlogs === stats.totalBlogs) {
    console.log('🎉 All blogs generated successfully!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${stats.failedBlogs.length} blogs failed to generate`);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
