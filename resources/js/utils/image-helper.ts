/**
 * Get the full URL for an image path
 * 
 * @param path The relative path (e.g., /storage/media/29/avatar.png)
 * @returns The full URL
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  
  if (path.startsWith('http')) {
    return path;
  }
  
  let baseUrl = '';
  
  // Try app settings first
  const appSettings = (window as any).appSettings;
  if (appSettings?.baseUrl) {
    baseUrl = appSettings.baseUrl;
  }
  
  // Try global settings from Inertia
  if (!baseUrl) {
    const page = (window as any).page;
    const globalSettings = page?.props?.globalSettings;
    if (globalSettings?.base_url) {
      baseUrl = globalSettings.base_url;
    }
  }
  
  // Fallback: construct from current URL
  if (!baseUrl) {
    const { origin, pathname } = window.location;
    
    // For paths like /product/storego/storego-saas-react-demo/...
    if (pathname.includes('/product/')) {
      const pathParts = pathname.split('/');
      const productIndex = pathParts.indexOf('product');
      if (productIndex >= 0 && pathParts.length > productIndex + 2) {
        // Reconstruct base path: /product/storego/storego-saas-react-demo
        const basePath = pathParts.slice(0, productIndex + 3).join('/');
        baseUrl = origin + basePath;
      }
    }
    
    // Final fallback
    if (!baseUrl) {
      baseUrl = origin;
    }
  }
  
  // Clean up URL construction
  baseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get product cover image with store logo / ASAP store logo fallback
 */
export function getProductCoverImage(product: any, store?: any): string {
  const rawImage = product?.cover_image || product?.image || (Array.isArray(product?.images) ? product.images[0] : null);
  
  if (rawImage && typeof rawImage === 'string' && rawImage.trim() !== '' && !rawImage.includes('placeholder')) {
    return getImageUrl(rawImage);
  }
  
  // Store Logo Fallback
  const storeLogo = store?.logo || store?.logo_dark || store?.logo_light;
  if (storeLogo && typeof storeLogo === 'string' && storeLogo.trim() !== '') {
    return getImageUrl(storeLogo);
  }
  
  // ASAP Store Logo Fallback
  return getImageUrl('/images/logos/logo-dark.png');
}