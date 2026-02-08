import { encodeFunctionData, parseUnits } from 'viem';
import { aaveV3PoolAbi } from '../abis/aave-v3-pool';
import { getContractAddress } from '../contracts';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface AaveBorrowParams {
  token: string;
  amount: string;
  interestRateMode?: number; // 1 = stable, 2 = variable (default)
}

export function generateAaveBorrowCalldata(
  params: AaveBorrowParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const token = resolveToken(params.token, chainId);
  const amount = parseUnits(params.amount, token.decimals);
  const poolAddress = getContractAddress('aaveV3Pool', chainId);
  const rateMode = BigInt(params.interestRateMode ?? 2); // default variable

  const borrowData = encodeFunctionData({
    abi: aaveV3PoolAbi,
    functionName: 'borrow',
    args: [token.address, amount, rateMode, 0, userAddress],
  });

  // Borrow does not require approval (you're receiving tokens, not spending them)
  const steps: TransactionStep[] = [
    {
      to: poolAddress,
      data: borrowData,
      value: '0',
      label: `Borrow ${params.amount} ${token.symbol} from Aave`,
    },
  ];

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'borrow_aave',
      summary: `Borrow ${params.amount} ${token.symbol} from Aave V3`,
      details: [
        { label: 'Action', value: 'Aave V3 Borrow' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'Rate Mode', value: rateMode === 1n ? 'Stable' : 'Variable' },
        { label: 'Pool', value: shortenAddress(poolAddress) },
        { label: 'Steps', value: '1 (borrow)' },
      ],
      warnings: [
        'Ensure you have sufficient collateral deposited before borrowing.',
        'Borrowing accrues interest. Monitor your health factor to avoid liquidation.',
      ],
    },
  };
}
