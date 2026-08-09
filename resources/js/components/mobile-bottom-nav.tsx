import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, ShoppingCart, Package, Store, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '@/components/ui/sidebar';

export function MobileBottomNav() {
  const { t } = useTranslation();
  const { auth } = usePage().props as any;
  const { setOpenMobile, openMobile, toggleSidebar } = useSidebar();
  const [pendingOrders, setPendingOrders] = useState(0);

  const user = auth?.user;
  const userRole = user?.type || user?.role;

  // Render only for sellers (not superadmin)
  if (!user || userRole === 'superadmin' || userRole === 'super admin') {
    return null;
  }

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // Safe route helper
  const safeRoute = (name: string, params?: any) => {
    try { return route(name, params); } catch { return '#'; }
  };

  // Fetch pending orders count for badge
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const resp = await fetch('/api/dashboard/pending-orders-count', {
          headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
        });
        if (resp.ok) {
          const data = await resp.json();
          setPendingOrders(data.count || 0);
        }
      } catch {
        // Silent fail
      }
    };
    fetchPending();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (paths: string[]) => paths.some(p => currentPath.startsWith(p));

  const navItems = [
    {
      id: 'dashboard',
      label: t('Accueil'),
      icon: LayoutDashboard,
      href: safeRoute('dashboard'),
      active: currentPath === '/dashboard',
      badge: 0,
    },
    {
      id: 'orders',
      label: t('Commandes'),
      icon: ShoppingCart,
      href: safeRoute('orders.index'),
      active: isActive(['/orders']),
      badge: pendingOrders,
    },
    {
      id: 'products',
      label: t('Produits'),
      icon: Package,
      href: safeRoute('products.index'),
      active: isActive(['/products']),
      badge: 0,
    },
    {
      id: 'store',
      label: t('Boutique'),
      icon: Store,
      href: safeRoute('stores.index'),
      active: isActive(['/stores']),
      badge: 0,
    },
    {
      id: 'account',
      label: t('Compte'),
      icon: UserCircle2,
      href: safeRoute('profile'),
      active: isActive(['/profile', '/settings']),
      badge: 0,
    },
  ];

  const handleVibrate = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleVibrate}
              className="relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-2xl transition-all duration-200 active:scale-90"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Active indicator pill */}
              {item.active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                  style={{ backgroundColor: '#00b87c' }}
                />
              )}

              {/* Icon with badge */}
              <div className="relative mt-1.5">
                <Icon
                  size={22}
                  strokeWidth={item.active ? 2.5 : 1.8}
                  style={{ color: item.active ? '#00b87c' : '#64748b' }}
                  className="transition-all duration-200"
                />
                {item.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-white flex items-center justify-center font-black"
                    style={{ backgroundColor: '#ef4444', fontSize: '9px' }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] mt-0.5 font-semibold transition-all duration-200"
                style={{ color: item.active ? '#00b87c' : '#94a3b8' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
