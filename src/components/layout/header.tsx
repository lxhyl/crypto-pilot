'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 blur-sm -z-10" />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Crypto Pilot
        </span>
      </div>
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
      />
    </header>
  );
}
