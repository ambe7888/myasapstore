import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  links: any[];
  from?: number;
  to?: number;
  total?: number;
  entityName?: string;
  className?: string;
}

export function Pagination({
  links = [],
  from = 0,
  to = 0,
  total = 0,
  entityName = 'éléments',
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  if (!links || links.length <= 1) return null;

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${className}`}>
      <div className="text-xs text-gray-500 text-center sm:text-left">
        {t("Affichage de")} <span className="font-semibold text-gray-900">{from}</span> {t("à")} <span className="font-semibold text-gray-900">{to}</span> {t("sur")} <span className="font-semibold text-gray-900">{total}</span> {t(entityName)}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-1.5">
        {links.map((link: any, i: number) => {
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
  );
}
