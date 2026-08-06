import { Head } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useBrand } from '@/contexts/BrandContext';
import { useAppearance, THEME_COLORS } from '@/hooks/use-appearance';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    icon?: ReactNode;
    status?: string;
    statusType?: 'success' | 'error';
}

export default function AuthLayout({
    children,
    title,
    description,
    icon,
    status,
    statusType = 'success',
}: AuthLayoutProps) {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const { logoLight, logoDark, themeColor, customColor, favicon, themeMode } = useBrand();
    const { appearance } = useAppearance();

    // Determine effective appearance
    const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark) || appearance === 'dark';

    const currentLogo = isDark ? logoLight : logoDark;
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300 flex flex-col justify-between">
            <Head>
                <title>{title}</title>
                {favicon && <link rel="icon" href={favicon} />}
            </Head>

            {/* Ambient Background Gradient & Mesh */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute inset-0 bg-slate-950/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
            </div>

            {/* Top Bar with Home Link & Language Switcher */}
            <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
                    <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">←</span>
                    <span>{t("Retour à l'accueil")}</span>
                </a>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="flex items-center justify-center p-4 sm:p-6 relative z-10 my-auto">
                <div
                    className={`w-full max-w-md transition-all duration-700 ${
                        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                    }`}
                >
                    {/* Brand Logo Header */}
                    <div className="text-center mb-6">
                        <a href="/" className="inline-block transition-transform hover:scale-105">
                            {currentLogo ? (
                                <img src={currentLogo} alt="Logo" className="w-auto h-8 sm:h-9 mx-auto object-contain drop-shadow-md" />
                            ) : (
                                <div className="inline-flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                                        M
                                    </div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-white">
                                        MyStore<span className="text-emerald-400">Asap</span>
                                    </h2>
                                </div>
                            )}
                        </a>
                    </div>

                    {/* Main Card with Glassmorphism */}
                    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 bg-emerald-500/10 blur-xl rounded-full pointer-events-none"></div>

                        {/* Title & Description */}
                        <div className="text-center mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">{description}</p>
                            )}
                            <div className="w-10 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto mt-3 rounded-full"></div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`mb-5 text-center text-xs sm:text-sm font-medium ${
                                statusType === 'success'
                                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80'
                                    : 'text-rose-400 bg-rose-950/60 border-rose-800/80'
                            } p-3 rounded-xl border backdrop-blur-sm animate-in fade-in`}>
                                {status}
                            </div>
                        )}

                        {/* Form Content */}
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 py-4 text-center">
                <p className="text-xs text-slate-500">
                    © {new Date().getFullYear()} MyStoreAsap SaaS. Tous droits réservés.
                </p>
            </footer>
        </div>
    );
}