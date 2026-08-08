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

    const currentLogo = logoDark || logoLight;
    const primaryColor = themeColor === 'custom' ? customColor : (THEME_COLORS[themeColor as keyof typeof THEME_COLORS] || '#00b87c');

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row relative overflow-hidden font-sans">
            <Head>
                <title>{title}</title>
                {favicon && <link rel="icon" href={favicon} />}
            </Head>

            {/* Left Column - Vibrant E-commerce Illustration Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00b87c] via-[#00a870] to-[#059669] p-12 flex-col justify-between items-center relative overflow-hidden">
                {/* Decorative background curves */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Brand Logo on Left Panel */}
                <div className="w-full flex justify-start z-10">
                    <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                        {currentLogo ? (
                            <img src={currentLogo} alt="Logo" className="h-7 w-auto object-contain brightness-200" />
                        ) : (
                            <span className="text-xl font-black text-white tracking-widest uppercase">MY STORE ASAP</span>
                        )}
                    </div>
                </div>

                {/* Center Image Illustration */}
                <div className="my-auto z-10 w-full max-w-lg text-center p-4">
                    <div className="relative transform hover:scale-[1.02] transition-transform duration-500 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-slate-900">
                        <img 
                            src="/images/ecommerce-auth-bg.png" 
                            alt="E-Commerce Hub Platform" 
                            className="w-full h-auto object-cover"
                        />
                    </div>
                    <div className="mt-8 text-white space-y-2">
                        <h2 className="text-2xl font-black tracking-tight">{t("Gérez votre E-Commerce en toute simplicité")}</h2>
                        <p className="text-white/80 text-sm font-medium max-w-md mx-auto">
                            {t("Boutiques en ligne, Tunnels de vente, Caisse POS et Paiements Mobile Money intégrés.")}
                        </p>
                    </div>
                </div>

                {/* Left Panel Footer */}
                <div className="w-full text-center z-10 text-xs text-white/70 font-semibold">
                    © 2026 My Store Asap. {t("Tous droits réservés.")}
                </div>
            </div>

            {/* Right Column - Auth Form Panel */}
            <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-12 relative bg-[#f8fafc]">
                
                {/* Floating Top Right Language Switcher */}
                <div className="flex justify-between items-center w-full z-20">
                    <div className="lg:hidden">
                        {currentLogo ? (
                            <img src={currentLogo} alt="Logo" className="h-7 w-auto object-contain" />
                        ) : (
                            <span className="text-lg font-black text-[#00b87c] tracking-widest">MY STORE ASAP</span>
                        )}
                    </div>
                    <div className="ml-auto bg-emerald-50/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Floating Center Card */}
                <div className="my-auto max-w-md w-full mx-auto relative z-10 py-8">
                    <div
                        className={`bg-white rounded-2xl shadow-xl p-8 border border-slate-100 transition-all duration-500 ${
                            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                        {/* Header Title & Subtitle */}
                        <div className="text-center mb-6 space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {title || t("Connectez-vous à votre compte")}
                            </h1>
                            {description && (
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`mb-5 text-center text-sm font-medium ${
                                statusType === 'success'
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-rose-700 bg-rose-50 border-rose-200'
                                } p-3 rounded-xl border`}
                            >
                                {status}
                            </div>
                        )}

                        {/* Form Content */}
                        {children}
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="text-center text-xs text-slate-400 font-medium">
                    © 2026 My Store Asap. {t("Tous droits réservés.")}
                </div>
            </div>
        </div>
    );
}