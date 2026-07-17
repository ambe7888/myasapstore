import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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
            title={t("Create your account")}
            description={t("Enter your details below to get started")}
        >
            <form className="mt-6" onSubmit={submit}>
                <div className="space-y-5">
                    <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Full name")}</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t("John Doe")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                            style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="store_name" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Store Name")}</Label>
                        <Input
                            id="store_name"
                            type="text"
                            required
                            tabIndex={2}
                            value={data.store_name}
                            onChange={(e) => setData('store_name', e.target.value)}
                            placeholder={t("Ma Super Boutique")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                            style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                        />
                        <InputError message={errors.store_name} />
                    </div>

                    <div>
                        <Label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Email address")}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t("Enter your email")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                            style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Phone Number")}</Label>
                        <div className="flex gap-2">
                            <select
                                id="country_code"
                                value={data.country_code}
                                onChange={(e) => setData('country_code', e.target.value)}
                                tabIndex={4}
                                className="w-36 px-2.5 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 bg-white transition-colors cursor-pointer text-gray-800"
                                style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
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
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                                style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                            />
                        </div>
                        <InputError message={errors.phone || errors.country_code} />
                    </div>

                    <div>
                        <Label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Password")}</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={6}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder={t("Create a password")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                            style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-900 mb-1.5">{t("Confirm password")}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder={t("Confirm your password")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors placeholder-gray-400 bg-white"
                            style={{ '--tw-ring-color': primaryColor, borderColor: 'rgb(209 213 219)' } as React.CSSProperties}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-start !mt-4 !mb-5">
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={data.terms}
                            onClick={() => setData('terms', !data.terms)}
                            tabIndex={5}
                            className="mt-0.5 w-[14px] h-[14px] border border-gray-300 rounded"
                            style={{ '--tw-ring-color': primaryColor, color: primaryColor } as React.CSSProperties}
                        />
                        <Label htmlFor="terms" className="ml-2 text-sm text-gray-600 font-normal">
                            {t("I agree to the")}{' '}
                            <a href="#" className="font-medium hover:underline" style={{ color: primaryColor }}>
                                {t("Terms and Conditions")}
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

                <AuthButton
                    tabIndex={6}
                    processing={processing}
                >
                    {t("Create account")}
                </AuthButton>

                <div className="text-center mt-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("Already have an account?")}{' '}
                        <TextLink
                            href={route('login')}
                            className="font-medium hover:underline"
                            style={{ color: primaryColor }}
                            tabIndex={7}
                        >
                            {t("Log in")}
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}