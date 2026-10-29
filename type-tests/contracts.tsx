import { AccessiblePressable, LiveAnnouncement, ScalableText, type AccessiblePressableProps } from '../src';

function acceptControl(props: AccessiblePressableProps): void {
  void props;
}

// These expressions are compiler fixtures, excluded from Jest execution.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" />;
<AccessiblePressable accessibilityRole="link" accessibilityLabel="Help" />;
<AccessiblePressable accessibilityRole="checkbox" accessibilityLabel="All" isChecked="mixed" />;
<AccessiblePressable accessibilityRole="switch" accessibilityLabel="Enabled" isChecked={false} />;
<AccessiblePressable accessibilityRole="radio" accessibilityLabel="Option" isChecked />;
<AccessiblePressable accessibilityRole="button" accessible={false} />;
<AccessiblePressable accessibilityRole="tab" accessibilityLabel="Details" isSelected accessibilityState={{ expanded: true }} />;

// @ts-expect-error An accessible control must have a label.
<AccessiblePressable accessibilityRole="button" />;
// @ts-expect-error Controls must declare their role.
<AccessiblePressable accessibilityLabel="Save" />;
// @ts-expect-error Arbitrary roles are not interactive primitive roles.
<AccessiblePressable accessibilityRole="image" accessibilityLabel="Picture" />;
// @ts-expect-error The native role alias must not bypass the role contract.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" role="link" />;
// @ts-expect-error Dashed JSX aliases must not bypass the native label.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" aria-label="Different name" />;
// @ts-expect-error Dashed JSX aliases must not bypass disabled state.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" aria-disabled={false} />;
// @ts-expect-error Dashed label references must not bypass the native label.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" aria-labelledby="other" />;
// @ts-expect-error Dashed busy aliases must not bypass loading state.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" aria-busy={false} />;
// @ts-expect-error Dashed selected aliases must not bypass isSelected.
<AccessiblePressable accessibilityRole="tab" accessibilityLabel="Details" aria-selected />;
// @ts-expect-error Dashed checked aliases must not bypass isChecked.
<AccessiblePressable accessibilityRole="checkbox" accessibilityLabel="All" isChecked aria-checked={false} />;
// @ts-expect-error A checkbox requires an explicit checked state.
<AccessiblePressable accessibilityRole="checkbox" accessibilityLabel="All" />;
// @ts-expect-error A switch requires an explicit checked state.
<AccessiblePressable accessibilityRole="switch" accessibilityLabel="Enabled" />;
// @ts-expect-error A radio requires an explicit checked state.
<AccessiblePressable accessibilityRole="radio" accessibilityLabel="Option" />;
// @ts-expect-error A switch cannot have the checkbox-only mixed state.
<AccessiblePressable accessibilityRole="switch" accessibilityLabel="Enabled" isChecked="mixed" />;
// @ts-expect-error A radio cannot have the checkbox-only mixed state.
<AccessiblePressable accessibilityRole="radio" accessibilityLabel="Option" isChecked="mixed" />;
// @ts-expect-error Buttons cannot expose a checked state.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" isChecked />;
// @ts-expect-error Disabled state is owned by the primitive.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" accessibilityState={{ disabled: true }} />;
// @ts-expect-error Busy state is owned by the primitive.
<AccessiblePressable accessibilityRole="button" accessibilityLabel="Save" accessibilityState={{ busy: true }} />;
// @ts-expect-error Selected state uses the isSelected prop.
<AccessiblePressable accessibilityRole="tab" accessibilityLabel="Details" accessibilityState={{ selected: true }} />;
// @ts-expect-error Checked state uses the isChecked prop.
<AccessiblePressable accessibilityRole="checkbox" accessibilityLabel="All" isChecked accessibilityState={{ checked: false }} />;
// @ts-expect-error An inaccessible grouped child cannot supply a hint without a label.
<AccessiblePressable accessibilityRole="button" accessible={false} accessibilityHint="Hint" />;

// Dashed JSX attributes bypass excess-property checks; check the props contract directly.
// @ts-expect-error The native label owns the accessible name.
acceptControl({ accessibilityRole: 'button', accessibilityLabel: 'Save', 'aria-label': 'Different name' });
// @ts-expect-error Label references cannot bypass the required label.
acceptControl({ accessibilityRole: 'button', accessibilityLabel: 'Save', 'aria-labelledby': 'other' });
// @ts-expect-error Disabled aliases cannot bypass interaction state.
acceptControl({ accessibilityRole: 'button', accessibilityLabel: 'Save', 'aria-disabled': false });
// @ts-expect-error Busy aliases cannot bypass loading state.
acceptControl({ accessibilityRole: 'button', accessibilityLabel: 'Save', 'aria-busy': false });
// @ts-expect-error Selected aliases cannot bypass isSelected.
acceptControl({ accessibilityRole: 'tab', accessibilityLabel: 'Details', 'aria-selected': true });
// @ts-expect-error Checked aliases cannot bypass isChecked.
acceptControl({ accessibilityRole: 'checkbox', accessibilityLabel: 'All', isChecked: true, 'aria-checked': false });

<ScalableText tier="body">Body</ScalableText>;
<ScalableText tier="caption" maxFontSizeMultiplier={2.5}>Caption</ScalableText>;
// @ts-expect-error A typography tier is mandatory.
<ScalableText>Text</ScalableText>;
// @ts-expect-error Unknown typography tiers are not supported.
<ScalableText tier="tiny">Text</ScalableText>;
// @ts-expect-error At least 200% font scaling is required.
<ScalableText tier="body" maxFontSizeMultiplier={1}>Text</ScalableText>;
// @ts-expect-error Unlimited native multipliers must not bypass tier caps.
<ScalableText tier="body" maxFontSizeMultiplier={0}>Text</ScalableText>;
// @ts-expect-error Unsupported caps above the largest tier ceiling are rejected.
<ScalableText tier="body" maxFontSizeMultiplier={4}>Text</ScalableText>;
// @ts-expect-error Arbitrary fractional caps are not part of the typography contract.
<ScalableText tier="body" maxFontSizeMultiplier={2.25}>Text</ScalableText>;
// @ts-expect-error Scaling cannot be disabled.
<ScalableText tier="body" allowFontScaling={false}>Text</ScalableText>;
// @ts-expect-error Truncation cannot be introduced.
<ScalableText tier="body" numberOfLines={1}>Text</ScalableText>;
// @ts-expect-error Ellipsizing cannot be introduced.
<ScalableText tier="body" ellipsizeMode="tail">Text</ScalableText>;
// @ts-expect-error Shrinking text to fit defeats Dynamic Type.
<ScalableText tier="body" adjustsFontSizeToFit>Text</ScalableText>;
// @ts-expect-error Tier semantics own the accessibility role.
<ScalableText tier="hero" accessibilityRole="text">Text</ScalableText>;
// @ts-expect-error The role alias must not bypass tier semantics.
<ScalableText tier="hero" role="button">Text</ScalableText>;

<LiveAnnouncement message="" />;
<LiveAnnouncement message="Saved" politeness="assertive" visuallyHidden={false} />;
// @ts-expect-error Messages must be strings.
<LiveAnnouncement message={42} />;
// @ts-expect-error Only supported screen-reader announcement priorities are allowed.
<LiveAnnouncement message="Saved" politeness="off" />;
