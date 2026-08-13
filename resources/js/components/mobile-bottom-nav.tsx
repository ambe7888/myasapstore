import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Store, Package, ShoppingCart, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/components/ui/sidebar';

export function MobileBottomNav() {
  const { t } = useTranslation();
  const { auth } = usePage().props as any;
  const { toggleSidebar, setOpenMobile, openMobile } = useSidebar();

  const user = auth?.user;
  const userRole = user?.type || user?.role;

  // Render only for sellers / company users / store owners (not superadmin)
  if (!user || userRole === 'superadmin' || userRole === 'super admin') {
    return null;
  }

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof setOpenMobile === 'function') {
      setOpenMobile(!openMobile);
    } else if (typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
  };

  // Safe route helper - returns '#' if route doesn't exist
  const safeRoute = (name: string, params?: any) => {
    try {
      return route(name, params);
    } catch {
      return '#';
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {/* 1. Menu (Toggle Sidebar) */}
      <button
        onClick={handleMenuClick}
        className="flex flex-col items-center justify-center py-1 px-2 text-slate-600 hover:text-[#00b87c] active:scale-95 transition-all"
        aria-label={t("Menu")}
      >
        <Menu size={20} className="stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">{t("Menu")}</span>
      </button>

      {/* 2. Boutique */}
      <Link
        href={safeRoute('stores.index')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-all ${
          currentPath.includes('/stores') ? 'text-[#00b87c] font-black' : 'text-slate-600 hover:text-[#00b87c]'
        }`}
      >
        <Store size={20} className="stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">{t("Boutique")}</span>
      </Link>

      {/* 3. Produit */}
      <Link
        href={safeRoute('products.index')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-all ${
          currentPath.includes('/products') ? 'text-[#00b87c] font-black' : 'text-slate-600 hover:text-[#00b87c]'
        }`}
      >
        <Package size={20} className="stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">{t("Produit")}</span>
      </Link>

      {/* 4. Commande */}
      <Link
        href={safeRoute('orders.index')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-all ${
          currentPath.includes('/orders') ? 'text-[#00b87c] font-black' : 'text-slate-600 hover:text-[#00b87c]'
        }`}
      >
        <div className="relative">
          <ShoppingCart size={20} className="stroke-[2.2]" />
          {auth.pendingOrdersCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm min-w-4 text-center">
              {auth.pendingOrdersCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold mt-0.5">{t("Commande")}</span>
      </Link>

      {/* 5. Compte */}
      <Link
        href={safeRoute('profile')}
        className={`flex flex-col items-center justify-center py-1 px-2 transition-all ${
          currentPath.includes('/profile') ? 'text-[#00b87c] font-black' : 'text-slate-600 hover:text-[#00b87c]'
        }`}
      >
        <User size={20} className="stroke-[2.2]" />
        <span className="text-[10px] font-bold mt-0.5">{t("Compte")}</span>
      </Link>
    </div>
  );
}
