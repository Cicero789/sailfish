# Smart Word Editor - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SMART WORD EDITOR                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                    ┌──────────────────────┐
│   User Interface     │                    │   External Services  │
│                      │                    │                      │
│  ┌─────────────┐    │                    │  ┌────────────────┐  │
│  │   Header    │    │                    │  │  OpenAI API    │  │
│  │  - Menu     │    │◄───────────────────┼──│  - Grammar     │  │
│  │  - Auth     │    │   AI Processing    │  │  - Flow        │  │
│  └─────────────┘    │                    │  └────────────────┘  │
│                      │                    │                      │
│  ┌─────────────┐    │                    │  ┌────────────────┐  │
│  │  Sidebar    │    │                    │  │  Firebase Auth │  │
│  │  - History  │    │◄───────────────────┼──│  - Google      │  │
│  │  - Sessions │    │   Authentication   │  │  - Apple       │  │
│  └─────────────┘    │                    │  └────────────────┘  │
│                      │                    │                      │
│  ┌─────────────────┐│                    │  ┌────────────────┐  │
│  │  Left Column    ││                    │  │  Web Speech    │  │
│  │  ┌────────────┐ ││◄───────────────────┼──│  API           │  │
│  │  │   Editor   │ ││   Voice Input      │  └────────────────┘  │
│  │  │  - Type    │ ││                    │                      │
│  │  │  - Voice   │ ││                    └──────────────────────┘
│  │  └────────────┘ ││
│  └─────────────────┘│
│                      │
│  ┌─────────────────┐│
│  │  Right Column   ││
│  │  ┌────────────┐ ││
│  │  │  Grammar   │ ││
│  │  │  Corrected │ ││
│  │  └────────────┘ ││
│  │  ┌────────────┐ ││
│  │  │   Flow     │ ││
│  │  │  Enhanced  │ ││
│  │  └────────────┘ ││
│  └─────────────────┘│
└──────────────────────┘

┌──────────────────────┐
│   Local Storage      │
│  - Sessions (Guest)  │
│  - Current Session   │
└──────────────────────┘
```

## Data Flow

### 1. User Input Flow
```
User Types/Speaks
       ↓
   EditorPanel
       ↓
   Content State
       ↓
   ┌────────┴────────┐
   ↓                 ↓
Grammar Process   Auto-Save
(debounced 1s)    (2s delay)
   ↓                 ↓
OpenAI API      Local Storage
   ↓
Grammar Output
```

### 2. Paragraph Completion Flow
```
User Completes Paragraph (., !, ?)
       ↓
   Paragraph Detection
       ↓
   Grammar Corrected Text
       ↓
   Flow Improvement Process
       ↓
   OpenAI API
       ↓
   Flow Enhanced Output
```

### 3. Session Management Flow
```
   Load App
       ↓
   Check localStorage
       ↓
   ┌───┴───┐
   ↓       ↓
Sessions  Create New
Found     Session
   ↓       ↓
Display   Set Current
History   Session ID
   ↓
User Selects/Types
   ↓
Auto-Save Every 2s
   ↓
Update localStorage
```

### 4. Authentication Flow
```
User Clicks "Sign In"
       ↓
   Auth Modal Opens
       ↓
Select Provider (Google/Apple)
       ↓
Firebase Auth Popup
       ↓
   ┌───┴───┐
   ↓       ↓
Success  Error
   ↓       ↓
Store   Display
User    Message
Info
   ↓
Link Sessions to User
```

## Component Hierarchy

```
App
├── AuthModal
│   └── AuthButtons
│       ├── Google Sign-In Button
│       ├── Apple Sign-In Button
│       └── Guest Continue Button
├── Header
│   ├── Menu Button
│   ├── Title
│   └── User Info/Sign In Button
├── SessionHistory (conditional)
│   ├── New Session Button
│   └── Session List
│       └── Session Item (multiple)
│           ├── Title
│           ├── Preview
│           ├── Date
│           └── Delete Button
├── Main Content
│   ├── Left Column
│   │   └── EditorPanel
│   │       ├── Header
│   │       │   ├── Title
│   │       │   └── Voice Button
│   │       ├── Textarea
│   │       └── Listening Indicator
│   └── Right Column
│       ├── Top Half (50%)
│       │   └── OutputPanel (Grammar)
│       │       ├── Header
│       │       └── Content Display
│       └── Bottom Half (50%)
│           └── OutputPanel (Flow)
│               ├── Header
│               └── Content Display
```

## State Management

### Application State
```typescript
{
  // User State
  user: User | null,
  showAuth: boolean,
  
  // Session State
  sessions: Session[],
  currentSessionId: string | null,
  showHistory: boolean,
  
  // Editor State
  content: string,
  grammarCorrected: string,
  flowImproved: string,
  
  // Processing State
  isProcessingGrammar: boolean,
  isProcessingFlow: boolean
}
```

### Custom Hooks State
```typescript
// useAuth
{
  user: User | null,
  loading: boolean,
  signInWithGoogle: () => Promise<void>,
  signInWithApple: () => Promise<void>,
  signOut: () => Promise<void>
}

