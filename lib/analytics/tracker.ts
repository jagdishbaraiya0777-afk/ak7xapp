// Analytics tracking system with privacy-compliant implementation
import type {
  AnalyticsEvent,
  PageViewEvent,
  LinkClickEvent,
  ConversionEvent,
  ScrollDepthEvent,
  TimeOnPageEvent,
  SocialShareEvent,
} from '@/types/analytics';

/**
 * Singleton AnalyticsTracker class for tracking user engagement and content performance
 * Implements privacy-first approach with consent checking and DNT header respect
 */
export class AnalyticsTracker {
  private static instance: AnalyticsTracker | null = null;
  private enabled: boolean = false;
  private consentGiven: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private readonly maxQueueSize = 100;

  private constructor() {
    this.checkTrackingEnabled();
  }

  /**
   * Get singleton instance of AnalyticsTracker
   */
  public static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  /**
   * Reset singleton (for testing)
   */
  public static reset(): void {
    AnalyticsTracker.instance = null;
  }

  /**
   * Check if tracking is enabled based on environment and privacy settings
   */
  private checkTrackingEnabled(): void {
    // Check if analytics is enabled via environment variable
    const analyticsEnabled =
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

    // Check Do Not Track (DNT) header
    const dntEnabled = this.isDNTEnabled();

    // Only enable tracking if analytics is enabled and DNT is not set
    this.enabled = analyticsEnabled && !dntEnabled;
  }

  /**
   * Check if Do Not Track (DNT) header is enabled
   */
  private isDNTEnabled(): boolean {
    if (typeof navigator === 'undefined' && typeof window === 'undefined') {
      return false;
    }

    // Check for DNT header
    const dnt =
      (navigator as any)?.doNotTrack ||
      (typeof window !== 'undefined' && (window as any)?.doNotTrack) ||
      (navigator as any)?.msDoNotTrack;

    return dnt === '1' || dnt === 'yes';
  }

  /**
   * Set user consent for tracking
   */
  public setConsent(consent: boolean): void {
    this.consentGiven = consent;

    // If consent is withdrawn, clear the event queue
    if (!consent) {
      this.eventQueue = [];
    }
  }

  /**
   * Check if tracking is currently allowed
   */
  private isTrackingAllowed(): boolean {
    return this.enabled && this.consentGiven;
  }

  /**
   * Send event to analytics backend (fire-and-forget)
   */
  private sendEvent(event: AnalyticsEvent): void {
    if (!this.isTrackingAllowed()) {
      return;
    }

    // Fire-and-forget: send event without blocking
    try {
      // In a real implementation, this would send to an analytics service
      // For now, we'll just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event);
      }

      // Queue event for batch sending
      this.queueEvent(event);

      // In production, you would send to your analytics endpoint:
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      //   keepalive: true, // Ensures request completes even if page unloads
      // }).catch(() => {
      //   // Silently fail - don't block user experience
      // });
    } catch (error) {
      // Silently fail - analytics should never break the user experience
      if (process.env.NODE_ENV === 'development') {
        console.error('[Analytics] Error sending event:', error);
      }
    }
  }

  /**
   * Queue event for batch sending
   */
  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Limit queue size to prevent memory issues
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift();
    }
  }

  /**
   * Track page view event
   */
  public trackPageView(page: string, referrer?: string): void {
    const event: PageViewEvent = {
      eventName: 'page_view',
      eventCategory: 'navigation',
      eventLabel: page,
      timestamp: new Date(),
      page,
      referrer,
    };

    this.sendEvent(event);
  }

  /**
   * Track link click event
   */
  public trackLinkClick(
    linkUrl: string,
    linkType: 'internal' | 'external',
    anchorText: string,
    platform?: string
  ): void {
    const event: LinkClickEvent = {
      eventName: 'link_click',
      eventCategory: 'engagement',
      eventLabel: linkUrl,
      timestamp: new Date(),
      linkUrl,
      linkType,
      anchorText,
      platform,
    };

    this.sendEvent(event);
  }

  /**
   * Track conversion event
   */
  public trackConversion(
    conversionType: 'download' | 'signup' | 'cta_click',
    value?: number
  ): void {
    const event: ConversionEvent = {
      eventName: 'conversion',
      eventCategory: 'conversion',
      eventLabel: conversionType,
      eventValue: value,
      timestamp: new Date(),
      conversionType,
    };

    this.sendEvent(event);
  }

  /**
   * Track scroll depth event
   */
  public trackScrollDepth(depth: number): void {
    const event: ScrollDepthEvent = {
      eventName: 'scroll_depth',
      eventCategory: 'engagement',
      eventLabel: `${depth}%`,
      eventValue: depth,
      timestamp: new Date(),
      depth,
    };

    this.sendEvent(event);
  }

  /**
   * Track time on page event
   */
  public trackTimeOnPage(duration: number): void {
    const event: TimeOnPageEvent = {
      eventName: 'time_on_page',
      eventCategory: 'engagement',
      eventLabel: `${Math.round(duration / 1000)}s`,
      eventValue: duration,
      timestamp: new Date(),
      duration,
    };

    this.sendEvent(event);
  }

  /**
   * Track social share event
   */
  public trackSocialShare(
    platform: 'twitter' | 'facebook' | 'linkedin' | 'copy_link'
  ): void {
    const event: SocialShareEvent = {
      eventName: 'social_share',
      eventCategory: 'engagement',
      eventLabel: platform,
      timestamp: new Date(),
      platform,
    };

    this.sendEvent(event);
  }

  /**
   * Get queued events (for testing or batch sending)
   */
  public getQueuedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear event queue
   */
  public clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Check if tracking is enabled (for testing)
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if consent is given (for testing)
   */
  public hasConsent(): boolean {
    return this.consentGiven;
  }
}

// Export singleton instance
export const analyticsTracker = AnalyticsTracker.getInstance();
