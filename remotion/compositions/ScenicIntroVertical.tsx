import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  OffthreadVideo,
  staticFile,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { RSVPMinimalVertical, WPMSegment } from "./RSVPMinimalVertical";
import { RSVPTerminalVertical } from "./RSVPTerminalVertical";

export interface ScenicIntroVerticalProps {
  scenicClip: string;
  introDurationSeconds: number;
  fadeDurationSeconds: number;
  hookText: string;
  musicFile?: string; // e.g. "bg-music.mp3"
  musicDropSeconds?: number; // timestamp of the drop in the music track
  musicVolume?: number;
  // RSVP props
  articleText: string;
  wpm: number;
  wpmSegments?: WPMSegment[];
  title?: string;
  style?: "minimal" | "terminal";
}

// Captions-style word-by-word text animation
const CaptionsHookText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  introFrames: number;
  fadeFrames: number;
}> = ({ text, frame, fps, introFrames, fadeFrames }) => {
  // Split by \n first to get lines, then words within lines
  const lines = text.split("\n");
  const allWords: { word: string; lineIndex: number }[] = [];
  lines.forEach((line, lineIndex) => {
    line.split(/\s+/).filter(Boolean).forEach((word) => {
      allWords.push({ word, lineIndex });
    });
  });

  // Each word pops in staggered — 4 frames apart
  const staggerDelay = 4;
  const startDelay = Math.round(fps * 0.15); // slight pause before first word

  // Fade out all text together before scenic fades
  const fadeOutOpacity = interpolate(
    frame,
    [introFrames - fadeFrames - 5, introFrames - fadeFrames + 5],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Group words by line for layout
  const lineGroups: { word: string; globalIndex: number }[][] = [];
  let globalIndex = 0;
  lines.forEach((line) => {
    const words = line.split(/\s+/).filter(Boolean);
    const group: { word: string; globalIndex: number }[] = [];
    words.forEach((word) => {
      group.push({ word, globalIndex });
      globalIndex++;
    });
    lineGroups.push(group);
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        opacity: fadeOutOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {lineGroups.map((lineWords, lineIdx) => (
          <div
            key={lineIdx}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 18px",
            }}
          >
            {lineWords.map(({ word, globalIndex: gi }) => {
              const wordFrame = startDelay + gi * staggerDelay;
              const isVisible = frame >= wordFrame;

              const wordScale = spring({
                frame: Math.max(0, frame - wordFrame),
                fps,
                config: { damping: 14, stiffness: 180, mass: 0.6 },
              });

              const wordOpacity = interpolate(
                frame,
                [wordFrame, wordFrame + 3],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              return (
                <span
                  key={gi}
                  style={{
                    fontSize: 76,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                    lineHeight: 1.15,
                    letterSpacing: "-1.5px",
                    textShadow:
                      "0 4px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)",
                    opacity: isVisible ? wordOpacity : 0,
                    transform: isVisible
                      ? `scale(${wordScale}) translateY(${(1 - wordScale) * 8}px)`
                      : "scale(0.7) translateY(8px)",
                    display: "inline-block",
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ScenicIntroVertical: React.FC<ScenicIntroVerticalProps> = ({
  scenicClip,
  introDurationSeconds,
  fadeDurationSeconds,
  hookText,
  musicFile,
  musicDropSeconds,
  musicVolume = 0.7,
  articleText,
  wpm,
  wpmSegments,
  title,
  style = "minimal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introFrames = Math.ceil(introDurationSeconds * fps);
  const fadeFrames = Math.ceil(fadeDurationSeconds * fps);

  // Music offset: start the track so the drop lands right at the RSVP start
  // drop happens at musicDropSeconds in the track
  // we want it to hit at introFrames (when RSVP begins)
  const musicStartFrom = useMemo(() => {
    if (!musicDropSeconds) return 0;
    // Start the music so the drop aligns with introFrames
    // offset = dropTime - introDuration (both in seconds)
    return Math.max(0, musicDropSeconds - introDurationSeconds);
  }, [musicDropSeconds, introDurationSeconds]);

  // Scenic clip: fully visible, then fades out
  const scenicOpacity = interpolate(
    frame,
    [introFrames - fadeFrames, introFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle slow zoom on the scenic clip
  const scenicScale = interpolate(
    frame,
    [0, introFrames],
    [1, 1.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Dark overlay for text readability
  const overlayOpacity = interpolate(
    frame,
    [0, fps * 0.15, introFrames - fadeFrames, introFrames],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const RSVPComponent = style === "terminal" ? RSVPTerminalVertical : RSVPMinimalVertical;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Background music — plays through entire video */}
      {musicFile && (
        <Audio
          src={staticFile(musicFile)}
          startFrom={Math.round(musicStartFrom * fps)}
          volume={(f) => {
            // Fade in at start
            const fadeIn = interpolate(f, [0, fps * 0.5], [0, musicVolume], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return fadeIn;
          }}
        />
      )}

      {/* Scenic video intro */}
      {frame < introFrames + fadeFrames && (
        <AbsoluteFill style={{ opacity: scenicOpacity }}>
          {/* Video with slow zoom */}
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <OffthreadVideo
              src={staticFile(scenicClip)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${scenicScale})`,
                transformOrigin: "center center",
              }}
            />
          </div>

          {/* Dark vignette overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.65) 100%)",
              opacity: overlayOpacity,
            }}
          />

          {/* Captions-style word-by-word hook */}
          <CaptionsHookText
            text={hookText}
            frame={frame}
            fps={fps}
            introFrames={introFrames}
            fadeFrames={fadeFrames}
          />
        </AbsoluteFill>
      )}

      {/* RSVP content — starts after intro, word timing begins at 0 */}
      <Sequence from={introFrames} layout="none">
        <AbsoluteFill>
          <RSVPComponent
            articleText={articleText}
            wpm={wpm}
            wpmSegments={wpmSegments}
            title={title}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
