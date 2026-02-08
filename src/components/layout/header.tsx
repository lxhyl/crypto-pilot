'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Crypto Pilot</h1>
          <p className="text-xs text-gray-400">AI-powered blockchain operations</p>
        </div>
      </div>
      <ConnectButton />
    </header>
  );
}
