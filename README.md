# Speed Reader Marketing

Automated video generation and X (Twitter) posting pipeline for Speed Reader marketing content. Built with Remotion for scalable, headless video rendering.

## Features

- **Two Remotion Compositions:**
  - `RSVPDemo`: Full-screen RSVP reader with header, controls, and outro
  - `RSVPiPhone`: iPhone frame overlay with RSVP reader (perfect for social media)

- **Article Extraction:** Fetch and extract article content from URLs using hosted backend API

- **X API Integration:** Automated tweet replies with video uploads using OAuth 1.0a

- **RSVP Technology:** Accurate Rapid Serial Visual Presentation timing matching the Speed Reader app

## Installation

```bash
npm install
# or
pnpm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# X (Twitter) API Credentials (for automated posting)
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret

# Backend API URL (for article extraction)
BACKEND_URL=https://speedread-api-server-production.up.railway.app
```

### Getting X API Credentials

1. Go to [X Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Set app permissions to "Read and Write"
4. Generate API Key, API Secret, Access Token, and Access Token Secret
5. Add credentials to `.env` file

## Usage

### 1. Render Basic Demo Video

Renders the full-screen RSVP composition with demo text:

```bash
npm run render
```

Output: `./out/demo-YYYY-MM-DD-HHMMSS.mp4`

### 2. Render iPhone Frame Video

Renders the iPhone frame overlay composition:

```bash
npm run render:iphone
```

Output: `./out/demo-YYYY-MM-DD-HHMMSS.mp4`

### 3. Render from URL

Extract article from URL and render video:

```bash
npm run render:url <article_url> [composition] [duration_seconds]
```

**Examples:**

```bash
# Render 60s video with default (full-screen) composition
npm run render:url https://example.com/article

# Render 30s video with iPhone frame composition
npm run render:url https://example.com/article RSVPiPhone 30

# Render 90s video with full-screen composition
npm run render:url https://example.com/article RSVPDemo 90
```

### 4. Post Video to X (Twitter)

Reply to a tweet with a video:

```bash
npm run post <video_path> <tweet_url> [reply_message]
```

**Examples:**

```bash
# Reply with video and default message
npm run post ./out/demo-2024-01-22.mp4 https://twitter.com/user/status/123456789

# Reply with custom message
npm run post ./out/demo-2024-01-22.mp4 https://twitter.com/user/status/123456789 "Check this out!"
```

### Full Pipeline Example

Extract article, render video, and post to X:

```bash
# Step 1: Render video from article URL (60s, iPhone composition)
npm run render:url https://example.com/article RSVPiPhone 60

# Step 2: Post the rendered video to X
npm run post ./out/demo-2024-01-22-HHMMSS.mp4 https://twitter.com/user/status/123456789
```

## Project Structure

```
speed-reader-marketing/
├── remotion/
│   ├── compositions/
│   │   ├── RSVPDemo.tsx          # Full-screen RSVP composition
│   │   └── RSVPiPhone.tsx        # iPhone frame overlay composition
│   ├── lib/
│   │   └── rsvp-web.ts           # Web-compatible RSVP helpers
│   ├── Root.tsx                  # Composition registration
│   └── index.ts                  # Entry point
├── scripts/
│   ├── render-demo.ts            # Basic rendering script
│   ├── render-from-url.ts        # URL → video pipeline
│   └── reply-to-x-api.ts         # X API posting script
├── lib/
│   └── shared-rsvp.ts            # Core RSVP logic (tokenization, ORP, timing)
├── public/
│   ├── iPhone Frame(2).png       # iPhone frame mockup
│   ├── iphone-frame.png          # Original iPhone frame
│   └── logo.png                  # Speed Reader logo
└── out/                          # Rendered videos (auto-created)
```

## How It Works

### RSVP Timing

The video compositions use the exact same timing logic as the Speed Reader app:

```typescript
const elapsedMs = (frame / fps) * 1000;
const msPerWord = 60000 / wpm;
const currentWordIndex = Math.floor(elapsedMs / msPerWord);
```

### ORP (Optimal Recognition Point)

Each word is split into three parts:
- **Before**: Characters before the ORP
- **ORP**: The highlighted letter (red)
- **After**: Characters after the ORP

The ORP is calculated based on word length to maximize reading speed and comprehension.

### Video Compositions

**RSVPDemo**: Full-screen composition with:
- Header with article title and word count
- RSVP word display with top/bottom markers
- Progress bar and word counter
- WPM display
- Animated outro with logo and CTA

**RSVPiPhone**: iPhone frame overlay with:
- iPhone mockup background
- Article title
- RSVP word display (scaled and positioned)
- Progress bar

## Customization

### Adjust iPhone Frame Positioning

Edit `remotion/Root.tsx` to adjust the screen area:

```typescript
defaultProps={{
  articleText: DEMO_TEXT,
  wpm: WPM,
  title: "Demo: Speed Reading Technology",
  screenX: 240,      // Horizontal offset
  screenY: 80,       // Vertical offset
  screenWidth: 600,  // Screen area width
  screenHeight: 920, // Screen area height
}}
```

### Change WPM or Demo Text

Edit `remotion/Root.tsx`:

```typescript
const DEMO_TEXT = "Your demo text here...";
const WPM = 500; // Words per minute
```

### Modify Composition Duration

Duration is auto-calculated based on word count and WPM. To add extra time (e.g., for outro), edit `remotion/Root.tsx`:

```typescript
const OUTRO_SECONDS = 5; // Time after reading completes
```

## Troubleshooting

### "Failed to load resource: 404" for images

Ensure images are in the `public/` folder. Remotion uses `staticFile()` to reference files in `public/`.

### X API Authentication Errors

- Verify your app permissions are set to "Read and Write"
- Regenerate tokens after changing permissions
- Ensure all 4 credentials are in `.env`

### Video Rendering Fails

- Check that article URL is accessible
- Verify backend API is running (Railway deployment)
- Ensure you have enough disk space in `./out/`

## Tech Stack

- **Remotion** - React-based video generation
- **TypeScript** - Type-safe development
- **tRPC** - Type-safe API client for backend
- **X API v1.1** - Twitter posting with OAuth 1.0a
- **Node.js** - Runtime environment

## License

MIT

## Credits

Built for [Speed Reader](https://speedread.app) - The fastest way to read articles on your phone.
