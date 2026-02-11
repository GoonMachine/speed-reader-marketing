const express = require('express');
const cors = require('cors');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client');
const superjson = require('superjson');
const { config } = require('dotenv');
const { spawn } = require('child_process');
const fs = require('fs');

// Helper functions for punctuation-based timing (inlined from shared-rsvp.ts)
function tokenizeText(text) {
  if (!text) return [];
  return text
    .replace(/\n+/g, " ")
    .split(/\s+/)
    .flatMap((word) => {
      if (/[-–—]/.test(word) && word.length > 1) {
        const parts = word.split(/[-–—]/);
        return parts.map((part, i) => {
          if (i < parts.length - 1) {
            return part;
          }
          return part;
        }).filter(p => p.length > 0);
      }
      return [word];
    })
    .map((word) => word.trim())
    .filter((word) => {
      if (word.length === 0) return false;
      if (!/[a-zA-Z0-9]/.test(word)) return false;
      if (word === "¶") return false;
      return true;
    });
}

function getPunctuationMultiplier(word) {
  if (!word) return 1;
  const lastChar = word[word.length - 1];
  if (lastChar === '.' || lastChar === '?' || lastChar === '!') {
    return 2;
  }
  if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
    return 1.5;
  }
  return 1;
}

function calculateWordTimings(words, wpm) {
  const baseDelay = 60000 / wpm;
  const timings = [];
  let cumulativeTime = 0;

  for (let i = 0; i < words.length; i++) {
    timings.push(cumulativeTime);
    const multiplier = getPunctuationMultiplier(words[i]);
    cumulativeTime += baseDelay * multiplier;
  }

  return timings;
}

// Load .env file
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Persistent data directory - use /data (Railway volume) if available, else local
const DATA_DIR = fs.existsSync('/data') ? '/data' : __dirname;
console.log(`📁 Data directory: ${DATA_DIR}`);

// Queue management - separate queues for each account
const QUEUE_FILE_X = path.join(DATA_DIR, 'queue-x.json');
const QUEUE_FILE_X2 = path.join(DATA_DIR, 'queue-x2.json');
const QUEUE_FILE_X3 = path.join(DATA_DIR, 'queue-x3.json');
const QUEUE_FILE_X4 = path.join(DATA_DIR, 'queue-x4.json');
const MIN_SPACING_MS = 20 * 60 * 1000; // 20 minutes between videos per account

// Get queue file path for account
function getQueueFile(account) {
  if (account === 'X') return QUEUE_FILE_X;
  if (account === 'X2') return QUEUE_FILE_X2;
  if (account === 'X3') return QUEUE_FILE_X3;
  if (account === 'X4') return QUEUE_FILE_X4;
  return QUEUE_FILE_X; // Default to X
}

// Load queue from disk for specific account
function loadQueue(account = 'X2') {
  const queueFile = getQueueFile(account);
  try {
    if (fs.existsSync(queueFile)) {
      const data = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      return data.queue || [];
    }
  } catch (error) {
    console.error(`⚠️  Failed to load ${account} queue:`, error.message);
  }
  return [];
}

// Save queue to disk for specific account
function saveQueue(queue, account = 'X2') {
  const queueFile = getQueueFile(account);
  try {
    fs.writeFileSync(queueFile, JSON.stringify({ queue }, null, 2));
  } catch (error) {
    console.error(`⚠️  Failed to save ${account} queue:`, error.message);
  }
}

// Get next available time slot (5 min after last item, including completed)
function getNextAvailableSlot(queue) {
  const now = Date.now();

  // Consider all items (pending, processing, AND recently completed)
  const relevantItems = queue.filter(item =>
    item.status === 'pending' ||
    item.status === 'processing' ||
    (item.status === 'completed' && item.completedAt)
  );

  if (relevantItems.length === 0) {
    return now; // Truly empty queue, can process immediately
  }

  // Find the latest time (either scheduledTime or completedAt)
  const latestTime = Math.max(...relevantItems.map(item => {
    if (item.status === 'completed' && item.completedAt) {
      return item.completedAt;
    }
    return item.scheduledTime;
  }));

  const nextSlot = latestTime + MIN_SPACING_MS;

  // If next slot is in the past, use now
  return Math.max(nextSlot, now);
}

// Normalize URL (remove query params and trailing slashes for duplicate detection)
function normalizeUrl(url) {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    // Keep only protocol, host, and pathname (no query, hash, or trailing slash)
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}

