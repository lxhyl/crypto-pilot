'use client';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">AI</span>
      </div>
      <div className="flex items-center gap-1 pt-2">
        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
