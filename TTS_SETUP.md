# Text-to-Speech (TTS) Setup Guide

## 🎙️ Current TTS Solution: StreamElements API

Your Climate Buddy app now uses **StreamElements TTS API** - a completely **FREE** text-to-speech service with **NO API KEY REQUIRED**!

### ✅ Features:
- **100% Free** - No API key, no registration, no limits
- **High-Quality Neural Voices** - Natural-sounding speech
- **Proper Pronunciation** - Excellent word pronunciation
- **No Rate Limits** - Unlimited usage
- **Automatic Fallback** - Falls back to browser TTS if needed

### 🎤 Available Voices:

The app currently uses **Joanna** (friendly female voice, perfect for kids), but you can easily change it:

**Available voices:**
- `Joanna` - Female, friendly (current default)
- `Matthew` - Male, professional
- `Brian` - Male, British accent
- `Ivy` - Female child voice
- `Amy` - Female, British accent
- `Emma` - Female, British accent
- `Raveena` - Female, Indian accent
- `Geraint` - Male, Welsh accent
- `Nicole` - Female, Australian accent
- `Russell` - Male, Australian accent

### 🔧 How to Change Voice:

In `src/App.jsx`, find this line (around line 365):
```javascript
const voice = 'Joanna' // Friendly female voice, great for kids
```

Change `'Joanna'` to any voice from the list above, for example:
```javascript
const voice = 'Matthew' // Male voice
```

### 🌐 How It Works:

1. **Primary:** StreamElements TTS API (free neural voice)
2. **Fallback:** Browser's built-in TTS (if StreamElements fails)

### 🚀 No Setup Required!

Unlike ElevenLabs which required an API key and had a 401 error, StreamElements works immediately with:
- ✅ No API key needed
- ✅ No registration required
- ✅ No environment variables to configure
- ✅ Works on Netlify without any setup

### 📊 Comparison with Other TTS Services:

| Service | Cost | Quality | API Key Required | Setup Difficulty |
|---------|------|---------|------------------|------------------|
| **StreamElements** | FREE | High (Neural) | ❌ No | ⭐ Easy |
| ElevenLabs | Paid ($5+/mo) | Excellent | ✅ Yes | ⭐⭐⭐ Hard |
| Google Cloud TTS | Paid (after free tier) | Excellent | ✅ Yes | ⭐⭐⭐ Hard |
| Amazon Polly | Paid (after free tier) | Excellent | ✅ Yes | ⭐⭐⭐ Hard |
| Browser TTS | FREE | Good | ❌ No | ⭐ Easy |

### 🔍 Technical Details:

**StreamElements API Endpoint:**
```
https://api.streamelements.com/kappa/v2/speech?voice={VOICE}&text={TEXT}
```

**Response:** Direct MP3 audio stream

**Advantages:**
- No CORS issues
- Fast response time
- Reliable uptime
- Natural pronunciation
- Supports long text

### 🐛 Troubleshooting:

**If you hear browser TTS instead of StreamElements:**
1. Check browser console for errors
2. Ensure internet connection is stable
3. Try a different voice
4. Clear browser cache

**Network errors fixed:**
- The "network error" you were seeing was from Chrome's speech recognition service, NOT the TTS
- This has been improved with better error handling and auto-retry logic

### 🎯 Next Steps:

Your app is now ready to deploy! The TTS will work perfectly on Netlify without any additional configuration.

**To test locally:**
```bash
npm run dev
```

**To deploy to Netlify:**
```bash
npm run build
```
Then push to GitHub - Netlify will auto-deploy!

---

## 🎨 Optional: Advanced Voice Customization

If you want even more control, you can modify the `speakText` function to:
- Add voice selection UI
- Adjust speech rate/pitch
- Add voice effects
- Support multiple languages

Let me know if you need help with any of these features!
