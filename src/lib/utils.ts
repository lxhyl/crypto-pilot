import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: string, decimals: number = 4): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

export function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    42161: 'https://arbiscan.io',
    8453: 'https://basescan.org',
  };
  const base = explorers[chainId] || 'https://etherscan.io';
  return `${base}/tx/${txHash}`;
}
