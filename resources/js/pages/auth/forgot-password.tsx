import { useForm, usePage } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/layouts/auth-layout';
import AuthButton from '@/components/auth/auth-button';
import Recaptcha, { executeRecaptcha } from '@/components/recaptcha';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const [recaptchaToken, setRecaptchaToken] = useState<string>('');
    const { themeColor, customColor } = useBrand();
    const { settings = {} } = usePage().props as any;
    const recaptchaEnabled = settings.recaptchaEnabled === 'true' || settings.recaptchaEnabled === true || settings.recaptchaEnabled === 1 || settings.recaptchaEnabled === '1';
    const primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
    const { data, setData, post, processing, errors } = useForm<{ email: string; recaptcha_token?: string }>({
        email: '',
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
                post(route('password.email'), {
                    data: { ...data, recaptcha_token: token },
                });
                return;
            } catch {
                alert(t('reCAPTCHA verification failed. Please try again.'));
                return;
            }
        }

        post(route('password.email'), {
            data: { ...data, recaptcha_token: recaptchaToken },
        });
    };

    return (
        <AuthLayout
            title={t("Mot de passe oublié ?")}
            description={t("Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.")}
            status={status}
        >
            <form className="mt-4" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">{t("Adresse e-mail")}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder={t("vendeur@example.com")}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00b87c] transition-all placeholder-slate-400 bg-slate-50 focus:bg-white text-slate-900"
                        />
                        <InputError message={errors.email} />
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
                    tabIndex={2}
                    className="w-full bg-[#00b87c] hover:bg-[#00a36d] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-4 disabled:opacity-50"
                >
                    {processing ? t("Envoi en cours...") : t("Envoyer le lien de réinitialisation")}
                </button>

                <div className="text-center mt-5 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                        {t("Vous vous souvenez de votre mot de passe ?")}{' '}
                        <TextLink
                            href={route('login')}
                            className="font-bold text-[#00b87c] hover:underline"
                            tabIndex={3}
                        >
                            {t("Retour à la connexion")}
                        </TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}