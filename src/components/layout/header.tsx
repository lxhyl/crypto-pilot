'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="glass flex items-center justify-between px-6 py-3.5 border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-none tracking-tight" style={{ textWrap: 'balance' }}>
            Crypto Pilot
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Natural language DeFi
          </p>
        </div>
      </div>
      <ConnectButton
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    </header>
  );
}
