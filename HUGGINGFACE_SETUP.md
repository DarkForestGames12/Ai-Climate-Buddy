# 🤗 Hugging Face Whisper Setup Guide

## ✅ Free Speech Recognition with Hugging Face!

This guide shows you how to use Hugging Face's **free Whisper API** for speech recognition - no backend server needed!

---

## 🎯 What You Get:

- ✅ **100% Free** - No credit card required
- ✅ **No Backend Needed** - Works directly from browser
- ✅ **High Accuracy** - OpenAI Whisper model
- ✅ **Works on All Devices** - Desktop, mobile, tablet
- ✅ **No Network Errors** - Reliable API
- ✅ **Easy Setup** - Just add API key (optional)

---

## 🚀 Quick Start (No API Key)

The app works **without an API key** using Hugging Face's free tier!

**Limits without API key:**
- ~1000 requests per day
- Shared rate limit
- May have occasional delays

**For most users, this is enough!** Just deploy and use.

---

## 🔑 Optional: Get API Key (Better Limits)

If you want higher rate limits and faster responses:

### Step 1: Create Hugging Face Account

1. Go to https://huggingface.co/join
2. Sign up (free!)
3. Verify your email

### Step 2: Generate API Token

1. Go to https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name: `Climate Buddy`
4. Type: **Read**
5. Click **"Generate"**
6. **Copy the token** (starts with `hf_...`)

### Step 3: Add to Your Project

**Local Development:**
```bash
# In your .env file
VITE_HF_API_KEY=hf_your_token_here
```

**Netlify Deployment:**
1. Go to Netlify Dashboard
2. Your site → **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Key: `VITE_HF_API_KEY`
5. Value: `hf_your_token_here`
6. Click **"Save"**
7. **Redeploy** your site

---

## 📊 With vs Without API Key

| Feature | Without API Key | With API Key |
|---------|----------------|--------------|
| **Cost** | Free | Free |
| **Requests/day** | ~1000 | Much higher |
| **Speed** | May queue | Faster |
| **Reliability** | Good | Better |
| **Setup** | None | 2 minutes |

---

## 🎨 How It Works

```
User speaks → Browser records audio → Hugging Face Whisper API → Text → AI Response
```

**No backend server needed!** Everything runs in the browser except the Whisper transcription.

---

## 🔧 Technical Details

**API Endpoint:**
```
https://api-inference.huggingface.co/models/openai/whisper-tiny.en
```

**Model:** Whisper Tiny (English)
- Fast transcription
- Good accuracy
- Optimized for English

**Audio Format:** WebM/Opus (browser native)

---

## 🐛 Troubleshooting

### "Model is loading" error
- **Cause:** Model needs to warm up (first request)
- **Solution:** Wait 20 seconds and try again
- **Prevention:** Use API key for faster cold starts

### Rate limit exceeded
- **Cause:** Too many requests without API key
- **Solution:** Add API key or wait a few hours
- **Prevention:** Get free API key

### No transcription returned
- **Cause:** Audio too short or unclear
- **Solution:** Speak clearly for at least 1 second
- **Check:** Browser console for errors

### CORS errors
- **Cause:** Browser blocking request
- **Solution:** This shouldn't happen with HF API
- **Check:** Make sure you're on HTTPS (Netlify provides this)

---

## 💡 Tips for Best Results

1. **Speak Clearly** - Enunciate words
2. **Reduce Background Noise** - Quiet environment
3. **Wait for Silence** - App auto-detects when you stop speaking
4. **Use Good Microphone** - Built-in mic works, headset is better
5. **Check Permissions** - Allow microphone access

---

## 🆚 Comparison with Other Solutions

### Hugging Face Whisper (Current)
- ✅ Free forever
- ✅ No backend needed
- ✅ High accuracy
- ✅ Works on all devices
- ⚠️ Requires internet
- ⚠️ Rate limits (without API key)

### Chrome Web Speech API (Previous)
- ✅ Free
- ✅ No setup
- ✅ Fast
- ❌ Network errors
- ❌ Chrome only
- ❌ Unreliable

### Self-Hosted Whisper (Attempted)
- ✅ Full control
- ✅ No rate limits
- ❌ Needs backend server
- ❌ Costs money (>512MB RAM)
- ❌ Complex setup

**Winner: Hugging Face Whisper!** 🏆

---

## 📈 Rate Limits

### Without API Key:
- **Requests:** ~1000/day
- **Concurrent:** Limited
- **Speed:** May queue during peak times

### With Free API Key:
- **Requests:** Much higher (thousands/day)
- **Concurrent:** Better
- **Speed:** Faster, less queuing

### Paid Plans (Optional):
- **Pro:** $9/month - Higher limits
- **Enterprise:** Custom pricing

**For most users, free tier is plenty!**

---

## ✅ Deployment Checklist

- [ ] Code updated with Hugging Face integration
- [ ] (Optional) API key generated
- [ ] (Optional) API key added to .env
- [ ] (Optional) API key added to Netlify
- [ ] Pushed to GitHub
- [ ] Deployed to Netlify
- [ ] Tested microphone permissions
- [ ] Tested speech recognition
- [ ] Verified transcription accuracy

---

## 🎉 You're All Set!

Your app now uses Hugging Face's free Whisper API for reliable speech recognition!

**No backend server needed. No network errors. Works on all devices.** 🌍✨

---

## 🆘 Need Help?

- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **Whisper Model:** https://huggingface.co/openai/whisper-tiny.en
- **API Status:** https://status.huggingface.co/

Happy coding! 🚀
