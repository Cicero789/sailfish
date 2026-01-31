interface OutputPanelProps {
  title: string;
  content: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function OutputPanel({ title, content, isLoading, emptyMessage }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h2>
          {isLoading && (
            <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {content ? (
          <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              {isLoading ? 'Processing...' : emptyMessage || 'Output will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
