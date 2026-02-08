'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingIndicator } from './thinking-indicator';
import type { ChatMessage } from '@/types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  // Transaction handling for the latest message with a transaction
  onConfirmTx?: () => void;
  onRejectTx?: () => void;
  txHash?: string;
  txStatus?: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
  activeTxMessageId?: string;
}

export function MessageList({
  messages,
  isLoading,
  onConfirmTx,
  onRejectTx,
  txHash,
  txStatus,
  activeTxMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧭</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Crypto Pilot</h2>
          <p className="text-sm text-gray-400 mb-6">
            Tell me what you want to do with your crypto assets. I can help you swap tokens, lend on Aave, transfer tokens, and more.
          </p>
          <div className="grid grid-cols-1 gap-2 text-left">
            {[
              'Swap 1 ETH for USDC',
              'Supply 100 USDC to Aave',
              'Transfer 0.5 ETH to 0x...',
              'Borrow 50 DAI from Aave',
            ].map((example) => (
              <div
                key={example}
                className="px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-xs text-gray-400"
              >
                &quot;{example}&quot;
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onConfirmTx={msg.id === activeTxMessageId ? onConfirmTx : undefined}
            onRejectTx={msg.id === activeTxMessageId ? onRejectTx : undefined}
            txHash={msg.id === activeTxMessageId ? txHash : undefined}
            txStatus={msg.id === activeTxMessageId ? txStatus : undefined}
          />
        ))}
        {isLoading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
