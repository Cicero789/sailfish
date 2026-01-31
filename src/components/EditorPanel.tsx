import { useRef, useEffect, useState } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function EditorPanel({ content, onChange, placeholder }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVoiceControls, setShowVoiceControls] = useState(false);
  
  const handleVoiceTranscript = (transcript: string) => {
    onChange(content + (content ? ' ' : '') + transcript);
  };

  const { 
    isListening, 
    startListening, 
    stopListening,
    audioLevel,
    availableMicrophones,
    selectedMicId,
    changeMicrophone
  } = useVoiceRecognition(handleVoiceTranscript);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleToggleVoice = async () => {
    if (isListening) {
      stopListening();
      setShowVoiceControls(false);
    } else {
      setShowVoiceControls(true);
      await startListening();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Minimal header with voice button */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Writing</h2>
        
        {/* Voice button */}
        <button
          onClick={handleToggleVoice}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            isListening
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          <svg className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          {isListening ? 'Stop' : 'Voice'}
        </button>
      </div>

      {/* Microphone selector (when voice is active) */}
      {showVoiceControls && availableMicrophones.length > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <select
            value={selectedMicId}
            onChange={(e) => changeMicrophone(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            {availableMicrophones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${mic.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Audio level indicator (when listening) */}
      {isListening && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    audioLevel > (i + 1) * 20 ? 'bg-red-500 h-3' : 'bg-red-200 h-2'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-red-600 font-medium">Listening...</span>
          </div>
        </div>
      )}

      {/* Text editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full px-6 py-6 resize-none focus:outline-none text-gray-900 leading-relaxed text-base"
        placeholder={placeholder || 'Start writing...'}
        style={{ minHeight: '100%' }}
      />
    </div>
  );
}
