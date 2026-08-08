import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
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

export default function Header({ settings, sectionData, customPages = [], brandColor = '#00b87c', user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  
  // Get dynamic colors and text from landing page settings
  const colors = settings?.config_sections?.colors || settings?.config_sections?.theme || {};
  const primaryColor = colors.primary || colors.primary_color || brandColor || '#00b87c';
  const announcementText = sectionData?.announcement_text || settings?.config_sections?.announcement_text || t("Offre spéciale : -70% de réduction ! Ne la manquez pas. L'offre se termine dans 72 heures.");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t('Accueil'), href: route('home') },
    ...customPages.map(page => ({
      name: page.title,
      href: route('custom-page.show', page.slug)
    }))
  ];

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50">
      {/* Main Header Navbar */}
      <header 
        className={`transition-all duration-300 ${
          isScrolled 
            ? 'shadow-lg py-3' 
            : 'py-4'
        }`}
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between lg:justify-between relative">
            {/* Logo - Centered on Mobile */}
            <div className="flex-1 lg:flex-initial flex justify-center lg:justify-start">
              <Link 
                href={route("home")} 
                className="flex items-center gap-2 group bg-white shadow-md border border-white/60 px-4 py-1.5 rounded-2xl transition-all group-hover:scale-105"
              >
                {(() => {
                  const { logoLight, logoDark } = useBrand();
                  const currentLogo = logoDark || logoLight;
                  const displayUrl = currentLogo ? (
                    currentLogo.startsWith('http') ? currentLogo : 
                    currentLogo.startsWith('/storage/') ? `${window.appSettings?.baseUrl || window.location.origin}${currentLogo}` :
                    currentLogo.startsWith('/') ? `${window.appSettings?.baseUrl || window.location.origin}${currentLogo}` : currentLogo
                  ) : '';
                  
                  return displayUrl ? (
                    <img
                      src={displayUrl}
                      alt={settings.company_name}
                      className="h-7 w-auto max-w-[170px] object-contain"
                    />
                  ) : (
                    <span className="text-lg font-black text-[#00b87c] tracking-widest uppercase flex items-center gap-1.5">
                      <span>{settings.company_name || 'MY STORE ASAP'}</span>
                    </span>
                  );
                })()} 
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6" role="navigation">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-white text-sm font-semibold transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Auth Action Buttons - Outlined Pill Style */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <Link
                  href={route('dashboard')}
                  className="px-5 py-2 rounded-full text-sm font-bold text-white border-2 border-white/80 hover:border-white hover:bg-white hover:text-[#00b87c] transition-all shadow-sm"
                >
                  {t("Tableau de bord")}
                </Link>
              ) : (
                <>
                  <Link
                    href={route('login')}
                    className="px-4 py-2 rounded-full text-sm font-bold text-white border border-white/70 hover:border-white hover:bg-white hover:text-[#00b87c] transition-all"
                  >
                    {t("Connexion")}
                  </Link>
                  <Link
                    href={route('register')}
                    className="px-5 py-2 rounded-full text-sm font-bold text-white border-2 border-white hover:bg-white hover:text-[#00b87c] transition-all shadow-sm"
                  >
                    {t("Inscription")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Positioned Right */}
            <div className="lg:hidden absolute right-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown - Centered items and buttons */}
          {isMenuOpen && (
            <div className="lg:hidden pt-4 pb-3 border-t border-white/20 mt-3 space-y-3 text-center">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-white hover:bg-white/10 px-3 py-2 rounded-md text-base font-bold transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/20 flex flex-col items-center gap-2 max-w-xs mx-auto">
                {user ? (
                  <Link
                    href={route('dashboard')}
                    className="w-full text-center py-2.5 rounded-full text-sm font-bold text-white border-2 border-white hover:bg-white hover:text-[#00b87c] transition-all shadow-sm"
                  >
                    {t("Tableau de bord")}
                  </Link>
                ) : (
                  <>
                    <Link
                      href={route('login')}
                      className="w-full text-center py-2.5 text-sm font-bold text-white border border-white/70 rounded-full hover:bg-white hover:text-[#00b87c] transition-all"
                    >
                      {t("Connexion")}
                    </Link>
                    <Link
                      href={route('register')}
                      className="w-full text-center py-2.5 text-sm font-bold text-white border-2 border-white rounded-full hover:bg-white hover:text-[#00b87c] transition-all shadow-sm"
                    >
                      {t("Inscription")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}