import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Plus, RefreshCw, Download, Folder, Eye, Edit, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { router, usePage, useForm } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function Categories() {
  const { t } = useTranslation();
  const { categories, stats } = usePage().props as any;
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const { data, setData, post, processing, errors, reset } = useForm({
    file: null as File | null,
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('categories.import'), {
      onSuccess: () => {
        setIsImportModalOpen(false);
        reset();
      },
    });
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      router.delete(route('categories.destroy', categoryToDelete));
      setCategoryToDelete(null);
    }
  };

  const pageActions = [];
  
  if (hasPermission('export-categories')) {
    pageActions.push({
      label: t('Export'),
      icon: <Download className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => window.open(route('categories.export'), '_blank')
    });
  }
  
  if (hasPermission('create-categories')) {
    pageActions.push({
      label: t('Import'),
      icon: <Upload className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => setIsImportModalOpen(true)
    });
    
    pageActions.push({
      label: t('Create Category'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('categories.create'))
    });
  }

  return (
    <PageTemplate 
      title={t('Categories')}
      url="/categories"
      actions={pageActions}
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Categories' }
      ]}
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Categories')}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{t('All categories')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Active Categories')}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">{t('Parent Categories')}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.parent}</div>
              <p className="text-xs text-muted-foreground">{t('Main categories')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('Sub Categories')}</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sub}</div>
              <p className="text-xs text-muted-foreground">{t('Child categories')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Product Categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">{t('No categories found')}</p>
                  <Permission permission="create-categories">
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => router.visit(route('categories.create'))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('Create your first category')}
                    </Button>
                  </Permission>
                </div>
              ) : (
                categories.map((category: any) => (
                  <div 
                    key={category.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                      category.depth > 0 ? 'bg-slate-50/50 border-l-4 border-l-primary/40' : ''
                    }`}
                    style={{ marginLeft: `${(category.depth || 0) * 1.5}rem` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border">
                        {category.image ? (
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <Folder className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? t('Active') : t('Inactive')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {t('{{count}} products', { count: category.products_count || 0 })}
                          </span>
                          {category.parent && (
                            <span className="text-xs text-muted-foreground">
                              {t('Parent: {{name}}', { name: category.parent.name })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Permission permission="view-categories">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.visit(route('categories.show', category.id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Permission>
                      <Permission permission="edit-categories">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.visit(route('categories.edit', category.id))}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Permission>
                      <Permission permission="delete-categories">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setCategoryToDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Permission>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Category')}</DialogTitle>
            <DialogDescription>
              {t('Are you sure you want to delete this category? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
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
              <DialogTitle>{t('Import Categories')}</DialogTitle>
              <DialogDescription>
                {t('Upload a CSV file to import categories. Ensure the file has the correct headers.')}
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
                <p className="mb-1 text-muted-foreground">Category Name, Slug, Parent Category, Description, Sort Order, Status</p>
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
    </PageTemplate>
  );
}