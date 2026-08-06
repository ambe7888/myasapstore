import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBrand } from '@/contexts/BrandContext';

interface CustomPage {
  id: number;
  title: string;
  slug: string;
}

interface HeaderProps {
  brandColor?: string;
  settings: {
    company_name: string;
  };
  sectionData?: any;
  customPages?: CustomPage[];
  user?: any;
}

export default function Header({ settings, sectionData, customPages = [], brandColor = '#059669', user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const { logoDark } = useBrand();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t("Thèmes"), href: "#templates" },
    { name: t("Fonctionnalités"), href: "#features" },
    { name: t("Tarifs"), href: "#plans" },
    { name: t("Avis"), href: "#testimonials" },
    { name: t("FAQ"), href: "#faq" },
    ...customPages.map(page => ({
      name: page.title,
      href: route('custom-page.show', page.slug)
    }))
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-50 max-w-6xl mx-auto">
      <div className={`bg-white/90 backdrop-blur-xl border border-emerald-100/90 shadow-xl shadow-emerald-950/5 rounded-full px-5 py-2.5 sm:px-6 transition-all duration-300 ${
        isScrolled ? 'border-emerald-200 shadow-2xl shadow-emerald-950/10' : ''
      }`}>
        <div className="flex justify-between items-center h-11">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              {logoDark ? (
                <img
                  src={logoDark}
                  alt={settings?.company_name || 'MyStoreAsap'}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    MyStore<span className="text-emerald-600">Asap</span>
                  </span>
                </div>
              )}
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-emerald-600 text-xs font-semibold tracking-wide transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                href={route('dashboard')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>{t("Tableau de bord")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href={route('login')}
                  className="text-slate-700 hover:text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-emerald-50/60 transition-colors"
                >
                  {t("Se connecter")}
                </Link>
                <Link
                  href={route('register')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <span>{t("Créer ma boutique")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href={route('register')}
              className="bg-emerald-600 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xs"
            >
              {t("Créer")}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-2xl border border-emerald-100 shadow-2xl rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-top-3">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block text-slate-700 hover:text-emerald-600 text-sm font-medium py-1.5 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-slate-100">
            {user ? (
              <Link
                href={route('dashboard')}
                className="block w-full text-center bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {t("Tableau de bord")}
              </Link>
            ) : (
              <>
                <Link
                  href={route('login')}
                  className="block w-full text-center text-slate-700 py-2 rounded-xl text-xs font-semibold border border-slate-200"
                >
                  {t("Se connecter")}
                </Link>
                <Link
                  href={route('register')}
                  className="block w-full text-center bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {t("Créer ma boutique gratuitement")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}