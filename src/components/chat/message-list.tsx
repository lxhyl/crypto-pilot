'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingIndicator } from './thinking-indicator';
import { ArrowRightLeft, PiggyBank, Send, Landmark, Compass } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendExample?: (text: string) => void;
  onConfirmTx?: () => void;
  onRejectTx?: () => void;
  txHash?: string;
  txStatus?: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
  activeTxMessageId?: string;
}

const EXAMPLES = [
  { icon: ArrowRightLeft, text: 'Swap 1 ETH for USDC', color: 'text-blue-400 bg-blue-500/10 ring-blue-500/20' },
  { icon: PiggyBank, text: 'Supply 100 USDC to Aave', color: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20' },
  { icon: Send, text: 'Transfer 0.5 ETH to 0x\u2026', color: 'text-amber-400 bg-amber-500/10 ring-amber-500/20' },
  { icon: Landmark, text: 'Borrow 50 DAI from Aave', color: 'text-rose-400 bg-rose-500/10 ring-rose-500/20' },
];

export function MessageList({
  messages,
  isLoading,
  onSendExample,
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
      <div className="flex-1 flex items-center justify-center p-8 bg-grid">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
            <Compass className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2" style={{ textWrap: 'balance' }}>
            What would you like to do?
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto" style={{ textWrap: 'balance' }}>
            Describe any DeFi operation in plain language. I&apos;ll prepare the transaction for you to review and sign.
          </p>

          {/* Example cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {EXAMPLES.map(({ icon: Icon, text, color }) => (
              <button
                key={text}
                onClick={() => onSendExample?.(text)}
                className="group flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                  {text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto divide-y divide-white/[0.03]">
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
