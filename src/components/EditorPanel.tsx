import { useRef, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function EditorPanel({ content, onChange, placeholder }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleVoiceTranscript = (transcript: string) => {
    onChange(content + transcript);
  };

  const { isListening, isSupported, startListening, stopListening } = 
    useVoiceRecognition(handleVoiceTranscript);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-6 py-3 border-b border-editor-border bg-editor-bg">
        <h2 className="text-sm font-semibold text-editor-text">Your Writing</h2>
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-accent text-white hover:bg-blue-600'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {isListening ? 'Stop' : 'Voice'}
          </button>
        )}
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
      
      {isListening && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700">Listening...</span>
        </div>
      )}
    </div>
  );
}
