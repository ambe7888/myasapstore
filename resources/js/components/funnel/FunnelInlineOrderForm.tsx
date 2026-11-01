import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle, Loader, Lock, Minus, Plus } from 'lucide-react';
import { useCurrencyFormatter } from '@/hooks/use-store-currency';

interface Offer {
  label: string;
  qty: number;
  total: number;
  badge?: string;
}

interface Props {
  settings: Record<string, any>;
  product: any;
  store: any;
  storeSettings: any;
  shippingMethods: any[];
  customer?: any;
  funnelId: number;
  onSuccess?: (orderNumber: string) => void;
}

const inputClass =
  'w-full h-11 px-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:border-slate-900';

export default function FunnelInlineOrderForm({
  settings: s, product, store, storeSettings, shippingMethods, customer, funnelId, onSuccess,
}: Props) {
  const formatAmount = useCurrencyFormatter();
  const color = s.button_color || '#16a34a';
  const unitPrice = Number(product.sale_price || product.price || 0);

  const offers: Offer[] = useMemo(
    () => (Array.isArray(s.offers) ? s.offers : []).filter((o: Offer) => Number(o.qty) > 0),
    [s.offers]
  );

  const [offerIndex, setOfferIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>({});
  const [shippingId, setShippingId] = useState<string>(shippingMethods?.[0]?.id?.toString() || '');
  const [form, setForm] = useState({
    name: customer?.first_name || '',
    phone: customer?.phone || '',
    whatsapp: '',
    address: '',
    email: customer?.email || '',
    date: '',
    sameDay: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const offer = offers.length > 0 ? offers[offerIndex] : null;
  const qty = offer ? Number(offer.qty) : quantity;
  const subtotal = offer && Number(offer.total) > 0 ? Number(offer.total) : unitPrice * qty;
  const shipping = shippingMethods.find(m => m.id.toString() === shippingId);
  const shippingCost = Number(shipping?.cost || 0);
  const total = subtotal + shippingCost;
  const variants: any[] = Array.isArray(product.variants) ? product.variants : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Veuillez entrer votre nom complet.');
    if (!form.phone.trim()) return setError('Veuillez entrer votre numéro de téléphone.');
    if (!form.address.trim()) return setError('Veuillez indiquer votre ville / quartier.');
    for (const v of variants) {
      if (v?.name && Array.isArray(v.options) && v.options.length > 0 && !variant[v.name]) {
        return setError(`Veuillez choisir : ${v.name}`);
      }
    }

    setLoading(true);
    setError(null);

    const notes = [
      form.sameDay ? 'Livraison aujourd\'hui' : form.date ? `Livraison souhaitée le ${form.date}` : '',
    ].filter(Boolean).join(' — ');

    router.post(route('store.order.place', { storeSlug: store.slug }), {
      product_id: product.id,
      quantity: qty,
      variant: Object.keys(variant).length ? variant : null,
      shipping_id: shipping?.id,
      shipping_method_id: shipping?.id,
      payment_method: 'cod',
      first_name: form.name,
      last_name: '',
      email: form.email,
      phone: form.phone,
      whatsapp_number: form.whatsapp,
      address: form.address,
      city: shipping?.name || form.address,
      country: storeSettings?.country || '',
      notes,
      funnel_id: funnelId,
      offer_qty: offer ? Number(offer.qty) : null,
    } as any, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page: any) => {
        const num = page.props?.flash?.order_number || 'OK';
        setDone(num);
        setLoading(false);
        onSuccess?.(num);
      },
      onError: (errors: any) => {
        setError((Object.values(errors)[0] as string) || 'Erreur lors de la validation de votre commande.');
        setLoading(false);
      },
    });
  };

  if (done) {
    return (
      <div id="commander" style={{ backgroundColor: s.bg_color || '#f8fafc', padding: '2rem 1rem' }}>
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <CheckCircle className="h-14 w-14 mx-auto mb-3" style={{ color }} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Commande confirmée !</h3>
          <p className="text-sm text-slate-600">
            {s.success_message || 'Un conseiller va vous appeler très bientôt.'}
          </p>
          {done !== 'OK' && done !== 'SUCCESS' && (
            <p className="mt-4 text-xs text-slate-400">N° de commande : <span className="font-mono font-semibold text-slate-700">{done}</span></p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="commander" style={{ backgroundColor: s.bg_color || '#f8fafc', padding: '2rem 1rem' }}>
      <form onSubmit={submit} className="max-w-md mx-auto bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">{s.title || 'Commandez maintenant'}</h2>
          {s.subtitle && <p className="text-sm text-slate-500 mt-1">{s.subtitle}</p>}
        </div>

        {offers.length > 0 && (
          <div className="space-y-2">
            {offers.map((o, i) => {
              const price = Number(o.total) > 0 ? Number(o.total) : unitPrice * Number(o.qty);
              const active = i === offerIndex;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setOfferIndex(i)}
                  className="relative w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all"
                  style={{ borderColor: active ? color : '#e2e8f0', backgroundColor: active ? `${color}12` : '#fff' }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: active ? color : '#cbd5e1' }}
                    >
                      {active && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
                    </span>
                    <span className="font-semibold text-sm text-slate-900">{o.label}</span>
                  </span>
                  <span className="font-bold text-sm text-slate-900">{formatAmount(price)}</span>
                  {o.badge && (
                    <span
                      className="absolute -top-2.5 right-3 text-[10px] font-bold uppercase text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      {o.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {variants.map((v: any) => (
          Array.isArray(v?.options) && v.options.length > 0 ? (
            <div key={v.name}>
              <p className="text-xs font-semibold text-slate-600 mb-1.5">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt: string) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setVariant(prev => ({ ...prev, [v.name]: opt }))}
                    className="px-3 py-1.5 text-sm rounded-lg border-2 font-medium"
                    style={variant[v.name] === opt
                      ? { borderColor: color, backgroundColor: `${color}12`, color: '#0f172a' }
                      : { borderColor: '#e2e8f0', color: '#475569' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : null
        ))}

        <div className="space-y-3">
          <input className={inputClass} placeholder="Nom complet *" value={form.name} onChange={e => setField('name', e.target.value)} />
          <input className={inputClass} type="tel" placeholder="Téléphone *" value={form.phone} onChange={e => setField('phone', e.target.value)} />
          {s.show_whatsapp !== false && (
            <input className={inputClass} type="tel" placeholder="WhatsApp (si différent)" value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} />
          )}
          {s.show_email && (
            <input className={inputClass} type="email" placeholder="E-mail" value={form.email} onChange={e => setField('email', e.target.value)} />
          )}
          {shippingMethods.length > 0 && (
            <select className={inputClass} value={shippingId} onChange={e => setShippingId(e.target.value)}>
              {shippingMethods.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({Number(m.cost) === 0 ? 'Gratuit' : formatAmount(m.cost)})
                </option>
              ))}
            </select>
          )}
          <input className={inputClass} placeholder="Ville / Quartier *" value={form.address} onChange={e => setField('address', e.target.value)} />
        </div>

        {s.show_delivery_date && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Livraison aujourd'hui ?</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: true, l: 'OUI' }, { v: false, l: 'Planifier une date' }].map(opt => (
                <button
                  key={opt.l}
                  type="button"
                  onClick={() => setField('sameDay', opt.v)}
                  className="h-10 rounded-lg border-2 text-sm font-semibold"
                  style={form.sameDay === opt.v ? { borderColor: color, backgroundColor: `${color}12` } : { borderColor: '#e2e8f0', color: '#475569' }}
                >
                  {opt.l}
                </button>
              ))}
            </div>
            {!form.sameDay && (
              <input className={`${inputClass} mt-2`} type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
            )}
          </div>
        )}

        {offers.length === 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Quantité</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center font-bold">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-slate-500">Sous-total</span><span className="font-medium">{formatAmount(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Livraison</span><span className="font-medium">{shippingCost === 0 ? 'Gratuite' : formatAmount(shippingCost)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold"><span>Total</span><span>{formatAmount(total)}</span></div>
        </div>

        {error && <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 rounded-xl border border-rose-200">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl text-white text-base font-extrabold tracking-wide flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ backgroundColor: color }}
        >
          {loading && <Loader className="h-4 w-4 animate-spin" />}
          {loading ? 'Traitement en cours…' : (s.button_text || 'COMMANDER')}
        </button>

        {Array.isArray(s.trust_lines) && s.trust_lines.length > 0 && (
          <div className="space-y-1">
            {s.trust_lines.map((line: string, i: number) => (
              <p key={i} className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3 w-3" /> {line}
              </p>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
