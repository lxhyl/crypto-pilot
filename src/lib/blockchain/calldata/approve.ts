import { encodeFunctionData, parseUnits, maxUint256 } from 'viem';
import { erc20Abi } from '../abis/erc20';
import { resolveToken } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

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

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spenderAddress, amount],
  });

  return {
    to: token.address,
    data,
    value: '0',
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
