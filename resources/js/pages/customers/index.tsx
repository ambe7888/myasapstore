import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, Users, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function Customers() {
  const { t } = useTranslation();
  const { customers, stats } = usePage().props as any;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { hasPermission } = usePermissions();

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    router.delete(route('customers.destroy', selectedCustomer.id), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const pageActions = [];
  
  if (hasPermission('export-customers')) {
    pageActions.push({
      label: t('Export'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => window.open(route('customers.export'), '_blank')
    });
  }
  
  if (hasPermission('create-customers')) {
    pageActions.push({
      label: t('Add Customer'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('customers.create'))
    });
  }

  return (
    <>
      <PageTemplate 
        title={t('Customer Management')}
        url="/customers"
        actions={pageActions}
        breadcrumbs={[
          { title: t('Dashboard'), href: route('dashboard') },
          { title: t('Customer Management') }
        ]}
      >
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Total Customers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">{stats.newThisMonth > 0 ? t('+{{count}} from last month', { count: stats.newThisMonth }) : t('No new customers')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Active Customers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  {t('{{percent}}% active rate', { percent: stats.totalCustomers > 0 ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100) : 0 })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('New This Month')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCustomers > 0 ? t('{{percent}}% growth', { percent: Math.round((stats.newThisMonth / stats.totalCustomers) * 100) }) : t('No growth')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Avg. Order Value')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
                <p className="text-xs text-muted-foreground">{t('Per order')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Customers List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Répertoire des clients')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(!customers || (Array.isArray(customers) ? customers.length === 0 : customers.data?.length === 0)) ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                    <h3 className="text-base font-medium">{t('Aucun client trouvé')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('Commencez par ajouter votre premier client.')}
                    </p>
                    <Permission permission="create-customers">
                      <Button 
                        onClick={() => router.visit(route('customers.create'))} 
                        className="mt-4 text-xs"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        {t('Ajouter un client')}
                      </Button>
                    </Permission>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(Array.isArray(customers) ? customers : (customers.data || [])).map((customer: any) => (
                      <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4 bg-white hover:border-gray-300 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 shrink-0 border border-gray-100">
                            <AvatarImage src={customer.avatar ? getImageUrl(customer.avatar) : ''} alt={customer.full_name} />
                            <AvatarFallback>{customer.initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.full_name}</h3>
                              <Badge variant={customer.is_active ? 'default' : 'secondary'} className="text-[11px]">
                                {customer.is_active ? t('Actif') : t('Inactif')}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                              {customer.phone && (
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                              <span>{t('Commandes :')} <strong className="text-gray-800">{customer.total_orders || 0}</strong></span>
                              <span>•</span>
                              <span>{t('Dépensé :')} <strong className="text-gray-800">{formatCurrency(customer.total_spent || 0)}</strong></span>
                              <span>•</span>
                              <span>{t('Inscrit le :')} {new Date(customer.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <Permission permission="view-customers">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('customers.show', customer.id))} title={t('Voir')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="edit-customers">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('customers.edit', customer.id))} title={t('Modifier')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Permission>
                          <Permission permission="delete-customers">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(customer)} title={t('Supprimer')}>
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
            <DialogTitle>{t('Delete Customer')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('Are you sure you want to delete the customer "{{name}}"?', { name: selectedCustomer?.full_name })}</p>
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