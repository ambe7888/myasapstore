import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, Heart, User, Menu as MenuIcon, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getImageUrl } from '@/utils/image-helper';
import { generateStoreUrl } from '@/utils/store-url-helper';

interface FashionHeaderProps {
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
}

export default function FashionHeader({
  storeName = 'Ma boutique',
  logo,
  isLoggedIn = false,
  userName = '',
  customPages = [],
}: FashionHeaderProps) {
  const { props } = usePage();
  const store = props.store;
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const iconButton = 'relative flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100 transition-colors';
  const badge = 'absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white';
  const menuItem = 'block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2 md:hidden">
          <button
            className={iconButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        <Link href={generateStoreUrl('store.home', store)} className="flex shrink-0 items-center">
          {logo ? (
            <img src={getImageUrl(logo)} alt={storeName} className="h-9 w-auto" />
          ) : (
            <span className="text-xl font-semibold tracking-tight text-slate-900">{storeName}</span>
          )}
        </Link>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {customPages.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="relative" ref={userRef}>
            <button className={iconButton} onClick={() => setIsUserOpen(!isUserOpen)} aria-label="Mon compte">
              <User className="h-5 w-5" />
            </button>

            {isUserOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                {isLoggedIn ? (
                  <>
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">Bonjour, {userName}</p>
                    </div>
                    <Link href={generateStoreUrl('store.my-profile', store)} className={menuItem}>
                      Mon profil
                    </Link>
                    <Link href={generateStoreUrl('store.my-orders', store)} className={menuItem}>
                      Mes commandes
                    </Link>
                    <Link href={generateStoreUrl('store.logout', store)} method="post" as="button" className={menuItem}>
                      Se déconnecter
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={generateStoreUrl('store.login', store)} className={menuItem}>
                      Se connecter
                    </Link>
                    <Link href={generateStoreUrl('store.register', store)} className={menuItem}>
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href={generateStoreUrl('store.wishlist', store)} className={iconButton} aria-label="Favoris">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && <span className={badge}>{wishlistCount}</span>}
          </Link>

          <Link href={generateStoreUrl('store.cart', store)} className={iconButton} aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <span className={badge}>{count}</span>}
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="container mx-auto px-4 py-3">
            {customPages.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-800 last:border-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
