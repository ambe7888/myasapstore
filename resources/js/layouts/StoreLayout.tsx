import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/components/store/Header';
import storeTheme from '@/config/store-theme';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { router, usePage } from '@inertiajs/react';
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
  const { props } = usePage<any>();
  const activeStore = store || props.store;

  // Set store-specific favicon
  useStoreFavicon();
  
  const { storeContent } = useStoreContent();
  const content = Object.keys(storeContent).length > 0 ? storeContent : storeTheme;
  
  // Dynamic pageview tracking on client-side routing
  useEffect(() => {
    if (!activeStore) return;
    if (!activeStore.facebook_pixel && !activeStore.google_analytics && !activeStore.tiktok_pixel && !activeStore.snapchat_pixel) return;

    const unregister = router.on('success', (event) => {
      // 1. Facebook PageView
      if (activeStore.facebook_pixel && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }

      // 2. Google Analytics PageView
      if (activeStore.google_analytics && (window as any).gtag) {
        (window as any).gtag('config', activeStore.google_analytics, {
          page_path: event.detail.page.url
        });
      }

      // 3. TikTok PageView
      if (activeStore.tiktok_pixel && (window as any).ttq) {
        (window as any).ttq.page();
      }

      // 4. Snapchat PageView
      if (activeStore.snapchat_pixel && (window as any).snaptr) {
        (window as any).snaptr('track', 'PAGE_VIEW');
      }
    });

    return () => {
      unregister();
    };
  }, [activeStore?.facebook_pixel, activeStore?.google_analytics, activeStore?.tiktok_pixel, activeStore?.snapchat_pixel]);

  // Inject custom CSS and JavaScript
  useEffect(() => {
    if (!activeStore) return;
    
    // Inject custom CSS
    const existingStyle = document.getElementById('store-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'store-custom-css';
    
    // Theme color classes override based on the active theme preset
    // These maps specify which Tailwind classes are used by each store theme
    const themeColorClasses: Record<string, { prefix: string; shades: number[] }> = {
      'furniture-interior': { prefix: 'amber', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'cars-automotive':    { prefix: 'red',   shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'beauty-cosmetics':   { prefix: 'rose',  shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'baby-kids':          { prefix: 'pink',  shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'perfume-fragrances': { prefix: 'purple',shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'electronics':        { prefix: 'blue',  shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'fashion':            { prefix: 'slate', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'watches':            { prefix: 'slate', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'jewelry':            { prefix: 'amber', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
      'default':            { prefix: 'indigo',shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
    };

    const currentTheme = theme || 'default';
    const themeClasses = themeColorClasses[currentTheme] || themeColorClasses['default'];
    const selectedPreset = activeStore?.primary_color;

    let cssContent = `
      :root {
        ${store?.button_radius ? `--radius: ${store.button_radius};` : ''}
        --btn-buy-now-color: ${store?.button_color_buy_now || '#16a34a'};
      }
    `;

    if (store?.text_button_color) {
      cssContent += `:root { --btn-text-color: ${store.text_button_color}; }`;
    }
    if (store?.text_title_color) {
      cssContent += `h1, h2, h3, h4, h5, h6 { color: ${store.text_title_color} !important; }`;
    }
    if (store?.site_bg_color) {
      cssContent += `body, .min-h-screen, main { background-color: ${store.site_bg_color} !important; }`;
    }
    if (store?.button_radius) {
      cssContent += `.rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl { border-radius: var(--radius) !important; }`;
    }
    if (content.show_sections?.breadcrumb === false) {
      cssContent += `.store-breadcrumb { display: none !important; }`;
    }
    if (content.show_sections?.page_header === false) {
      cssContent += `.store-page-header { display: none !important; }`;
    }
    if (activeStore?.custom_css) {
      cssContent += activeStore.custom_css;
    }
    
    // Only inject overrides when vendor picked a non-default color
    // Use scoped [data-theme] .class selectors (specificity 0,1,1) which always beat .class alone (0,0,1)
    // --color-store-primary-* is set directly on the [data-theme] element and is a normal CSS property (inheritable)
    if (selectedPreset && selectedPreset !== themeClasses.prefix) {
      const p = themeClasses.prefix;
      const t = selectedPreset;
      const colorRules = themeClasses.shades.map(shade => {
        const v = `var(--color-store-primary-${shade})`;
        return `
          [data-theme="${t}"] .bg-${p}-${shade} { background-color: ${v}; }
          [data-theme="${t}"] .text-${p}-${shade} { color: ${v}; }
          [data-theme="${t}"] .border-${p}-${shade} { border-color: ${v}; }
          [data-theme="${t}"] .ring-${p}-${shade} { --tw-ring-color: ${v}; }
          [data-theme="${t}"] .from-${p}-${shade} { --tw-gradient-from: ${v}; }
          [data-theme="${t}"] .to-${p}-${shade} { --tw-gradient-to: ${v}; }
          [data-theme="${t}"] .hover\\:bg-${p}-${shade}:hover { background-color: ${v}; }
          [data-theme="${t}"] .hover\\:text-${p}-${shade}:hover { color: ${v}; }
          [data-theme="${t}"] .hover\\:border-${p}-${shade}:hover { border-color: ${v}; }
          [data-theme="${t}"] .focus\\:border-${p}-${shade}:focus { border-color: ${v}; }
          [data-theme="${t}"] .focus\\:ring-${p}-${shade}:focus { --tw-ring-color: ${v}; }
          [data-theme="${t}"] .bg-${p}-${shade}\\/20 { background-color: color-mix(in oklch, ${v} 20%, transparent); }
          [data-theme="${t}"] .bg-${p}-${shade}\\/50 { background-color: color-mix(in oklch, ${v} 50%, transparent); }
        `;
      }).join('');
      cssContent += colorRules;
    }

    style.textContent = cssContent;
    document.head.appendChild(style);
    
    // Inject custom JavaScript
    if (activeStore?.custom_javascript) {
      const existingScript = document.getElementById('store-custom-js');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = 'store-custom-js';
      script.textContent = activeStore.custom_javascript;
      document.head.appendChild(script);
    }
    
    // Facebook Pixel
    if (activeStore?.facebook_pixel) {
      const pixelId = activeStore.facebook_pixel;
      if (!(window as any)._fbq_initialized_pixels) {
        (window as any)._fbq_initialized_pixels = new Set();
      }
      
      const isAlreadyInitialized = (window as any)._fbq_initialized_pixels.has(pixelId) || typeof (window as any).fbq === 'function';
      
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
        ${!isAlreadyInitialized ? `fbq('init', '${pixelId}');` : ''}
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
      (window as any)._fbq_initialized_pixels.add(pixelId);
    }

    // Google Analytics
    if (activeStore?.google_analytics) {
      const gaScript = document.createElement('script');
      gaScript.id = 'store-ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${activeStore.google_analytics}`;
      document.head.appendChild(gaScript);

      const gaInit = document.createElement('script');
      gaInit.id = 'store-ga-init';
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${activeStore.google_analytics}');
      `;
      document.head.appendChild(gaInit);
    }

    // TikTok Pixel
    if (activeStore?.tiktok_pixel) {
      const ttScript = document.createElement('script');
      ttScript.id = 'store-tt-pixel';
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${activeStore.tiktok_pixel}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(ttScript);
    }

    // Snapchat Pixel
    if (activeStore?.snapchat_pixel) {
      const snapScript = document.createElement('script');
      snapScript.id = 'store-snap-pixel';
      snapScript.innerHTML = `
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${activeStore.snapchat_pixel}');
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
    activeStore?.custom_css, 
    activeStore?.custom_javascript, 
    activeStore?.facebook_pixel, 
    activeStore?.google_analytics, 
    activeStore?.tiktok_pixel, 
    activeStore?.snapchat_pixel,
    content?.show_sections?.breadcrumb,
    content?.show_sections?.page_header,
    activeStore?.primary_color,
    activeStore?.button_radius,
    activeStore?.button_color_add_to_cart,
    activeStore?.button_color_buy_now,
    activeStore?.text_button_color,
    activeStore?.text_title_color,
    activeStore?.site_bg_color
  ]);
  
  const components = getThemeComponents(theme || 'default');
  const ThemeFooter = components.Footer;

  const getDefaultThemePreset = (themeName: string) => {
    switch (themeName) {
      case 'furniture-interior': return 'amber';
      case 'cars-automotive': return 'red';
      case 'beauty-cosmetics': return 'rose';
      case 'baby-kids': return 'pink';
      case 'perfume-fragrances': return 'violet';
      case 'electronics': return 'blue';
      case 'fashion': return 'slate';
      case 'watches': return 'slate';
      case 'jewelry': return 'amber';
      default: return 'indigo';
    }
  };

  const activeThemePreset = activeStore?.primary_color || getDefaultThemePreset(theme || 'default');

  return (
    <div className="min-h-screen flex flex-col" data-theme={activeThemePreset}>
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
  const { props } = usePage<any>();
  const activeStore = store || props.store;
  const activeStoreId = activeStore?.id || storeId;

  return (
    <PWAProvider store={activeStore}>
      <CartProvider storeId={activeStoreId} isLoggedIn={isLoggedIn}>
        <WishlistProvider>
          <StoreContentProvider 
            initialContent={storeContent}
            storeId={activeStoreId}
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
              store={activeStore}
            >
              {children}
            </StoreLayoutContent>
          </StoreContentProvider>
        </WishlistProvider>
      </CartProvider>
    </PWAProvider>
  );
}