import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { erc20Abi } from '../abis/erc20';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface ApproveParams {
  token: string;
  spender: string;
  amount?: string; // if omitted, approve max
}

export function generateApproveCalldata(
  params: ApproveParams,
  chainId: number,
): PreparedTransaction {
  const token = resolveToken(params.token, chainId);
  const spenderAddress = params.spender as `0x${string}`;
  const isMax = !params.amount || params.amount === 'max' || params.amount === 'unlimited';
  const amount = isMax ? maxUint256 : parseUnits(params.amount!, token.decimals);

  const step = buildApproveStep(token.address, token.symbol, spenderAddress, amount, isMax);

  return {
    steps: [step],
    chainId,
    humanReadable: {
      type: 'approve',
      summary: `Approve ${isMax ? 'unlimited' : params.amount} ${token.symbol} for ${shortenAddress(spenderAddress)}`,
      details: [
        { label: 'Action', value: 'ERC20 Approve' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: isMax ? 'Unlimited (MaxUint256)' : `${params.amount} ${token.symbol}` },
        { label: 'Spender', value: spenderAddress },
      ],
      warnings: isMax
        ? ['Unlimited approval grants full access to your tokens for this contract.']
        : [],
    },
  };
}

/**
 * Build a single approve step. Reused by other generators
 * to prepend approval when needed.
 *
 * @param minRequired - The minimum allowance the subsequent operation needs.
 *   If the user's on-chain allowance >= minRequired, this step is skipped at runtime.
 */
export function buildApproveStep(
  tokenAddress: `0x${string}`,
  tokenSymbol: string,
  spender: `0x${string}`,
  amount: bigint,
  isMax: boolean,
  minRequired?: bigint,
): TransactionStep {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  });

  return {
    to: tokenAddress,
    data,
    value: '0',
    label: `Approve ${isMax ? '' : 'spending '}${tokenSymbol}${isMax ? '' : ''}`,
    approveCheck: {
      token: tokenAddress,
      spender,
      minAmount: (minRequired ?? amount).toString(),
    },
  };
}
