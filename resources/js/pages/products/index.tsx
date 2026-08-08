import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, Package, Eye, Edit, Trash2, Star, Upload, Power, PowerOff, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { router, usePage, useForm } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/utils/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';

export default function Products() {
  const { t } = useTranslation();
  const { products, stats, categories, filters } = usePage().props as any;
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const { hasPermission } = usePermissions();

  const handleCategoryFilterChange = (value: string) => {
    const categoryId = value === 'all' ? '' : value;
    router.get(route('products.index'), { category_id: categoryId }, { preserveState: true, replace: true });
  };

  const { data, setData, post, processing, errors, reset } = useForm({
    file: null as File | null,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('products.import'), {
      onSuccess: () => {
        setIsImportModalOpen(false);
        reset();
      },
    });
  };
  
  const handleDelete = () => {
    if (productToDelete) {
      router.delete(route('products.destroy', productToDelete));
      setProductToDelete(null);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return;
    
    if (action === 'delete') {
      setIsBulkDeleteModalOpen(true);
      return;
    }
    
    if (action === 'export') {
      window.open(route('products.export') + '?ids=' + selectedProducts.join(','), '_blank');
      return;
    }

    router.post(route('products.bulk'), {
      action,
      ids: selectedProducts
    }, {
      onSuccess: () => setSelectedProducts([])
    });
  };

  const executeBulkDelete = () => {
    router.post(route('products.bulk'), {
      action: 'delete',
      ids: selectedProducts
    }, {
      onSuccess: () => {
        setIsBulkDeleteModalOpen(false);
        setSelectedProducts([]);
      }
    });
  };

  const visibleProducts = Array.isArray(products) ? products : (products?.data || []);

  const toggleSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedProducts.length === visibleProducts.length && visibleProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(visibleProducts.map((p: any) => p.id));
    }
  };

  const pageActions = [];
  
  if (hasPermission('export-products')) {
    pageActions.push({
      label: t('Exporter tout'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => window.open(route('products.export'), '_blank')
    });
  }
  
  if (hasPermission('create-products')) {
    pageActions.push({
      label: t('Importer'),
      icon: <Upload className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => setIsImportModalOpen(true)
    });
    
    pageActions.push({
      label: t('Créer un produit'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('products.create'))
    });
  }

  return (
    <PageTemplate 
      title={t('Products')}
      url="/products"
      actions={pageActions}
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Products' }
      ]}
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Products')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{t('All products')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Active Products')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {t('{{percent}}% active rate', { percent: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0 })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Low Stock')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">{t('Need restocking')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Value')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">{t('Inventory value')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Action Toolbar - Positioned right after stats cards, above product catalog card */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-center sm:text-left shadow-xs">
            <span className="text-sm font-semibold text-emerald-950 w-full sm:w-auto">
              {t('{{count}} produit(s) sélectionné(s)', { count: selectedProducts.length })}
            </span>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              {hasPermission('edit-products') && (
                <>
                  <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5 bg-white border-emerald-300 hover:bg-emerald-100" onClick={() => handleBulkAction('activate')}>
                    <Power className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t('Activer')}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5 bg-white border-amber-300 hover:bg-amber-100" onClick={() => handleBulkAction('deactivate')}>
                    <PowerOff className="h-3.5 w-3.5 text-amber-600" />
                    <span>{t('Désactiver')}</span>
                  </Button>
                </>
              )}
              
              {hasPermission('export-products') && (
                <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1.5 bg-white border-gray-300" onClick={() => handleBulkAction('export')}>
                  <Download className="h-3.5 w-3.5" />
                  <span>{t('Exporter')}</span>
                </Button>
              )}
              
              {hasPermission('delete-products') && (
                <Button variant="destructive" size="sm" className="h-8 text-xs flex items-center gap-1.5" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t('Supprimer')}</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Products List */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                checked={products?.data?.length > 0 && selectedProducts.length === products.data.length}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
              <CardTitle className="text-base font-bold text-gray-900">{t('Catalogue de produits')}</CardTitle>
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <Select 
                value={filters?.category_id ? String(filters.category_id) : 'all'} 
                onValueChange={handleCategoryFilterChange}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder={t('Toutes les catégories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('Toutes les catégories')}</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(!products || (Array.isArray(products) ? products.length === 0 : products.data?.length === 0)) ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground text-sm">{t('Aucun produit trouvé')}</p>
                  <Permission permission="create-products">
                    <Button 
                      variant="outline" 
                      className="mt-4 text-xs" 
                      onClick={() => router.visit(route('products.create'))}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      {t('Créer votre premier produit')}
                    </Button>
                  </Permission>
                </div>
              ) : (
                (Array.isArray(products) ? products : (products.data || [])).map((product: any) => (
                  <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4 bg-white hover:border-gray-300 transition-colors">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Checkbox 
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleSelection(product.id)}
                        aria-label={`Select ${product.name}`}
                        className="shrink-0"
                      />
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                        {product.cover_image ? (
                          <img
                            src={getImageUrl(product.cover_image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                          <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-[11px]">
                            {product.is_active ? t('Actif') : t('Inactif')}
                          </Badge>
                          {product.stock <= 0 && (
                            <Badge variant="destructive" className="text-[11px]">{t('Rupture de stock')}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('SKU :')} <span className="font-mono">{product.sku || '-'}</span></p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                          <span>•</span>
                          <span>{t('Stock :')} <strong className="text-gray-700">{product.stock}</strong></span>
                          {product.category?.name && (
                            <>
                              <span>•</span>
                              <span className="text-gray-600">{product.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <Permission permission="view-products">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('products.show', product.id))} title={t('Voir')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Permission>
                      
                      <Permission permission="edit-products">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900" onClick={() => router.visit(route('products.edit', product.id))} title={t('Modifier')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Permission>

                      <Permission permission="create-products">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => router.post(route('products.duplicate', product.id))} title={t('Dupliquer')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </Permission>
                      
                      <Permission permission="delete-products">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setProductToDelete(product.id)} title={t('Supprimer')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Permission>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Component */}
            {products?.links && (
              <Pagination
                links={products.links}
                from={products.from}
                to={products.to}
                total={products.total}
                entityName="produits"
                className="mt-4 border-t border-gray-100 rounded-none border-x-0 border-b-0"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Product')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this product? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        setIsImportModalOpen(open);
        if (!open) reset();
      }}>
        <DialogContent>
          <form onSubmit={handleImport}>
            <DialogHeader>
              <DialogTitle>{t('Import Products')}</DialogTitle>
              <DialogDescription>
                {t('Upload a CSV file to import products. Ensure the file has the correct headers.')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input 
                type="file" 
                accept=".csv,.txt"
                onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
              {errors.file && <div className="text-sm text-red-500 mt-2">{errors.file}</div>}
              
              <div className="mt-4 p-4 bg-muted rounded-md text-xs">
                <p className="font-semibold mb-2">{t('Expected CSV Format:')}</p>
                <p className="mb-1 text-muted-foreground">Product Name, SKU, Category, Price, Sale Price, Stock, Variants, Status</p>
                <p className="text-muted-foreground">{t('Note: First row is assumed to be headers and will be skipped.')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsImportModalOpen(false); reset(); }}>
                {t('Cancel')}
              </Button>
              <Button type="submit" disabled={!data.file || processing}>
                {t('Import')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Selected Products')}</DialogTitle>
            <DialogDescription>
              {t('Are you absolutely sure you want to delete the {{count}} selected products? This action cannot be undone and will remove all product images and data.', { count: selectedProducts.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={executeBulkDelete}>
              {t('Delete Selected')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}