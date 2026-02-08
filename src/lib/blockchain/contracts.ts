export const CONTRACTS: Record<string, Record<number, `0x${string}`>> = {
  uniswapV3Router: {
    1: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    42161: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    8453: '0x2626664c2603336E57B271c5C0b26F421741e481',
  },
  aaveV3Pool: {
    1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  },
};

export function getContractAddress(protocol: string, chainId: number): `0x${string}` {
  const addresses = CONTRACTS[protocol];
  if (!addresses) throw new Error(`Unknown protocol: ${protocol}`);
  const addr = addresses[chainId];
  if (!addr) throw new Error(`Protocol ${protocol} not deployed on chain ${chainId}`);
  return addr;
}
