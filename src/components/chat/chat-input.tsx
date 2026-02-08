'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className="p-4 border-t border-white/5 glass">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what you want to do&hellip;"
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-gray-900/80 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-shadow"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !hasInput}
            aria-label="Send message"
            className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-all ${
              hasInput && !disabled
                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25'
                : 'bg-gray-800 text-gray-600'
            } disabled:cursor-not-allowed`}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-gray-600 mt-2 select-none">
        Enter to send &middot; Shift+Enter for new line
      </p>
    </div>
  );
}
