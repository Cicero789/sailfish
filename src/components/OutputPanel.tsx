

interface OutputPanelProps {
  title: string;
  content: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function OutputPanel({ title, content, isLoading, emptyMessage }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full bg-editor-bg">
      <div className="px-6 py-3 border-b border-editor-border">
        <h2 className="text-sm font-semibold text-editor-text flex items-center gap-2">
          {title}
          {isLoading && (
            <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {content ? (
          <div className="text-base text-editor-text leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">
            {isLoading ? 'Processing...' : emptyMessage || 'Output will appear here'}
          </div>
        )}
      </div>
    </div>
  );
}
