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
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl transition-colors focus-within:border-violet-500/30 focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.15)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to do..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3.5 text-[13px] text-white placeholder-zinc-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] max-h-[150px]"
          />
          <div className="p-2 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={disabled || !hasInput}
              aria-label="Send message"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                hasInput && !disabled
                  ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 scale-100'
                  : 'bg-zinc-800 text-zinc-600 scale-95'
              } disabled:cursor-not-allowed`}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className="text-center text-[11px] text-zinc-600 mt-2 select-none">
          <kbd className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[10px] text-zinc-500 font-mono">Enter</kbd>
          {' '}to send{' '}
          <span className="text-zinc-700">&middot;</span>
          {' '}<kbd className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-[10px] text-zinc-500 font-mono">Shift+Enter</kbd>
          {' '}new line
        </p>
      </div>
    </div>
  );
}
