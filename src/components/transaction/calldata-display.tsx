'use client';

import { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';

export function CalldataDisplay({ data, to, value }: { data: string; to: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Hide raw calldata' : 'Show raw calldata'}
        className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <Code2 className="w-3 h-3" aria-hidden="true" />
        {expanded ? 'Hide' : 'View'} calldata
      </button>

      {expanded && (
        <div className="mt-2 p-3 bg-black/40 rounded-xl border border-[var(--border)] text-[11px] font-mono animate-fade-in">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-zinc-600 text-[10px] uppercase tracking-widest font-sans font-medium">Raw Transaction</span>
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy calldata'}
              className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors rounded px-1.5 py-0.5 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
              <span className="font-sans text-[10px]">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-1 text-zinc-500 leading-relaxed">
            <p><span className="text-zinc-600">to </span><span className="text-zinc-300">{to}</span></p>
            <p><span className="text-zinc-600">value </span><span className="text-zinc-300">{value === '0' ? '0' : `${value} wei`}</span></p>
            <p className="break-all"><span className="text-zinc-600">data </span><span className="text-zinc-400">{data.slice(0, 10)}</span><span className="text-zinc-600">{data.slice(10)}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
