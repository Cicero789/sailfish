import { useState, useEffect, useRef } from 'react';
import { Session } from './types';
import { useAuth } from './hooks/useAuth';
import { AuthButtons } from './components/AuthButtons';
import { SessionHistory } from './components/SessionHistory';
import { EditorPanel } from './components/EditorPanel';
import { OutputPanel } from './components/OutputPanel';
import { correctGrammar, improveFlow, getCurrentProvider, getAvailableProviders } from './services/ai-providers';
import {
  getSessions,
  saveSession,
  deleteSession,
  generateSessionId,
  setCurrentSession
} from './services/storage';

function App() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [grammarCorrected, setGrammarCorrected] = useState('');
  const [flowImproved, setFlowImproved] = useState('');
  const [isProcessingGrammar, setIsProcessingGrammar] = useState(false);
  const [isProcessingFlow, setIsProcessingFlow] = useState(false);
  const [currentAIProvider, setCurrentAIProvider] = useState<string | null>(null);
  
  const grammarTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastCompleteParagraphRef = useRef('');

  // Check available AI providers on mount
  useEffect(() => {
    const provider = getCurrentProvider();
    setCurrentAIProvider(provider);
    if (provider) {
      console.log(`Using AI provider: ${provider}`);
      const providers = getAvailableProviders();
      console.log(`Available providers: ${providers.join(', ')}`);
    } else {
      console.warn('No AI providers configured');
    }
  }, []);

  // Load sessions
  useEffect(() => {
    setSessions(getSessions());
  }, [user]);

  // Create initial session
  useEffect(() => {
    if (!currentSessionId) {
      createNewSession();
    }
  }, []);

  // Auto-hide history when typing
  useEffect(() => {
    if (content && showHistory) {
      const timer = setTimeout(() => {
        setShowHistory(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, showHistory]);

  // Real-time grammar correction with debouncing
  useEffect(() => {
    if (grammarTimeoutRef.current) {
      clearTimeout(grammarTimeoutRef.current);
    }

    if (content.trim()) {
      grammarTimeoutRef.current = setTimeout(() => {
        processGrammar();
      }, 1000); // Debounce for 1 second
    } else {
      setGrammarCorrected('');
    }

    return () => {
      if (grammarTimeoutRef.current) {
        clearTimeout(grammarTimeoutRef.current);
      }
    };
  }, [content]);

  // Process flow improvement for completed paragraphs
  useEffect(() => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    if (paragraphs.length > 0) {
      const lastParagraph = paragraphs[paragraphs.length - 1];
      
      // Check if paragraph is complete (ends with punctuation)
      const isComplete = /[.!?]$/.test(lastParagraph.trim());
      
      if (isComplete && lastParagraph !== lastCompleteParagraphRef.current) {
        lastCompleteParagraphRef.current = lastParagraph;
        processFlow(grammarCorrected || content);
      }
    }
  }, [grammarCorrected, content]);

  // Save session periodically
  useEffect(() => {
    if (currentSessionId && content) {
      const timer = setTimeout(() => {
        const session: Session = {
          id: currentSessionId,
          title: content.split('\n')[0].substring(0, 50) || 'Untitled',
          content,
          grammarCorrected,
          flowImproved,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user?.uid
        };
        saveSession(session);
        setSessions(getSessions());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [content, grammarCorrected, flowImproved, currentSessionId, user]);

  const processGrammar = async () => {
    setIsProcessingGrammar(true);
    try {
      const corrected = await correctGrammar(content);
      setGrammarCorrected(corrected);
    } catch (error) {
      console.error('Grammar processing error:', error);
    } finally {
      setIsProcessingGrammar(false);
    }
  };

  const processFlow = async (text: string) => {
    setIsProcessingFlow(true);
    try {
      const improved = await improveFlow(text);
      setFlowImproved(improved);
    } catch (error) {
      console.error('Flow processing error:', error);
    } finally {
      setIsProcessingFlow(false);
    }
  };

  const createNewSession = () => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setCurrentSession(newSessionId);
    setContent('');
    setGrammarCorrected('');
    setFlowImproved('');
    lastCompleteParagraphRef.current = '';
  };

  const handleSelectSession = (session: Session) => {
    setCurrentSessionId(session.id);
    setCurrentSession(session.id);
    setContent(session.content);
    setGrammarCorrected(session.grammarCorrected);
    setFlowImproved(session.flowImproved);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    setSessions(getSessions());
    if (sessionId === currentSessionId) {
      createNewSession();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Session History Sidebar */}
      {showHistory && (
        <SessionHistory
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={createNewSession}
          onDeleteSession={handleDeleteSession}
          isVisible={showHistory}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex items-center justify-between card-shadow">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2.5 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 rounded-xl transition-all duration-200"
              title="Toggle history"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold gradient-text">Smart Word Editor</h1>
            {currentAIProvider && (
              <span className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
                🤖 {currentAIProvider.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-indigo-50 px-4 py-2 rounded-xl border border-purple-100">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {user.displayName || user.email}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Editor Layout */}
        <div className="flex-1 flex overflow-hidden gap-4 p-4">
          {/* Left Column - Input */}
          <div className="w-1/2 bg-white rounded-2xl card-shadow-lg overflow-hidden">
            <EditorPanel
              content={content}
              onChange={setContent}
              placeholder="Start typing or use voice input..."
            />
          </div>

          {/* Right Column - AI Outputs */}
          <div className="w-1/2 flex flex-col gap-4">
            {/* Top - Grammar Correction */}
            <div className="flex-1 bg-white rounded-2xl card-shadow-lg overflow-hidden">
              <OutputPanel
                title="Grammar Corrected"
                content={grammarCorrected}
                isLoading={isProcessingGrammar}
                emptyMessage="✨ Grammar corrections will appear here as you type"
                icon="📝"
              />
            </div>

            {/* Bottom - Flow Improvement */}
            <div className="flex-1 bg-white rounded-2xl card-shadow-lg overflow-hidden">
              <OutputPanel
                title="Flow & Rhythm Enhanced"
                content={flowImproved}
                isLoading={isProcessingFlow}
                emptyMessage="🎵 Flow improvements will appear after completing a paragraph"
                icon="✨"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 card-shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Sign In</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AuthButtons onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
