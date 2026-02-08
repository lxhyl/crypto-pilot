import { encodeFunctionData } from 'viem';
import { merkleDistributorAbi } from '../abis/merkle-distributor';
import { shortenAddress } from '@/lib/utils';
import type { PreparedTransaction, TransactionStep } from '@/types';

interface ClaimMerkleParams {
  contractAddress: string;  // The merkle distributor contract
  index: string;            // Claim index
  amount: string;           // Amount in wei (raw)
  proof: string[];          // Merkle proof bytes32[]
  tokenSymbol?: string;     // Optional: symbol for display
}

export function generateClaimMerkleCalldata(
  params: ClaimMerkleParams,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  const contractAddress = params.contractAddress as `0x${string}`;
  const index = BigInt(params.index);
  const amount = BigInt(params.amount);
  // proof can come as array or comma-separated string from AI
  const rawProof: string[] | string = params.proof as string[] | string;
  const proof: `0x${string}`[] = Array.isArray(rawProof)
    ? rawProof.map(s => s as `0x${string}`)
    : rawProof.split(',').map(s => s.trim() as `0x${string}`);
  const tokenSymbol = params.tokenSymbol ?? 'tokens';

  const claimData = encodeFunctionData({
    abi: merkleDistributorAbi,
    functionName: 'claim',
    args: [index, userAddress, amount, proof],
  });

  const steps: TransactionStep[] = [
    {
      to: contractAddress,
      data: claimData,
      value: '0',
      label: `Claim ${tokenSymbol} from Merkle distributor`,
    },
  ];

  return {
    steps,
    chainId,
    humanReadable: {
      type: 'claim_merkle',
      summary: `Claim ${tokenSymbol} from Merkle distributor`,
      details: [
        { label: 'Action', value: 'Merkle Claim' },
        { label: 'Contract', value: shortenAddress(contractAddress) },
        { label: 'Index', value: params.index },
        { label: 'Amount (wei)', value: params.amount },
        { label: 'Proof Length', value: `${proof.length} nodes` },
        { label: 'Steps', value: '1 (claim)' },
      ],
      warnings: [
        'Verify the merkle distributor contract address before claiming.',
        'Each claim index can only be claimed once.',
      ],
    },
  };
}
