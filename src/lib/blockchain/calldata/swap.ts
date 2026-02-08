import { encodeFunctionData, parseUnits } from 'viem';
import { uniswapV3RouterAbi } from '../abis/uniswap-v3-router';
import { getContractAddress } from '../contracts';
import { resolveSwapToken, isNativeETH } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

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

  const data = encodeFunctionData({
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

  const sendNativeETH = isNativeETH(params.tokenIn);

  return {
    to: routerAddress,
    data,
    value: sendNativeETH ? amountIn.toString() : '0',
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
        { label: 'Router', value: shortenAddress(routerAddress) },
        { label: 'Recipient', value: shortenAddress(userAddress) },
      ],
      warnings: [
        'amountOutMinimum is set to 0. In production, use a quote to set proper slippage protection.',
        ...(sendNativeETH ? [`Sending ${params.amount} ETH as msg.value`] : []),
      ],
    },
  };
}
