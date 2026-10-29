import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors } from '../tokens/colors';

/** All tiers support at least 200% resizing; layouts must still be audited. */
export const typography = {
  body: { fontSize: 16, maximumScale: 3, role: 'text' },
  caption: { fontSize: 14, maximumScale: 3, role: 'text' },
  hero: { fontSize: 32, maximumScale: 2, role: 'header' },
  compactNav: { fontSize: 16, maximumScale: 2, role: 'text' },
} as const;

export type TypographyTier = keyof typeof typography;

/** Scaling, truncation and semantic roles belong to the primitive, not callers. */
export type ScalableTextProps = Omit<
  TextProps,
  | 'accessibilityRole'
  | 'role'
  | 'allowFontScaling'
  | 'maxFontSizeMultiplier'
  | 'adjustsFontSizeToFit'
  | 'numberOfLines'
  | 'ellipsizeMode'
> & {
  tier: TypographyTier;
  maxFontSizeMultiplier?: 2 | 2.5 | 3;
};

/** Wrapping text with OS Dynamic Type enabled and tier-specific scaling caps. */
export const ScalableText = React.forwardRef<
  React.ElementRef<typeof Text>,
  ScalableTextProps
>(({ tier, maxFontSizeMultiplier, style, ...rest }, ref) => {
  const token = typography[tier];
  const requestedScale = maxFontSizeMultiplier ?? token.maximumScale;
  const maximumScale = Number.isFinite(requestedScale)
    ? Math.max(2, Math.min(requestedScale, token.maximumScale))
    : token.maximumScale;

  return (
    <Text
      {...rest}
      ref={ref}
      accessibilityRole={token.role}
      allowFontScaling
      maxFontSizeMultiplier={maximumScale}
      adjustsFontSizeToFit={false}
      numberOfLines={0}
      style={[{ color: colors.light.text, fontSize: token.fontSize, flexShrink: 1 }, style]}
    />
  );
});

ScalableText.displayName = 'ScalableText';
