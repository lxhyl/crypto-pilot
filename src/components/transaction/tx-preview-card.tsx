'use client';

import { useState } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle, Loader2, ExternalLink,
  ArrowRightLeft, Send, ShieldCheck, PiggyBank, Landmark, Undo2, ArrowDownToLine,
} from 'lucide-react';
import { TxStatusBadge } from './tx-status-badge';
import { CalldataDisplay } from './calldata-display';
import { getExplorerUrl } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

interface TxPreviewCardProps {
  transaction: PreparedTransaction;
  onConfirm: () => void;
  onReject: () => void;
  txHash?: string;
  status: 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';
}

const intentConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  swap:          { icon: ArrowRightLeft, label: 'Swap',     color: 'text-blue-400 bg-blue-500/10 ring-blue-500/20' },
  transfer:      { icon: Send,          label: 'Transfer', color: 'text-amber-400 bg-amber-500/10 ring-amber-500/20' },
  approve:       { icon: ShieldCheck,   label: 'Approve',  color: 'text-cyan-400 bg-cyan-500/10 ring-cyan-500/20' },
  supply_aave:   { icon: PiggyBank,     label: 'Supply',   color: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20' },
  borrow_aave:   { icon: Landmark,      label: 'Borrow',   color: 'text-rose-400 bg-rose-500/10 ring-rose-500/20' },
  repay_aave:    { icon: Undo2,         label: 'Repay',    color: 'text-teal-400 bg-teal-500/10 ring-teal-500/20' },
  withdraw_aave: { icon: ArrowDownToLine, label: 'Withdraw', color: 'text-orange-400 bg-orange-500/10 ring-orange-500/20' },
};

export function TxPreviewCard({ transaction, onConfirm, onReject, txHash, status }: TxPreviewCardProps) {
  const { humanReadable } = transaction;
  const [confirming, setConfirming] = useState(false);
  const isActionable = status === 'idle';
  const config = intentConfig[humanReadable.type] || intentConfig.swap;
  const Icon = config.icon;

  const handleConfirm = () => {
    setConfirming(true);
    onConfirm();
  };

  return (
    <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl glow-violet">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{humanReadable.summary}</p>
        </div>
        <TxStatusBadge status={status} />
      </div>

      {/* Details table */}
      <div className="rounded-xl bg-black/20 border border-white/5 divide-y divide-white/5 mb-4 overflow-hidden">
        {humanReadable.details.map((detail, i) => (
          <div key={i} className="flex items-center justify-between px-3.5 py-2.5 text-xs">
            <span className="text-gray-500">{detail.label}</span>
            <span className="text-gray-200 font-mono text-right max-w-[60%] truncate">{detail.value}</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {humanReadable.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {humanReadable.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-yellow-300/90 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl" role="alert">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calldata */}
      <CalldataDisplay data={transaction.data} to={transaction.to} value={transaction.value} />

      {/* Actions */}
      {isActionable && (
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:from-violet-800 disabled:to-violet-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
            )}
            {confirming ? 'Waiting for wallet\u2026' : 'Confirm'}
          </button>
          <button
            onClick={onReject}
            aria-label="Reject transaction"
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium rounded-xl border border-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Tx Hash link */}
      {txHash && (
        <div className="mt-3 flex items-center gap-2">
          <a
            href={getExplorerUrl(transaction.chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <span className="text-[10px] text-gray-600 font-mono">
            {txHash.slice(0, 10)}&hellip;{txHash.slice(-8)}
          </span>
        </div>
      )}
    </div>
  );
}
