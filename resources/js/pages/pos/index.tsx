import React, { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Printer, Receipt, Package, Tag, User, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router, usePage } from '@inertiajs/react';
import { getImageUrl } from '@/utils/image-helper';
import VariantSelector from './components/VariantSelector';
import { formatCurrency } from '@/utils/helpers';
import { Permission } from '@/components/Permission';
import { usePermissions } from '@/hooks/usePermissions';

export default function POS() {
  const { t } = useTranslation();
  const { products = [], customers = [], categories = [], settings = {} } = usePage().props as any;
  const [cart, setCart] = useState<any[]>([]);

  const { hasPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart data:', e);
        localStorage.removeItem('pos_cart');
      }
    }
    
    // Load selected customer
    const savedCustomer = localStorage.getItem('pos_customer');
    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer);
        setSelectedCustomer(customer.id);
      } catch (e) {
        console.error('Error parsing customer data:', e);
        localStorage.removeItem('pos_customer');
      }
    }
  }, []);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('walk-in');
  const [showInventory, setShowInventory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [savedCarts, setSavedCarts] = useState<any[]>([]);
  const [showSavedCarts, setShowSavedCarts] = useState(false);

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const filteredProducts = products.filter((product: any) => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
    const searchMatch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCustomerChange = (customerId: any) => {
    setSelectedCustomer(customerId);
    const customer = customers.find((c: any) => c.id === customerId);
    if (customer) {
      localStorage.setItem('pos_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('pos_customer');
    }
  };

  const addToCart = (product: any, variant?: any) => {
    if (product.stock <= 0) {
      alert(t('Ce produit est en rupture de stock'));
      return;
    }
    
    if (product.hasVariants && !variant) {
      setSelectedProduct(product);
      setShowVariantDialog(true);
      return;
    }
    
    const itemId = variant ? variant.id : product.id;
    const itemPrice = variant ? variant.price : product.price;
    const itemName = variant ? `${product.name} (${variant.name})` : product.name;
    
    const existingItem = cart.find(item => item.id === itemId);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      const newItem = { 
        id: itemId, 
        productId: product.id,
        name: itemName, 
        price: itemPrice, 
        image: product.image,
        variant: variant || null,
        quantity: 1 
      };
      updatedCart = [...cart, newItem];
      setCart(updatedCart);
    }
    
    localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    const product = products.find((p: any) => p.id === item.productId);
    if (product && quantity > product.stock) {
      alert(t('Seulement {{count}} article(s) disponible(s) en stock', { count: product.stock }));
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('pos_cart');
  };
  
  const saveCart = () => {
    if (cart.length === 0) return;
    
    const savedCart = {
      id: Date.now(),
      items: cart,
      customer: selectedCustomerData,
      timestamp: new Date().toLocaleString(),
      total: calculateTotal()
    };
    
    const updatedSavedCarts = [...savedCarts, savedCart];
    setSavedCarts(updatedSavedCarts);
    localStorage.setItem('pos_saved_carts', JSON.stringify(updatedSavedCarts));
    
    clearCart();
    alert(t('Panier enregistré avec succès'));
  };

  const loadSavedCart = (savedCart: any) => {
    setCart(savedCart.items);
    setSelectedCustomer(savedCart.customer?.id || 'walk-in');
    localStorage.setItem('pos_cart', JSON.stringify(savedCart.items));
    if (savedCart.customer) {
      localStorage.setItem('pos_customer', JSON.stringify(savedCart.customer));
    }
    
    const updatedSavedCarts = savedCarts.filter((c: any) => c.id !== savedCart.id);
    setSavedCarts(updatedSavedCarts);
    localStorage.setItem('pos_saved_carts', JSON.stringify(updatedSavedCarts));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const discountRate = settings?.default_discount ? settings.default_discount / 100 : 0;
    return calculateSubtotal() * discountRate;
  };

  const calculateTax = () => {
    const taxRate = settings?.tax_rate ? settings.tax_rate / 100 : 0;
    const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount();
    return subtotalAfterDiscount * taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const selectedCustomerData = customers.find((c: any) => c.id === selectedCustomer);

  return (
    <PageTemplate 
      title={t('Caisse & Point de Vente (POS)')}
      description={t('Sélectionnez les produits, enregistrez le panier et incaissez rapidement')}
      url="/pos"
      breadcrumbs={[
        { title: t('Tableau de bord'), href: route('dashboard') },
        { title: t('Caisse (POS)') }
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Products */}
        <div className="lg:w-2/3 space-y-4">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('Rechercher un produit par nom...')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('Client au comptoir')} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showInventory} onOpenChange={setShowInventory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs">
                    <Package className="h-4 w-4 mr-1.5" />
                    {t('Stock')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{t('Gestion des stocks du magasin')}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background border-b">
                          <tr>
                            <th className="text-left py-2 px-2">{t('Produit')}</th>
                            <th className="text-center py-2 px-2">{t('En stock')}</th>
                            <th className="text-right py-2 px-2">{t('Statut')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product: any) => (
                            <tr key={product.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-2 font-medium">{product.name}</td>
                              <td className="text-center py-2 px-2 font-bold">{product.stock}</td>
                              <td className="text-right py-2 px-2">
                                <Badge variant="outline" className={product.stock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                                  {product.stock > 0 ? t('En Stock') : t('Rupture')}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {savedCarts.length > 0 && (
                <Dialog open={showSavedCarts} onOpenChange={setShowSavedCarts}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-xs">
                      <Receipt className="h-4 w-4 mr-1.5" />
                      {t('Enregistrés')} ({savedCarts.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>{t('Paniers sauvegardés')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {savedCarts.map((savedCart: any) => (
                          <div key={savedCart.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{savedCart.customer?.name || t('Client au comptoir')}</p>
                              <p className="text-xs text-muted-foreground">{savedCart.timestamp}</p>
                              <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatCurrency(savedCart.total)}</p>
                            </div>
                            <Button size="sm" className="h-8 text-xs" onClick={() => {
                              loadSavedCart(savedCart);
                              setShowSavedCarts(false);
                            }}>
                              {t('Charger')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Permission permission="manage-settings-pos">
                <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => router.visit(route('pos.settings'))}>
                  <Settings className="h-4 w-4 mr-1.5" />
                  {t('Réglages')}
                </Button>
              </Permission>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-1.5 scrollbar-none">
            <Button
              variant={activeCategory === 'all' ? "default" : "outline"}
              size="sm"
              className="text-xs shrink-0"
              onClick={() => setActiveCategory('all')}
            >
              {t('Tous les produits')}
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
              <p className="text-sm text-muted-foreground">{t('Aucun produit trouvé dans cette catégorie')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {paginatedProducts.map((product: any) => (
                  <Card 
                    key={product.id} 
                    className={`group ${product.stock > 0 ? 'cursor-pointer hover:border-primary hover:shadow-sm' : 'opacity-60'} transition-all overflow-hidden border-gray-200 rounded-xl bg-white`}
                    onClick={() => product.stock > 0 && addToCart(product)}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-xs text-gray-900 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-bold text-gray-900">{formatCurrency(product.price)}</p>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="mt-1">
                        <p className="text-[11px] text-muted-foreground">
                          Stock : <span className={product.stock <= 5 ? "text-red-500 font-bold" : "font-medium"}>{product.stock}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* POS Products Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    {t('Précédent')}
                  </Button>
                  <span className="text-xs font-medium text-gray-600">
                    {t('Page {{current}} sur {{total}}', { current: currentPage, total: totalPages })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    {t('Suivant')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side - Cart */}
        <div className="lg:w-1/3">
          <Card className="sticky top-4 border-gray-200 rounded-2xl shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="flex items-center text-base font-bold text-gray-900">
                <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                {t('Panier en cours')}
              </CardTitle>
              {selectedCustomerData && selectedCustomerData.id !== 'walk-in' && (
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  <span className="font-semibold text-gray-800">{selectedCustomerData.name}</span>
                  {selectedCustomerData.phone && (
                    <span className="ml-1.5 font-mono">({selectedCustomerData.phone})</span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-none">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                      <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">{t('Votre panier est vide')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t('Cliquez sur un produit pour l\'ajouter')}</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-2.5 bg-gray-50/50">
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-white">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Product';
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('Sous-total')}</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{t('Réduction ({{rate}}%)', { rate: settings?.default_discount || 0 })}</span>
                      <span>-{formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('Taxes / TVA ({{rate}}%)', { rate: settings?.tax_rate || 0 })}</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-1">
                    <span>{t('Total à payer')}</span>
                    <span className="text-emerald-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                {/* Clean, Organized Cart Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Permission permission="process-transactions-pos">
                    <Button 
                      className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-2" 
                      disabled={cart.length === 0}
                      onClick={() => router.visit(route('pos.checkout'))}
                    >
                      <CreditCard className="h-4 w-4" />
                      {t('Encaisser ({{amount}})', { amount: formatCurrency(calculateTotal()) })}
                    </Button>
                  </Permission>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 text-xs flex items-center justify-center gap-1 border-gray-200"
                      disabled={cart.length === 0}
                      onClick={saveCart}
                      title={t('Enregistrer le panier')}
                    >
                      <Receipt className="h-3.5 w-3.5 text-gray-600" />
                      <span>{t('Enregistrer')}</span>
                    </Button>
                    
                    <Permission permission="view-transactions-pos">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 text-xs flex items-center justify-center gap-1 border-gray-200"
                        onClick={() => router.visit(route('pos.transactions'))}
                        title={t('Voir l\'historique des transactions')}
                      >
                        <Receipt className="h-3.5 w-3.5 text-blue-600" />
                        <span>{t('Transactions')}</span>
                      </Button>
                    </Permission>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={cart.length === 0}
                      onClick={clearCart}
                      className="h-9 text-xs flex items-center justify-center gap-1 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                      title={t('Vider le panier')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('Vider')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variant Selector Dialog */}
      <VariantSelector
        product={selectedProduct}
        open={showVariantDialog}
        onClose={() => setShowVariantDialog(false)}
        onSelectVariant={(product, variant) => {
          addToCart(product, variant);
          setShowVariantDialog(false);
        }}
      />
    </PageTemplate>
  );
}