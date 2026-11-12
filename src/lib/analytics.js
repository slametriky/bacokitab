export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-NV3FJL5F62';

/**
 * Send a page_view event to Google Analytics 4 for SPA route navigation.
 * @param {string} path - The route fullPath (e.g. /analisa).
 * @param {string} [title] - Optional document title override.
 */
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

/**
 * Send a custom event to Google Analytics 4.
 * @param {string} eventName - GA4 event name.
 * @param {Record<string, any>} [params] - Optional event parameters.
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
};
