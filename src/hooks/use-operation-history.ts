'use client';

import { useState, useCallback } from 'react';
import type { OperationRecord, IntentType } from '@/types';

export function useOperationHistory() {
  const [operations, setOperations] = useState<OperationRecord[]>([]);

  const addOperation = useCallback(
    (op: {
      intent: IntentType;
      summary: string;
      chainId: number;
      txHash?: string;
      status: OperationRecord['status'];
    }) => {
      const record: OperationRecord = {
        id: crypto.randomUUID(),
        ...op,
        timestamp: Date.now(),
      };
      setOperations((prev) => [record, ...prev]);
      return record.id;
    },
    [],
  );

  const updateOperation = useCallback(
    (id: string, updates: Partial<Pick<OperationRecord, 'status' | 'txHash'>>) => {
      setOperations((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...updates } : op)),
      );
    },
    [],
  );

  return { operations, addOperation, updateOperation };
}
