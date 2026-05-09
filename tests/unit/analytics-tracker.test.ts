import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnalyticsTracker, analyticsTracker } from '@/lib/analytics/tracker';
import type { AnalyticsEvent } from '@/types/analytics';

describe('AnalyticsTracker', () => {
  let tracker: AnalyticsTracker;

  beforeEach(() => {
    // Reset singleton first
    AnalyticsTracker.reset();

    // Mock environment variables BEFORE creating the tracker
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'true');
    vi.stubGlobal('process', {
      ...process,
      env: {
        NEXT_PUBLIC_ANALYTICS_ENABLED: 'true',
        NODE_ENV: 'test',
      },
    });

    // Mock navigator without DNT enabled
    vi.stubGlobal('navigator', {
      doNotTrack: undefined,
      msDoNotTrack: undefined,
    });

    // Now get the tracker instance after environment is set up
    tracker = AnalyticsTracker.getInstance();
    tracker.clearQueue();
    tracker.setConsent(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    AnalyticsTracker.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AnalyticsTracker.getInstance();
      const instance2 = AnalyticsTracker.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Consent Management', () => {
    it('should not track events without consent', () => {
      tracker.setConsent(false);
      tracker.trackPageView('/test');

      expect(tracker.getQueuedEvents()).toHaveLength(0);
    });

    it('should track events with consent', () => {
      tracker.setConsent(true);
      tracker.trackPageView('/test');

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('page_view');
    });

    it('should clear queue when consent is withdrawn', () => {
      tracker.setConsent(true);
      tracker.trackPageView('/test');

      expect(tracker.getQueuedEvents()).toHaveLength(1);

      tracker.setConsent(false);
      expect(tracker.getQueuedEvents()).toHaveLength(0);
    });

    it('should have consent setter accessible', () => {
      tracker.setConsent(true);
      expect(tracker.hasConsent()).toBe(true);

      tracker.setConsent(false);
      expect(tracker.hasConsent()).toBe(false);
    });
  });

  describe('Do Not Track (DNT) Handling', () => {
    it('should respect DNT header set to 1', () => {
      // Reset and set up with DNT enabled
      AnalyticsTracker.reset();
      vi.stubGlobal('navigator', {
        doNotTrack: '1',
      });

      const dntTracker = AnalyticsTracker.getInstance();
      expect(dntTracker.isEnabled()).toBe(false);
    });

    it('should respect DNT header set to yes', () => {
      // Reset and set up with DNT enabled
      AnalyticsTracker.reset();
      vi.stubGlobal('navigator', {
        doNotTrack: 'yes',
      });

      const dntTracker = AnalyticsTracker.getInstance();
      expect(dntTracker.isEnabled()).toBe(false);
    });

    it('should allow tracking when DNT is not set', () => {
      // Reset and set up without DNT
      AnalyticsTracker.reset();
      vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'true');
      vi.stubGlobal('navigator', {
        doNotTrack: undefined,
      });

      const allowedTracker = AnalyticsTracker.getInstance();
      expect(allowedTracker.isEnabled()).toBe(true);
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      tracker.setConsent(true);
    });

    it('should track page view event', () => {
      tracker.trackPageView('/blog/test-post', 'https://google.com');

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('page_view');
      expect(events[0].eventCategory).toBe('navigation');
      expect((events[0] as any).page).toBe('/blog/test-post');
      expect((events[0] as any).referrer).toBe('https://google.com');
    });

    it('should track link click event for internal links', () => {
      tracker.trackLinkClick('/about', 'internal', 'About Us', undefined);

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('link_click');
      expect((events[0] as any).linkType).toBe('internal');
      expect((events[0] as any).anchorText).toBe('About Us');
    });

    it('should track link click event for external links', () => {
      tracker.trackLinkClick('https://example.com', 'external', 'External Link', 'goplay11');

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('link_click');
      expect((events[0] as any).linkType).toBe('external');
      expect((events[0] as any).platform).toBe('goplay11');
    });

    it('should track conversion event', () => {
      tracker.trackConversion('signup', 1);

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('conversion');
      expect((events[0] as any).conversionType).toBe('signup');
      expect(events[0].eventValue).toBe(1);
    });

    it('should track scroll depth event', () => {
      tracker.trackScrollDepth(50);

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('scroll_depth');
      expect(events[0].eventValue).toBe(50);
    });

    it('should track time on page event', () => {
      const duration = 30000; // 30 seconds in milliseconds
      tracker.trackTimeOnPage(duration);

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('time_on_page');
      expect(events[0].eventValue).toBe(duration);
    });

    it('should track social share event', () => {
      tracker.trackSocialShare('twitter');

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('social_share');
      expect((events[0] as any).platform).toBe('twitter');
    });
  });

  describe('Event Queue Management', () => {
    beforeEach(() => {
      tracker.setConsent(true);
    });

    it('should queue multiple events', () => {
      tracker.trackPageView('/page1');
      tracker.trackPageView('/page2');
      tracker.trackLinkClick('/link1', 'internal', 'Link 1');

      const events = tracker.getQueuedEvents();
      expect(events).toHaveLength(3);
    });

    it('should respect max queue size', () => {
      // Queue more than max queue size (100)
      for (let i = 0; i < 150; i++) {
        tracker.trackPageView(`/page${i}`);
      }

      const events = tracker.getQueuedEvents();
      expect(events.length).toBeLessThanOrEqual(100);
    });

    it('should clear queue on demand', () => {
      tracker.trackPageView('/page1');
      tracker.trackPageView('/page2');

      expect(tracker.getQueuedEvents()).toHaveLength(2);

      tracker.clearQueue();
      expect(tracker.getQueuedEvents()).toHaveLength(0);
    });

    it('should return copy of queue, not reference', () => {
      tracker.trackPageView('/page1');

      const events1 = tracker.getQueuedEvents();
      const events2 = tracker.getQueuedEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });
  });

  describe('Event Timestamps', () => {
    beforeEach(() => {
      tracker.setConsent(true);
    });

    it('should include timestamp in events', () => {
      const beforeTime = new Date();
      tracker.trackPageView('/test');
      const afterTime = new Date();

      const events = tracker.getQueuedEvents();
      const eventTime = (events[0] as any).timestamp;

      expect(eventTime).toBeInstanceOf(Date);
      expect(eventTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(eventTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('Event Structure', () => {
    beforeEach(() => {
      tracker.setConsent(true);
    });

    it('should have consistent event structure', () => {
      tracker.trackPageView('/test');

      const events = tracker.getQueuedEvents();
      const event = events[0];

      expect(event).toHaveProperty('eventName');
      expect(event).toHaveProperty('eventCategory');
      expect(event).toHaveProperty('eventLabel');
      expect(event).toHaveProperty('timestamp');
    });

    it('should include eventValue only when applicable', () => {
      tracker.trackConversion('download', 5);

      const events = tracker.getQueuedEvents();
      expect(events[0]).toHaveProperty('eventValue');
      expect(events[0].eventValue).toBe(5);

      tracker.clearQueue();
      tracker.trackPageView('/test');

      const pageViewEvents = tracker.getQueuedEvents();
      expect(pageViewEvents[0]).not.toHaveProperty('eventValue');
    });
  });

  describe('Privacy and Security', () => {
    beforeEach(() => {
      tracker.setConsent(true);
    });

    it('should return independent array copy of event queue', () => {
      tracker.trackPageView('/test');

      const queue1 = tracker.getQueuedEvents();
      const queue2 = tracker.getQueuedEvents();

      // The arrays should be different objects
      expect(queue1).not.toBe(queue2);
      // But contain the same data
      expect(queue1).toEqual(queue2);
    });

    it('should respect consent even with tracking enabled', () => {
      // Ensure environment says tracking is enabled
      expect(tracker.isEnabled()).toBe(true);

      // But without consent, nothing should be tracked
      tracker.setConsent(false);
      tracker.trackPageView('/test');

      expect(tracker.getQueuedEvents()).toHaveLength(0);
    });
  });
});
