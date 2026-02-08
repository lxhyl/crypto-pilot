'use client';

import { cn } from '@/lib/utils';

type Status = 'pending' | 'confirmed' | 'failed' | 'rejected' | 'idle';

const statusConfig: Record<Status, { label: string; dot: string; bg: string }> = {
  idle:      { label: 'Review',     dot: 'bg-violet-400',                    bg: 'bg-violet-500/8 text-violet-400 border-violet-500/15' },
  pending:   { label: 'Pending',    dot: 'bg-amber-400 animate-pulse',       bg: 'bg-amber-500/8 text-amber-400 border-amber-500/15' },
  confirmed: { label: 'Confirmed',  dot: 'bg-emerald-400',                   bg: 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15' },
  failed:    { label: 'Failed',     dot: 'bg-red-400',                       bg: 'bg-red-500/8 text-red-400 border-red-500/15' },
  rejected:  { label: 'Cancelled',  dot: 'bg-zinc-500',                      bg: 'bg-zinc-500/8 text-zinc-500 border-zinc-500/15' },
};

export function TxStatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.idle;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border', config.bg)}
      role="status"
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
