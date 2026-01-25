import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX, type WordDisplay } from "../lib/rsvp-web";

export interface RSVPiPhoneWithOutroProps {
  articleText: string;
  wpm: number;
  title: string;
  // Screen area coordinates (adjustable)
  screenX?: number;
  screenY?: number;
  screenWidth?: number;
  screenHeight?: number;
  // Outro duration in seconds
  outroDuration?: number;
  // Total word count of the full article (for progress display)
  totalWordCount?: number;
}

const FONT_SIZE = 36; // Smaller for phone screen
const PRIMARY_COLOR = "#E53935";

export const RSVPiPhoneWithOutro: React.FC<RSVPiPhoneWithOutroProps> = ({
  articleText,
  wpm,
  title,
  screenX = 240,      // Default X offset (same as other compositions)
  screenY = 80,       // Default Y offset (same as other compositions)
  screenWidth = 600,  // Default screen width
  screenHeight = 920, // Default screen height
  outroDuration = 3,  // Default outro duration in seconds
  totalWordCount,     // Total word count of full article
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom animation starting at 0.5 seconds
  const zoomStartFrame = 15; // 0.5 seconds at 30fps
  const zoomProgress = spring({
    frame: frame - zoomStartFrame,
    fps,
    config: {
      damping: 15,      // Professional smooth feel (15 = balanced, 5 = bouncy, 20+ = stiff)
      stiffness: 230,   // Snappier for social media attention (230 = attention-grabbing)
      mass: 0.5,        // Light and quick (0.5 = fast, 1 = normal, 2+ = slow)
    },
  });

  // Title emphasis right when zoom finishes (don't compete for attention)
  const titleEmphasisScale = interpolate(
    frame,
    [20, 22], // Quick 2-frame punch
    [1, 1.05], // More noticeable emphasis
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => t * (2 - t), // smooth ease-out
    }
  );
  const titleGlow = interpolate(
    frame,
    [20, 22],
    [0, 0.3], // More visible glow
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp"
    }
  );

  // Calculate zoom and position
  const scale = interpolate(
    zoomProgress,
    [0, 1],
    [1, 1.8], // Zoom from 1x to 1.8x
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    zoomProgress,
    [0, 1],
    [0, 110], // Move down to center on the reader component
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Tokenize text into words
  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  // Calculate which word to show based on WPM and current frame
  const elapsedMs = (frame / fps) * 1000;
  const msPerWord = 60000 / wpm;
  const currentWordIndex = Math.floor(elapsedMs / msPerWord);

  // Show completion screen if done
  const isComplete = currentWordIndex >= words.length;

  // Get current word display (show last word during outro)
  const currentWord = isComplete ? words[words.length - 1] || "" : (words[currentWordIndex] || "");
  const wordDisplay = getWordDisplay(currentWord, FONT_SIZE);

  // Calculate translateX for ORP centering
  const translateX = wordDisplay ? getWebTranslateX(wordDisplay) : 0;

  // Progress calculation based on total article word count
  const displayWordCount = totalWordCount || words.length;
  const progress = displayWordCount > 0 ? (isComplete ? words.length / displayWordCount : currentWordIndex / displayWordCount) : 0;

  // Calculate when reading completes
  const completionFrame = words.length > 0 ? Math.ceil((words.length * msPerWord) / 1000 * fps) : 0;
  const framesAfterCompletion = isComplete ? frame - completionFrame : 0;

  // Phone slides out to the left (extra fast)
  const phoneSlideX = interpolate(framesAfterCompletion, [0, 10], [0, -1100], {
    extrapolateRight: "clamp",
    easing: (t) => t * t * t, // ease-in cubic for speed
  });
  const phoneFadeOut = interpolate(framesAfterCompletion, [7, 11], [1, 0], { extrapolateRight: "clamp" });

  // Icon scales and fades in quickly after phone is gone
  const iconScale = spring({
    frame: framesAfterCompletion - 10,
    fps,
    config: {
      damping: 7,
      stiffness: 350,
      mass: 0.4,
    },
  });
  const iconOpacity = interpolate(framesAfterCompletion, [10, 20], [0, 1], { extrapolateRight: "clamp" });

  // Text animates in quickly with subtle scale + movement
  const textScale = spring({
    frame: framesAfterCompletion - 16,
    fps,
    config: {
      damping: 12,
      stiffness: 250,
      mass: 0.6,
    },
  });
  const textY = interpolate(framesAfterCompletion, [16, 28], [25, 0], {
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t), // smoother ease-in-out
  });
  const textOpacity = interpolate(framesAfterCompletion, [16, 26], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily: "Menlo, Monaco, monospace",
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: "center center",
      }}
    >
      {/* Plain iPhone Frame Background - stays throughout */}
      <img
        src={staticFile("iPhone Frame.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1080,
          objectFit: "contain",
        }}
        alt="iPhone Frame Background"
      />

      {/* Wrapper for all sliding content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: isComplete ? `translateX(${phoneSlideX}px)` : "none",
          opacity: isComplete ? phoneFadeOut : 1,
        }}
      >
        {/* Phone image positioned on top - slides out when outro starts */}
        <img
          src={staticFile("Group 23911.png")}
          style={{
            position: "absolute",
            top: -4,
            left: 257,
          }}
          alt="Phone"
        />

        {/* Title - positioned above reader area */}
        <div
          style={{
            position: "absolute",
            left: screenX + 90,
            top: screenY + 135,
            width: screenWidth - 180,
            textAlign: "center",
            transform: `scale(${titleEmphasisScale})`,
            opacity: isComplete ? phoneFadeOut : 1,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#FAFAFA",
              margin: 0,
              lineHeight: "1.3",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
              wordWrap: "break-word",
              whiteSpace: "normal",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textShadow: `0 0 ${20 * titleGlow}px rgba(255, 255, 255, ${titleGlow})`,
            }}
          >
            {title}
          </h1>
        </div>

        {/* RSVP Word Display - centered with background card */}
        {wordDisplay && (
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

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 355,
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
            {isComplete ? words.length : currentWordIndex} / {totalWordCount || words.length}
          </p>
        </div>
      </div>

      {/* Outro screen with TestFlight download */}
      {isComplete && (
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
            flexDirection: "column",
            gap: 40,
            paddingBottom: 200,
          }}
        >
            {/* TestFlight Logo - scales and fades in */}
            <img
              src={staticFile("testflight-logo.png")}
              style={{
                width: 180,
                height: 180,
                transform: `scale(${iconScale})`,
                opacity: iconOpacity,
              }}
              alt="TestFlight Logo"
            />

            {/* Download Text - fades up with scale */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                transform: `translateY(${textY}px) scale(${textScale})`,
                opacity: textOpacity,
              }}
            >
              <h2
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#FAFAFA",
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                }}
              >
                Download on
              </h2>
              <p
                style={{
                  fontSize: 56,
                  color: "#FAFAFA",
                  margin: 0,
                  fontWeight: 700,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                TestFlight
              </p>
              <p
                style={{
                  fontSize: 22,
                  color: "#9E9E9E",
                  margin: 0,
                  marginTop: 8,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                }}
              >
                Link in bio
              </p>
            </div>
          </div>
      )}
    </AbsoluteFill>
  );
};
