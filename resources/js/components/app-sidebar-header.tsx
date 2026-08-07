import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLayout } from '@/contexts/LayoutContext';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { ProfileMenu } from '@/components/profile-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { StoreSwitcher } from '@/components/store-switcher';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { t } = useTranslation();
    const { position } = useLayout();

    return (
        <>
        <header className="border-sidebar-border/50 flex flex-col shrink-0 border-b px-4 transition-[width,height] ease-linear md:px-3 bg-white shadow-2xs">
            <div className="flex h-14 w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {position === 'left' && <SidebarTrigger className="-ml-1 text-gray-700 hover:text-gray-900" />}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Store Switcher - Hide for superadmin */}
                    {(usePage().props as any).auth?.user?.type !== 'superadmin' && (usePage().props as any).auth?.user?.type !== 'super admin' && (
                        <StoreSwitcher 
                            items={(usePage().props as any).stores || []} 
                            currentStore={((usePage().props as any).stores || []).find(store => String(store.id) === String((usePage().props as any).auth?.user?.current_store)) || ((usePage().props as any).stores?.length > 0 ? (usePage().props as any).stores[0] : null)} 
                        />
                    )}
                    
                    {(usePage().props as any).isImpersonating && (
                        <button 
                            onClick={() => router.post(route('impersonate.leave'))}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 shrink-0"
                        >
                            {t("Return Back")}
                        </button>
                    )}
                    <LanguageSwitcher />
                    <ProfileMenu />
                    {position === 'right' && <SidebarTrigger className="-mr-1 text-gray-700 hover:text-gray-900" />}
                </div>
            </div>

            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="pb-2 text-xs font-medium text-gray-500 overflow-x-auto scrollbar-none whitespace-nowrap">
                    <Breadcrumbs items={breadcrumbs.map(b => ({ label: b.title, href: b.href }))} />
                </div>
            )}
        </header>
        </>
    );
}