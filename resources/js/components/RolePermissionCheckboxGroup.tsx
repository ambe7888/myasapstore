// components/RolePermissionCheckboxGroup.tsx
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { IndeterminateCheckbox } from '@/components/ui/indeterminate-checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface Permission {
  id: string | number;
  name: string;
  label: string;
}

interface RolePermissionCheckboxGroupProps {
  permissions: Record<string, any[]>;
  selectedPermissions: any;
  onChange: (permissions: string[]) => void;
}

export function RolePermissionCheckboxGroup({
  permissions,
  selectedPermissions,
  onChange
}: RolePermissionCheckboxGroupProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  
  // Use permissions directly as they are already filtered by backend
  const filteredPermissions = permissions;
  
  // Get all permission IDs
  const getAllPermissionIds = (): string[] => {
    const allIds: string[] = [];
    Object.values(filteredPermissions).forEach(group => {
      group.forEach(permission => {
        allIds.push(permission.id.toString());
      });
    });
    return allIds;
  };
  
  // Get all permission IDs for a specific module
  const getModulePermissionIds = (module: string): string[] => {
    return filteredPermissions[module]?.map(permission => permission.id.toString()) || [];
  };
  
  // Initialize selected permissions
  useEffect(() => {
    if (!selectedPermissions || Object.keys(filteredPermissions).length === 0) {
      setSelected([]);
      return;
    }
    
    try {
      const nameMap = {};
      
      Object.values(filteredPermissions).forEach(group => {
        group.forEach(permission => {
          nameMap[permission.name] = permission.id.toString();
        });
      });
      
      let processedPermissions: string[] = [];
      
      if (Array.isArray(selectedPermissions)) {
        processedPermissions = selectedPermissions.map(p => {
          if (typeof p === 'object' && p !== null) {
            if ('id' in p) return p.id.toString();
            if ('name' in p) return nameMap[p.name] || p.name;
          }
          return nameMap[String(p)] || String(p);
        }).filter(Boolean);
      } else if (typeof selectedPermissions === 'object' && selectedPermissions !== null) {
        if ('permissions' in selectedPermissions && Array.isArray(selectedPermissions.permissions)) {
          processedPermissions = selectedPermissions.permissions.map(p => {
            if (typeof p === 'object' && p !== null) {
              if ('id' in p) return p.id.toString();
              if ('name' in p) return nameMap[p.name] || p.name;
            }
            return nameMap[String(p)] || String(p);
          }).filter(Boolean);
        }
      }
      
      setSelected(processedPermissions);
    } catch (error) {
      console.error('Error processing permissions:', error);
      setSelected([]);
    }
  }, [selectedPermissions]);
  
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selected, permissionId]
      : selected.filter(id => id !== permissionId);
    
    setSelected(newSelected);
    updateParent(newSelected);
  };
  
  const handleModuleChange = (module: string, checked: boolean) => {
    const modulePermissionIds = getModulePermissionIds(module);
    
    let newSelected: string[];
    
    if (checked) {
      const permissionsToAdd = modulePermissionIds.filter(id => !selected.includes(id));
      newSelected = [...selected, ...permissionsToAdd];
    } else {
      newSelected = selected.filter(id => !modulePermissionIds.includes(id));
    }
    
    setSelected(newSelected);
    updateParent(newSelected);
  };
  
  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? getAllPermissionIds() : [];
    setSelected(newSelected);
    updateParent(newSelected);
  };
  
  const updateParent = (newSelected: string[]) => {
    const idToNameMap = {};
    
    Object.values(filteredPermissions).forEach(group => {
      group.forEach(permission => {
        idToNameMap[permission.id.toString()] = permission.name;
      });
    });
    
    const permissionNames = newSelected.map(id => {
      return idToNameMap[id] || id;
    }).filter(name => !!name);
    
    onChange(permissionNames);
  };
  
  // Check if all permissions are selected
  const isAllSelected = selected.length === getAllPermissionIds().length && getAllPermissionIds().length > 0;
  
  // Check if all permissions in a module are selected
  const isModuleSelected = (module: string): boolean => {
    const modulePermissionIds = getModulePermissionIds(module);
    return modulePermissionIds.every(id => selected.includes(id)) && modulePermissionIds.length > 0;
  };
  
  // Check if some but not all permissions in a module are selected
  const isModuleIndeterminate = (module: string): boolean => {
    const modulePermissionIds = getModulePermissionIds(module);
    const selectedCount = modulePermissionIds.filter(id => selected.includes(id)).length;
    return selectedCount > 0 && selectedCount < modulePermissionIds.length;
  };
  
  const getModuleTitle = (module: string) => {
    const map: Record<string, string> = {
      products: 'Gestion des Produits',
      categories: 'Catégories de Produits',
      orders: 'Commandes & Ventes',
      customers: 'Clients',
      stores: 'Boutiques',
      shipping: 'Zone d\'expédition',
      roles: 'Rôles & Permissions',
      users: 'Utilisateurs & Équipe',
      coupons: 'Système de Coupons',
      blog: 'Articles & Blog',
      reviews: 'Avis & Notes',
      analytics: 'Analytique & Rapports',
      settings: 'Paramètres généraux',
      pos: 'Caisse Point de Vente (POS)',
      funnels: 'Tunnels de Vente',
      'email-templates': 'Modèles d\'e-mails',
      'notification-templates': 'Modèles de notifications',
    };
    return t(map[module.toLowerCase()] || module);
  };

  const getPermissionLabel = (permission: Permission) => {
    const raw = permission.label || permission.name;
    if (!raw) return '';
    const s = raw.toLowerCase();
    
    // Direct matches
    if (s.includes('manage-products') || s.includes('manage_products')) return t('Gérer les produits');
    if (s.includes('view-products') || s.includes('view_products')) return t('Consulter les produits');
    if (s.includes('create-products') || s.includes('create_products')) return t('Créer des produits');
    if (s.includes('edit-products') || s.includes('edit_products')) return t('Modifier des produits');
    if (s.includes('delete-products') || s.includes('delete_products')) return t('Supprimer des produits');
    if (s.includes('export-products') || s.includes('export_products')) return t('Exporter les produits');
    
    if (s.includes('manage-orders') || s.includes('manage_orders')) return t('Gérer les commandes');
    if (s.includes('view-orders') || s.includes('view_orders')) return t('Consulter les commandes');
    if (s.includes('edit-orders') || s.includes('edit_orders')) return t('Modifier les commandes');

    if (s.includes('manage-customers') || s.includes('manage_customers')) return t('Gérer les clients');
    if (s.includes('manage-shipping') || s.includes('manage_shipping')) return t('Gérer la zone d\'expédition');
    if (s.includes('manage-roles') || s.includes('manage_roles')) return t('Gérer les rôles & permissions');
    if (s.includes('manage-users') || s.includes('manage_users')) return t('Gérer les utilisateurs');
    if (s.includes('manage-stores') || s.includes('manage_stores')) return t('Gérer les boutiques');

    // General pattern matching
    if (s.startsWith('manage-')) return t('Gérer {{item}}', { item: s.replace('manage-', '') });
    if (s.startsWith('view-')) return t('Voir {{item}}', { item: s.replace('view-', '') });
    if (s.startsWith('create-')) return t('Créer {{item}}', { item: s.replace('create-', '') });
    if (s.startsWith('edit-')) return t('Modifier {{item}}', { item: s.replace('edit-', '') });
    if (s.startsWith('delete-')) return t('Supprimer {{item}}', { item: s.replace('delete-', '') });

    return t(raw);
  };

  return (
    <div className="space-y-6">
      {/* Select All Checkbox */}
      <div className="border rounded-xl shadow-xs p-3.5 bg-gray-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IndeterminateCheckbox
              id="select-all-permissions-checkbox"
              checked={isAllSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
            />
            <Label htmlFor="select-all-permissions-checkbox" className="font-semibold text-gray-900 text-sm">
              {t("Tout sélectionner")}
            </Label>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {selected.length} {t("sur")} {getAllPermissionIds().length} {t("sélectionné(s)")}
          </div>
        </div>
      </div>
      
      {/* Module Permissions */}
      <div className="space-y-4">
        {Object.entries(filteredPermissions).map(([module, modulePermissions]) => (
          <div key={module} className="border border-gray-200 rounded-xl shadow-xs overflow-hidden bg-white">
            {/* Module Header */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50/90 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <IndeterminateCheckbox
                  id={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`}
                  checked={isModuleSelected(module)}
                  indeterminate={isModuleIndeterminate(module)}
                  onCheckedChange={(checked) => handleModuleChange(module, checked === true)}
                />
                <Label htmlFor={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`} className="font-semibold text-gray-900 text-sm">
                  {getModuleTitle(module)}
                </Label>
              </div>
              <div className="text-xs text-gray-500">
                {modulePermissions.filter(p => selected.includes(p.id.toString())).length} {t("sur")} {modulePermissions.length} {t("sélectionné(s)")}
              </div>
            </div>
            
            {/* Individual Permissions */}
            <div className="p-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {modulePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`}
                      checked={selected.includes(permission.id.toString()) || selected.includes(permission.name)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(permission.id.toString(), checked === true)
                      }
                    />
                    <Label htmlFor={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`} className="text-xs font-medium text-gray-700 truncate cursor-pointer">
                      {getPermissionLabel(permission)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}