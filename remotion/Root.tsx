import { Composition } from "remotion";
import { RSVPDemo } from "./compositions/RSVPDemo";
import { RSVPiPhone } from "./compositions/RSVPiPhone";
import { RSVPiPhoneZoom } from "./compositions/RSVPiPhoneZoom";
import { RSVPiPhoneWithOutro } from "./compositions/RSVPiPhoneWithOutro";
import { XShareSheetAnimation } from "./compositions/XShareSheetAnimation";
import { tokenizeText, getPunctuationMultiplier } from "../lib/shared-rsvp";

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
    </>
  );
};
