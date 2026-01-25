#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { config } from "dotenv";

// Load .env file
config();

const videoPath = process.argv[2];
const tweetUrl = process.argv[3];

if (!videoPath || !tweetUrl) {
  console.error("❌ Usage: pnpm x:reply:api <video-path> <tweet-url>");
  console.error("");
  console.error("Example:");
  console.error('  pnpm x:reply:api ./out/demo.mp4 "https://x.com/user/status/123"');
  process.exit(1);
}

// Extract tweet ID from URL
function extractTweetId(url: string): string {
  const match = url.match(/status\/(\d+)/);
  if (!match) {
    throw new Error("Could not extract tweet ID from URL");
  }
  return match[1];
}

// Get X API credentials from env
const API_KEY = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
const API_SECRET = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET;
const ACCESS_TOKEN = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
const ACCESS_SECRET = process.env.X_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET;

if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
  console.error("❌ Missing X API credentials!");
  console.error("");
  console.error("Please set these environment variables:");
  console.error("  X_API_KEY");
  console.error("  X_API_SECRET");
  console.error("  X_ACCESS_TOKEN");
  console.error("  X_ACCESS_SECRET");
  console.error("");
  console.error("You can get these from: https://developer.twitter.com/");
  process.exit(1);
}

// OAuth 1.0a signature generation
function generateOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string> = {}
): string {
  const crypto = require("crypto");

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY!,
    oauth_token: ACCESS_TOKEN!,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_version: "1.0",
  };

  // Combine oauth and query params
  const allParams = { ...oauthParams, ...params };

  // Sort params
  const sortedParams = Object.keys(allParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join("&");

  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  // Create signing key
  const signingKey = `${encodeURIComponent(API_SECRET!)}&${encodeURIComponent(ACCESS_SECRET!)}`;

  // Generate signature
  const signature = crypto.createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  oauthParams.oauth_signature = signature;

  // Build OAuth header
  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(", ");

  return `OAuth ${headerParams}`;
}

async function uploadVideo(filePath: string): Promise<string> {
  console.log("📤 Uploading video to X...");

  const fileSize = fs.statSync(filePath).size;
  const fileBuffer = fs.readFileSync(filePath);

  // Step 1: INIT
  console.log("   1/3 Initializing upload...");
  const initUrl = "https://upload.twitter.com/1.1/media/upload.json";
  const initParams = {
    command: "INIT",
    total_bytes: fileSize.toString(),
    media_type: "video/mp4",
    media_category: "tweet_video",
  };

  let initResponse;
  try {
    initResponse = await fetch(
      `${initUrl}?${new URLSearchParams(initParams).toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: generateOAuthHeader("POST", initUrl, initParams),
        },
      }
    );
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(`Failed to connect to Twitter API: ${error}`);
  }

  if (!initResponse.ok) {
    const text = await initResponse.text();
    console.error("Init response status:", initResponse.status);
    console.error("Init response body:", text);
    throw new Error(`Upload INIT failed (${initResponse.status}): ${text}`);
  }

  const initData = await initResponse.json();
  const mediaId = initData.media_id_string;

  // Step 2: APPEND (upload in chunks)
  console.log("   2/3 Uploading video data...");
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  let segmentIndex = 0;

  for (let i = 0; i < fileSize; i += chunkSize) {
    const chunk = fileBuffer.slice(i, Math.min(i + chunkSize, fileSize));
    const formData = new FormData();
    formData.append("command", "APPEND");
    formData.append("media_id", mediaId);
    formData.append("segment_index", segmentIndex.toString());
    formData.append("media", new Blob([chunk], { type: "video/mp4" }));

    const appendUrl = "https://upload.twitter.com/1.1/media/upload.json";

    // For multipart uploads, OAuth signature has NO parameters (they're in the body)
    const appendResponse = await fetch(appendUrl, {
      method: "POST",
      headers: {
        // OAuth signature with empty params - all data is in multipart body
        Authorization: generateOAuthHeader("POST", appendUrl, {}),
      },
      body: formData,
    });

    if (!appendResponse.ok) {
      const text = await appendResponse.text();
      throw new Error(`Upload APPEND failed: ${text}`);
    }

    segmentIndex++;
    const progress = Math.min(100, Math.round(((i + chunkSize) / fileSize) * 100));
    process.stdout.write(`\r   Uploading... ${progress}%`);
  }
  console.log("");

  // Step 3: FINALIZE
  console.log("   3/3 Finalizing upload...");
  const finalizeUrl = "https://upload.twitter.com/1.1/media/upload.json";
  const finalizeParams = {
    command: "FINALIZE",
    media_id: mediaId,
  };

  const finalizeResponse = await fetch(
    `${finalizeUrl}?${new URLSearchParams(finalizeParams).toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: generateOAuthHeader("POST", finalizeUrl, finalizeParams),
      },
    }
  );

  if (!finalizeResponse.ok) {
    const text = await finalizeResponse.text();
    throw new Error(`Upload FINALIZE failed: ${text}`);
  }

  const finalizeData = await finalizeResponse.json();

  // Wait for processing if needed
  if (finalizeData.processing_info) {
    console.log("   Processing video...");
    let processingComplete = false;

    while (!processingComplete) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusUrl = "https://upload.twitter.com/1.1/media/upload.json";
      const statusParams = {
        command: "STATUS",
        media_id: mediaId,
      };

      const statusResponse = await fetch(
        `${statusUrl}?${new URLSearchParams(statusParams).toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: generateOAuthHeader("GET", statusUrl, statusParams),
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.processing_info?.state === "succeeded") {
        processingComplete = true;
      } else if (statusData.processing_info?.state === "failed") {
        throw new Error("Video processing failed");
      }
    }
  }

  console.log("✅ Video uploaded successfully!");
  return mediaId;
}

async function getAuthenticatedUserId(): Promise<string> {
  const baseUrl = "https://api.twitter.com/2/users/me";
  const response = await fetch(baseUrl, {
    method: "GET",
    headers: {
      Authorization: generateOAuthHeader("GET", baseUrl, {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get authenticated user ID: ${text}`);
  }

  const data = await response.json();
  return data.data.id;
}

