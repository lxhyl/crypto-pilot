import { encodeFunctionData, parseUnits } from 'viem';
import { aaveV3PoolAbi } from '../abis/aave-v3-pool';
import { getContractAddress } from '../contracts';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

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

  const data = encodeFunctionData({
    abi: aaveV3PoolAbi,
    functionName: 'supply',
    args: [token.address, amount, userAddress, 0],
  });

  return {
    to: poolAddress,
    data,
    value: '0',
    chainId,
    humanReadable: {
      type: 'supply_aave',
      summary: `Supply ${params.amount} ${token.symbol} to Aave V3`,
      details: [
        { label: 'Action', value: 'Aave V3 Supply' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'Pool', value: shortenAddress(poolAddress) },
        { label: 'On Behalf Of', value: shortenAddress(userAddress) },
      ],
      warnings: [
        'Ensure you have approved the Aave Pool to spend your tokens before supplying.',
      ],
    },
  };
}
