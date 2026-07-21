export const generateStoreUrl = (routeName: string, store: any, params: any = {}) => {
  if (store?.enable_custom_domain || store?.enable_custom_subdomain) {
    return route(routeName, params);
  }
  return route(routeName, { storeSlug: store?.slug, ...params });
};

/**
 * Generate API URL for axios calls that works on both custom domains and regular store slugs.
 * Uses the current browser origin to ensure the request goes to the correct domain.
 */
export const generateApiUrl = (routeName: string, store: any, params: any = {}) => {
  const isCustomDomain = store?.enable_custom_domain || store?.enable_custom_subdomain;
  const routeParams = { storeSlug: store?.slug, ...params };

  if (isCustomDomain) {
    // On custom domains, use the current browser origin + path
    // This ensures API calls go to the same domain the user is browsing
    try {
      const fullUrl = route(routeName, routeParams);
      const urlObj = new URL(fullUrl);
      // Replace the origin with the current browser origin
      return window.location.origin + urlObj.pathname + urlObj.search;
    } catch (e) {
      // Fallback: use route() directly
      return route(routeName, routeParams);
    }
  }

  return route(routeName, routeParams);
};