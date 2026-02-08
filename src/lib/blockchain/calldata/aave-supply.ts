import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { aaveV3PoolAbi } from '../abis/aave-v3-pool';
import { getContractAddress } from '../contracts';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import { buildApproveStep } from './approve';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface AaveSupplyParams {
  token: string;
  amount: string;
}

export function generateAaveSupplyCalldata(
  params: AaveSupplyParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const token = resolveToken(params.token, chainId);
  const amount = parseUnits(params.amount, token.decimals);
  const poolAddress = getContractAddress('aaveV3Pool', chainId);

  const supplyData = encodeFunctionData({
    abi: aaveV3PoolAbi,
    functionName: 'supply',
    args: [token.address, amount, userAddress, 0],
  });

  const steps: TransactionStep[] = [
    // Step 1: Approve Aave Pool to spend tokens
    buildApproveStep(token.address, token.symbol, poolAddress, maxUint256, true),
    // Step 2: Supply to Aave
    {
      to: poolAddress,
      data: supplyData,
      value: '0',
      label: `Supply ${params.amount} ${token.symbol} to Aave`,
    },
  ];

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'supply_aave',
      summary: `Supply ${params.amount} ${token.symbol} to Aave V3`,
      details: [
        { label: 'Action', value: 'Aave V3 Supply' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'Pool', value: shortenAddress(poolAddress) },
        { label: 'Steps', value: '2 (approve + supply)' },
      ],
      warnings: [],
    },
  };
}
