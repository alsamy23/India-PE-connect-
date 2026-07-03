declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
    GA_MEASUREMENT_ID?: string;
  }
}

export interface AnalyticsEventParams {
  tool_used: {
    tool_name: string;
    category?: string;
    [key: string]: any;
  };
  resource_downloaded: {
    resource_name: string;
    resource_type?: string;
    format?: string;
    [key: string]: any;
  };
  resource_viewed: {
    resource_name: string;
    category?: string;
    [key: string]: any;
  };
  signup: {
    method?: string;
    user_role?: string;
    [key: string]: any;
  };
  profile_created: {
    user_role?: string;
    school_board?: string;
    [key: string]: any;
  };
  screen_view_custom: {
    screen_name: string;
    previous_screen?: string;
    [key: string]: any;
  };
}

/**
 * Safely track custom GA4 events using window.gtag.
 * Includes console logging for tracking validation.
 */
export function trackEvent<K extends keyof AnalyticsEventParams>(
  eventName: K,
  params: AnalyticsEventParams[K]
): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log(`[Analytics] Event: ${eventName}`, params);
    } else {
      console.warn(`[Analytics Offline] Event: ${eventName}`, params);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}
