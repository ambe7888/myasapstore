export interface VariantPreset {
  name: string;
  /** Lowercase, accent-free names that should also get these suggestions. */
  aliases: string[];
  values: string[];
}

export const VARIANT_PRESETS: VariantPreset[] = [
  { name: 'Taille', aliases: ['taille', 'size', 'tailles'], values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
  { name: 'Pointure', aliases: ['pointure', 'pointures'], values: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'] },
  {
    name: 'Couleur',
    aliases: ['couleur', 'couleurs', 'color', 'colour'],
    values: ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Rose', 'Violet', 'Gris', 'Marron', 'Beige', 'Doré', 'Argenté'],
  },
  { name: 'Poids', aliases: ['poids', 'weight'], values: ['100 g', '250 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg'] },
  { name: 'Volume', aliases: ['volume', 'contenance'], values: ['30 ml', '50 ml', '100 ml', '250 ml', '500 ml', '1 L', '2 L'] },
  { name: 'Matière', aliases: ['matiere', 'matieres', 'material'], values: ['Coton', 'Cuir', 'Laine', 'Polyester', 'Soie', 'Lin', 'Daim'] },
  { name: 'Capacité', aliases: ['capacite', 'stockage', 'memoire'], values: ['32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To'] },
  { name: 'Âge', aliases: ['age', 'ages'], values: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '3-4 ans', '5-6 ans', '7-8 ans', '9-10 ans'] },
  { name: 'Lot', aliases: ['lot', 'pack', 'quantite', 'conditionnement'], values: ['Lot de 1', 'Lot de 2', 'Lot de 3', 'Lot de 5', 'Lot de 10'] },
  { name: 'Dimensions', aliases: ['dimensions', 'dimension', 'format'], values: ['Petit', 'Moyen', 'Grand'] },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

export function findPresetForName(name: string): VariantPreset | undefined {
  const key = normalize(name || '');
  if (!key) return undefined;
  return VARIANT_PRESETS.find((preset) => normalize(preset.name) === key || preset.aliases.includes(key));
}
