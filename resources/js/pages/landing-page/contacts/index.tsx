import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { Pagination } from '@/components/pagination';
import { toast } from '@/components/custom-toast';

export default function ContactsIndex() {
  const { t } = useTranslation();
  const { contacts, filters: pageFilters = {} } = usePage().props as any;
  
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('landing-page.contacts.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    const params: any = { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1 
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('landing-page.contacts.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleDelete = (contact: any) => {
    setCurrentContact(contact);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting contact...'));
    router.delete(route('landing-page.contacts.destroy', currentContact.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
      },
      onError: () => {
        toast.dismiss();
        toast.error(t('Failed to delete contact'));
      }
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    window.location.href = route('landing-page.contacts.export') + '?' + params.toString();
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Landing Page') },
    { title: t('Contacts') }
  ];

  const pageActions = [
    {
      label: 'Export',
      icon: <Download className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => handleExport()
    }
  ];

  const columns = [
    { 
      key: '#', 
      label: t('#'),
      render: (value: any, row: any, index: number) => (
        <span className="font-medium text-gray-500">
          {((contacts?.current_page || 1) - 1) * (contacts?.per_page || 10) + index + 1}
        </span>
      )
    },
    { 
      key: 'name', 
      label: t('Name'),
      sortable: true,
      render: (value: string) => <div className="font-medium">{value}</div>
    },
    { 
      key: 'email', 
      label: t('Email'),
      sortable: true,
      render: (value: string) => <div>{value}</div>
    },
    { 
      key: 'subject', 
      label: t('Subject'),
      sortable: true,
      render: (value: string) => <div>{value}</div>
    },
    { 
      key: 'message', 
      label: t('Message'),
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'created_at', 
      label: t('Date'),
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <PageTemplate 
      title={t("Contacts")} 
      url="/landing-page/contacts"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Search contacts...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-1.5" />
                  {t("Search")}
                </Button>
              </form>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Label className="text-xs text-muted-foreground">{t("Per Page:")}</Label>
              <Select 
                value={pageFilters.per_page?.toString() || "10"} 
                onValueChange={(value) => {
                  const params: any = { page: 1, per_page: parseInt(value) };
                  
                  if (searchTerm) {
                    params.search = searchTerm;
                  }
                  
                  router.get(route('landing-page.contacts.index'), params, { preserveState: true, preserveScroll: true });
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && (
                        <span className="ml-1">
                          {pageFilters.sort_field === column.key ? (
                            pageFilters.sort_direction === 'asc' ? '↑' : '↓'
                          ) : ''}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-gray-500">
                  {t("Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts?.data?.map((contact: any) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  {columns.map((column, columnIndex) => (
                    <td key={`${contact.id}-${column.key}`} className="px-4 py-3">
                      {column.render ? column.render(contact[column.key], contact, contacts?.data?.indexOf(contact)) : contact[column.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(contact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!contacts?.data || contacts.data.length === 0) && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    {t("No contacts found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          links={contacts?.links}
          from={contacts?.from}
          to={contacts?.to}
          total={contacts?.total}
          entityName="contacts"
          className="mt-2 border-t rounded-none border-x-0 border-b-0"
        />
      </div>

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentContact?.name || ''}
        entityName="contact"
      />
    </PageTemplate>
  );
}