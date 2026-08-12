import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/layouts/auth-layout';
import Recaptcha, { executeRecaptcha } from '@/components/recaptcha';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { Eye, EyeOff } from 'lucide-react';

type RegisterForm = {
    name: string;
    store_name: string;
    email: string;
    country_code: string;
    phone: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
    recaptcha_token?: string;
    plan_id?: string;
    referral_code?: string;
};

const COUNTRY_CODES = [
  { code: '+225', name: "Côte d'Ivoire (+225)", flag: '🇨🇮' },
  { code: '+33', name: 'France (+33)', flag: '🇫🇷' },
  { code: '+221', name: 'Sénégal (+221)', flag: '🇸🇳' },
  { code: '+237', name: 'Cameroun (+237)', flag: '🇨🇲' },
  { code: '+212', name: 'Maroc (+212)', flag: '🇲🇦' },
  { code: '+213', name: 'Algérie (+213)', flag: '🇩🇿' },
  { code: '+216', name: 'Tunisie (+216)', flag: '🇹🇳' },
  { code: '+223', name: 'Mali (+223)', flag: '🇲🇱' },
  { code: '+226', name: 'Burkina Faso (+226)', flag: '🇧🇫' },
  { code: '+224', name: 'Guinée (+224)', flag: '🇬🇳' },
  { code: '+228', name: 'Togo (+228)', flag: '🇹🇬' },
  { code: '+229', name: 'Bénin (+229)', flag: '🇧🇯' },
  { code: '+241', name: 'Gabon (+241)', flag: '🇬🇦' },
  { code: '+242', name: 'Congo (+242)', flag: '🇨🇬' },
  { code: '+243', name: 'RDC (+243)', flag: '🇨🇩' },
  { code: '+261', name: 'Madagascar (+261)', flag: '🇲🇬' },
  { code: '+230', name: 'Maurice (+230)', flag: '🇲🇺' },
  { code: '+509', name: 'Haïti (+509)', flag: '🇭🇹' },
  { code: '+32', name: 'Belgique (+32)', flag: '🇧🇪' },
  { code: '+41', name: 'Suisse (+41)', flag: '🇨🇭' },
  { code: '+1', name: 'Canada / US (+1)', flag: '🇨🇦' },
  { code: '+44', name: 'Royaume-Uni (+44)', flag: '🇬🇧' },
  { code: '+34', name: 'Espagne (+34)', flag: '🇪🇸' },
  { code: '+39', name: 'Italie (+39)', flag: '🇮🇹' },
  { code: '+49', name: 'Allemagne (+49)', flag: '🇩🇪' },
  { code: '+351', name: 'Portugal (+351)', flag: '🇵🇹' },
  { code: '+971', name: 'Émirats Arabes (+971)', flag: '🇦🇪' },
  { code: '+966', name: 'Arabie Saoudite (+966)', flag: '🇸🇦' },
];

export default function Register({ referralCode, planId }: { referralCode?: string; planId?: string }) {
    const { t } = useTranslation();
    const [recaptchaToken, setRecaptchaToken] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { themeColor, customColor } = useBrand();
    const { settings = {} } = usePage().props as any;
    const recaptchaEnabled = settings.recaptchaEnabled === 'true' || settings.recaptchaEnabled === true || settings.recaptchaEnabled === 1 || settings.recaptchaEnabled === '1';
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        store_name: '',
        email: '',
        country_code: '+225',
        phone: '',
        password: '',
        password_confirmation: '',
        terms: false,
        plan_id: planId,
        referral_code: referralCode,
    });

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
                post(route('register'), {
                    data: formData,
                });
            } catch {
                alert(t('reCAPTCHA verification failed. Please try again.'));
                return;
            }
        } else {
            post(route('register'), {
                data: { ...data, recaptcha_token: recaptchaToken },
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    return (
        <AuthLayout
            title={t("Créer votre compte gratuit")}
            description={t("Remplissez les informations ci-dessous pour lancer votre boutique")}
        >
            <form className="mt-4" onSubmit={submit}>
                <div className="space-y-3.5">
                    <div>
                        <Label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">{t("Nom complet")}</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t("Jean Dupont")}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="store_name" className="block text-xs font-semibold text-slate-700 mb-1">{t("Nom de la boutique")}</Label>
                        <Input
                            id="store_name"
                            type="text"
                            required
                            tabIndex={2}
                            value={data.store_name}
                            onChange={(e) => setData('store_name', e.target.value)}
                            placeholder={t("Ma Super Boutique")}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                        />
                        <InputError message={errors.store_name} />
                    </div>

                    <div>
                        <Label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">{t("Adresse e-mail")}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t("vendeur@example.com")}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">{t("Numéro de téléphone")}</Label>
                        <div className="flex gap-2">
                            <select
                                id="country_code"
                                value={data.country_code}
                                onChange={(e) => setData('country_code', e.target.value)}
                                tabIndex={4}
                                className="w-32 px-2.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] bg-slate-50 text-slate-900 cursor-pointer"
                            >
                                {COUNTRY_CODES.map((item) => (
                                    <option key={`${item.code}-${item.flag}`} value={item.code}>
                                        {item.flag} {item.code}
                                    </option>
                                ))}
                            </select>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                tabIndex={5}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="07 00 00 00 00"
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                            />
                        </div>
                        <InputError message={errors.phone || errors.country_code} />
                    </div>

                    <div>
                        <Label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">{t("Mot de passe")}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={6}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t("Créer un mot de passe")}
                                className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
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

                    <div>
                        <Label htmlFor="password_confirmation" className="block text-xs font-semibold text-slate-700 mb-1">{t("Confirmer le mot de passe")}</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                tabIndex={7}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder={t("Confirmer le mot de passe")}
                                className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-start pt-1 pb-1">
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={data.terms}
                            onClick={() => setData('terms', !data.terms)}
                            tabIndex={8}
                            className="mt-0.5 w-4 h-4 border border-slate-300 rounded text-[#00b87c] focus:ring-[#00b87c]"
                        />
                        <Label htmlFor="terms" className="ml-2 text-xs text-slate-600 font-medium cursor-pointer">
                            {t("J'accepte les")}{' '}
                            <a href={route('custom-page.show', 'terms-of-service')} target="_blank" className="font-bold text-[#00b87c] hover:underline">
                                {t("Conditions Générales")}
                            </a>
                        </Label>
                    </div>
                    <InputError message={errors.terms} />
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
                    tabIndex={9}
                    className="w-full bg-[#00b87c] hover:bg-[#00a36d] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-3 disabled:opacity-50"
                >
                    {processing ? t("Création en cours...") : t("Créer mon compte")}
                </button>

                <div className="text-center mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                        {t("Vous avez déjà un compte ?")}{' '}
                        <TextLink
                            href={route('login')}
                            className="font-bold text-[#00b87c] hover:underline"
                            tabIndex={10}
                        >
                            {t("Se connecter")}
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}