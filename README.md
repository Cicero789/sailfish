# Smart Word Editor

An intelligent online word editor with real-time AI-powered grammar correction and flow improvement.

## Features

### 📝 **Two-Column Layout**
- **Left Column**: Your writing space with keyboard and voice input
- **Right Column Top**: Real-time grammar correction (synced as you type)
- **Right Column Bottom**: Flow, rhythm, and syllable balance improvements (paragraph-by-paragraph)

### 🎤 **Voice Typing**
- Hands-free dictation using Web Speech API
- Real-time transcription alongside manual typing
- Toggle on/off with a single button

### 🤖 **AI-Powered Features**
- **Grammar Correction**: Real-time grammar, spelling, and punctuation fixes
- **Flow Enhancement**: Improves readability, rhythm, and sentence balance after completing each paragraph
- Powered by OpenAI GPT models

### 🔐 **Authentication**
- Sign in with Google
- Sign in with Apple
- Continue as guest (session-based storage)
- Session history for logged-in users

### 💾 **Session Management**
- Auto-save as you write
- Session history sidebar (auto-hides when typing)
- Create, view, and delete sessions
- Works offline for guest users

### 🎨 **Clean, Distraction-Free Design**
- Minimal color palette with soft grays and subtle accents
- Focus on content, not chrome
- Responsive layout
- Smooth transitions and animations

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Firebase project (for authentication)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Enable Google Sign-In
   - Enable Apple Sign-In (requires Apple Developer account)
4. Copy your Firebase config to the `.env` file

### 4. OpenAI Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file

### 5. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 6. Build for Production
```bash
npm run build
npm run preview
```

## Usage Guide

### Getting Started
1. **Open the app** - No sign-in required to start writing
2. **Start typing** in the left column or click the "Voice" button for voice input
3. **See grammar corrections** appear in real-time in the top-right panel
4. **Complete a paragraph** (end with `.`, `!`, or `?`) to see flow improvements in the bottom-right panel

### Session Management
- **View History**: Click the hamburger menu (☰) in the top-left
- **New Session**: Click "+ New Session" in the history sidebar
- **Switch Sessions**: Click any session in the history
- **Delete Session**: Hover over a session and click the × button

### Authentication
- Click "Sign In" in the top-right corner
- Choose Google or Apple sign-in
- Or continue without signing in (sessions saved locally)

### Voice Input
- Click the "Voice" button in the editor
- Speak naturally
- Click "Stop" when done
- Voice input works alongside manual typing

## Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (GPT-3.5-turbo)
- **Authentication**: Firebase Auth
- **Storage**: localStorage (guest) + Firestore (authenticated users)

### Key Components
- `App.tsx` - Main application logic and state management
- `EditorPanel.tsx` - Left column editor with voice input
- `OutputPanel.tsx` - Right column AI output displays
- `SessionHistory.tsx` - Session management sidebar
- `AuthButtons.tsx` - Authentication UI

### Services
- `openai.ts` - Grammar correction and flow improvement
- `firebase.ts` - Authentication configuration
- `storage.ts` - Session storage management

### Hooks
- `useAuth.ts` - Authentication state and methods
- `useVoiceRecognition.ts` - Voice input handling

## Performance Considerations

- **Debounced Grammar Correction**: 1-second delay to avoid excessive API calls
- **Paragraph-Based Flow Improvement**: Only processes complete paragraphs
- **Auto-Save**: Saves sessions every 2 seconds when idle
- **Lazy Loading**: Session history only loads when needed

## Browser Compatibility

- **Voice Input**: Chrome, Edge, Safari (WebKit-based browsers)
- **AI Features**: All modern browsers
- **Authentication**: All modern browsers

## Security Notes

⚠️ **Important**: The current implementation uses `dangerouslyAllowBrowser: true` for OpenAI API calls. In production, you should:

1. Create a backend API proxy
2. Store API keys server-side
3. Implement rate limiting
4. Add request validation

## Troubleshooting

### Voice Input Not Working
- Ensure you're using Chrome, Edge, or Safari
- Grant microphone permissions when prompted
- Check that your microphone is working

### AI Features Not Working
- Verify your OpenAI API key is correct
- Check your OpenAI account has credits
- Check browser console for errors

### Authentication Issues
- Verify Firebase configuration is correct
- Ensure authentication methods are enabled in Firebase Console
- Check browser console for errors

## Future Enhancements

- [ ] Backend API for secure OpenAI calls
- [ ] TikTok authentication integration
- [ ] Export to various formats (PDF, DOCX, etc.)
- [ ] Collaborative editing
- [ ] Custom AI prompts
- [ ] Writing statistics and analytics
- [ ] Dark mode
- [ ] Multiple language support

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
