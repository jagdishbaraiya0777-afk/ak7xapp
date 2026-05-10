/**
 * Brand Name Consistency Validator
 * 
 * Validates that brand names appear with correct capitalization and spelling
 * throughout the content. Helps maintain consistent branding.
 * 
 * Requirements: 12.5, 12.7
 */

export interface BrandValidationResult {
  isConsistent: boolean;
  issues: BrandIssue[];
  suggestions: string[];
}

/**
 * Brand Name Consistency Validator
 *
 * Validates that brand names appear with correct capitalization and spelling
 * throughout the content. Helps maintain consistent branding.
 *
 * Requirements: 12.5, 12.7
 */

export interface BrandValidationResult {
  isConsistent: boolean;
  issues: BrandIssue[];
  suggestions: string[];
}

export interface BrandIssue {
  type: 'incorrect_capitalization' | 'misspelling' | 'inconsistent_usage';
  foundText: string;
  expectedText: string;
  position: number;
  context: string;
}

export const OFFICIAL_BRANDS = {
  ak7x: 'ak7x',
  GoPlay11: 'GoPlay11',
  Habet: 'Habet',
  Dhan7: 'Dhan7',
} as const;

const BRAND_LOOKUP: Record<string, keyof typeof OFFICIAL_BRANDS> = {
  ek7: 'ak7x',
  'EK 7': 'ak7x',
  'E-K-7': 'ak7x',
  'ek7 game': 'ak7x',
  ak7: 'ak7x',
  ak7xapp: 'ak7x',
  AK7XAPP: 'ak7x',
  'Ak7x App': 'ak7x',
  'ak7x app': 'ak7x',
  'ak7x-app': 'ak7x',
  'ak7x_app': 'ak7x',
  goplay11: 'GoPlay11',
  'GoPlay 11': 'GoPlay11',
  'Go Play11': 'GoPlay11',
  GOPLAY11: 'GoPlay11',
  'Go Play 11': 'GoPlay11',
  'Go-Play-11': 'GoPlay11',
  'go play11': 'GoPlay11',
  'go-play11': 'GoPlay11',
  'goplay 11': 'GoPlay11',
  habet: 'Habet',
  HABET: 'Habet',
  dhan7: 'Dhan7',
  DHAN7: 'Dhan7',
  'Dhan 7': 'Dhan7',
  'Dhan-7': 'Dhan7',
};

export class BrandConsistencyValidator {
  static validateContent(content: string): BrandValidationResult {
    const issues: BrandIssue[] = [];
    const suggestions = new Set<string>();

    for (const [variant, officialKey] of Object.entries(BRAND_LOOKUP)) {
      const expectedText = OFFICIAL_BRANDS[officialKey];
      const regex =
        variant === 'ek7'
          ? /\bek7\b/gi
          : variant === 'ak7'
            ? /\bak7\b/gi
          : variant === 'GoPlay 11'
            ? /\bGoPlay 11\b/g
            : variant === 'Go Play11'
              ? /\bGo Play11\b/g
              : new RegExp(`\\b${this.escapeRegex(variant)}\\b`, 'g');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        issues.push({
          type: 'incorrect_capitalization',
          foundText: match[0],
          expectedText,
          position: match.index,
          context: this.getContext(content, match.index, 50),
        });
        suggestions.add(expectedText);
      }
    }

    issues.sort((a, b) => a.position - b.position);

    return {
      isConsistent: issues.length === 0,
      issues,
      suggestions: issues.length > 0 ? ['Use the official brand capitalizations:', ...Array.from(suggestions).map((brand) => `- ${brand}`)] : [],
    };
  }

  static autoCorrect(content: string): string {
    let corrected = content;

    for (const [variant, officialKey] of Object.entries(BRAND_LOOKUP)) {
      const expectedText = OFFICIAL_BRANDS[officialKey];
      const regex =
        variant === 'ek7'
          ? /\bek7\b/gi
          : variant === 'ak7'
            ? /\bak7\b/gi
          : variant === 'GoPlay 11'
            ? /\bGoPlay 11\b/g
            : variant === 'Go Play11'
              ? /\bGo Play11\b/g
              : new RegExp(`\\b${this.escapeRegex(variant)}\\b`, 'g');
      corrected = corrected.replace(regex, expectedText);
    }

    return corrected;
  }

  static isValidBrandName(text: string, brandName: keyof typeof OFFICIAL_BRANDS): boolean {
    return text.trim().toLowerCase() === OFFICIAL_BRANDS[brandName].toLowerCase();
  }

  static getOfficialBrandName(text: string): string | null {
    const normalized = text.trim().toLowerCase();

    for (const [key, value] of Object.entries(OFFICIAL_BRANDS)) {
      if (normalized === key.toLowerCase() || normalized === value.toLowerCase()) {
        return key;
      }
    }

    return BRAND_LOOKUP[normalized] ?? null;
  }

  static getStatistics(content: string): {
    totalBrandMentions: number;
    consistentMentions: number;
    inconsistentMentions: number;
    consistencyPercentage: number;
  } {
    const validation = this.validateContent(content);
    const totalMentions = this.countBrandMentions(content);

    return {
      totalBrandMentions: totalMentions,
      consistentMentions: Math.max(0, totalMentions - validation.issues.length),
      inconsistentMentions: validation.issues.length,
      consistencyPercentage: totalMentions > 0 ? ((totalMentions - validation.issues.length) / totalMentions) * 100 : 100,
    };
  }

  private static getContext(text: string, position: number, contextLength: number): string {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    return `...${text.slice(start, position)}[MATCH]${text.slice(position, end)}...`;
  }

  private static countBrandMentions(content: string): number {
    let count = 0;

    for (const brand of Object.keys(OFFICIAL_BRANDS)) {
      const regex = new RegExp(`\\b${this.escapeRegex(brand)}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    }

    return count;
  }

  private static escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
