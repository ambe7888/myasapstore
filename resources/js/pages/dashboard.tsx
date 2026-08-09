import React, { useState, useEffect } from 'react';
import { PageTemplate, type PageAction } from '@/components/page-template';
import { RefreshCw, BarChart3, Download, Building2, ShoppingCart, Users, DollarSign, Package, TrendingUp, QrCode, Copy, Check, CreditCard, FileText, Tag, Activity, ArrowRight, Sparkles, Plus, Bell, ChevronRight, ExternalLink, Clock, Zap, Eye, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link, router, usePage } from '@inertiajs/react';
import QRCode from 'react-qr-code';

import { formatCurrency } from '@/utils/helpers';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';


interface Props {
  dashboardData: {
    metrics: {
      orders?: number;
      products?: number;
      customers?: number;
      revenue?: number;
      totalCompanies?: number;
      totalPlans?: number;
      activePlans?: number;
      totalRevenue?: number;
      monthlyRevenue?: number;
      monthlyGrowth?: number;
      pendingRequests?: number;
      pendingOrders?: number;
      approvedOrders?: number;
      totalOrders?: number;
      activeCoupons?: number;
      totalCoupons?: number;
    };
    recentOrders: any[];
    topProducts?: any[];
    topPlans?: any[];
  };
  currentStore: any;
  storeUrl?: string;
  isSuperAdmin: boolean;
}

