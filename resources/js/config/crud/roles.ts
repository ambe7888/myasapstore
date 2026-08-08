// config/crud/roles.ts
import { CrudConfig } from '@/types/crud';
import { columnRenderers } from '@/utils/columnRenderers';
import { t } from '@/utils/i18n';

export const rolesConfig: CrudConfig = {
  entity: {
    name: 'roles',
    endpoint: route('roles.index'),
    permissions: {
      view: 'view-roles',
      create: 'create-roles',
      edit: 'edit-roles',
      delete: 'delete-roles'
    }
  },
  modalSize: '5xl',
  title: t('Rôles & Permissions'),
  description: t('Gérez les rôles des utilisateurs et leurs autorisations d\'accès'),
  table: {
    columns: [
      { key: 'label', label: t('Nom du rôle'), sortable: true },
      { key: 'name', label: t('Identifiant (Slug)'), sortable: true },
      { key: 'description', label: t('Description') },
      { 
        key: 'creator.name', 
        label: t('Créé par'), 
        render: (value, row) => row.creator?.name || t('Système')
      },
      { 
        key: 'created_at', 
        label: t('Date de création'), 
        sortable: true, 
        render: columnRenderers.date() 
      }
      // Permissions column will be added dynamically in the Roles component
    ],
    actions: [
      { 
        label: t('Voir'), 
        icon: 'Eye', 
        action: 'view', 
        className: 'text-blue-500',
        requiredPermission: 'view-roles'
      },
      { 
        label: t('Modifier'), 
        icon: 'Edit', 
        action: 'edit', 
        className: 'text-amber-500',
        requiredPermission: 'edit-roles'
      },
      { 
        label: t('Supprimer'), 
        icon: 'Trash2', 
        action: 'delete', 
        className: 'text-red-500',
        requiredPermission: 'delete-roles',
        condition: (row) => !row.is_system_role
      }
    ]
  },
  filters: [],
  form: {
    fields: [
      { name: 'label', label: t('Nom du rôle'), type: 'text', required: true },
      { name: 'description', label: t('Description'), type: 'textarea' }
      // Permissions field will be added dynamically in the Roles component
    ]
  }
};