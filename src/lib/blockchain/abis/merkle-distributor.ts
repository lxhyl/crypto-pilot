// Standard Merkle distributor ABI used by most airdrop/reward claim contracts
export const merkleDistributorAbi = [
  {
    inputs: [
      { name: 'index', type: 'uint256' },
      { name: 'account', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'isClaimed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
