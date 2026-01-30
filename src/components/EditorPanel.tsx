import { useRef, useEffect, useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function EditorPanel({ content, onChange, placeholder }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMicSelector, setShowMicSelector] = useState(false);
  
  const handleVoiceTranscript = (transcript: string) => {
    onChange(content + transcript);
  };

  const { 
    isListening, 
    isSupported, 
    audioLevel,
    availableMicrophones,
    selectedMicId,
    micPermission,
    startListening, 
    stopListening,
    changeMicrophone,
    setupMicrophone
  } = useVoiceRecognition(handleVoiceTranscript);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleVoiceClick = async () => {
    if (!isSupported) return;
    
    if (micPermission === 'prompt' || micPermission === 'denied') {
      await setupMicrophone();
    }
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-6 py-3 border-b border-editor-border bg-editor-bg">
        <h2 className="text-sm font-semibold text-editor-text">Your Writing</h2>
        
        <div className="flex items-center gap-2">
          {/* Microphone Selector */}
          {isSupported && availableMicrophones.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowMicSelector(!showMicSelector)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Select microphone"
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
                  <path d="M7 10l10 10M7 20l10-10" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </button>
              
              {showMicSelector && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-10">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                    Select Microphone
                  </div>
                  {availableMicrophones.map((mic) => (
                    <button
                      key={mic.deviceId}
                      onClick={() => {
                        changeMicrophone(mic.deviceId);
                        setShowMicSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedMicId === mic.deviceId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      {selectedMicId === mic.deviceId && (
                        <span className="ml-2 text-blue-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Voice Button */}
          <button
            onClick={handleVoiceClick}
            disabled={!isSupported}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !isSupported
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-accent text-white hover:bg-blue-600'
            }`}
            title={!isSupported ? 'Voice input not supported in this browser. Try Chrome or Safari.' : ''}
          >
            {/* Microphone Icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {isListening ? 'Stop' : 'Voice'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Start typing or use voice input...'}
          className="w-full h-full px-6 py-4 text-base text-editor-text resize-none focus:outline-none leading-relaxed"
          style={{ minHeight: '100%' }}
        />
      </div>
      
      {/* Audio Level Visualizer */}
      {isListening && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-3">
            {/* Animated Microphone Icon */}
            <div className="relative">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              {/* Pulse animation */}
              <div className="absolute inset-0 animate-ping">
                <svg className="w-5 h-5 text-red-400 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-red-700">Listening...</span>
                <div className="flex gap-1">
                  {/* Audio level bars */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-600 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, Math.min(20, (audioLevel / 100) * 20 * (i + 1) / 3))}px`,
                        opacity: audioLevel > (i * 20) ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Audio level bar */}
              <div className="w-full bg-red-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
