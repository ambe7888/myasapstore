import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { getStoreThemes } from '@/data/storeThemes';
import { getImageUrl } from '@/utils/image-helper';

interface TemplatePreviewCardProps {
  template: {
    name: string;
    label?: string;
    category?: string;
    image?: string;
  };
  isSelected?: boolean;
  onClick?: () => void;
  previewButtonText?: string;
}

export default function TemplatePreviewCard({
  template,
  isSelected = false,
  onClick,
  previewButtonText = 'Aperçu'
}: TemplatePreviewCardProps) {
  const allThemes = getStoreThemes();
  const themeObj = allThemes.find(t => t.id === template.name) || {
    id: template.name,
    name: template.label || template.name.replace(/-/g, ' ').toUpperCase(),
    thumbnail: getImageUrl(template.image || `/storage/placeholder/themes/${template.name}.webp`),
    description: '',
    category: template.category || 'Général'
  };

  const imageUrl = themeObj.thumbnail || getImageUrl(`/storage/placeholder/themes/${template.name}.webp`);

  return (
    <div
      className={`border rounded-lg overflow-hidden cursor-pointer transition-all bg-white ${
        isSelected ? 'ring-2 ring-violet-600 border-violet-600 shadow-md' : 'hover:border-slate-400 hover:shadow'
      }`}
      onClick={onClick}
    >
      <div className="h-36 bg-slate-100 overflow-hidden relative group">
        <img
          src={imageUrl}
          alt={themeObj.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.webp')) {
              target.src = target.src.replace('.webp', '.png');
            } else {
              target.src = `https://placehold.co/400x250?text=${encodeURIComponent(themeObj.name)}`;
            }
          }}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-violet-600/30 z-10">
            <div className="rounded-full bg-violet-600 p-1.5 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-1">
          <h4 className="font-medium text-xs text-slate-900 truncate">{themeObj.name}</h4>
          {(template.category || (themeObj as any).category) && (
            <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] bg-violet-50 text-violet-700 font-medium capitalize flex-shrink-0">
              {template.category || (themeObj as any).category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}