'use client';

import { User, Bot } from 'lucide-react';
import { TxPreviewCard } from '@/components/transaction/tx-preview-card';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirmTx?: () => void;
  onRejectTx?: () => void;
  txHash?: string;
  txStatus?: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
}

export function MessageBubble({
  message,
  onConfirmTx,
  onRejectTx,
  txHash,
  txStatus = 'idle',
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 px-6 py-4 transition-colors ${isUser ? '' : 'bg-white/[0.02]'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${
          isUser
            ? 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
            : 'bg-gradient-to-br from-violet-500/20 to-violet-700/20 text-violet-400 ring-violet-500/10'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-xs font-semibold text-gray-300">
            {isUser ? 'You' : 'Crypto Pilot'}
          </p>
          <time className="text-[10px] text-gray-600" dateTime={new Date(message.timestamp).toISOString()}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
        <div className="text-[13px] leading-relaxed text-gray-300 whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Transaction preview */}
        {message.transaction && onConfirmTx && onRejectTx && (
          <TxPreviewCard
            transaction={message.transaction}
            onConfirm={onConfirmTx}
            onReject={onRejectTx}
            txHash={txHash}
            status={txStatus}
          />
        )}
      </div>
    </div>
  );
}
