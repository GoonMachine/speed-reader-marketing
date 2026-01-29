import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { XShareSheet } from "../components/XShareSheet";

/**
 * iOS-native share sheet animation composition
 *
 * Animation Research:
 * - iOS uses high damping (~200) for smooth, non-bouncy animations
 * - Duration: 0.3-0.5 seconds (12-15 frames at 30fps)
 * - Backdrop dims to ~40-60% opacity
 * - Spring-based easing (not cubic bezier)
 *
 * Timeline:
 * - Frame 0-30: Initial state (posts visible, sheet off-screen)
 * - Frame 30: Share button auto-triggered
 * - Frame 30-60: Sheet animates up with iOS spring, backdrop fades in
 * - Frame 60+: Final state (sheet visible)
 */
export const XShareSheetAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tap animation happens at frame 27-33
  const TAP_START_FRAME = 27;
  const TAP_END_FRAME = 33;
  const ANIMATION_START_FRAME = 30;

  // Share button tap state (true during tap animation)
  const shareButtonTapped = frame >= TAP_START_FRAME && frame < TAP_END_FRAME;

  // iOS accessibility tap indicator animation
  // Fades in quickly, stays visible, then fades out
  const tapIndicatorOpacity = interpolate(
    frame,
    [TAP_START_FRAME, TAP_START_FRAME + 2, TAP_END_FRAME - 2, TAP_END_FRAME],
    [0, 0.9, 0.9, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp"
    }
  );

  // iOS-like spring animation parameters
  // Research shows iOS uses:
  // - High damping (200+) for smooth, non-bouncy feel
  // - Moderate stiffness (100-170) for natural motion
  // - Mass = 1 for standard weight
  const sheetProgress = spring({
    frame: frame - ANIMATION_START_FRAME,
    fps,
    config: {
      damping: 200,      // High damping = smooth, no bounce (iOS-like)
      stiffness: 170,    // Moderate stiffness for natural motion
      mass: 1,           // Standard mass
    },
  });

  // Sheet starts at 650px (off-screen below), ends at 0 (final position)
  const sheetTranslateY = interpolate(
    sheetProgress,
    [0, 1],
    [650, 0]  // Slide up from below
  );

  // Backdrop fades from 0 to 0.5 opacity (50% dim)
  const backdropOpacity = interpolate(
    sheetProgress,
    [0, 1],
    [0, 0.5]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <XShareSheet
        sheetTranslateY={sheetTranslateY}
        backdropOpacity={backdropOpacity}
        shareButtonTapped={shareButtonTapped}
        tapIndicatorOpacity={tapIndicatorOpacity}
      />
    </div>
  );
};
