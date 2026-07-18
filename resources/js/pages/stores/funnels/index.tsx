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
    if (status === 'published') return <Badge className="bg-emerald-100 text-emerald-700 border-0">{t('Published')}</Badge>;
    if (status === 'archived') return <Badge className="bg-slate-100 text-slate-500 border-0">{t('Archived')}</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-0">{t('Draft')}</Badge>;
  };

  const deleteFunnel = (id: number, name: string) => {
    if (confirm(t('Delete funnel "{{name}}"? This cannot be undone.', { name }))) {
      router.delete(route('stores.funnels.destroy', [store.id, id]));
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <PageTemplate
      title={t('Product Funnels')}
      subtitle={t('Create high-converting landing pages for your products')}
      breadcrumbs={[
        { label: t('Stores'), href: route('stores.index') },
        { label: store.name },
        { label: t('Funnels') },
      ]}
      actions={
        can_create ? (
          <Link href={route('stores.funnels.create', store.id)}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('New Funnel')}
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {t('Plan limit reached ({{max}} funnels)', { max: max_funnels })}
          </div>
        )
      }
    >
      {funnels.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('No funnels yet')}</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            {t('Create your first product landing page to boost conversions. Works like Shopify and YouCan!')}
          </p>
          {can_create && (
            <Link href={route('stores.funnels.create', store.id)}>
              <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Plus className="h-5 w-5" />
                {t('Create Your First Funnel')}
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
              <div className="flex items-start gap-4">
                {/* Product image */}
                {funnel.product?.cover_image ? (
                  <img
                    src={funnel.product.cover_image}
                    alt={funnel.product.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-7 w-7 text-violet-400" />
                  </div>
                )}

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-800 truncate">{funnel.name}</h3>
                    {statusBadge(funnel.status)}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {funnel.product?.name || t('No product')} &nbsp;·&nbsp;
                    <span className="font-mono text-xs">/{funnel.slug}</span>
                  </p>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="font-semibold text-slate-700">{funnel.views_count.toLocaleString()}</span>
                      <span>{t('views')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MousePointer className="h-3.5 w-3.5" />
                      <span className="font-semibold text-slate-700">{funnel.clicks_count.toLocaleString()}</span>
                      <span>{t('clicks')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span className="font-semibold text-slate-700">{funnel.orders_count.toLocaleString()}</span>
                      <span>{t('orders')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-bold text-emerald-600">{funnel.conversion_rate}%</span>
                      <span className="text-slate-400">{t('conv.')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {funnel.status === 'published' && (
                    <>
                      <a href={funnel.public_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-violet-600" title={t('View public page')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => copyUrl(funnel.public_url)} title={t('Copy URL')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Link href={route('stores.funnels.edit', [store.id, funnel.id])}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" title={t('Edit')}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => deleteFunnel(funnel.id, funnel.name)}
                    title={t('Delete')}
                  >
                    <Trash2 className="h-4 w-4" />
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
