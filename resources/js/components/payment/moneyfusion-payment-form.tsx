import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/custom-toast';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface MoneyFusionPaymentFormProps {
  planId: number;
  planPrice: number;
  formattedPrice?: string;
  couponCode: string;
  billingCycle: string;
  paymentLink: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MoneyFusionPaymentForm({
  planId,
  planPrice,
  formattedPrice,
  couponCode,
  billingCycle,
  paymentLink,
  onSuccess,
  onCancel,
}: MoneyFusionPaymentFormProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setProcessing(true);

    try {
      const response = await fetch(route('moneyfusion.payment.web'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          coupon_code: couponCode,
          amount: planPrice,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        onSuccess();
      } else {
        toast.error(data.message || t('Failed to submit payment request'));
      }
    } catch (error) {
      toast.error(t('Failed to submit payment request'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <h3 className="font-medium">{t('Money Fusion (Mobile Money)')}</h3>
          <p className="font-medium">
            {t('Amount')}: {formattedPrice || planPrice}
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href={paymentLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('Payer via Money Fusion')}
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">{t('Important Instructions')}</p>
              <ul className="space-y-1 text-xs">
                <li>• {t('Payez le montant exact indiqué ci-dessus via le lien Money Fusion')}</li>
                <li>• {t("Revenez ensuite ici et cliquez sur « J'ai effectué le paiement »")}</li>
                <li>• {t('Votre abonnement sera activé après vérification du paiement')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('Cancel')}
        </Button>
        <Button onClick={handleConfirmPayment} disabled={processing} className="flex-1">
          {processing ? t('Processing...') : t("J'ai effectué le paiement")}
        </Button>
      </div>
    </div>
  );
}
