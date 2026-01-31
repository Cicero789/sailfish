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
    <div className="flex h-screen bg-white">
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
        {/* Minimal Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-50 rounded-md transition-colors"
              title="Toggle history"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Smart Word Editor</h1>
            {currentAIProvider && (
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                {currentAIProvider}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">
                  {user.displayName || user.email}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Editor Layout - Clean Three Column */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Your Writing */}
          <div className="w-1/3 border-r border-gray-200 bg-white">
            <EditorPanel
              content={content}
              onChange={setContent}
              placeholder="Start writing..."
            />
          </div>

          {/* Middle Column - Grammar */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <OutputPanel
              title="Grammar"
              content={grammarCorrected}
              isLoading={isProcessingGrammar}
              emptyMessage="Grammar corrections appear here"
            />
          </div>

          {/* Right Column - Flow */}
          <div className="w-1/3 bg-gray-50">
            <OutputPanel
              title="Flow"
              content={flowImproved}
              isLoading={isProcessingFlow}
              emptyMessage="Flow improvements appear here"
            />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
