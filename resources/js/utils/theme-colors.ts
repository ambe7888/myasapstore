/**
 * Store.primary_color holds a Tailwind palette preset name (e.g. "rose", "slate"),
 * not a CSS color value — it is only meant to be used as the `data-theme` attribute
 * that activates the matching palette in themes.css. Passing it directly to an inline
 * `style={{ backgroundColor: ... }}` is invalid CSS and gets silently dropped by the
 * browser. Use this to resolve it to the preset's representative hex color instead.
 */
const PRESET_HEX: Record<string, string> = {
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
};

export function resolveThemeColor(presetName?: string | null): string | undefined {
  if (!presetName) return undefined;
  return PRESET_HEX[presetName];
}
