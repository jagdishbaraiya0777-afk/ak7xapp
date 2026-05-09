'use client';

import { useEffect, useRef, useCallback } from 'react';
import { analyticsTracker } from '@/lib/analytics/tracker';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

/**
 * Hook for tracking scroll depth on a page
 * Tracks when user scrolls to 25%, 50%, 75%, and 100% of page height
 */
export function useScrollDepthTracking() {
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // Track each threshold once
      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          analyticsTracker.trackScrollDepth(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

/**
 * Hook for tracking time spent on a page
 * Sends a tracking event when user leaves the page or after a timeout
 */
export function useTimeOnPageTracking() {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    const trackTimeOnExit = () => {
      if (!hasTrackedRef.current) {
        const duration = Date.now() - startTimeRef.current;
        analyticsTracker.trackTimeOnPage(duration);
        hasTrackedRef.current = true;
      }
    };

    // Track on page unload
    window.addEventListener('beforeunload', trackTimeOnExit);
    window.addEventListener('pagehide', trackTimeOnExit);

    return () => {
      trackTimeOnExit();
      window.removeEventListener('beforeunload', trackTimeOnExit);
      window.removeEventListener('pagehide', trackTimeOnExit);
    };
  }, []);
}

/**
 * Hook for tracking link clicks
 * Automatically delegates click events and tracks internal/external links
 */
export function useLinkClickTracking() {
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest('a');

      if (!linkElement || !linkElement.href) {
        return;
      }

      const href = linkElement.href;
      const currentOrigin = window.location.origin;
      const linkOrigin = new URL(href, currentOrigin).origin;

      const isInternal = linkOrigin === currentOrigin;
      const linkType = isInternal ? 'internal' : 'external';
      const anchorText = linkElement.textContent || linkElement.innerText || 'No text';

      // Extract platform from link if available
      let platform: string | undefined;
      const platformMatch = href.match(/goplay11|habet|dhan7|ek7/i);
      if (platformMatch) {
        platform = platformMatch[0];
      }

      analyticsTracker.trackLinkClick(href, linkType, anchorText.trim(), platform);
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);
}

/**
 * Hook for tracking page view
 * Should be called once per page load
 */
export function usePageViewTracking() {
  useEffect(() => {
    const page = window.location.pathname;
    const referrer = document.referrer || undefined;

    analyticsTracker.trackPageView(page, referrer);
  }, []);
}

/**
 * Combined hook that sets up all tracking
 */
export function useAnalyticsTracking() {
  useScrollDepthTracking();
  useTimeOnPageTracking();
  useLinkClickTracking();
  usePageViewTracking();
}

/**
 * Hook for tracking social shares
 * Returns function to call when share button is clicked
 */
export function useSocialShareTracking() {
  const trackShare = useCallback(
    (platform: 'twitter' | 'facebook' | 'linkedin' | 'copy_link') => {
      analyticsTracker.trackSocialShare(platform);
    },
    []
  );

  return trackShare;
}

/**
 * Hook for tracking conversions
 * Returns function to call for conversion events
 */
export function useConversionTracking() {
  const trackConversion = useCallback(
    (conversionType: 'download' | 'signup' | 'cta_click', value?: number) => {
      analyticsTracker.trackConversion(conversionType, value);
    },
    []
  );

  return trackConversion;
}
