#!/usr/bin/env tsx

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

async function renderVideo() {
  try {
    console.log("🎬 Rendering demo video...");

    // Bundle Remotion project
    console.log("📦 Bundling...");
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    // Select composition (use RSVPiPhone for iPhone frame version)
    const compositionId = process.env.REMOTION_COMPOSITION || "RSVPDemo"; // or "RSVPiPhone"
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
    });

    // Output file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const outputLocation = path.resolve(`./out/demo-${timestamp}.mp4`);

    // Render
    console.log("🎥 Rendering...");
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
    });

    console.log("");
    console.log(`✅ Done: ${outputLocation}`);

    // Open the video
    const { spawn } = require("child_process");
    spawn("open", [outputLocation]);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

renderVideo();
