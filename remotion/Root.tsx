import { Composition } from "remotion";
import { RSVPDemo } from "./compositions/RSVPDemo";
import { RSVPiPhone } from "./compositions/RSVPiPhone";
import { tokenizeText } from "../lib/shared-rsvp";

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
    </>
  );
};
