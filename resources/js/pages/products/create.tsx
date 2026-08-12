import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import MediaPicker from '@/components/MediaPicker';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import axios from 'axios';

export default function CreateProduct() {
  const { t } = useTranslation();
  const { categories, taxes } = usePage().props as any;
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    specifications: '',
    details: '',
    price: '',
    sale_price: '',
    stock: 0,
    cover_image: '',
    images: '',
    category_id: '',
    tax_id: '',
    is_active: true,
    is_downloadable: false,
    downloadable_file: '',
  });
  const [customFields, setCustomFields] = useState([{ name: '', value: '' }]);
  const [variants, setVariants] = useState([{ name: '', values: [''] }]);
  const [processing, setProcessing] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories || []);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const handleQuickAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const response = await axios.post(route('categories.store'), { name: newCategoryName }, { headers: { 'Accept': 'application/json' } });
      if (response.data.success) {
        setLocalCategories([...localCategories, response.data.category]);
        setFormData({ ...formData, category_id: String(response.data.category.id) });
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    if (processing) return;
    setProcessing(true);
    // Convert variants and custom fields to the format expected by the backend
    const productData = {
      ...formData,
      variants: variants.filter(v => v.name.trim() !== ''),
      custom_fields: customFields.filter(f => f.name.trim() !== '')
    };
    
    router.post(route('products.store'), productData, {
      onFinish: () => setProcessing(false)
    });
  };

  const pageActions = [
    {
      label: t('Retour'),
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.visit(route('products.index'))
    },
    {
      label: processing ? t('Enregistrement...') : t('Enregistrer'),
      icon: <Save className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: handleSubmit,
      disabled: processing
    }
  ];

  return (
    <PageTemplate 
      title={t('Créer un produit')}
      description={t('Ajoutez un nouveau produit avec ses informations, son prix et son stock')}
      url="/products/create"
      actions={pageActions}
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: t('Produits'), href: route('products.index') },
        { title: t('Créer un produit') }
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="flex w-full overflow-x-auto justify-start gap-1 p-1 bg-muted rounded-lg scrollbar-none h-auto">
            <TabsTrigger value="general" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Informations générales')}</TabsTrigger>
            <TabsTrigger value="pricing" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Prix & Tarification')}</TabsTrigger>
            <TabsTrigger value="inventory" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Inventaire & Stock')}</TabsTrigger>
            <TabsTrigger value="content" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Description & Médias')}</TabsTrigger>
            <TabsTrigger value="variants" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Variantes')}</TabsTrigger>
            <TabsTrigger value="advanced" className="shrink-0 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">{t('Options avancées')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Product Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('Product Name *')}</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('Enter product name')} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">{t('SKU *')}</Label>
                    <Input 
                      id="sku" 
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder={t('Product SKU')} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category_id">{t('Category *')}</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => handleSelectChange('category_id', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={t('Select category')} />
                        </SelectTrigger>
                        <SelectContent>
                          {localCategories?.map((category: any) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryModalOpen(true)} title={t('Créer une catégorie')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tax_id">{t('Product Tax')}</Label>
                    <Select 
                      value={formData.tax_id} 
                      onValueChange={(value) => handleSelectChange('tax_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select tax class')} />
                      </SelectTrigger>
                      <SelectContent>
                        {taxes?.map((tax: any) => (
                          <SelectItem key={tax.id} value={String(tax.id)}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <MediaPicker
                      label={t('Cover Image *')}
                      value={formData.cover_image}
                      onChange={(value) => handleSelectChange('cover_image', value)}
                      placeholder={t('Select cover image...')}
                    />
                  </div>
                  <div>
                    <MediaPicker
                      label={t('Product Images')}
                      value={formData.images}
                      onChange={(value) => handleSelectChange('images', value)}
                      multiple={true}
                      placeholder={t('Select product images...')}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('Product Display')}</Label>
                    <p className="text-sm text-muted-foreground">{t('Show product on store')}</p>
                  </div>
                  <Switch 
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Pricing Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">{t('Price *')}</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number" 
                      step="0.01" 
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="sale_price">{t('Sale Price')}</Label>
                    <Input 
                      id="sale_price" 
                      name="sale_price"
                      type="number" 
                      step="0.01" 
                      value={formData.sale_price}
                      onChange={handleChange}
                      placeholder="0.00" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Inventory Management')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stock">{t('Stock Quantity *')}</Label>
                  <Input 
                    id="stock" 
                    name="stock"
                    type="number" 
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('Downloadable Product')}</Label>
                    <p className="text-sm text-muted-foreground">{t('Is this a digital product?')}</p>
                  </div>
                  <Switch 
                    checked={formData.is_downloadable}
                    onCheckedChange={(checked) => handleSwitchChange('is_downloadable', checked)}
                  />
                </div>
                <div>
                  <MediaPicker
                    label={t('Downloadable File')}
                    value={formData.downloadable_file}
                    onChange={(value) => handleSelectChange('downloadable_file', value)}
                    placeholder={t('Select downloadable file...')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Product Content')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('Product Description')}</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleSelectChange('description', value)}
                    placeholder={t('Enter product description...')}
                  />
                </div>
                <div>
                  <Label>{t('Product Specifications')}</Label>
                  <RichTextEditor
                    value={formData.specifications}
                    onChange={(value) => handleSelectChange('specifications', value)}
                    placeholder={t('Enter product specifications...')}
                  />
                </div>
                <div>
                  <Label>{t('Product Details')}</Label>
                  <RichTextEditor
                    value={formData.details}
                    onChange={(value) => handleSelectChange('details', value)}
                    placeholder={t('Enter additional product details...')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('Product Variants')}</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVariants([...variants, { name: '', values: [''] }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Variant')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder={t('Variant name (e.g., Color, Size)')}
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].name = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {variant.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center space-x-2">
                          <Input
                            placeholder={t('Variant value')}
                            value={value}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].values[valueIndex] = e.target.value;
                              setVariants(newVariants);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newVariants = [...variants];
                              newVariants[index].values.push('');
                              setVariants(newVariants);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('Custom Fields')}</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomFields([...customFields, { name: '', value: '' }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Field')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {customFields.map((field, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={t('Field name')}
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...customFields];
                        newFields[index].name = e.target.value;
                        setCustomFields(newFields);
                      }}
                    />
                    <Input
                      placeholder={t('Field value')}
                      value={field.value}
                      onChange={(e) => {
                        const newFields = [...customFields];
                        newFields[index].value = e.target.value;
                        setCustomFields(newFields);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Créer une nouvelle catégorie')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Nom de la catégorie')}</Label>
              <Input 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder={t('Ex: Vêtements')} 
                autoFocus 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>{t('Annuler')}</Button>
            <Button onClick={handleQuickAddCategory} disabled={!newCategoryName.trim() || isCreatingCategory}>
              {isCreatingCategory ? t('Création...') : t('Créer et sélectionner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
