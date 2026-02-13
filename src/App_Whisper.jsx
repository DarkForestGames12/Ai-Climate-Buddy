import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, RotateCcw } from 'lucide-react'
import AIOrb from './components/AIOrb'
import Sidebar from './components/Sidebar'
import MicrophoneButton from './components/MicrophoneButton'
import ChatBubble from './components/ChatBubble'
import BackgroundParticles from './components/BackgroundParticles'
import { API_CONFIG } from './config'
import { WhisperSpeechRecognition } from './utils/speechRecognition'
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
  
  const whisperRecognitionRef = useRef(null)

  // Initialize Whisper speech recognition
  useEffect(() => {
    console.log('🤗 Initializing Hugging Face Whisper...')
    
    whisperRecognitionRef.current = new WhisperSpeechRecognition()
    
    whisperRecognitionRef.current.onResult = (text) => {
      console.log('✅ Whisper transcription:', text)
      handleUserSpeech(text)
    }
    
    whisperRecognitionRef.current.onError = (error) => {
      console.error('❌ Whisper error:', error)
      setStatus('ready')
      // Auto-retry after error
      setTimeout(() => {
        if (status !== 'speaking' && status !== 'thinking') {
          startListening()
        }
      }, 2000)
    }
    
    whisperRecognitionRef.current.onStart = () => {
      console.log('🎤 Whisper listening started')
      setStatus('listening')
    }
    
    whisperRecognitionRef.current.onEnd = () => {
      console.log('🔄 Whisper listening ended')
      // Auto-restart if not speaking/thinking
      if (status !== 'speaking' && status !== 'thinking') {
        setTimeout(() => startListening(), 1000)
      }
    }

    return () => {
      if (whisperRecognitionRef.current) {
        whisperRecognitionRef.current.stop()
      }
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
        
        speakText(greetingMessage).catch(() => {
          console.log('Initial greeting speech blocked, starting listening mode')
          setStatus('ready')
          setTimeout(() => startListening(), 500)
        })
      }, 1000)
    }
  }, [isInitialized])

  const startListening = () => {
    if (status === 'speaking' || status === 'thinking') {
      console.log('⚠️ AI is speaking/thinking, not starting microphone')
      return
    }
    
    if (whisperRecognitionRef.current) {
      whisperRecognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (whisperRecognitionRef.current) {
      whisperRecognitionRef.current.stop()
    }
  }

  const handleUserSpeech = async (text) => {
    if (text.trim().length < 3) {
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
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userText }
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
      return "I'm having trouble connecting right now. Let's talk about protecting our planet! Try recycling, saving energy, and using less plastic."
    }
  }

  const speakText = async (text) => {
    stopListening()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setStatus('speaking')
    window.speechSynthesis.cancel()
    
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[✅✨💬🤖🎨🌍]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    try {
      console.log('🔊 Attempting StreamElements TTS...')
      const voice = 'Joanna'
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(cleanText)}`
      
      const audio = new Audio(ttsUrl)
      
      audio.onended = () => {
        console.log('✅ Finished speaking')
        setStatus('ready')
        setTimeout(() => startListening(), 1000)
      }
      
      audio.onerror = (error) => {
        console.error('TTS error, falling back to browser TTS:', error)
        useBrowserTTS(cleanText)
      }
      
      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      useBrowserTTS(cleanText)
    }
  }
  
  const useBrowserTTS = (cleanText) => {
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = window.speechSynthesis.getVoices()
    
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Chrome'))
    ) || voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Microsoft')
    ) || voices.find(voice => voice.lang.startsWith('en'))
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.rate = 0.95
    utterance.pitch = 1.1
    utterance.volume = 1
    
    utterance.onend = () => {
      console.log('✅ Finished speaking (Browser TTS)')
      setStatus('ready')
      setTimeout(() => startListening(), 2000)
    }
    
    utterance.onerror = () => {
      setStatus('ready')
      setTimeout(() => startListening(), 2000)
    }
    
    window.speechSynthesis.speak(utterance)
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
        return 'LISTENING (Whisper AI)'
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
      
      <header className="header">
        <button 
          className="menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
        
        <div className="header-title">
          <h1>Climate Buddy</h1>
          <p>SDG 13 • AI Assistant • Powered by Whisper</p>
        </div>
        
        <button 
          className="reset-button"
          onClick={handleNewConversation}
          title="New Conversation"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        onNewConversation={handleNewConversation}
        onLoadConversation={loadConversation}
        currentConversationId={currentConversationId}
      />

      <main className="main-content">
        <div className="chat-container">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>

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
