import { Composition } from "remotion";
import { RSVPDemo } from "./compositions/RSVPDemo";
import { RSVPiPhone } from "./compositions/RSVPiPhone";
import { RSVPiPhoneZoom } from "./compositions/RSVPiPhoneZoom";
import { RSVPiPhoneWithOutro } from "./compositions/RSVPiPhoneWithOutro";
import { RSVPMinimal } from "./compositions/RSVPMinimal";
import { RSVPMinimalVertical } from "./compositions/RSVPMinimalVertical";
import { RSVPTerminal } from "./compositions/RSVPTerminal";
import { RSVPTerminalVertical } from "./compositions/RSVPTerminalVertical";
import { XShareSheetAnimation } from "./compositions/XShareSheetAnimation";
import { ScenicIntroVertical } from "./compositions/ScenicIntroVertical";
import { RSVPEliminationVertical } from "./compositions/RSVPEliminationVertical";
import { tokenizeText, getPunctuationMultiplier, calculateWordTimings } from "../lib/shared-rsvp";
import { SPEED_READING_SCRIPT, WPM_SEGMENTS } from "../scripts/speed-reading-script";
import { ALL_CHALLENGE_SCRIPTS } from "../scripts/challenge-scripts";
import { WEEK2_CHALLENGE_SCRIPTS } from "../scripts/challenge-scripts-week2";
import { WEEK3_CHALLENGE_SCRIPTS } from "../scripts/challenge-scripts-week3";

const DEMO_TEXT = "Welcome to SpeedRead. This is a demonstration of RSVP speed reading technology. The red letter you see is called the Optimal Recognition Point, or ORP. Your eye naturally focuses on this point, allowing you to read faster without moving your eyes. This technique can help you read up to three times faster than traditional reading methods. Try it yourself and see the difference. Speed reading has been used by students, professionals, and anyone who wants to consume more content in less time.";
const WPM = 500;
const FPS = 30;
const OUTRO_SECONDS = 5;

// Calculate duration: time to read all words + 5 seconds for outro
const words = tokenizeText(DEMO_TEXT);
const msPerWord = 60000 / WPM;
const readingTimeSeconds = (words.length * msPerWord) / 1000;
const totalSeconds = readingTimeSeconds + OUTRO_SECONDS;
const durationInFrames = Math.ceil(totalSeconds * FPS);

// For the outro version: Calculate actual reading time with punctuation, then add outro time
const OUTRO_VERSION_TARGET_READING_SECONDS = 3.5; // Reduce reading time to fit more outro
const OUTRO_VERSION_OUTRO_SECONDS = 3.5; // Full outro animation time

// Find words that fit in target reading time (accounting for punctuation)
const targetReadingMs = OUTRO_VERSION_TARGET_READING_SECONDS * 1000;
let outroVersionWordCount = 0;
let cumulativeTime = 0;
const baseDelay = 60000 / WPM;

for (let i = 0; i < words.length; i++) {
  const multiplier = getPunctuationMultiplier(words[i]);
  const wordDuration = baseDelay * multiplier;

  if (cumulativeTime + wordDuration > targetReadingMs) {
    break;
  }

  outroVersionWordCount++;
  cumulativeTime += wordDuration;
}

const outroVersionText = words.slice(0, outroVersionWordCount).join(" ");
const actualReadingSeconds = cumulativeTime / 1000;
const OUTRO_VERSION_TOTAL_SECONDS = actualReadingSeconds + OUTRO_VERSION_OUTRO_SECONDS;
const outroVersionDuration = Math.ceil(OUTRO_VERSION_TOTAL_SECONDS * FPS);

// Calculate duration for speed reading script with dynamic WPM
const speedReadingWords = tokenizeText(SPEED_READING_SCRIPT);
let speedReadingTotalTime = 0;

