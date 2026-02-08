// Uniswap V4 PositionManager uses a multicall-style "modifyLiquidities" pattern
// with encoded Actions. We define the key entry-point ABI.
export const uniswapV4PositionManagerAbi = [
  {
    inputs: [
      { name: 'unlockData', type: 'bytes' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'modifyLiquidities',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'actions', type: 'bytes' },
      { name: 'params', type: 'bytes[]' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;
