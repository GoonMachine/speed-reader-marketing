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

// Serve video files
app.get('/api/video/:filename', (req, res) => {
  const { filename } = req.params;
  const videoPath = path.resolve(`./out/${filename}`);

  // Security check: ensure filename is just a filename, not a path
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  res.sendFile(videoPath, (err) => {
    if (err) {
      console.error('Error sending video:', err);
      res.status(404).json({ error: 'Video not found' });
    }
  });
});

// Main rendering endpoint
app.post('/api/render', async (req, res) => {
  try {
    const { articleUrl, replyToUrl, wpm = 500, composition } = req.body;

    if (!articleUrl) {
      return res.status(400).json({ error: 'Article URL is required' });
    }

    console.log('🎬 Starting render request...');
    console.log(`   Article: ${articleUrl}`);
    console.log(`   Reply to: ${replyToUrl || 'None'}`);
    console.log(`   Speed: ${wpm} WPM`);
    if (composition) {
      console.log(`   Template: ${composition}`);
    }

    // Extract article from backend
    const { title, content, wordCount } = await extractArticle(articleUrl);

    const fps = 30;

    // Twitter free tier video limit: 2:20 max, we'll do 1:55 (115s) to be safe
    const MAX_VIDEO_SECONDS = 115;

    // Calculate how many words we can fit in the max duration
    const maxWordsForDuration = Math.floor(MAX_VIDEO_SECONDS * wpm / 60);

    // Define available compositions
    const compositions = [
      {
        id: 'RSVPiPhoneZoom',
        name: 'Zoom (no outro)',
        useFullArticle: true,
      },
      {
        id: 'RSVPiPhoneWithOutro',
        name: 'With outro',
        useFullArticle: false,
        readingSeconds: 4,
        totalSeconds: 6.5,
      }
    ];

    // Use specified composition or randomly choose
    let selectedComp;
    if (composition) {
      selectedComp = compositions.find(c => c.id === composition);
      if (!selectedComp) {
        return res.status(400).json({ error: `Invalid composition: ${composition}` });
      }
      console.log(`🎯 Using selected template: ${selectedComp.name}`);
    } else {
      selectedComp = compositions[Math.floor(Math.random() * compositions.length)];
      console.log(`🎲 Randomly selected: ${selectedComp.name}`);
    }

    let finalContent, finalWordCount, totalSeconds;
    const words = content.split(/\s+/);

    if (selectedComp.useFullArticle) {
      // RSVPiPhoneZoom: Use full article, but cap at MAX_VIDEO_SECONDS
      const cappedWordCount = Math.min(wordCount, maxWordsForDuration);
      const truncatedWords = words.slice(0, cappedWordCount);
      finalContent = truncatedWords.join(' ');
      finalWordCount = cappedWordCount;
      totalSeconds = (cappedWordCount / wpm) * 60;

      if (wordCount > maxWordsForDuration) {
        console.log(`📊 Video stats: ${wordCount} words in article, capped to ${cappedWordCount} words for ${totalSeconds.toFixed(1)}s video (max ${MAX_VIDEO_SECONDS}s)`);
      } else {
        console.log(`📊 Video stats: ${wordCount} words, ${totalSeconds.toFixed(1)}s video (full article)`);
      }
    } else {
      // RSVPiPhoneWithOutro: Truncate to 4 seconds
      const maxWordsForOutro = Math.floor((selectedComp.readingSeconds * wpm) / 60);
      const truncatedWords = words.slice(0, maxWordsForOutro);
      finalContent = truncatedWords.join(' ');
      finalWordCount = maxWordsForOutro;
      totalSeconds = selectedComp.totalSeconds;
      console.log(`📊 Video stats: ${wordCount} words in article, using first ${maxWordsForOutro} words for 6.5s outro video`);
    }

    const durationInFrames = Math.ceil(totalSeconds * fps);

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
      id: selectedComp.id,
      inputProps: {
        articleText: finalContent,
        wpm,
        title,
        totalWordCount: wordCount,
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
        articleText: finalContent,
        wpm,
        title,
        totalWordCount: wordCount,
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

    // Extract filename from output path
    const filename = path.basename(outputLocation);
    const videoUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/video/${filename}`;

    res.json({
      success: true,
      title,
      wordCount: finalWordCount,
      duration: totalSeconds,
      composition: selectedComp.name,
      outputPath: outputLocation,
      videoUrl,
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
