import React from 'react';
import { PageTemplate } from '@/components/page-template';
import { ArrowLeft, Edit, Package, User, CreditCard, Truck, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { formatCurrency } from '@/utils/helpers';
import ItemVariants from '@/components/store/ItemVariants';
import { usePermissions } from '@/hooks/usePermissions';
import { getImageUrl } from '@/utils/image-helper';

interface OrderShowProps {
  order: {
    id: number;
    orderNumber: string;
    date: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    shippingAddress: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    items: Array<{
      id: number;
      name: string;
      sku: string;
      quantity: number;
      price: number;
      image: string;
    }>;
    summary: {
      subtotal: number;
      shipping: number;
      tax: number;
      discount: number;
      total: number;
    };
    shippingMethod: string;
    trackingNumber?: string;
  };
}

export default function ShowOrder({ order }: OrderShowProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const getStatusLabel = (status: string) => {
    if (!status) return t('Non spécifié');
    const s = status.toLowerCase();
    const map: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé',
      paid: 'Payé',
      unpaid: 'Non payé',
      refunded: 'Remboursé',
      order_placed: 'Commande passée',
      order_processing: 'En cours de traitement',
      order_shipped: 'Commande expédiée',
      order_delivered: 'Commande livrée',
      order_cancelled: 'Commande annulée',
    };
    return t(map[s] || status);
  };

  const getPaymentMethodName = (method: string) => {
    if (!method) return t('Paiement en ligne');
    const m = method.toLowerCase();
    if (m.includes('cash') || m.includes('cod')) return t('Paiement à la livraison');
    if (m.includes('bank') || m.includes('transfer')) return t('Virement bancaire');
    const map: Record<string, string> = {
      cash_on_delivery: 'Paiement à la livraison',
      bank_transfer: 'Virement bancaire',
      stripe: 'Stripe',
      paypal: 'PayPal',
      razorpay: 'Razorpay',
      paystack: 'Paystack',
      flutterwave: 'Flutterwave',
    };
    return t(map[m] || method);
  };

  const getShippingMethodName = (method: string) => {
    if (!method) return t('Standard');
    const m = method.toLowerCase();
    if (m.includes('flat')) return t('Tarif fixe');
    if (m.includes('free')) return t('Livraison gratuite');
    if (m.includes('pickup')) return t('Retrait en magasin');
    return t(method);
  };

  const pageActions = [
    {
      label: t('Retour'),
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.visit(route('orders.index'))
    }
  ];
  
  if (hasPermission('edit-orders')) {
    pageActions.push({
      label: t('Modifier la commande'),
      icon: <Edit className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('orders.edit', order.id))
    });
  }

  return (
    <PageTemplate 
      title={t('Détails de la commande')}
      description={t('Consultez les articles, l\'adresse de livraison et l\'historique du statut')}
      url="/orders/show"
      actions={pageActions}
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: t('Commandes'), href: route('orders.index') },
        { title: t('Détails de la commande') }
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('Commande N° {{number}}', { number: order.orderNumber })}</CardTitle>
                <Badge variant={['completed', 'delivered', 'paid'].includes(order.status.toLowerCase()) ? 'default' : 'secondary'}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Date de commande')}</p>
                  <p>{order.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Moyen de paiement')}</p>
                  <p className="font-semibold text-gray-800">{getPaymentMethodName(order.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Statut du paiement')}</p>
                  <Badge variant={order.paymentStatus.toLowerCase() === 'paid' ? 'default' : 'secondary'}>
                    {getStatusLabel(order.paymentStatus)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Statut de livraison')}</p>
                  <Badge variant={order.status.toLowerCase() === 'delivered' ? 'default' : 'secondary'}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Récapitulatif de la commande')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">{t('Sous-total')}</span>
                <span>{formatCurrency(order.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('Frais de livraison')}</span>
                <span>{formatCurrency(order.summary.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('Taxes / TVA')}</span>
                <span>{formatCurrency(order.summary.tax)}</span>
              </div>
              {order.summary.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">{t('Réduction')}</span>
                  <span>-{formatCurrency(order.summary.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t('Total général')}</span>
                <span>{formatCurrency(order.summary.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>{t('Informations du client')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                {order.customer.phone && (
                  <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>{t('Adresse de livraison')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <CardTitle>{t('Articles de la commande')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 bg-white">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border shrink-0 bg-gray-50 flex items-center justify-center">
                      <img
                        src={getImageUrl(item.image)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{t('Réf (SKU) : {{sku}}', { sku: item.sku || 'N/A' })}</p>
                      <p className="text-xs text-muted-foreground">{t('Quantité : {{quantity}}', { quantity: item.quantity })}</p>
                      <ItemVariants variants={(item as any).variants || (item as any).product_variants} className="mt-1 text-xs" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm text-gray-900">{formatCurrency(item.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('Total : {{total}}', { total: formatCurrency(item.price * item.quantity) })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <CardTitle>{t('Informations d\'expédition')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('Mode d\'expédition')}</span>
              <span className="font-semibold text-gray-800">{getShippingMethodName(order.shippingMethod)}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t('Numéro de suivi')}</span>
                <span className="font-mono">{order.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t('Statut d\'expédition')}</span>
              <Badge variant={['delivered', 'shipped'].includes(order.status.toLowerCase()) ? 'default' : 'secondary'}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('Historique des étapes de la commande')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(order as any).timeline?.map((timeline: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${timeline.completed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{getStatusLabel(timeline.status)}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeline.date || t('En attente')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">{t('Aucun historique disponible')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}