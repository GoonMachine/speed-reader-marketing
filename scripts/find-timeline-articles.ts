#!/usr/bin/env tsx

/**
 * Timeline Article Finder & Queue Submitter
 *
 * Fetches timelines from all 3 X accounts, pools native X articles,
 * scores them for viral potential, and submits the best to the backend
 * queue distributed across accounts.
 *
 * Usage:
 *   pnpm tsx scripts/find-timeline-articles.ts --explore              # See what's available
 *   pnpm tsx scripts/find-timeline-articles.ts --explore --pages 3    # With pagination
 *   pnpm tsx scripts/find-timeline-articles.ts                        # One-shot: find & submit
 *   pnpm tsx scripts/find-timeline-articles.ts --loop                 # Run every 2 hours
 *   pnpm tsx scripts/find-timeline-articles.ts --loop --interval 90   # Custom interval (minutes)
 *   pnpm tsx scripts/find-timeline-articles.ts --dry-run              # Show what would be submitted
 */

import { config } from "dotenv";
import crypto from "crypto";
import fs from "fs";
import path from "path";

config();

const BASE = "https://api.x.com/2";
const ACCOUNTS: AccountName[] = ["X", "X2", "X3"];
const PROCESSED_FILE = path.join(process.cwd(), "processed-timeline-articles.json");

// --- Types ---

type AccountName = "X" | "X2" | "X3";

interface OAuthCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

interface RawTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    impression_count: number;
    bookmark_count: number;
  };
  article?: {
    title?: string;
    preview_text?: string;
    plain_text?: string;
    cover_media?: string;
    media_entities?: string[];
    entities?: any;
  };
  referenced_tweets?: Array<{
    type: "retweeted" | "quoted" | "replied_to";
    id: string;
  }>;
  entities?: {
    urls?: Array<{ expanded_url: string; display_url: string }>;
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
  };
}

interface RawUser {
  id: string;
  username: string;
  name: string;
  verified?: boolean;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface TimelineResponse {
  data?: RawTweet[];
  includes?: {
    users?: RawUser[];
  };
  meta?: {
    next_token?: string;
    result_count: number;
  };
}

interface ScoredArticle {
  tweetId: string;
  tweetUrl: string;
  articleTitle: string | null;
  articleContent: string | null;
  author: {
    username: string;
    name: string;
    followers: number;
    verified: boolean;
  };
  text: string;
  createdAt: Date;
  ageHours: number;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    impressions: number;
    bookmarks: number;
  };
  scores: {
    velocityScore: number;
    authorScore: number;
    engagementRateScore: number;
    contentScore: number;
    totalScore: number;
  };
  foundOnAccounts: AccountName[];
}

interface CLIConfig {
  explore: boolean;
  pages: number;
  maxAgeHours: number;
  limit: number;
  json: boolean;
  dryRun: boolean;
  loop: boolean;
  intervalMinutes: number;
}

// --- CLI Parsing ---

function parseArgs(): CLIConfig {
  const args = process.argv.slice(2);

  const getOpt = (name: string, defaultVal: string): string => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
  };

  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  return {
    explore: hasFlag("explore"),
    pages: parseInt(getOpt("pages", "3")),
    maxAgeHours: parseFloat(getOpt("max-age-hours", "2")),
    limit: parseInt(getOpt("limit", "10")),
    json: hasFlag("json"),
    dryRun: hasFlag("dry-run"),
    loop: hasFlag("loop"),
    intervalMinutes: parseInt(getOpt("interval", "120")),
  };
}

// --- Processed Articles Tracking ---

function loadProcessed(): Set<string> {
  try {
    const data = JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf-8"));
    return new Set(data.tweetIds || []);
  } catch {
    return new Set();
  }
}

function saveProcessed(ids: Set<string>) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify({ tweetIds: [...ids] }, null, 2));
}

// --- OAuth 1.0a ---

