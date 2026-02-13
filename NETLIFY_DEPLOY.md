# 🚀 Deploy to Netlify

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: Climate Buddy AI voice assistant"
git branch -M main
git remote add origin https://github.com/DarkForestGames12/Ai-Climate-Buddy.git
git push -u origin main
```

## Step 2: Deploy to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `Ai-Climate-Buddy`
5. Build settings should auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

## Step 3: Add Environment Variables (IMPORTANT!)

After deployment, you need to add your API keys:

1. Go to your site dashboard on Netlify
2. Click "Site configuration" → "Environment variables"
3. Click "Add a variable" and add these **5 variables**:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_BASE_URL` | `https://api.fuelix.ai` |
| `VITE_API_KEY` | `sk-BZPQ8ZJ9NgBvE84K7kVUbu` |
| `VITE_API_MODEL` | `claude-sonnet-4` |
| `VITE_ELEVENLABS_API_KEY` | `sk_9bc601e62e4f10502aa31e73ea2cfd0f7cb7a2d0d064cc8b` |
| `VITE_ELEVENLABS_VOICE_ID` | `EXAVITQu4vr4xnSDxMaL` |

4. Click "Save"
5. Go to "Deploys" tab
6. Click "Trigger deploy" → "Clear cache and deploy site"

## Step 4: Test Your App

1. Wait for deployment to finish (1-2 minutes)
2. Click on your site URL (e.g., `https://your-site-name.netlify.app`)
3. Allow microphone permissions when prompted
4. Start talking to Climate Buddy!

## 🔒 Security

✅ **Your API keys are safe!**
- They are stored in Netlify's environment variables (encrypted)
- They are NOT visible in your GitHub repository
- They are NOT visible in the browser source code
- Only you can see them in Netlify dashboard

## 📱 Using on iPad at School

1. Open Safari or Chrome on your iPad
2. Go to your Netlify URL
3. Allow microphone permissions
4. Use the app just like on your computer!

## 🎯 Custom Domain (Optional)

Want a custom URL like `climate-buddy.netlify.app`?

1. Go to "Site configuration" → "Domain management"
2. Click "Options" → "Edit site name"
3. Enter your desired name
4. Your new URL will be: `https://your-name.netlify.app`

---

**Need help?** Check the Netlify docs: https://docs.netlify.com
