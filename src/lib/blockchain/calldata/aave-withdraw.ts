import { encodeFunctionData, parseUnits } from 'viem';
import { aaveV3PoolAbi } from '../abis/aave-v3-pool';
import { getContractAddress } from '../contracts';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

interface AaveWithdrawParams {
  token: string;
  amount: string;
}

export function generateAaveWithdrawCalldata(
  params: AaveWithdrawParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const token = resolveToken(params.token, chainId);
  const amount = parseUnits(params.amount, token.decimals);
  const poolAddress = getContractAddress('aaveV3Pool', chainId);

  const data = encodeFunctionData({
    abi: aaveV3PoolAbi,
    functionName: 'withdraw',
    args: [token.address, amount, userAddress],
  });

  return {
    to: poolAddress,
    data,
    value: '0',
    chainId,
    humanReadable: {
      type: 'withdraw_aave',
      summary: `Withdraw ${params.amount} ${token.symbol} from Aave V3`,
      details: [
        { label: 'Action', value: 'Aave V3 Withdraw' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'Pool', value: shortenAddress(poolAddress) },
        { label: 'To', value: shortenAddress(userAddress) },
      ],
      warnings: [],
    },
  };
}