// useVoiceRecognition
{
  isListening: boolean,
  isSupported: boolean,
  startListening: () => void,
  stopListening: () => void
}
```

## Design System

### Color Palette
```
Primary Colors:
- Background:    #FAFAFA (editor-bg)
- Text:          #1F2937 (editor-text)
- Border:        #E5E7EB (editor-border)
- Sidebar:       #F3F4F6 (sidebar-bg)

Accent Colors:
- Primary:       #3B82F6 (accent)
- Light:         #DBEAFE (accent-light)

State Colors:
- Success:       #10B981 (green)
- Error:         #EF4444 (red)
- Warning:       #F59E0B (yellow)

Grays:
- 50:  #F9FAFB
- 100: #F3F4F6
- 200: #E5E7EB
- 300: #D1D5DB
- 400: #9CA3AF
- 500: #6B7280
```

### Typography
```
Font Family: System UI Stack
- -apple-system
- BlinkMacSystemFont
- Segoe UI
- Roboto

Font Sizes:
- xs:   0.75rem  (12px)
- sm:   0.875rem (14px)
- base: 1rem     (16px)
- lg:   1.125rem (18px)
- xl:   1.25rem  (20px)
- 2xl:  1.5rem   (24px)

Line Heights:
- tight:   1.25
- normal:  1.5
- relaxed: 1.75
```

### Spacing
```
Scale: 0.25rem increments
- 1:  0.25rem  (4px)
- 2:  0.5rem   (8px)
- 3:  0.75rem  (12px)
- 4:  1rem     (16px)
- 6:  1.5rem   (24px)
- 8:  2rem     (32px)
```

### Layout Dimensions
```
Sidebar Width:    256px (64 * 4px)
Column Split:     50% / 50%
Right Panel Split: 50% / 50%
Header Height:    Auto (padding-based)
Border Width:     1px
Border Radius:    0.5rem (8px)
```

## Performance Optimizations

### Debouncing & Throttling
```
Grammar Correction:  1000ms debounce
Auto-Save:          2000ms debounce
History Auto-Hide:  2000ms delay
API Calls:          Rate-limited by debounce
```

### Lazy Loading
```
Sessions:     Load on mount only
History:      Show on toggle only
AI Outputs:   Process on demand
Components:   Conditional rendering
```

### Memoization Opportunities
```
- Session list rendering
- Output panel content
- User info display
- Auth button state
```

## Security Considerations

### Current Implementation
```
✓ Environment variables for keys
✓ Firebase Auth for user management
✓ Input sanitization
✓ HTTPS only (in production)

⚠ Client-side API calls (OpenAI)
⚠ No rate limiting
⚠ No request validation
```

### Production Recommendations
```
1. Backend API Proxy
   - Move OpenAI calls server-side
   - Store API keys securely
   - Add authentication middleware

2. Rate Limiting
   - Per-user request limits
   - Cooldown periods
   - Cost monitoring

3. Input Validation
   - Content length limits
   - Sanitization on server
   - XSS protection

4. Data Privacy
   - Encrypt stored sessions
   - GDPR compliance
   - Data retention policies
```

## API Integration Details

### OpenAI Integration
```typescript
Model: gpt-3.5-turbo
Temperature: 
  - Grammar: 0.3 (deterministic)
  - Flow: 0.7 (creative)
Max Tokens: 2000
Timeout: Default (OpenAI SDK)
```

### Firebase Integration
```typescript
Auth Providers:
  - Google OAuth 2.0
  - Apple Sign In
  - (TikTok - requires custom impl)

Firestore Collections:
  - users/{uid}
  - sessions/{sessionId}
```

### Web Speech API
```typescript
Language: en-US
Continuous: true
Interim Results: true
Max Alternatives: 1
```

## Testing Strategy

### Unit Tests
```
- Component rendering
- Hook behavior
- Service functions
- Utility functions
```

### Integration Tests
```
- Auth flow
- Session management
- Voice input
- AI processing
```

### E2E Tests
```
- Complete writing workflow
- Session persistence
- Multi-device sync
- Error handling
```

## Deployment Options

### Static Hosting
```
- Vercel
- Netlify
- Firebase Hosting
- GitHub Pages
```

### Full-Stack Deployment
```
- Vercel (with API routes)
- AWS Amplify
- Google Cloud Run
- Heroku
```

### Environment Setup
```
Development:
  - Local Vite dev server
  - Hot module replacement
  - Source maps enabled

Production:
  - Minified bundles
  - Tree shaking
  - Asset optimization
  - CDN delivery
```
