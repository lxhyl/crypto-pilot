'use client';

import { Bot } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="px-4 sm:px-6 py-3 animate-fade-in" role="status" aria-live="polite" aria-label="AI is thinking">
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-violet-500/10 animate-pulse-glow">
          <Bot className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
      <span className="sr-only">Processing your request&hellip;</span>
    </div>
  );
}
