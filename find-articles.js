const { chromium } = require("playwright");
const { z } = require("zod");
const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load .env file
config();

/**
 * Find recent articles from X.com "For You" feed (LOCAL MODE)
 *
 * This script will:
 * 1. Connect to X.com using local Chrome profile (already logged in)
 * 2. Scroll through the "For You" feed
 * 3. Find articles posted within the last 2 hours
 * 4. Return the first 1 article URL
 */

// Schema for extracted tweet data
const TweetSchema = z.object({
  tweets: z.array(
    z.object({
      author: z.string().describe("The username or display name of the tweet author"),
      text: z.string().describe("The main text content of the tweet"),
      timestamp: z.string().describe("Relative timestamp like '2h', '1h', '30m'"),
      hasLink: z.boolean().describe("Whether the tweet contains a link"),
      linkUrl: z.string().optional().describe("The URL if a link is present"),
      tweetUrl: z.string().optional().describe("The URL to the tweet itself (x.com/username/status/...)"),
      isQuoteTweet: z.boolean().describe("Whether this is a quote tweet"),
    })
  ),
});

/**
 * Parse relative timestamp to hours
 * @param {string} timestamp - Relative timestamp like "2h", "30m", "1d"
 * @returns {number} - Hours ago
 */
function parseTimestamp(timestamp) {
  const match = timestamp.match(/^(\d+)([mhd])$/);
  if (!match) return Infinity;

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case "m":
      return num / 60; // minutes to hours
    case "h":
      return num;
    case "d":
      return num * 24;
    default:
      return Infinity;
  }
}

/**
 * Check if a URL is an X article (native X.com article, not external links)
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isXArticleUrl(url) {
  if (!url) return false;

  // X articles follow patterns like:
  // - https://x.com/i/articles/...
  // - https://twitter.com/i/articles/...

  return (
    (url.includes("x.com/i/articles/") || url.includes("twitter.com/i/articles/")) ||
    // Some X articles might be linked differently, look for article identifiers
    (url.includes("x.com") && url.includes("/article"))
  );
}

/**
 * Check if a URL is a ZeroHedge article
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isZeroHedgeArticleUrl(url) {
  if (!url) return false;

  // ZeroHedge articles are hosted on zerohedge.com
  return url.includes("zerohedge.com");
}

/**
 * Check if a username is the ZeroHedge account
 * @param {string} author - Username or display name
 * @returns {boolean}
 */
function isZeroHedgeAccount(author) {
  if (!author) return false;

  // Match @zerohedge or "zerohedge" (case insensitive)
  const normalized = author.toLowerCase().replace("@", "");
  return normalized === "zerohedge";
}

/**
 * Process an article: like it and submit to backend queue
 * @param {Object} page - Playwright page object
 * @param {Object} article - Article object with articleUrl, etc
 * @param {number} articleCount - Current article count (1)
 */
