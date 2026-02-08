'use client';

import { History, Inbox } from 'lucide-react';
import { HistoryItem } from './history-item';
import type { OperationRecord } from '@/types';

interface OperationHistoryProps {
  className?: string;
  operations: OperationRecord[];
}

export function OperationHistory({ className, operations }: OperationHistoryProps) {
  return (
    <aside className={`flex flex-col border-l border-white/5 bg-gray-950/80 ${className || ''}`} aria-label="Operation history">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/5">
        <History className="w-4 h-4 text-gray-500" aria-hidden="true" />
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</h2>
        {operations.length > 0 && (
          <span className="ml-auto text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full ring-1 ring-white/5">
            {operations.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3 ring-1 ring-white/5">
              <Inbox className="w-5 h-5 text-gray-700" aria-hidden="true" />
            </div>
            <p className="text-xs text-gray-500 font-medium">No operations yet</p>
            <p className="text-[10px] text-gray-600 mt-1 max-w-[180px]" style={{ textWrap: 'balance' }}>
              Confirmed transactions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {operations.map((op) => <HistoryItem key={op.id} operation={op} />)}
          </div>
        )}
      </div>
    </aside>
  );
}
