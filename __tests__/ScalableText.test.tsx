import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ScalableText, typography, type ScalableTextProps } from '../src/primitives/ScalableText';
import { colors } from '../src/tokens/colors';

describe('ScalableText', () => {
  it.each(Object.keys(typography) as (keyof typeof typography)[])(
    'supports at least 200%% text scaling without truncation for %s',
    (tier) => {
      const token = typography[tier];
      render(<ScalableText tier={tier}>A long sentence that must remain readable at large sizes.</ScalableText>);
      const text = screen.getByRole(token.role);
      expect(text).toHaveTextContent('A long sentence that must remain readable at large sizes.');
      expect(text.props.allowFontScaling).toBe(true);
      expect(text.props.maxFontSizeMultiplier).toBe(token.maximumScale);
      expect(text.props.maxFontSizeMultiplier).toBeGreaterThanOrEqual(2);
      expect(text.props.adjustsFontSizeToFit).toBe(false);
      expect(text.props.numberOfLines).toBe(0);
      expect(text.props.ellipsizeMode).toBeUndefined();
      expect(text).toHaveStyle({ color: colors.light.text, fontSize: token.fontSize, flexShrink: 1 });
    },
  );

  it.each<[keyof typeof typography, 2 | 2.5 | 3, number]>([
    ['body', 2, 2],
    ['body', 2.5, 2.5],
    ['caption', 3, 3],
    ['hero', 3, 2],
    ['compactNav', 2.5, 2],
  ])('caps %s requested scale %s at %s', (tier, scale, expected) => {
    render(<ScalableText tier={tier} maxFontSizeMultiplier={scale}>Readable</ScalableText>);
    expect(screen.getByText('Readable').props.maxFontSizeMultiplier).toBe(expected);
  });

  it.each([0, 1, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    'guards invalid runtime scale %s even for untyped consumers',
    (scale) => {
      const props = { tier: 'body', maxFontSizeMultiplier: scale } as ScalableTextProps;
      render(<ScalableText {...props}>Readable</ScalableText>);
      expect(screen.getByText('Readable').props.maxFontSizeMultiplier).toBe(
        Number.isFinite(scale) ? 2 : typography.body.maximumScale,
      );
    },
  );

  it('preserves caller styles, accessibility labels and other safe text props', () => {
    render(
      <ScalableText tier="hero" accessibilityLabel="Welcome heading" testID="heading" selectable style={{ color: '#123456', marginTop: 8 }}>
        Welcome
      </ScalableText>,
    );
    const text = screen.getByRole('header', { name: 'Welcome heading' });
    expect(text).toHaveStyle({ color: '#123456', fontSize: 32, marginTop: 8, flexShrink: 1 });
    expect(text.props.selectable).toBe(true);
    expect(screen.getByTestId('heading')).toBe(text);
  });
});
