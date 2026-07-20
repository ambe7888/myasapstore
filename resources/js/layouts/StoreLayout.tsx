import React, { useEffect } from 'react';
import Header from '@/components/store/Header';
import storeTheme from '@/config/store-theme';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { router } from '@inertiajs/react';
import { StoreContentProvider, useStoreContent } from '@/contexts/StoreContentContext';
import { getThemeComponents } from '@/config/theme-registry';
import { useStoreFavicon } from '@/hooks/use-store-favicon';
import PWAProvider from '@/components/pwa/PWAProvider';
import { CustomToast } from '@/components/custom-toast';

interface StoreLayoutProps {
  children: React.ReactNode;
  storeName?: string;
  logo?: string;
  cartCount?: number;
  wishlistCount?: number;
  isLoggedIn?: boolean;
  userName?: string;
  customPages?: Array<{
    id: number;
    name: string;
    href: string;
  }>;
  storeId?: number;
  storeContent?: any;
  customFooter?: React.ReactNode;
  theme?: string;
  store?: any;
}

function StoreLayoutContent({
  children,
  storeName,
  logo,
  cartCount,
  wishlistCount,
  isLoggedIn,
  userName,
  customPages,
  customFooter,
  theme,
  store
}: Omit<StoreLayoutProps, 'storeId' | 'storeContent'> & { store?: any }) {
  // Set store-specific favicon
  useStoreFavicon();
  
  const { storeContent } = useStoreContent();
  const content = Object.keys(storeContent).length > 0 ? storeContent : storeTheme;
  
  // Dynamic pageview tracking on client-side routing
  useEffect(() => {
    if (!store) return;
    if (!store.facebook_pixel && !store.google_analytics && !store.tiktok_pixel && !store.snapchat_pixel) return;

    const unregister = router.on('success', (event) => {
      // 1. Facebook PageView
      if (store.facebook_pixel && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }

      // 2. Google Analytics PageView
      if (store.google_analytics && (window as any).gtag) {
        (window as any).gtag('config', store.google_analytics, {
          page_path: event.detail.page.url
        });
      }

      // 3. TikTok PageView
      if (store.tiktok_pixel && (window as any).ttq) {
        (window as any).ttq.page();
      }

      // 4. Snapchat PageView
      if (store.snapchat_pixel && (window as any).snaptr) {
        (window as any).snaptr('track', 'PAGE_VIEW');
      }
    });

    return () => {
      unregister();
    };
  }, [store?.facebook_pixel, store?.google_analytics, store?.tiktok_pixel, store?.snapchat_pixel]);

  // Inject custom CSS and JavaScript
  useEffect(() => {
    if (!store) return;
    
    // Inject custom CSS
    const existingStyle = document.getElementById('store-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'store-custom-css';
    
    let themeCss = '';
    const activeTheme = theme || 'default';
    
    if (activeTheme === 'furniture-interior') {
      themeCss = `
        /* Furniture Theme Specific Overrides */
        .bg-yellow-800, .bg-amber-800, .bg-amber-700, .bg-amber-900 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-yellow-900:hover, .hover\\:bg-amber-800:hover, .hover\\:bg-amber-900:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-yellow-800, .text-amber-800, .text-yellow-700, .text-amber-700, .text-amber-600 {
          color: var(--theme-color) !important;
        }
        .bg-amber-50, .bg-yellow-50, .bg-yellow-100, .bg-amber-100 {
          background-color: var(--bg-light-color) !important;
        }
        .border-yellow-200, .border-amber-200, .border-amber-100 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-yellow-800, button.bg-yellow-800, a.bg-amber-700, button.bg-amber-700 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'cars-automotive') {
      themeCss = `
        /* Cars Theme Specific Overrides */
        .bg-red-600 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-red-700:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-red-600 {
          color: var(--theme-color) !important;
        }
        .bg-red-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-red-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-red-600, button.bg-red-600 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'beauty-cosmetics') {
      themeCss = `
        /* Beauty Theme Specific Overrides */
        .bg-rose-500, .bg-rose-600 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-rose-600:hover, .hover\\:bg-rose-700:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-rose-500, .text-rose-600 {
          color: var(--theme-color) !important;
        }
        .bg-rose-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-rose-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-rose-500, button.bg-rose-500, a.bg-rose-600, button.bg-rose-600 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'baby-kids') {
      themeCss = `
        /* Baby & Kids Theme Specific Overrides */
        .bg-pink-500, .bg-pink-600 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-pink-600:hover, .hover\\:bg-pink-700:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-pink-500, .text-pink-600 {
          color: var(--theme-color) !important;
        }
        .bg-pink-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-pink-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-pink-500, button.bg-pink-500, a.bg-pink-600, button.bg-pink-600 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'perfume-fragrances') {
      themeCss = `
        /* Perfume Theme Specific Overrides */
        .bg-purple-600 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-purple-700:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-purple-600 {
          color: var(--theme-color) !important;
        }
        .bg-purple-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-purple-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-purple-600, button.bg-purple-600 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'electronics') {
      themeCss = `
        /* Electronics Theme Specific Overrides */
        .bg-blue-600 {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-blue-700:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .text-blue-600 {
          color: var(--theme-color) !important;
        }
        .bg-blue-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-blue-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-blue-600, button.bg-blue-600 {
          color: var(--btn-text-color) !important;
        }
      `;
    } else if (activeTheme === 'fashion' || activeTheme === 'watches') {
      themeCss = `
        /* Dark/Fashion/Watches Theme Specific Overrides */
        .bg-slate-900, .bg-black {
          background-color: var(--theme-color) !important;
          border-color: var(--theme-color) !important;
        }
        .hover\\:bg-slate-800:hover, .hover\\:bg-gray-900:hover {
          background-color: var(--primary-hover-color) !important;
        }
        .bg-slate-50, .bg-gray-50 {
          background-color: var(--bg-light-color) !important;
        }
        .border-slate-200, .border-gray-200 {
          border-color: var(--border-light-color) !important;
        }
        a.bg-slate-900, button.bg-slate-900, a.bg-black, button.bg-black {
          color: var(--btn-text-color) !important;
        }
      `;
    }

    // Only apply theme color overrides if user explicitly set a custom primary color (non-empty string)
    const hasCustomPrimaryColor = !!(store?.primary_color && store.primary_color.trim() !== '');

    let cssContent = `
      :root {
        ${hasCustomPrimaryColor ? `--theme-color: ${store.primary_color};` : ''}
        ${store?.button_radius ? `--radius: ${store.button_radius};` : ''}
        --btn-add-to-cart-color: ${store?.button_color_add_to_cart || (hasCustomPrimaryColor ? store!.primary_color : 'var(--theme-color, #4f46e5)')};
        --btn-buy-now-color: ${store?.button_color_buy_now || '#16a34a'};
      }
    `;

    // Apply theme-specific color overrides ONLY when user set a custom color
    if (hasCustomPrimaryColor) {
      cssContent += `
        :root {
          --primary-hover-color: color-mix(in srgb, var(--theme-color) 85%, black);
          --bg-light-color: color-mix(in srgb, var(--theme-color) 6%, white);
          --border-light-color: color-mix(in srgb, var(--theme-color) 15%, white);
        }
        ${themeCss}
      `;
    }

    if (store?.text_button_color) {
      cssContent += `
        :root {
          --btn-text-color: ${store.text_button_color};
        }
      `;
    }

    if (store?.text_title_color) {
      cssContent += `
        h1, h2, h3, h4, h5, h6 {
          color: ${store.text_title_color} !important;
        }
      `;
    }

    if (store?.site_bg_color) {
      cssContent += `
        body, .min-h-screen, main {
          background-color: ${store.site_bg_color} !important;
        }
      `;
    }

    if (store?.button_radius) {
      cssContent += `
        .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl {
          border-radius: var(--radius) !important;
        }
      `;
    }
    
    if (content.show_sections?.breadcrumb === false) {
      cssContent += `
        .store-breadcrumb {
          display: none !important;
        }
      `;
    }

    if (content.show_sections?.page_header === false) {
      cssContent += `
        .store-page-header {
          display: none !important;
        }
      `;
    }
    
    if (store?.custom_css) {
      cssContent += store.custom_css;
    }
    
    style.textContent = cssContent;
    document.head.appendChild(style);
    
    // Inject custom JavaScript
    if (store.custom_javascript) {
      const existingScript = document.getElementById('store-custom-js');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = 'store-custom-js';
      script.textContent = store.custom_javascript;
      document.head.appendChild(script);
    }
    
    // Facebook Pixel
    if (store?.facebook_pixel) {
      const fbScript = document.createElement('script');
      fbScript.id = 'store-fb-pixel';
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${store.facebook_pixel}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Google Analytics
    if (store?.google_analytics) {
      const gaScript = document.createElement('script');
      gaScript.id = 'store-ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${store.google_analytics}`;
      document.head.appendChild(gaScript);

      const gaInit = document.createElement('script');
      gaInit.id = 'store-ga-init';
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${store.google_analytics}');
      `;
      document.head.appendChild(gaInit);
    }

    // TikTok Pixel
    if (store?.tiktok_pixel) {
      const ttScript = document.createElement('script');
      ttScript.id = 'store-tt-pixel';
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${store.tiktok_pixel}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(ttScript);
    }

    // Snapchat Pixel
    if (store?.snapchat_pixel) {
      const snapScript = document.createElement('script');
      snapScript.id = 'store-snap-pixel';
      snapScript.innerHTML = `
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${store.snapchat_pixel}');
        snaptr('track', 'PAGE_VIEW');
      `;
      document.head.appendChild(snapScript);
    }

    // Cleanup function
    return () => {
      const customStyle = document.getElementById('store-custom-css');
      const customScript = document.getElementById('store-custom-js');
      const fbPixel = document.getElementById('store-fb-pixel');
      const gaScript = document.getElementById('store-ga-script');
      const gaInit = document.getElementById('store-ga-init');
      const ttPixel = document.getElementById('store-tt-pixel');
      const snapPixel = document.getElementById('store-snap-pixel');
      
      if (customStyle) customStyle.remove();
      if (customScript) customScript.remove();
      if (fbPixel) fbPixel.remove();
      if (gaScript) gaScript.remove();
      if (gaInit) gaInit.remove();
      if (ttPixel) ttPixel.remove();
      if (snapPixel) snapPixel.remove();
    };
  }, [
    store?.custom_css, 
    store?.custom_javascript, 
    store?.facebook_pixel, 
    store?.google_analytics, 
    store?.tiktok_pixel, 
    store?.snapchat_pixel,
    content?.show_sections?.breadcrumb,
    content?.show_sections?.page_header,
    store?.primary_color,
    store?.button_radius,
    store?.button_color_add_to_cart,
    store?.button_color_buy_now,
    store?.text_button_color,
    store?.text_title_color,
    store?.site_bg_color
  ]);
  
  // Get theme-specific footer component
  const components = getThemeComponents(theme || 'default');
  const ThemeFooter = components.Footer;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        storeName={storeName}
        logo={logo}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn}
        userName={userName}
        customPages={customPages}
        content={content.header}
        theme={theme}
      />
      
      <main className="flex-grow">
        {children}
      </main>
      
      {customFooter || (
        <ThemeFooter 
          storeName={storeName}
          logo={logo}
          content={content.footer}
        />
      )}
      <CustomToast />
    </div>
  );
}

export default function StoreLayout({
  children,
  storeName = storeTheme.store.name,
  logo = storeTheme.store.logo,
  cartCount = 0,
  wishlistCount = 0,
  isLoggedIn = false,
  userName = "",
  customPages = [],
  storeId = 1,
  storeContent = {},
  customFooter,
  theme = 'default',
  store
}: StoreLayoutProps) {
  return (
    <PWAProvider store={store}>
      <CartProvider storeId={storeId} isLoggedIn={isLoggedIn}>
        <WishlistProvider>
          <StoreContentProvider 
            initialContent={storeContent}
            storeId={storeId}
          >
            <StoreLayoutContent
              storeName={storeName}
              logo={logo}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              isLoggedIn={isLoggedIn}
              userName={userName}
              customPages={customPages}
              customFooter={customFooter}
              theme={theme}
              store={store}
            >
              {children}
            </StoreLayoutContent>
          </StoreContentProvider>
        </WishlistProvider>
      </CartProvider>
    </PWAProvider>
  );
}