// Load all queues at startup
let queueX = loadQueue('X');
let queueX2 = loadQueue('X2');
let queueX3 = loadQueue('X3');
let queueX4 = loadQueue('X4');
console.log(`📋 Loaded ${queueX.length} items from X queue`);
console.log(`📋 Loaded ${queueX2.length} items from X2 queue`);
console.log(`📋 Loaded ${queueX3.length} items from X3 queue`);
console.log(`📋 Loaded ${queueX4.length} items from X4 queue`);

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

// Count how many posts an account has today (pending, processing, or completed)
function getPostCountToday(queue) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return queue.filter(item => {
    const itemTime = item.completedAt || item.scheduledTime || item.createdAt;
    return itemTime >= startOfDay && (item.status === 'pending' || item.status === 'processing' || item.status === 'completed');
  }).length;
}

// Daily post limits per account (X has no limit)
const DAILY_LIMITS = { X2: 5, X3: 1, X4: 5 };

// Pick the account whose queue has the earliest next available slot
// X2, X3, X4 have daily limits; everything else routes to X
function getAutoAccount() {
  const slots = [
    { account: 'X', queue: queueX, nextSlot: getNextAvailableSlot(queueX) },
  ];

  // Only include secondary accounts if they haven't hit their daily limit
  const secondaryAccounts = [
    { account: 'X2', queue: queueX2 },
    { account: 'X3', queue: queueX3 },
    { account: 'X4', queue: queueX4 },
  ];

  for (const { account, queue } of secondaryAccounts) {
    const todayCount = getPostCountToday(queue);
    const limit = DAILY_LIMITS[account] || 1;
    if (todayCount < limit) {
      slots.push({ account, queue, nextSlot: getNextAvailableSlot(queue) });
    } else {
      console.log(`⏸️  ${account} hit daily limit (${todayCount}/${limit}), skipping`);
    }
  }

  slots.sort((a, b) => a.nextSlot - b.nextSlot);
  return slots[0];
}

