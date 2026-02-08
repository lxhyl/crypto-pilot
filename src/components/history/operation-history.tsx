'use client';

import { Clock, Inbox } from 'lucide-react';
import { HistoryItem } from './history-item';
import type { OperationRecord } from '@/types';

interface OperationHistoryProps {
  className?: string;
  operations: OperationRecord[];
}

export function OperationHistory({ className, operations }: OperationHistoryProps) {
  return (
    <aside
      className={`flex flex-col border-l border-[var(--border)] bg-[var(--background)] ${className || ''}`}
      aria-label="Operation history"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <Clock className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
        <h2 className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">Activity</h2>
        {operations.length > 0 && (
          <span className="ml-auto text-[10px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
            {operations.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-3 border border-[var(--border)]">
              <Inbox className="w-4 h-4 text-zinc-700" aria-hidden="true" />
            </div>
            <p className="text-[12px] text-zinc-500 font-medium">No activity yet</p>
            <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed" style={{ textWrap: 'balance' }}>
              Your transactions will appear here once you start operating.
            </p>
          </div>
        ) : (
          operations.map((op) => <HistoryItem key={op.id} operation={op} />)
        )}
      </div>
    </aside>
  );
}
