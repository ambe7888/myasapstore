import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, ShoppingCart, Eye, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const { hasPermission } = usePermissions();
  
  const handleDelete = () => {
    if (orderToDelete) {
      router.delete(route('orders.destroy', orderToDelete));
      setOrderToDelete(null);
    }
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
    if (s === 'pending') return { label: t('En attente'), variant: 'amber' };
    if (s === 'processing') return { label: t('En cours'), variant: 'blue' };
    if (s === 'shipped') return { label: t('Expédié'), variant: 'indigo' };
    if (s === 'completed') return { label: t('Terminé'), variant: 'emerald' };
    if (s === 'cancelled') return { label: t('Annulé'), variant: 'red' };
    return { label: status, variant: 'slate' };
  };

  const orderList = Array.isArray(orders) ? orders : (orders?.data || []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pb-24">
        {/* Mobile Header */}
        <div className="bg-white px-4 pt-5 pb-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-900">{t('Commandes')}</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="w-9 h-9 bg-slate-50 text-slate-600 rounded-full" onClick={() => router.reload()}>
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex-shrink-0 bg-emerald-50 px-3 py-2 rounded-xl flex items-center gap-2">
              <ShoppingCart size={16} className="text-emerald-600" />
              <div>
                <p className="text-[10px] text-emerald-600/70 font-semibold">{t('Total')}</p>
                <p className="text-sm font-black text-emerald-700">{stats?.totalOrders || 0}</p>
              </div>
            </div>
            <div className="flex-shrink-0 bg-amber-50 px-3 py-2 rounded-xl flex items-center gap-2">
              <Package size={16} className="text-amber-600" />
              <div>
                <p className="text-[10px] text-amber-600/70 font-semibold">{t('En attente')}</p>
                <p className="text-sm font-black text-amber-700">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
            <div className="flex-shrink-0 bg-blue-50 px-3 py-2 rounded-xl flex items-center gap-2">
              <Download size={16} className="text-blue-600" />
              <div>
                <p className="text-[10px] text-blue-600/70 font-semibold">{t('Revenu')}</p>
                <p className="text-sm font-black text-blue-700">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Order List */}
        <div className="px-3 pt-4">
          {orderList.length > 0 ? orderList.map((order: any) => {
            const statusInfo = formatStatus(order.status);
            return (
              <button 
                key={order.id} 
                onClick={() => router.visit(route('orders.show', order.id))}
                className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform relative overflow-hidden mb-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-slate-900 text-sm">{order.orderNumber}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      statusInfo.variant === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                      statusInfo.variant === 'amber' ? 'bg-amber-50 text-amber-600' :
                      statusInfo.variant === 'blue' ? 'bg-blue-50 text-blue-600' :
                      statusInfo.variant === 'red' ? 'bg-red-50 text-red-600' :
                      'bg-slate-50 text-slate-600'
                  }`}>
                      {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{order.customer}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#00b87c]">{formatCurrency(order.total)}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{order.items || 0} {t('article(s)')}</p>
                  </div>
                </div>
              </button>
            );
          }) : (
            <div className="text-center py-12">
              <ShoppingCart size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">{t('Aucune commande')}</p>
            </div>
          )}

          {orders?.links && (
            <div className="mt-4 pb-6">
              <Pagination links={orders.links} from={orders.from} to={orders.to} total={orders.total} entityName="commandes" />
            </div>
          )}
        </div>
      </div>
    );
  }

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
                return (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4 bg-white hover:border-gray-300 transition-colors">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{order.orderNumber}</h3>
                          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-normal ${
                            statusInfo.variant === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            statusInfo.variant === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            statusInfo.variant === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            statusInfo.variant === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <strong className="text-gray-800">{order.customer}</strong> {order.phone ? `(${order.phone})` : ''} {order.email ? `• ${order.email}` : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                          <span>•</span>
                          <span>{order.items || 0} {t('article(s)')}</span>
                          <span>•</span>
                          <span>{order.date}</span>
                          {order.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600">{order.paymentMethod}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
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