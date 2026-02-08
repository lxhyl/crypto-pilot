'use client';

import { History } from 'lucide-react';
import { HistoryItem } from './history-item';
import type { OperationRecord } from '@/types';

interface OperationHistoryProps {
  className?: string;
  operations: OperationRecord[];
}

export function OperationHistory({ className, operations }: OperationHistoryProps) {
  return (
    <div className={`flex flex-col border-l border-gray-800 bg-gray-950/50 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <History className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-medium text-gray-300">History</h2>
        {operations.length > 0 && (
          <span className="ml-auto text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">
            {operations.length}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <History className="w-8 h-8 text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">No operations yet</p>
            <p className="text-[10px] text-gray-600 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          operations.map((op) => <HistoryItem key={op.id} operation={op} />)
        )}
      </div>
    </div>
  );
}
