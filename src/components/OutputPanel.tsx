interface OutputPanelProps {
  title: string;
  content: string;
  isLoading?: boolean;
  emptyMessage?: string;
  icon?: string;
}

export function OutputPanel({ title, content, isLoading, emptyMessage, icon }: OutputPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {title}
          {isLoading && (
            <svg className="w-4 h-4 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {content ? (
          <div className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-light">
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-20">{icon || '📝'}</div>
              <div className="text-sm text-slate-400 font-medium">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  emptyMessage || 'Output will appear here'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