function getAccountCredentials(account: AccountName): OAuthCredentials {
  const prefix = account === "X" ? "X" : account;
  const apiKey = process.env[`${prefix}_API_KEY`];
  const apiSecret = process.env[`${prefix}_API_SECRET`];
  const accessToken = process.env[`${prefix}_ACCESS_TOKEN`];
  const accessSecret = process.env[`${prefix}_ACCESS_SECRET`];

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error(`Missing credentials for ${account}`);
  }

  return { apiKey, apiSecret, accessToken, accessSecret };
}

function generateOAuthHeader(
  method: string,
  url: string,
  creds: OAuthCredentials,
  params: Record<string, string> = {}
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_token: creds.accessToken,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...params };

  const sortedParams = Object.keys(allParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join("&");

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(creds.apiSecret)}&${encodeURIComponent(creds.accessSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(signatureBase).digest("base64");

  oauthParams.oauth_signature = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(", ");

  return `OAuth ${headerParams}`;
}

// --- API Calls ---

async function getAuthenticatedUserId(creds: OAuthCredentials): Promise<{ id: string; username: string }> {
  const url = `${BASE}/users/me`;
  const params = { "user.fields": "username" };
  const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;

  const res = await fetch(fullUrl, {
    method: "GET",
    headers: { Authorization: generateOAuthHeader("GET", url, creds, params) },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get user ID: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { id: data.data.id, username: data.data.username };
}

async function fetchTimeline(
  userId: string,
  creds: OAuthCredentials,
  opts: { maxResults?: number; paginationToken?: string } = {}
): Promise<TimelineResponse> {
  const url = `${BASE}/users/${userId}/timelines/reverse_chronological`;

  const params: Record<string, string> = {
    "tweet.fields": "article,created_at,public_metrics,author_id,entities,referenced_tweets",
    "expansions": "author_id,article.cover_media",
    "user.fields": "username,name,verified,public_metrics",
    "max_results": (opts.maxResults || 100).toString(),
    "exclude": "replies,retweets",
  };

  if (opts.paginationToken) {
    params.pagination_token = opts.paginationToken;
  }

  const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;

  const res = await fetch(fullUrl, {
    method: "GET",
    headers: { Authorization: generateOAuthHeader("GET", url, creds, params) },
  });

  if (res.status === 429) {
    const resetHeader = res.headers.get("x-rate-limit-reset");
    const resetTime = resetHeader ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString() : "unknown";
    throw new Error(`Rate limited. Resets at ${resetTime}`);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Timeline fetch failed: ${res.status} ${text}`);
  }

  return res.json();
}

// --- Scoring ---

function scoreArticle(tweet: RawTweet, user: RawUser): ScoredArticle | null {
  const now = new Date();
  const createdAt = new Date(tweet.created_at);
  const ageHours = (now.getTime() - createdAt.getTime()) / 3600000;

  if (ageHours < 0.1) return null;

  const metrics = tweet.public_metrics;
  const totalEngagement = metrics.like_count + metrics.retweet_count + metrics.reply_count;

  const articleTitle = tweet.article?.title || null;
  const articleContent = tweet.article?.plain_text || null;

  // 1. VELOCITY SCORE (40 points)
  const totalEngagementPerHour = totalEngagement / ageHours;
  const followerNorm = Math.log10(Math.max(user.public_metrics.followers_count, 100));
  const normalizedVelocity = totalEngagementPerHour / followerNorm;

  let velocityScore = 0;
  if (normalizedVelocity > 20) velocityScore = 40;
  else if (normalizedVelocity > 10) velocityScore = 35;
  else if (normalizedVelocity > 5) velocityScore = 28;
  else if (normalizedVelocity > 2) velocityScore = 20;
  else if (normalizedVelocity > 1) velocityScore = 12;
  else velocityScore = 5;

  // 2. AUTHOR SCORE (25 points)
  const followers = user.public_metrics.followers_count;
  let authorScore = user.verified ? 5 : 0;

  if (followers > 100000) authorScore += 20;
  else if (followers > 50000) authorScore += 17;
  else if (followers > 10000) authorScore += 14;
  else if (followers > 1000) authorScore += 10;
  else authorScore += 5;

  // 3. ENGAGEMENT RATE SCORE (20 points)
  const impressions = Math.max(metrics.impression_count, totalEngagement * 10);
  const engagementRate = totalEngagement / impressions;

  let engagementRateScore = 0;
  if (engagementRate > 0.10) engagementRateScore = 20;
  else if (engagementRate > 0.05) engagementRateScore = 17;
  else if (engagementRate > 0.03) engagementRateScore = 14;
  else if (engagementRate > 0.015) engagementRateScore = 10;
  else if (engagementRate > 0.008) engagementRateScore = 6;
  else engagementRateScore = 3;

  // 4. CONTENT SCORE (15 points)
  let contentScore = 3;

  const hashtags = tweet.entities?.hashtags || [];
  if (hashtags.length > 0 && hashtags.length <= 3) contentScore += 4;
  else if (hashtags.length > 3) contentScore += 2;

  if (metrics.bookmark_count > 10) contentScore += 3;
  else if (metrics.bookmark_count > 5) contentScore += 2;

  if (articleTitle) contentScore += 3;

  const totalScore = velocityScore + authorScore + engagementRateScore + contentScore;

  return {
    tweetId: tweet.id,
    tweetUrl: `https://x.com/${user.username}/status/${tweet.id}`,
    articleTitle,
    articleContent,
    author: {
      username: user.username,
      name: user.name,
      followers: user.public_metrics.followers_count,
      verified: user.verified || false,
    },
    text: tweet.text.slice(0, 200),
    createdAt,
    ageHours: Math.round(ageHours * 100) / 100,
    metrics: {
      likes: metrics.like_count,
      retweets: metrics.retweet_count,
      replies: metrics.reply_count,
      impressions: metrics.impression_count,
      bookmarks: metrics.bookmark_count,
    },
    scores: {
      velocityScore,
      authorScore,
      engagementRateScore,
      contentScore,
      totalScore: Math.round(totalScore),
    },
    foundOnAccounts: [],
  };
}

// --- Timeline Fetching ---

async function fetchAccountTimeline(
  account: AccountName,
  pages: number
): Promise<{ tweets: RawTweet[]; users: Record<string, RawUser>; username: string }> {
  const creds = getAccountCredentials(account);
  const { id: userId, username } = await getAuthenticatedUserId(creds);
  console.error(`  ${account} (@${username})`);

  const allTweets: RawTweet[] = [];
  const users: Record<string, RawUser> = {};
  let nextToken: string | undefined;

  for (let page = 0; page < pages; page++) {
    const response = await fetchTimeline(userId, creds, {
      maxResults: 100,
      paginationToken: nextToken,
    });

    if (response.data) allTweets.push(...response.data);

    if (response.includes?.users) {
      for (const u of response.includes.users) {
        users[u.id] = u;
      }
    }

    console.error(`    Page ${page + 1}: ${response.meta?.result_count || 0} tweets`);

    nextToken = response.meta?.next_token;
    if (!nextToken) break;
  }

  return { tweets: allTweets, users, username };
}

// --- Pool & Score ---

async function buildArticlePool(cfg: CLIConfig): Promise<ScoredArticle[]> {
  const pool: Map<string, ScoredArticle> = new Map();
  const now = new Date();

  for (const account of ACCOUNTS) {
    try {
      const { tweets, users } = await fetchAccountTimeline(account, cfg.pages);

      for (const tweet of tweets) {
        if (!tweet.article) continue;

        // Skip quote tweets - they inherit the article field from the quoted tweet,
        // which causes content/URL mismatches (e.g. omarsar0 quoting jenniferzeng97)
        const isQuoteTweet = tweet.referenced_tweets?.some(ref => ref.type === "quoted");
        if (isQuoteTweet) {
          console.error(`    Skipping quote tweet ${tweet.id} (inherited article from quoted tweet)`);
          continue;
        }

        const ageH = (now.getTime() - new Date(tweet.created_at).getTime()) / 3600000;
        if (ageH > cfg.maxAgeHours) continue;

        const user = users[tweet.author_id];
        if (!user) continue;

        const scored = scoreArticle(tweet, user);
        if (!scored) continue;

        if (pool.has(tweet.id)) {
          pool.get(tweet.id)!.foundOnAccounts.push(account);
        } else {
          scored.foundOnAccounts = [account];
          pool.set(tweet.id, scored);
        }
      }
    } catch (err: any) {
      console.error(`  ERROR on ${account}: ${err.message}`);
    }
  }

  return [...pool.values()].sort((a, b) => b.scores.totalScore - a.scores.totalScore);
}

// --- Queue Submission ---

async function submitToQueue(article: ScoredArticle): Promise<{ ok: boolean; message: string; account?: string }> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return { ok: false, message: "BACKEND_URL not set" };
  }

  const body: Record<string, any> = {
    articleUrl: article.tweetUrl,
    replyToUrl: article.tweetUrl,
    wpm: 400,
    account: "auto",
  };

  // Pass pre-extracted content so backend skips extraction for native X articles
  if (article.articleContent) {
    body.articleTitle = article.articleTitle;
    body.articleContent = article.articleContent;
  }

  try {
    const res = await fetch(`${backendUrl}/api/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.status === 409) {
      return { ok: false, message: `Already queued: ${data.message || "duplicate"}` };
    }

    if (!res.ok) {
      return { ok: false, message: `${res.status}: ${data.error || JSON.stringify(data)}` };
    }

    const assignedAccount = data.account || "?";
    return { ok: true, account: assignedAccount, message: `Queued for ${assignedAccount} at ${new Date(data.queueItem?.scheduledTime).toLocaleTimeString()}` };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err.message}` };
  }
}

// --- Explore Mode ---

async function runExplore(cfg: CLIConfig) {
  console.error("=== TIMELINE ARTICLE EXPLORER ===\n");

  const allArticles: Map<string, { article: ScoredArticle; accounts: AccountName[] }> = new Map();

  for (const account of ACCOUNTS) {
    console.error(`\n--- Account: ${account} ---`);

    try {
      const { tweets, users } = await fetchAccountTimeline(account, cfg.pages);

      const allArticleTweets = tweets.filter((t) => t.article);
      // Filter out quote tweets - they inherit article from quoted tweet
      const articles = allArticleTweets.filter(
        (t) => !t.referenced_tweets?.some((ref) => ref.type === "quoted")
      );
      const skippedQuotes = allArticleTweets.length - articles.length;

      console.error(`\n  Total tweets: ${tweets.length}`);
      console.error(`  Articles: ${articles.length}${skippedQuotes > 0 ? ` (${skippedQuotes} quote tweets skipped)` : ""}`);

      if (articles.length === 0) {
        console.error("  No articles found.\n");
        continue;
      }

      const now = new Date();
      const ageBuckets = { "<1hr": 0, "1-2hr": 0, "2-4hr": 0, "4hr+": 0 };
      for (const t of articles) {
        const ageH = (now.getTime() - new Date(t.created_at).getTime()) / 3600000;
        if (ageH < 1) ageBuckets["<1hr"]++;
        else if (ageH < 2) ageBuckets["1-2hr"]++;
        else if (ageH < 4) ageBuckets["2-4hr"]++;
        else ageBuckets["4hr+"]++;
      }

      console.error(`\n  Age distribution:`);
      for (const [bucket, count] of Object.entries(ageBuckets)) {
        console.error(`    ${bucket.padEnd(6)} ${count.toString().padStart(3)} ${"#".repeat(count)}`);
      }

      console.error(`\n  Articles:`);
      for (const tweet of articles) {
        const user = users[tweet.author_id];
        if (!user) continue;

        const scored = scoreArticle(tweet, user);
        if (!scored) continue;

        const ageStr = scored.ageHours < 1
          ? `${Math.round(scored.ageHours * 60)}m`
          : `${scored.ageHours.toFixed(1)}h`;

        console.error(
          `    [Score ${scored.scores.totalScore.toString().padStart(2)}] ` +
          `${ageStr.padStart(5)} old | ` +
          `${scored.metrics.likes}L ${scored.metrics.retweets}RT ${scored.metrics.impressions}imp | ` +
          `@${scored.author.username} (${scored.author.followers.toLocaleString()})`
        );
        if (scored.articleTitle) {
          console.error(`           "${scored.articleTitle.slice(0, 80)}"`);
        }
        console.error(`           ${scored.tweetUrl}`);

        const key = tweet.id;
        if (allArticles.has(key)) {
          allArticles.get(key)!.accounts.push(account);
        } else {
          allArticles.set(key, { article: scored, accounts: [account] });
        }
      }
    } catch (err: any) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  console.error(`\n\n=== CROSS-ACCOUNT SUMMARY ===`);
  console.error(`Unique articles: ${allArticles.size}`);
  const dupes = [...allArticles.values()].filter((v) => v.accounts.length > 1);
  if (dupes.length > 0) {
    console.error(`On multiple timelines: ${dupes.length}`);
    for (const d of dupes) {
      console.error(`  "${d.article.articleTitle || d.article.tweetId}" -> ${d.accounts.join(", ")}`);
    }
  }
}

// --- Run (one-shot or loop iteration) ---

async function runOnce(cfg: CLIConfig): Promise<number> {
  const processed = loadProcessed();
  const timestamp = new Date().toLocaleTimeString();
  console.error(`\n[${timestamp}] Fetching timelines...`);

  const pool = await buildArticlePool(cfg);

  // Filter out already-processed
  const fresh = pool.filter((a) => !processed.has(a.tweetId));

  console.error(`\nPool: ${pool.length} articles within ${cfg.maxAgeHours}h`);
  console.error(`Fresh (not yet submitted): ${fresh.length}`);

  if (fresh.length === 0) {
    console.error("Nothing new to submit.");
    return 0;
  }

  // Take top N
  const toSubmit = fresh.slice(0, cfg.limit);

  // Submit all to backend with auto-routing (backend picks best account)
  let submitted = 0;
  for (let i = 0; i < toSubmit.length; i++) {
    const article = toSubmit[i];

    const ageStr = article.ageHours < 1
      ? `${Math.round(article.ageHours * 60)}m`
      : `${article.ageHours.toFixed(1)}h`;

    if (cfg.dryRun) {
      console.log(
        `[DRY RUN] auto <- [Score ${article.scores.totalScore}] @${article.author.username} ` +
        `"${(article.articleTitle || "untitled").slice(0, 60)}" (${ageStr} old)`
      );
      console.log(`          ${article.tweetUrl}`);
      continue;
    }

    const result = await submitToQueue(article);

    if (result.ok) {
      submitted++;
      processed.add(article.tweetId);
      console.error(
        `  -> ${result.account}: [Score ${article.scores.totalScore}] @${article.author.username} ` +
        `"${(article.articleTitle || "untitled").slice(0, 50)}" | ${result.message}`
      );
    } else {
      console.error(
        `  x  @${article.author.username} | ${result.message}`
      );
      // Still mark as processed to avoid retrying duplicates
      if (result.message.includes("Already queued")) {
        processed.add(article.tweetId);
      }
    }
  }

  saveProcessed(processed);
  console.error(`\nSubmitted ${submitted}/${toSubmit.length} articles.`);
  return submitted;
}

// --- Main ---

async function main() {
  const cfg = parseArgs();

  if (cfg.explore) {
    await runExplore(cfg);
    return;
  }

  if (cfg.loop) {
    console.error(`=== TIMELINE ARTICLE LOOP ===`);
    console.error(`Interval: ${cfg.intervalMinutes} minutes`);
    console.error(`Max age: ${cfg.maxAgeHours}h | Limit per run: ${cfg.limit}`);
    console.error(`Backend: ${process.env.BACKEND_URL || "NOT SET"}\n`);

    // Run immediately on start
    await runOnce(cfg);

    // Then loop
    setInterval(async () => {
      try {
        await runOnce(cfg);
      } catch (err: any) {
        console.error(`\nLoop error: ${err.message}`);
      }
    }, cfg.intervalMinutes * 60 * 1000);
  } else {
    // One-shot
    if (!cfg.dryRun) {
      console.error(`Backend: ${process.env.BACKEND_URL || "NOT SET"}`);
    }
    await runOnce(cfg);
  }
}

main().catch((err) => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});
