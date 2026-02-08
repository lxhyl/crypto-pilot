'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingIndicator } from './thinking-indicator';
import { ArrowRightLeft, PiggyBank, Send, Landmark, Droplets, Gift } from 'lucide-react';
import type { ChatMessage } from '@/types';
import type { TxStatus } from '@/hooks/use-transaction';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendExample?: (text: string) => void;
  onConfirmTx?: () => void;
  onRejectTx?: () => void;
  onRetryTx?: () => void;
  txHash?: string;
  txStatus?: TxStatus;
  txDisplayStatus?: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
  txErrorMessage?: string | null;
  txStepProgress?: { currentStep: number; totalSteps: number; currentLabel: string; completedHashes: string[] } | null;
  activeTxMessageId?: string;
}

const EXAMPLES = [
  {
    icon: ArrowRightLeft,
    text: 'Swap 1 ETH for USDC',
    sub: 'Uniswap V3',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-400',
    border: 'hover:border-blue-500/20',
  },
  {
    icon: PiggyBank,
    text: 'Supply 100 USDC to Aave',
    sub: 'Aave V3 Lending',
    gradient: 'from-emerald-500/10 to-green-500/10',
    iconColor: 'text-emerald-400',
    border: 'hover:border-emerald-500/20',
  },
  {
    icon: Send,
    text: 'Transfer 0.5 ETH to 0x\u2026',
    sub: 'Token Transfer',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconColor: 'text-amber-400',
    border: 'hover:border-amber-500/20',
  },
  {
    icon: Landmark,
    text: 'Borrow 50 DAI from Aave',
    sub: 'Aave V3 Borrowing',
    gradient: 'from-rose-500/10 to-pink-500/10',
    iconColor: 'text-rose-400',
    border: 'hover:border-rose-500/20',
  },
  {
    icon: Droplets,
    text: 'Add WETH/USDC liquidity on V3',
    sub: 'Uniswap V3 LP',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconColor: 'text-purple-400',
    border: 'hover:border-purple-500/20',
  },
  {
    icon: Gift,
    text: 'Claim airdrop from Merkle',
    sub: 'Merkle Distributor',
    gradient: 'from-yellow-500/10 to-amber-500/10',
    iconColor: 'text-yellow-400',
    border: 'hover:border-yellow-500/20',
  },
];

export function MessageList({
  messages,
  isLoading,
  onSendExample,
  onConfirmTx,
  onRejectTx,
  onRetryTx,
  txHash,
  txStatus,
  txDisplayStatus,
  txErrorMessage,
  txStepProgress,
  activeTxMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Welcome screen
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-xl animate-fade-in">
          {/* Hero text */}
          <p className="text-sm text-[var(--muted)] mb-3 font-medium">Welcome to Crypto Pilot</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight leading-tight" style={{ textWrap: 'balance' }}>
            What would you like<br />to do today?
          </h2>
          <p className="text-[15px] text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed" style={{ textWrap: 'balance' }}>
            Describe any DeFi operation in plain language. I&apos;ll build the transaction for you to review and sign.
          </p>

          {/* Example cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {EXAMPLES.map(({ icon: Icon, text, sub, gradient, iconColor, border }) => (
              <button
                key={text}
                onClick={() => onSendExample?.(text)}
                className={`group relative flex items-start gap-3 p-4 bg-gradient-to-br ${gradient} border border-[var(--border)] ${border} rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left`}
              >
                <div className={`w-9 h-9 rounded-xl bg-[var(--surface)] flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug">
                    {text}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-4">
        {messages.map((msg, i) => (
          <div key={msg.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 30, 150)}ms` }}>
            <MessageBubble
              message={msg}
              onConfirmTx={msg.id === activeTxMessageId ? onConfirmTx : undefined}
              onRejectTx={msg.id === activeTxMessageId ? onRejectTx : undefined}
              onRetryTx={msg.id === activeTxMessageId ? onRetryTx : undefined}
              txHash={msg.id === activeTxMessageId ? txHash : undefined}
              txStatus={msg.id === activeTxMessageId ? txStatus : undefined}
              txDisplayStatus={msg.id === activeTxMessageId ? txDisplayStatus : undefined}
              txErrorMessage={msg.id === activeTxMessageId ? txErrorMessage : undefined}
              txStepProgress={msg.id === activeTxMessageId ? txStepProgress : undefined}
            />
          </div>
        ))}
        {isLoading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
