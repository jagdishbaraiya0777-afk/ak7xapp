// Analytics type definitions for SEO Content Strategy

export interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PageViewEvent extends AnalyticsEvent {
  eventName: 'page_view';
  page: string;
  referrer?: string;
}

export interface LinkClickEvent extends AnalyticsEvent {
  eventName: 'link_click';
  linkUrl: string;
  linkType: 'internal' | 'external';
  anchorText: string;
  platform?: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  eventName: 'conversion';
  conversionType: 'download' | 'signup' | 'cta_click';
}

export interface ScrollDepthEvent extends AnalyticsEvent {
  eventName: 'scroll_depth';
  depth: number; // Percentage
}

export interface TimeOnPageEvent extends AnalyticsEvent {
  eventName: 'time_on_page';
  duration: number; // Milliseconds
}

export interface SocialShareEvent extends AnalyticsEvent {
  eventName: 'social_share';
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy_link';
}