for (let i = 0; i < speedReadingWords.length; i++) {
  // Find current WPM for this word
  let currentWPM = 300; // default
  for (const segment of WPM_SEGMENTS) {
    if (i >= segment.startWordIndex) {
      currentWPM = segment.wpm;
    }
  }

  const baseDelay = 60000 / currentWPM;
  const multiplier = getPunctuationMultiplier(speedReadingWords[i]);
  speedReadingTotalTime += baseDelay * multiplier;
}

const speedReadingDuration = Math.ceil((speedReadingTotalTime / 1000) * FPS);

// Calculate durations for all challenge scripts
function calcScriptDuration(text: string, segments: { startWordIndex: number; wpm: number }[], defaultWpm: number): number {
  const w = tokenizeText(text);
  let total = 0;
  for (let i = 0; i < w.length; i++) {
    let currentWPM = defaultWpm;
    for (const seg of segments) {
      if (i >= seg.startWordIndex) currentWPM = seg.wpm;
    }
    const d = 60000 / currentWPM;
    const m = getPunctuationMultiplier(w[i]);
    total += d * m;
  }
  return Math.ceil((total / 1000) * FPS);
}

const challengeDurations = [...ALL_CHALLENGE_SCRIPTS, ...WEEK2_CHALLENGE_SCRIPTS, ...WEEK3_CHALLENGE_SCRIPTS].map((s) => ({
  ...s,
  duration: calcScriptDuration(s.text, s.segments, s.segments[0]?.wpm || 300),
}));

// Scenic intro pairings: each week 2 script gets a nature clip intro
const INTRO_DURATION = 3; // seconds of scenic footage
const FADE_DURATION = 0.8; // crossfade seconds
const introFrames = Math.ceil(INTRO_DURATION * FPS);

const scenicPairings = [
  { scriptId: "TypoglycemiaTest", clip: "scenic-09-mountain-sunset.mp4", hook: "Raed tihs.\nYou jsut did." },
  { scriptId: "BookClubBluff", clip: "scenic-03-tree-field.mp4", hook: "book club in 3 hours\nyou read 0 pages\nyou're cooked" },
  { scriptId: "TheyDontWantYou", clip: "scenic-01-icicles.mp4", hook: "You weren't supposed\nto see this." },
  { scriptId: "SaccadeScience", clip: "scenic-05-mountain-lake.mp4", hook: "Read this\nwithout moving your eyes." },
  { scriptId: "TextbookRevenge", clip: "scenic-07-sunflower-sunset.mp4", hook: "$400 on textbooks.\nNever opened them." },
  { scriptId: "OptimalRecognitionPoint", clip: "scenic-06-wildflowers.mp4", hook: "You're reading\nevery word wrong." },
  { scriptId: "SundayScaries", clip: "scenic-08-golden-field.mp4", hook: "Sunday night.\nDue tomorrow.\nHaven't started." },
];

