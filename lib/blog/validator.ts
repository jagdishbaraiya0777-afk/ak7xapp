// E-E-A-T Validator for blog content quality assurance
// Validates Experience, Expertise, Authoritativeness, and Trustworthiness

import { BlogContent, EEATCriteria } from '@/types/blog';

export class EEATValidator {
  /**
   * Validates blog content against E-E-A-T criteria
   * @param blog - The blog content to validate
   * @returns EEATCriteria with scores and validation results
   */
  validateContent(blog: BlogContent): EEATCriteria {
    const experience = this.checkExperience(blog.content);
    const expertise = this.checkExpertise(blog.content, blog.metadata.author);
    const authoritativeness = this.checkAuthoritativeness(blog.content);
    const trustworthiness = this.checkTrustworthiness(blog.content);

    // Calculate overall score (weighted average)
    const overallScore = (
      experience.score * 0.25 +
      expertise.score * 0.25 +
      authoritativeness.score * 0.25 +
      trustworthiness.score * 0.25
    );

    // Content passes if overall score is >= 70%
    const passed = overallScore >= 0.7;

    return {
      experience,
      expertise,
      authoritativeness,
      trustworthiness,
      overallScore,
      passed,
    };
  }

  /**
   * Checks for first-hand experience indicators in content
   * @param content - The blog content to check
   * @returns Experience criteria with score
   */
  checkExperience(content: string): EEATCriteria['experience'] {
    const firstHandDetails = this.hasFirstHandDetails(content);
    const specificFeatures = this.hasSpecificFeatures(content);
    const userInterfaceDescription = this.hasUserInterfaceDescription(content);

    // Calculate score based on criteria met
    const criteriaCount = [firstHandDetails, specificFeatures, userInterfaceDescription].filter(Boolean).length;
    const score = criteriaCount / 3;

    return {
      firstHandDetails,
      specificFeatures,
      userInterfaceDescription,
      score,
    };
  }

  /**
   * Checks for expertise indicators in content
   * @param content - The blog content to check
   * @param author - The author name from metadata
   * @returns Expertise criteria with score
   */
  checkExpertise(content: string, author: string): EEATCriteria['expertise'] {
    const technicalAccuracy = this.hasTechnicalAccuracy(content);
    const authorCredentials = this.hasAuthorCredentials(author, content);
    const detailedExplanations = this.hasDetailedExplanations(content);

    const criteriaCount = [technicalAccuracy, authorCredentials, detailedExplanations].filter(Boolean).length;
    const score = criteriaCount / 3;

    return {
      technicalAccuracy,
      authorCredentials,
      detailedExplanations,
      score,
    };
  }

  /**
   * Checks for authoritativeness indicators in content
   * @param content - The blog content to check
   * @returns Authoritativeness criteria with score
   */
  checkAuthoritativeness(content: string): EEATCriteria['authoritativeness'] {
    const citedSources = this.hasCitedSources(content);
    const industryReferences = this.hasIndustryReferences(content);
    const factualClaims = this.hasFactualClaims(content);

    const criteriaCount = [citedSources, industryReferences, factualClaims].filter(Boolean).length;
    const score = criteriaCount / 3;

    return {
      citedSources,
      industryReferences,
      factualClaims,
      score,
    };
  }

  /**
   * Checks for trustworthiness indicators in content
   * @param content - The blog content to check
   * @returns Trustworthiness criteria with score
   */
  checkTrustworthiness(content: string): EEATCriteria['trustworthiness'] {
    const disclaimers = this.hasDisclaimers(content);
    const responsibleGamingWarnings = this.hasResponsibleGamingWarnings(content);
    const ageRestrictions = this.hasAgeRestrictions(content);
    const privacyPolicyLink = this.hasPrivacyPolicyLink(content);
    const noUnrealisticPromises = !this.hasUnrealisticPromises(content);

    const criteriaCount = [
      disclaimers,
      responsibleGamingWarnings,
      ageRestrictions,
      privacyPolicyLink,
      noUnrealisticPromises,
    ].filter(Boolean).length;
    const score = criteriaCount / 5;

    return {
      disclaimers,
      responsibleGamingWarnings,
      ageRestrictions,
      privacyPolicyLink,
      noUnrealisticPromises,
      score,
    };
  }

