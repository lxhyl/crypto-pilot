import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { uniswapV3RouterAbi } from '../abis/uniswap-v3-router';
import { getContractAddress } from '../contracts';
import { resolveSwapToken, isNativeETH } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import { buildApproveStep } from './approve';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage?: number;
}

export function generateSwapCalldata(
  params: SwapParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const tokenIn = resolveSwapToken(params.tokenIn, chainId);
  const tokenOut = resolveSwapToken(params.tokenOut, chainId);
  const amountIn = parseUnits(params.amount, tokenIn.decimals);
  const slippage = params.slippage ?? 0.5;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
  const routerAddress = getContractAddress('uniswapV3Router', chainId);
  const sendNativeETH = isNativeETH(params.tokenIn);

  const swapData = encodeFunctionData({
    abi: uniswapV3RouterAbi,
    functionName: 'exactInputSingle',
    args: [
      {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: 3000,
        recipient: userAddress,
        deadline,
        amountIn,
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
      },
    ],
  });

  const steps: TransactionStep[] = [];

  // Step 1: Approve router to spend tokenIn (skip for native ETH)
  if (!sendNativeETH) {
    steps.push(
      buildApproveStep(tokenIn.address, tokenIn.symbol, routerAddress, maxUint256, true),
    );
  }

  // Step 2: Swap
  steps.push({
    to: routerAddress,
    data: swapData,
    value: sendNativeETH ? amountIn.toString() : '0',
    label: `Swap ${params.amount} ${params.tokenIn.toUpperCase()} for ${params.tokenOut.toUpperCase()}`,
  });

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'swap',
      summary: `Swap ${params.amount} ${params.tokenIn.toUpperCase()} for ${params.tokenOut.toUpperCase()} on Uniswap V3`,
      details: [
        { label: 'Action', value: 'Swap (exactInputSingle)' },
        { label: 'Token In', value: `${params.amount} ${tokenIn.symbol}` },
        { label: 'Token Out', value: tokenOut.symbol },
        { label: 'Slippage', value: `${slippage}%` },
        { label: 'Fee Tier', value: '0.3%' },
        { label: 'Steps', value: steps.length === 1 ? '1 (swap)' : '2 (approve + swap)' },
      ],
      warnings: [
        'amountOutMinimum is set to 0. Use a quote for production slippage protection.',
      ],
    },
  };
}
