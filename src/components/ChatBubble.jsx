import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import './ChatBubble.css'

function ChatBubble({ message }) {
  const isUser = message.type === 'user'

  return (
    <motion.div
      className={`chat-bubble-wrapper ${isUser ? 'user' : 'ai'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="chat-bubble">
        <div className="bubble-icon">
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        <div className="bubble-content">
          <div className="bubble-text">{message.text}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatBubble
