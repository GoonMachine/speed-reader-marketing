import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX } from "../lib/rsvp-web";
import { calculateWordTimings, getPunctuationMultiplier } from "../../lib/shared-rsvp";

export interface WPMSegment {
  startWordIndex: number;
  wpm: number;
  displayWpm?: number;
}

export interface RSVPMinimalVerticalProps {
  articleText: string;
  wpm: number;
  wpmSegments?: WPMSegment[];
  title?: string; // Optional title to display at top
}

const FONT_SIZE = 88; // Slightly smaller
const PRIMARY_COLOR = "#E53935"; // Red for ORP
const MONOSPACE_FONT = "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace";

export const RSVPMinimalVertical: React.FC<RSVPMinimalVerticalProps> = ({
  articleText,
  wpm,
  wpmSegments,
  title
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  const wordTimings = useMemo(() => {
    if (wpmSegments && wpmSegments.length > 0) {
      const timings: number[] = [];
      let cumulativeTime = 0;

      for (let i = 0; i < words.length; i++) {
        timings.push(cumulativeTime);

        let currentWPM = wpm;
        for (const segment of wpmSegments) {
          if (i >= segment.startWordIndex) {
            currentWPM = segment.wpm;
          }
        }

        const baseDelay = 60000 / currentWPM;
        const multiplier = getPunctuationMultiplier(words[i]);
        cumulativeTime += baseDelay * multiplier;
      }

      return timings;
    } else {
      return calculateWordTimings(words, wpm);
    }
  }, [words, wpm, wpmSegments]);

  const elapsedMs = (frame / fps) * 1000;

  const lastWordMultiplier = words.length > 0 ? getPunctuationMultiplier(words[words.length - 1]) : 1;
  const lastWordEndTime = words.length > 0 ? wordTimings[wordTimings.length - 1] + (60000 / wpm) * lastWordMultiplier : 0;

  const isComplete = elapsedMs >= lastWordEndTime;

  let currentWordIndex = 0;
  if (!isComplete) {
    for (let i = wordTimings.length - 1; i >= 0; i--) {
      if (elapsedMs >= wordTimings[i]) {
        currentWordIndex = i;
        break;
      }
    }
  } else {
    currentWordIndex = words.length - 1;
  }

  const currentWord = words[currentWordIndex] || "";
  const wordDisplay = getWordDisplay(currentWord, FONT_SIZE);

  const currentWPM = useMemo(() => {
    if (wpmSegments && wpmSegments.length > 0) {
      let displayWPM = wpm;
      for (const segment of wpmSegments) {
        if (currentWordIndex >= segment.startWordIndex) {
          displayWPM = segment.displayWpm || segment.wpm;
        }
      }
      return displayWPM;
    }
    return wpm;
  }, [currentWordIndex, wpm, wpmSegments]);

  // Vertical layout positioning
  const centerY = height / 2;
  const centerX = width / 2 - (width * 0.10); // Shift 10% to the left

  // Word display area dimensions
  const wordAreaHeight = 600;
  const wordAreaTop = centerY - wordAreaHeight / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
      }}
    >
      {/* Optional title at top */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            right: 60,
            textAlign: "center",
            fontSize: 28,
            fontWeight: 600,
            color: "#666666",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
      )}

      {/* Top horizontal line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: wordAreaTop,
          width: "100%",
          height: 8,
          backgroundColor: "#333333",
        }}
      />

      {/* Bottom horizontal line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: wordAreaTop + wordAreaHeight,
          width: "100%",
          height: 8,
          backgroundColor: "#333333",
        }}
      />

      {/* Vertical line - top segment */}
      <div
        style={{
          position: "absolute",
          left: centerX - 4,
          top: wordAreaTop,
          width: 8,
          height: (wordAreaHeight / 2 - 200),
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#333333",
          }}
        />
      </div>

      {/* Vertical line - bottom segment */}
      <div
        style={{
          position: "absolute",
          left: centerX - 4,
          top: wordAreaTop + (wordAreaHeight / 2 + 200),
          width: 8,
          height: (wordAreaHeight / 2 - 200) + 8,
          backgroundColor: "#333333",
        }}
      />

      {/* Word display */}
      {wordDisplay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: centerX,
              display: "flex",
              alignItems: "center",
              transform: `translateX(${getWebTranslateX(wordDisplay)}px)`,
            }}
          >
            <span
              style={{
                fontSize: wordDisplay.fontSize,
                fontWeight: 500,
                color: "#FFFFFF",
                fontFamily: MONOSPACE_FONT,
              }}
            >
              {wordDisplay.before}
            </span>
            <span
              style={{
                fontSize: wordDisplay.fontSize,
                fontWeight: 600,
                color: PRIMARY_COLOR,
                fontFamily: MONOSPACE_FONT,
              }}
            >
              {wordDisplay.orp}
            </span>
            <span
              style={{
                fontSize: wordDisplay.fontSize,
                fontWeight: 500,
                color: "#FFFFFF",
                fontFamily: MONOSPACE_FONT,
              }}
            >
              {wordDisplay.after}
            </span>
          </div>
        </div>
      )}

      {/* WPM indicator - bottom */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 200,
          fontSize: 56,
          lineHeight: "64px",
          color: "#4A4A4A",
          fontFamily: MONOSPACE_FONT,
          fontWeight: 500,
          fontStyle: "italic",
          whiteSpace: "nowrap",
        }}
      >
        {currentWPM} wpm
      </div>

      {/* Progress bar - bottom */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 100,
          height: 4,
          backgroundColor: "#1a1a1a",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((currentWordIndex + 1) / words.length) * 100}%`,
            backgroundColor: PRIMARY_COLOR,
            borderRadius: 2,
            transition: "width 0.1s ease-out",
          }}
        />
      </div>

      {/* Word counter - bottom left */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 200,
          fontSize: 40,
          color: "#4A4A4A",
          fontFamily: MONOSPACE_FONT,
          fontWeight: 500,
        }}
      >
        {currentWordIndex + 1}/{words.length}
      </div>
    </AbsoluteFill>
  );
};
