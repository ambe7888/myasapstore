import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, ChevronRight, CheckCircle, ShoppingBag, Package, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/utils/image-helper';
import axios from 'axios';
import { generateStoreUrl, generateApiUrl } from '@/utils/store-url-helper';
import { useCurrencyFormatter } from '@/hooks/use-store-currency';

interface Props {
  product: any;
  store: any;
  storeSettings: any;
  currencies: any[];
  shippingMethods: any[];
  isLoggedIn: boolean;
  customer: any;
  funnelId: number;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}

type Step = 'checkout' | 'success';

export default function FunnelCheckoutPopup({
  product, store, storeSettings, currencies, shippingMethods, isLoggedIn, customer, funnelId, onClose, onSuccess
}: Props) {
  const { t } = useTranslation();
  const formatAmount = useCurrencyFormatter();

  const [step, setStep] = useState<Step>('checkout');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState<any>(shippingMethods?.[0] || null);

  const [form, setForm] = useState({
    first_name:  customer?.first_name || '',
    last_name:   customer?.last_name || '',
    email:       customer?.email || '',
    phone:       customer?.phone || '',
    address:     '',
    city:        '',
    country:     storeSettings?.country || '',
    payment_method: 'cod',
    notes:       '',
  });

  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Fetch payment methods
  React.useEffect(() => {
    if (store?.id) {
      setLoadingPayments(true);
      axios.get(generateApiUrl('store.payment-methods', store))
        .then(response => {
          const methods = response.data;
          if (methods.length > 0) {
            setPaymentMethods(methods);
            setField('payment_method', methods[0].id);
          } else {
            // Fallback: always show at least COD
            const fallback = [{ id: 'cod', name: '💵 Paiement à la livraison' }];
            setPaymentMethods(fallback);
            setField('payment_method', 'cod');
          }
          setLoadingPayments(false);
        })
        .catch(err => {
          console.error("Error loading payment methods:", err);
          // Fallback on error
          const fallback = [{ id: 'cod', name: '💵 Paiement à la livraison' }];
          setPaymentMethods(fallback);
          setField('payment_method', 'cod');
          setLoadingPayments(false);
        });
    }
  }, [store]);

  const price = product.sale_price || product.price;
  const shippingCost = selectedShipping?.cost || 0;
  const subtotal = price * quantity;
  const total = subtotal + Number(shippingCost);

  const hasVariants = product.variants && product.variants.length > 0;

  const placeOrder = async () => {
    if (!form.first_name.trim()) {
      setError('Veuillez entrer votre nom complet.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone.');
      return;
    }
    if (!selectedShipping) {
      setError('Veuillez sélectionner une zone de livraison.');
      return;
    }
    if (!form.address.trim()) {
      setError('Veuillez entrer votre adresse précise.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await router.post(route('store.order.place', { storeSlug: store.slug }), {
        product_id:         product.id,
        quantity:           quantity,
        variant:            selectedVariant,
        shipping_id:        selectedShipping?.id,
        shipping_method_id: selectedShipping?.id,
        payment_method:     form.payment_method,
        first_name:         form.first_name,
        last_name:          form.last_name,
        email:              form.email,
        phone:              form.phone,
        address:            form.address,
        city:               selectedShipping?.name || 'Livraison',
        country:            form.country,
        notes:              form.notes,
        funnel_id:          funnelId,
      }, {
        preserveState: true,
        onSuccess: (page: any) => {
          const num = page.props?.flash?.order_number || 'SUCCESS';
          setOrderNumber(num);
          setStep('success');
          onSuccess(num);
          setLoading(false);
        },
        onError: (errors: any) => {
          const firstError = Object.values(errors)[0] as string;
          setError(firstError || 'Erreur lors de la validation de votre commande.');
          setLoading(false);
        },
      });
    } catch (err) {
      setError('Une erreur est survenue lors de la commande.');
      setLoading(false);
    }
  };

  const themeColor = store?.primary_color || '#4f46e5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Dynamic Theme Styles to replace hardcoded violet */}
      <style>{`
        .funnel-theme-text {
          color: ${themeColor} !important;
        }
        .funnel-theme-bg {
          background-color: ${themeColor} !important;
        }
        .funnel-theme-border {
          border-color: ${themeColor} !important;
        }
        .funnel-theme-bg-light {
          background-color: color-mix(in srgb, ${themeColor} 8%, white) !important;
        }
        .funnel-theme-border-light {
          border-color: color-mix(in srgb, ${themeColor} 20%, white) !important;
        }
        .funnel-theme-btn {
          background-color: ${themeColor} !important;
          color: #ffffff !important;
        }
        .funnel-theme-btn:hover {
          background-color: color-mix(in srgb, ${themeColor} 85%, black) !important;
        }
        .funnel-theme-ring:focus {
          --tw-ring-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 funnel-theme-text" />
            <span className="font-bold text-slate-800">
              {step === 'success' ? t('Order Confirmed!') : t('Checkout')}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Order Summary */}
          {step !== 'success' && (
            <div className="flex gap-3 p-3 bg-slate-50 rounded-xl mb-5 border border-slate-100">
              {product.cover_image && (
                <img src={getImageUrl(product.cover_image)} alt={product.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold funnel-theme-text">{formatAmount(price)}</span>
                  {product.sale_price && (
                    <span className="text-xs text-slate-400 line-through">{formatAmount(product.price)}</span>
                  )}
                </div>
                {/* Quantity */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-sm font-bold hover:bg-slate-300"
                  >-</button>
                  <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                    className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-sm font-bold hover:bg-slate-300"
                  >+</button>
                </div>
              </div>
            </div>
          )}

          {/* Variants */}
          {step === 'checkout' && hasVariants && (
            <div className="mb-5">
              {product.variants.map((variant: any) => (
                <div key={variant.name} className="mb-3">
                  <Label className="text-xs font-semibold text-slate-600 mb-1.5 block">{variant.name}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(variant.options || []).map((option: string) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedVariant({ ...selectedVariant, [variant.name]: option })}
                        className={`px-3 py-1.5 text-xs rounded-lg border-2 font-medium transition-all ${
                          selectedVariant?.[variant.name] === option
                            ? 'funnel-theme-border funnel-theme-bg-light funnel-theme-text'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-4 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Checkout Form */}
          {step === 'checkout' && (
            <form onSubmit={(e) => { e.preventDefault(); placeOrder(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom complet *</Label>
                  <Input
                    required
                    placeholder="Ex: Jean Dupont"
                    className="h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500"
                    value={form.first_name}
                    onChange={e => setField('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Téléphone *</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="Ex: 06 12 34 56 78"
                    className="h-9 text-sm"
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Adresse e-mail</Label>
                  <Input
                    type="email"
                    placeholder="Ex: jean.dupont@gmail.com"
                    className="h-9 text-sm"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Zone de livraison *</Label>
                  <select
                    required
                    value={selectedShipping?.id || ''}
                    onChange={e => {
                      const selected = shippingMethods.find(m => m.id.toString() === e.target.value);
                      setSelectedShipping(selected || null);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent text-slate-900 outline-none h-9"
                  >
                    <option value="">Sélectionnez votre zone</option>
                    {shippingMethods.map((method: any) => (
                      <option key={method.id} value={method.id}>
                        {method.name} ({Number(method.cost) === 0 ? 'Gratuit' : formatAmount(method.cost)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Adresse précise (Rue, Quartier, Bâtiment...) *</Label>
                <Input
                  required
                  placeholder="Ex: Rue 12, Lot 4, à côté de la pharmacie"
                  className="h-9 text-sm"
                  value={form.address}
                  onChange={e => setField('address', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Mode de paiement</Label>
                {loadingPayments ? (
                  <div className="text-xs text-slate-500 py-2">Chargement des modes de paiement...</div>
                ) : (
                  <select
                    value={form.payment_method}
                    onChange={e => setField('payment_method', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-transparent text-slate-900 outline-none h-9"
                  >
                    {paymentMethods.map((method: any) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 mt-4">
                <p className="text-sm font-bold text-slate-700 mb-2">{t('Order Summary')}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('Subtotal')}</span>
                  <span className="font-medium">{formatAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('Shipping')}</span>
                  <span className="font-medium">
                    {Number(shippingCost) === 0 ? t('Free') : formatAmount(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span>{t('Total')}</span>
                  <span className="funnel-theme-text text-lg font-bold">{formatAmount(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full gap-2 funnel-theme-btn font-bold rounded-xl py-3.5"
                  disabled={loading}
                >
                  {loading && <Loader className="h-4 w-4 animate-spin mr-1" />}
                  {loading ? 'Validation de la commande...' : 'Confirmer la commande'}
                </Button>
              </div>
            </form>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{t('Order Placed Successfully!')}</h2>
              <p className="text-slate-500 mb-4">
                {t('Your order has been placed. We will contact you shortly.')}
              </p>
              {orderNumber && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 inline-block">
                  <p className="text-xs text-slate-400">{t('Order number')}</p>
                  <p className="font-bold text-slate-800 font-mono">{orderNumber}</p>
                </div>
              )}
              <Button onClick={onClose} className="mt-6 w-full">{t('Close')}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

