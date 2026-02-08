'use client';

import { ExternalLink, ArrowRightLeft, Send, ShieldCheck, PiggyBank, Landmark, Undo2, ArrowDownToLine } from 'lucide-react';
import { TxStatusBadge } from '@/components/transaction/tx-status-badge';
import { getExplorerUrl } from '@/lib/utils';
import type { OperationRecord } from '@/types';

const intentIcons: Record<string, React.ReactNode> = {
  swap: <ArrowRightLeft className="w-4 h-4" />,
  transfer: <Send className="w-4 h-4" />,
  approve: <ShieldCheck className="w-4 h-4" />,
  supply_aave: <PiggyBank className="w-4 h-4" />,
  borrow_aave: <Landmark className="w-4 h-4" />,
  repay_aave: <Undo2 className="w-4 h-4" />,
  withdraw_aave: <ArrowDownToLine className="w-4 h-4" />,
};

export function HistoryItem({ operation }: { operation: OperationRecord }) {
  return (
    <div className="px-3 py-3 border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
          {intentIcons[operation.intent] || <ArrowRightLeft className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-200 leading-snug line-clamp-2">
            {operation.summary}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <TxStatusBadge status={operation.status} />
            <span className="text-[10px] text-gray-600">
              {new Date(operation.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {operation.txHash && (
            <a
              href={getExplorerUrl(operation.chainId, operation.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-[10px] text-violet-400 hover:text-violet-300"
            >
              {operation.txHash.slice(0, 10)}...
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
