import React from 'react';
import {
  Layout, ShoppingBag, CheckCircle, MessageSquare, Clock, PlayCircle,
  Type, Image, HelpCircle, Shield, Award, Tag, MousePointer, Minus,
  Split
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, React.FC<any>> = {
  layout: Layout,
  'shopping-bag': ShoppingBag,
  'check-circle': CheckCircle,
  'message-square': MessageSquare,
  clock: Clock,
  'play-circle': PlayCircle,
  type: Type,
  image: Image,
  'help-circle': HelpCircle,
  shield: Shield,
  award: Award,
  tag: Tag,
  'mouse-pointer': MousePointer,
  minus: Minus,
  'separator-horizontal': Split,
};

const CATEGORY_ORDER = ['header', 'product', 'content', 'social', 'urgency', 'media', 'conversion', 'layout'];
const CATEGORY_LABELS: Record<string, string> = {
  header: 'Header',
  product: 'Product',
  content: 'Content',
  social: 'Social Proof',
  urgency: 'Urgency',
  media: 'Media',
  conversion: 'Conversion',
  layout: 'Layout',
};

interface Props {
  blockTypes: Record<string, { label: string; icon: string; category: string }>;
  onAdd: (type: string) => void;
}

export default function FunnelBlockPalette({ blockTypes, onAdd }: Props) {
  const { t } = useTranslation();

  // Group by category
  const grouped: Record<string, Array<{ type: string; label: string; icon: string }>> = {};
  Object.entries(blockTypes).forEach(([type, info]) => {
    if (!grouped[info.category]) grouped[info.category] = [];
    grouped[info.category].push({ type, ...info });
  });

  return (
    <div className="p-3 space-y-4">
      {CATEGORY_ORDER.filter(cat => grouped[cat]).map(category => (
        <div key={category}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
            {t(CATEGORY_LABELS[category] || category)}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {grouped[category].map(({ type, label, icon }) => {
              const Icon = ICON_MAP[icon] || Layout;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onAdd(type)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all text-slate-600 group"
                >
                  <Icon className="h-5 w-5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                  <span className="text-[11px] font-medium text-center leading-tight">{t(label)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
