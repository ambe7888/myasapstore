import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { generateStoreUrl } from '@/utils/store-url-helper';
import { formatCurrency } from '@/utils/currency-formatter';
import axios from 'axios';

interface QuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  store: any;
  initialQuantity?: number;
}

export default function QuickCheckoutModal({
  isOpen,
  onClose,
  product,
  store,
  initialQuantity = 1
}: QuickCheckoutModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  if (!isOpen || !product) return null;

  const unitPrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Veuillez entrer votre nom.');
      return;
    }
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone.');
      return;
    }
    if (!address.trim()) {
      setError('Veuillez entrer votre adresse de livraison.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Ensure product is added to cart
      await addToCart(product, { variants: product.variants }, quantity);

      // Step 2: Submit order to store.order.place endpoint
      const orderPayload = {
        store_id: store?.id,
        customer_first_name: firstName,
        customer_last_name: lastName || '',
        customer_email: `${phone.replace(/\D/g, '') || 'client'}@store.local`,
        customer_phone: phone,
        shipping_address: address,
        shipping_city: city || 'Livraison',
        billing_address: address,
        billing_city: city || 'Livraison',
        payment_method: paymentMethod,
      };

      const orderUrl = generateStoreUrl('store.order.place', store);
      const response = await axios.post(orderUrl, orderPayload, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const orderNumber = response.data.order_number;
        window.location.href = generateStoreUrl('store.order-confirmation', store, { orderNumber });
      } else {
        setError(response.data?.message || 'Erreur lors de la validation de votre commande.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Quick Order submit error:', err);
      const msg = err.response?.data?.message || 'Erreur lors du traitement de la commande. Veuillez réessayer.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Commande Express</h3>
              <p className="text-xs text-slate-500">Achat rapide sans inscription</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Product Summary Card */}
          <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 items-center">
            <img
              src={product.cover_image || product.image || '/placeholder.jpg'}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-600 font-bold text-base">
                  {formatCurrency(unitPrice, store?.storeSettings, store?.currencies)}
                </span>
                {product.sale_price && product.sale_price < product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(product.price, store?.storeSettings, store?.currencies)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom complet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Téléphone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Adresse de livraison <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Rue, Quartier, Bâtiment..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ville / Commune
                </label>
                <input
                  type="text"
                  placeholder="Ex: Abidjan, Paris..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="cod">💵 Paiement à la livraison</option>
                  <option value="whatsapp">💬 Commander via WhatsApp</option>
                  <option value="bank">🏦 Virement bancaire</option>
                </select>
              </div>
            </div>

            {/* Total & Guarantee */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total à payer :</span>
                <span className="text-xl font-black text-emerald-600">
                  {formatCurrency(totalPrice, store?.storeSettings, store?.currencies)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Validation de la commande...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmer la commande</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-500" /> Livraison sécurisée
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Données protégées
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
