import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile } from "remotion";
import { tokenizeText, getWordDisplay, getWebTranslateX, type WordDisplay } from "../lib/rsvp-web";

export interface RSVPDemoProps {
  articleText: string;
  wpm: number;
  title: string;
}

const FONT_SIZE = 48; // Larger for video
const PRIMARY_COLOR = "#E53935"; // Your app's red color

export const RSVPDemo: React.FC<RSVPDemoProps> = ({ articleText, wpm, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tokenize text into words
  const words = useMemo(() => tokenizeText(articleText), [articleText]);

  // Calculate which word to show based on WPM and current frame
  // This matches the app's timing logic exactly:
  // - Convert frame to milliseconds: (frame / fps) * 1000
  // - msPerWord = 60000 / wpm
  // - currentWordIndex = Math.floor(elapsedMs / msPerWord)
  const elapsedMs = (frame / fps) * 1000;
  const msPerWord = 60000 / wpm;
  const currentWordIndex = Math.floor(elapsedMs / msPerWord);

  // Get current word display
  const currentWord = words[currentWordIndex] || "";
  const wordDisplay = getWordDisplay(currentWord, FONT_SIZE);

  // Calculate translateX for ORP centering (uses exact same logic as app)
  const translateX = wordDisplay ? getWebTranslateX(wordDisplay) : 0;

  // Progress calculation
  const progress = words.length > 0 ? currentWordIndex / words.length : 0;

  // Show completion screen if done
  const isComplete = currentWordIndex >= words.length;

  // Calculate when reading completes
  const completionFrame = words.length > 0 ? Math.ceil((words.length * msPerWord) / 1000 * fps) : 0;
  const framesAfterCompletion = isComplete ? frame - completionFrame : 0;

  // Outro animation
  const outroOpacity = interpolate(framesAfterCompletion, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const outroScale = interpolate(framesAfterCompletion, [0, 20], [0.95, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#121212",
        fontFamily: "Menlo, Monaco, monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#FAFAFA",
            margin: 0,
            marginBottom: 8,
            maxWidth: "90%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#9E9E9E",
            margin: 0,
          }}
        >
          {words.length} words
        </p>
      </div>

      {/* Main RSVP Display */}
      {!isComplete && wordDisplay && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 120,
            paddingBottom: 200,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 800,
              padding: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Top marker */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 32,
                gap: 16,
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: `16px solid ${PRIMARY_COLOR}`,
                }}
              />
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            </div>

            {/* Word display */}
            <div
              style={{
                height: 120,
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
                marginTop: 32,
                gap: 16,
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderBottom: `16px solid ${PRIMARY_COLOR}`,
                }}
              />
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
            </div>
          </div>
        </div>
      )}

      {/* Completion screen */}
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
            padding: 80,
            background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
            opacity: outroOpacity,
            transform: `scale(${outroScale})`,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 140,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <img
              src={staticFile("logo.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              alt="Speed Reader Logo"
            />
          </div>

          {/* Main CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <h2
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#FAFAFA",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Download the
              <br />
              Speed Reader App
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "20px 40px",
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: PRIMARY_COLOR,
                }}
              >
                ↗
              </div>
              <p
                style={{
                  fontSize: 28,
                  color: "#FAFAFA",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Link in bio
              </p>
            </div>
          </div>

          {/* Stats badge */}
          <div
            style={{
              marginTop: 20,
              padding: "16px 32px",
              borderRadius: 12,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <p
              style={{
                fontSize: 20,
                color: "#9E9E9E",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {words.length} words · {wpm} WPM · {Math.ceil(words.length / wpm)} min saved
            </p>
          </div>
        </div>
      )}

      {/* Bottom controls - only show when NOT complete */}
      {!isComplete && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 32,
          }}
        >
        {/* Progress bar */}
        <div
          style={{
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 16,
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
            fontSize: 18,
            color: "#757575",
            textAlign: "center",
            margin: 0,
            marginBottom: 24,
          }}
        >
          {currentWordIndex} / {words.length}
        </p>

        {/* WPM display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#FAFAFA",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {wpm}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#757575",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              WPM
            </div>
          </div>
        </div>
      </div>
      )}
    </AbsoluteFill>
  );
};
