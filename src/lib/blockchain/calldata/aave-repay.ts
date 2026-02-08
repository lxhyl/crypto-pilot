import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { aaveV3PoolAbi } from '../abis/aave-v3-pool';
import { getContractAddress } from '../contracts';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import { buildApproveStep } from './approve';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface AaveRepayParams {
  token: string;
  amount: string;
  interestRateMode?: number;
}

export function generateAaveRepayCalldata(
  params: AaveRepayParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const token = resolveToken(params.token, chainId);
  const amount = parseUnits(params.amount, token.decimals);
  const poolAddress = getContractAddress('aaveV3Pool', chainId);
  const rateMode = BigInt(params.interestRateMode ?? 2);

  const repayData = encodeFunctionData({
    abi: aaveV3PoolAbi,
    functionName: 'repay',
    args: [token.address, amount, rateMode, userAddress],
  });

  const steps: TransactionStep[] = [
    // Step 1: Approve Aave Pool to spend tokens for repayment
    buildApproveStep(token.address, token.symbol, poolAddress, maxUint256, true, amount),
    // Step 2: Repay to Aave
    {
      to: poolAddress,
      data: repayData,
      value: '0',
      label: `Repay ${params.amount} ${token.symbol} to Aave`,
    },
  ];

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'repay_aave',
      summary: `Repay ${params.amount} ${token.symbol} to Aave V3`,
      details: [
        { label: 'Action', value: 'Aave V3 Repay' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'Rate Mode', value: rateMode === 1n ? 'Stable' : 'Variable' },
        { label: 'Pool', value: shortenAddress(poolAddress) },
        { label: 'Steps', value: '2 (approve + repay)' },
      ],
      warnings: [],
    },
  };
}
