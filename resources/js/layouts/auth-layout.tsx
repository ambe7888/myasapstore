import { Head } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { ShoppingBag, Sparkles, ShieldCheck, Zap } from 'lucide-react';

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
    const { logoDark, themeColor, customColor, favicon } = useBrand();

    const primaryColor = themeColor === 'custom' ? customColor : (THEME_COLORS[themeColor as keyof typeof THEME_COLORS] || '#059669');

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 relative flex flex-col justify-between overflow-x-hidden font-sans">
            <Head>
                <title>{title} - MyStoreAsap</title>
                {favicon && <link rel="icon" href={favicon} />}
            </Head>

            {/* Ambient Background Gradient Blobs (Light Mode Only) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966908_1px,transparent_1px),linear-gradient(to_bottom,#05966908_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>

            {/* Header Navigation */}
            <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2.5 group">
                    {logoDark ? (
                        <img src={logoDark} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                MyStore<span className="text-emerald-600">Asap</span>
                            </span>
                        </div>
                    )}
                </a>

                <div className="flex items-center gap-3">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div
                    className={`w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-emerald-950/10 border border-emerald-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-700 ${
                        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                    }`}
                >
                    {/* Left Brand Feature Banner (Desktop & Tablet) */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
                        {/* Decorative Background Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-6 border border-white/20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t("E-Commerce & Tunnels de Vente")}</span>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white mb-4">
                                {t("Propulsez vos ventes en ligne dès aujourd'hui")}
                            </h2>
                            <p className="text-emerald-100 text-sm leading-relaxed">
                                {t("Créez votre boutique professionnelle et vos tunnels de conversion haute performance en moins de 2 minutes.")}
                            </p>
                        </div>

                        {/* Feature Badges List */}
                        <div className="relative z-10 space-y-3.5 my-8">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                                    <Zap className="w-4 h-4 text-amber-300" />
                                </div>
                                <span className="text-xs font-medium text-white">{t("10 Thèmes E-Commerce HD Inclus")}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                                    <ShoppingBag className="w-4 h-4 text-emerald-300" />
                                </div>
                                <span className="text-xs font-medium text-white">{t("Tunnels de Vente Drag & Drop")}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                                </div>
                                <span className="text-xs font-medium text-white">{t("Paiement Cash on Delivery & WhatsApp")}</span>
                            </div>
                        </div>

                        <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
                            <span>© {new Date().getFullYear()} MyStoreAsap</span>
                            <span className="font-semibold">{t("Plateforme 100% Sécurisée")}</span>
                        </div>
                    </div>

                    {/* Right Form Container */}
                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
                        {/* Page Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-6 rounded-full bg-emerald-600"></div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                            </div>
                            {description && (
                                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                            )}
                        </div>

                        {/* Alert Status */}
                        {status && (
                            <div className={`mb-6 p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                                statusType === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Children Forms */}
                        <div className="space-y-6">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Notice */}
            <footer className="relative z-20 py-4 text-center text-xs text-slate-400">
                <span>© {new Date().getFullYear()} MyStoreAsap. Tous droits réservés.</span>
            </footer>
        </div>
    );
}