# Postiz Integration — TikTok Auto-Posting

Automate posting TikTok content for @usespeedread via Postiz.

## What is Postiz
Postiz is an open-source social media scheduling tool that supports TikTok posting via their API. Oliver Henry uses it for his Larry agent to auto-post 3x daily.

- **Website**: https://postiz.com
- **GitHub**: https://github.com/gitroomhq/postiz-app
- **Deployment**: Self-hosted (Docker) or Postiz Cloud

## Setup

### Option 1: Postiz Cloud (Fastest)
1. Sign up at https://postiz.com
2. Connect your TikTok account (@usespeedread)
3. Get your API key from Settings → API
4. Save API key to environment:
```bash
echo 'POSTIZ_API_KEY=your_key_here' >> ~/.config/env/global.env
```

### Option 2: Self-Hosted (More Control)
```bash
# Clone and run with Docker
git clone https://github.com/gitroomhq/postiz-app.git
cd postiz-app
cp .env.example .env
# Edit .env with your config
docker-compose up -d
```

### TikTok Developer Setup
To post to TikTok via Postiz, you need TikTok API access:
1. Go to https://developers.tiktok.com
2. Create an app → select "Content Posting API"
3. Submit for review (may take a few days)
4. Connect through Postiz's TikTok integration
5. Authorize @usespeedread account

**Note**: Oliver mentioned getting TikTok to approve Postiz access can be tricky — some users report being denied multiple times. Be persistent and ensure your app description clearly states it's for your own content scheduling.

## Postiz API Usage

### Base URL
```
# Cloud
https://app.postiz.com/api

# Self-hosted
http://localhost:5000/api
```

### Authentication
```bash
curl -H "Authorization: Bearer $POSTIZ_API_KEY" \
  https://app.postiz.com/api/posts
```

### Create a Scheduled Post
```bash
curl -X POST https://app.postiz.com/api/posts \
  -H "Authorization: Bearer $POSTIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hook text for TikTok caption",
    "platforms": ["tiktok"],
    "scheduledAt": "2026-02-13T14:00:00Z",
    "media": ["/path/to/video.mp4"]
  }'
```

### List Scheduled Posts
```bash
curl -H "Authorization: Bearer $POSTIZ_API_KEY" \
  https://app.postiz.com/api/posts?status=scheduled
```

### Get Post Analytics
```bash
curl -H "Authorization: Bearer $POSTIZ_API_KEY" \
  https://app.postiz.com/api/posts/{post_id}/analytics
```

## Posting Schedule

Default schedule (adjust based on audience timezone — US focus):
- **Morning**: 8:00 AM EST (student commute / professional morning)
- **Afternoon**: 1:00 PM EST (lunch break scroll)
- **Evening**: 7:00 PM EST (prime time wind-down scroll)

## Content Pipeline Integration

### Flow
```
1. tiktok-content skill generates scripts → data/content-queue/
2. Scripts reviewed (or auto-approved)
3. Video assets created (screen recordings + text overlays)
4. Posted via Postiz API with scheduled time
5. Performance tracked in data/performance/
```

### Auto-Post Script
```bash
# Post next queued content
source ~/.config/env/global.env

# Read next script from queue
NEXT_SCRIPT=$(ls data/content-queue/*.md | head -1)

# Extract caption and media path
CAPTION=$(head -1 "$NEXT_SCRIPT" | sed 's/^# //')
VIDEO_PATH=$(grep 'video:' "$NEXT_SCRIPT" | awk '{print $2}')

# Schedule via Postiz
curl -X POST https://app.postiz.com/api/posts \
  -H "Authorization: Bearer $POSTIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$CAPTION\",
    \"platforms\": [\"tiktok\"],
    \"scheduledAt\": \"$(date -u -v+1H +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Move to posted
mv "$NEXT_SCRIPT" data/posted/
```

## Video Creation Notes

TikTok content for Speed Read RSVP will primarily be:
1. **Screen recordings** of the app in action (showing RSVP reading)
2. **Text overlay videos** — hook text on screen with background
3. **Green screen / talking head** — if the creator wants to go on camera

For fully automated (no human on camera):
- Screen record the app reading an article at high speed
- Add text overlay with the hook
- Add trending audio (manual step — or use TikTok's auto-select)
- Keep 9:16 vertical format, 1080x1920

## Troubleshooting

### TikTok API Approval
If TikTok keeps denying your Postiz app:
- Make sure app description says "scheduling my own content for my own account"
- Don't mention automation or bots
- Apply as an individual creator, not a business
- Try re-applying after 7 days if denied

### Rate Limits
- TikTok Content Posting API: ~20 posts/day per account
- 3 posts/day is well within limits
- Don't post more than 1 per hour to avoid spam detection
