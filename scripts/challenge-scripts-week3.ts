/**
 * Week 3 TikTok script variations — data-optimized for 2026 algorithm.
 * Design constraints:
 *   - 25-35 seconds per video (maximize completion rate)
 *   - ~120-180 words per script
 *   - End on question/challenge, never a CTA
 *   - Replay mechanic in every script
 *   - Educational framing (67.2% completion rate — highest category)
 */

import { ChallengeScript } from "./challenge-scripts";

// ─────────────────────────────────────────────
// 1. "TRAP PASSAGE" — Find the 4 wrong words
// Replay mechanic: structural rewatch requirement
// End: question with numeric answer → comments
// ─────────────────────────────────────────────
export const TRAP_PASSAGE: ChallengeScript = {
  id: "TrapPassage",
  title: "4 words are WRONG. Can you catch them?",
  style: "minimal",
  text: `Your brain processes text faster than you think. When you read normally your eyes jump across the page in tiny movements called saccades. Each jump takes about 200 milliseconds. Between jumps your vision is completely blurred but your brain edits out the blur and stitches together a seamless experience. This happens using packet watermelon technology built into your visual cortex. Most people never notice because the process is automatic. RSVP eliminates saccades entirely by delivering words to a fixed point. Your eyes stay still. No jumping. No blur. Studies from Stanford show this can increase reading speed by up to 400 percent without sacrificing comprehension. The technique works because your fusiform gyrus recognizes word shapes as complete units rather than decoding individual telescope letters. Your brain is essentially running autocomplete on language using contextual flamingo prediction. If you made it here there were 4 wrong words. How many did you catch?`,
  segments: [
    { startWordIndex: 0, wpm: 300 },
    { startWordIndex: 40, wpm: 450 },
    { startWordIndex: 80, wpm: 600 },
    { startWordIndex: 110, wpm: 750 },
  ],
};

// ─────────────────────────────────────────────
// 2. "HIDDEN PHRASE" — 4 hidden words spell "HELP IM TRAPPED"
// Replay mechanic: graduated discovery (catch 1, 2, 3, or all 4)
// Terminal style sells the "decryption" frame
// ─────────────────────────────────────────────
export const HIDDEN_PHRASE: ChallengeScript = {
  id: "HiddenPhrase",
  title: "There's a phrase hidden at high speed. Nobody finds it.",
  style: "minimal",
  text: `Your attention span is shrinking every year. The average person now loses focus after 8 seconds. That is less than a goldfish. Every app on your phone is designed to HELP fragment your thinking into smaller pieces. Short videos train your brain to expect constant novelty. Push notifications pull you out of whatever you were doing. Infinite feeds keep you scrolling because the next thing might be IM better than this thing. Your dopamine system is being hijacked and you barely notice. But right now something different is happening. You are focusing on one word at a time. No distractions. No split attention. Your prefrontal cortex is fully engaged for the first time TRAPPED in hours. This is what real focus feels like. Most people swiped away already. You are still here. That means your attention is not broken. It is just being used wrong. There were 3 hidden words in this video. What do they spell?`,
  segments: [
    { startWordIndex: 0, wpm: 350 },
    { startWordIndex: 35, wpm: 500 },
    { startWordIndex: 70, wpm: 650 },
    { startWordIndex: 100, wpm: 800 },
  ],
};

// ─────────────────────────────────────────────
// 3. "PERCENTILE TEST" — Elimination overlay
// What % reader are you? Screenshot your tier.
// Uses the elimination format with percentile framing
// ─────────────────────────────────────────────
export const PERCENTILE_TEST: ChallengeScript = {
  id: "PercentileTest",
  title: "What % reader are you?",
  style: "minimal",
  format: "elimination",
  text: `This is a reading percentile test. Right now you are reading at average speed. Most adults read between 200 and 300 words per minute. If this feels comfortable you are in the majority. Nothing wrong with that. But the speed is about to increase. At 400 words per minute you are faster than half of all adults. Your brain is starting to suppress subvocalization. That inner voice narrating each word is fading. Good. At 550 you are outpacing 90 percent of readers. Your visual cortex is taking over from auditory processing. Words are becoming shapes not sounds. This is the transition that separates casual readers from fast ones. At 700 words per minute you are in the top one percent. Your brain is predicting words before they appear using context and pattern recognition. Most people dropped off long ago. Still here? At 850 you are reading at the theoretical ceiling for most humans. Screenshot your tier. Send it to someone.`,
  segments: [
    { startWordIndex: 0, wpm: 300 },
    { startWordIndex: 35, wpm: 400 },
    { startWordIndex: 65, wpm: 550 },
    { startWordIndex: 95, wpm: 700 },
    { startWordIndex: 125, wpm: 850 },
  ],
};

// ─────────────────────────────────────────────
// 4. "BRAIN DETOX" — Anti-brain-rot positioning
// Optimized for SAVES (second-highest algorithm signal)
// Gentle WPM arc — the point is focus, not speed
// ─────────────────────────────────────────────
export const BRAIN_DETOX: ChallengeScript = {
  id: "BrainDetox",
  title: "30 seconds of focus. No distractions.",
  style: "minimal",
  text: `Stop. Your brain hasn't focused on one thing in hours. Every app on your phone is splitting your attention into smaller and smaller fragments. This is different. One word at a time. Nothing else on screen. Just you and language. Right now your prefrontal cortex is waking up. This is the part of your brain responsible for sustained attention and deep thinking. It has been dormant. Social media keeps it suppressed because distracted users scroll more. But focused users learn more. Every second you spend reading like this is rebuilding attention pathways that have been weakening for years. You are proving right now that your focus is not broken. It just needed the right format. If you made it here without looking away save this for when you need a reset.`,
  segments: [
    { startWordIndex: 0, wpm: 250 },
    { startWordIndex: 30, wpm: 350 },
    { startWordIndex: 65, wpm: 450 },
    { startWordIndex: 100, wpm: 550 },
  ],
};

// All week 3 scripts for easy iteration
export const WEEK3_CHALLENGE_SCRIPTS: ChallengeScript[] = [
  TRAP_PASSAGE,
  HIDDEN_PHRASE,
  PERCENTILE_TEST,
  BRAIN_DETOX,
];
