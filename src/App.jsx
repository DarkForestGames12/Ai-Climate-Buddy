import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, RotateCcw, Mic } from 'lucide-react'
import AIOrb from './components/AIOrb'
import Sidebar from './components/Sidebar'
import MicrophoneButton from './components/MicrophoneButton'
import ChatBubble from './components/ChatBubble'
import BackgroundParticles from './components/BackgroundParticles'
import { API_CONFIG, ELEVENLABS_CONFIG } from './config'
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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setStatus('listening')
        interimTranscriptRef.current = ''
        finalTranscriptRef.current = ''
      }

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          setCurrentTranscript(finalTranscriptRef.current + interimTranscript)
          
          // Clear existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
          
          // Set new silence timer (2 seconds)
          silenceTimerRef.current = setTimeout(() => {
            if (finalTranscriptRef.current.trim()) {
              handleUserSpeech(finalTranscriptRef.current.trim())
              finalTranscriptRef.current = ''
              setCurrentTranscript('')
            }
          }, 2000)
        } else {
          setCurrentTranscript(finalTranscriptRef.current + interimTranscript)
        }

        interimTranscriptRef.current = interimTranscript
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error !== 'no-speech') {
          setTimeout(() => {
            if (status !== 'speaking' && status !== 'thinking') {
              startListening()
            }
          }, 1000)
        }
      }

      recognitionRef.current.onend = () => {
        // Auto-restart if not speaking or thinking
        if (status !== 'speaking' && status !== 'thinking') {
          setTimeout(() => {
            startListening()
          }, 500)
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
        speakText(greetingMessage)
      }, 1000)
    }
  }, [isInitialized])

  const startListening = () => {
    if (recognitionRef.current && status !== 'speaking' && status !== 'thinking') {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
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
    setStatus('speaking')
    
    // Stop listening while AI is speaking to prevent echo
    stopListening()
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    // Clean text: remove emojis and special characters
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/[✅✨💬🤖🎨🌍]/g, '') // Remove common symbols
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim()
    
    try {
      // Use ElevenLabs for realistic voice
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_CONFIG.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_CONFIG.apiKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: ELEVENLABS_CONFIG.modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error('ElevenLabs API error')
      }

      // Convert response to audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setStatus('ready')
        // Resume listening after speaking
        setTimeout(() => {
          startListening()
        }, 1500)
      }

      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        URL.revokeObjectURL(audioUrl)
        setStatus('ready')
        setTimeout(() => {
          startListening()
        }, 1500)
      }

      audio.play()
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      // Fallback to browser TTS if ElevenLabs fails
      console.log('Falling back to browser TTS')
      
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1
      
      utterance.onend = () => {
        setStatus('ready')
        setTimeout(() => {
          startListening()
        }, 1500)
      }
      
      utterance.onerror = () => {
        setStatus('ready')
        setTimeout(() => {
          startListening()
        }, 1500)
      }
      
      window.speechSynthesis.speak(utterance)
    }
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
