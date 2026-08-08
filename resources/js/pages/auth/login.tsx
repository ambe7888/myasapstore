import { useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { generateStoreUrl } from '@/utils/store-url-helper';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/layouts/auth-layout';
import AuthButton from '@/components/auth/auth-button';
import Recaptcha, { executeRecaptcha } from '@/components/recaptcha';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import { getStoreThemes } from '@/data/storeThemes';
import { Eye, EyeOff } from 'lucide-react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    recaptcha_token?: string;
};

interface DemoStore {
    id: number;
    name: string;
    slug: string;
    theme: string;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    demoStores?: DemoStore[];
}

export default function Login({ status, canResetPassword, demoStores = [] }: LoginProps) {
    const { t } = useTranslation();
    const [recaptchaToken, setRecaptchaToken] = useState<string>('');
    const { themeColor, customColor } = useBrand();
    const { settings = {} } = usePage().props as any;
    const recaptchaEnabled = settings.recaptchaEnabled === 'true' || settings.recaptchaEnabled === true || settings.recaptchaEnabled === 1 || settings.recaptchaEnabled === '1';
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const [isDemo, setIsDemo] = useState<boolean>(false);
    const [hoveredStore, setHoveredStore] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        // Check if demo mode is enabled
        const isDemoMode = (window as any).isDemo === true;
        setIsDemo(isDemoMode);

        // Set default credentials if in demo mode
        if (isDemoMode) {
            setData({
                email: 'company@example.com',
                password: 'password',
                remember: false
            });
        }
    }, []);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (recaptchaEnabled) {
            try {
                const token = await executeRecaptcha();
                if (!token) {
                    alert(t('Please complete the reCAPTCHA verification'));
                    return;
                }
                const formData = { ...data, recaptcha_token: token };
                post(route('login'), formData, {
                    onFinish: () => reset('password'),
                });
                return;
            } catch {
                alert(t('reCAPTCHA verification failed. Please try again.'));
                return;
            }
        }

        const formData = { ...data, recaptcha_token: recaptchaToken };
        post(route('login'), formData, {
            onFinish: () => reset('password'),
        });
    };

    const openStoreInNewTab = (store: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = generateStoreUrl('store.home', store);
        window.open(url, '_blank');
    };

    const getThemeThumbnail = (themeId: string) => {
        const theme = getStoreThemes().find(t => t.id === themeId);
        return theme?.thumbnail || '';
    };

    return (
        <AuthLayout
            title={t("Connectez-vous à votre compte")}
            description={t("Entrez vos identifiants pour accéder à votre compte")}
            status={status}
        >
            <form className="mt-4" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">{t("Adresse e-mail")}</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                ✉
                            </span>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder={t("company@example.com")}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label htmlFor="password" className="block text-xs font-semibold text-slate-700">{t("Mot de passe")}</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-[#00b87c] hover:underline"
                                    tabIndex={5}
                                >
                                    {t("Mot de passe oublié ?")}
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                🔒
                            </span>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t("••••••••")}
                                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center pt-1 pb-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="w-4 h-4 border border-slate-300 rounded text-[#00b87c] focus:ring-[#00b87c]"
                        />
                        <Label htmlFor="remember" className="ml-2 text-xs text-slate-600 font-medium cursor-pointer">{t("Se souvenir de moi")}</Label>
                    </div>
                </div>

                {recaptchaEnabled && (
                    <div className="mb-4">
                        <Recaptcha
                            onVerify={setRecaptchaToken}
                            onExpired={() => setRecaptchaToken('')}
                            onError={() => setRecaptchaToken('')}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    tabIndex={4}
                    className="w-full bg-[#00b87c] hover:bg-[#00a36d] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-2 disabled:opacity-50"
                >
                    {processing ? t("Connexion en cours...") : t("Se connecter")}
                </button>

                <div className="text-center mt-5 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                        {t("Pas encore de compte ?")}{' '}
                        <TextLink
                            href={route('register')}
                            className="font-bold text-[#00b87c] hover:underline"
                            tabIndex={6}
                        >
                            {t("Créer un compte gratuitement")}
                        </TextLink>
                    </p>
                </div>

                {/* Divider */}
                <div className="my-5">
                    <div className="flex items-center">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <div className="w-2 h-2 rotate-45 mx-4" style={{ backgroundColor: primaryColor }}></div>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                </div>

                {isDemo && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 tracking-wider mb-4 text-center">{t('Quick Access')}</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={async () => {
                                    if (recaptchaEnabled) {
                                        try {
                                            const token = await executeRecaptcha();
                                            if (!token) {
                                                alert(t('Please complete the reCAPTCHA verification'));
                                                return;
                                            }
                                            router.post(route('login'), {
                                                email: 'superadmin@example.com',
                                                password: 'password',
                                                remember: false,
                                                recaptcha_token: token
                                            });
                                        } catch {
                                            alert(t('reCAPTCHA verification failed. Please try again.'));
                                        }
                                    } else {
                                        router.post(route('login'), {
                                            email: 'superadmin@example.com',
                                            password: 'password',
                                            remember: false,
                                            recaptcha_token: recaptchaToken
                                        });
                                    }
                                }}
                                className="group relative py-2 px-4 border text-[13px] font-medium text-white transition-all duration-200 rounded-md shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                            >
                                {t('Super Admin')}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (recaptchaEnabled) {
                                        try {
                                            const token = await executeRecaptcha();
                                            if (!token) {
                                                alert(t('Please complete the reCAPTCHA verification'));
                                                return;
                                            }
                                            router.post(route('login'), {
                                                email: 'company@example.com',
                                                password: 'password',
                                                remember: false,
                                                recaptcha_token: token
                                            });
                                        } catch {
                                            alert(t('reCAPTCHA verification failed. Please try again.'));
                                        }
                                    } else {
                                        router.post(route('login'), {
                                            email: 'company@example.com',
                                            password: 'password',
                                            remember: false,
                                            recaptcha_token: recaptchaToken
                                        });
                                    }
                                }}
                                className="group relative py-2 px-4 border text-[13px] font-medium text-white transition-all duration-200 rounded-md shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                            >
                                {t('Shop Owner')}
                            </button>
                        </div>

                        {/* Divider */}
                <div className="my-5">
                    <div className="flex items-center">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <div className="w-2 h-2 rotate-45 mx-4" style={{ backgroundColor: primaryColor }}></div>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                </div>

                        {demoStores && demoStores.length > 0 && (
                            <div className='mt-4'>
                                <h3 className="text-sm font-medium text-gray-900 tracking-wider mb-4 text-center">{t('Store Themes')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {demoStores.map((store) => (
                                        <div key={store.id} className="relative group w-full">
                                            <button
                                                type="button"
                                                onClick={(e) => openStoreInNewTab(store, e)}
                                                onMouseEnter={() => setHoveredStore(store.theme)}
                                                onMouseLeave={() => setHoveredStore(null)}
                                                style={{ '--btn-color': primaryColor } as React.CSSProperties}
                                                className="w-full py-2 px-3 text-[13px] text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-md border border-gray-200 hover:border-gray-300 font-medium cursor-pointer"
                                            >
                                                {store.theme
                                                    .split('-')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}
                                            </button>

                                            {/* Theme Preview Tooltip */}
                                            {hoveredStore === store.theme && getThemeThumbnail(store.theme) && (
                                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white p-1.5 rounded-lg shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 w-48 pointer-events-none">
                                                    <div className="relative rounded overflow-hidden bg-gray-50 aspect-[16/10]">
                                                        <img
                                                            src={getThemeThumbnail(store.theme)}
                                                            alt={store.theme}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Tooltip Arrow */}
                                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 shadow-sm"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </AuthLayout>
    );
}