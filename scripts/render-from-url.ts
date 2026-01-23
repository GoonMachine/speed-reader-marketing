#!/usr/bin/env tsx

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/routers";
import { config } from "dotenv";

// Load .env file
config();

const articleUrl = process.argv[2];
const tweetUrl = process.argv[3];
const wpm = parseInt(process.argv[4] || "500", 10);

if (!articleUrl) {
  console.error("❌ Please provide an article URL");
  console.error("");
  console.error("Usage:");
  console.error("  pnpm remotion:url <article-url> [tweet-url] [wpm]");
  console.error("");
  console.error("Examples:");
  console.error('  pnpm remotion:url "https://example.com/article"');
  console.error('  pnpm remotion:url "https://example.com/article" "https://x.com/user/status/123"');
  console.error('  pnpm remotion:url "https://example.com/article" "https://x.com/user/status/123" 400');
  process.exit(1);
}

// Create tRPC client
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "https://speedread-api-server-production.up.railway.app/api/trpc",
      transformer: superjson,
    }),
  ],
});

async function extractArticle(url: string): Promise<{ title: string; content: string; wordCount: number }> {
  console.log(`📖 Extracting article from: ${url}`);
  console.log("   Calling backend...");

  const result = await trpcClient.content.extract.mutate({ url });

  if (!result || !result.content) {
    throw new Error("Could not extract article content");
  }

  console.log(`✅ Extracted: "${result.title}" (${result.wordCount} words)`);

  return {
    title: result.title || "Untitled",
    content: result.content,
    wordCount: result.wordCount || 0,
  };
}

async function renderVideo() {
  try {
    console.log("🎬 Remotion Video Renderer");
    console.log("==========================");
    console.log("");

    // Extract article from backend
    let { title, content, wordCount } = await extractArticle(articleUrl);

    // Limit video to just under 2 minutes for Twitter free tier (2:20 max, we'll do 1:55 to be safe)
    const MAX_VIDEO_SECONDS = 115;
    const msPerWord = 60000 / wpm;
    const fps = 30;
    const wordsToSubtract = 12; // Will subtract these later for clean ending
    const maxWords = Math.floor((MAX_VIDEO_SECONDS) * wpm / 60);

    // Truncate if needed
    if (wordCount > maxWords) {
      console.log("");
      console.log(`⚠️  Article is ${wordCount} words, truncating to ${maxWords} words for ${MAX_VIDEO_SECONDS}s video limit`);
      const words = content.split(/\s+/);
      content = words.slice(0, maxWords).join(' ') + '...';
      wordCount = maxWords;
    }

    // Calculate video duration - cut early based on WPM to keep last word visible
    // Subtract ~10-15 words worth of time so video ends while word is still on screen
    const effectiveWordCount = Math.max(1, wordCount - wordsToSubtract);
    const readingTimeSeconds = (effectiveWordCount * msPerWord) / 1000;
    const totalSeconds = readingTimeSeconds;
    const durationInFrames = Math.ceil(totalSeconds * fps);

    console.log("");
    console.log(`⚡ Speed: ${wpm} WPM`);
    console.log(`⏱️  Duration: ${Math.ceil(totalSeconds)}s (cuts early to keep last word visible)`);
    console.log("");

    // Bundle Remotion project
    console.log("📦 Bundling...");
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "RSVPiPhone",
      inputProps: {
        articleText: content,
        wpm,
        title,
      },
    });

    // Output file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const outputLocation = path.resolve(`./out/demo-${timestamp}.mp4`);

    // Render
    console.log("🎥 Rendering...");
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        fps,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: {
        articleText: content,
        wpm,
        title,
      },
    });

    console.log("");
    console.log(`✅ Done: ${outputLocation}`);
    console.log("");

    // Open the video
    const { spawn } = require("child_process");
    spawn("open", [outputLocation]);

    // If tweet URL provided, offer to reply
    if (tweetUrl) {
      console.log("");
      console.log("🐦 Tweet URL provided, uploading reply...");
      console.log(`   Article: ${articleUrl}`);
      console.log(`   Tweet: ${tweetUrl}`);
      console.log("");

      // Check if X API credentials are available
      const hasXApiCreds =
        process.env.X_API_KEY &&
        process.env.X_API_SECRET &&
        process.env.X_ACCESS_TOKEN &&
        process.env.X_ACCESS_SECRET;

      if (hasXApiCreds) {
        console.log("🔑 Using X API for reply...");
        const replyProcess = spawn("pnpm", ["x:reply:api", outputLocation, tweetUrl], {
          stdio: "inherit",
        });

        replyProcess.on("close", (code: number) => {
          process.exit(code);
        });
      } else {
        console.log("🌐 Using browser automation for reply...");
        console.log("   (Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET to use API)");
        console.log("");

        const replyProcess = spawn("pnpm", ["x:reply", outputLocation, tweetUrl], {
          stdio: "inherit",
        });

        replyProcess.on("close", (code: number) => {
          process.exit(code);
        });
      }
    }
  } catch (error) {
    console.error("");
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

renderVideo();
