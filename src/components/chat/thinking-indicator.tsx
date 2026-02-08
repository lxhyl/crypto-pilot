'use client';

import { Bot } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 px-6 py-4" role="status" aria-live="polite" aria-label="AI is thinking">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-700/20 flex items-center justify-center flex-shrink-0 ring-1 ring-violet-500/10">
        <Bot className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex items-center gap-1.5 pt-2.5">
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
        <span className="sr-only">Processing your request&hellip;</span>
      </div>
    </div>
  );
}
