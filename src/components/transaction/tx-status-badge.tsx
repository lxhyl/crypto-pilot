'use client';

import { cn } from '@/lib/utils';

type Status = 'pending' | 'confirmed' | 'failed' | 'rejected' | 'idle';

const statusConfig: Record<Status, { label: string; className: string }> = {
  idle: { label: 'Ready', className: 'bg-gray-700 text-gray-300' },
  pending: { label: 'Pending...', className: 'bg-yellow-900/50 text-yellow-300 animate-pulse' },
  confirmed: { label: 'Confirmed', className: 'bg-green-900/50 text-green-300' },
  failed: { label: 'Failed', className: 'bg-red-900/50 text-red-300' },
  rejected: { label: 'Rejected', className: 'bg-gray-700 text-gray-400' },
};

export function TxStatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.idle;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