async function getTweetAuthorId(tweetId: string): Promise<string> {
  const baseUrl = `https://api.twitter.com/2/tweets/${tweetId}`;
  const params = { "expansions": "author_id" };
  const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: generateOAuthHeader("GET", baseUrl, params),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get tweet author: ${text}`);
  }

  const data = await response.json();
  return data.data.author_id;
}

async function likeTweet(userId: string, tweetId: string) {
  console.log("❤️  Liking tweet...");

  const url = `https://api.twitter.com/2/users/${userId}/likes`;
  const payload = {
    tweet_id: tweetId,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: generateOAuthHeader("POST", url),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Log rate limit info
  const rateLimitRemaining = response.headers.get("x-rate-limit-remaining");
  const rateLimitReset = response.headers.get("x-rate-limit-reset");
  if (rateLimitRemaining && rateLimitReset) {
    const resetDate = new Date(parseInt(rateLimitReset) * 1000);
    console.log(`   Rate limit: ${rateLimitRemaining} remaining (resets at ${resetDate.toLocaleTimeString()})`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Like failed: ${text}`);
  }

  const data = await response.json();
  console.log("✅ Tweet liked successfully!");
  return data;
}

async function followUser(sourceUserId: string, targetUserId: string) {
  console.log("👤 Following user...");

  const url = `https://api.twitter.com/2/users/${sourceUserId}/following`;
  const payload = {
    target_user_id: targetUserId,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: generateOAuthHeader("POST", url),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Log rate limit info
  const rateLimitRemaining = response.headers.get("x-rate-limit-remaining");
  const rateLimitReset = response.headers.get("x-rate-limit-reset");
  if (rateLimitRemaining && rateLimitReset) {
    const resetDate = new Date(parseInt(rateLimitReset) * 1000);
    console.log(`   Rate limit: ${rateLimitRemaining} remaining (resets at ${resetDate.toLocaleTimeString()})`);
  }

  if (!response.ok) {
    const text = await response.text();
    // Don't fail if already following
    if (text.includes("already") || text.includes("You are already following")) {
      console.log("ℹ️  Already following user");
      return { already_following: true };
    }
    throw new Error(`Follow failed: ${text}`);
  }

  const data = await response.json();
  console.log("✅ User followed successfully!");
  return data;
}

async function replyWithVideo(tweetId: string, mediaId: string, replyText: string) {
  console.log("💬 Posting reply...");

  const replyUrl = "https://api.twitter.com/2/tweets";
  const payload = {
    text: replyText,
    reply: {
      in_reply_to_tweet_id: tweetId,
    },
    media: {
      media_ids: [mediaId],
    },
  };

  const response = await fetch(replyUrl, {
    method: "POST",
    headers: {
      Authorization: generateOAuthHeader("POST", replyUrl),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reply failed: ${text}`);
  }

  const data = await response.json();
  console.log("✅ Reply posted successfully!");
  return data;
}

async function main() {
  try {
    console.log("🐦 X API Video Reply");
    console.log("===================");
    console.log("");
    console.log(`📹 Video: ${videoPath}`);
    console.log(`🔗 Tweet: ${tweetUrl}`);
    console.log("");

    // Check video exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Extract tweet ID
    const tweetId = extractTweetId(tweetUrl);
    console.log(`📝 Tweet ID: ${tweetId}`);
    console.log("");

    // Get user IDs
    console.log("🔍 Getting user information...");
    const myUserId = await getAuthenticatedUserId();
    const authorId = await getTweetAuthorId(tweetId);
    console.log(`   My user ID: ${myUserId}`);
    console.log(`   Author ID: ${authorId}`);
    console.log("");

    // Like the tweet
    await likeTweet(myUserId, tweetId);
    console.log("");

    // Follow the author (if not already following)
    await followUser(myUserId, authorId);
    console.log("");

    // Upload video
    const mediaId = await uploadVideo(videoPath);
    console.log("");

    // Reply messages - 80% of the time post with no text, 20% use one of these
    const replyMessages = [
      "for the zoomers",
      "gotta go fast",
      "new speed read banger dropped",
      "congrats bro",
      "i aint reading all that, but i am speed reading it.",
      "ooo weee i'm speed reading",
    ];

    // 80% chance of no text (just video)
    const useText = Math.random() > 0.8;
    let replyText = "";

    if (useText) {
      const indexFilePath = path.join(process.cwd(), ".reply-message-index");
      let messageIndex = 0;
      if (fs.existsSync(indexFilePath)) {
        const savedIndex = parseInt(fs.readFileSync(indexFilePath, "utf8"), 10);
        messageIndex = (savedIndex + 1) % replyMessages.length;
      }
      fs.writeFileSync(indexFilePath, messageIndex.toString(), "utf8");
      replyText = replyMessages[messageIndex];
    }
    console.log(`📝 Reply text: ${replyText ? `"${replyText}"` : "(video only, no text)"}`);
    console.log("");

    // Post reply
    await replyWithVideo(tweetId, mediaId, replyText);

    console.log("");
    console.log("🎉 Done!");
    console.log(`   View reply at: ${tweetUrl}`);
  } catch (error) {
    console.error("");
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
