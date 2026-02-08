'use client';

import { User, Bot } from 'lucide-react';
import { TxPreviewCard } from '@/components/transaction/tx-preview-card';
import type { ChatMessage } from '@/types';
import type { TxStatus } from '@/hooks/use-transaction';

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirmTx?: () => void;
  onRejectTx?: () => void;
  onRetryTx?: () => void;
  txHash?: string;
  txStatus?: TxStatus;
  txDisplayStatus?: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
  txErrorMessage?: string | null;
  txStepProgress?: { currentStep: number; totalSteps: number; currentLabel: string; completedHashes: string[] } | null;
}

export function MessageBubble({
  message,
  onConfirmTx,
  onRejectTx,
  onRetryTx,
  txHash,
  txStatus = 'idle',
  txDisplayStatus = 'idle',
  txErrorMessage,
  txStepProgress,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className="px-4 sm:px-6 py-3">
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isUser
              ? 'bg-zinc-800 text-zinc-400'
              : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-400 ring-1 ring-violet-500/10'
          }`}
        >
          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
        </div>

        {/* Content */}
        <div className={`max-w-[85%] min-w-0 ${isUser ? 'text-right' : ''}`}>
          <div
            className={`inline-block text-[13px] leading-relaxed rounded-2xl px-4 py-2.5 ${
              isUser
                ? 'bg-violet-600 text-white rounded-tr-md'
                : 'bg-[var(--surface)] text-zinc-300 rounded-tl-md border border-[var(--border)]'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-left">
              {message.content}
            </div>
          </div>

          {/* Timestamp */}
          <div className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <time
              className="text-[10px] text-zinc-600"
              dateTime={new Date(message.timestamp).toISOString()}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>

          {/* Transaction preview */}
          {message.transaction && onConfirmTx && onRejectTx && onRetryTx && (
            <div className="mt-2 text-left">
              <TxPreviewCard
                transaction={message.transaction}
                onConfirm={onConfirmTx}
                onReject={onRejectTx}
                onRetry={onRetryTx}
                txHash={txHash}
                status={txStatus}
                displayStatus={txDisplayStatus}
                errorMessage={txErrorMessage}
                stepProgress={txStepProgress}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
