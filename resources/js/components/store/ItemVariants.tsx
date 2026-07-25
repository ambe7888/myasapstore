import React from 'react';

interface ItemVariantsProps {
  variants?: any;
  className?: string;
}

export default function ItemVariants({ variants, className = "text-xs text-gray-500 mt-1" }: ItemVariantsProps) {
  if (!variants) return null;

  let parsedVariants: Record<string, string> = {};

  try {
    if (typeof variants === 'string') {
      parsedVariants = JSON.parse(variants);
    } else if (typeof variants === 'object' && variants !== null) {
      if (Array.isArray(variants)) {
        variants.forEach((item: any) => {
          if (item && typeof item === 'object') {
            if (item.name && item.value) {
              parsedVariants[item.name] = item.value;
            } else if (item.key && item.value) {
              parsedVariants[item.key] = item.value;
            }
          }
        });
      } else {
        parsedVariants = variants;
      }
    }
  } catch (e) {
    return null;
  }

  const entries = Object.entries(parsedVariants).filter(([key, val]) => key && val !== undefined && val !== null && val !== '');

  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {entries.map(([key, value]) => (
        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
          {key}: {String(value)}
        </span>
      ))}
    </div>
  );
}
