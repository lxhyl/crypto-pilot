import { encodeFunctionData, parseUnits, maxUint256, encodeAbiParameters, parseAbiParameters } from 'viem';
import { getContractAddress } from '../contracts';
import { resolveSwapToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import { buildApproveStep } from './approve';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface AddLiquidityV4Params {
  token0: string;
  token1: string;
  amount0: string;
  amount1: string;
  feeTier?: number;
  hookAddress?: string; // optional V4 hook contract
}

// V4 Actions enum values (from PositionManager)
const Actions = {
  MINT_POSITION: 0,
  SETTLE_PAIR: 16,
} as const;

const FEE_TICK_SPACING: Record<number, number> = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200,
};

function fullRangeTicks(feeTier: number): { tickLower: number; tickUpper: number } {
  const spacing = FEE_TICK_SPACING[feeTier] ?? 60;
  const MAX_TICK = 887272;
  const tickLower = -Math.floor(MAX_TICK / spacing) * spacing;
  const tickUpper = Math.floor(MAX_TICK / spacing) * spacing;
  return { tickLower, tickUpper };
}

export function generateAddLiquidityV4Calldata(
  params: AddLiquidityV4Params,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const tokenA = resolveSwapToken(params.token0, chainId);
  const tokenB = resolveSwapToken(params.token1, chainId);

  const [token0, token1, amount0Str, amount1Str] =
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
      ? [tokenA, tokenB, params.amount0, params.amount1]
      : [tokenB, tokenA, params.amount1, params.amount0];

  const amount0 = parseUnits(amount0Str, token0.decimals);
  const amount1 = parseUnits(amount1Str, token1.decimals);
  const feeTier = params.feeTier ?? 3000;
  const tickSpacing = FEE_TICK_SPACING[feeTier] ?? 60;
  const hookAddress = (params.hookAddress ?? '0x0000000000000000000000000000000000000000') as `0x${string}`;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
  const positionManager = getContractAddress('uniswapV4PositionManager', chainId);

  const { tickLower, tickUpper } = fullRangeTicks(feeTier);

  // Encode the MINT_POSITION action params
  // V4 PositionManager.modifyLiquidities takes encoded actions
  const mintParams = encodeAbiParameters(
    parseAbiParameters('address, address, uint24, int24, address, int24, int24, uint256, uint128, uint128, address, bytes'),
    [
      token0.address,
      token1.address,
      feeTier,
      tickSpacing,
      hookAddress,
      tickLower,
      tickUpper,
      amount0, // liquidity amount
      0n,      // amount0Min
      0n,      // amount1Min
      userAddress,
      '0x',    // hookData
    ],
  );

  // Encode the actions bytes: [MINT_POSITION, SETTLE_PAIR]
  const actionsBytes = encodeAbiParameters(
    parseAbiParameters('uint8[]'),
    [[Actions.MINT_POSITION, Actions.SETTLE_PAIR]],
  );

  // Build modifyLiquidities calldata
  const unlockData = encodeAbiParameters(
    parseAbiParameters('bytes, bytes[]'),
    [actionsBytes, [mintParams, '0x']],
  );

  const modifyData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: 'unlockData', type: 'bytes' },
          { name: 'deadline', type: 'uint256' },
        ],
        name: 'modifyLiquidities',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const,
    functionName: 'modifyLiquidities',
    args: [unlockData, deadline],
  });

  const steps: TransactionStep[] = [
    buildApproveStep(token0.address, token0.symbol, positionManager, maxUint256, true, amount0),
    buildApproveStep(token1.address, token1.symbol, positionManager, maxUint256, true, amount1),
    {
      to: positionManager,
      data: modifyData,
      value: '0',
      label: `Add V4 liquidity ${token0.symbol}/${token1.symbol}`,
    },
  ];

  const feeLabel = feeTier === 500 ? '0.05%' : feeTier === 3000 ? '0.3%' : feeTier === 10000 ? '1%' : `${feeTier / 10000}%`;

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'add_liquidity_v4',
      summary: `Add ${token0.symbol}/${token1.symbol} liquidity on Uniswap V4`,
      details: [
        { label: 'Action', value: 'Uniswap V4 Add Liquidity' },
        { label: 'Pool', value: `${token0.symbol}/${token1.symbol}` },
        { label: `${token0.symbol} Amount`, value: `${amount0Str} ${token0.symbol}` },
        { label: `${token1.symbol} Amount`, value: `${amount1Str} ${token1.symbol}` },
        { label: 'Fee Tier', value: feeLabel },
        { label: 'Range', value: 'Full Range' },
        { label: 'Hook', value: hookAddress === '0x0000000000000000000000000000000000000000' ? 'None' : shortenAddress(hookAddress as `0x${string}`) },
        { label: 'Position Manager', value: shortenAddress(positionManager) },
        { label: 'Steps', value: '3 (approve + approve + mint)' },
      ],
      warnings: [
        'amountMin is set to 0. For production use, set proper slippage protection.',
        'Uniswap V4 is relatively new. Verify the pool exists before adding liquidity.',
      ],
    },
  };
}
