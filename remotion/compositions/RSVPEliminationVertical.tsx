import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { RSVPMinimalVertical } from "./RSVPMinimalVertical";
import { tokenizeText, getPunctuationMultiplier } from "../../lib/shared-rsvp";

export interface WPMSegment {
  startWordIndex: number;
  wpm: number;
  displayWpm?: number;
}

export interface RSVPEliminationVerticalProps {
  articleText: string;
  wpm: number;
  wpmSegments?: WPMSegment[];
  title?: string;
}

const MONOSPACE_FONT = "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace";

// Threshold map: WPM → readers remaining, color, tier label
const THRESHOLDS = [
  { wpm: 0,   readers: 1000000, color: "#4CAF50", tier: "Everyone" },
  { wpm: 400, readers: 500000,  color: "#4CAF50", tier: "Top 50%" },
  { wpm: 500, readers: 100000,  color: "#FFC107", tier: "Top 10%" },
  { wpm: 600, readers: 25000,   color: "#FF9800", tier: "Top 5%" },
  { wpm: 700, readers: 10000,   color: "#F44336", tier: "Top 1%" },
  { wpm: 800, readers: 1000,    color: "#F44336", tier: "Top 0.1%" },
  { wpm: 900, readers: 100,     color: "#9C27B0", tier: "Top 0.01%" },
];

function formatReaders(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

export const RSVPEliminationVertical: React.FC<RSVPEliminationVerticalProps> = ({
  articleText,
  wpm,
  wpmSegments,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duplicate the timing math to determine current WPM at this frame
  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  const wordTimings = useMemo(() => {
    const timings: number[] = [];
    let cumulativeTime = 0;
    for (let i = 0; i < words.length; i++) {
      timings.push(cumulativeTime);
      let currentWPM = wpm;
      if (wpmSegments) {
        for (const segment of wpmSegments) {
          if (i >= segment.startWordIndex) {
            currentWPM = segment.wpm;
          }
        }
      }
      const baseDelay = 60000 / currentWPM;
      const multiplier = getPunctuationMultiplier(words[i]);
      cumulativeTime += baseDelay * multiplier;
    }
    return timings;
  }, [words, wpm, wpmSegments]);

  const elapsedMs = (frame / fps) * 1000;

  // Find current word index
  let currentWordIndex = 0;
  for (let i = wordTimings.length - 1; i >= 0; i--) {
    if (elapsedMs >= wordTimings[i]) {
      currentWordIndex = i;
      break;
    }
  }

  // Find current WPM from segments
  const currentWPM = useMemo(() => {
    if (!wpmSegments || wpmSegments.length === 0) return wpm;
    let result = wpm;
    for (const segment of wpmSegments) {
      if (currentWordIndex >= segment.startWordIndex) {
        result = segment.wpm;
      }
    }
    return result;
  }, [currentWordIndex, wpm, wpmSegments]);

  // Determine current threshold based on WPM
  const currentThreshold = useMemo(() => {
    let threshold = THRESHOLDS[0];
    for (const t of THRESHOLDS) {
      if (currentWPM >= t.wpm) {
        threshold = t;
      }
    }
    return threshold;
  }, [currentWPM]);

  // Find previous threshold for animated transition
  const thresholdIndex = THRESHOLDS.indexOf(currentThreshold);
  const prevThreshold = thresholdIndex > 0 ? THRESHOLDS[thresholdIndex - 1] : currentThreshold;

  // Animate reader count dropping when threshold changes
  // Find the frame when current threshold started
  const thresholdStartFrame = useMemo(() => {
    if (!wpmSegments || thresholdIndex === 0) return 0;
    const thresholdWpm = currentThreshold.wpm;
    // Find which segment matches this WPM
    for (const segment of wpmSegments) {
      if (segment.wpm >= thresholdWpm) {
        // Find the frame for this word index
        if (segment.startWordIndex < wordTimings.length) {
          return Math.floor((wordTimings[segment.startWordIndex] / 1000) * fps);
        }
      }
    }
    return 0;
  }, [currentThreshold, thresholdIndex, wpmSegments, wordTimings, fps]);

  const dropDurationFrames = Math.floor(fps * 0.8); // 0.8s drop animation
  const framesSinceThreshold = frame - thresholdStartFrame;

  const displayReaders = Math.round(
    interpolate(
      framesSinceThreshold,
      [0, dropDurationFrames],
      [prevThreshold.readers, currentThreshold.readers],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  );

  // Tier badge bounce animation
  const tierBounce = spring({
    frame: framesSinceThreshold,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const tierScale = interpolate(tierBounce, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill>
      {/* Child RSVP display — renders the actual reading content */}
      <RSVPMinimalVertical
        articleText={articleText}
        wpm={wpm}
        wpmSegments={wpmSegments}
        title={title}
      />

      {/* Overlay: Reader counter — top area */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        {/* Reader count */}
        <div
          style={{
            fontSize: 32,
            fontFamily: MONOSPACE_FONT,
            fontWeight: 500,
            color: "#666666",
            letterSpacing: 2,
          }}
        >
          READERS REMAINING
        </div>
        <div
          style={{
            fontSize: 72,
            fontFamily: MONOSPACE_FONT,
            fontWeight: 700,
            color: currentThreshold.color,
            textShadow: `0 0 20px ${currentThreshold.color}40`,
          }}
        >
          {formatReaders(displayReaders)}
        </div>

        {/* Tier badge */}
        <div
          style={{
            marginTop: 4,
            padding: "8px 24px",
            borderRadius: 8,
            border: `2px solid ${currentThreshold.color}`,
            backgroundColor: `${currentThreshold.color}20`,
            transform: `scale(${tierScale})`,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontFamily: MONOSPACE_FONT,
              fontWeight: 600,
              color: currentThreshold.color,
              letterSpacing: 1,
            }}
          >
            {currentThreshold.tier}
          </span>
        </div>
      </div>

    </AbsoluteFill>
  );
};
