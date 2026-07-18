import React, { useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import {
  Save, Eye, EyeOff, Globe, ArrowLeft, Plus, Trash2,
  ChevronUp, ChevronDown, Settings, BarChart2, Copy,
  ExternalLink, CheckCircle, AlertCircle, Smartphone, Monitor
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import FunnelBlockEditor from '@/components/funnel/FunnelBlockEditor';
import FunnelBlockPreview from '@/components/funnel/FunnelBlockPreview';
import FunnelBlockPalette from '@/components/funnel/FunnelBlockPalette';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Block {
  id?: number;
  type: string;
  sort_order: number;
  is_visible: boolean;
  settings: Record<string, any>;
  _tempId?: string; // For newly added blocks before save
}

interface Funnel {
  id: number;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  seo_title: string;
  seo_description: string;
  custom_css: string;
  settings: Record<string, any>;
  views_count: number;
  clicks_count: number;
  orders_count: number;
  conversion_rate: number;
  public_url: string;
  blocks: Block[];
}

interface Props {
  store: { id: number; name: string; slug: string; theme: string };
  funnel: Funnel;
  product: any;
  block_types: Record<string, { label: string; icon: string; category: string }>;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

const generateTempId = () => `new_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FunnelBuilder({ store, funnel: initialFunnel, product, block_types }: Props) {
  const { t } = useTranslation();

  const [funnel, setFunnel]           = useState(initialFunnel);
  const [blocks, setBlocks]           = useState<Block[]>(
    initialFunnel.blocks.map(b => ({ ...b, _tempId: generateTempId() }))
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<'blocks' | 'settings' | 'analytics'>('blocks');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Block actions ────────────────────────────────────────────────────────

  const addBlock = (type: string) => {
    const maxOrder = blocks.reduce((max, b) => Math.max(max, b.sort_order), 0);
    const newBlock: Block = {
      type,
      sort_order: maxOrder + 1,
      is_visible: true,
      settings: {}, // server will provide defaults on first save
      _tempId: generateTempId(),
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock._tempId!);
    scheduleAutoSave([...blocks, newBlock]);
  };

  const updateBlock = (tempId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b =>
      (b._tempId === tempId) ? { ...b, ...updates } : b
    ));
    const updated = blocks.map(b => (b._tempId === tempId) ? { ...b, ...updates } : b);
    scheduleAutoSave(updated);
  };

  const moveBlock = (tempId: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b._tempId === tempId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];

    // Reassign sort_order
    const reordered = newBlocks.map((b, i) => ({ ...b, sort_order: i + 1 }));
    setBlocks(reordered);
    scheduleAutoSave(reordered);
  };

  const deleteBlock = (tempId: string) => {
    if (!confirm(t('Remove this block?'))) return;
    const newBlocks = blocks.filter(b => b._tempId !== tempId)
      .map((b, i) => ({ ...b, sort_order: i + 1 }));
    setBlocks(newBlocks);
    if (selectedBlockId === tempId) setSelectedBlockId(null);
    scheduleAutoSave(newBlocks);
  };

  const toggleBlockVisibility = (tempId: string) => {
    const updated = blocks.map(b =>
      b._tempId === tempId ? { ...b, is_visible: !b.is_visible } : b
    );
    setBlocks(updated);
    scheduleAutoSave(updated);
  };

  // ─── Auto-save ────────────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback((currentBlocks: Block[]) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      doSave(currentBlocks, false);
    }, 2500);
  }, [funnel]);

  const doSave = (currentBlocks: Block[], showFeedback = true) => {
    if (showFeedback) setSaving(true);

    router.put(route('stores.funnels.update', [store.id, funnel.id]), {
      name:            funnel.name,
      slug:            funnel.slug,
      seo_title:       funnel.seo_title,
      seo_description: funnel.seo_description,
      custom_css:      funnel.custom_css,
      settings:        funnel.settings,
      blocks:          currentBlocks.map(b => ({
        id:         b.id,
        type:       b.type,
        sort_order: b.sort_order,
        is_visible: b.is_visible,
        settings:   b.settings,
      })),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        if (showFeedback) { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }
      },
      onError: () => { if (showFeedback) setSaving(false); },
    });
  };

  const handleSave = () => doSave(blocks, true);

  // ─── Publish ──────────────────────────────────────────────────────────────

  const handlePublish = () => {
    setPublishing(true);
    router.put(route('stores.funnels.publish', [store.id, funnel.id]), {}, {
      preserveScroll: true,
      onSuccess: () => {
        setFunnel(prev => ({
          ...prev,
          status: prev.status === 'published' ? 'draft' : 'published',
        }));
        setPublishing(false);
      },
      onError: () => setPublishing(false),
    });
  };

  // ─── Selected block ───────────────────────────────────────────────────────

  const selectedBlock = blocks.find(b => b._tempId === selectedBlockId) || null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Link href={route('stores.funnels.index', store.id)}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
              <ArrowLeft className="h-4 w-4" />
              {t('Back')}
            </Button>
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <Input
            className="h-8 w-48 text-sm font-semibold border-0 bg-transparent focus:bg-white focus:border focus:border-slate-200 px-2"
            value={funnel.name}
            onChange={e => setFunnel(prev => ({ ...prev, name: e.target.value }))}
          />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            funnel.status === 'published'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {funnel.status === 'published' ? t('Published') : t('Draft')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Save */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5"
          >
            {saved ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
            {saving ? t('Saving...') : saved ? t('Saved!') : t('Save')}
          </Button>

          {/* Publish */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
            className={`gap-1.5 ${
              funnel.status === 'published'
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            {funnel.status === 'published' ? t('Unpublish') : t('Publish')}
          </Button>

          {funnel.status === 'published' && (
            <a href={funnel.public_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 text-violet-600">
                <ExternalLink className="h-4 w-4" />
                {t('View')}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* ── Main 3-Panel Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Block Palette + Tabs */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {['blocks', 'settings', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-violet-700 border-b-2 border-violet-600 bg-violet-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'blocks' ? t('Blocks') : tab === 'settings' ? t('Settings') : t('Stats')}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'blocks' && (
              <FunnelBlockPalette blockTypes={block_types} onAdd={addBlock} />
            )}
            {activeTab === 'settings' && (
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('Page Background')}</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-10 h-8 rounded cursor-pointer border border-slate-200"
                      value={funnel.settings?.bg_color || '#ffffff'}
                      onChange={e => setFunnel(prev => ({ ...prev, settings: { ...prev.settings, bg_color: e.target.value } }))}
                    />
                    <Input
                      className="h-8 text-xs font-mono"
                      value={funnel.settings?.bg_color || '#ffffff'}
                      onChange={e => setFunnel(prev => ({ ...prev, settings: { ...prev.settings, bg_color: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('Max Width')}</Label>
                  <select
                    className="w-full h-8 text-xs rounded-md border border-slate-200 px-2"
                    value={funnel.settings?.max_width || '800px'}
                    onChange={e => setFunnel(prev => ({ ...prev, settings: { ...prev.settings, max_width: e.target.value } }))}
                  >
                    <option value="600px">600px (Narrow)</option>
                    <option value="800px">800px (Default)</option>
                    <option value="1000px">1000px (Wide)</option>
                    <option value="100%">Full width</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('SEO Title')}</Label>
                  <Input className="h-8 text-xs" value={funnel.seo_title || ''} onChange={e => setFunnel(prev => ({ ...prev, seo_title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('SEO Description')}</Label>
                  <textarea
                    rows={3}
                    className="w-full text-xs rounded-md border border-slate-200 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-200"
                    value={funnel.seo_description || ''}
                    onChange={e => setFunnel(prev => ({ ...prev, seo_description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('URL Slug')}</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={funnel.slug}
                    onChange={e => setFunnel(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('Custom CSS')}</Label>
                  <textarea
                    rows={5}
                    className="w-full text-xs rounded-md border border-slate-200 p-2 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-200"
                    value={funnel.custom_css || ''}
                    onChange={e => setFunnel(prev => ({ ...prev, custom_css: e.target.value }))}
                  />
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('Views'), value: funnel.views_count, color: 'violet' },
                    { label: t('Clicks'), value: funnel.clicks_count, color: 'blue' },
                    { label: t('Orders'), value: funnel.orders_count, color: 'emerald' },
                    { label: t('Conv. Rate'), value: `${funnel.conversion_rate}%`, color: 'amber' },
                  ].map(stat => (
                    <div key={stat.label} className={`bg-${stat.color}-50 rounded-xl p-3 text-center border border-${stat.color}-100`}>
                      <div className={`text-xl font-bold text-${stat.color}-700`}>{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {funnel.status === 'published' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-semibold text-slate-600">{t('Share this funnel')}</p>
                    <div className="flex gap-1">
                      <Input className="h-7 text-xs font-mono" value={funnel.public_url} readOnly />
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigator.clipboard.writeText(funnel.public_url)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER — Block List + Preview */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-6 px-4 bg-slate-100">
          <div
            className="w-full shadow-xl rounded-xl overflow-hidden transition-all duration-300 bg-white"
            style={{
              maxWidth: previewMode === 'mobile' ? '390px' : (funnel.settings?.max_width || '800px'),
            }}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Plus className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">{t('Click a block type on the left to add it here')}</p>
              </div>
            ) : (
              blocks.map((block) => (
                <div
                  key={block._tempId}
                  onClick={() => setSelectedBlockId(block._tempId!)}
                  className={`relative group cursor-pointer transition-all ${
                    selectedBlockId === block._tempId
                      ? 'ring-2 ring-violet-500 ring-inset'
                      : 'hover:ring-1 hover:ring-violet-300 hover:ring-inset'
                  } ${!block.is_visible ? 'opacity-40' : ''}`}
                >
                  {/* Block controls overlay */}
                  <div className={`absolute top-2 right-2 z-10 flex gap-1 transition-opacity ${selectedBlockId === block._tempId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block._tempId!, 'up'); }}
                      className="p-1 bg-white rounded-md shadow-md text-slate-500 hover:text-violet-600 hover:shadow-lg transition-all"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block._tempId!, 'down'); }}
                      className="p-1 bg-white rounded-md shadow-md text-slate-500 hover:text-violet-600 hover:shadow-lg transition-all"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleBlockVisibility(block._tempId!); }}
                      className="p-1 bg-white rounded-md shadow-md text-slate-500 hover:text-blue-600 hover:shadow-lg transition-all"
                    >
                      {block.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteBlock(block._tempId!); }}
                      className="p-1 bg-white rounded-md shadow-md text-slate-500 hover:text-red-500 hover:shadow-lg transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Block type label */}
                  {selectedBlockId === block._tempId && (
                    <div className="absolute top-2 left-2 z-10 text-xs font-semibold bg-violet-600 text-white px-2 py-0.5 rounded-md shadow">
                      {block_types[block.type]?.label || block.type}
                    </div>
                  )}

                  {/* Block preview */}
                  <FunnelBlockPreview
                    block={block}
                    product={product}
                    isMobile={previewMode === 'mobile'}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT — Block Settings Panel */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          {selectedBlock ? (
            <>
              <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Settings className="h-4 w-4 text-violet-600" />
                <span className="font-semibold text-sm text-slate-800">
                  {block_types[selectedBlock.type]?.label || selectedBlock.type}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FunnelBlockEditor
                  key={selectedBlock._tempId}
                  block={selectedBlock}
                  product={product}
                  onChange={(updates) => updateBlock(selectedBlock._tempId!, { settings: updates })}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
              <Settings className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm font-medium">{t('Click a block to edit its settings')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
