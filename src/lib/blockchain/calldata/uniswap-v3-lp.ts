import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { uniswapV3NftManagerAbi } from '../abis/uniswap-v3-nft-manager';
import { getContractAddress } from '../contracts';
import { resolveSwapToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import { buildApproveStep } from './approve';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface AddLiquidityV3Params {
  token0: string;
  token1: string;
  amount0: string;
  amount1: string;
  feeTier?: number;      // 500 (0.05%), 3000 (0.3%), 10000 (1%)
  priceLower?: string;   // optional, defaults to full range
  priceUpper?: string;
}

// Uniswap V3 tick spacing per fee tier
const FEE_TICK_SPACING: Record<number, number> = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200,
};

// Full-range tick bounds (aligned to tick spacing)
function fullRangeTicks(feeTier: number): { tickLower: number; tickUpper: number } {
  const spacing = FEE_TICK_SPACING[feeTier] ?? 60;
  const MAX_TICK = 887272;
  const tickLower = -Math.floor(MAX_TICK / spacing) * spacing;
  const tickUpper = Math.floor(MAX_TICK / spacing) * spacing;
  return { tickLower, tickUpper };
}

export function generateAddLiquidityV3Calldata(
  params: AddLiquidityV3Params,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const tokenA = resolveSwapToken(params.token0, chainId);
  const tokenB = resolveSwapToken(params.token1, chainId);

  // Uniswap V3 requires token0 < token1 (by address)
  const [token0, token1, amount0Str, amount1Str] =
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
      ? [tokenA, tokenB, params.amount0, params.amount1]
      : [tokenB, tokenA, params.amount1, params.amount0];

  const amount0 = parseUnits(amount0Str, token0.decimals);
  const amount1 = parseUnits(amount1Str, token1.decimals);
  const feeTier = params.feeTier ?? 3000;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
  const nftManagerAddress = getContractAddress('uniswapV3NftManager', chainId);

  const { tickLower, tickUpper } = fullRangeTicks(feeTier);

  const mintData = encodeFunctionData({
    abi: uniswapV3NftManagerAbi,
    functionName: 'mint',
    args: [
      {
        token0: token0.address,
        token1: token1.address,
        fee: feeTier,
        tickLower,
        tickUpper,
        amount0Desired: amount0,
        amount1Desired: amount1,
        amount0Min: 0n,
        amount1Min: 0n,
        recipient: userAddress,
        deadline,
      },
    ],
  });

  const steps: TransactionStep[] = [
    buildApproveStep(token0.address, token0.symbol, nftManagerAddress, maxUint256, true, amount0),
    buildApproveStep(token1.address, token1.symbol, nftManagerAddress, maxUint256, true, amount1),
    {
      to: nftManagerAddress,
      data: mintData,
      value: '0',
      label: `Add liquidity ${token0.symbol}/${token1.symbol}`,
    },
  ];

  const feeLabel = feeTier === 500 ? '0.05%' : feeTier === 3000 ? '0.3%' : feeTier === 10000 ? '1%' : `${feeTier / 10000}%`;

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'add_liquidity_v3',
      summary: `Add ${token0.symbol}/${token1.symbol} liquidity on Uniswap V3`,
      details: [
        { label: 'Action', value: 'Uniswap V3 Add Liquidity' },
        { label: 'Pool', value: `${token0.symbol}/${token1.symbol}` },
        { label: `${token0.symbol} Amount`, value: `${amount0Str} ${token0.symbol}` },
        { label: `${token1.symbol} Amount`, value: `${amount1Str} ${token1.symbol}` },
        { label: 'Fee Tier', value: feeLabel },
        { label: 'Range', value: 'Full Range' },
        { label: 'NFT Manager', value: shortenAddress(nftManagerAddress) },
        { label: 'Steps', value: '3 (approve + approve + mint)' },
      ],
      warnings: [
        'amountMin is set to 0. For production use, set proper slippage protection.',
        'Full-range positions may earn less fees than concentrated positions.',
      ],
    },
  };
}
