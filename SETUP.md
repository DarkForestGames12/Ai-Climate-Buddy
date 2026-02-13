# Setup Instructions

## Quick Start

### 1. Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

### 2. Configure Your APIs

Open `src/config.js` and add your API credentials:

#### A. Claude API (for AI responses)
```javascript
export const API_CONFIG = {
  baseURL: 'YOUR_BASE_URL_HERE',  // Your API base URL
  apiKey: 'YOUR_API_KEY_HERE',     // Your API key
  model: 'YOUR_MODEL_NAME_HERE',   // Your model name (e.g., 'claude-sonnet-4-20250514')
  maxTokens: 150,
  temperature: 0.7,
}
```

#### B. ElevenLabs API (for realistic voice)
```javascript
export const ELEVENLABS_CONFIG = {
  apiKey: 'YOUR_ELEVENLABS_API_KEY_HERE',
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - friendly female voice
  modelId: 'eleven_turbo_v2_5',
}
```

**How to get ElevenLabs API key:**
1. Go to https://elevenlabs.io
2. Sign up for free account (10,000 characters/month free)
3. Go to Profile → API Keys
4. Copy your API key

**Available voices (change voiceId in config):**
- `EXAVITQu4vr4xnSDxMaL` - Sarah (friendly female) ⭐ Default
- `pNInz6obpgDQGcFmaJgB` - Adam (deep male)
- `ErXwobaYiN019PkySvjV` - Antoni (well-rounded male)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (emotional female)
- `TxGEqnHWrfWFTfGW9XjX` - Josh (young male)

### 3. Run the App

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Important Notes

### Browser Compatibility
- **Use Chrome or Edge** for best results (full Web Speech API support)
- Firefox and Safari have limited speech recognition support

### Voice Quality
The app uses **ElevenLabs** for ultra-realistic AI voice:
- ✅ Natural pronunciation and intonation
- ✅ Human-like speech patterns
- ✅ No robotic sound
- ✅ Automatic fallback to browser TTS if ElevenLabs fails

### Echo Prevention
The app includes:
- ✅ Minimum 5-character input filter (ignores short noise)
- ✅ Stops listening while AI is speaking
- ✅ 1.5-second delay before resuming listening after AI speaks
- ✅ Automatic 2-second pause detection

### Troubleshooting

**Problem: Still getting echo/repeated words**
- Lower your speaker volume
- Use headphones instead of speakers
- Increase the minimum character filter in `src/App.jsx` (line 167):
  ```javascript
  if (text.trim().length < 10) {  // Change from 5 to 10
  ```

**Problem: API not working**
- Check your `src/config.js` has correct credentials
- Open browser console (F12) to see error messages
- Verify your base URL ends with `/v1` (no `/chat/completions`)
- Make sure your API key is valid

**Problem: Voice not recognized**
- Allow microphone permissions in browser
- Check microphone is working in system settings
- Speak clearly and wait for "LISTENING" status

## Features

✅ Automatic voice conversation (hands-free)
✅ Real-time transcript display below orb
✅ 2-second pause detection
✅ Echo prevention
✅ Claude API integration
✅ Conversation history
✅ Futuristic UI with animations

Enjoy your Climate Buddy! 🌍
