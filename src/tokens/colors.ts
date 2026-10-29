/** Opaque sRGB colors; contrast guarantees apply only to the documented pairs. */
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    secondaryText: '#374151',
    action: '#005A9C',
    onAction: '#FFFFFF',
    danger: '#991B1B',
    success: '#166534',
    warning: '#713F12',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#FFFFFF',
    secondaryText: '#D1D5DB',
    action: '#93C5FD',
    onAction: '#111827',
    danger: '#FCA5A5',
    success: '#86EFAC',
    warning: '#FDE68A',
  },
} as const;

/** WCAG 2.x contrast thresholds (large text means 18pt or 14pt bold). */
export const contrastThresholds = {
  aaText: 4.5,
  aaaText: 7,
  aaLargeText: 3,
  aaaLargeText: 4.5,
  nonText: 3,
} as const;

/** Relative luminance per WCAG, without rounding away threshold failures. */
export function relativeLuminance(hex: string): number {
  if (hex.length !== 7 || !/^#[\da-f]{6}$/i.test(hex)) {
    throw new Error('Contrast calculations require opaque six-digit hex colors.');
  }
  const channel = (offset: number): number => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Contrast is symmetric; alpha, gradients and compositing are not supported. */
export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Explicit normal-text contracts, verified in CI. Status must also be conveyed
 * by text or an accessible label, never by color alone.
 */
export const contrastPairs = Object.entries(colors).flatMap(([theme, palette]) =>
  [
    { name: `${theme}.text`, foreground: palette.text, background: palette.background, minimum: 7 },
    { name: `${theme}.surfaceText`, foreground: palette.text, background: palette.surface, minimum: 7 },
    { name: `${theme}.secondaryText`, foreground: palette.secondaryText, background: palette.surface, minimum: 7 },
    { name: `${theme}.action`, foreground: palette.onAction, background: palette.action, minimum: 4.5 },
    ...(['danger', 'success', 'warning'] as const).map((status) => ({
      name: `${theme}.${status}`,
      foreground: palette[status],
      background: palette.background,
      minimum: 7,
    })),
  ],
);
