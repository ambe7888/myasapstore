import React, { useEffect } from 'react';
import Header from '@/components/store/Header';
import storeTheme from '@/config/store-theme';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
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
  
  // Inject custom CSS and JavaScript
  useEffect(() => {
    if (!store) return;
    
    // Inject custom CSS
    if (store.custom_css) {
      const existingStyle = document.getElementById('store-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = 'store-custom-css';
      style.textContent = store.custom_css;
      document.head.appendChild(style);
    }
    
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
  }, [store?.custom_css, store?.custom_javascript, store?.facebook_pixel, store?.google_analytics, store?.tiktok_pixel, store?.snapchat_pixel]);
  
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