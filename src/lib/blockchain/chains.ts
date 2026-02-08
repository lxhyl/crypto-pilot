export const CHAIN_MAP: Record<string, number> = {
  ethereum: 1,
  eth: 1,
  mainnet: 1,
  arbitrum: 42161,
  arb: 42161,
  base: 8453,
};

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  8453: 'Base',
};

export const CHAIN_EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  42161: 'https://arbiscan.io',
  8453: 'https://basescan.org',
};

export function resolveChainId(input: string | number): number {
  if (typeof input === 'number') return input;
  const lower = input.toLowerCase();
  return CHAIN_MAP[lower] || 1;
}
