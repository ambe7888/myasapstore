import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { ArrowLeft, Save } from 'lucide-react';
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

export default function StoreSettings({ store, settings }: Props) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(settings || {});

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">{t('General')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('Appearance')}</TabsTrigger>
          <TabsTrigger value="tracking">{t('Tracking & Analytics')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('Advanced')}</TabsTrigger>
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
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetColors}
                className="text-xs border-amber-200 hover:bg-amber-50 text-amber-900"
              >
                {t('Reset Colors to Default')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary_color">{t('Theme / Primary Color')}</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="primary_color"
                    className="w-16 h-10 p-1"
                    value={formData.primary_color || getDefaultThemeColor()}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-32"
                    value={formData.primary_color || getDefaultThemeColor()}
                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_color_add_to_cart">{t('Add to Cart Button Color')}</Label>
                <p className="text-xs text-muted-foreground">{t('Leave empty to use primary theme color')}</p>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    id="button_color_add_to_cart"
                    className="w-16 h-10 p-1"
                    value={formData.button_color_add_to_cart || formData.primary_color || '#4f46e5'}
                    onChange={(e) => updateSetting('button_color_add_to_cart', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="w-32"
                    placeholder={t('Default (Theme)')}
                    value={formData.button_color_add_to_cart || ''}
                    onChange={(e) => updateSetting('button_color_add_to_cart', e.target.value)}
                  />
                </div>
              </div>

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
                    className="w-32"
                    placeholder="#16a34a"
                    value={formData.button_color_buy_now || ''}
                    onChange={(e) => updateSetting('button_color_buy_now', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_title_color">{t('Heading / Large Text Color')}</Label>
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
                    className="w-32"
                    placeholder="#0f172a"
                    value={formData.text_title_color || ''}
                    onChange={(e) => updateSetting('text_title_color', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_button_color">{t('Button Text Color')}</Label>
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
                    className="w-32"
                    placeholder="#ffffff"
                    value={formData.text_button_color || ''}
                    onChange={(e) => updateSetting('text_button_color', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_bg_color">{t('Site Background Color')}</Label>
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
                    className="w-32"
                    placeholder="#ffffff"
                    value={formData.site_bg_color || ''}
                    onChange={(e) => updateSetting('site_bg_color', e.target.value)}
                  />
                </div>
              </div>

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