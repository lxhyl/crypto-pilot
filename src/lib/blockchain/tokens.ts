export interface TokenInfo {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  chainId: number;
}

// Native ETH placeholder address
const NATIVE_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`;

export const TOKEN_REGISTRY: Record<number, Record<string, TokenInfo>> = {
  // Ethereum Mainnet
  1: {
    ETH: { symbol: 'ETH', name: 'Ether', address: NATIVE_ETH, decimals: 18, chainId: 1 },
    WETH: { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, chainId: 1 },
    USDC: { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, chainId: 1 },
    USDT: { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, chainId: 1 },
    DAI: { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, chainId: 1 },
    WBTC: { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, chainId: 1 },
    LINK: { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, chainId: 1 },
    UNI: { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, chainId: 1 },
    AAVE: { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, chainId: 1 },
  },
  // Arbitrum
  42161: {
    ETH: { symbol: 'ETH', name: 'Ether', address: NATIVE_ETH, decimals: 18, chainId: 42161 },
    WETH: { symbol: 'WETH', name: 'Wrapped Ether', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, chainId: 42161 },
    USDC: { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, chainId: 42161 },
    'USDC.e': { symbol: 'USDC.e', name: 'Bridged USDC', address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', decimals: 6, chainId: 42161 },
    USDT: { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, chainId: 42161 },
    DAI: { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, chainId: 42161 },
    WBTC: { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8, chainId: 42161 },
    ARB: { symbol: 'ARB', name: 'Arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, chainId: 42161 },
  },
  // Base
  8453: {
    ETH: { symbol: 'ETH', name: 'Ether', address: NATIVE_ETH, decimals: 18, chainId: 8453 },
    WETH: { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, chainId: 8453 },
    USDC: { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, chainId: 8453 },
    DAI: { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, chainId: 8453 },
    cbETH: { symbol: 'cbETH', name: 'Coinbase Wrapped Staked ETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, chainId: 8453 },
  },
};

export function resolveToken(symbolOrAddress: string, chainId: number): TokenInfo {
  const chainTokens = TOKEN_REGISTRY[chainId];
  if (!chainTokens) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Try exact symbol match (case-insensitive)
  const upper = symbolOrAddress.toUpperCase();
  for (const [key, token] of Object.entries(chainTokens)) {
    if (key.toUpperCase() === upper || token.symbol.toUpperCase() === upper) {
      return token;
    }
  }

  // Try address match
  if (symbolOrAddress.startsWith('0x')) {
    for (const token of Object.values(chainTokens)) {
      if (token.address.toLowerCase() === symbolOrAddress.toLowerCase()) {
        return token;
      }
    }
  }

  throw new Error(`Unknown token "${symbolOrAddress}" on chain ${chainId}`);
}

// For swaps, if user says ETH we use WETH address
export function resolveSwapToken(symbolOrAddress: string, chainId: number): TokenInfo {
  const token = resolveToken(symbolOrAddress, chainId);
  if (token.symbol === 'ETH') {
    return resolveToken('WETH', chainId);
  }
  return token;
}

export function isNativeETH(symbolOrAddress: string): boolean {
  return symbolOrAddress.toUpperCase() === 'ETH';
}
