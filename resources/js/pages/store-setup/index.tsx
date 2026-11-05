import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Plus, Rocket, Store as StoreIcon, Tag, Truck, Wallet, Palette, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import MediaLibraryButton from '@/components/MediaLibraryButton';
import { getImageUrl } from '@/utils/image-helper';
import { getStoreThemes } from '@/data/storeThemes';

interface Props {
  store: { id: number; name: string; slug: string; phone: string | null; theme: string; logo: string };
  availableThemes: string[] | null;
  existingCategories: string[];
  cod: boolean;
}

interface Zone { name: string; cost: string; delivery_time: string }

// Neutral on purpose: sellers can sell anything, so no product-type-specific wording.
const CATEGORY_SUGGESTIONS = [
  'Nouveautés', 'Promotions', 'Vêtements', 'Chaussures', 'Sacs', 'Accessoires', 'Bijoux',
  'Beauté & soins', 'Santé & bien-être', 'Électronique', 'Maison & déco', 'Alimentation',
  'Enfants & bébés', 'Sport & loisirs',
];

const ZONE_PRESETS: Zone[] = [
  { name: 'Ville principale', cost: '0', delivery_time: 'Sous 24h' },
  { name: 'Périphérie', cost: '1000', delivery_time: '24 à 48h' },
  { name: 'Intérieur du pays', cost: '2000', delivery_time: '2 à 4 jours' },
];

const STEPS = [
  { key: 'store', label: 'Boutique', icon: StoreIcon },
  { key: 'categories', label: 'Catégories', icon: Tag },
  { key: 'shipping', label: 'Livraison', icon: Truck },
  { key: 'payment', label: 'Paiement', icon: Wallet },
  { key: 'theme', label: 'Thème', icon: Palette },
];

