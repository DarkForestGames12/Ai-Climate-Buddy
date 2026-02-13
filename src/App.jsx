import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, RotateCcw, Mic } from 'lucide-react'
import AIOrb from './components/AIOrb'
import Sidebar from './components/Sidebar'
import MicrophoneButton from './components/MicrophoneButton'
import ChatBubble from './components/ChatBubble'
import BackgroundParticles from './components/BackgroundParticles'
import { API_CONFIG } from './config'
import './App.css'

const SYSTEM_PROMPT = `You are Climate Buddy, an AI guide for SDG 13 Climate Action.
Speak simply for kids and families.
Always encourage action.
Connect answers back to protecting the planet.
Keep responses short and encouraging (2-3 sentences max).
After each response, suggest 1-2 simple climate actions.
IMPORTANT: Do not use emojis, symbols, or special characters in your responses. Use plain text only since your responses will be spoken aloud.`;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [status, setStatus] = useState('ready') // ready, listening, thinking, speaking
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  
  const recognitionRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const interimTranscriptRef = useRef('')
  const finalTranscriptRef = useRef('')
  const isRecognitionRunningRef = useRef(false) // FIXED: Track if recognition is running
  const networkErrorCountRef = useRef(0) // Track consecutive network errors
  const maxNetworkErrors = 3 // Stop after 3 consecutive network errors

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      // IMPROVED: Better noise handling for loud environments
      recognitionRef.current.maxAlternatives = 3

      recognitionRef.current.onstart = () => {
        console.log('🎤 Microphone is now listening...')
        isRecognitionRunningRef.current = true // FIXED: Mark as running
        setStatus('listening')
        interimTranscriptRef.current = ''
        finalTranscriptRef.current = ''
      }

      recognitionRef.current.onresult = (event) => {
        // Reset network error count on successful recognition
        networkErrorCountRef.current = 0
        
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const confidence = result[0].confidence
          const transcript = result[0].transcript
          
          console.log(`Confidence: ${confidence ? confidence.toFixed(2) : 'N/A'} - "${transcript}"`)
          
          if (result.isFinal) {
            // IMPROVED: Only accept speech with good confidence (>0.6 for noisy environments)
            if (!confidence || confidence > 0.6) {
              finalTranscript += transcript
            } else {
              console.log('⚠️ Low confidence, ignoring:', transcript)
            }
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          setCurrentTranscript(finalTranscriptRef.current + interimTranscript)
          
          console.log('✅ Captured speech:', finalTranscriptRef.current)
          
          // Clear existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
          
          // IMPROVED: Shorter timeout (1.5 seconds) for faster response in noisy environments
          silenceTimerRef.current = setTimeout(() => {
            if (finalTranscriptRef.current.trim()) {
              console.log('📤 Sending to AI:', finalTranscriptRef.current.trim())
              handleUserSpeech(finalTranscriptRef.current.trim())
              finalTranscriptRef.current = ''
              setCurrentTranscript('')
            }
          }, 1500)
        } else {
          setCurrentTranscript(finalTranscriptRef.current + interimTranscript)
        }

        interimTranscriptRef.current = interimTranscript
      }

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error)
        isRecognitionRunningRef.current = false // Mark as stopped on error
        
        // IMPROVED: Better error handling
        if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, will restart on next cycle...')
          // Don't restart immediately, let onend handle it
        } else if (event.error === 'audio-capture') {
          console.error('🎤 Microphone access error! Please check permissions.')
          alert('Microphone access denied! Please allow microphone access in your browser settings.')
        } else if (event.error === 'network') {
          networkErrorCountRef.current++
          console.error(`🌐 Network error (${networkErrorCountRef.current}/${maxNetworkErrors}) - Chrome speech service connectivity issue.`)
          
          if (networkErrorCountRef.current >= maxNetworkErrors) {
            console.error('❌ Too many network errors. Stopping automatic retries.')
            console.log('💡 TIP: Try refreshing the page or check your internet connection.')
            // Don't restart - too many errors
            return
          }
        } else if (event.error === 'not-allowed') {
          console.error('🎤 Microphone permission denied! Please allow microphone access.')
          alert('Please allow microphone access to use Climate Buddy!')
        } else if (event.error === 'aborted') {
          console.log('⚠️ Recognition aborted (this is normal when stopping)')
          // Don't restart on abort
        }
      }

      recognitionRef.current.onend = () => {
        console.log('🔄 Recognition ended')
        isRecognitionRunningRef.current = false // Mark as stopped
        
        // Check if we've hit max network errors
        if (networkErrorCountRef.current >= maxNetworkErrors) {
          console.log('⚠️ Not restarting due to too many network errors')
          setStatus('ready')
          return
        }
        
        // Only auto-restart if not speaking/thinking and not in error state
        if (status !== 'speaking' && status !== 'thinking') {
          setTimeout(() => {
            if (!isRecognitionRunningRef.current) {
              startListening()
            }
          }, 1000) // Increased delay to 1 second
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [])

  // Load voices
  useEffect(() => {
    // Load voices on mount
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }
    
    loadVoices()
    
    // Some browsers need this event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Initial greeting
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      const greetingMessage = "Hello! I'm Climate Buddy, your friendly guide to climate action and SDG 13. I'm here to help kids and families learn about protecting our planet. Ask me anything about climate change, or let's talk about simple actions you can take today to make a difference!"
      
      setTimeout(() => {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: greetingMessage,
          timestamp: new Date()
        }
        setMessages([aiMessage])
        
        // FIXED: Try to speak, but if blocked, just start listening
        speakText(greetingMessage).catch(() => {
          // If speech fails, just start listening
          console.log('Initial greeting speech blocked, starting listening mode')
          setStatus('ready')
          setTimeout(() => startListening(), 500)
        })
      }, 1000)
    }
  }, [isInitialized])

  const startListening = () => {
    // FIXED: Don't try to start if already running OR if AI is speaking/thinking
    if (isRecognitionRunningRef.current) {
      console.log('⚠️ Recognition already running, skipping start')
      return
    }
    
    if (status === 'speaking' || status === 'thinking') {
      console.log('⚠️ AI is speaking/thinking, not starting microphone')
      return
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        console.log('🎤 Started listening...')
      } catch (error) {
        // FIXED: Handle "already started" error gracefully
        if (error.message && error.message.includes('already started')) {
          console.log('⚠️ Recognition already running (this is OK)')
          isRecognitionRunningRef.current = true // Update state
        } else {
          console.error('❌ Error starting recognition:', error)
          isRecognitionRunningRef.current = false // Reset state on error
        }
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        isRecognitionRunningRef.current = false // FIXED: Mark as stopped
        console.log('🛑 Stopped listening')
      } catch (error) {
        // Ignore errors when stopping
        console.log('⚠️ Error stopping recognition (this is OK):', error.message)
      }
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
  }

  const handleUserSpeech = async (text) => {
    // Ignore very short inputs (likely noise or echo)
    if (text.trim().length < 5) {
      console.log('Ignoring short input:', text)
      return
    }
    
    stopListening()
    setCurrentTranscript('')
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setStatus('thinking')

    // Call AI API
    try {
      const aiResponse = await generateAIResponse(text)
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      speakText(aiResponse)
    } catch (error) {
      console.error('Error getting AI response:', error)
      setStatus('ready')
      setTimeout(() => startListening(), 1000)
    }
  }

  const generateAIResponse = async (userText) => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            { 
              role: 'system', 
              content: SYSTEM_PROMPT 
            },
            { 
              role: 'user', 
              content: userText 
            }
          ],
          max_tokens: API_CONFIG.maxTokens,
          temperature: API_CONFIG.temperature
        })
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('API Error:', error)
      // Fallback response if API fails
      return "I'm having trouble connecting right now. Let's talk about protecting our planet! Try recycling, saving energy, and using less plastic."
    }
  }

  const speakText = async (text) => {
    // FIXED: Ensure we're not listening before speaking
    stopListening()
    
    // Wait a moment for microphone to fully stop
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setStatus('speaking')
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    // Clean text: remove emojis and special characters
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/[✅✨💬🤖🎨🌍]/g, '') // Remove common symbols
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim()
    
    try {
      // Try StreamElements TTS API (100% Free, No API Key Required!)
      console.log('🔊 Attempting StreamElements TTS (Free Neural Voice)...')
      
      // StreamElements voices: Brian (male), Ivy (female child), Joanna (female), Matthew (male)
      const voice = 'Joanna' // Friendly female voice, great for kids
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(cleanText)}`
      
      const audio = new Audio(ttsUrl)
      
      audio.onended = () => {
        console.log('✅ Finished speaking (StreamElements TTS)')
        setStatus('ready')
        setTimeout(() => {
          startListening()
        }, 1000) // Shorter delay before restarting listening
      }
      
      audio.onerror = (error) => {
        console.error('StreamElements TTS error, falling back to browser TTS:', error)
        // Fallback to browser TTS
        useBrowserTTS(cleanText)
      }
      
      await audio.play()
      console.log('✅ StreamElements TTS playing!')
      
    } catch (error) {
      console.error('TTS error:', error)
      console.log('⚠️ Falling back to browser TTS')
      useBrowserTTS(cleanText)
    }
  }
  
  const useBrowserTTS = (cleanText) => {
    // Fallback to browser's built-in TTS
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find the best voice (prefer Google voices, then Microsoft, then any English voice)
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Chrome'))
    ) || voices.find(voice => 
      voice.lang.startsWith('en') && 
      voice.name.includes('Microsoft')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
      console.log('🎙️ Using voice:', preferredVoice.name)
    }
    
    // Optimize settings for natural speech
    utterance.rate = 0.95  // Slightly slower for clarity
    utterance.pitch = 1.1  // Slightly higher pitch for friendliness
    utterance.volume = 1
    
    utterance.onend = () => {
      console.log('✅ Finished speaking (Browser TTS)')
      setStatus('ready')
      setTimeout(() => {
        startListening()
      }, 2000)
    }
    
    utterance.onerror = () => {
      setStatus('ready')
      setTimeout(() => {
        startListening()
      }, 2000)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  const handleManualRestart = () => {
    // Reset network error counter
    networkErrorCountRef.current = 0
    console.log('🔄 Manual restart - resetting error counter')
    
    // Stop and restart listening
    stopListening()
    setTimeout(() => {
      startListening()
    }, 500)
  }

  const handleNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Conversation',
      timestamp: new Date(),
      messages: messages
    }
    
    if (messages.length > 0) {
      setConversations(prev => [newConv, ...prev])
    }
    
    setMessages([])
    setCurrentConversationId(null)
    window.speechSynthesis.cancel()
    stopListening()
    setStatus('ready')
    
    // Reset network error counter on new conversation
    networkErrorCountRef.current = 0
    
    // Restart with greeting
    setTimeout(() => {
      const greetingMessage = "Hello! I'm Climate Buddy. How can I help you learn about climate action today?"
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        text: greetingMessage,
        timestamp: new Date()
      }
      setMessages([aiMessage])
      speakText(greetingMessage)
    }, 500)
  }

  const loadConversation = (conversation) => {
    window.speechSynthesis.cancel()
    stopListening()
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setSidebarOpen(false)
    setStatus('ready')
    setTimeout(() => startListening(), 500)
  }

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'LISTENING'
      case 'thinking':
        return 'THINKING'
      case 'speaking':
        return 'SPEAKING'
      default:
        return 'READY'
    }
  }

  return (
    <div className="app">
      <BackgroundParticles />
      
      {/* Header */}
      <header className="header">
        <button 
          className="menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
        
        <div className="header-title">
          <h1>Climate Buddy</h1>
          <p>SDG 13 • AI Assistant</p>
        </div>
        
        <button 
          className="reset-button"
          onClick={handleNewConversation}
          title="New Conversation"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        onNewConversation={handleNewConversation}
        onLoadConversation={loadConversation}
        currentConversationId={currentConversationId}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Chat Messages */}
        <div className="chat-container">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>

        {/* AI Orb */}
        <div className="orb-container">
          <AIOrb status={status} />
          {currentTranscript && (
            <motion.div
              className="live-transcript"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {currentTranscript}
            </motion.div>
          )}
        </div>

        {/* Microphone Button */}
        <div className="mic-container">
          <MicrophoneButton status={status} />
          <motion.p 
            className="status-text"
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {getStatusText()}
          </motion.p>
        </div>
      </main>
    </div>
  )
}

export default App