// Queue endpoint - Add article to queue
app.post('/api/queue', async (req, res) => {
  try {
    let { articleUrl, replyToUrl, wpm = 400, composition, account = 'auto', skipPosting = false, articleTitle, articleContent } = req.body;

    if (!articleUrl) {
      return res.status(400).json({ error: 'Article URL is required' });
    }

    // Auto-route to the account with the earliest available slot
    let queue;
    if (account === 'auto') {
      const pick = getAutoAccount();
      account = pick.account;
      queue = pick.queue;
      console.log(`🔀 Auto-routed to ${account} (next slot: ${new Date(pick.nextSlot).toLocaleTimeString()})`);
    } else if (account === 'X') queue = queueX;
    else if (['X2', 'X3', 'X4'].includes(account)) {
      const queues = { X2: queueX2, X3: queueX3, X4: queueX4 };
      const limit = DAILY_LIMITS[account] || 1;
      const todayCount = getPostCountToday(queues[account]);
      if (todayCount >= limit) {
        console.log(`⏸️  ${account} hit daily limit (${todayCount}/${limit}), routing to X instead`);
        account = 'X';
        queue = queueX;
      } else {
        queue = queues[account];
      }
    }
    else queue = queueX; // Default to X

    // Normalize URLs for duplicate checking
    const normalizedArticleUrl = normalizeUrl(articleUrl);
    const normalizedReplyUrl = normalizeUrl(replyToUrl || articleUrl);

    // Check ALL queues to prevent duplicate processing across accounts
    const allQueueItems = [...queueX, ...queueX2, ...queueX3, ...queueX4];

    // Check if same article URL already in any queue
    const existingByArticle = allQueueItems.find(item =>
      normalizeUrl(item.articleUrl) === normalizedArticleUrl
    );
    if (existingByArticle) {
      return res.status(409).json({
        success: false,
        alreadyExists: true,
        message: `Article already in ${existingByArticle.account} queue`,
        queuePosition: allQueueItems.indexOf(existingByArticle) + 1,
      });
    }

    // CRITICAL: Check if we've already replied to this tweet (replyToUrl check)
    const existingByReply = allQueueItems.find(item =>
      normalizeUrl(item.replyToUrl) === normalizedReplyUrl
    );
    if (existingByReply) {
      return res.status(409).json({
        success: false,
        alreadyExists: true,
        message: `Already replied or queued to reply to this tweet`,
        queuePosition: allQueueItems.indexOf(existingByReply) + 1,
      });
    }

    // Check if article was already processed
    const processedUrlsPath = path.join(DATA_DIR, "processed-urls.json");
    try {
      if (fs.existsSync(processedUrlsPath)) {
        const data = JSON.parse(fs.readFileSync(processedUrlsPath, "utf8"));
        const processedUrls = data.urls || [];
        // Check both article and reply URLs
        if (processedUrls.some(url => normalizeUrl(url) === normalizedArticleUrl || normalizeUrl(url) === normalizedReplyUrl)) {
          return res.status(409).json({
            success: false,
            alreadyExists: true,
            message: 'Article or tweet already processed',
          });
        }
      }
    } catch (error) {
      // Ignore error, proceed with queueing
    }

    // Calculate scheduled time for this account's queue
    const scheduledTime = getNextAvailableSlot(queue);
    const scheduledDate = new Date(scheduledTime);

    // Create queue item
    const queueItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      articleUrl,
      replyToUrl: replyToUrl || articleUrl,
      wpm,
      composition,
      account, // 'X', 'X2', 'X3', or 'X4'
      skipPosting, // If true, only render video without posting
      articleTitle: articleTitle || undefined, // Pre-extracted title (skips extraction)
      articleContent: articleContent || undefined, // Pre-extracted content (skips extraction)
      scheduledTime,
      status: 'pending',
      createdAt: Date.now(),
    };

    queue.push(queueItem);

    // Update the correct global queue variable
    if (account === 'X') queueX = queue;
    else if (account === 'X2') queueX2 = queue;
    else if (account === 'X3') queueX3 = queue;
    else if (account === 'X4') queueX4 = queue;

    saveQueue(queue, account);

    console.log(`📥 Added to ${account} queue: ${articleUrl}`);
    console.log(`   Scheduled for: ${scheduledDate.toLocaleTimeString()}`);
    console.log(`   Queue position: ${queue.filter(i => i.status === 'pending').length}`);

    res.json({
      success: true,
      message: `Added to ${account} queue`,
      account,
      queueItem: {
        id: queueItem.id,
        scheduledTime: queueItem.scheduledTime,
        scheduledDate: scheduledDate.toISOString(),
        queuePosition: queue.filter(i => i.status === 'pending').length,
      },
    });
  } catch (error) {
    console.error('❌ Queue error:', error);
    res.status(500).json({ error: error.message || 'Failed to add to queue' });
  }
});

// Get queue status (combined from all accounts)
app.get('/api/queue', (req, res) => {
  const allItems = [...queueX, ...queueX2, ...queueX3, ...queueX4];
  const pending = allItems.filter(i => i.status === 'pending');
  const processing = allItems.filter(i => i.status === 'processing');
  const completed = allItems.filter(i => i.status === 'completed');
  const failed = allItems.filter(i => i.status === 'failed');

  const accountStats = (q) => ({
    total: q.length,
    pending: q.filter(i => i.status === 'pending').length,
    processing: q.filter(i => i.status === 'processing').length,
    completed: q.filter(i => i.status === 'completed').length,
  });

  res.json({
    total: allItems.length,
    pending: pending.length,
    processing: processing.length,
    completed: completed.length,
    failed: failed.length,
    byAccount: {
      X: accountStats(queueX),
      X2: accountStats(queueX2),
      X3: accountStats(queueX3),
      X4: accountStats(queueX4),
    },
    items: allItems.map(item => ({
      id: item.id,
      articleUrl: item.articleUrl,
      account: item.account || 'X2',
      status: item.status,
      scheduledTime: item.scheduledTime,
      scheduledDate: new Date(item.scheduledTime).toISOString(),
      createdAt: item.createdAt,
    })),
  });
});

// Clear processed URLs and optionally queues
app.post('/api/reset', (req, res) => {
  const { clearProcessedUrls = true, clearQueues = false } = req.body || {};
  const results = [];

  if (clearProcessedUrls) {
    const processedUrlsPath = path.join(DATA_DIR, "processed-urls.json");
    try {
      fs.writeFileSync(processedUrlsPath, JSON.stringify({ urls: [] }, null, 2));
      results.push('Cleared processed URLs');
      console.log('🗑️  Cleared processed-urls.json');
    } catch (error) {
      results.push(`Failed to clear processed URLs: ${error.message}`);
    }
  }

  if (clearQueues) {
    queueX = [];
    queueX2 = [];
    queueX3 = [];
    queueX4 = [];
    saveQueue(queueX, 'X');
    saveQueue(queueX2, 'X2');
    saveQueue(queueX3, 'X3');
    saveQueue(queueX4, 'X4');
    results.push('Cleared all queues');
    console.log('🗑️  Cleared all queues');
  }

  res.json({ success: true, actions: results });
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
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(404).json({ error: 'Video not found' });
      }
    }
  });
});

