import { createCanvas, loadImage } from "canvas";

const WIDTH = 1024;
const HEIGHT = 1536;

// Oliver's lesson: font size 6.5% of width, positioned below TikTok status bar
const FONT_SIZE = Math.round(WIDTH * 0.065);
const LINE_HEIGHT = FONT_SIZE * 1.3;
const MAX_TEXT_WIDTH = WIDTH * 0.85;
const TEXT_Y_START = HEIGHT * 0.35; // Below TikTok status bar, centered vertically

export async function addTextOverlay(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Draw the base image
  const img = await loadImage(imageBuffer);
  ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

  // Semi-transparent dark overlay for text readability
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Text styling
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${FONT_SIZE}px "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Text shadow for extra readability
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // Word wrap
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > MAX_TEXT_WIDTH && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Center text block vertically in the middle area
  const totalTextHeight = lines.length * LINE_HEIGHT;
  const startY = TEXT_Y_START - totalTextHeight / 2 + HEIGHT * 0.15;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], WIDTH / 2, startY + i * LINE_HEIGHT);
  }

  return canvas.toBuffer("image/png");
}