export default function StoreSetup({ store, availableThemes, existingCategories, cod }: Props) {
  const { errors } = usePage().props as any;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Meta Pixel conversion events (only active when the platform pixel is installed).
  const track = (event: string, custom = false) => {
    try { (window as any).fbq?.(custom ? 'trackCustom' : 'track', event); } catch { /* ignore */ }
  };
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('fb_reg_tracked')) {
        track('CompleteRegistration');
        sessionStorage.setItem('fb_reg_tracked', '1');
      }
    } catch { /* ignore */ }
  }, []);

  const [name, setName] = useState(store.name);
  const [phone, setPhone] = useState(store.phone || '');
  const [logo, setLogo] = useState(store.logo && !store.logo.endsWith('/media/logo.png') ? store.logo : '');
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [zones, setZones] = useState<Zone[]>([ZONE_PRESETS[0]]);
  const [codEnabled, setCodEnabled] = useState(true);
  const [theme, setTheme] = useState(store.theme);

  const themes = getStoreThemes().filter(t => availableThemes === null || availableThemes.includes(t.id));
  const taken = existingCategories.map(c => c.toLowerCase());

  const toggleCategory = (c: string) =>
    setCategories(prev => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));

  const addCustomCategory = () => {
    const c = customCategory.trim();
    if (c && !categories.some(x => x.toLowerCase() === c.toLowerCase())) setCategories(prev => [...prev, c]);
    setCustomCategory('');
  };

  const updateZone = (i: number, key: keyof Zone, value: string) =>
    setZones(prev => prev.map((z, j) => (j === i ? { ...z, [key]: value } : z)));

  const canNext = step !== 0 || name.trim().length > 0;
  const last = step === STEPS.length - 1;

  const finish = () => {
    track('StoreSetupCompleted', true);
    setSaving(true);
    router.post(route('store-setup.complete'), {
      store_name: name,
      phone,
      logo,
      theme,
      categories,
      shipping: zones.filter(z => z.name.trim()),
      cod: codEnabled,
    } as any, { onFinish: () => setSaving(false) });
  };

  const skip = () => router.post(route('store-setup.skip'));

  return (
    <>
      <Head title="Configuration de votre boutique" />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Bienvenue ! Configurons votre boutique</h1>
            <p className="text-sm text-slate-500 mt-1">5 petites étapes, 2 minutes. Vous pourrez tout modifier plus tard.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-emerald-500 border-emerald-500 text-white'
                        : active ? 'bg-violet-600 border-violet-600 text-white'
                        : 'bg-white border-slate-200 text-slate-400'}`}>
                      {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-[11px] font-medium hidden sm:block ${active ? 'text-violet-700' : 'text-slate-400'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8">
            {/* Step 1: store identity */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Votre boutique</h2>
                  <p className="text-sm text-slate-500">Le nom et le logo que vos clients verront.</p>
                </div>
                <div className="space-y-2">
                  <Label>Nom de la boutique *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Ma Boutique" />
                </div>
                <div className="space-y-2">
                  <Label>Numéro WhatsApp / téléphone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : +225 07 00 00 00 00" />
                </div>
                <div className="space-y-2">
                  <Label>Logo de la boutique</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {logo ? <img src={getImageUrl(logo)} alt="Logo" className="w-full h-full object-contain" /> : <StoreIcon className="h-8 w-8 text-slate-300" />}
                    </div>
                    <MediaLibraryButton value={logo} onSelect={(url: string) => setLogo(url)} label="Choisir un logo" />
                  </div>
                  <p className="text-xs text-slate-400">Facultatif — vous pourrez l'ajouter plus tard.</p>
                </div>
              </div>
            )}

            {/* Step 2: categories */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Vos catégories</h2>
                  <p className="text-sm text-slate-500">Touchez celles qui correspondent à ce que vous vendez, ou ajoutez les vôtres.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_SUGGESTIONS.filter(c => !taken.includes(c.toLowerCase())).map(c => {
                    const on = categories.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => toggleCategory(c)}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium border-2 transition-all ${on ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {on && <Check className="inline h-3.5 w-3.5 mr-1" />}{c}
                      </button>
                    );
                  })}
                  {categories.filter(c => !CATEGORY_SUGGESTIONS.includes(c)).map(c => (
                    <button key={c} type="button" onClick={() => toggleCategory(c)}
                      className="px-3.5 py-2 rounded-full text-sm font-medium border-2 border-violet-500 bg-violet-50 text-violet-700 flex items-center gap-1">
                      {c} <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Ajouter une autre catégorie"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }} />
                  <Button type="button" variant="outline" onClick={addCustomCategory}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: shipping */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Zones de livraison</h2>
                  <p className="text-sm text-slate-500">Où livrez-vous et à quel prix ? (0 = livraison gratuite)</p>
                </div>
                <div className="space-y-3">
                  {zones.map((z, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input value={z.name} onChange={e => updateZone(i, 'name', e.target.value)} placeholder="Zone (ex : Ville principale)" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => setZones(prev => prev.filter((_, j) => j !== i))}>
                          <X className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" min={0} value={z.cost} onChange={e => updateZone(i, 'cost', e.target.value)} placeholder="Frais de livraison" />
                        <Input value={z.delivery_time} onChange={e => updateZone(i, 'delivery_time', e.target.value)} placeholder="Délai (ex : 24h)" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ZONE_PRESETS.filter(p => !zones.some(z => z.name === p.name)).map(p => (
                    <Button key={p.name} type="button" variant="outline" size="sm" onClick={() => setZones(prev => [...prev, p])}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> {p.name}
                    </Button>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setZones(prev => [...prev, { name: '', cost: '0', delivery_time: '' }])}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Autre zone
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: payment */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Paiement</h2>
                  <p className="text-sm text-slate-500">Comment vos clients vous paient-ils ?</p>
                </div>
                <button type="button" onClick={() => setCodEnabled(v => !v)}
                  className={`w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${codEnabled ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  <div>
                    <p className="font-semibold text-slate-900">💵 Paiement à la livraison</p>
                    <p className="text-sm text-slate-500">Le client paie en espèces quand il reçoit sa commande. Idéal pour démarrer.</p>
                  </div>
                  <div className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ml-3 ${codEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${codEnabled ? 'translate-x-5' : ''}`} />
                  </div>
                </button>
                <p className="text-xs text-slate-400">Mobile Money, carte bancaire et autres moyens se configurent ensuite dans Paramètres → Paiement.</p>
              </div>
            )}

            {/* Step 5: theme */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Choisissez votre thème</h2>
                  <p className="text-sm text-slate-500">L'apparence de votre boutique. Changeable à tout moment.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[28rem] overflow-y-auto pr-1">
                  {themes.map(t => (
                    <button key={t.id} type="button" onClick={() => setTheme(t.id)}
                      className={`text-left rounded-xl border-2 overflow-hidden transition-all ${theme === t.id ? 'border-violet-500 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>
                      <div className="relative aspect-[4/3] bg-slate-100">
                        <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/300x225?text=${encodeURIComponent(t.name)}`; }} />
                        {theme === t.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <p className="px-3 py-2 text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors && Object.keys(errors).length > 0 && (
              <div className="mt-4 p-3 text-sm text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                {Object.values(errors)[0] as string}
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              {last ? (
                <Button type="button" onClick={finish} disabled={saving} size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  <Rocket className="h-5 w-5" /> {saving ? 'Création…' : 'Terminer et ouvrir ma boutique'}
                </Button>
              ) : (
                <Button type="button" disabled={!canNext} onClick={() => setStep(s => s + 1)} className="gap-1">
                  Continuer <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="button" onClick={skip} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Passer la configuration, je le ferai plus tard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
