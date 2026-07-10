# Server Setup Guide — Myanmar Accessible

## Quick Start (Local Testing)

```bash
cd sdk-admin
npm install
npm start
```

Server runs on `http://localhost:3000`

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

Update the encoded URLs in `RemoteConfig.kt`:
```kotlin
// Line 21 — replace with your new config URL (Base64 encoded)
private val ENCODED_SERVER_URL = "YOUR_NEW_BASE64_ENCODED_URL"
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
├── server.js              # Express server
├── package.json           # Dependencies
├── ad-config.json         # SDK configuration
├── dex/                   # DEX files directory
│   ├── remote_module.dex  # Latest DEX
│   ├── v1.0/
│   └── v1.5/
├── .gitignore             # Don't commit secrets
└── DEPLOYMENT.md          # This file
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

Add these headers for optimal Myanmar performance:

```javascript
// In server.js, add to app.configure():
app.use((req, res, next) => {
    // Enable HTTP/2 push for DEX
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('ETag', crypto.createHash('md5').update(fs.readFileSync(req.url)).digest('hex'));
    next();
});
```

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
4. Check app logs: `adb logcat | grep -i dexloader`

### Slow loading from Myanmar?
1. Enable Cloudflare "Always Use HTTPS"
2. Set Cache TTL to 1 hour minimum
3. Enable "Browser Cache TTL" to 4 hours
4. Consider adding Cloudflare Argo Smart Routing
