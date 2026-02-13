// API Configuration
// Uses environment variables from .env file
// The .env file is NOT committed to git, keeping your API keys safe

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'YOUR_BASE_URL_HERE',
  apiKey: import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE',
  model: import.meta.env.VITE_API_MODEL || 'YOUR_MODEL_NAME_HERE',
  maxTokens: 150,
  temperature: 0.7,
}

// ElevenLabs TTS Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY_HERE',
  voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
  // Other good voices:
  // 'pNInz6obpgDQGcFmaJgB' - Adam - deep male voice
  // 'ErXwobaYiN019PkySvjV' - Antoni - well-rounded male voice
  // 'MF3mGyEYCl7XYWbV9V6O' - Elli - emotional female voice
  // 'TxGEqnHWrfWFTfGW9XjX' - Josh - young male voice
  modelId: 'eleven_turbo_v2_5', // Fast and high quality
}
