// Speech Recognition using MediaRecorder + Hugging Face Whisper API
// This replaces Chrome's Web Speech API with Hugging Face's free API

export class WhisperSpeechRecognition {
  constructor(apiUrl) {
    // Use Hugging Face Inference API (free!)
    this.apiUrl = 'https://api-inference.huggingface.co/models/openai/whisper-tiny.en'
    this.apiKey = import.meta.env.VITE_HF_API_KEY || '' // Optional: improves rate limits
    this.mediaRecorder = null
    this.audioChunks = []
    this.isRecording = false
    this.silenceTimer = null
    this.silenceDelay = 1500 // 1.5 seconds of silence before sending
    this.audioContext = null
    this.analyser = null
    this.silenceThreshold = 0.01 // Adjust based on testing
    
    // Callbacks
    this.onResult = null
    this.onError = null
    this.onStart = null
    this.onEnd = null
  }

  async start() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Set up audio context for silence detection
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      source.connect(this.analyser)

      // Set up MediaRecorder
      const mimeType = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(stream, { mimeType })
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          await this.sendAudioToBackend()
        }
        this.cleanup()
      }

      this.mediaRecorder.start()
      this.isRecording = true
      
      if (this.onStart) {
        this.onStart()
      }

      // Start monitoring for silence
      this.monitorSilence()

      console.log('🎤 Recording started with backend Whisper')
    } catch (error) {
      console.error('Error starting recording:', error)
      if (this.onError) {
        this.onError(error)
      }
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer)
      }
    }
  }

  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    
    return '' // Use default
  }

  monitorSilence() {
    if (!this.isRecording || !this.analyser) return

    const bufferLength = this.analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    
    const checkSilence = () => {
      if (!this.isRecording) return

      this.analyser.getByteTimeDomainData(dataArray)
      
      // Calculate average volume
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / bufferLength)

      // If volume is below threshold (silence)
      if (rms < this.silenceThreshold) {
        if (!this.silenceTimer && this.audioChunks.length > 0) {
          // Start silence timer
          this.silenceTimer = setTimeout(() => {
            console.log('🔇 Silence detected, processing audio...')
            this.stop()
          }, this.silenceDelay)
        }
      } else {
        // Sound detected, clear silence timer
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer)
          this.silenceTimer = null
        }
      }

      // Continue monitoring
      requestAnimationFrame(checkSilence)
    }

    checkSilence()
  }

  async sendAudioToBackend() {
    try {
      // Create blob from audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
      
      console.log('📤 Sending audio to Hugging Face Whisper API...')

      // Prepare headers
      const headers = {
        'Content-Type': 'audio/webm'
      }
      
      // Add API key if available (improves rate limits)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      // Send to Hugging Face Inference API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: headers,
        body: audioBlob
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const transcribedText = data.text || ''

      console.log('✅ Transcription received:', transcribedText)

      if (this.onResult && transcribedText) {
        this.onResult(transcribedText)
      }

    } catch (error) {
      console.error('Error sending audio to Hugging Face:', error)
      if (this.onError) {
        this.onError(error)
      }
    }
  }

  cleanup() {
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.audioChunks = []
    this.isRecording = false

    if (this.onEnd) {
      this.onEnd()
    }
  }
}