// Main rendering endpoint
app.post('/api/render', async (req, res) => {
  try {
    const { articleUrl, replyToUrl, wpm = 500, composition, account = 'X2', skipPosting = false } = req.body;

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
        targetReadingSeconds: 3.5,  // Target ~3.5 seconds of reading (reduced to make room for outro)
        outroDurationSeconds: 3.5,  // 3.5 seconds for outro animation
      },
      {
        id: 'RSVPMinimal',
        name: 'Minimal (viral format)',
        useFullArticle: true,
      },
      {
        id: 'RSVPTerminal',
        name: 'Terminal/Hacker format',
        useFullArticle: true,
      },
      {
        id: 'RSVPMinimalVertical',
        name: 'Minimal Vertical (TikTok)',
        useFullArticle: true,
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

    if (selectedComp.useFullArticle) {
      // RSVPiPhoneZoom: Use full article, but cap at MAX_VIDEO_SECONDS
      // Tokenize and calculate with punctuation timing
      const allWords = tokenizeText(content);
      const allTimings = calculateWordTimings(allWords, wpm);

      // Find how many words fit in MAX_VIDEO_SECONDS
      let cappedWordCount = allWords.length;
      for (let i = 0; i < allTimings.length; i++) {
        const wordEndTime = allTimings[i] + (60000 / wpm) * getPunctuationMultiplier(allWords[i]);
        if (wordEndTime / 1000 > MAX_VIDEO_SECONDS) {
          cappedWordCount = i;
          break;
        }
      }

      finalContent = allWords.slice(0, cappedWordCount).join(' ');
      finalWordCount = cappedWordCount;

      // Calculate actual duration with punctuation
      const timings = calculateWordTimings(allWords.slice(0, cappedWordCount), wpm);
      const lastWordMultiplier = getPunctuationMultiplier(allWords[cappedWordCount - 1] || '');
      totalSeconds = timings.length > 0 ? (timings[timings.length - 1] + (60000 / wpm) * lastWordMultiplier) / 1000 : 0;

      if (allWords.length > cappedWordCount) {
        console.log(`📊 Video stats: ${allWords.length} words in article, capped to ${cappedWordCount} words for ${totalSeconds.toFixed(1)}s video (max ${MAX_VIDEO_SECONDS}s)`);
      } else {
        console.log(`📊 Video stats: ${allWords.length} words, ${totalSeconds.toFixed(1)}s video (full article)`);
      }
    } else {
      // RSVPiPhoneWithOutro: Find words that fit in target reading time WITH punctuation
      const allWords = tokenizeText(content);
      const targetReadingMs = selectedComp.targetReadingSeconds * 1000;

      // Binary search to find how many words fit in target time with punctuation
      let wordCount = 0;
      let cumulativeTime = 0;
      const baseDelay = 60000 / wpm;

      for (let i = 0; i < allWords.length; i++) {
        const multiplier = getPunctuationMultiplier(allWords[i]);
        const wordDuration = baseDelay * multiplier;

        if (cumulativeTime + wordDuration > targetReadingMs) {
          break;
        }

        wordCount++;
        cumulativeTime += wordDuration;
      }

      const truncatedWords = allWords.slice(0, wordCount);
      finalContent = truncatedWords.join(' ');
      finalWordCount = wordCount;

      // Calculate actual reading time with punctuation
      const actualReadingSeconds = cumulativeTime / 1000;
      totalSeconds = actualReadingSeconds + selectedComp.outroDurationSeconds;

      console.log(`📊 Video stats: ${allWords.length} words in article, using first ${wordCount} words for ${totalSeconds.toFixed(1)}s video (${actualReadingSeconds.toFixed(1)}s reading + ${selectedComp.outroDurationSeconds}s outro)`);
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
    const remotionComposition = await selectComposition({
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
        ...remotionComposition,
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
      timeoutInMilliseconds: 120000,
      concurrency: 2,
      chromiumOptions: {
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    });

    console.log(`✅ Video rendered: ${outputLocation}`);

    // Handle posting if replyToUrl is a valid tweet URL and skipPosting is false
    const isTweetUrl = replyToUrl && /x\.com\/\w+\/status\/\d+/.test(replyToUrl);
    let posted = false;
    if (isTweetUrl && !skipPosting) {
      console.log(`🐦 Posting to X (${account} account)...`);

      // Check credentials based on selected account
      let hasXApiCreds = false;
      if (account === 'X2') {
        hasXApiCreds = !!(process.env.X2_API_KEY &&
                          process.env.X2_API_SECRET &&
                          process.env.X2_ACCESS_TOKEN &&
                          process.env.X2_ACCESS_SECRET);
      } else if (account === 'X3') {
        hasXApiCreds = !!(process.env.X3_API_KEY &&
                          process.env.X3_API_SECRET &&
                          process.env.X3_ACCESS_TOKEN &&
                          process.env.X3_ACCESS_SECRET);
      } else if (account === 'X4') {
        hasXApiCreds = !!(process.env.X4_API_KEY &&
                          process.env.X4_API_SECRET &&
                          process.env.X4_ACCESS_TOKEN &&
                          process.env.X4_ACCESS_SECRET);
      } else {
        hasXApiCreds = !!(process.env.X_API_KEY &&
                          process.env.X_API_SECRET &&
                          process.env.X_ACCESS_TOKEN &&
                          process.env.X_ACCESS_SECRET);
      }

      if (hasXApiCreds) {
        try {
          // Use the existing reply script
          await new Promise((resolve, reject) => {
            const replyProcess = spawn('pnpm', ['post', outputLocation, replyToUrl, account], {
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
    } else if (skipPosting) {
      console.log('⏭️  Skipping post (skipPosting: true)');
    }

    // Add article URL to processed URLs to prevent automation from finding it again
    const processedUrlsPath = path.join(DATA_DIR, "processed-urls.json");
    try {
      let processedUrls = [];
      if (fs.existsSync(processedUrlsPath)) {
        const data = JSON.parse(fs.readFileSync(processedUrlsPath, "utf8"));
        processedUrls = data.urls || [];
      }

      // Add the article URL if not already present
      if (!processedUrls.includes(articleUrl)) {
        processedUrls.push(articleUrl);
        fs.writeFileSync(
          processedUrlsPath,
          JSON.stringify({ urls: processedUrls }, null, 2)
        );
        console.log(`✅ Added to processed URLs (${processedUrls.length} total)`);
      }
    } catch (error) {
      console.error('⚠️  Failed to update processed URLs:', error.message);
      // Don't fail the whole request if this fails
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

// Guard against concurrent processQueue calls (rendering takes minutes, but interval is 10s)
let isProcessing = false;

// Queue processor - checks every 10 seconds for items ready to process from all queues
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
  const now = Date.now();

  // Process all three queues
  const queuesToProcess = [
    { queue: queueX, queueType: 'X', readyItems: queueX.filter(item => item.status === 'pending' && item.scheduledTime <= now) },
    { queue: queueX2, queueType: 'X2', readyItems: queueX2.filter(item => item.status === 'pending' && item.scheduledTime <= now) },
    { queue: queueX3, queueType: 'X3', readyItems: queueX3.filter(item => item.status === 'pending' && item.scheduledTime <= now) },
    { queue: queueX4, queueType: 'X4', readyItems: queueX4.filter(item => item.status === 'pending' && item.scheduledTime <= now) },
  ];

  for (const { queue, queueType, readyItems } of queuesToProcess) {
    for (const item of readyItems) {
      try {
        // Mark as processing - modify the item IN THE QUEUE directly
        item.status = 'processing';
        saveQueue(queue, queueType);

      console.log(`\n⏰ Processing queued item: ${item.articleUrl}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Reply to: ${item.replyToUrl}`);
      console.log(`   Account: ${item.account || queueType}`);

      // Call the render endpoint logic directly
      const { articleUrl, replyToUrl, wpm, composition } = item;

      // Sanity check: for pre-extracted content, articleUrl and replyToUrl should match
      if (item.articleContent && articleUrl !== replyToUrl) {
        console.log(`⚠️  WARNING: articleUrl and replyToUrl mismatch!`);
        console.log(`   articleUrl: ${articleUrl}`);
        console.log(`   replyToUrl: ${replyToUrl}`);
        console.log(`   Skipping to prevent posting wrong content to wrong tweet.`);
        item.status = 'failed';
        item.error = 'Data mismatch: articleUrl !== replyToUrl for pre-extracted content';
        item.failedAt = Date.now();
        saveQueue(queue, queueType);
        continue;
      }

      // Use pre-extracted content if available, otherwise extract
      let title, content, wordCount;
      if (item.articleContent) {
        title = item.articleTitle || 'Untitled';
        content = item.articleContent;
        wordCount = content.split(/\s+/).length;
        console.log(`📝 Using pre-extracted content: "${title}" (${wordCount} words)`);
      } else {
        ({ title, content, wordCount } = await extractArticle(articleUrl));
      }

      const fps = 30;
      const MAX_VIDEO_SECONDS = 115;

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
          targetReadingSeconds: 3.5,
          outroDurationSeconds: 3.5,
        },
        {
          id: 'RSVPMinimal',
          name: 'Minimal (viral format)',
          useFullArticle: true,
        }
      ];

      // Use specified composition or randomly choose
      let selectedComp;
      if (composition) {
        selectedComp = compositions.find(c => c.id === composition);
        if (!selectedComp) {
          throw new Error(`Invalid composition: ${composition}`);
        }
        console.log(`🎯 Using selected template: ${selectedComp.name}`);
      } else {
        selectedComp = compositions[Math.floor(Math.random() * compositions.length)];
        console.log(`🎲 Randomly selected: ${selectedComp.name}`);
      }

      let finalContent, finalWordCount, totalSeconds;

      if (selectedComp.useFullArticle) {
        const allWords = tokenizeText(content);
        const allTimings = calculateWordTimings(allWords, wpm);

        let cappedWordCount = allWords.length;
        for (let i = 0; i < allTimings.length; i++) {
          const wordEndTime = allTimings[i] + (60000 / wpm) * getPunctuationMultiplier(allWords[i]);
          if (wordEndTime / 1000 > MAX_VIDEO_SECONDS) {
            cappedWordCount = i;
            break;
          }
        }

        finalContent = allWords.slice(0, cappedWordCount).join(' ');
        finalWordCount = cappedWordCount;

        const timings = calculateWordTimings(allWords.slice(0, cappedWordCount), wpm);
        const lastWordMultiplier = getPunctuationMultiplier(allWords[cappedWordCount - 1] || '');
        totalSeconds = timings.length > 0 ? (timings[timings.length - 1] + (60000 / wpm) * lastWordMultiplier) / 1000 : 0;
      } else {
        const allWords = tokenizeText(content);
        const targetReadingMs = selectedComp.targetReadingSeconds * 1000;

        let wordCount = 0;
        let cumulativeTime = 0;
        const baseDelay = 60000 / wpm;

        for (let i = 0; i < allWords.length; i++) {
          const multiplier = getPunctuationMultiplier(allWords[i]);
          const wordDuration = baseDelay * multiplier;

          if (cumulativeTime + wordDuration > targetReadingMs) {
            break;
          }

          wordCount++;
          cumulativeTime += wordDuration;
        }

        const truncatedWords = allWords.slice(0, wordCount);
        finalContent = truncatedWords.join(' ');
        finalWordCount = wordCount;

        const actualReadingSeconds = cumulativeTime / 1000;
        totalSeconds = actualReadingSeconds + selectedComp.outroDurationSeconds;
      }

      const durationInFrames = Math.ceil(totalSeconds * fps);

      console.log('📦 Bundling Remotion project...');
      const bundleLocation = await bundle({
        entryPoint: path.resolve('./remotion/index.ts'),
        webpackOverride: (config) => config,
      });

      console.log('🔍 Selecting composition...');
      const remotionComposition = await selectComposition({
        serveUrl: bundleLocation,
        id: selectedComp.id,
        inputProps: {
          articleText: finalContent,
          wpm,
          title,
          totalWordCount: wordCount,
        },
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const outputLocation = path.resolve(`./out/demo-${timestamp}.mp4`);

      console.log('🎥 Rendering video...');
      await renderMedia({
        composition: {
          ...remotionComposition,
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
        timeoutInMilliseconds: 120000,
        concurrency: 2,
        chromiumOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
      });

      console.log(`✅ Video rendered: ${outputLocation}`);

      // Post to X if replyToUrl is a valid tweet URL and skipPosting is false
      const isTweetUrl = replyToUrl && /x\.com\/\w+\/status\/\d+/.test(replyToUrl);
      let posted = false;
      if (isTweetUrl && !item.skipPosting) {
        const account = item.account || 'X2'; // Default to X2 for backwards compatibility
        console.log(`🐦 Posting to X (${account} account)...`);

        // Check credentials based on selected account
        let hasXApiCreds = false;
        if (account === 'X2') {
          hasXApiCreds = !!(process.env.X2_API_KEY &&
                            process.env.X2_API_SECRET &&
                            process.env.X2_ACCESS_TOKEN &&
                            process.env.X2_ACCESS_SECRET);
        } else if (account === 'X3') {
          hasXApiCreds = !!(process.env.X3_API_KEY &&
                            process.env.X3_API_SECRET &&
                            process.env.X3_ACCESS_TOKEN &&
                            process.env.X3_ACCESS_SECRET);
        } else if (account === 'X4') {
          hasXApiCreds = !!(process.env.X4_API_KEY &&
                            process.env.X4_API_SECRET &&
                            process.env.X4_ACCESS_TOKEN &&
                            process.env.X4_ACCESS_SECRET);
        } else {
          hasXApiCreds = !!(process.env.X_API_KEY &&
                            process.env.X_API_SECRET &&
                            process.env.X_ACCESS_TOKEN &&
                            process.env.X_ACCESS_SECRET);
        }

        if (hasXApiCreds) {
          try {
            await new Promise((resolve, reject) => {
              const replyProcess = spawn('pnpm', ['post', outputLocation, replyToUrl, account], {
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
          }
        } else {
          console.log('⚠️  X API credentials not found, skipping post');
        }
      } else if (item.skipPosting) {
        console.log('⏭️  Skipping post (skipPosting: true)');
      }

      // Add to processed URLs (normalized) - save BOTH article and reply URLs
      const processedUrlsPath = path.join(DATA_DIR, "processed-urls.json");
      try {
        let processedUrls = [];
        if (fs.existsSync(processedUrlsPath)) {
          const data = JSON.parse(fs.readFileSync(processedUrlsPath, "utf8"));
          processedUrls = data.urls || [];
        }

        const normalizedArticleUrl = normalizeUrl(articleUrl);
        const normalizedReplyUrl = normalizeUrl(replyToUrl);
        let added = false;

        // Add article URL if not present
        if (!processedUrls.some(url => normalizeUrl(url) === normalizedArticleUrl)) {
          processedUrls.push(normalizedArticleUrl);
          added = true;
        }

        // Add reply URL if different and not present (prevents replying to same tweet twice)
        if (normalizedReplyUrl !== normalizedArticleUrl &&
            !processedUrls.some(url => normalizeUrl(url) === normalizedReplyUrl)) {
          processedUrls.push(normalizedReplyUrl);
          added = true;
        }

        if (added) {
          fs.writeFileSync(
            processedUrlsPath,
            JSON.stringify({ urls: processedUrls }, null, 2)
          );
        }
      } catch (error) {
        console.error('⚠️  Failed to update processed URLs:', error.message);
      }

      // Mark as completed - item is already in the queue, no need to update references
      item.status = 'completed';
      item.completedAt = Date.now();
      item.outputLocation = outputLocation;
      item.posted = posted;
      saveQueue(queue, queueType);

      console.log(`✅ Queue item completed: ${item.id}`);

      } catch (error) {
        console.error(`❌ Queue processing error for ${item.id}:`, error);
        item.status = 'failed';
        item.error = error.message;
        item.failedAt = Date.now();
        saveQueue(queue, queueType);
      }
    }
  }

  } finally {
    isProcessing = false;
  }
}

// Start queue processor (check every 10 seconds)
setInterval(processQueue, 10000);
console.log('⏰ Queue processor started (checking every 10 seconds)');

// Process queue immediately on startup
processQueue().catch(console.error);

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Rendering Server Started');
  console.log('==========================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API: http://localhost:${PORT}/api/render`);
  console.log(`   Queue: http://localhost:${PORT}/api/queue`);
  console.log('');
  console.log('💡 To expose publicly with ngrok:');
  console.log(`   ngrok http ${PORT}`);
  console.log('');
});
