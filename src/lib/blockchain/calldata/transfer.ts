import { encodeFunctionData, parseUnits } from 'viem';
import { erc20Abi } from '../abis/erc20';
import { resolveToken, isNativeETH } from '../tokens';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction } from '@/types';

interface TransferParams {
  token: string;
  to: string;
  amount: string;
}

export function generateTransferCalldata(
  params: TransferParams,
  chainId: number,
): PreparedTransaction {
  const toAddress = params.to as `0x${string}`;

  // Native ETH transfer
  if (isNativeETH(params.token)) {
    const amount = parseUnits(params.amount, 18);
    return {
      to: toAddress,
      data: '0x',
      value: amount.toString(),
      chainId,
      humanReadable: {
        type: 'transfer',
        summary: `Transfer ${params.amount} ETH to ${shortenAddress(toAddress)}`,
        details: [
          { label: 'Action', value: 'Native ETH Transfer' },
          { label: 'Amount', value: `${params.amount} ETH` },
          { label: 'To', value: toAddress },
        ],
        warnings: ['Double-check the recipient address before confirming.'],
      },
    };
  }

  // ERC20 transfer
  const token = resolveToken(params.token, chainId);
  const amount = parseUnits(params.amount, token.decimals);

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [toAddress, amount],
  });

  return {
    to: token.address,
    data,
    value: '0',
    chainId,
    humanReadable: {
      type: 'transfer',
      summary: `Transfer ${params.amount} ${token.symbol} to ${shortenAddress(toAddress)}`,
      details: [
        { label: 'Action', value: 'ERC20 Transfer' },
        { label: 'Token', value: `${token.symbol} (${shortenAddress(token.address)})` },
        { label: 'Amount', value: `${params.amount} ${token.symbol}` },
        { label: 'To', value: toAddress },
      ],
      warnings: ['Double-check the recipient address before confirming.'],
    },
  };
}
