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
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Raw Calldata
      </button>
      {expanded && (
        <div className="mt-2 p-3 bg-gray-950 rounded-lg border border-gray-800 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Transaction Data</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="space-y-1 text-gray-300">
            <p><span className="text-gray-500">to:</span> {to}</p>
            <p><span className="text-gray-500">value:</span> {value} wei</p>
            <p className="break-all"><span className="text-gray-500">data:</span> {data}</p>
          </div>
        </div>
      )}
    </div>
  );
}
