import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native';

export interface LiveAnnouncementProps {
  /** Update this message when a meaningful dynamic state change occurs. */
  message: string;
  politeness?: 'polite' | 'assertive';
  /** Keep mounted when empty; hiding from layout does not hide from assistive tech. */
  visuallyHidden?: boolean;
  testID?: string;
}

/**
 * Android (and react-native-web) use a live region. VoiceOver uses the native
 * announcement API instead, avoiding duplicate imperative announcements.
 */
export function LiveAnnouncement({
  message,
  politeness = 'polite',
  visuallyHidden = true,
  testID,
}: LiveAnnouncementProps): React.JSX.Element {
  useEffect(() => {
    if (Platform.OS === 'ios' && message.trim()) {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, {
        queue: politeness === 'polite',
      });
    }
  }, [message, politeness]);

  return (
    <Text
      accessible
      accessibilityLiveRegion={politeness}
      accessibilityRole="text"
      style={visuallyHidden ? styles.hidden : undefined}
      testID={testID}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});
