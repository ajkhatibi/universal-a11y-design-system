import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, type LayoutChangeEvent } from 'react-native';
import { AccessiblePressable } from '../src/primitives/AccessiblePressable';
import { expectAccessibleElement } from '../src/testing/expectAccessibleElement';

describe('AccessiblePressable', () => {
  it('exposes an explicit role, accessible name, hint and visible children', () => {
    render(
      <AccessiblePressable
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
        accessibilityHint="Returns to the previous screen"
      >
        <Text>Close</Text>
      </AccessiblePressable>,
    );
    const control = screen.getByRole('button', { name: 'Close dialog' });
    expectAccessibleElement(control, {
      role: 'button',
      name: /close dialog/i,
      state: { disabled: false, busy: false },
    });
    expect(control.props.accessibilityHint).toBe('Returns to the previous screen');
    expect(screen.getByText('Close')).toBeOnTheScreen();
  });

  it.each(['', ' ', '\n\t'])('rejects a blank accessible label %j', (label) => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() =>
        render(<AccessiblePressable accessibilityRole="button" accessibilityLabel={label} />),
      ).toThrow('requires a non-empty accessibilityLabel');
    } finally {
      errors.mockRestore();
    }
  });

  it('allows an explicitly inaccessible child for parent-owned semantics', () => {
    render(<AccessiblePressable accessibilityRole="button" accessible={false} testID="child" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('child').props.accessible).toBe(false);
  });

  it.each([
    [24, 24, { top: 10, bottom: 10, left: 10, right: 10 }],
    [23, 31, { top: 7, bottom: 7, left: 11, right: 11 }],
    [60, 20, { top: 12, bottom: 12, left: 0, right: 0 }],
    [0, 0, { top: 22, bottom: 22, left: 22, right: 22 }],
    [44, 44, undefined],
    [100, 100, undefined],
    [-1, Number.NaN, undefined],
    [Number.POSITIVE_INFINITY, -10, undefined],
  ])('expands a %s × %s visual target without changing layout', (width, height, expected) => {
    render(
      <AccessiblePressable
        accessibilityRole="button"
        accessibilityLabel="Open"
        visualWidth={width}
        visualHeight={height}
      />,
    );
    expect(screen.getByRole('button').props.hitSlop).toEqual(expected);
  });

  it('does not invent insets before dimensions are known', () => {
    render(<AccessiblePressable accessibilityRole="button" accessibilityLabel="Open" />);
    expect(screen.getByRole('button').props.hitSlop).toBeUndefined();
  });

  it.each([
    [3, { top: 10, bottom: 10, left: 10, right: 10 }],
    [15, { top: 15, bottom: 15, left: 15, right: 15 }],
    [{ top: 20, right: 2, bottom: 12 }, { top: 20, bottom: 12, left: 10, right: 10 }],
    [{ top: -5, left: Number.NaN, right: Number.POSITIVE_INFINITY }, { top: 10, bottom: 10, left: 10, right: 10 }],
  ])('merges explicit hit slop %j without shrinking the minimum', (hitSlop, expected) => {
    render(
      <AccessiblePressable
        accessibilityRole="button"
        accessibilityLabel="Open"
        visualWidth={24}
        visualHeight={24}
        hitSlop={hitSlop}
      />,
    );
    expect(screen.getByRole('button').props.hitSlop).toEqual(expected);
  });

  it('keeps explicit hit slop even without a visual estimate', () => {
    render(
      <AccessiblePressable accessibilityRole="link" accessibilityLabel="Help" hitSlop={{ left: 9 }} />,
    );
    expect(screen.getByRole('link').props.hitSlop).toEqual({ top: 0, bottom: 0, left: 9, right: 0 });
  });

  it('uses measured dimensions over estimates and forwards every layout event', () => {
    const onLayout = jest.fn<(event: LayoutChangeEvent) => void>();
    const { rerender } = render(
      <AccessiblePressable accessibilityRole="button" accessibilityLabel="Open" visualWidth={10} visualHeight={10} onLayout={onLayout} />,
    );
    const event: LayoutChangeEvent = {
      nativeEvent: { layout: { x: 0, y: 0, width: 30, height: 50 } },
    } as LayoutChangeEvent;
    expect(screen.getByRole('button').props.hitSlop).toEqual({ top: 17, bottom: 17, left: 17, right: 17 });
    fireEvent(screen.getByRole('button'), 'layout', event);
    expect(onLayout).toHaveBeenLastCalledWith(event);
    expect(screen.getByRole('button').props.hitSlop).toEqual({ top: 0, bottom: 0, left: 7, right: 7 });
    fireEvent(screen.getByRole('button'), 'layout', event);
    expect(onLayout).toHaveBeenCalledTimes(2);
    rerender(
      <AccessiblePressable accessibilityRole="button" accessibilityLabel="Open" visualWidth={1} visualHeight={1} onLayout={onLayout} />,
    );
    expect(screen.getByRole('button').props.hitSlop).toEqual({ top: 0, bottom: 0, left: 7, right: 7 });
    fireEvent(screen.getByRole('button'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 60, height: 60 } },
    });
    expect(screen.getByRole('button').props.hitSlop).toBeUndefined();
  });

  it.each([
    { disabled: true, isLoading: false },
    { disabled: false, isLoading: true },
    { disabled: true, isLoading: true },
  ])('blocks presses for %j and exposes the corresponding states', (props) => {
    const onPress = jest.fn();
    render(<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" {...props} onPress={onPress} />);
    const control = screen.getByRole('button', { disabled: true, busy: props.isLoading });
    fireEvent.press(control);
    expect(onPress).not.toHaveBeenCalled();
    expectAccessibleElement(control, {
      role: 'button',
      name: 'Save',
      state: { disabled: true, busy: props.isLoading },
    });
  });

  it('resumes interaction after loading ends', () => {
    const onPress = jest.fn();
    const { rerender } = render(
      <AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" isLoading onPress={onPress} />,
    );
    rerender(<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { disabled: false, busy: false }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])('maps selected=%s and retains expanded state', (isSelected) => {
    render(
      <AccessiblePressable accessibilityRole="tab" accessibilityLabel="Details" isSelected={isSelected} accessibilityState={{ expanded: true }} />,
    );
    expectAccessibleElement(screen.getByRole('tab', { selected: isSelected, expanded: true }), {
      role: 'tab',
      name: 'Details',
      state: { selected: isSelected, expanded: true },
    });
  });

  it('updates additional expanded state without losing interaction state', () => {
    const { rerender } = render(
      <AccessiblePressable accessibilityRole="menuitem" accessibilityLabel="More options" accessibilityState={{ expanded: true }} />,
    );
    expect(screen.getByRole('menuitem', { expanded: true })).toBeOnTheScreen();
    rerender(
      <AccessiblePressable accessibilityRole="menuitem" accessibilityLabel="More options" accessibilityState={{ expanded: false }} />,
    );
    expectAccessibleElement(screen.getByRole('menuitem', { expanded: false }), {
      role: 'menuitem', name: 'More options', state: { expanded: false, disabled: false, busy: false },
    });
  });

  it.each([true, false, 'mixed'] as const)('maps checkbox checked=%s', (isChecked) => {
    render(<AccessiblePressable accessibilityRole="checkbox" accessibilityLabel="Select all" isChecked={isChecked} />);
    expectAccessibleElement(screen.getByRole('checkbox', { checked: isChecked }), {
      role: 'checkbox',
      name: 'Select all',
      state: { checked: isChecked },
    });
  });

  it.each(['switch', 'radio'] as const)('maps boolean checked state for %s', (role) => {
    const { rerender } = render(
      <AccessiblePressable accessibilityRole={role} accessibilityLabel="Option" isChecked />,
    );
    expect(screen.getByRole(role, { checked: true })).toBeOnTheScreen();
    rerender(<AccessiblePressable accessibilityRole={role} accessibilityLabel="Option" isChecked={false} />);
    expect(screen.getByRole(role, { checked: false })).toBeOnTheScreen();
  });
});