async function processArticle(page, article, articleCount) {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

  // Like the article
  try {
    console.log(`   ❤️  Liking article ${articleCount}/1...`);
    await page.goto(article.articleUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);

    const likeButton = page.locator('[data-testid="like"]').first();
    if (await likeButton.isVisible({ timeout: 5000 })) {
      await likeButton.click();
      console.log(`   ✅ Liked article ${articleCount}/1`);
      await page.waitForTimeout(500);
    } else {
      console.log(`   ⚠️  Like button not found for article ${articleCount}/1`);
    }

    // Navigate back to home feed to continue scrolling
    await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log(`   ❌ Failed to like article ${articleCount}/1: ${error.message}`);
    // Try to return to home feed even if liking failed
    try {
      await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`   ⚠️  Failed to return to home feed`);
    }
  }

  // Submit to backend queue (backend handles scheduling with 5-min spacing)
  try {
    console.log(`   📤 Submitting to queue...`);

    const response = await fetch(`${BACKEND_URL}/api/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleUrl: article.articleUrl,
        replyToUrl: article.articleUrl,
        wpm: 400,
        account: 'auto', // Auto-route to account with earliest open slot
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const scheduledDate = new Date(data.queueItem.scheduledTime);
      console.log(`   ✅ Added to queue (position ${data.queueItem.queuePosition})`);
      console.log(`   ⏰ Scheduled for: ${scheduledDate.toLocaleTimeString()}`);
    } else if (response.status === 409 && data.alreadyExists) {
      console.log(`   ⚠️  Skipped: ${data.message}`);
    } else {
      console.log(`   ❌ Backend error ${response.status} for article ${articleCount}/1`);
    }
  } catch (error) {
    console.log(`   ❌ Failed to queue article ${articleCount}/1: ${error.message}`);
  }
}

/**
 * Copy session data from Chrome Profile 11 (twitter) to automation profile
 */
function copyTwitterProfile() {
  const sourceProfile = path.join(
    process.env.HOME,
    "Library/Application Support/Google/Chrome/Profile 11"
  );
  const targetProfile = path.join(__dirname, "chrome-automation-profile", "Default");

  console.log("📋 Copying session from Chrome Profile 11 (twitter)...\n");

  if (!fs.existsSync(sourceProfile)) {
    console.log("⚠️  Chrome Profile 11 not found, skipping copy");
    return false;
  }

  // Create target directory
  fs.mkdirSync(targetProfile, { recursive: true });

  // Files to copy that contain session data
  const filesToCopy = ["Cookies", "Local Storage", "Preferences"];

  let copiedCount = 0;
  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceProfile, file);
    const targetPath = path.join(targetProfile, file);

    if (fs.existsSync(sourcePath)) {
      try {
        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
          fs.cpSync(sourcePath, targetPath, { recursive: true });
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
        console.log(`✅ Copied: ${file}`);
        copiedCount++;
      } catch (error) {
        console.log(`⚠️  Could not copy ${file}: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Copied ${copiedCount} items from Twitter profile\n`);
  return copiedCount > 0;
}

async function findArticles(context = null, page = null) {
  const startTime = new Date();
  console.log("🔍 Starting X article search...");
  console.log(`   Time: ${startTime.toLocaleTimeString()}`);
  const TARGET_ARTICLES = 3;
  console.log("   Looking for:");
  console.log("     • Native X articles - last 2 hours");
  console.log("     • ZeroHedge articles - last 1 hour");
  console.log(`     • Target: ${TARGET_ARTICLES} articles per cycle\n`);

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Error: Missing OPENAI_API_KEY or ANTHROPIC_API_KEY in .env");
    process.exit(1);
  }

  // Load processed URLs to avoid duplicates across runs
  const processedUrlsPath = path.join(__dirname, "processed-urls.json");
  let processedUrls = new Set();

  try {
    if (fs.existsSync(processedUrlsPath)) {
      const data = JSON.parse(fs.readFileSync(processedUrlsPath, "utf8"));
      processedUrls = new Set(data.urls || []);
      console.log(`📋 Loaded ${processedUrls.size} previously processed URLs\n`);
    }
  } catch (error) {
    console.log("⚠️  Could not load processed URLs, starting fresh\n");
  }

  // If context/page not provided, we need to launch browser
  const needsLaunch = !context || !page;

  if (needsLaunch) {
    // Setup automation profile
    const CHROME_USER_DATA_DIR = path.join(__dirname, "chrome-automation-profile");
    const isFirstRun = !fs.existsSync(CHROME_USER_DATA_DIR);

    if (isFirstRun) {
      console.log("👋 First time setup detected!");
      console.log("   Attempting to copy session from your Twitter Chrome profile...\n");
      copyTwitterProfile();
    }

    // Check for headless mode preference
    const headless = process.env.HEADLESS === "true";
    if (headless) {
      console.log("👻 Running in headless mode\n");
    } else {
      console.log("🖥️  Running with visible browser\n");
    }

    try {
      // Launch Chrome with persistent context
      console.log("🎭 Launching Chrome with persistent context...");

      context = await chromium.launchPersistentContext(CHROME_USER_DATA_DIR, {
        headless: headless,
        channel: "chrome",
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-first-run",
          "--no-default-browser-check",
        ],
        timeout: 30000,
      });

      // Get or create a page
      const pages = context.pages();
      page = pages.length > 0 ? pages[0] : await context.newPage();
      console.log("✅ Chrome launched\n");
    } catch (error) {
      console.error("\n❌ Error launching browser:", error.message);
      console.error(error.stack);
      process.exit(1);
    }
  } else {
    console.log("♻️  Reusing existing browser session\n");
  }

  try {

    // Navigate to X.com For You feed
    console.log("🌐 Navigating to X.com For You feed...");
    await page.goto("https://x.com/home", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait a bit for any redirects to happen
    await page.waitForTimeout(2000);

    // Check if we're logged in or on the login page
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes("/login") ||
                        currentUrl.includes("/i/flow/login") ||
                        currentUrl.includes("/i/flow/signup");

    // Also check for login form elements
    const hasLoginForm = await page.locator('input[name="text"]').count() > 0 ||
                         await page.locator('input[autocomplete="username"]').count() > 0;

    if (isLoginPage || hasLoginForm) {
      console.log("\n⚠️  You need to log into X!");
      console.log("👉 Please log in using the browser window.");
      console.log("⏳ Waiting for you to log in...");
      console.log("   (The script will automatically continue once you're on the home feed)\n");

      // Wait for navigation to home feed (user logs in)
      try {
        await page.waitForURL("**/home", { timeout: 300000 }); // 5 minute timeout
        console.log("✅ Login detected! Continuing...\n");
        await page.waitForTimeout(3000); // Let the feed load
      } catch (error) {
        console.log("\n⚠️  Timeout waiting for login. Please try again.");
        if (needsLaunch) {
          await context.close();
          process.exit(1);
        } else {
          return { articles: [], context, page };
        }
      }
    } else {
      console.log("✅ Already logged in\n");
    }

    const articles = [];
    let sessionCount = 0;
    const maxSessions = 5; // Max scroll sessions within this cycle
    const maxScrollsPerSession = 100; // Scrolls per session

    console.log("📜 Searching for articles...\n");
    console.log(`   Target: ${TARGET_ARTICLES} articles`);
    console.log(`   Max sessions: ${maxSessions}`);
    console.log(`   Max scrolls per session: ${maxScrollsPerSession}\n`);

    // Retry logic: Multiple scroll sessions within the same cycle
    while (articles.length < TARGET_ARTICLES && sessionCount < maxSessions) {
      sessionCount++;
      console.log("─".repeat(60));
      console.log(`📍 SESSION ${sessionCount}/${maxSessions}`);
      console.log("─".repeat(60));

      let scrollCount = 0;

      while (articles.length < TARGET_ARTICLES && scrollCount < maxScrollsPerSession) {
        scrollCount++;
        console.log(`   Scroll ${scrollCount}/${maxScrollsPerSession}... (${articles.length}/${TARGET_ARTICLES} found)`);

      // Extract tweet data from current view using Playwright
      try {
        // Get all article elements (tweets) from the timeline
        const tweetData = await page.evaluate(() => {
          const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
          console.log(`[DEBUG] Found ${articles.length} tweets in DOM`);
          return articles.slice(0, 20).map(article => {
            const textContent = article.innerText || '';

            // Find timestamp
            const timeElement = article.querySelector('time');
            const timestamp = timeElement ? timeElement.getAttribute('datetime') : null;

            // Find ALL links
            const allLinks = [];
            article.querySelectorAll('a').forEach(link => {
              if (link.href) {
                allLinks.push(link.href);
              }
            });

            // Find author from profile link
            const authorElement = article.querySelector('a[href^="/"]');
            let author = '';
            if (authorElement && authorElement.href) {
              const match = authorElement.href.match(/\/([\w]+)/);
              if (match) author = match[1];
            }

            // Check if this is a quote tweet
            // In timeline view, quote tweets have:
            // 1. The word "Quote" in the text
            // 2. Multiple different status IDs
            const hasQuoteText = textContent.includes('\nQuote\n') || textContent.includes('Quote\n');

            // Count unique status IDs
            const statusLinks = Array.from(article.querySelectorAll('a[href*="/status/"]'));
            const uniqueStatusIds = [...new Set(statusLinks.map(a => {
              const match = a.href.match(/\/status\/(\d+)/);
              return match ? match[1] : null;
            }).filter(id => id !== null))];

            const isQuoteTweet = hasQuoteText || uniqueStatusIds.length > 1;

            // Look for X article cover image (native articles)
            const hasArticleCover = article.querySelector('[data-testid="article-cover-image"]') !== null;

            // If it's an article, find the link to it
            let articleUrl = null;
            if (hasArticleCover) {
              // The tweet itself with article cover is clickable - find the status link
              const statusLink = article.querySelector('a[href*="/status/"]');
              if (statusLink) {
                articleUrl = statusLink.href;
              }
            }

            // Also look for regular preview cards
            const hasCard = article.querySelector('[data-testid="card.wrapper"]') !== null;
            const cardLink = article.querySelector('[data-testid="card.wrapper"] a');
            const cardUrl = cardLink ? cardLink.href : null;

            // External links (not x.com/twitter.com)
            const externalLinks = allLinks.filter(href =>
              !href.includes('x.com') &&
              !href.includes('twitter.com') &&
              href.startsWith('http')
            );

            return {
              text: textContent.substring(0, 500),
              timestamp: timestamp,
              author: author,
              isQuoteTweet: isQuoteTweet,
              hasArticleCover: hasArticleCover,
              articleUrl: articleUrl,
              hasCard: hasCard,
              cardUrl: cardUrl,
              externalLinks: externalLinks,
              allLinksCount: allLinks.length,
              allLinks: allLinks.slice(0, 5),
            };
          });
        });

        const result = { tweets: tweetData };

        // DEBUG: Show what we got
        console.log(`   [DEBUG] Processed ${result.tweets.length} tweets from DOM`);

        // Simple progress logging
        const tweetsWithArticles = result.tweets.filter(t => t.hasArticleCover && !t.isQuoteTweet);
        const quoteTweetsWithArticles = result.tweets.filter(t => t.hasArticleCover && t.isQuoteTweet);
        const regularTweets = result.tweets.filter(t => !t.hasArticleCover);

        console.log(`   [DEBUG] Articles: ${tweetsWithArticles.length}, Quote Articles: ${quoteTweetsWithArticles.length}, Regular: ${regularTweets.length}`);

        if (tweetsWithArticles.length > 0) {
          console.log(`   📰 ${tweetsWithArticles.length} article(s) visible`);
        }
        if (quoteTweetsWithArticles.length > 0) {
          console.log(`   🔁 Skipped ${quoteTweetsWithArticles.length} quote tweet(s)`);
        }

        // Filter tweets with articles (NO TIME FILTER for debugging)
        if (result && result.tweets) {
          for (const tweet of result.tweets) {
            // Calculate hours ago from ISO timestamp
            let hoursAgo = Infinity;
            if (tweet.timestamp) {
              const tweetTime = new Date(tweet.timestamp);
              const now = new Date();
              hoursAgo = (now - tweetTime) / (1000 * 60 * 60);
            }

            // Check if this tweet has an X article cover (within 2 hours)
            // Skip quote tweets - we only want original articles
            if (tweet.hasArticleCover && tweet.articleUrl && hoursAgo <= 2 && !tweet.isQuoteTweet) {
              // Avoid duplicates (in current run and across previous runs)
              if (!articles.some((a) => a.articleUrl === tweet.articleUrl) && !processedUrls.has(tweet.articleUrl)) {
                const article = {
                  articleUrl: tweet.articleUrl,
                  tweetUrl: `https://x.com/${tweet.author}`,
                  author: tweet.author,
                  text: tweet.text.substring(0, 100) + "...",
                  timestamp: `${Math.round(hoursAgo)}h ago`,
                  isQuoteTweet: false,
                  source: "X Article",
                };

                articles.push(article);
                processedUrls.add(article.articleUrl);

                console.log(`   ✅ Found X article (${Math.round(hoursAgo)}h ago): ${tweet.articleUrl.substring(0, 60)}...`);

                // Like and queue immediately
                await processArticle(page, article, articles.length);

                if (articles.length >= TARGET_ARTICLES) break;
              }
            }

            // Also check for ZeroHedge links in external links (within 1 hour, from @zerohedge)
            // DEBUG: Check if this is a ZeroHedge tweet
            if (isZeroHedgeAccount(tweet.author)) {
              console.log(`   [ZH DEBUG] Found @zerohedge tweet, ${tweet.externalLinks?.length || 0} external links, ${hoursAgo.toFixed(1)}h ago`);
              if (tweet.externalLinks?.length > 0) {
                console.log(`   [ZH DEBUG] External links: ${JSON.stringify(tweet.externalLinks)}`);
              }
              if (tweet.cardUrl) {
                console.log(`   [ZH DEBUG] Card URL: ${tweet.cardUrl}`);
              }
            }

            for (const linkUrl of tweet.externalLinks || []) {
              if (isZeroHedgeArticleUrl(linkUrl) && hoursAgo <= 1 && isZeroHedgeAccount(tweet.author)) {
                // Avoid duplicates (in current run and across previous runs)
                if (!articles.some((a) => a.articleUrl === linkUrl) && !processedUrls.has(linkUrl)) {
                  const article = {
                    articleUrl: linkUrl,
                    tweetUrl: `https://x.com/${tweet.author}`,
                    author: tweet.author,
                    text: tweet.text.substring(0, 100) + "...",
                    timestamp: `${Math.round(hoursAgo)}h ago`,
                    isQuoteTweet: false,
                    source: "ZeroHedge",
                  };

                  articles.push(article);
                  processedUrls.add(article.articleUrl);

                  console.log(`   ✅ Found ZeroHedge article (${Math.round(hoursAgo)}h ago): ${linkUrl.substring(0, 60)}...`);

                  // Like and queue immediately
                  await processArticle(page, article, articles.length);

                  if (articles.length >= TARGET_ARTICLES) break;
                }
              }
            }

            if (articles.length >= TARGET_ARTICLES) break;
          }
        }
      } catch (extractError) {
        console.log(`   ⚠️  Extraction failed: ${extractError.message}`);
      }

      // Break if we found enough articles
      if (articles.length >= TARGET_ARTICLES) break;

        // Occasionally scroll up first to "unstick" the feed (mimics human behavior)
        if (scrollCount % 5 === 0) {
          console.log(`   🔼 Scrolling up significantly to refresh feed...`);
          // Scroll up a fair bit (5-6 screens worth)
          await page.evaluate(() => window.scrollBy(0, -window.innerHeight * 6));
          await page.waitForTimeout(1500);
          console.log(`   🔽 Scrolling back down to continue...`);
        }

        // Scroll down to load more tweets (scroll to bottom to trigger X's infinite scroll)
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(3000); // Wait longer for new content to load
      }

      // End of scroll session
      console.log(`\n   Session ${sessionCount} complete: ${articles.length}/${TARGET_ARTICLES} found after ${scrollCount} scrolls`);

      // If we didn't hit target and have more sessions available, reload and retry
      if (articles.length < TARGET_ARTICLES && sessionCount < maxSessions) {
        console.log(`   ⏳ Reloading feed for session ${sessionCount + 1}...\n`);
        await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(3000);
      }
    }

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log("\n" + "=".repeat(60));
    console.log(`📊 SEARCH COMPLETE (${duration}s)`);
    console.log("=".repeat(60));
    console.log(`   Found: ${articles.length} article(s)`);
    console.log(`   Sessions: ${sessionCount}/${maxSessions}`);
    console.log(`   Time: ${endTime.toLocaleTimeString()}`);

    if (articles.length > 0) {
      console.log("\n📰 Articles Processed:");
      articles.forEach((article, index) => {
        const url = article.articleUrl.length > 70
          ? article.articleUrl.substring(0, 70) + "..."
          : article.articleUrl;
        console.log(`   ${index + 1}. ${url}`);
        console.log(`      Posted: ${article.timestamp}`);
        console.log(`      Status: Liked ✓ | Queued ✓`);
      });

      // Save updated processed URLs
      fs.writeFileSync(
        processedUrlsPath,
        JSON.stringify({ urls: Array.from(processedUrls) }, null, 2)
      );
      fs.writeFileSync(
        "./articles-found.json",
        JSON.stringify(articles, null, 2)
      );
      console.log(`\n💾 Saved to disk (${processedUrls.size} total tracked)`);
    } else {
      console.log("\n⚠️  No articles found in this cycle");
      console.log("   This is normal - will try again in 1 hour");
    }

    // Don't close browser - keep it open for next cycle
    console.log("\n✅ Cycle complete! Browser staying open for next cycle...");

    return { articles, context, page };

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    // Only exit if we launched the browser ourselves
    if (needsLaunch) {
      process.exit(1);
    } else {
      return { articles: [], context, page };
    }
  }
}

