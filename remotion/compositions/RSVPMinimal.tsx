import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX } from "../lib/rsvp-web";
import { calculateWordTimings, getPunctuationMultiplier } from "../../lib/shared-rsvp";

export interface WPMSegment {
  startWordIndex: number;
  wpm: number;
}

export interface RSVPMinimalProps {
  articleText: string;
  wpm: number;
  wpmSegments?: WPMSegment[]; // Optional: for dynamic WPM changes
}

const FONT_SIZE = 80; // Font size
const PRIMARY_COLOR = "#E53935"; // Red for ORP
const MONOSPACE_FONT = "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace";

export const RSVPMinimal: React.FC<RSVPMinimalProps> = ({ articleText, wpm, wpmSegments }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Scale factor from Figma (1024x1024) to video (1080x1080)
  const scale = width / 1024;

  // Tokenize text into words
  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  // Calculate cumulative word timings with dynamic WPM if segments provided
  const wordTimings = useMemo(() => {
    if (wpmSegments && wpmSegments.length > 0) {
      // Calculate timings with WPM changes
      const timings: number[] = [];
      let cumulativeTime = 0;

      for (let i = 0; i < words.length; i++) {
        timings.push(cumulativeTime);

        // Find current WPM for this word
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
      // Use fixed WPM
      return calculateWordTimings(words, wpm);
    }
  }, [words, wpm, wpmSegments]);

  // Calculate which word to show based on elapsed time and punctuation-adjusted timings
  const elapsedMs = (frame / fps) * 1000;

  // Calculate when the last word's display time ends
  const lastWordMultiplier = words.length > 0 ? getPunctuationMultiplier(words[words.length - 1]) : 1;
  const lastWordEndTime = words.length > 0 ? wordTimings[wordTimings.length - 1] + (60000 / wpm) * lastWordMultiplier : 0;

  // Check if reading is complete (past the last word's display time)
  const isComplete = elapsedMs >= lastWordEndTime;

  // Find the current word index by comparing elapsed time to word timings
  let currentWordIndex = 0;
  if (!isComplete) {
    for (let i = wordTimings.length - 1; i >= 0; i--) {
      if (elapsedMs >= wordTimings[i]) {
        currentWordIndex = i;
        break;
      }
    }
  } else {
    // If complete, set to last word
    currentWordIndex = words.length - 1;
  }

  // Get current word display
  const currentWord = words[currentWordIndex] || "";
  const wordDisplay = getWordDisplay(currentWord, FONT_SIZE);

  // Calculate current WPM based on word index (for dynamic display)
  const currentWPM = useMemo(() => {
    if (wpmSegments && wpmSegments.length > 0) {
      let displayWPM = wpm;
      for (const segment of wpmSegments) {
        if (currentWordIndex >= segment.startWordIndex) {
          displayWPM = segment.displayWpm || segment.wpm; // Use displayWpm if provided, otherwise wpm
        }
      }
      return displayWPM;
    }
    return wpm;
  }, [currentWordIndex, wpm, wpmSegments]);

  // ORP position - shifted right by 10% of frame width from 300px
  const orpLeft = (300 + 1024 * 0.10) * scale; // 300 + 102.4 = 402.4

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
      }}
    >
      {/* Top horizontal line - extends full width */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 252.5 * scale,
          width: "100%",
          height: 8 * scale,
          backgroundColor: "#333333",
        }}
      />

      {/* Bottom horizontal line - extends full width */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 252.5 * scale + 477 * scale,
          width: "100%",
          height: 8 * scale,
          backgroundColor: "#333333",
        }}
      />

      {/* Vertical line - top segment (from top line to gap) */}
      <div
        style={{
          position: "absolute",
          left: orpLeft - (4 * scale),
          top: 252.5 * scale,
          width: 8 * scale,
          height: (477 / 2 - 160) * scale, // Half height minus 160px gap (even larger gap)
          backgroundColor: "#333333",
        }}
      />

      {/* Vertical line - bottom segment (from gap to bottom line) */}
      <div
        style={{
          position: "absolute",
          left: orpLeft - (4 * scale),
          top: 252.5 * scale + (477 / 2 + 160) * scale, // Start after 160px gap (symmetric)
          width: 8 * scale,
          height: (477 / 2 - 160) * scale + (8 * scale), // Same height as top segment + line thickness
          backgroundColor: "#333333",
        }}
      />

      {/* Word display - with ORP aligned to the vertical marker */}
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
          }}
        >
          {/* Position word using existing ORP alignment logic */}
          <div
            style={{
              position: "absolute",
              left: orpLeft,
              display: "flex",
              alignItems: "center",
              transform: `translateX(${getWebTranslateX(wordDisplay)}px)`, // Use existing ORP alignment
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

      {/* WPM indicator - bottom right, on one line */}
      <div
        style={{
          position: "absolute",
          right: 40 * scale, // Use right positioning to prevent cutoff
          top: 744 * scale,
          fontSize: 47.1429 * scale,
          lineHeight: `${56 * scale}px`,
          color: "#4A4A4A",
          fontFamily: MONOSPACE_FONT,
          fontWeight: 500,
          fontStyle: "italic", // Make italic
          whiteSpace: "nowrap", // Keep on one line
        }}
      >
        {currentWPM} wpm
      </div>
    </AbsoluteFill>
  );
};
