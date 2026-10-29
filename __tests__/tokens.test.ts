import { describe, expect, it } from '@jest/globals';
import { colors, contrastPairs, contrastRatio, contrastThresholds, relativeLuminance } from '../src/tokens/colors';
import { ANDROID_TOUCH_TARGET_DP, MIN_TOUCH_TARGET_PT, minimumTouchTarget, spacing } from '../src/tokens/spacing';

describe('color contrast contracts', () => {
  it('declares every normal-text pair for each theme', () => {
    expect(contrastPairs.map(({ name }) => name).sort()).toEqual(
      Object.keys(colors).flatMap((theme) =>
        ['text', 'surfaceText', 'secondaryText', 'action', 'danger', 'success', 'warning'].map((role) => `${theme}.${role}`),
      ).sort(),
    );
  });

  it.each(contrastPairs)('$name meets its declared $minimum:1 contrast threshold', ({ foreground, background, minimum }) => {
    expect(minimum).toBeGreaterThanOrEqual(contrastThresholds.aaText);
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });

  it('publishes the unrounded WCAG AA, AAA and non-text thresholds', () => {
    expect(contrastThresholds).toEqual({ aaText: 4.5, aaaText: 7, aaLargeText: 3, aaaLargeText: 4.5, nonText: 3 });
  });

  it.each([
    ['#000000', '#FFFFFF', 21],
    ['#FFFFFF', '#FFFFFF', 1],
    ['#777777', '#FFFFFF', 4.478089453577214],
    ['#FF0000', '#FFFFFF', 3.9984767707539985],
  ])('calculates the known ratio of %s against %s', (foreground, background, expected) => {
    expect(contrastRatio(foreground, background)).toBeCloseTo(expected, 10);
    expect(contrastRatio(background, foreground)).toBeCloseTo(expected, 10);
  });

  it('does not round a failing contrast ratio up to AA', () => {
    expect(contrastRatio('#777777', '#FFFFFF')).toBeLessThan(contrastThresholds.aaText);
  });

  it.each([
    ['#000000', 0],
    ['#FFFFFF', 1],
    ['#FF0000', 0.2126],
    ['#00FF00', 0.7152],
    ['#0000FF', 0.0722],
    ['#0A0A0A', (10 / 255) / 12.92],
    ['#0B0B0B', ((11 / 255 + 0.055) / 1.055) ** 2.4],
  ])('calculates sRGB relative luminance for %s', (hex, expected) => {
    expect(relativeLuminance(hex)).toBeCloseTo(expected, 12);
  });

  it('accepts hexadecimal digits in either case', () => {
    expect(relativeLuminance('#abcdef')).toBe(relativeLuminance('#ABCDEF'));
  });

  it.each(['', '#fff', 'FFFFFF', '#FFFFFFFF', '#GG0000', 'red', '#12345', ' #123456', '#123456\n'])(
    'rejects unsupported color syntax %j in either ratio argument',
    (invalid) => {
      expect(() => relativeLuminance(invalid)).toThrow('opaque six-digit hex');
      expect(() => contrastRatio(invalid, '#FFFFFF')).toThrow('opaque six-digit hex');
      expect(() => contrastRatio('#FFFFFF', invalid)).toThrow('opaque six-digit hex');
    },
  );
});

describe('spacing and minimum target tokens', () => {
  it('keeps the documented spacing scale nonnegative, ordered and on a four-point grid', () => {
    expect(spacing).toEqual({ none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 });
    const values = Object.values(spacing);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value % 4).toBe(0);
    }
  });

  it('publishes 44-point minimum dimensions and the larger 48dp Android recommendation', () => {
    expect(MIN_TOUCH_TARGET_PT).toBe(44);
    expect(ANDROID_TOUCH_TARGET_DP).toBe(48);
    expect(minimumTouchTarget).toEqual({ minWidth: MIN_TOUCH_TARGET_PT, minHeight: MIN_TOUCH_TARGET_PT });
    expect(ANDROID_TOUCH_TARGET_DP).toBeGreaterThan(MIN_TOUCH_TARGET_PT);
  });
});
