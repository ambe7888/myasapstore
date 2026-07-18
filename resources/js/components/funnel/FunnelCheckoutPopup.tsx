import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, ChevronRight, CheckCircle, ShoppingBag, Package, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/utils/image-helper';

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

type Step = 'info' | 'shipping' | 'payment' | 'success';

export default function FunnelCheckoutPopup({
  product, store, storeSettings, currencies, shippingMethods, isLoggedIn, customer, funnelId, onClose, onSuccess
}: Props) {
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
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

  const price = product.sale_price || product.price;
  const shippingCost = selectedShipping?.cost || 0;
  const subtotal = price * quantity;
  const total = subtotal + Number(shippingCost);
  const currency = storeSettings?.currency_symbol || 'MAD';

  const hasVariants = product.variants && product.variants.length > 0;

  const placeOrder = async () => {
    setLoading(true);
    try {
      await router.post(route('store.order.place', { storeSlug: store.slug }), {
        product_id:     product.id,
        quantity:       quantity,
        variant:        selectedVariant,
        shipping_id:    selectedShipping?.id,
        payment_method: form.payment_method,
        first_name:     form.first_name,
        last_name:      form.last_name,
        email:          form.email,
        phone:          form.phone,
        address:        form.address,
        city:           form.city,
        country:        form.country,
        notes:          form.notes,
        funnel_id:      funnelId,
      }, {
        preserveState: true,
        onSuccess: (page: any) => {
          const num = page.props?.flash?.order_number || 'SUCCESS';
          setOrderNumber(num);
          setStep('success');
          onSuccess(num);
          setLoading(false);
        },
        onError: () => setLoading(false),
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-violet-600" />
            <span className="font-bold text-slate-800">
              {step === 'success' ? t('Order Confirmed!') : t('Checkout')}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps indicator */}
        {step !== 'success' && (
          <div className="flex items-center px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            {['info', 'shipping', 'payment'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? 'text-violet-600' : 'text-slate-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  {s === 'info' ? t('Info') : s === 'shipping' ? t('Shipping') : t('Payment')}
                </div>
                {i < 2 && <ChevronRight className="h-3 w-3 text-slate-300 mx-2 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        )}

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
                  <span className="font-bold text-violet-700">{price} {currency}</span>
                  {product.sale_price && (
                    <span className="text-xs text-slate-400 line-through">{product.price} {currency}</span>
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
          {step === 'info' && hasVariants && (
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
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
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

          {/* Step: Info */}
          {step === 'info' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('First Name')} *</Label>
                  <Input className="h-9 text-sm" value={form.first_name} onChange={e => setField('first_name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('Last Name')} *</Label>
                  <Input className="h-9 text-sm" value={form.last_name} onChange={e => setField('last_name', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('Email')} *</Label>
                <Input className="h-9 text-sm" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('Phone')} *</Label>
                <Input className="h-9 text-sm" type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('Address')} *</Label>
                <Input className="h-9 text-sm" value={form.address} onChange={e => setField('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('City')} *</Label>
                  <Input className="h-9 text-sm" value={form.city} onChange={e => setField('city', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('Country')}</Label>
                  <Input className="h-9 text-sm" value={form.country} onChange={e => setField('country', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step: Shipping */}
          {step === 'shipping' && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 mb-3">{t('Select shipping method')}</p>
              {shippingMethods.length === 0 ? (
                <p className="text-sm text-slate-400">{t('Free shipping')}</p>
              ) : (
                shippingMethods.map((method: any) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedShipping(method)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedShipping?.id === method.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-sm">{method.name}</p>
                        {method.estimated_days && (
                          <p className="text-xs text-slate-400">{method.estimated_days} {t('days')}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-sm text-slate-800">
                      {Number(method.cost) === 0 ? t('Free') : `${method.cost} ${currency}`}
                    </span>
                  </button>
                ))
              )}
              <div className="space-y-1.5 mt-4">
                <Label className="text-xs">{t('Order Notes (optional)')}</Label>
                <textarea
                  rows={2}
                  className="w-full text-sm rounded-xl border border-slate-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200"
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder={t('Special instructions...')}
                />
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">{t('Payment Method')}</p>
              <div className="space-y-2">
                {[
                  { value: 'cod', label: t('Cash on Delivery'), icon: '💵' },
                  { value: 'bank_transfer', label: t('Bank Transfer'), icon: '🏦' },
                ].map(method => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setField('payment_method', method.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.payment_method === method.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-semibold text-sm">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 mt-4">
                <p className="text-sm font-bold text-slate-700 mb-2">{t('Order Summary')}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('Subtotal')}</span>
                  <span className="font-medium">{subtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('Shipping')}</span>
                  <span className="font-medium">{Number(shippingCost) === 0 ? t('Free') : `${shippingCost} ${currency}`}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span>{t('Total')}</span>
                  <span className="text-violet-700 text-lg">{total.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
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

        {/* Footer Actions */}
        {step !== 'success' && (
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              {step !== 'info' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step === 'payment' ? 'shipping' : 'info')}
                >
                  {t('Back')}
                </Button>
              )}
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                disabled={loading}
                onClick={() => {
                  if (step === 'info') {
                    if (!form.first_name || !form.phone || !form.address) return;
                    setStep('shipping');
                  } else if (step === 'shipping') {
                    setStep('payment');
                  } else {
                    placeOrder();
                  }
                }}
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {step === 'payment'
                  ? (loading ? t('Placing Order...') : t('Place Order'))
                  : t('Continue')}
                {!loading && step !== 'payment' && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
            {step === 'payment' && (
              <p className="text-center text-xs text-slate-400 mt-2">
                🔒 {t('Secure checkout')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
