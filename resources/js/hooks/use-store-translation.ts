import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Storefront pages must always render in French, regardless of whatever
 * language the shared i18next instance currently resolves to (browser
 * detection / localStorage cache shared with the admin panel — an admin who
 * switched their own dashboard to English must never see their customers'
 * storefront in English too).
 *
 * i18n.getFixedT('fr') alone isn't enough: it binds a translator to French
 * but does nothing to ensure the French bundle was ever fetched — with
 * `load: 'currentOnly'`, only the active/detected language's bundle loads
 * automatically, so getFixedT('fr') would silently fall back to the raw key
 * (i.e. English text) until French is explicitly loaded. This loads it
 * without touching the shared active language, so it never leaks into the
 * admin panel's own language preference.
 */
export function useStoreTranslation() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(i18n.hasResourceBundle('fr', 'translation'));

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    i18n.loadLanguages('fr', () => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [i18n, ready]);

  return i18n.getFixedT('fr');
}
