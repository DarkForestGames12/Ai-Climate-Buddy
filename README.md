# Climate Buddy - Voice AI Assistant

A modern, futuristic conversational voice web app for climate action education (SDG 13).

## Features

✨ **Voice Interaction**
- Automatic speech recognition (Web Speech API)
- Text-to-speech AI responses
- 2-second pause detection for natural conversation flow
- Hands-free operation - minimal user interaction required

🎨 **Modern UI/UX**
- Dark theme with neon green/teal climate colors
- Glassmorphism design elements
- Animated AI orb with multiple states (listening, thinking, speaking)
- Real-time transcript display below the orb
- Smooth Framer Motion animations
- Floating background particles and gradients
- Waveform visualizer during AI speech
- Responsive design (laptop + tablet)

💬 **Chat Features**
- Conversation history sidebar
- Chat bubbles with smooth animations
- Save and load previous conversations
- New conversation button

🤖 **AI Assistant**
- Climate Buddy - friendly guide for SDG 13
- Kid and family-friendly responses
- Encourages climate action
- Suggests 1-2 simple actions after each response

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Web Speech API** - Voice recognition & synthesis

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Usage

1. **Initial Greeting**: The AI automatically greets you when the app loads
2. **Voice Conversation**: Just start talking - the app listens automatically
3. **Pause Detection**: Stop speaking for 2 seconds, and the AI will respond
4. **Continuous Flow**: After the AI speaks, it automatically starts listening again
5. **History**: Click the menu icon (☰) to view conversation history
6. **New Chat**: Click the refresh icon (↻) to start a new conversation

## Browser Compatibility

- Chrome/Edge (recommended) - Full support for Web Speech API
- Firefox - Limited speech synthesis support
- Safari - Partial support

**Note**: For the best experience, use Chrome or Edge browsers.

## Customization

### Integrating Real AI API

The app currently uses placeholder responses. To integrate a real AI API:

1. Open `src/App.jsx`
2. Find the `generateAIResponse` function
3. Replace it with your API call:

```javascript
const generateAIResponse = async (userText) => {
  // Example with OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_API_KEY`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText }
      ]
    })
  })
  
  const data = await response.json()
  return data.choices[0].message.content
}
```

### Changing Colors

Edit the color values in CSS files:
- Primary: `rgba(52, 211, 153, ...)` - Emerald green
- Secondary: `rgba(16, 185, 129, ...)` - Teal

## Project Structure

```
aiclimateaction/
├── src/
│   ├── components/
│   │   ├── AIOrb.jsx              # Animated AI orb
│   │   ├── AIOrb.css
│   │   ├── Sidebar.jsx            # History sidebar
│   │   ├── Sidebar.css
│   │   ├── MicrophoneButton.jsx   # Mic button with states
│   │   ├── MicrophoneButton.css
│   │   ├── ChatBubble.jsx         # Message bubbles
│   │   ├── ChatBubble.css
│   │   ├── BackgroundParticles.jsx # Animated background
│   │   └── BackgroundParticles.css
│   ├── App.jsx                    # Main app component
│   ├── App.css
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## License

MIT License - Feel free to use this project for educational purposes.

## Credits

Built with ❤️ for climate action education and SDG 13 awareness.
