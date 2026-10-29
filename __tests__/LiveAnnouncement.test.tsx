import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';
import { LiveAnnouncement } from '../src/primitives/LiveAnnouncement';

describe('LiveAnnouncement', () => {
  const announce = jest.fn<typeof AccessibilityInfo.announceForAccessibilityWithOptions>();
  const legacyAnnounce = jest.fn<typeof AccessibilityInfo.announceForAccessibility>();

  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(announce);
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(legacyAnnounce);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each<['polite' | 'assertive', boolean]>([
    ['polite', true],
    ['assertive', false],
  ])('queues iOS %s announcements with queue=%s', (politeness, queue) => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    render(<LiveAnnouncement message="Saved changes" politeness={politeness} />);
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith(
      'Saved changes',
      { queue },
    );
    expect(legacyAnnounce).not.toHaveBeenCalled();
  });

  it('defaults to polite and announces only meaningful iOS prop updates', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { rerender } = render(<LiveAnnouncement message="First update" />);
    expect(announce).toHaveBeenLastCalledWith('First update', { queue: true });
    rerender(<LiveAnnouncement message="First update" visuallyHidden={false} />);
    expect(announce).toHaveBeenCalledTimes(1);
    rerender(<LiveAnnouncement message="Second update" />);
    expect(announce).toHaveBeenLastCalledWith('Second update', { queue: true });
    rerender(<LiveAnnouncement message="Second update" politeness="assertive" />);
    expect(announce).toHaveBeenLastCalledWith('Second update', { queue: false });
    expect(announce).toHaveBeenCalledTimes(3);
  });

  it.each(['', ' ', '\n\t'])('does not announce empty iOS messages %j', (message) => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { rerender } = render(<LiveAnnouncement message={message} testID="status" />);
    expect(announce).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toBeOnTheScreen();
    rerender(<LiveAnnouncement message="Ready" testID="status" />);
    expect(announce).toHaveBeenCalledTimes(1);
    rerender(<LiveAnnouncement message={message} testID="status" />);
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it.each(['polite', 'assertive'] as const)('uses only an Android %s live region, including updates', (politeness) => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { rerender } = render(<LiveAnnouncement message="" politeness={politeness} testID="status" />);
    expect(screen.getByTestId('status').props.accessibilityLiveRegion).toBe(politeness);
    rerender(<LiveAnnouncement message="Upload finished" politeness={politeness} testID="status" />);
    const status = screen.getByRole('text', { name: 'Upload finished' });
    expect(status.props.accessibilityLiveRegion).toBe(politeness);
    expect(status.props.accessible).toBe(true);
    expect(announce).not.toHaveBeenCalled();
    expect(legacyAnnounce).not.toHaveBeenCalled();
  });

  it('keeps visually hidden status available to assistive technology', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { rerender } = render(<LiveAnnouncement message="Ready" />);
    expect(screen.getByRole('text', { name: 'Ready' })).toHaveStyle({
      position: 'absolute', width: 1, height: 1, overflow: 'hidden',
    });
    rerender(<LiveAnnouncement message="Ready" visuallyHidden={false} />);
    expect(screen.getByRole('text', { name: 'Ready' }).props.style).toBeUndefined();
  });
});
