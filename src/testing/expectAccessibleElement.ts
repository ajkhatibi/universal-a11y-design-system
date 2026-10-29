import { expect } from '@jest/globals';
import { within } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import type { AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibleElementExpectation {
  role: AccessibilityRole;
  name: string | RegExp;
  /** Omit unspecified states rather than explicitly supplying undefined. */
  state?: {
    [Key in keyof AccessibilityState]?: Exclude<AccessibilityState[Key], undefined>;
  };
}

/**
 * Assert a queried host element's role, nonempty accessible name and states.
 * RNTL resolves accessibility-element eligibility and native/ARIA precedence.
 * Import only in Jest; production bundles must not import testing utilities.
 */
export function expectAccessibleElement(
  element: ReactTestInstance,
  { role, name, state }: AccessibleElementExpectation,
): void {
  expect(
    within(element).queryAllByRole(role, { ...state, includeHiddenElements: false }),
  ).toContain(element);
  expect(element).toHaveAccessibleName(/\S/);
  expect(element).toHaveAccessibleName(name);
}
