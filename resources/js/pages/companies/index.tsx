// pages/companies/index.tsx
import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, Search, Plus, Eye, Edit, Trash2, KeyRound, Lock, Unlock, LayoutGrid, List, ExternalLink, Info, ArrowUpRight, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/ui/date-picker';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { UpgradePlanModal } from '@/components/UpgradePlanModal';

export default function Companies() {
  const { t } = useTranslation();
  const { auth, companies, plans, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const getInitials = useInitials();
  
  // State
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [startDate, setStartDate] = useState<Date | undefined>(pageFilters.start_date ? new Date(pageFilters.start_date) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(pageFilters.end_date ? new Date(pageFilters.end_date) : undefined);
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedStatus !== 'all' || searchTerm !== '' || startDate !== undefined || endDate !== undefined;
  };
  
  // Count active filters
  const activeFilterCount = () => {
    return (selectedStatus !== 'all' ? 1 : 0) + 
           (searchTerm ? 1 : 0) + 
           (startDate ? 1 : 0) + 
           (endDate ? 1 : 0);
  };
  
  // Define page actions
  const pageActions = [
    {
      label: t('Créer une entreprise'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    }
  ];  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    
    if (startDate) {
      params.start_date = startDate.toISOString().split('T')[0];
    }
    
    if (endDate) {
      params.end_date = endDate.toISOString().split('T')[0];
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('companies.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (value !== 'all') {
      params.status = value;
    }
    
    if (startDate) {
      params.start_date = startDate.toISOString().split('T')[0];
    }
    
    if (endDate) {
      params.end_date = endDate.toISOString().split('T')[0];
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('companies.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    const params: any = { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1 
    };
    
    // Add search and filters
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    
    if (startDate) {
      params.start_date = startDate.toISOString().split('T')[0];
    }
    
    if (endDate) {
      params.end_date = endDate.toISOString().split('T')[0];
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('companies.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleAction = (action: string, company: any) => {
    setCurrentCompany(company);
    
    switch (action) {
      case 'login-as':
        router.get(route("impersonate.start", company.id));
        break;
      case 'company-info':
        setFormMode('view');
        setIsFormModalOpen(true);
        break;
      case 'upgrade-plan':
        handleUpgradePlan(company);
        break;

      case 'reset-password':
        setIsResetPasswordModalOpen(true);
        break;
      case 'toggle-status':
        handleToggleStatus(company);
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };
  
  const handleAddNew = () => {
    setCurrentCompany(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };
  
  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating company...'));
      
      router.post(route('companies.store'), formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
          toast.dismiss();
          // Success message will be handled by flash message system
        },
        onError: (errors) => {
          toast.dismiss();
          const errorMessage = Object.values(errors).join(', ') || t('Failed to create company');
          toast.error(errorMessage);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating company...'));
      
      router.put(route('companies.update', currentCompany.id), formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
          toast.dismiss();
          // Success message will be handled by flash message system
        },
        onError: (errors) => {
          toast.dismiss();
          const errorMessage = Object.values(errors).join(', ') || t('Failed to update company');
          toast.error(errorMessage);
        }
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting company...'));
    
    router.delete(route("companies.destroy", currentCompany.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        // Success message will be handled by flash message system
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessage = Object.values(errors).join(', ') || t('Failed to delete company');
        toast.error(errorMessage);
      }
    });
  };
  
  const handleResetPasswordConfirm = (data: { password: string }) => {
    toast.loading(t('Resetting password...'));
    
    router.put(route('companies.reset-password', currentCompany.id), data, {
      onSuccess: () => {
        setIsResetPasswordModalOpen(false);
        toast.dismiss();
        // Success message will be handled by flash message system
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessage = Object.values(errors).join(', ') || t('Failed to reset password');
        toast.error(errorMessage);
      }
    });
  };
  
  const handleToggleStatus = (company: any) => {
    toast.loading(t('Updating status...'));
    
    router.put(route('companies.toggle-status', company.id), {}, {
      onSuccess: () => {
        toast.dismiss();
        // Success message will be handled by flash message system
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessage = Object.values(errors).join(', ') || t('Failed to update status');
        toast.error(errorMessage);
      }
    });
  };
  
  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setShowFilters(false);
    
    router.get(route('companies.index'), { 
      page: 1, 
      per_page: pageFilters.per_page 
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleUpgradePlan = (company: any) => {
    setCurrentCompany(company);
    
    // Fetch available plans
    toast.loading(t('Loading plans...'));
    
    fetch(route('companies.plans', company.id))
      .then(res => res.json())
      .then(data => {
        setAvailablePlans(data.plans);
        setIsUpgradePlanModalOpen(true);
        toast.dismiss();
      })
      .catch(err => {
        toast.dismiss();
        toast.error(t('Failed to load plans'));
      });
  };
  
  const handleUpgradePlanConfirm = (planId: number) => {
    toast.loading(t('Upgrading plan...'));
    
    // Use Inertia router to handle the request
    router.put(route('companies.upgrade-plan', currentCompany.id), { 
      plan_id: planId 
    }, {
      onSuccess: (page) => {
        setIsUpgradePlanModalOpen(false);
        toast.dismiss();
        // Success message will be handled by flash message system
        // Force a page reload to ensure fresh data
        setTimeout(() => {
          router.reload({ only: ['companies'] });
        }, 100);
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessage = Object.values(errors).join(', ') || t('Failed to upgrade plan');
        toast.error(errorMessage);
      }
    });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Companies') }
  ];

  // Define table columns for list view
  const columns = [
    { 
      key: 'name', 
      label: t('Name'), 
      sortable: true,
      render: (value: any, row: any) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
              {getInitials(row.name)}
            </div>
            <div>
              <div className="font-medium text-gray-900">{row.name}</div>
              <div className="text-xs text-muted-foreground">{row.email}</div>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'phone', 
      label: t('Phone'),
      render: (value: string) => value ? <span className="font-mono text-sm text-gray-700">{value}</span> : <span className="text-gray-400 text-xs">-</span>
    },
    { 
      key: 'plan_name', 
      label: t('Plan'),
      render: (value: string) => <span className="capitalize">{value}</span>
    },
    { 
      key: 'created_at', 
      label: t('Created At'), 
      sortable: true,
      render: (value: string) => window.appSettings?.formatDateTime(value, false) || new Date(value).toLocaleDateString()
    }
  ];

  return (
    <PageTemplate 
      title={t("Companies Management")} 
      url="/companies"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 mb-4 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("Rechercher une entreprise, un nom, un email...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-9 text-xs sm:text-sm bg-gray-50/50 border-gray-200 focus:bg-white"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 px-3 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Search className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline text-xs font-medium">{t("Rechercher")}</span>
              </Button>
            </form>
            
            <Button 
              variant={hasActiveFilters() ? "default" : "outline"}
              size="sm" 
              className="h-9 px-3 shrink-0 text-xs flex items-center justify-center gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3.5 w-3.5 text-gray-500" />
              <span>{showFilters ? t('Masquer les filtres') : t('Filtres')}</span>
              {hasActiveFilters() && (
                <span className="ml-1 bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                  {activeFilterCount()}
                </span>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t border-gray-100 md:border-t-0">
            <div className="border border-gray-200 rounded-lg p-0.5 flex items-center bg-gray-50">
              <Button 
                size="sm" 
                variant={activeView === 'list' ? "default" : "ghost"}
                className={`h-7 px-2.5 text-xs font-medium flex items-center gap-1.5 ${activeView === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                onClick={() => setActiveView('list')}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("Tableau")}</span>
              </Button>
              <Button 
                size="sm" 
                variant={activeView === 'grid' ? "default" : "ghost"}
                className={`h-7 px-2.5 text-xs font-medium flex items-center gap-1.5 ${activeView === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
                onClick={() => setActiveView('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("Grille")}</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-gray-500 whitespace-nowrap">{t("Par page:")}</Label>
              <Select 
                value={pageFilters.per_page?.toString() || "10"} 
                onValueChange={(value) => {
                  const params: any = { page: 1, per_page: parseInt(value) };
                  if (searchTerm) params.search = searchTerm;
                  if (selectedStatus !== 'all') params.status = selectedStatus;
                  if (startDate) params.start_date = startDate.toISOString().split('T')[0];
                  if (endDate) params.end_date = endDate.toISOString().split('T')[0];
                  router.get(route('companies.index'), params, { preserveState: true, preserveScroll: true });
                }}
              >
                <SelectTrigger className="w-16 h-8 text-xs bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="w-full mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5 flex-1 min-w-[140px]">
                <Label className="text-xs font-medium text-gray-700">{t("Statut")}</Label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className="w-full h-9 text-xs bg-white">
                    <SelectValue placeholder={t("Tous les statuts")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("Tous les statuts")}</SelectItem>
                    <SelectItem value="active">{t("Actif")}</SelectItem>
                    <SelectItem value="inactive">{t("Inactif")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5 flex-1 min-w-[140px]">
                <Label className="text-xs font-medium text-gray-700">{t("Date de début")}</Label>
                <DatePicker
                  selected={startDate}
                  onSelect={setStartDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              
              <div className="space-y-1.5 flex-1 min-w-[140px]">
                <Label className="text-xs font-medium text-gray-700">{t("Date de fin")}</Label>
                <DatePicker
                  selected={endDate}
                  onSelect={setEndDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="default" 
                  size="sm"
                  className="h-9 text-xs flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
                  onClick={applyFilters}
                >
                  {t("Appliquer")}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 text-xs flex-1 sm:flex-none"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters()}
                >
                  {t("Réinitialiser")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content section */}
      {/* 1. Mobile Cards View (Always rendered on mobile screens < 768px for supreme mobile UX) */}
      <div className="block md:hidden space-y-3 mb-6">
        {companies?.data?.map((company: any) => (
          <Card key={`mobile-${company.id}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            {/* Header: Avatar + Info + Status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {getInitials(company.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{company.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{company.email}</p>
                </div>
              </div>

              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                company.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${company.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {company.status === 'active' ? t('Actif') : t('Inactif')}
              </span>
            </div>

            {/* Grid stats info */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t("Téléphone")}</span>
                <span className="font-mono text-gray-700 truncate block mt-0.5">
                  {company.phone && company.phone !== '-' ? company.phone : <span className="text-gray-400 font-sans italic text-[11px]">{t("Non renseigné")}</span>}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t("Forfait")}</span>
                <span className="font-semibold text-emerald-700 capitalize truncate block mt-0.5">
                  {company.plan_name || 'Free'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 mb-3 flex items-center justify-between">
              <span>{t("Créé le")}:</span>
              <span className="font-medium text-gray-600">
                {window.appSettings?.formatDateTime(company.created_at, false) || new Date(company.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <Button 
                size="sm"
                onClick={() => handleAction('login-as', company)}
                className="flex-1 h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 rounded-lg"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{t("Se connecter")}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-gray-600 border-gray-200 rounded-lg">
                    <span>{t("Actions")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50">
                  <DropdownMenuItem onClick={() => handleAction('company-info', company)}>
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{t("Informations")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('upgrade-plan', company)}>
                    <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                    <span>{t("Changer le forfait")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('reset-password', company)}>
                    <KeyRound className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{t("Réinitialiser MDP")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('toggle-status', company)}>
                    {company.status === 'active' ? (
                      <>
                        <Lock className="h-4 w-4 mr-2 text-amber-500" />
                        <span>{t("Désactiver le compte")}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 mr-2 text-emerald-500" />
                        <span>{t("Activer le compte")}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('edit', company)}>
                    <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>{t("Modifier")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAction('delete', company)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    <span>{t("Supprimer")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}

        {(!companies?.data || companies.data.length === 0) && (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
            {t("Aucune entreprise trouvée")}
          </div>
        )}
      </div>

      {/* 2. Desktop View (Tableau or Grid based on activeView state) */}
      <div className="hidden md:block">
        {activeView === 'list' ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    {columns.map((column) => (
                      <th 
                        key={column.key} 
                        className="px-4 py-3.5 text-left font-semibold text-gray-700"
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-1 cursor-pointer">
                          {column.label}
                          {column.sortable && (
                            <span className="text-gray-400 text-xs">
                              {pageFilters.sort_field === column.key ? (
                                pageFilters.sort_direction === 'asc' ? '↑' : '↓'
                              ) : ''}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3.5 text-right font-semibold text-gray-700">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies?.data?.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50/60 transition-colors">
                      {columns.map((column) => (
                        <td key={`${company.id}-${column.key}`} className="px-4 py-3.5">
                          {column.render ? column.render(company[column.key], company) : company[column.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('login-as', company)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Login as Company")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('company-info', company)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Company Info")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('upgrade-plan', company)}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8"
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Upgrade Plan")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('reset-password', company)}
                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 w-8"
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Reset Password")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('toggle-status', company)}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 w-8"
                              >
                                {company.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{company.status === 'active' ? t("Disable Login") : t("Enable Login")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleAction('edit', company)}
                                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Edit")}</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                                onClick={() => handleAction('delete', company)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("Delete")}</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {(!companies?.data || companies.data.length === 0) && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                        {t("No companies found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies?.data?.map((company: any) => (
              <Card key={`desktop-grid-${company.id}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {getInitials(company.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{company.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{company.email}</p>
                    </div>
                  </div>

                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    company.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${company.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {company.status === 'active' ? t('Actif') : t('Inactif')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t("Téléphone")}</span>
                    <span className="font-mono text-gray-700 truncate block mt-0.5">
                      {company.phone && company.phone !== '-' ? company.phone : <span className="text-gray-400 font-sans italic text-[11px]">{t("Non renseigné")}</span>}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t("Forfait")}</span>
                    <span className="font-semibold text-emerald-700 capitalize truncate block mt-0.5">
                      {company.plan_name || 'Free'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 mb-3 flex items-center justify-between">
                  <span>{t("Créé le")}:</span>
                  <span className="font-medium text-gray-600">
                    {window.appSettings?.formatDateTime(company.created_at, false) || new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <Button 
                    size="sm"
                    onClick={() => handleAction('login-as', company)}
                    className="flex-1 h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 rounded-lg"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>{t("Se connecter")}</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs text-gray-600 border-gray-200 rounded-lg">
                        <span>{t("Actions")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 z-50">
                      <DropdownMenuItem onClick={() => handleAction('company-info', company)}>
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{t("Informations")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('upgrade-plan', company)}>
                        <CreditCard className="h-4 w-4 mr-2 text-amber-500" />
                        <span>{t("Changer le forfait")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('reset-password', company)}>
                        <KeyRound className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{t("Réinitialiser MDP")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('toggle-status', company)}>
                        {company.status === 'active' ? (
                          <>
                            <Lock className="h-4 w-4 mr-2 text-amber-500" />
                            <span>{t("Désactiver le compte")}</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4 mr-2 text-emerald-500" />
                            <span>{t("Activer le compte")}</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('edit', company)}>
                        <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                        <span>{t("Modifier")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction('delete', company)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        <span>{t("Supprimer")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}

            {(!companies?.data || companies.data.length === 0) && (
              <div className="col-span-full p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 text-sm">
                {t("Aucune entreprise trouvée")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shared Pagination section */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-gray-500 text-center sm:text-left">
          {t("Affichage de")} <span className="font-semibold text-gray-900">{companies?.from || 0}</span> {t("à")} <span className="font-semibold text-gray-900">{companies?.to || 0}</span> {t("sur")} <span className="font-semibold text-gray-900">{companies?.total || 0}</span> {t("entreprises")}
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-1.5">
          {companies?.links?.map((link: any, i: number) => {
            const rawLabel = link.label || '';
            const isPrevious = rawLabel.includes('Previous') || rawLabel.includes('previous') || rawLabel.includes('prev') || rawLabel.includes('&laquo;');
            const isNext = rawLabel.includes('Next') || rawLabel.includes('next') || rawLabel.includes('&raquo;');
            
            if (isPrevious) {
              return (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs bg-white text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center gap-1 font-medium"
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                  title={t("Précédent")}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("Précédent")}</span>
                </Button>
              );
            }

            if (isNext) {
              return (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs bg-white text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center gap-1 font-medium"
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                  title={t("Suivant")}
                >
                  <span className="hidden sm:inline">{t("Suivant")}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              );
            }

            const pageNum = rawLabel.replace(/&laquo;\s*/g, '').replace(/\s*&raquo;/g, '');

            return (
              <Button
                key={i}
                variant={link.active ? 'default' : 'outline'}
                size="sm"
                className={
                  link.active 
                    ? "h-8 min-w-[32px] px-2 text-xs bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs" 
                    : "h-8 min-w-[32px] px-2 text-xs border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium"
                }
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={(data) => {
          // If login_enabled is false, remove password field
          if (data.login_enabled === false) {
            delete data.password;
          }
          // Set status based on login_enabled
          data.status = data.login_enabled ? 'active' : 'inactive';
          
          // Remove login_enabled field as it's not needed in the backend
          delete data.login_enabled;
          handleFormSubmit(data);
        }}
        formConfig={{
          fields: [
            { name: 'name', label: t('Company Name'), type: 'text', required: true },
            { name: 'email', label: t('Email'), type: 'email', required: true },
            { name: 'phone', label: t('Phone Number'), type: 'text', required: false },
            { 
              name: 'login_enabled', 
              label: t('Enable Login'),
              type: 'switch',
              defaultValue: true
            },
            { 
              name: 'password', 
              label: t('Password'), 
              type: 'password',
              required: true,
              conditional: (mode, data) => {
                return data?.login_enabled === true;
              }
            }
          ],
          modalSize: 'lg'
        }}
        initialData={{
          ...currentCompany,
          login_enabled: currentCompany?.status === 'active' || false
        }}
        title={
          formMode === 'create' 
            ? t('Add New Company') 
            : formMode === 'edit' 
              ? t('Edit Company') 
              : t('View Company')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentCompany?.name || ''}
        entityName="company"
      />

      {/* Reset Password Modal */}
      <CrudFormModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSubmit={handleResetPasswordConfirm}
        formConfig={{
          fields: [
            { name: 'password', label: t('New Password'), type: 'password', required: true }
          ],
          modalSize: 'sm'
        }}
        initialData={{}}
        title={`Reset Password for ${currentCompany?.name || 'Company'}`}
        mode="edit"
      />
      
      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradePlanModalOpen}
        onClose={() => setIsUpgradePlanModalOpen(false)}
        onConfirm={handleUpgradePlanConfirm}
        plans={availablePlans}
        currentPlanId={currentCompany?.plan_id}
        companyName={currentCompany?.name || ''}
      />
    </PageTemplate>
  );
}