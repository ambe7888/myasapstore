import React from 'react';
import { Link, router } from '@inertiajs/react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import {
  Plus, Eye, Edit2, Trash2, Globe, TrendingUp, MousePointer,
  ShoppingBag, BarChart2, ExternalLink, Copy, AlertCircle
} from 'lucide-react';

interface Funnel {
  id: number;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  product: { id: number; name: string; cover_image: string; price: string } | null;
  views_count: number;
  clicks_count: number;
  orders_count: number;
  conversion_rate: number;
  public_url: string;
  created_at: string;
}

interface Props {
  store: { id: number; name: string; slug: string };
  funnels: Funnel[];
  can_create: boolean;
  max_funnels: number;
}

export default function FunnelIndex({ store, funnels, can_create, max_funnels }: Props) {
  const { t } = useTranslation();

  const statusBadge = (status: string) => {
    if (status === 'published') return <Badge className="bg-emerald-100 text-emerald-700 border-0">{t('Publié')}</Badge>;
    if (status === 'archived') return <Badge className="bg-slate-100 text-slate-500 border-0">{t('Archivé')}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-0">{t('Brouillon')}</Badge>;
  };

  const deleteFunnel = (id: number, name: string) => {
    if (confirm(t('Supprimer le tunnel "{{name}}" ? Cette action est irréversible.', { name }))) {
      router.delete(route('stores.funnels.destroy', [store.id, id]));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const pageActions = [
    ...(can_create ? [{
      label: t('Nouveau tunnel'),
      icon: <Plus className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: () => router.visit(route('stores.funnels.create', store.id))
    }] : [])
  ];

  return (
    <PageTemplate
      title={t('Tunnels de vente')}
      description={t('Créez des pages d\'atterrissage (landing pages) à haute conversion pour vos produits')}
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: store.name, href: route('stores.index') },
        { title: t('Tunnels de vente') },
      ]}
      actions={pageActions}
    >
      {funnels.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('Aucun tunnel de vente')}</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            {t('Créez votre première page d\'atterrissage pour optimiser les conversions de vos produits.')}
          </p>
          {can_create && (
            <Link href={route('stores.funnels.create', store.id)}>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Plus className="h-5 w-5" />
                {t('Créer votre premier tunnel')}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {funnels.map((funnel) => (
            <div
              key={funnel.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  {/* Product image */}
                  {funnel.product?.cover_image ? (
                    <img
                      src={funnel.product.cover_image}
                      alt={funnel.product.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-violet-500" />
                    </div>
                  )}

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{funnel.name}</h3>
                      {statusBadge(funnel.status)}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {funnel.product?.name || t('Aucun produit associé')} &nbsp;·&nbsp;
                      <span className="font-mono text-xs text-slate-400">/{funnel.slug}</span>
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{funnel.views_count.toLocaleString()}</span>
                        <span>{t('vues')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MousePointer className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{funnel.clicks_count.toLocaleString()}</span>
                        <span>{t('clics')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{funnel.orders_count.toLocaleString()}</span>
                        <span>{t('commandes')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-bold text-emerald-600">{funnel.conversion_rate}%</span>
                        <span className="text-slate-400">{t('conv.')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 justify-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {funnel.status === 'published' && (
                    <>
                      <a href={funnel.public_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1 border-slate-200" title={t('Voir la page publique')}>
                          <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                          <span className="hidden sm:inline">{t('Voir')}</span>
                        </Button>
                      </a>
                      <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1 border-slate-200" onClick={() => copyUrl(funnel.public_url)} title={t('Copier le lien')}>
                        <Copy className="h-3.5 w-3.5 text-blue-600" />
                        <span className="hidden sm:inline">{t('Copier')}</span>
                      </Button>
                    </>
                  )}
                  <Link href={route('stores.funnels.edit', [store.id, funnel.id])}>
                    <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1 border-slate-200" title={t('Modifier')}>
                      <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      <span>{t('Modifier')}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="destructive" size="sm"
                    className="h-8 text-xs flex items-center gap-1"
                    onClick={() => deleteFunnel(funnel.id, funnel.name)}
                    title={t('Supprimer')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTemplate>
  );
}
