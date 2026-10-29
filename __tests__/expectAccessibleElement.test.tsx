import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { expectAccessibleElement } from '../src/testing/expectAccessibleElement';

describe('expectAccessibleElement', () => {
  it('accepts a role, literal or regex name and a partial accessibility state', () => {
    render(<View accessible accessibilityRole="checkbox" accessibilityLabel="Select items" accessibilityState={{ checked: 'mixed', expanded: false }} />);
    const element = screen.getByRole('checkbox');
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Select items', state: { checked: 'mixed' },
    })).not.toThrow();
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: /select/i, state: { expanded: false },
    })).not.toThrow();
  });

  it('uses a text element name and supports the native role alias', () => {
    render(<Text role="button">Account settings</Text>);
    expect(() => expectAccessibleElement(screen.getByRole('button'), {
      role: 'button', name: 'Account settings',
    })).not.toThrow();
  });

  it('rejects an incorrect role', () => {
    render(<View accessible accessibilityRole="button" accessibilityLabel="Save" />);
    expect(() => expectAccessibleElement(screen.getByRole('button'), {
      role: 'link', name: 'Save',
    })).toThrow();
  });

  it.each(['Delete', /delete/i])('rejects an incorrect accessible name %s', (name) => {
    render(<View accessible accessibilityRole="button" accessibilityLabel="Save" />);
    expect(() => expectAccessibleElement(screen.getByRole('button'), {
      role: 'button', name,
    })).toThrow();
  });

  it.each(['', ' \n\t'])('rejects a blank name even when it matches the supplied expectation', (name) => {
    render(<View accessible accessibilityRole="button" accessibilityLabel={name} />);
    expect(() => expectAccessibleElement(screen.getByRole('button'), {
      role: 'button', name,
    })).toThrow();
  });

  it('rejects incorrect or missing accessibility states', () => {
    render(<View accessible accessibilityRole="checkbox" accessibilityLabel="Option" accessibilityState={{ checked: false }} />);
    const element = screen.getByRole('checkbox');
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Option', state: { checked: true },
    })).toThrow();
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Option', state: { expanded: true },
    })).toThrow();
  });

  it('accepts effective ARIA state overrides instead of conflicting native state', () => {
    render(
      <View
        accessible
        accessibilityRole="checkbox"
        accessibilityLabel="Option"
        accessibilityState={{ checked: false, disabled: false }}
        aria-checked
        aria-disabled
        testID="aria-overrides"
      />,
    );
    const element = screen.getByTestId('aria-overrides');
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Option', state: { checked: true, disabled: true },
    })).not.toThrow();
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Option', state: { checked: false },
    })).toThrow();
    expect(() => expectAccessibleElement(element, {
      role: 'checkbox', name: 'Option', state: { disabled: false },
    })).toThrow();
  });

  it('rejects elements explicitly excluded from the accessibility tree', () => {
    render(<View accessible={false} accessibilityRole="button" accessibilityLabel="Save" testID="excluded" />);
    expect(() => expectAccessibleElement(screen.getByTestId('excluded'), {
      role: 'button', name: 'Save',
    })).toThrow();
  });

  it('rejects a View that has a role but is not an accessibility element', () => {
    render(<View accessibilityRole="button" accessibilityLabel="Save" testID="not-accessible" />);
    expect(() => expectAccessibleElement(screen.getByTestId('not-accessible'), {
      role: 'button', name: 'Save',
    })).toThrow();
  });

  it('does not accidentally validate a matching descendant instead of the supplied element', () => {
    render(
      <View testID="container">
        <View accessible accessibilityRole="button" accessibilityLabel="Save" />
      </View>,
    );
    expect(() => expectAccessibleElement(screen.getByTestId('container'), {
      role: 'button', name: 'Save',
    })).toThrow();
  });

  it.each(['display', 'modal', 'descendants'] as const)('rejects elements hidden by %s', (mode) => {
    render(
      <View
        style={mode === 'display' ? { display: 'none' } : undefined}
        accessibilityElementsHidden={mode === 'modal'}
        importantForAccessibility={mode === 'descendants' ? 'no-hide-descendants' : 'auto'}
      >
        <View accessible accessibilityRole="button" accessibilityLabel="Save" testID="hidden" />
      </View>,
    );
    const hidden = screen.getByTestId('hidden', { includeHiddenElements: true });
    expect(() => expectAccessibleElement(hidden, { role: 'button', name: 'Save' })).toThrow();
  });
});
