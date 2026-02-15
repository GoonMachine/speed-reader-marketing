import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX } from "../lib/rsvp-web";
import { calculateWordTimings, getPunctuationMultiplier } from "../../lib/shared-rsvp";

export interface WPMSegment {
  startWordIndex: number;
  wpm: number;
  displayWpm?: number;
}

export interface RSVPTerminalVerticalProps {
  articleText: string;
  wpm: number;
  wpmSegments?: WPMSegment[];
  title?: string;
}

const FONT_SIZE = 88;
const PRIMARY_COLOR = "#00FF41"; // Matrix green
const SECONDARY_COLOR = "#008F11"; // Darker green
const TERMINAL_FONT = "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace";

export const RSVPTerminalVertical: React.FC<RSVPTerminalVerticalProps> = ({
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

  // Blinking cursor animation
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Scanline animation
  const scanlineY = (frame * 3) % height;

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
      {/* Scanline effect */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: scanlineY,
          width: "100%",
          height: 2,
          backgroundColor: PRIMARY_COLOR,
          opacity: 0.1,
        }}
      />

      {/* CRT screen glow effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(0, 255, 65, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* Terminal header */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontSize: 28,
          fontFamily: TERMINAL_FONT,
          color: SECONDARY_COLOR,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>root@speedread:~$</span>
          <span style={{ color: PRIMARY_COLOR }}>read --fast</span>
          {cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 28,
                backgroundColor: PRIMARY_COLOR,
                marginLeft: 4,
              }}
            />
          )}
        </div>
        {title && (
          <div
            style={{
              fontSize: 24,
              color: "#666666",
              marginTop: 8,
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Top horizontal line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: wordAreaTop,
          width: "100%",
          height: 4,
          backgroundColor: PRIMARY_COLOR,
          boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
        }}
      />

      {/* Bottom horizontal line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: wordAreaTop + wordAreaHeight,
          width: "100%",
          height: 4,
          backgroundColor: PRIMARY_COLOR,
          boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
        }}
      />

      {/* Vertical line - top segment */}
      <div
        style={{
          position: "absolute",
          left: centerX - 2,
          top: wordAreaTop,
          width: 4,
          height: (wordAreaHeight / 2 - 200),
          backgroundColor: PRIMARY_COLOR,
          boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
        }}
      />

      {/* Vertical line - bottom segment */}
      <div
        style={{
          position: "absolute",
          left: centerX - 2,
          top: wordAreaTop + (wordAreaHeight / 2 + 200),
          width: 4,
          height: (wordAreaHeight / 2 - 200) + 4,
          backgroundColor: PRIMARY_COLOR,
          boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
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
                color: SECONDARY_COLOR,
                fontFamily: TERMINAL_FONT,
                textShadow: `0 0 5px ${SECONDARY_COLOR}`,
              }}
            >
              {wordDisplay.before}
            </span>
            <span
              style={{
                fontSize: wordDisplay.fontSize,
                fontWeight: 700,
                color: PRIMARY_COLOR,
                fontFamily: TERMINAL_FONT,
                textShadow: `0 0 15px ${PRIMARY_COLOR}`,
              }}
            >
              {wordDisplay.orp}
            </span>
            <span
              style={{
                fontSize: wordDisplay.fontSize,
                fontWeight: 500,
                color: SECONDARY_COLOR,
                fontFamily: TERMINAL_FONT,
                textShadow: `0 0 5px ${SECONDARY_COLOR}`,
              }}
            >
              {wordDisplay.after}
            </span>
          </div>
        </div>
      )}

      {/* WPM indicator - bottom right */}
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 200,
          fontSize: 48,
          lineHeight: "56px",
          color: SECONDARY_COLOR,
          fontFamily: TERMINAL_FONT,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: PRIMARY_COLOR }}>[</span>
        {currentWPM}
        <span style={{ color: PRIMARY_COLOR }}> wpm]</span>
      </div>

      {/* Progress bar - terminal style */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 100,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: TERMINAL_FONT,
          fontSize: 32,
          color: SECONDARY_COLOR,
        }}
      >
        <span style={{ color: PRIMARY_COLOR }}>[</span>
        <div style={{ flex: 1, height: 4, backgroundColor: "#001a00", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${((currentWordIndex + 1) / words.length) * 100}%`,
              backgroundColor: PRIMARY_COLOR,
              boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
            }}
          />
        </div>
        <span style={{ color: PRIMARY_COLOR }}>{Math.round(((currentWordIndex + 1) / words.length) * 100)}%]</span>
      </div>

      {/* Word counter - bottom left */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 200,
          fontSize: 36,
          color: SECONDARY_COLOR,
          fontFamily: TERMINAL_FONT,
          fontWeight: 500,
        }}
      >
        <span style={{ color: PRIMARY_COLOR }}>&gt;</span> {currentWordIndex + 1}/{words.length}
      </div>

      {/* Vignette effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
