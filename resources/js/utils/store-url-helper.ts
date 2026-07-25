export const generateStoreUrl = (routeName: string, store: any, params: any = {}) => {
  const currentHost = typeof window !== 'undefined' ? window.location.host.toLowerCase() : '';
  const cleanHost = currentHost.replace(/^www\./, '').split(':')[0];

  const isCustomDomain =
    store?.enable_custom_domain ||
    store?.enable_custom_subdomain ||
    (cleanHost && store?.custom_domain && cleanHost === store.custom_domain.toLowerCase().replace(/^www\./, '').split(':')[0]) ||
    (cleanHost && store?.custom_subdomain && cleanHost === store.custom_subdomain.toLowerCase().replace(/^www\./, '').split(':')[0]);

  if (isCustomDomain) {
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

/**
 * Format custom links (e.g. hero button_link, cta links, etc.) set in store content settings.
 * Handles full URLs (http/https/wa.me), WhatsApp links, relative paths, and custom domain slug stripping.
 */
export const formatCustomLink = (rawLink: any, store?: any, fallback?: string): string => {
  if (rawLink === null || rawLink === undefined || rawLink === '') {
    return fallback || '#';
  }

  // Extract link string if passed as an object (e.g. { value: "..." }) or primitive
  let link = typeof rawLink === 'object' && rawLink !== null
    ? (rawLink.value || rawLink.url || rawLink.href || '')
    : String(rawLink);

  link = link.trim();
  if (!link) return fallback || '#';

  // 1. If it's a full protocol, anchor, tel, mailto, etc., return as-is
  if (/^(https?:\/\/|\/\/|tel:|mailto:|javascript:|#|tg:)/i.test(link)) {
    return link;
  }

  // 2. If it's a WhatsApp link without protocol (e.g. wa.me/2250757306090 or api.whatsapp.com/...)
  if (/^(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//i.test(link)) {
    return `https://${link}`;
  }

  // 3. If it looks like an external domain name (e.g. instagram.com/..., facebook.com/..., t.me/...)
  if (/^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(link)) {
    return `https://${link}`;
  }

  // 4. Internal relative links:
  // Determine if browsing on a custom domain or custom subdomain
  const currentHost = typeof window !== 'undefined' ? window.location.host.toLowerCase() : '';
  const cleanHost = currentHost.replace(/^www\./, '').split(':')[0];

  const isCustomDomain =
    store?.enable_custom_domain ||
    store?.enable_custom_subdomain ||
    (cleanHost && store?.custom_domain && cleanHost === store.custom_domain.toLowerCase().replace(/^www\./, '').split(':')[0]) ||
    (cleanHost && store?.custom_subdomain && cleanHost === store.custom_subdomain.toLowerCase().replace(/^www\./, '').split(':')[0]);

  const slug = store?.slug ? String(store.slug).trim() : '';

  // Remove leading slash for processing
  let path = link.startsWith('/') ? link.substring(1) : link;

  if (isCustomDomain) {
    // If on a custom domain (e.g. cuirmall.com):
    // If path starts with the store slug (e.g. "cuir-mall/product-list" or "cuir-mall"), strip the slug!
    if (slug && path === slug) {
      return '/';
    }
    if (slug && path.startsWith(`${slug}/`)) {
      path = path.substring(slug.length + 1);
    }
    return `/${path}`;
  } else {
    // If on main platform domain (e.g. mystoreasap.com):
    // Ensure path starts with store slug
    if (slug && !path.startsWith(`${slug}/`) && path !== slug) {
      return `/${slug}/${path}`;
    }
    return `/${path}`;
  }
};