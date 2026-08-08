import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, Building2, Globe, Users, BarChart, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { generateStoreUrl } from '@/utils/store-url-helper';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

interface PageAction {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
}

export default function StoreManagement({ stores = [], aggregatedStats = {} }) {
  const { t } = useTranslation();
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  
  const handleDelete = () => {
    if (storeToDelete) {
      router.delete(route('stores.destroy', storeToDelete));
      setStoreToDelete(null);
    }
  };

  const pageActions: PageAction[] = [];
  
  if (hasPermission('export-stores')) {
    pageActions.push({
      label: t('Export'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => window.open(route('stores.export'), '_blank')
    });
  }
  
  if (hasPermission('create-stores')) {
    pageActions.push({
      label: t('Create Store'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default',
      onClick: () => router.visit(route('stores.create'))
    });
  }

  return (
    <PageTemplate 
      title={t('Store Management')}
      url="/stores"
      actions={pageActions}
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Store Management' }
      ]}
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Stores')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stores.length}</div>
              <p className="text-xs text-muted-foreground">{t('Your store count')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Active Stores')}</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stores.filter(store => store.config_status).length}</div>
              <p className="text-xs text-muted-foreground">
                {stores.length > 0 ? 
                  t('{{percent}}% active rate', { percent: Math.round((stores.filter(store => store.config_status).length / stores.length) * 100) }) : 
                  t('No stores yet')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Customers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregatedStats.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">{t('Across all stores')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Revenue')}</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(parseFloat(aggregatedStats.totalRevenue) || 0)}</div>
              <p className="text-xs text-muted-foreground">{t('Total revenue')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stores List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Your Stores')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('No stores yet')}</h3>
                <p className="text-muted-foreground mb-4">{t('Create your first store to get started')}</p>
                <Permission permission="create-stores">
                  <Button onClick={() => router.visit(route('stores.create'))}>
                    <Plus className="h-4 w-4 mr-2" /> {t('Create Store')}
                  </Button>
                </Permission>
              </div>
            ) : (
              <div className="space-y-4">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm space-y-4">
                  {/* Top Store Info Section */}
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-gray-900 truncate">{store.name}</h3>
                      </div>
                      
                      <div className="mt-1">
                        <Badge variant={store.config_status ? 'default' : 'secondary'} className={`text-xs px-2.5 py-0.5 rounded-md font-normal border-0 ${store.config_status ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {store.config_status ? t('Actif') : t('Inactif')}
                        </Badge>
                        {store.is_default && (
                          <Badge variant="outline" className="ml-1.5 text-xs px-2 py-0.5 border-emerald-500 text-emerald-600">
                            {t('Par défaut')}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-1.5">
                        {store.enable_custom_domain && store.custom_domain ? (
                          <span className="text-emerald-600 font-medium">{store.custom_domain}</span>
                        ) : store.enable_custom_subdomain && store.custom_subdomain ? (
                          <span className="text-blue-600 font-medium">{store.custom_subdomain}</span>
                        ) : (
                          t('Aucun domaine défini')
                        )}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-1 mt-1.5 text-xs text-gray-400">
                        <span>{t('Thème :')} {store.theme}</span>
                        <span>·</span>
                        <span>{t('Créé le :')} {new Date(store.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{store.total_orders || 0} {t('commandes')}</span>
                        <span>·</span>
                        <span>{formatCurrency(parseFloat(store.total_revenue) || 0)} {t('revenu')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {/* Primary Button */}
                    <Button 
                      variant="outline" 
                      className="w-full h-10 border-gray-200 rounded-xl bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 shadow-2xs"
                      onClick={() => {
                        const url = store.visit_store_url || generateStoreUrl('store.home', store);
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <Globe className="h-4 w-4 text-gray-700" />
                      <span>{t('Voir la boutique')}</span>
                    </Button>
                    
                    {/* Icon Actions Bar */}
                    <div className="flex items-center justify-around text-gray-500 pt-1">
                      <Permission permission="view-stores">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg text-gray-700" onClick={() => router.visit(route('stores.show', store.id))} title={t('Voir')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Permission>
                      
                      <Permission permission="edit-stores">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg text-gray-700" onClick={() => router.visit(route('stores.edit', store.id))} title={t('Modifier')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Permission>
                      
                      <Permission permission="manage-store-settings">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg text-gray-700" onClick={() => router.visit(route('stores.settings', store.id))} title={t('Paramètres')}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Permission>
                      
                      <Permission permission="delete-stores">
                        {!store.is_default && (
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg" onClick={() => setStoreToDelete(store.id)} title={t('Supprimer')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </Permission>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Store')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this store? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreToDelete(null)}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}