import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { ArrowLeft, Save, Copy, Check, Rss, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import MediaPicker from '@/components/MediaPicker';
import { Button } from '@/components/ui/button';

interface Props {
  store: any;
  settings: any;
}

const PREDEFINED_COLORS = [
  { name: 'slate', label: 'Slate', color: '#64748b' },
  { name: 'gray', label: 'Gray', color: '#6b7280' },
  { name: 'zinc', label: 'Zinc', color: '#71717a' },
  { name: 'neutral', label: 'Neutral', color: '#737373' },
  { name: 'stone', label: 'Stone', color: '#78716c' },
  { name: 'red', label: 'Red', color: '#ef4444' },
  { name: 'orange', label: 'Orange', color: '#f97316' },
  { name: 'amber', label: 'Amber', color: '#f59e0b' },
  { name: 'yellow', label: 'Yellow', color: '#eab308' },
  { name: 'lime', label: 'Lime', color: '#84cc16' },
  { name: 'green', label: 'Green', color: '#22c55e' },
  { name: 'emerald', label: 'Emerald', color: '#10b981' },
  { name: 'teal', label: 'Teal', color: '#14b8a6' },
  { name: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { name: 'sky', label: 'Sky', color: '#0ea5e9' },
  { name: 'blue', label: 'Blue', color: '#3b82f6' },
  { name: 'indigo', label: 'Indigo', color: '#6366f1' },
  { name: 'violet', label: 'Violet', color: '#8b5cf6' },
  { name: 'purple', label: 'Purple', color: '#a855f7' },
  { name: 'fuchsia', label: 'Fuchsia', color: '#d946ef' },
  { name: 'pink', label: 'Pink', color: '#ec4899' },
  { name: 'rose', label: 'Rose', color: '#f43f5e' },
];

export default function StoreSettings({ store, settings }: Props) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(settings || {});
  const [copiedFeed, setCopiedFeed] = useState(false);

  const getFacebookCatalogFeedUrl = () => {
    if (typeof window === 'undefined') return '';
    if (store?.enable_custom_domain && store?.custom_domain) {
      return `https://${store.custom_domain}/facebook-catalog.xml`;
    }
    if (store?.enable_custom_subdomain && store?.custom_subdomain) {
      const host = window.location.host;
      return `https://${store.custom_subdomain}.${host}/facebook-catalog.xml`;
    }
    return `${window.location.origin}/store/${store?.slug}/facebook-catalog.xml`;
  };

  const handleSave = () => {
    router.put(route('stores.settings.update', store.id), {
      settings: formData
    });
  };

  const getDefaultThemeColor = () => {
    switch (store?.theme) {
      case 'furniture-interior':
        return '#894B00';
      case 'cars-automotive':
        return '#dc2626';
      case 'beauty-cosmetics':
        return '#ec4899';
      case 'baby-kids':
        return '#db2777';
      case 'perfume-fragrances':
        return '#7c3aed';
      case 'electronics':
        return '#2563eb';
      case 'fashion':
        return '#0f172a';
      case 'watches':
        return '#1e293b';
      default:
        return '#4f46e5';
    }
  };

  const resetColors = () => {
    setFormData(prev => ({
      ...prev,
      primary_color: '',
      button_color_add_to_cart: '',
      button_color_buy_now: '',
      text_title_color: '',
      text_button_color: '',
      site_bg_color: ''
    }));
  };

  const updateSetting = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const pageActions = [
    {
      label: t('Back'),
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.visit(route('stores.index'))
    },
    {
      label: t('Save Settings'),
      icon: <Save className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: handleSave
    }
  ];

  return (
    <PageTemplate 
      title={t('Store Settings')}
      url="/stores/settings"
      actions={pageActions}
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Store Management', href: route('stores.index') },
        { title: 'Store Settings' }
      ]}
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto justify-start gap-1 p-1 bg-muted rounded-lg scrollbar-none h-auto">
          <TabsTrigger value="general" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Général')}</TabsTrigger>
          <TabsTrigger value="appearance" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Apparence & Couleurs')}</TabsTrigger>
          <TabsTrigger value="tracking" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Suivi & Analytique')}</TabsTrigger>
          <TabsTrigger value="advanced" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Avancé')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('General Settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('Store Status')}</Label>
                  <p className="text-sm text-muted-foreground">{t('Enable or disable store')}</p>
                </div>
                <Switch 
                  checked={formData.store_status || false}
                  onCheckedChange={(checked) => updateSetting('store_status', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('Maintenance Mode')}</Label>
                  <p className="text-sm text-muted-foreground">{t('Put store in maintenance mode')}</p>
                </div>
                <Switch 
                  checked={formData.maintenance_mode || false}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('Variant Selection Mandatory')}</Label>
                  <p className="text-sm text-muted-foreground">{t('Require customer to select product variants before ordering')}</p>
                </div>
                <Switch 
                  checked={formData.require_variant_selection !== false}
                  onCheckedChange={(checked) => updateSetting('require_variant_selection', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Store Configuration')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <MediaPicker
                  label={t('Store Logo')}
                  value={formData.logo || ''}
                  onChange={(value) => updateSetting('logo', value)}
                  placeholder={t('Select store logo...')}
                  showPreview={true}
                />
              </div>
              <div>
                <MediaPicker
                  label={t('Store Favicon')}
                  value={formData.favicon || ''}
                  onChange={(value) => updateSetting('favicon', value)}
                  placeholder={t('Select store favicon...')}
                  showPreview={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{t('Appearance Settings')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('Leave any color field empty to use the theme default color.')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetColors}
                className="text-xs border-red-200 hover:bg-red-50 text-red-700"
              >
                {t('Reset All Colors to Default')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Primary / Theme Color */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="primary_color">{t('Theme / Primary Color')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('Default for this theme')}: <code className="bg-muted px-1 rounded">{getDefaultThemeColor()}</code>
                  </p>
                </div>
                
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-3">
                  {PREDEFINED_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      title={preset.label}
                      onClick={() => updateSetting('primary_color', preset.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.primary_color === preset.name
                          ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      aria-label={preset.label}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {formData.primary_color ? t(`Selected: ${PREDEFINED_COLORS.find(p => p.name === formData.primary_color)?.label || formData.primary_color}`) : t('Using default theme color')}
                  </span>
                  {formData.primary_color && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSetting('primary_color', '')}
                      className="text-xs text-muted-foreground h-auto p-0"
                    >
                      {t('Clear Selection')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Add to Cart Button Color */}
              <div className="space-y-2">
                <Label htmlFor="button_color_add_to_cart">{t('Add to Cart Button Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use primary theme color')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="button_color_add_to_cart"
                    className="w-16 h-10 p-1"
                    value={formData.button_color_add_to_cart || formData.primary_color || getDefaultThemeColor()}
                    onChange={(e) => updateSetting('button_color_add_to_cart', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-36"
                    placeholder={t('Default (Theme color)')}
                    value={formData.button_color_add_to_cart || ''}
                    onChange={(e) => updateSetting('button_color_add_to_cart', e.target.value)}
                  />
                  {formData.button_color_add_to_cart && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateSetting('button_color_add_to_cart', '')} className="text-xs text-muted-foreground">{t('Clear')}</Button>
                  )}
                </div>
              </div>

              {/* Buy Now Button Color */}
              <div className="space-y-2">
                <Label htmlFor="button_color_buy_now">{t('Buy Now Button Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use default green color')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="button_color_buy_now"
                    className="w-16 h-10 p-1"
                    value={formData.button_color_buy_now || '#16a34a'}
                    onChange={(e) => updateSetting('button_color_buy_now', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-36"
                    placeholder="#16a34a"
                    value={formData.button_color_buy_now || ''}
                    onChange={(e) => updateSetting('button_color_buy_now', e.target.value)}
                  />
                  {formData.button_color_buy_now && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateSetting('button_color_buy_now', '')} className="text-xs text-muted-foreground">{t('Clear')}</Button>
                  )}
                </div>
              </div>

              {/* Button Text Color */}
              <div className="space-y-2">
                <Label htmlFor="text_button_color">{t('Button Text Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use default (white)')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="text_button_color"
                    className="w-16 h-10 p-1"
                    value={formData.text_button_color || '#ffffff'}
                    onChange={(e) => updateSetting('text_button_color', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-36"
                    placeholder="#ffffff"
                    value={formData.text_button_color || ''}
                    onChange={(e) => updateSetting('text_button_color', e.target.value)}
                  />
                  {formData.text_button_color && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateSetting('text_button_color', '')} className="text-xs text-muted-foreground">{t('Clear')}</Button>
                  )}
                </div>
              </div>

              {/* Heading / Large Text Color */}
              <div className="space-y-2">
                <Label htmlFor="text_title_color">{t('Heading / Large Text Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use theme default heading color')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="text_title_color"
                    className="w-16 h-10 p-1"
                    value={formData.text_title_color || '#0f172a'}
                    onChange={(e) => updateSetting('text_title_color', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-36"
                    placeholder="#0f172a"
                    value={formData.text_title_color || ''}
                    onChange={(e) => updateSetting('text_title_color', e.target.value)}
                  />
                  {formData.text_title_color && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateSetting('text_title_color', '')} className="text-xs text-muted-foreground">{t('Clear')}</Button>
                  )}
                </div>
              </div>

              {/* Site Background Color */}
              <div className="space-y-2">
                <Label htmlFor="site_bg_color">{t('Site Background Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use theme default background')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="site_bg_color"
                    className="w-16 h-10 p-1"
                    value={formData.site_bg_color || '#ffffff'}
                    onChange={(e) => updateSetting('site_bg_color', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-36"
                    placeholder="#ffffff"
                    value={formData.site_bg_color || ''}
                    onChange={(e) => updateSetting('site_bg_color', e.target.value)}
                  />
                  {formData.site_bg_color && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateSetting('site_bg_color', '')} className="text-xs text-muted-foreground">{t('Clear')}</Button>
                  )}
                </div>
              </div>

              {/* Button Style */}
              <div className="space-y-2">
                <Label htmlFor="button_radius">{t('Button Style')}</Label>
                <select
                  id="button_radius"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.button_radius || '0.625rem'}
                  onChange={(e) => updateSetting('button_radius', e.target.value)}
                >
                  <option value="0">{t('Square')}</option>
                  <option value="0.375rem">{t('Slightly Rounded')}</option>
                  <option value="0.625rem">{t('Rounded')}</option>
                  <option value="9999px">{t('Pill')}</option>
                </select>
              </div>

              {/* Toggle Show/Hide Add to Cart & Options Button */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div className="space-y-0.5">
                  <Label htmlFor="show_add_to_cart_button" className="text-base font-semibold">{t('Afficher le bouton "Ajouter au panier" / "Options"')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('Désactivez cette option pour masquer le bouton Ajouter au panier / Options sur les cartes produits de votre boutique')}
                  </p>
                </div>
                <Switch
                  id="show_add_to_cart_button"
                  checked={formData.show_add_to_cart_button !== false}
                  onCheckedChange={(checked) => updateSetting('show_add_to_cart_button', checked)}
                />
              </div>

              {/* Add to Cart Text */}
              {formData.show_add_to_cart_button !== false && (
                <div className="space-y-2">
                  <Label htmlFor="button_text_add_to_cart">{t('Add to Cart Text')}</Label>
                  <p className="text-sm text-muted-foreground">{t('Leave empty to use default text')}</p>
                  <Input
                    id="button_text_add_to_cart"
                    placeholder={t('Add to Cart')}
                    value={formData.button_text_add_to_cart || ''}
                    onChange={(e) => updateSetting('button_text_add_to_cart', e.target.value)}
                  />
                </div>
              )}

              {/* Buy Now Text */}
              <div className="space-y-2">
                <Label htmlFor="button_text_buy_now">{t('Buy Now Text')}</Label>
                <p className="text-sm text-muted-foreground">{t('Leave empty to use default text')}</p>
                <Input
                  id="button_text_buy_now"
                  placeholder={t('Buy Now')}
                  value={formData.button_text_buy_now || ''}
                  onChange={(e) => updateSetting('button_text_buy_now', e.target.value)}
                />
              </div>

            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Tracking & Analytics')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="google_analytics">{t('Google Analytics Measurement ID')}</Label>
                <p className="text-sm text-muted-foreground">{t('Example: G-XXXXXXX')}</p>
                <Input
                  id="google_analytics"
                  placeholder="G-XXXXXXX"
                  value={formData.google_analytics || ''}
                  onChange={(e) => updateSetting('google_analytics', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_pixel">{t('Facebook Pixel ID')}</Label>
                <p className="text-sm text-muted-foreground">{t('Example: 123456789012345')}</p>
                <Input
                  id="facebook_pixel"
                  placeholder="123456789012345"
                  value={formData.facebook_pixel || ''}
                  onChange={(e) => updateSetting('facebook_pixel', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_capi_token">{t('Facebook Conversion API (CAPI) Access Token')}</Label>
                <p className="text-sm text-muted-foreground">{t('Enter your System User Access Token for server-side event tracking')}</p>
                <Input
                  id="facebook_capi_token"
                  placeholder="EAAG..."
                  value={formData.facebook_capi_token || ''}
                  onChange={(e) => updateSetting('facebook_capi_token', e.target.value)}
                />
              </div>

              {/* Facebook & Instagram Catalog Auto-Sync Feed XML */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-900/50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Rss className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-sm">{t('Flux Catalogue Facebook & Instagram (Auto-Sync)')}</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                    {t('Actif XML RSS')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('Copiez ce lien et collez-le dans Facebook Commerce Manager (Gestionnaire de ventes > Source de données > Importation programmée) pour synchroniser automatiquement vos produits, prix et stocks.')}
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={getFacebookCatalogFeedUrl()}
                    className="font-mono text-xs bg-white dark:bg-slate-950"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(getFacebookCatalogFeedUrl());
                      }
                      setCopiedFeed(true);
                      setTimeout(() => setCopiedFeed(false), 2000);
                    }}
                  >
                    {copiedFeed ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1 text-xs">{copiedFeed ? t('Copié !') : t('Copier')}</span>
                  </Button>
                  <a
                    href={getFacebookCatalogFeedUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t('Ouvrir le flux XML')}
                  >
                    <ExternalLink className="h-4 w-4 text-slate-600" />
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok_pixel">{t('TikTok Pixel ID')}</Label>
                <p className="text-sm text-muted-foreground">{t('Example: CXXXXXXXXXXXXXXX')}</p>
                <Input
                  id="tiktok_pixel"
                  placeholder="CXXXXXXXXXXXXXXX"
                  value={formData.tiktok_pixel || ''}
                  onChange={(e) => updateSetting('tiktok_pixel', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapchat_pixel">{t('Snapchat Pixel ID')}</Label>
                <p className="text-sm text-muted-foreground">{t('Example: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}</p>
                <Input
                  id="snapchat_pixel"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={formData.snapchat_pixel || ''}
                  onChange={(e) => updateSetting('snapchat_pixel', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Custom CSS')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom_css">{t('Custom CSS Code')}</Label>
                <p className="text-sm text-muted-foreground">{t('Add custom CSS styles for your store')}</p>
                <Textarea
                  id="custom_css"
                  placeholder={t('Enter your custom CSS code here...')}
                  value={formData.custom_css || ''}
                  onChange={(e) => updateSetting('custom_css', e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Custom Head Code')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom_head_code">{t('Custom Head HTML/JS/CSS')}</Label>
                <p className="text-sm text-muted-foreground">{t('Add custom HTML code directly into the <head> tag (Google Analytics, scripts, Meta tags...)')}</p>
                <Textarea
                  id="custom_head_code"
                  placeholder={t('Enter your custom HTML/JS/CSS code here...')}
                  value={formData.custom_head_code || ''}
                  onChange={(e) => updateSetting('custom_head_code', e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('Custom JavaScript')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom_javascript">{t('Custom JavaScript Code')}</Label>
                <p className="text-sm text-muted-foreground">{t('Add custom JavaScript for your store')}</p>
                <Textarea
                  id="custom_javascript"
                  placeholder={t('Enter your custom JavaScript code here...')}
                  value={formData.custom_javascript || ''}
                  onChange={(e) => updateSetting('custom_javascript', e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}