export default function Dashboard({ dashboardData, currentStore, storeUrl, isSuperAdmin }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const formatStatusLabel = (status: string) => {
    if (!status) return '';
    const statusMap: Record<string, string> = {
      pending: t('En attente'),
      approved: t('Approuvé'),
      completed: t('Terminé'),
      cancelled: t('Annulé'),
      paid: t('Payé'),
      unpaid: t('Non payé'),
      company: t('Entreprise'),
      plan: t('Forfait'),
      payment: t('Paiement'),
      active: t('Actif'),
      inactive: t('Inactif'),
      delivered: t('Livré'),
      shipped: t('Expédié'),
      processing: t('En cours'),
    };
    return statusMap[status.toLowerCase()] || t(status);
  };

  const { auth } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const { themeColor, customColor } = useBrand();
  
  // Get dynamic theme color value
  const getThemeColorValue = () => {
    return themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];
  };
  
  const copyToClipboard = async () => {
    try {
      const urlToCopy = currentStore?.copy_link_url || storeUrl;
      if (!urlToCopy) return;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const pageActions: PageAction[] = isSuperAdmin ? [
    {
      label: t('Refresh'),
      icon: <RefreshCw className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => router.reload({ only: ['dashboardData'] })
    }
  ] : [
    ...(permissions.includes('view-analytics') ? [{
      label: t('Analytics'),
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => window.location.href = route('analytics.index')
    }] : []),
    ...(permissions.includes('export-dashboard') ? [{
      label: t('Export'),
      icon: <Download className="h-4 w-4" />,
      variant: 'default',
      onClick: () => window.open(route('dashboard.export'), '_blank')
    }] : [])
  ];

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <PageTemplate title={t('Dashboard')} description={t('System-wide statistics and overview')} url="/dashboard" actions={pageActions}>
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('Active Plans')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{dashboardData.metrics.activePlans || 0}</div>
                  <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('Currently enabled subscription plans')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('Pending Requests')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{dashboardData.metrics.pendingRequests || 0}</div>
                  <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('Awaiting approval')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('Monthly Growth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">
                    {(dashboardData.metrics.monthlyGrowth || 0) >= 0 ? '+' : ''}{dashboardData.metrics.monthlyGrowth || 0}%
                  </div>
                  <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('System growing monthly')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('Total Companies')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{dashboardData.metrics.totalCompanies || 0}</div>
                  <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('Registered companies')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('Total Revenue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{dashboardData.metrics.formattedTotalRevenue || formatCurrency(dashboardData.metrics.totalRevenue || 0)}</div>
                  <div className="p-3 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('All-time earnings')}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activities and Top Plans */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        order.status === 'company' || order.status === 'approved' ? 'bg-green-500' :
                        order.status === 'payment' ? 'bg-green-500' :
                        order.status === 'plan' || order.status === 'pending' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {order.company || order.description}
                        </p>
                        <p className="text-xs text-gray-500">{order.date || order.time}</p>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded font-medium ${
                        order.status === 'company' || order.status === 'approved' ? 'bg-green-100 text-green-700' :
                        order.status === 'payment' ? 'bg-green-100 text-green-700' :
                        order.status === 'plan' || order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('Top Performing Plans')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.topPlans?.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-primary/10 text-primary' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-500">{plan.orders || plan.subscribers} {t('subscribers')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">{plan.formatted_revenue || formatCurrency(plan.revenue || 0)}</p>
                        <p className="text-xs text-gray-500">{t('revenue')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                {t('Features')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t('Comprehensive system management and oversight tools')}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="group">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full transition-shadow hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-full p-3 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium text-xs bg-secondary text-secondary-foreground">
                          {dashboardData.metrics.totalCompanies}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{t('Company Management')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('Manage all registered companies and their subscriptions')}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between hover:bg-primary/10"
                        onClick={() => router.visit(route('companies.index'))}
                      >
                        {t('Explore')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full transition-shadow hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-full p-3 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                          <Package className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium text-xs bg-secondary text-secondary-foreground">
                          {dashboardData.metrics.totalPlans}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{t('Plan Management')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('Create and manage subscription plans')}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between hover:bg-primary/10"
                        onClick={() => router.visit(route('plans.index'))}
                      >
                        {t('Explore')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full transition-shadow hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-full p-3 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                          <Tag className="h-6 w-6" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium text-xs bg-secondary text-secondary-foreground">
                          {dashboardData.metrics.activeCoupons || 0}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{t('Coupon Management')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('Manage system-wide coupons and discounts')}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between hover:bg-primary/10"
                        onClick={() => router.visit(route('coupons.index'))}
                      >
                        {t('Explore')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }


  
  
  if (!currentStore) {
    return (
      <PageTemplate title={t('Dashboard')} description={t('Please select a store to view dashboard')} url="/dashboard">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('Please select a store to view dashboard')}</p>
        </div>
      </PageTemplate>
    );
  }

  // ─── Mobile Seller Dashboard (YouCan style) ───────────────────────
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending:    { bg: '#FEF3C7', text: '#D97706' },
    approved:   { bg: '#D1FAE5', text: '#059669' },
    completed:  { bg: '#D1FAE5', text: '#059669' },
    delivered:  { bg: '#D1FAE5', text: '#059669' },
    cancelled:  { bg: '#FEE2E2', text: '#DC2626' },
    processing: { bg: '#DBEAFE', text: '#2563EB' },
    shipped:    { bg: '#EDE9FE', text: '#7C3AED' },
    paid:       { bg: '#D1FAE5', text: '#059669' },
    unpaid:     { bg: '#FEE2E2', text: '#DC2626' },
  };

  if (!isSuperAdmin && currentStore && isMobile) {
    const quickActions = [
      { label: t('Ajouter produit'), icon: Package, href: route('products.create'), color: '#00b87c' },
      { label: t('Voir commandes'), icon: ShoppingCart, href: route('orders.index'), color: '#3b82f6' },
      { label: t('Ma boutique'), icon: ExternalLink, href: currentStore?.store_url || '#', external: true, color: '#8b5cf6' },
      { label: t('Analytiques'), icon: BarChart3, href: permissions.includes('view-analytics') ? route('analytics.index') : '#', color: '#f59e0b' },
    ];

    const greeting = () => {
      const h = new Date().getHours();
      if (h < 12) return t('Bonjour');
      if (h < 18) return t('Bon après-midi');
      return t('Bonsoir');
    };

    return (
      <div className="min-h-screen bg-[#f5f7fa]" style={{ paddingBottom: '80px' }}>

        {/* ─── Header ──────────────────────────────────────── */}
        <div
          className="px-4 pt-4 pb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00b87c 0%, #00966a 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-white/70 text-xs font-medium">{greeting()},</p>
              <h1 className="text-white font-black text-lg leading-tight">{auth?.user?.name || t('Vendeur')}</h1>
              <p className="text-white/70 text-xs mt-0.5">{currentStore?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center relative active:scale-90 transition-transform">
                <Bell size={17} className="text-white" />
                {(dashboardData.metrics.pendingOrders || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">
                    {dashboardData.metrics.pendingOrders}
                  </span>
                )}
              </button>
              <Link href={route('stores.index')} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center active:scale-90 transition-transform">
                <Building2 size={17} className="text-white" />
              </Link>
            </div>
          </div>

          {/* Store URL copy bar */}
          <button
            onClick={copyToClipboard}
            className="mt-4 relative z-10 w-full flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white/60 text-[10px] font-medium">{t('Lien de votre boutique')}</p>
              <p className="text-white text-xs font-semibold truncate">{currentStore?.store_url || storeUrl}</p>
            </div>
            <div className="flex-shrink-0">
              {copied ? <Check size={15} className="text-white" /> : <Copy size={15} className="text-white/70" />}
            </div>
          </button>
        </div>

        {/* ─── Stat Pills ──────────────────────────────────── */}
        <div className="px-4 -mt-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('Commandes'), value: dashboardData.metrics.orders || 0, icon: ShoppingCart, color: '#00b87c', bg: '#f0fdf9' },
              { label: t('Revenus'), value: formatCurrency(dashboardData.metrics.revenue || 0), icon: DollarSign, color: '#3b82f6', bg: '#eff6ff', isString: true },
              { label: t('Produits'), value: dashboardData.metrics.products || 0, icon: Package, color: '#8b5cf6', bg: '#f5f3ff' },
              { label: t('Clients'), value: dashboardData.metrics.customers || 0, icon: Users, color: '#f59e0b', bg: '#fffbeb' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm" style={{ border: '1px solid #f1f5f9' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                    <stat.icon size={16} style={{ color: stat.color }} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
                <p className="text-xl font-black text-slate-900">{stat.isString ? stat.value : (stat.value as number).toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Quick Actions ───────────────────────────────── */}
        <div className="px-4 mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('Actions rapides')}</p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: action.color + '18' }}
                >
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-[10px] text-center font-semibold text-slate-600 leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── Recent Orders ───────────────────────────────── */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-slate-900">{t('Commandes récentes')}</p>
            <Link href={route('orders.index')} className="text-xs font-bold" style={{ color: '#00b87c' }}>
              {t('Voir tout')} →
            </Link>
          </div>

          <div className="space-y-2.5">
            {(dashboardData.recentOrders || []).slice(0, 5).map((order, i) => {
              const sc = statusColors[order.status?.toLowerCase()] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <Link
                  key={i}
                  href={route('orders.show', order.id)}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 active:scale-[0.98] transition-transform"
                  style={{ border: '1px solid #f1f5f9' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sc.bg }}>
                    <ShoppingCart size={16} style={{ color: sc.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{order.order_number}</p>
                    <p className="text-xs text-slate-500 truncate">{order.customer}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-900">{formatCurrency(order.amount)}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {formatStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ─── Top Products ────────────────────────────────── */}
        {dashboardData.topProducts && dashboardData.topProducts.length > 0 && (
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-slate-900">{t('Meilleurs produits')}</p>
              <Link href={route('products.index')} className="text-xs font-bold" style={{ color: '#00b87c' }}>
                {t('Voir tout')} →
              </Link>
            </div>
            <div className="space-y-2">
              {dashboardData.topProducts.slice(0, 3).map((product, i) => (
                <Link
                  key={i}
                  href={route('products.show', product.id)}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 active:scale-[0.98] transition-transform"
                  style={{ border: '1px solid #f1f5f9' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sold} {t('vendus')}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900 flex-shrink-0">{formatCurrency(product.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── QR Code ─────────────────────────────────────── */}
        <div className="px-4 mt-5 mb-4">
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ border: '1px solid #f1f5f9' }}>
            <div className="bg-white p-1.5 border border-slate-100 rounded-xl shadow-sm flex-shrink-0">
              <QRCode value={currentStore?.qr_code_url || storeUrl || 'https://myasapstore.com'} size={72} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900">{t('QR de votre boutique')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('Partagez pour recevoir des commandes')}</p>
              <button
                onClick={copyToClipboard}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#00b87c18', color: '#00b87c' }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t('Copié !') : t('Copier le lien')}
              </button>
            </div>
          </div>
        </div>

        {/* ─── FAB — Add Product ───────────────────────────── */}
        <Link
          href={route('products.create')}
          className="fixed bottom-[80px] right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #00b87c, #00966a)',
            boxShadow: '0 6px 20px rgba(0,184,124,0.45)',
          }}
        >
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t('Dashboard')}
      description={t('Store dashboard and analytics')}
      url="/dashboard"
      actions={pageActions}
    >

      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{dashboardData.metrics.orders.toLocaleString()}</div>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{currentStore?.name || t('No Store')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Products')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{dashboardData.metrics.products.toLocaleString()}</div>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{t('Active products')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Customers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{dashboardData.metrics.customers.toLocaleString()}</div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{t('Registered customers')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Total Revenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.metrics.revenue)}</div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{t('All time revenue')}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('Recent Orders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Link 
                        href={route('orders.show', order.id)} 
                        className="font-medium hover:underline"
                        style={{ color: getThemeColorValue() }}
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.amount)}</p>
                      <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {formatStatusLabel(order.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('Top Products')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Link 
                        href={route('products.show', product.id)} 
                        className="font-medium hover:underline"
                        style={{ color: getThemeColorValue() }}
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{product.sold} {t('vendus')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-600" />
                {t('Code QR de la boutique')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="flex flex-col items-center justify-center space-y-4 w-full">
                <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center justify-center">
                  <QRCode value={currentStore?.qr_code_url || storeUrl} size={130} />
                </div>
                <div className="text-center space-y-2 w-full">
                  <p className="text-sm font-semibold text-gray-900">{currentStore.name}</p>
                  <p className="text-xs text-muted-foreground">{t('Scannez pour visiter la boutique')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-2 mx-auto"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t('Copié !') : t('Copier le lien')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}