const express = require('express');
const cors = require('cors');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client');
const superjson = require('superjson');
const { config } = require('dotenv');
const { spawn } = require('child_process');

// Load .env file
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create tRPC client
const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: "https://speedread-api-server-production.up.railway.app/api/trpc",
      transformer: superjson,
    }),
  ],
});

async function extractArticle(url) {
  console.log(`📖 Extracting article from: ${url}`);
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rendering server is running' });
});

// Main rendering endpoint
app.post('/api/render', async (req, res) => {
  try {
    const { articleUrl, replyToUrl, wpm = 500 } = req.body;

    if (!articleUrl) {
      return res.status(400).json({ error: 'Article URL is required' });
    }

    console.log('🎬 Starting render request...');
    console.log(`   Article: ${articleUrl}`);
    console.log(`   Reply to: ${replyToUrl || 'None'}`);
    console.log(`   Speed: ${wpm} WPM`);

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

    console.log(`📊 Video stats: ${wordCount} words, ${Math.ceil(totalSeconds)}s duration`);

    console.log('📦 Bundling Remotion project...');
    // Bundle Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve('./remotion/index.ts'),
      webpackOverride: (config) => config,
    });

    console.log('🔍 Selecting composition...');
    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'RSVPiPhone',
      inputProps: {
        articleText: content,
        wpm,
        title,
      },
    });

    // Output file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputLocation = path.resolve(`./out/demo-${timestamp}.mp4`);

    console.log('🎥 Rendering video...');
    // Render
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        fps,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: {
        articleText: content,
        wpm,
        title,
      },
    });

    console.log(`✅ Video rendered: ${outputLocation}`);

    // Handle posting if replyToUrl is provided
    let posted = false;
    if (replyToUrl) {
      console.log('🐦 Posting to X...');

      // Check if X API credentials are available
      const hasXApiCreds =
        process.env.X_API_KEY &&
        process.env.X_API_SECRET &&
        process.env.X_ACCESS_TOKEN &&
        process.env.X_ACCESS_SECRET;

      if (hasXApiCreds) {
        try {
          // Use the existing reply script
          await new Promise((resolve, reject) => {
            const replyProcess = spawn('pnpm', ['post', outputLocation, replyToUrl], {
              stdio: 'inherit',
            });

            replyProcess.on('close', (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Reply process exited with code ${code}`));
              }
            });
          });

          posted = true;
          console.log('✅ Posted to X successfully');
        } catch (error) {
          console.error('❌ Failed to post to X:', error);
          // Don't fail the whole request if posting fails
        }
      } else {
        console.log('⚠️  X API credentials not found, skipping post');
      }
    }

    res.json({
      success: true,
      title,
      wordCount,
      duration: Math.ceil(totalSeconds),
      outputPath: outputLocation,
      posted,
    });
  } catch (error) {
    console.error('❌ Render error:', error);
    res.status(500).json({
      error: error.message || 'Failed to render video',
    });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Rendering Server Started');
  console.log('==========================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api/render`);
  console.log('');
  console.log('💡 To expose publicly with ngrok:');
  console.log(`   ngrok http ${PORT}`);
  console.log('');
});
