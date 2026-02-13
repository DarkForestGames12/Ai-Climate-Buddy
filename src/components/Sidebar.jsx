import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar } from 'lucide-react'
import './Sidebar.css'

function Sidebar({ isOpen, onClose, conversations, onNewConversation, onLoadConversation, currentConversationId }) {
  const formatDate = (date) => {
    const d = new Date(date)
    const month = d.toLocaleString('default', { month: 'short' })
    const day = d.getDate()
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${month} ${day}, ${time}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            className="sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sidebar-header">
              <h2>History</h2>
              <button className="close-button" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* New Conversation Button */}
            <button className="new-conversation-btn" onClick={onNewConversation}>
              <Plus size={20} />
              <span>New Conversation</span>
            </button>

            {/* Conversations List */}
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={40} />
                  <p>No conversations yet</p>
                  <span>Start chatting to see your history</span>
                </div>
              ) : (
                conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                    onClick={() => onLoadConversation(conv)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-date">
                      <Calendar size={12} />
                      {formatDate(conv.timestamp)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
