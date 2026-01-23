/**
 * Shared RSVP Engine Module
 * 
 * This module contains all the RSVP (Rapid Serial Visual Presentation) logic
 * that is shared between the main app and the share extension.
 * 
 * Features:
 * - Timestamp-based WPM timing using requestAnimationFrame
 * - ORP (Optimal Recognition Point) calculation
 * - Text tokenization and filtering
 * - Word display calculations with dynamic font scaling
 */

// Constants
export const MIN_WPM = 100;
export const MAX_WPM = 1000;
export const WPM_STEP = 50;
export const DEFAULT_FONT_SIZE = 24;
export const MAX_WORD_LENGTH = 12; // Words longer than this will be scaled down

/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 * The ORP is the letter that should be highlighted and centered for fastest recognition.
 */
export function calculateORPIndex(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return Math.floor(len * 0.3);
}

/**
 * Calculate the delay between words in milliseconds for a given WPM.
 * Pure WPM calculation - no adjustments for accurate timing.
 */
export function calculateWordDelay(wpm: number): number {
  return 60000 / wpm;
}

/**
 * Tokenize text into words suitable for RSVP display.
 * Handles punctuation, numbers, and special characters.
 * Filters out standalone punctuation and paragraph markers.
 * Splits hyphenated words for better display (e.g., "bank-fintech" → ["bank-", "fintech"])
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/\n+/g, " ")
    .split(/\s+/)
    .flatMap((word) => {
      // Split hyphenated words (keep hyphen with first part)
      if (word.includes('-') && word.length > 3) {
        const parts = word.split('-');
        return parts.map((part, i) =>
          i < parts.length - 1 ? part + '-' : part
        ).filter(p => p.length > 0);
      }
      return [word];
    })
    .map((word) => word.trim())
    .filter((word) => {
      // Filter out empty strings
      if (word.length === 0) return false;
      // Filter out standalone punctuation and symbols (but allow hyphens as part of words)
      // Keep words that have at least one letter or number
      if (!/[a-zA-Z0-9]/.test(word)) return false;
      // Filter out paragraph markers
      if (word === "¶") return false;
      return true;
    });
}

/**
 * Get word display parts for RSVP rendering.
 * Returns the before, ORP, and after parts of the word, plus the effective font size.
 */
export interface WordDisplay {
  before: string;
  orp: string;
  after: string;
  fontSize: number;
  word: string;
}

export function getWordDisplay(word: string, baseFontSize: number = DEFAULT_FONT_SIZE): WordDisplay | null {
  if (!word) return null;
  const orpIndex = calculateORPIndex(word);
  const before = word.slice(0, orpIndex);
  const orp = word[orpIndex] || "";
  const after = word.slice(orpIndex + 1);
  
  // Scale down font for long words to prevent overflow
  const wordLen = word.length;
  const scaleFactor = wordLen > MAX_WORD_LENGTH ? MAX_WORD_LENGTH / wordLen : 1;
  const effectiveFontSize = baseFontSize * scaleFactor;
  
  return { before, orp, after, fontSize: effectiveFontSize, word };
}

/**
 * Calculate translateX offset for ORP centering.
 *
 * Since the wordRow is centered in its container (via alignItems: "center"),
 * we need to shift so the ORP letter's center aligns with the container center.
 *
 * Math: shift = (after.length - before.length) / 2 * charWidth
 * (positive = shift right, negative = shift left)
 *
 * Menlo monospace: character width is approximately 0.6 * fontSize
 */
export function estimateTranslateX(wordDisplay: WordDisplay): number {
  const charWidth = wordDisplay.fontSize * 0.6;
  const beforeLen = wordDisplay.before.length;
  const afterLen = wordDisplay.after.length;
  return ((afterLen - beforeLen) / 2) * charWidth;
}

/**
 * RSVP Playback State
 * Represents the current state of the RSVP reader.
 */
export type RSVPState = "loading" | "ready" | "playing" | "paused" | "complete" | "error";

/**
 * RSVP Engine Configuration
 */
export interface RSVPEngineConfig {
  initialWpm?: number;
  baseFontSize?: number;
}

/**
 * RSVP Engine State
 * All the state needed for RSVP playback.
 */
export interface RSVPEngineState {
  words: string[];
  currentIndex: number;
  wpm: number;
  state: RSVPState;
}

/**
 * Create initial RSVP engine state
 */
export function createInitialState(config: RSVPEngineConfig = {}): RSVPEngineState {
  return {
    words: [],
    currentIndex: 0,
    wpm: config.initialWpm ?? 300,
    state: "ready",
  };
}

/**
 * Calculate progress (0-1) from current state
 */
export function calculateProgress(state: RSVPEngineState): number {
  if (state.words.length === 0) return 0;
  return state.currentIndex / state.words.length;
}

/**
 * Check if reading is complete
 */
export function isComplete(state: RSVPEngineState): boolean {
  return state.currentIndex >= state.words.length && state.words.length > 0;
}

/**
 * Check if there is content to read
 */
export function hasContent(state: RSVPEngineState): boolean {
  return state.words.length > 0;
}

/**
 * Get current word from state
 */
export function getCurrentWord(state: RSVPEngineState): string {
  return state.words[state.currentIndex] || "";
}

/**
 * Get next word from state (for pre-rendering)
 */
export function getNextWord(state: RSVPEngineState): string {
  return state.words[state.currentIndex + 1] || "";
}

/**
 * Clamp WPM to valid range
 */
export function clampWpm(wpm: number): number {
  return Math.max(MIN_WPM, Math.min(MAX_WPM, wpm));
}

/**
 * Adjust WPM by a delta amount
 */
export function adjustWpm(currentWpm: number, delta: number): number {
  return clampWpm(currentWpm + delta);
}
