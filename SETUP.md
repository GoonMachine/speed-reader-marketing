# Speed Reader Video Generator - Setup Guide

## Architecture

- **Frontend**: Next.js app hosted on Vercel (public)
- **Backend**: Express server running locally (exposed via ngrok)
- **Rendering**: Videos render on your local machine

---

## Local Development Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start the Backend Server
```bash
pnpm backend
```

The backend will start on `http://localhost:3001`

You should see:
```
🚀 Rendering Server Started
==========================
   Port: 3001
   Health: http://localhost:3001/health
   API: http://localhost:3001/api/render
```

### 3. Test the Backend
In another terminal:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","message":"Rendering server is running"}
```

### 4. Start the Frontend (for local testing)
```bash
pnpm dev
```

Visit `http://localhost:3000` to test the full stack locally.

---

## Exposing Your Backend with ngrok

### 1. Start ngrok
```bash
ngrok http 3001
```

You'll see output like:
```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001
```

Copy the `https://abc123.ngrok.io` URL.

### 2. Keep ngrok Running
Leave this terminal window open. Your backend is now publicly accessible at that URL.

---

## Deploying to Vercel

### 1. Install Vercel CLI (if you haven't)
```bash
pnpm add -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy: **Yes**
- Which scope: Choose your account
- Link to existing project: **No** (first time)
- Project name: **speed-reader-marketing** (or your choice)
- Directory: **./** (current directory)
- Override settings: **No**

### 4. Set Environment Variable in Vercel

After deployment, set your ngrok URL:

**Option A: Via CLI**
```bash
vercel env add BACKEND_URL
# When prompted, enter: https://your-ngrok-url.ngrok.io
# Select: Production, Preview, Development (all)
```

**Option B: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - Key: `BACKEND_URL`
   - Value: `https://your-ngrok-url.ngrok.io`
   - Environments: **Production**, **Preview**, **Development**

### 5. Redeploy
```bash
vercel --prod
```

Your site is now live! You'll get a URL like: `https://speed-reader-marketing.vercel.app`

---

## Usage

### For You and Your Friend:

1. **You**: Keep your computer running with:
   - Backend server: `pnpm backend`
   - ngrok tunnel: `ngrok http 3001`

2. **Anyone**: Visit your Vercel URL and use the form:
   - Enter article/tweet URL
   - Optionally enter reply tweet URL
   - Click "Generate Video"
   - Video renders on your machine
   - Result appears in the UI

---

## Important Notes

### ngrok Free Tier Limitations
- URL changes every time you restart ngrok
- You'll need to update the `BACKEND_URL` in Vercel each time
- To get a static URL: Upgrade to ngrok Pro ($8/month)

### Keeping ngrok URL Static (Recommended)
```bash
# Get a free ngrok account at https://ngrok.com
ngrok config add-authtoken YOUR_TOKEN

# Use a custom domain (requires paid plan)
ngrok http 3001 --domain=your-static-domain.ngrok.io
```

### Alternative: Cloudflare Tunnel (Free Static URL)
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3001
```

---

## Troubleshooting

### Backend won't start
- Make sure you're in the project directory
- Check that port 3001 is not in use: `lsof -ti:3001`

### Frontend can't connect to backend
- Check that `BACKEND_URL` is set correctly in Vercel
- Verify ngrok is running: visit the ngrok URL in a browser
- Check ngrok dashboard: `http://localhost:4040`

### Video rendering fails
- Check backend terminal for error logs
- Ensure `.env` file has correct credentials
- Verify the article URL is accessible

### Vercel deployment fails
- Run `pnpm build` locally first to check for errors
- Check that all dependencies are in `package.json`

---

## Commands Reference

```bash
# Backend
pnpm backend              # Start rendering server

# Frontend
pnpm dev                  # Start Next.js dev server
pnpm build                # Build for production
pnpm start                # Start production server

# Legacy CLI commands (still work)
pnpm render:url <url>     # Render video via CLI
pnpm post <video> <tweet> # Post video to X

# Vercel
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel env ls             # List environment variables
vercel logs               # View deployment logs
```

---

## Cost Breakdown

- **Vercel Hosting**: Free (Hobby plan)
- **Rendering**: Free (runs on your machine)
- **ngrok Free**: Free but URL changes each restart
- **ngrok Pro** (optional): $8/month for static URL
- **Cloudflare Tunnel**: Free with static URL

---

## Next Steps

### Optional Enhancements:
1. **Add authentication** - Protect the form with a password
2. **Job queue** - Queue multiple videos
3. **Video storage** - Upload rendered videos to S3/Cloudinary
4. **Webhook notifications** - Get notified when videos are done
5. **Better UI** - Add progress bars, preview thumbnails

### Scaling Later:
When you want to scale beyond local rendering:
- Deploy backend to Railway/Render (~$5/month)
- Or switch to Remotion Lambda (AWS, ~$0.05-0.20 per video)

---

## Support

If you run into issues:
1. Check the backend terminal for error logs
2. Check ngrok dashboard at `http://localhost:4040`
3. Check Vercel deployment logs: `vercel logs`

Happy rendering! 🎬
