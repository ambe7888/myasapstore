import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, ShoppingCart, Eye, Edit, Trash2, Package, CheckCircle2, Clock, Truck, XCircle, Tag, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';
import { Pagination } from '@/components/pagination';

interface OrdersProps {
  orders: any;
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
}

export default function Orders({ orders, stats }: OrdersProps) {
  const { t } = useTranslation();
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  
  const handleDelete = () => {
    if (orderToDelete) {
      router.delete(route('orders.destroy', orderToDelete));
      setOrderToDelete(null);
    }
  };

  const handleQuickStatusChange = (orderId: number, isCompleted: boolean) => {
    setUpdatingOrderId(orderId);
    const newStatus = isCompleted ? 'completed' : 'pending';
    router.patch(
      route('orders.update-status', orderId),
      { status: newStatus },
      {
        preserveScroll: true,
        onFinish: () => setUpdatingOrderId(null)
      }
    );
  };

  const handleStatusSelect = (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);
    router.patch(
      route('orders.update-status', orderId),
      { status },
      {
        preserveScroll: true,
        onFinish: () => setUpdatingOrderId(null)
      }
    );
  };

  const pageActions = [];
  
  if (hasPermission('export-orders')) {
    pageActions.push({
      label: t('Exporter'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => window.open(route('orders.export'), '_blank')
    });
  }

  const formatStatus = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return { label: t('En attente'), variant: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (s === 'processing') return { label: t('En cours'), variant: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (s === 'shipped') return { label: t('Expédié'), variant: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (s === 'completed' || s === 'delivered') return { label: t('Terminée'), variant: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (s === 'cancelled') return { label: t('Annulée'), variant: 'red', bg: 'bg-red-50 text-red-700 border-red-200' };
    return { label: status, variant: 'slate', bg: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  const renderVariants = (variants: any) => {
    if (!variants) return null;
    
    let variantItems: Array<{ label?: string; val: string }> = [];

    if (Array.isArray(variants)) {
      variantItems = variants.map(v => typeof v === 'object' ? { val: JSON.stringify(v) } : { val: String(v) });
    } else if (typeof variants === 'object') {
      variantItems = Object.entries(variants).map(([k, v]) => ({
        label: isNaN(Number(k)) ? k : undefined,
        val: typeof v === 'object' ? JSON.stringify(v) : String(v)
      }));
    } else if (typeof variants === 'string' && variants.trim() !== '' && variants !== '[]' && variants !== '{}') {
      try {
        const parsed = JSON.parse(variants);
        return renderVariants(parsed);
      } catch (e) {
        variantItems = [{ val: variants }];
      }
    }

    if (variantItems.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {variantItems.map((item, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
            {item.label && <span className="font-semibold text-amber-900/70 mr-1">{item.label}:</span>}
            {item.val}
          </span>
        ))}
      </div>
    );
  };

  const orderList = Array.isArray(orders) ? orders : (orders?.data || []);

  return (
    <PageTemplate 
      title={t('Gestion des commandes')}
      description={t('Suivez, gérez et traitez toutes les commandes effectuées sur vos boutiques')}
      url="/orders"
      actions={pageActions}
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: t('Commandes') }
      ]}
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total commandes')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">{t('Toutes les commandes de la boutique')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Commandes en attente')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">{t('Nécessitent une attention')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Revenu total')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('Revenu total encaissé')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Valeur moyenne')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.avgOrderValue || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('Montant moyen par commande')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Liste des commandes')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {orderList.length > 0 ? orderList.map((order: any) => {
                const statusInfo = formatStatus(order.status);
                const isCompleted = order.status === 'completed' || order.status === 'delivered';
                const isUpdating = updatingOrderId === order.id;

                return (
                  <div key={order.id} className="flex flex-col p-4 border border-gray-200 rounded-xl gap-3 bg-white hover:border-gray-300 transition-colors shadow-sm">
                    {/* Header line: Order info + Quick Switch & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{order.orderNumber}</h3>
                            <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-normal ${statusInfo.bg}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <strong className="text-gray-800">{order.customer}</strong> {order.phone ? `(${order.phone})` : ''} {order.email ? `• ${order.email}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Status Selector + Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                        {/* Quick Status Select Dropdown */}
                        <Permission permission="edit-orders">
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusSelect(order.id, e.target.value)}
                            className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <option value="pending">{t('En attente')}</option>
                            <option value="processing">{t('En cours')}</option>
                            <option value="shipped">{t('Expédiée')}</option>
                            <option value="completed">{t('Terminée')}</option>
                            <option value="cancelled">{t('Annulée')}</option>
                          </select>
                        </Permission>

                        {/* Standard action icons */}
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                          <Permission permission="view-orders">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('orders.show', order.id))} title={t('Voir')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="edit-orders">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('orders.edit', order.id))} title={t('Modifier')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="delete-orders">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setOrderToDelete(order.id)} title={t('Supprimer')}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Permission>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Display Products & Variants */}
                    {order.itemsDetails && order.itemsDetails.length > 0 && (
                      <div className="bg-gray-50/70 rounded-lg p-2.5 border border-gray-100 space-y-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          <span>{t('Produits & Variantes')} ({order.itemsDetails.length})</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {order.itemsDetails.map((item: any) => (
                            <div key={item.id} className="bg-white p-2 rounded-md border border-gray-200/80 text-xs space-y-1">
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-gray-900 line-clamp-1">{item.name}</span>
                                <span className="font-bold text-gray-700 shrink-0">{formatCurrency(item.price)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span>{t('Qté')}: <strong className="text-gray-800">{item.quantity}</strong></span>
                                {item.sku && <span className="font-mono text-[10px] text-gray-400">SKU: {item.sku}</span>}
                              </div>
                              {/* Variants display */}
                              {renderVariants(item.variants)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer summary line */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-bold text-gray-900 text-sm">{formatCurrency(order.total)}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                        {order.paymentMethod && (
                          <>
                            <span>•</span>
                            <span className="text-gray-600">{order.paymentMethod}</span>
                          </>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {order.payment_status === 'paid' ? t('Payé') : t('En attente de paiement')}
                      </Badge>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">{t('Aucune commande trouvée')}</p>
                </div>
              )}
            </div>

            {/* Pagination Component */}
            {orders?.links && (
              <Pagination
                links={orders.links}
                from={orders.from}
                to={orders.to}
                total={orders.total}
                entityName="commandes"
                className="mt-4 border-t border-gray-100 rounded-none border-x-0 border-b-0"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{t('Delete Order')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('Are you sure you want to delete this order? This action cannot be undone.')}
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOrderToDelete(null)}>
                {t('Cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t('Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}