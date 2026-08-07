import { PageTemplate } from '@/components/page-template';
import { CrudTable } from '@/components/CrudTable';
import { Pagination } from '@/components/pagination';
import { planRequestsConfig } from '@/config/crud/plan-requests';
import { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlanRequestsPage() {
  const { t } = useTranslation();
  const { flash, planRequests, filters: pageFilters = {}, auth } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  


  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    planRequestsConfig.filters?.forEach(filter => {
      initialFilters[filter.key] = pageFilters[filter.key] || 'all';
    });
    setFilterValues(initialFilters);
  }, []);

  // Flash messages are handled globally by the flash-messages.ts system
  // Removed manual handling to prevent duplicate messages

  const handleAction = (action: string, item: any) => {
    if (action === 'approve') {
      router.post(route("plan-requests.approve", item.id));
    } else if (action === 'reject') {
      router.post(route("plan-requests.reject", item.id));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params[key] = value;
      }
    });
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route("plan-requests.index"), params, { preserveState: true, preserveScroll: true });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    const newFilters = { ...filterValues, [key]: value };
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') {
        params[k] = v;
      }
    });
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route("plan-requests.index"), params, { preserveState: true, preserveScroll: true });
  };

  const userRole = auth.user?.type || auth.user?.role;
  const pageTitle = userRole === 'superadmin' ? t('Plan Requests') : t('My Plan Requests');
  
  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: pageTitle }
  ];

  const hasActiveFilters = () => {
    return Object.entries(filterValues).some(([key, value]) => {
      return value && value !== '';
    }) || searchTerm !== '';
  };

  const filteredActions = planRequestsConfig.table.actions?.filter(action => {
    if (action.action === 'approve') {
      return permissions.includes('approve-plan-requests');
    }
    if (action.action === 'reject') {
      return permissions.includes('reject-plan-requests');
    }
    return false;
  }).map(action => ({
    ...action,
    label: t(action.label)
  })) || [];

  return (
    <PageTemplate 
      title={pageTitle} 
      url="/plan-requests"
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 mb-4 p-4">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('Rechercher des demandes de forfaits...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-9 text-xs sm:text-sm bg-gray-50/50 border-gray-200 focus:bg-white text-center sm:text-left"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 px-4 w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white justify-center">
                <Search className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-medium">{t('Rechercher')}</span>
              </Button>
            </form>
            
            {planRequestsConfig.filters && planRequestsConfig.filters.length > 0 && (
              <Button 
                variant={hasActiveFilters() ? "default" : "outline"}
                size="sm" 
                className="h-9 px-4 w-full sm:w-auto shrink-0 text-xs flex items-center justify-center gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 text-gray-500" />
                <span>{showFilters ? t('Masquer les filtres') : t('Filtres')}</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 w-full pt-2 border-t border-gray-100">
            <Label className="text-xs text-gray-500 whitespace-nowrap">{t('Par page:')}</Label>
            <Select 
              value={pageFilters.per_page?.toString() || "10"} 
              onValueChange={(value) => {
                const params: any = { page: 1, per_page: parseInt(value) };
                
                if (searchTerm) {
                  params.search = searchTerm;
                }
                
                Object.entries(filterValues).forEach(([key, val]) => {
                  if (val && val !== '') {
                    params[key] = val;
                  }
                });
                
                router.get(route('plan-requests.index'), params, { preserveState: true, preserveScroll: true });
              }}
            >
              <SelectTrigger className="w-16 h-8">
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
        
        {showFilters && planRequestsConfig.filters && planRequestsConfig.filters.length > 0 && (
          <div className="w-full mt-3 p-4 bg-gray-50 border rounded-md">
            <div className="flex flex-wrap gap-4 items-end">
              {planRequestsConfig.filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label>{t(filter.label)}</Label>
                  <Select 
                    value={filterValues[filter.key] || ''} 
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t(`All ${filter.label}`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={planRequestsConfig.table.columns.map(col => ({
            ...col,
            label: t(col.label)
          }))}
          actions={filteredActions}
          data={planRequests?.data || []}
          from={planRequests?.from || 1}
          onAction={handleAction}
          permissions={permissions}
          entityPermissions={planRequestsConfig.entity.permissions}
        />

        <Pagination
          links={planRequests?.links}
          from={planRequests?.from}
          to={planRequests?.to}
          total={planRequests?.total}
          entityName="demandes de forfait"
          className="mt-2 border-t rounded-none border-x-0 border-b-0"
        />
      </div>
    </PageTemplate>
  );
}