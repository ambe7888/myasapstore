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
            title={t("Connexion à votre espace")}
            description={t("Saisissez vos identifiants pour accéder à votre tableau de bord")}
            status={status}
        >
            <form className="mt-4" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">{t("Adresse E-mail")}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t("ex: contact@boutique.com")}
                            className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <Label htmlFor="password" className="block text-xs font-semibold text-slate-300">{t("Mot de passe")}</Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route('password.request')}
                                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                                    tabIndex={5}
                                >
                                    {t("Mot de passe oublié ?")}
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t("••••••••")}
                                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between !mt-3.5">
                        <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer select-none">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                                className="w-4 h-4 border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md"
                            />
                            <span className="text-xs text-slate-400 font-medium">{t("Se souvenir de moi")}</span>
                        </label>
                    </div>
                </div>

                {recaptchaEnabled && (
                    <div className="mt-4">
                        <Recaptcha
                            onVerify={setRecaptchaToken}
                            onExpired={() => setRecaptchaToken('')}
                            onError={() => setRecaptchaToken('')}
                        />
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        type="submit"
                        disabled={processing}
                        tabIndex={4}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {processing ? t("Connexion en cours...") : t("SE CONNECTER")}
                    </Button>
                </div>

                <div className="text-center mt-5">
                    <p className="text-xs text-slate-400">
                        {t("Pas encore de compte ?")}{' '}
                        <TextLink
                            href={route('register')}
                            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            tabIndex={6}
                        >
                            {t("Créer ma boutique")}
                        </TextLink>
                    </p>
                </div>

                {isDemo && (
                    <div className="mt-6 pt-5 border-t border-slate-800/80">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">{t('Accès Rapide Démo')}</h3>

                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={async () => {
                                    if (recaptchaEnabled) {
                                        try {
                                            const token = await executeRecaptcha();
                                            if (!token) return;
                                            router.post(route('login'), {
                                                email: 'superadmin@example.com',
                                                password: 'password',
                                                remember: false,
                                                recaptcha_token: token
                                            });
                                        } catch {}
                                    } else {
                                        router.post(route('login'), {
                                            email: 'superadmin@example.com',
                                            password: 'password',
                                            remember: false,
                                            recaptcha_token: recaptchaToken
                                        });
                                    }
                                }}
                                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-all text-center"
                            >
                                {t('Super Admin')}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (recaptchaEnabled) {
                                        try {
                                            const token = await executeRecaptcha();
                                            if (!token) return;
                                            router.post(route('login'), {
                                                email: 'company@example.com',
                                                password: 'password',
                                                remember: false,
                                                recaptcha_token: token
                                            });
                                        } catch {}
                                    } else {
                                        router.post(route('login'), {
                                            email: 'company@example.com',
                                            password: 'password',
                                            remember: false,
                                            recaptcha_token: recaptchaToken
                                        });
                                    }
                                }}
                                className="py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 text-xs font-medium text-emerald-300 rounded-xl transition-all text-center"
                            >
                                {t('Marchand / Boutique')}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
}