// Run continuously every 1.5 hours if called directly
if (require.main === module) {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  let cycleCount = 0;
  let browserContext = null;
  let browserPage = null;
  let isRunning = false; // Guard to prevent concurrent executions

  console.log("\n" + "=".repeat(60));
  console.log("🤖 CONTINUOUS ARTICLE FINDER");
  console.log("=".repeat(60));
  console.log(`   Interval: Every ${INTERVAL_MS / 60000} minutes`);
  console.log(`   Started: ${new Date().toLocaleString()}`);
  console.log(`   Press Ctrl+C to stop\n`);

  // Function to run a cycle with concurrency guard
  async function runCycle() {
    if (isRunning) {
      console.log("⚠️  Previous cycle still running, skipping this interval...\n");
      return;
    }

    isRunning = true;
    cycleCount++;
    const nextRun = new Date(Date.now() + INTERVAL_MS);

    console.log("=".repeat(60));
    console.log(`🔄 CYCLE #${cycleCount}`);
    console.log("=".repeat(60));
    console.log(`   Time: ${new Date().toLocaleString()}`);
    if (cycleCount > 1) {
      console.log(`   Next cycle: ${nextRun.toLocaleTimeString()}`);
    }
    console.log();

    try {
      const result = await findArticles(browserContext, browserPage);
      // Save browser context/page for next cycle
      browserContext = result.context;
      browserPage = result.page;
    } catch (err) {
      console.error("❌ Error in cycle:", err.message);
    } finally {
      isRunning = false;
    }
  }

  // Run first cycle immediately
  runCycle();

  // Then run every 1.5 hours
  setInterval(runCycle, INTERVAL_MS);

  // Keep process alive and clean up browser on exit
  process.on('SIGINT', async () => {
    console.log("\n\n" + "=".repeat(60));
    console.log("👋 SHUTTING DOWN");
    console.log("=".repeat(60));
    console.log(`   Total cycles: ${cycleCount}`);
    console.log(`   Stopped: ${new Date().toLocaleString()}`);

    if (browserContext) {
      console.log("   Closing browser...");
      try {
        await browserContext.close();
        console.log("   ✅ Browser closed");
      } catch (e) {
        console.log("   ⚠️  Error closing browser");
      }
    }
    console.log();
    process.exit(0);
  });
}

module.exports = { findArticles };
