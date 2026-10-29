/** Density-independent points: every spacing token follows the four-point grid. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Apple/AAA target floor; use the larger Android target where space permits. */
export const MIN_TOUCH_TARGET_PT = 44;
export const ANDROID_TOUCH_TARGET_DP = 48;

/** Minimum layout footprint for controls that cannot safely expand hit slop. */
export const minimumTouchTarget = {
  minWidth: MIN_TOUCH_TARGET_PT,
  minHeight: MIN_TOUCH_TARGET_PT,
} as const;
