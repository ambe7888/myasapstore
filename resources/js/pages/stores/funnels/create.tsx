import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';

interface Product {
  id: number;
  name: string;
  cover_image: string;
  price: string;
  sale_price: string | null;
}

interface Props {
  store: { id: number; name: string };
  products: Product[];
}

export default function FunnelCreate({ store, products }: Props) {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    product_id: '',
    slug: '',
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setData(prev => ({
      ...prev,
      product_id: String(product.id),
      name: prev.name || `Funnel - ${product.name}`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('stores.funnels.store', store.id));
  };

  return (
    <PageTemplate
      title={t('Create a Funnel')}
      subtitle={t('Choose a product and set up your landing page')}
      breadcrumbs={[
        { label: t('Stores'), href: route('stores.index') },
        { label: store.name },
        { label: t('Funnels'), href: route('stores.funnels.index', store.id) },
        { label: t('New') },
      ]}
      actions={
        <Link href={route('stores.funnels.index', store.id)}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('Back')}
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* Step 1: Choose product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. {t('Choose a Product')}</CardTitle>
            <CardDescription>{t('Select the product this funnel will promote')}</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('No active products found. Activate a product first.')}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className={`
                      text-left p-3 rounded-xl border-2 transition-all hover:border-violet-300 hover:shadow-sm
                      ${selectedProduct?.id === product.id
                        ? 'border-violet-500 bg-violet-50 shadow-sm'
                        : 'border-slate-100 bg-white'}
                    `}
                  >
                    {product.cover_image ? (
                      <img
                        src={getImageUrl(product.cover_image)}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 rounded-lg mb-2" />
                    )}
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-violet-600 font-bold">{product.sale_price || product.price}</p>
                  </button>
                ))}
              </div>
            )}
            {errors.product_id && (
              <p className="text-destructive text-sm mt-2">{errors.product_id}</p>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Name + Slug */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. {t('Funnel Details')}</CardTitle>
            <CardDescription>{t('Give your funnel a name and a URL slug')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('Funnel Name')} <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder={t('e.g. Summer Campaign - Perfume')}
                value={data.name}
                onChange={e => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('URL Slug')}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/{store.name.toLowerCase()}/funnel/</span>
                <Input
                  id="slug"
                  placeholder={t('leave-empty-for-auto')}
                  value={data.slug}
                  onChange={e => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">{t('Only lowercase letters, numbers and hyphens. Leave empty to auto-generate.')}</p>
              {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={processing || !data.product_id}
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Rocket className="h-5 w-5" />
            {processing ? t('Creating...') : t('Create & Open Builder')}
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
}
