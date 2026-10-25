import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CategoryOption {
  id: number | string;
  name: string;
}

interface CategoryMultiSelectProps {
  categories: CategoryOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreate?: () => void;
}

export default function CategoryMultiSelect({ categories, value, onChange, onCreate }: CategoryMultiSelectProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const options = (categories || []).map((category) => ({ id: String(category.id), name: category.name }));
  const selected = value.map((id) => options.find((option) => option.id === id)).filter(Boolean) as { id: string; name: string }[];
  const visible = options.filter((option) => option.name.toLowerCase().includes(search.trim().toLowerCase()));

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="flex-1 justify-between font-normal">
              <span className="truncate">
                {selected.length > 0
                  ? `${selected.length} ${selected.length > 1 ? t('catégories sélectionnées') : t('catégorie sélectionnée')}`
                  : t('Select category')}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Rechercher une catégorie...')}
              className="mb-2 h-8"
            />
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {visible.length === 0 && (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">{t('Aucune catégorie trouvée')}</p>
              )}
              {visible.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox checked={value.includes(option.id)} onCheckedChange={() => toggle(option.id)} />
                  <span className="truncate">{option.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {onCreate && (
          <Button type="button" variant="outline" size="icon" onClick={onCreate} title={t('Créer une catégorie')}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((option, index) => (
            <Badge key={option.id} variant={index === 0 ? 'default' : 'secondary'} className="gap-1 pr-1">
              {option.name}
              <button
                type="button"
                onClick={() => toggle(option.id)}
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={t('Retirer')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {selected.length > 1 && (
        <p className="text-xs text-muted-foreground">{t('La première catégorie est la catégorie principale du produit.')}</p>
      )}
    </div>
  );
}
