import { motion } from 'framer-motion'
import './AIOrb.css'

function AIOrb({ status }) {
  return (
    <div className="ai-orb-wrapper">
      {/* Outer glow rings */}
      <motion.div
        className="orb-ring orb-ring-1"
        animate={{
          scale: status === 'listening' ? [1, 1.2, 1] : status === 'speaking' ? [1, 1.15, 1] : 1,
          opacity: status === 'ready' ? 0.3 : 0.6,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="orb-ring orb-ring-2"
        animate={{
          scale: status === 'listening' ? [1, 1.3, 1] : status === 'speaking' ? [1, 1.25, 1] : 1,
          opacity: status === 'ready' ? 0.2 : 0.4,
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      
      {/* Main orb */}
      <motion.div
        className="ai-orb"
        animate={{
          scale: status === 'thinking' ? [1, 1.05, 1] : 1,
          boxShadow: 
            status === 'listening' 
              ? '0 0 60px rgba(52, 211, 153, 0.6), 0 0 120px rgba(52, 211, 153, 0.4), inset 0 0 60px rgba(52, 211, 153, 0.3)'
              : status === 'speaking'
              ? '0 0 80px rgba(16, 185, 129, 0.8), 0 0 140px rgba(16, 185, 129, 0.5), inset 0 0 60px rgba(16, 185, 129, 0.4)'
              : status === 'thinking'
              ? '0 0 50px rgba(52, 211, 153, 0.5), 0 0 100px rgba(52, 211, 153, 0.3), inset 0 0 50px rgba(52, 211, 153, 0.2)'
              : '0 0 40px rgba(52, 211, 153, 0.4), 0 0 80px rgba(52, 211, 153, 0.2), inset 0 0 40px rgba(52, 211, 153, 0.2)'
        }}
        transition={{
          duration: status === 'thinking' ? 1 : 0.5,
          repeat: status === 'thinking' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Waveform bars for speaking state */}
        {status === 'speaking' && (
          <div className="waveform">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="waveform-bar"
                animate={{
                  scaleY: [0.3, 1, 0.5, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )}
        
        {/* Thinking dots */}
        {status === 'thinking' && (
          <div className="thinking-dots">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="thinking-dot"
                animate={{
                  y: [-8, 8, -8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )}
        
        {/* Listening pulse */}
        {status === 'listening' && (
          <motion.div
            className="listening-pulse"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
      
      {/* Floating particles around orb */}
      <div className="orb-particles">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="orb-particle"
            style={{
              left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
              top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.25
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AIOrb
