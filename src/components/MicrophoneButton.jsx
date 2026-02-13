import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'
import './MicrophoneButton.css'

function MicrophoneButton({ status }) {
  return (
    <motion.div
      className={`mic-button ${status}`}
      animate={{
        scale: status === 'listening' ? [1, 1.1, 1] : 1,
        boxShadow: 
          status === 'listening'
            ? [
                '0 0 20px rgba(52, 211, 153, 0.4), 0 0 40px rgba(52, 211, 153, 0.2)',
                '0 0 40px rgba(52, 211, 153, 0.6), 0 0 80px rgba(52, 211, 153, 0.3)',
                '0 0 20px rgba(52, 211, 153, 0.4), 0 0 40px rgba(52, 211, 153, 0.2)'
              ]
            : status === 'speaking'
            ? '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)'
            : status === 'thinking'
            ? '0 0 25px rgba(52, 211, 153, 0.4), 0 0 50px rgba(52, 211, 153, 0.2)'
            : '0 0 15px rgba(52, 211, 153, 0.3), 0 0 30px rgba(52, 211, 153, 0.15)'
      }}
      transition={{
        duration: status === 'listening' ? 1.5 : 0.3,
        repeat: status === 'listening' ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="mic-icon-wrapper"
        animate={{
          rotate: status === 'thinking' ? [0, 5, -5, 0] : 0
        }}
        transition={{
          duration: 0.5,
          repeat: status === 'thinking' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <Mic size={28} />
      </motion.div>
      
      {/* Pulse rings */}
      {status === 'listening' && (
        <>
          <motion.div
            className="pulse-ring pulse-ring-1"
            animate={{
              scale: [1, 1.5],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="pulse-ring pulse-ring-2"
            animate={{
              scale: [1, 1.5],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.75
            }}
          />
        </>
      )}
    </motion.div>
  )
}

export default MicrophoneButton
