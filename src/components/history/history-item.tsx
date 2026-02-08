'use client';

import { ExternalLink, ArrowRightLeft, Send, ShieldCheck, PiggyBank, Landmark, Undo2, ArrowDownToLine } from 'lucide-react';
import { TxStatusBadge } from '@/components/transaction/tx-status-badge';
import { getExplorerUrl } from '@/lib/utils';
import type { OperationRecord } from '@/types';

const intentConfig: Record<string, { icon: React.ElementType; color: string }> = {
  swap:          { icon: ArrowRightLeft,  color: 'text-blue-400 bg-blue-500/10' },
  transfer:      { icon: Send,           color: 'text-amber-400 bg-amber-500/10' },
  approve:       { icon: ShieldCheck,    color: 'text-cyan-400 bg-cyan-500/10' },
  supply_aave:   { icon: PiggyBank,      color: 'text-emerald-400 bg-emerald-500/10' },
  borrow_aave:   { icon: Landmark,       color: 'text-rose-400 bg-rose-500/10' },
  repay_aave:    { icon: Undo2,          color: 'text-teal-400 bg-teal-500/10' },
  withdraw_aave: { icon: ArrowDownToLine, color: 'text-orange-400 bg-orange-500/10' },
};

export function HistoryItem({ operation }: { operation: OperationRecord }) {
  const config = intentConfig[operation.intent] || intentConfig.swap;
  const Icon = config.icon;

  return (
    <div className="px-4 py-3 border-b border-[var(--border)] hover:bg-white/[0.015] transition-colors">
      <div className="flex items-start gap-2.5">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon className="w-3 h-3" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-zinc-300 leading-snug line-clamp-2">
            {operation.summary}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <TxStatusBadge status={operation.status} />
            <time className="text-[10px] text-zinc-600" dateTime={new Date(operation.timestamp).toISOString()}>
              {new Date(operation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
          {operation.txHash && (
            <a
              href={getExplorerUrl(operation.chainId, operation.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
            >
              {operation.txHash.slice(0, 10)}&hellip;
              <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
