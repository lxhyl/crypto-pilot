'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
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

const intentIcons: Record<string, string> = {
  swap: 'Swap',
  transfer: 'Send',
  approve: 'Approve',
  supply_aave: 'Supply',
  borrow_aave: 'Borrow',
  repay_aave: 'Repay',
  withdraw_aave: 'Withdraw',
};

export function TxPreviewCard({ transaction, onConfirm, onReject, txHash, status }: TxPreviewCardProps) {
  const { humanReadable } = transaction;
  const [confirming, setConfirming] = useState(false);
  const isActionable = status === 'idle';

  const handleConfirm = () => {
    setConfirming(true);
    onConfirm();
  };

  return (
    <div className="mt-3 p-4 bg-gray-900/80 border border-gray-700 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-violet-600/20 text-violet-300 text-xs font-medium rounded">
            {intentIcons[humanReadable.type] || humanReadable.type}
          </span>
          <TxStatusBadge status={status} />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm font-medium text-white mb-3">{humanReadable.summary}</p>

      {/* Details */}
      <div className="space-y-1.5 mb-3">
        {humanReadable.details.map((detail, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{detail.label}</span>
            <span className="text-gray-200 font-mono">{detail.value}</span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {humanReadable.warnings.length > 0 && (
        <div className="mb-3 space-y-1">
          {humanReadable.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calldata */}
      <CalldataDisplay data={transaction.data} to={transaction.to} value={transaction.value} />

      {/* Actions */}
      {isActionable && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {confirming ? 'Waiting for wallet...' : 'Confirm Transaction'}
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            <XCircle className="w-4 h-4" />
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
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-xs text-gray-500 font-mono">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
        </div>
      )}
    </div>
  );
}
