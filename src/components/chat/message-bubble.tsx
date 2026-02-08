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
    <div className={`flex items-start gap-3 px-4 py-3 ${isUser ? '' : 'bg-gray-900/30'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600/20 text-blue-400' : 'bg-violet-600/20 text-violet-400'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 mb-1">
          {isUser ? 'You' : 'Crypto Pilot'}
        </p>
        <div className="text-sm text-gray-200 whitespace-pre-wrap break-words">
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

      {/* Timestamp */}
      <span className="text-[10px] text-gray-600 flex-shrink-0 pt-1">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
}
