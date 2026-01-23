/**
 * Web-compatible RSVP helpers for Remotion
 * Uses the same logic as the app but adapted for web/DOM instead of React Native
 */

import {
  tokenizeText,
  getWordDisplay,
  type WordDisplay,
} from "../../lib/shared-rsvp";

/**
 * Calculate actual translateX for web using canvas text measurement
 * This matches the app's measured approach instead of estimation
 */
export function getWebTranslateX(wordDisplay: WordDisplay): number {
  if (typeof window === "undefined") return 0;

  // Create a temporary canvas for text measurement
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  // Set font to match what we're rendering
  ctx.font = `600 ${wordDisplay.fontSize}px Menlo, Monaco, monospace`;
  const beforeWidth = ctx.measureText(wordDisplay.before).width;

  // ORP uses fontWeight 700, so measure separately
  ctx.font = `700 ${wordDisplay.fontSize}px Menlo, Monaco, monospace`;
  const orpWidth = ctx.measureText(wordDisplay.orp).width;

  // Use the same formula as the app: -(beforeWidth + orpWidth/2)
  return -(beforeWidth + orpWidth / 2);
}

export { tokenizeText, getWordDisplay };
export type { WordDisplay };
