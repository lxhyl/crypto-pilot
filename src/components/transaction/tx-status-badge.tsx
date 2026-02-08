'use client';

import { cn } from '@/lib/utils';

type Status = 'pending' | 'confirmed' | 'failed' | 'rejected' | 'idle';

const statusConfig: Record<Status, { label: string; dot: string; className: string }> = {
  idle:      { label: 'Ready',       dot: 'bg-gray-400',   className: 'bg-gray-800/50 text-gray-400 ring-gray-700/50' },
  pending:   { label: 'Pending\u2026', dot: 'bg-yellow-400 animate-pulse', className: 'bg-yellow-900/20 text-yellow-300 ring-yellow-500/20' },
  confirmed: { label: 'Confirmed',   dot: 'bg-green-400',  className: 'bg-green-900/20 text-green-300 ring-green-500/20' },
  failed:    { label: 'Failed',      dot: 'bg-red-400',    className: 'bg-red-900/20 text-red-300 ring-red-500/20' },
  rejected:  { label: 'Rejected',    dot: 'bg-gray-500',   className: 'bg-gray-800/50 text-gray-500 ring-gray-700/50' },
};

export function TxStatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.idle;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ring-1',
        config.className,
      )}
      role="status"
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