  /**
   * Checks if content demonstrates first-hand experience
   * Looks for personal observations, specific details, and experiential language
   */
  private hasFirstHandDetails(content: string): boolean {
    const firstHandIndicators = [
      /\b(we tested|I tested|our experience|in our testing|when we tried)\b/i,
      /\b(we found|I found|we noticed|I noticed|we observed)\b/i,
      /\b(in practice|in real use|during gameplay|while playing)\b/i,
      /\b(our team|we personally|firsthand|first-hand)\b/i,
    ];

    return firstHandIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content includes specific app features and details
   */
  private hasSpecificFeatures(content: string): boolean {
    const featureIndicators = [
      /\b(feature|functionality|option|setting)\b/i,
      /\b(download|install|registration|login|signup|sign-up)\b/i,
      /\b(bonus|reward|cashback|withdrawal|deposit)\b/i,
      /\b(game|gameplay|bet|betting|play|playing|win|winning|odds|stake)\b/i,
    ];

    // Content should mention at least 3 different feature types
    const matchCount = featureIndicators.filter(pattern => pattern.test(content)).length;
    return matchCount >= 3;
  }

  /**
   * Checks if content describes user interface elements
   */
  private hasUserInterfaceDescription(content: string): boolean {
    const uiIndicators = [
      /\b(screen|display|interface|layout|design|navigation)\b/i,
      /\b(button|icon|menu|tab|section|panel)\b/i,
      /\b(dashboard|homepage|profile|settings page)\b/i,
      /\b(click|tap|swipe|scroll|select)\b/i,
    ];

    return uiIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks for technical accuracy indicators
   */
  private hasTechnicalAccuracy(content: string): boolean {
    const technicalTerms = [
      /\b(APK|Android|iOS|mobile app|application)\b/i,
      /\b(version|update|compatibility|requirements)\b/i,
      /\b(security|encryption|authentication|verification)\b/i,
      /\b(algorithm|system|platform|technology)\b/i,
    ];

    // Should have technical terminology
    return technicalTerms.some(pattern => pattern.test(content));
  }

  /**
   * Checks if author has credentials or expertise indicators
   */
  private hasAuthorCredentials(author: string, content: string): boolean {
    const credentialIndicators = [
      /\b(expert|specialist|analyst|professional|reviewer)\b/i,
      /\b(years of experience|experienced|veteran)\b/i,
      /\b(gaming expert|betting expert|industry expert)\b/i,
    ];

    // Check author name or content for credentials
    return credentialIndicators.some(pattern => 
      pattern.test(author) || pattern.test(content)
    );
  }

  /**
   * Checks if content provides detailed explanations
   */
  private hasDetailedExplanations(content: string): boolean {
    // Check for explanation patterns and sufficient detail
    const explanationIndicators = [
      /\b(how to|step by step|guide|tutorial|instructions)\b/i,
      /\b(because|therefore|thus|consequently|as a result)\b/i,
      /\b(for example|for instance|such as|including)\b/i,
    ];

    const hasExplanations = explanationIndicators.some(pattern => pattern.test(content));
    const hasSubstantialContent = content.length > 1000; // At least 1000 characters

    return hasExplanations && hasSubstantialContent;
  }

  /**
   * Checks if content cites sources or references
   */
  private hasCitedSources(content: string): boolean {
    const sourceIndicators = [
      /\b(according to|based on|source|reference|study shows)\b/i,
      /\b(research|report|data|statistics|survey)\b/i,
      /\[(.*?)\]\((https?:\/\/.*?)\)/i, // Markdown links
    ];

    return sourceIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks for industry references and terminology
   */
  private hasIndustryReferences(content: string): boolean {
    const industryTerms = [
      /\b(gaming industry|betting industry|online gaming|iGaming)\b/i,
      /\b(casino|sportsbook|poker|slots)\b/i,
      /\b(odds|RTP|house edge|payout|wagering)\b/i,
      /\b(license|regulation|compliance|legal)\b/i,
    ];

    return industryTerms.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content makes factual claims with specificity
   */
  private hasFactualClaims(content: string): boolean {
    const factualIndicators = [
      /\b\d+%\b/, // Percentages
      /\b(Rs\.|₹)\s*\d+/, // Currency amounts
      /\b\d+\s*(MB|GB|KB)\b/i, // File sizes
      /\b\d+\s*(users|players|downloads|ratings)\b/i, // Statistics
    ];

    return factualIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content includes disclaimers
   * Requirements: 9.3, 9.4
   */
  hasDisclaimers(content: string): boolean {
    const disclaimerIndicators = [
      /\b(disclaimer|disclosure|notice)\b/i,
      /\[disclaimer\]/i,
      /\/disclaimer/i,
      /\b(informational purposes|educational purposes)\b/i,
      /\b(not affiliated|not official|independent)\b/i,
    ];

    return disclaimerIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content includes responsible gaming warnings
   * Requirements: 9.1, 9.6
   */
  hasResponsibleGamingWarnings(content: string): boolean {
    const responsibleGamingIndicators = [
      /\b(responsible gaming|responsible gambling|play responsibly)\b/i,
      /\b(addiction|problem gambling|gambling problem)\b/i,
      /\b(risk|risks of gambling|gambling risks)\b/i,
      /\b(self-exclusion|limit|budget|control)\b/i,
      /\b(gamble responsibly|bet responsibly)\b/i,
    ];

    return responsibleGamingIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content includes age restrictions (18+)
   * Requirements: 9.2
   */
  hasAgeRestrictions(content: string): boolean {
    const ageRestrictionIndicators = [
      /\b18\+/,
      /\b(18 years|eighteen years)\b/i,
      /\b(age restriction|age requirement|minimum age)\b/i,
      /\b(adults only|for adults)\b/i,
      /\b(must be 18|only for 18)\b/i,
    ];

    return ageRestrictionIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content includes privacy policy link
   * Requirements: 9.4
   */
  private hasPrivacyPolicyLink(content: string): boolean {
    const privacyPolicyIndicators = [
      /\[privacy policy\]/i,
      /\/privacy-policy/i,
      /\b(privacy policy|privacy statement)\b/i,
    ];

    return privacyPolicyIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Checks if content makes unrealistic promises about winnings
   * Returns true if unrealistic promises are found (which is bad)
   * Requirements: 9.5, 9.7
   */
  hasUnrealisticPromises(content: string): boolean {
    const unrealisticPromiseIndicators = [
      /\b(guaranteed win|guaranteed profit|guaranteed income|guaranteed earnings)\b/i,
      /\b(100% win|never lose|can't lose)\b/i,
      /\b(get rich|become rich|make millions)\b/i,
      /\b(easy money|quick money|fast cash|quick cash)\b/i,
      /\b(guaranteed return)\b/i,
      /\b(no risk|risk-free|zero risk)\b/i,
    ];

    return unrealisticPromiseIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Generates a detailed E-E-A-T compliance report
   * @param criteria - The E-E-A-T criteria results
   * @returns Formatted report string
   */
  generateEEATReport(criteria: EEATCriteria): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push('E-E-A-T COMPLIANCE REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    
    lines.push(`Overall Score: ${(criteria.overallScore * 100).toFixed(1)}%`);
    lines.push(`Status: ${criteria.passed ? '✓ PASSED' : '✗ FAILED'}`);
    lines.push('');
    
    // Experience section
    lines.push('EXPERIENCE:');
    lines.push(`  Score: ${(criteria.experience.score * 100).toFixed(1)}%`);
    lines.push(`  ${criteria.experience.firstHandDetails ? '✓' : '✗'} First-hand details`);
    lines.push(`  ${criteria.experience.specificFeatures ? '✓' : '✗'} Specific features mentioned`);
    lines.push(`  ${criteria.experience.userInterfaceDescription ? '✓' : '✗'} UI description included`);
    lines.push('');
    
    // Expertise section
    lines.push('EXPERTISE:');
    lines.push(`  Score: ${(criteria.expertise.score * 100).toFixed(1)}%`);
    lines.push(`  ${criteria.expertise.technicalAccuracy ? '✓' : '✗'} Technical accuracy`);
    lines.push(`  ${criteria.expertise.authorCredentials ? '✓' : '✗'} Author credentials`);
    lines.push(`  ${criteria.expertise.detailedExplanations ? '✓' : '✗'} Detailed explanations`);
    lines.push('');
    
    // Authoritativeness section
    lines.push('AUTHORITATIVENESS:');
    lines.push(`  Score: ${(criteria.authoritativeness.score * 100).toFixed(1)}%`);
    lines.push(`  ${criteria.authoritativeness.citedSources ? '✓' : '✗'} Cited sources`);
    lines.push(`  ${criteria.authoritativeness.industryReferences ? '✓' : '✗'} Industry references`);
    lines.push(`  ${criteria.authoritativeness.factualClaims ? '✓' : '✗'} Factual claims with data`);
    lines.push('');
    
    // Trustworthiness section
    lines.push('TRUSTWORTHINESS:');
    lines.push(`  Score: ${(criteria.trustworthiness.score * 100).toFixed(1)}%`);
    lines.push(`  ${criteria.trustworthiness.disclaimers ? '✓' : '✗'} Disclaimers present`);
    lines.push(`  ${criteria.trustworthiness.responsibleGamingWarnings ? '✓' : '✗'} Responsible gaming warnings`);
    lines.push(`  ${criteria.trustworthiness.ageRestrictions ? '✓' : '✗'} Age restrictions (18+)`);
    lines.push(`  ${criteria.trustworthiness.privacyPolicyLink ? '✓' : '✗'} Privacy policy link`);
    lines.push(`  ${criteria.trustworthiness.noUnrealisticPromises ? '✓' : '✗'} No unrealistic promises`);
    lines.push('');
    
    // Recommendations
    if (!criteria.passed) {
      lines.push('RECOMMENDATIONS:');
      if (criteria.experience.score < 0.7) {
        lines.push('  - Add more first-hand experience details and specific app features');
      }
      if (criteria.expertise.score < 0.7) {
        lines.push('  - Include author credentials and more detailed technical explanations');
      }
      if (criteria.authoritativeness.score < 0.7) {
        lines.push('  - Add citations, industry references, and factual data');
      }
      if (criteria.trustworthiness.score < 0.7) {
        lines.push('  - Ensure all trust signals are present (disclaimers, warnings, age restrictions)');
      }
      lines.push('');
    }
    
    lines.push('='.repeat(60));
    
    return lines.join('\n');
  }
}