const scenicCompositions = scenicPairings.map((pairing) => {
  const script = WEEK2_CHALLENGE_SCRIPTS.find((s) => s.id === pairing.scriptId)!;
  const rsvpDuration = calcScriptDuration(script.text, script.segments, script.segments[0]?.wpm || 300);
  return {
    ...script,
    compositionId: `Scenic-${script.id}`,
    clip: pairing.clip,
    hook: pairing.hook,
    totalDuration: introFrames + rsvpDuration,
  };
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RSVPDemo"
        component={RSVPDemo}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
          title: "Demo: Speed Reading Technology",
        }}
      />
      <Composition
        id="RSVPiPhone"
        component={RSVPiPhone}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
          title: "Demo: Speed Reading Technology",
          // Adjust these to match your iPhone frame screen area
          screenX: 240,
          screenY: 80,
          screenWidth: 600,
          screenHeight: 920,
        }}
      />
      <Composition
        id="RSVPiPhoneZoom"
        component={RSVPiPhoneZoom}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
          title: "Demo: Speed Reading Technology",
          screenX: 240,
          screenY: 80,
          screenWidth: 600,
          screenHeight: 920,
        }}
      />
      <Composition
        id="RSVPiPhoneWithOutro"
        component={RSVPiPhoneWithOutro}
        durationInFrames={outroVersionDuration}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: outroVersionText,
          wpm: WPM,
          title: "Speed Reading Demo",
          screenX: 240,
          screenY: 80,
          screenWidth: 600,
          screenHeight: 920,
          outroDuration: OUTRO_VERSION_OUTRO_SECONDS,
        }}
      />
      <Composition
        id="XShareSheetAnimation"
        component={XShareSheetAnimation}
        durationInFrames={120}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="RSVPMinimal"
        component={RSVPMinimal}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
        }}
      />
      <Composition
        id="SpeedReadingChallenge"
        component={RSVPMinimal}
        durationInFrames={speedReadingDuration}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: SPEED_READING_SCRIPT,
          wpm: 300, // Starting WPM
          wpmSegments: WPM_SEGMENTS, // Dynamic WPM changes
        }}
      />
      <Composition
        id="RSVPTerminal"
        component={RSVPTerminal}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
        }}
      />
      <Composition
        id="TerminalChallenge"
        component={RSVPTerminal}
        durationInFrames={speedReadingDuration}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{
          articleText: SPEED_READING_SCRIPT,
          wpm: 300, // Starting WPM
          wpmSegments: WPM_SEGMENTS, // Dynamic WPM changes
        }}
      />
      <Composition
        id="RSVPMinimalVertical"
        component={RSVPMinimalVertical}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
        }}
      />
      <Composition
        id="VerticalChallenge"
        component={RSVPMinimalVertical}
        durationInFrames={speedReadingDuration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          articleText: SPEED_READING_SCRIPT,
          wpm: 300, // Starting WPM
          wpmSegments: WPM_SEGMENTS, // Dynamic WPM changes
          title: "Can you keep up?",
        }}
      />
      <Composition
        id="RSVPTerminalVertical"
        component={RSVPTerminalVertical}
        durationInFrames={durationInFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          articleText: DEMO_TEXT,
          wpm: WPM,
        }}
      />
      <Composition
        id="TerminalVerticalChallenge"
        component={RSVPTerminalVertical}
        durationInFrames={speedReadingDuration}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          articleText: SPEED_READING_SCRIPT,
          wpm: 300, // Starting WPM
          wpmSegments: WPM_SEGMENTS, // Dynamic WPM changes
          title: "SPEED TEST INITIATED",
        }}
      />
      {/* Challenge script variations */}
      {challengeDurations.map((s) => {
        const format = ("format" in s ? s.format : undefined) || "standard";
        let ComponentToUse: React.FC<any>;
        if (format === "elimination") {
          ComponentToUse = RSVPEliminationVertical;
        } else if (s.style === "terminal") {
          ComponentToUse = RSVPTerminalVertical;
        } else {
          ComponentToUse = RSVPMinimalVertical;
        }
        return (
          <Composition
            key={s.id}
            id={s.id}
            component={ComponentToUse}
            durationInFrames={s.duration}
            fps={FPS}
            width={1080}
            height={1920}
            defaultProps={{
              articleText: s.text,
              wpm: s.segments[0]?.wpm || 300,
              wpmSegments: s.segments,
              title: s.title,
            }}
          />
        );
      })}
      {/* Scenic intro versions — nature clip fades into RSVP */}
      {scenicCompositions.map((s) => (
        <Composition
          key={s.compositionId}
          id={s.compositionId}
          component={ScenicIntroVertical}
          durationInFrames={s.totalDuration}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{
            scenicClip: s.clip,
            introDurationSeconds: INTRO_DURATION,
            fadeDurationSeconds: FADE_DURATION,
            hookText: s.hook,
            musicFile: "bg-music.mp3",
            musicDropSeconds: 34.8,
            musicVolume: 0.6,
            articleText: s.text,
            wpm: s.segments[0]?.wpm || 300,
            wpmSegments: s.segments,
            title: s.title,
            style: "minimal",
          }}
        />
      ))}
    </>
  );
};
