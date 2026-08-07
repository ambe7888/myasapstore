import React from 'react';
import { PageTemplate } from '@/components/page-template';
import { Settings, Store } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

interface Store {
  id: number;
  name: string;
  description?: string;
  config_status: boolean;
}

interface Props {
  stores: Store[];
}

export default function StoreContentIndex({ stores }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const pageActions = [];

  return (
    <PageTemplate 
      title={t('Store Content Management')}
      url="/stores/content"
      actions={pageActions}
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Store Management', href: route('stores.index') },
        { title: 'Store Content' }
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('Manage Store Content')}</CardTitle>
          <CardDescription>{t('Customize dynamic content for your stores')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('No stores found')}</h3>
              <p className="text-muted-foreground mb-4">{t('Create a store first to manage its content.')}</p>
              <Permission permission="create-stores">
                <Button onClick={() => router.visit(route('stores.create'))}>
                  {t('Create Store')}
                </Button>
              </Permission>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <div key={store.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4 bg-white hover:border-gray-300 transition-colors">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base text-gray-900 truncate">{store.name}</h3>
                        <Badge variant={store.config_status ? 'default' : 'secondary'} className="text-[11px]">
                          {store.config_status ? t('Actif') : t('Inactif')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {store.description || t('Aucune description disponible')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 justify-start sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <Permission permission="edit-store-content">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-9 px-3.5 text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                        onClick={() => router.visit(route('stores.content.show', store.id))}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>{t('Gérer le contenu')}</span>
                      </Button>
                    </Permission>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}