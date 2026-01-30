import React from 'react';
import { Session } from '../types';

interface SessionHistoryProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (session: Session) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isVisible: boolean;
}

export function SessionHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isVisible
}: SessionHistoryProps) {
  if (!isVisible) return null;

  return (
    <div className="w-64 bg-sidebar-bg border-r border-editor-border flex flex-col h-full">
      <div className="p-4 border-b border-editor-border">
        <button
          onClick={onNewSession}
          className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          + New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No sessions yet
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors group ${
                  currentSessionId === session.id
                    ? 'bg-accent-light border border-accent'
                    : 'bg-white hover:bg-gray-50 border border-editor-border'
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-medium text-editor-text truncate flex-1">
                    {session.title || 'Untitled'}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-600 transition-opacity"
                    title="Delete session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {session.content.substring(0, 50) || 'Empty session'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
