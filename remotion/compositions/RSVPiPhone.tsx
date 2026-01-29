import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX, type WordDisplay } from "../lib/rsvp-web";

export interface RSVPiPhoneProps {
  articleText: string;
  wpm: number;
  title: string;
  // Screen area coordinates (adjustable)
  screenX?: number;
  screenY?: number;
  screenWidth?: number;
  screenHeight?: number;
}

const FONT_SIZE = 36; // Smaller for phone screen
const PRIMARY_COLOR = "#E53935";

export const RSVPiPhone: React.FC<RSVPiPhoneProps> = ({
  articleText,
  wpm,
  title,
  screenX = 240,      // Default X offset
  screenY = 80,       // Default Y offset
  screenWidth = 600,  // Default screen width
  screenHeight = 920, // Default screen height
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tokenize text into words
  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  // Calculate which word to show based on WPM and current frame
  const elapsedMs = (frame / fps) * 1000;
  const msPerWord = 60000 / wpm;
  const currentWordIndex = Math.floor(elapsedMs / msPerWord);

  // Get current word display
  const currentWord = words[currentWordIndex] || "";
  const wordDisplay = getWordDisplay(currentWord, FONT_SIZE);

  // Calculate translateX for ORP centering
  const translateX = wordDisplay ? getWebTranslateX(wordDisplay) : 0;

  // Progress calculation
  const progress = words.length > 0 ? currentWordIndex / words.length : 0;

  // Show completion screen if done
  const isComplete = currentWordIndex >= words.length;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily: "Menlo, Monaco, monospace",
      }}
    >
      {/* iPhone Frame Background */}
      <img
        src={staticFile("iPhone Frame(2).png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "contain",
        }}
        alt="iPhone Frame"
      />

      {/* Title - positioned above reader area */}
      <div
        style={{
          position: "absolute",
          left: screenX + 60,
          top: screenY + 40,
          width: screenWidth - 120,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#FAFAFA",
            margin: 0,
            lineHeight: "1.4",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
            wordWrap: "break-word",
            whiteSpace: "normal",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </h1>
      </div>

      {/* RSVP Word Display - centered with background card */}
      {!isComplete && wordDisplay && (
        <div
          style={{
            position: "absolute",
            left: screenX + 40,  // Add padding from edges
            top: screenY + 250,
            width: screenWidth - 80,  // Narrower width
            padding: 32,
            borderRadius: 20,
            backgroundColor: "rgba(30, 30, 30, 0.95)",  // Dark background card
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transform: "scale(0.85)",
            transformOrigin: "center center",
          }}
        >
          {/* Top marker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: `12px solid ${PRIMARY_COLOR}`,
              }}
            />
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
          </div>

          {/* Word display */}
          <div
            style={{
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                display: "flex",
                alignItems: "center",
                transform: `translateX(${translateX}px)`,
              }}
            >
              <span
                style={{
                  fontSize: wordDisplay.fontSize,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  fontFamily: "Menlo, Monaco, monospace",
                }}
              >
                {wordDisplay.before}
              </span>
              <span
                style={{
                  fontSize: wordDisplay.fontSize,
                  fontWeight: 700,
                  color: PRIMARY_COLOR,
                  fontFamily: "Menlo, Monaco, monospace",
                }}
              >
                {wordDisplay.orp}
              </span>
              <span
                style={{
                  fontSize: wordDisplay.fontSize,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  fontFamily: "Menlo, Monaco, monospace",
                }}
              >
                {wordDisplay.after}
              </span>
            </div>
          </div>

          {/* Bottom marker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              gap: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: `12px solid ${PRIMARY_COLOR}`,
              }}
            />
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
          </div>
        </div>
      )}

      {/* Progress bar - only show when NOT complete */}
      {!isComplete && (
        <div
          style={{
            position: "absolute",
            bottom: 350,
            left: screenX + 40 + (screenWidth - 80) * 0.1 - 2,
            width: (screenWidth - 80) * 0.8,
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: 3,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                backgroundColor: PRIMARY_COLOR,
                borderRadius: 2,
              }}
            />
          </div>

          {/* Progress text */}
          <p
            style={{
              fontSize: 16,
              color: "#757575",
              textAlign: "center",
              margin: 0,
            }}
          >
            {currentWordIndex} / {words.length}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
