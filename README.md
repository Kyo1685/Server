# Server Setup Guide — Myanmar Accessible

## Quick Start (Local Testing)

```bash
cd sdk-admin
npm install
npm start
```

Server runs on `http://localhost:3000`
- Config: `http://localhost:3000/ad-config.json`
- DEX: `http://localhost:3000/dex/remote_module.dex`
- Health: `http://localhost:3000/health`

## Deploy to Cloudflare Pages (Recommended for Myanmar)

Cloudflare has good CDN coverage in Myanmar and Southeast Asia.

### Step 1: Create GitHub Repository

```bash
cd sdk-admin
git init
git add .
git commit -m "Initial server setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kyo-sdk-server.git
git push -u origin main
```

### Step 2: Deploy to Cloudflare Pages

1. Go to https://dash.cloudflare.com/pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Framework preset**: None
   - **Build command**: (leave empty — no build needed)
   - **Output directory**: `.`
   - **Root directory**: `sdk-admin`
5. Click "Save and Deploy"

### Step 3: Update App Config

After deployment, your URLs will be:
- Config: `https://your-project.pages.dev/ad-config.json`
- DEX: `https://your-project.pages.dev/dex/remote_module.dex`

Update the encoded URLs in `RemoteConfig.kt` (line 21-24):

```kotlin
// Generate new Base64 URL:
// echo -n "https://your-project.pages.dev/ad-config.json" | base64
private val ENCODED_SERVER_URL = "aHR0cHM6Ly95b3VyLXByb2plY3QucGFnZXMuZGV2L2FkLWNvbmZpZy5qc29u"
private val ENCODED_FALLBACK_URL = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1lPVVJfVVNFUi9reW8tc2RrLXNlcnZlci9tYWluL2FkLWNvbmZpZy5qc29u"
```

## Deploy to Vercel (Alternative)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in `sdk-admin` directory
3. Follow prompts
4. Your app will be live at `https://your-app.vercel.app`

## Deploy to GitHub Pages + Cloudflare Proxy

You're already using GitHub. Enable Cloudflare proxy for speed:

1. Add a custom domain (e.g., `api.yourdomain.com`)
2. Add DNS records in Cloudflare pointing to GitHub Pages IP
3. Enable "Proxied" mode (orange cloud) for CDN

## File Structure

```
sdk-admin/
├── server.js              # Express server (optional — not needed for static hosting)
├── package.json           # Node.js dependencies
├── ad-config.json         # SDK configuration
├── dex/                   # DEX files directory
│   ├── remote_module.dex  # Latest DEX
│   ├── v1.0/
│   └── v1.5/
├── .gitignore             # Don't commit secrets
└── DEPLOYMENT.md          # Detailed deployment guide
```

## Update DEX

After building a new DEX:

```powershell
.\tools\build-dex.ps1
# Then copy to your server:
Copy-Item release-artifacts\remote_module.dex sdk-admin\dex\
```

Upload to GitHub:
```bash
cd sdk-admin
git add dex/
git commit -m "Update DEX to latest version"
git push
```

## Cloudflare Configuration for Myanmar

For best performance in Myanmar:

1. Enable Cloudflare "Always Use HTTPS"
2. Set Cache TTL to 1 hour minimum
3. Enable "Browser Cache TTL" to 4 hours
4. Enable "Minification" for JS/CSS
5. Enable "Argo Smart Routing" (paid plan) for better Myanmar connectivity

## Monitoring

Check server health:
```
GET https://your-project.pages.dev/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-10T08:00:00.000Z",
  "dex_available": true,
  "config_available": true
}
```

## Troubleshooting

### DEX not loading in app?
1. Verify config URL is reachable from Myanmar: `curl https://your-project.pages.dev/ad-config.json`
2. Check DEX URL in config matches actual DEX location
3. Verify decrypt_key matches: `kyo_remote_module_key_v1`
4. Check app logs: `adb logcat | findstr DexLoader`

### Slow loading from Myanmar?
1. Enable Cloudflare "Always Use HTTPS"
2. Set Cache TTL to 1 hour minimum
3. Enable "Browser Cache TTL" to 4 hours
4. Consider adding Cloudflare Argo Smart Routing

## Using Static Hosting (No Node.js Server Needed)

If you just need to serve static files (config JSON + DEX), you don't need the Node.js server:

1. Push `sdk-admin/ad-config.json` and `sdk-admin/dex/` to GitHub
2. Enable GitHub Pages on the repo
3. Put Cloudflare proxy in front for CDN
4. Update encoded URLs in `RemoteConfig.kt`

This is the simplest option and works great with your existing GitHub setup.
