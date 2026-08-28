import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, Truck, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function Shipping() {
  const { t } = useTranslation();
  const { shippings, stats } = usePage().props as any;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  const { hasPermission } = usePermissions();

  const handleDelete = (shipping) => {
    setSelectedShipping(shipping);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    router.delete(route('shipping.destroy', selectedShipping.id), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const pageActions = [];
  
  if (hasPermission('export-shipping')) {
    pageActions.push({
      label: t('Exporter'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => window.open(route('shipping.export'), '_blank')
    });
  }
  
  if (hasPermission('create-shipping')) {
    pageActions.push({
      label: t('+ Ajouter un mode de livraison'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('shipping.create'))
    });
  }

  const formatType = (type: string) => {
    const tStr = String(type || '').toLowerCase();
    if (tStr.includes('flat')) return t('Tarif fixe');
    if (tStr.includes('free')) return t('Livraison gratuite');
    return tStr.replace('_', ' ').charAt(0).toUpperCase() + tStr.replace('_', ' ').slice(1);
  };

  const formatZone = (zone: string) => {
    const zStr = String(zone || '').toLowerCase();
    if (zStr === 'domestic') return t('Nationale');
    if (zStr === 'international') return t('Internationale');
    return zone || t('Toutes zones');
  };

  return (
    <>
      <PageTemplate 
        title={t('Zone de livraison')}
        url="/shipping"
        actions={pageActions}
        breadcrumbs={[
          { title: t('Tableau de bord'), href: route('dashboard') },
          { title: t('Zone de livraison') }
        ]}
      >
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Modes de livraison')}</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalShippings}</div>
                <p className="text-xs text-muted-foreground">{t('Toutes les méthodes de livraison')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Méthodes actives')}</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeShippings}</div>
                <p className="text-xs text-muted-foreground">
                  {t('{{percent}}% actives', { percent: stats.totalShippings > 0 ? Math.round((stats.activeShippings / stats.totalShippings) * 100) : 0 })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Zones de livraison')}</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.shippingZones}</div>
                <p className="text-xs text-muted-foreground">{t('Zones de couverture')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Coût moyen de livraison')}</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.avgShippingCost)}</div>
                <p className="text-xs text-muted-foreground">{t('Par commande')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Methods List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Modes de livraison')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippings.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">{t('Aucun mode de livraison trouvé')}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('Commencez par créer votre premier mode de livraison.')}
                    </p>
                    <Permission permission="create-shipping">
                      <Button 
                        onClick={() => router.visit(route('shipping.create'))} 
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('Créer un mode de livraison')}
                      </Button>
                    </Permission>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shippings.map((shipping) => (
                      <div key={shipping.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{shipping.name}</h3>
                              <Badge variant={shipping.is_active ? 'default' : 'secondary'}>
                                {shipping.is_active ? t('Actif') : t('Inactif')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{formatType(shipping.type)} • {formatZone(shipping.zone_type)}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {t('Coût')}: {shipping.type === 'free_shipping' ? t('Gratuit') : formatCurrency(shipping.cost)}
                              </span>
                              <span className="text-xs text-muted-foreground">{t('Livraison')}: {shipping.delivery_time || t('Non spécifiée')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Permission permission="view-shipping">
                            <Button variant="ghost" size="sm" onClick={() => router.visit(route('shipping.show', shipping.id))}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="edit-shipping">
                            <Button variant="ghost" size="sm" onClick={() => router.visit(route('shipping.edit', shipping.id))}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="delete-shipping">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(shipping)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Permission>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Shipping Method')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('Are you sure you want to delete the shipping method "{{name}}"?', { name: selectedShipping?.name })}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('This action cannot be undone.')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t('Cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>{t('Delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}