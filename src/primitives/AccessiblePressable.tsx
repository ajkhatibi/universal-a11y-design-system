import React, { useMemo, useState } from 'react';
import {
  Pressable,
  type PressableProps,
  type AccessibilityRole,
  type AccessibilityState,
  type Insets,
  type LayoutChangeEvent,
} from 'react-native';
import { MIN_TOUCH_TARGET_PT } from '../tokens/spacing';

type StrictA11yLabelProps =
  | {
      /**
       * Required for icon-only buttons or composite controls so iOS VoiceOver
       * and Android TalkBack announce a clear action description.
       */
      accessibilityLabel: string;
      accessibilityHint?: string;
    }
  | {
      /**
       * Only use when a parent container aggregates accessibility semantics.
       */
      accessible: false;
      accessibilityLabel?: never;
      accessibilityHint?: never;
    };

export type AccessiblePressableProps = Omit<
  PressableProps,
  | 'accessibilityRole'
  | 'accessibilityLabel'
  | 'accessibilityState'
  | 'role'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-disabled'
  | 'aria-busy'
  | 'aria-selected'
  | 'aria-checked'
> &
  StrictA11yLabelProps &
  (
    | { accessibilityRole: 'checkbox'; isChecked: boolean | 'mixed' }
    | { accessibilityRole: 'switch' | 'radio'; isChecked: boolean }
    | {
        accessibilityRole: Extract<AccessibilityRole, 'button' | 'link' | 'tab' | 'menuitem'>;
        isChecked?: never;
      }
  ) & {
    /** JSX permits unknown hyphenated attributes; explicit never closes that gap. */
    'aria-label'?: never;
    'aria-labelledby'?: never;
    'aria-disabled'?: never;
    'aria-busy'?: never;
    'aria-selected'?: never;
    'aria-checked'?: never;
    /** Additional state cannot override the primitive's interaction state. */
    accessibilityState?: Omit<AccessibilityState, 'disabled' | 'busy' | 'selected' | 'checked'>;
    isLoading?: boolean;
    isSelected?: boolean;
    /** Optional pre-layout dimensions in density-independent points. */
    visualWidth?: number;
    visualHeight?: number;
  };

/**
 * Enterprise-grade interactive primitive enforcing WCAG 2.1 AA screen-reader
 * semantics and automatic 44x44pt minimum touch target expansion.
 */
export const AccessiblePressable = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  AccessiblePressableProps
>(
  (
    {
      accessibilityRole,
      disabled = false,
      isLoading = false,
      isSelected,
      isChecked,
      accessibilityState,
      visualWidth,
      visualHeight,
      hitSlop,
      onLayout,
      children,
      ...rest
    },
    ref
  ) => {
    const [layout, setLayout] = useState<{ width: number; height: number }>();
    const isInteractionBlocked = Boolean(disabled || isLoading);

    if (rest.accessible !== false && !rest.accessibilityLabel?.trim()) {
      throw new Error('AccessiblePressable requires a non-empty accessibilityLabel.');
    }

    const computedHitSlop = useMemo<Insets | number | undefined>(() => {
      // Actual layout wins over estimates once native measurement is available.
      const width = layout?.width ?? visualWidth;
      const height = layout?.height ?? visualHeight;
      const padding = (size: number | undefined): number =>
        size !== undefined && Number.isFinite(size) && size >= 0
          ? Math.max(0, Math.ceil((MIN_TOUCH_TARGET_PT - size) / 2))
          : 0;
      const horizontalPad = padding(width);
      const verticalPad = padding(height);
      const requested = typeof hitSlop === 'number'
        ? { top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }
        : hitSlop;
      const inset = (value: number | undefined, minimum: number): number =>
        Math.max(minimum, value !== undefined && Number.isFinite(value) ? value : 0);
      const result = {
        top: inset(requested?.top, verticalPad),
        bottom: inset(requested?.bottom, verticalPad),
        left: inset(requested?.left, horizontalPad),
        right: inset(requested?.right, horizontalPad),
      };
      return Object.values(result).some((value) => value > 0) ? result : undefined;
    }, [hitSlop, visualWidth, visualHeight, layout]);

    const handleLayout = (event: LayoutChangeEvent): void => {
      const { width, height } = event.nativeEvent.layout;
      setLayout((previous) =>
        previous?.width === width && previous.height === height ? previous : { width, height },
      );
      onLayout?.(event);
    };

    return (
      <Pressable
        {...rest}
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          ...accessibilityState,
          disabled: isInteractionBlocked,
          busy: isLoading,
          selected: isSelected,
          checked: isChecked,
        }}
        disabled={isInteractionBlocked}
        hitSlop={computedHitSlop}
        onLayout={handleLayout}
      >
        {children}
      </Pressable>
    );
  }
);

AccessiblePressable.displayName = 'AccessiblePressable';
