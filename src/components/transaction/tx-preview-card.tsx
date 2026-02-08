'use client';

import {
  AlertTriangle, Check, X, Loader2, ExternalLink, RotateCcw, Ban, XCircle,
  ArrowRightLeft, Send, ShieldCheck, PiggyBank, Landmark, Undo2, ArrowDownToLine,
} from 'lucide-react';
import { TxStatusBadge } from './tx-status-badge';
import { CalldataDisplay } from './calldata-display';
import { getExplorerUrl } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';
import type { TxStatus } from '@/hooks/use-transaction';

interface TxPreviewCardProps {
  transaction: PreparedTransaction;
  onConfirm: () => void;
  onReject: () => void;  // Cancel entirely
  onRetry: () => void;   // Reset to idle, show Sign & Send again
  txHash?: string;
  status: TxStatus;
  displayStatus: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
  errorMessage?: string | null;
}

const intentConfig: Record<string, { icon: React.ElementType; gradient: string; iconBg: string }> = {
  swap:          { icon: ArrowRightLeft,  gradient: 'from-blue-500/5 to-cyan-500/5',     iconBg: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
  transfer:      { icon: Send,           gradient: 'from-amber-500/5 to-orange-500/5',  iconBg: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  approve:       { icon: ShieldCheck,    gradient: 'from-cyan-500/5 to-teal-500/5',     iconBg: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20' },
  supply_aave:   { icon: PiggyBank,      gradient: 'from-emerald-500/5 to-green-500/5', iconBg: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
  borrow_aave:   { icon: Landmark,       gradient: 'from-rose-500/5 to-pink-500/5',     iconBg: 'bg-rose-500/10 text-rose-400 ring-rose-500/20' },
  repay_aave:    { icon: Undo2,          gradient: 'from-teal-500/5 to-emerald-500/5',  iconBg: 'bg-teal-500/10 text-teal-400 ring-teal-500/20' },
  withdraw_aave: { icon: ArrowDownToLine, gradient: 'from-orange-500/5 to-amber-500/5', iconBg: 'bg-orange-500/10 text-orange-400 ring-orange-500/20' },
};

export function TxPreviewCard({
  transaction, onConfirm, onReject, onRetry, txHash, status, displayStatus, errorMessage,
}: TxPreviewCardProps) {
  const { humanReadable } = transaction;
  const config = intentConfig[humanReadable.type] || intentConfig.swap;
  const Icon = config.icon;

  // Which action buttons to show
  const showSignButton = status === 'idle';
  const showSendingState = status === 'sending';
  const showConfirmingState = status === 'confirming';
  const showRetryButton = status === 'wallet_rejected' || status === 'send_error' || status === 'chain_failed';
  const showDone = status === 'confirmed' || status === 'cancelled';
  const showCancelButton = status === 'idle' || showRetryButton;

  return (
    <div className={`mt-2 rounded-2xl border border-[var(--border)] bg-gradient-to-br ${config.gradient} overflow-hidden animate-slide-up`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--border)]">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ring-1 ${config.iconBg}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[13px] font-semibold text-white flex-1 truncate">
          {humanReadable.summary}
        </p>
        <TxStatusBadge status={displayStatus} />
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Details table */}
        <div className="rounded-xl bg-black/20 border border-[var(--border)] overflow-hidden">
          {humanReadable.details.map((detail, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-2 text-[12px] ${
                i !== humanReadable.details.length - 1 ? 'border-b border-[var(--border)]' : ''
              }`}
            >
              <span className="text-zinc-500">{detail.label}</span>
              <span className="text-zinc-200 font-mono text-[11px] text-right max-w-[65%] truncate">
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        {/* Protocol warnings (always visible) */}
        {humanReadable.warnings.length > 0 && (
          <div className="space-y-1.5">
            {humanReadable.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-amber-400/80 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl" role="alert">
                <AlertTriangle className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
                <span className="leading-relaxed">{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error message (wallet rejection, send error, chain revert) */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 text-[12px] bg-red-500/5 border border-red-500/15 p-3 rounded-xl animate-fade-in" role="alert">
            {status === 'wallet_rejected' ? (
              <Ban className="w-4 h-4 text-red-400 flex-shrink-0 mt-px" aria-hidden="true" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-px" aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-red-300 font-medium leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Calldata */}
        <CalldataDisplay data={transaction.data} to={transaction.to} value={transaction.value} />

        {/* ── Action buttons (state machine) ── */}

        {/* State: idle → Show Sign & Send + Cancel */}
        {showSignButton && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 h-10 bg-white text-zinc-900 text-[13px] font-semibold rounded-xl hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Sign & Send
            </button>
            <button
              onClick={onReject}
              aria-label="Cancel transaction"
              className="h-10 px-3.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-[var(--border)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* State: sending → Waiting for wallet */}
        {showSendingState && (
          <div className="flex gap-2 pt-1">
            <div className="flex-1 flex items-center justify-center gap-2 h-10 bg-zinc-800 text-zinc-300 text-[13px] font-medium rounded-xl" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Confirm in wallet&hellip;
            </div>
          </div>
        )}

        {/* State: confirming → Waiting for chain receipt */}
        {showConfirmingState && (
          <div className="flex gap-2 pt-1">
            <div className="flex-1 flex items-center justify-center gap-2 h-10 bg-zinc-800 text-zinc-300 text-[13px] font-medium rounded-xl" role="status">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Waiting for confirmation&hellip;
            </div>
          </div>
        )}

        {/* State: error (rejected / send_error / chain_failed) → Retry + Cancel */}
        {showRetryButton && (
          <div className="flex gap-2 pt-1 animate-fade-in">
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 h-10 bg-white text-zinc-900 text-[13px] font-semibold rounded-xl hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Try Again
            </button>
            {showCancelButton && (
              <button
                onClick={onReject}
                aria-label="Cancel transaction"
                className="h-10 px-3.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-[var(--border)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Tx Hash (visible when confirming, confirmed, or chain_failed) */}
        {txHash && (
          <a
            href={getExplorerUrl(transaction.chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span className="font-mono text-[10px] text-zinc-500">{txHash.slice(0, 14)}&hellip;{txHash.slice(-6)}</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
