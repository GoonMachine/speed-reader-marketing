import { GoogleGenAI, type Content, type Part } from "@google/genai";

const IMAGE_MODEL = "gemini-3-pro-image-preview";
const JUDGE_MODEL = "gemini-2.5-flash";

let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (_client) return _client;
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GENAI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY required in env");
  _client = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: "v1beta" } });
  return _client;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateImage(
  prompt: string,
  referenceImage?: Buffer,
  options?: { aspectRatio?: string; imageSize?: string }
): Promise<Buffer> {
  const parts: Part[] = [];

  if (referenceImage) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceImage.toString("base64"),
      },
    });
  }

  parts.push({ text: prompt });

  const contents: Content[] = [{ role: "user", parts }];

  const config: any = {
    responseModalities: ["Image"],
    imageConfig: {
      aspectRatio: options?.aspectRatio ?? "9:16",
      imageSize: options?.imageSize ?? "1K",
    },
  };

  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await getClient().models.generateContent({
        model: IMAGE_MODEL,
        contents,
        config,
      });

      if (!response.candidates?.length) {
        throw new Error("No candidates returned");
      }

      const responseParts = response.candidates[0].content?.parts;
      if (!responseParts) {
        throw new Error("No parts in response");
      }

      for (const part of responseParts) {
        if (part.inlineData?.data) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }

      throw new Error("No image in response");
    } catch (err: any) {
      if (attempt === maxRetries - 1) throw err;

      const isRateLimit =
        err.status === 429 ||
        err.status === 503 ||
        err.message?.includes("429") ||
        err.message?.includes("RESOURCE_EXHAUSTED");

      if (isRateLimit) {
        const backoff = Math.pow(2, attempt) * 10000;
        console.log(
          `  Rate limited (attempt ${attempt + 1}/${maxRetries}), waiting ${Math.round(backoff / 1000)}s...`
        );
        await sleep(backoff);
      } else {
        console.log(
          `  Attempt ${attempt + 1} failed: ${err.message}, retrying in 5s...`
        );
        await sleep(5000);
      }
    }
  }

  throw new Error("Exhausted retries");
}

/**
 * Send N image variations to Gemini vision and pick the best one.
 * Returns the 0-indexed winner.
 */
export async function pickBestImage(
  images: Buffer[],
  sceneDescription: string
): Promise<{ winner: number; reasoning: string }> {
  const parts: Part[] = [];

  for (let i = 0; i < images.length; i++) {
    parts.push({ text: `Image ${i + 1}:` });
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: images[i].toString("base64"),
      },
    });
  }

  parts.push({
    text: `You are judging ${images.length} AI-generated photos for a TikTok slideshow promoting a speed reading app. The target aesthetic is authentic iPhone photos — raw, candid, slightly imperfect, like a real person's camera roll.

The scene being depicted: ${sceneDescription}

Pick the BEST image. Evaluate on:
1. iPhone authenticity — does it look like a real iPhone photo, not AI-generated?
2. Scene accuracy — does it match the description?
3. Emotional impact — would this stop someone scrolling on TikTok?
4. Natural imperfections — slight blur, off-center framing, real lighting = good
5. No obvious AI artifacts — weird hands, text gibberish, uncanny faces = bad

Respond with ONLY valid JSON, no markdown:
{"winner": <number 1-${images.length}>, "reasoning": "<one sentence>"}`,
  });

  const contents: Content[] = [{ role: "user", parts }];

  const response = await getClient().models.generateContent({
    model: JUDGE_MODEL,
    contents,
  });

  const text =
    response.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join("") ?? "";

  // Parse JSON from response (strip markdown fences if present)
  const jsonStr = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
  const result = JSON.parse(jsonStr);

  return {
    winner: result.winner - 1, // convert to 0-indexed
    reasoning: result.reasoning,
  };
}
