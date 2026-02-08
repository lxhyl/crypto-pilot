'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

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
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
      >
        {expanded ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronRight className="w-3 h-3" aria-hidden="true" />}
        Raw calldata
      </button>
      {expanded && (
        <div className="mt-2 p-3 bg-black/30 rounded-xl border border-white/5 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-[10px] uppercase tracking-wider font-sans">Transaction Data</span>
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy calldata to clipboard'}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
              <span className="font-sans text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-1.5 text-gray-400">
            <p><span className="text-gray-600">to: </span><span className="text-gray-300">{to}</span></p>
            <p><span className="text-gray-600">value: </span><span className="text-gray-300">{value} wei</span></p>
            <p className="break-all"><span className="text-gray-600">data: </span><span className="text-gray-300">{data}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
