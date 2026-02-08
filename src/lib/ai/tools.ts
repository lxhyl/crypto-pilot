export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      default?: unknown;
    }>;
    required: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'swap_tokens',
    description: 'Swap one token for another using Uniswap V3. Use when the user wants to exchange, swap, or trade tokens.',
    parameters: {
      type: 'object',
      properties: {
        tokenIn: { type: 'string', description: 'Symbol of the input token (e.g., "ETH", "USDC", "WBTC")' },
        tokenOut: { type: 'string', description: 'Symbol of the output token (e.g., "USDC", "ETH", "DAI")' },
        amount: { type: 'string', description: 'Amount of tokenIn to swap in human-readable format (e.g., "1.5", "100")' },
        slippage: { type: 'number', description: 'Slippage tolerance as percentage. Default 0.5', default: 0.5 },
      },
      required: ['tokenIn', 'tokenOut', 'amount'],
    },
  },
  {
    name: 'transfer_token',
    description: 'Transfer tokens (ETH or ERC20) to another address. Use when the user wants to send tokens to someone.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to transfer (e.g., "ETH", "USDC")' },
        to: { type: 'string', description: 'Recipient wallet address (0x...)' },
        amount: { type: 'string', description: 'Amount to transfer in human-readable format' },
      },
      required: ['token', 'to', 'amount'],
    },
  },
  {
    name: 'approve_token',
    description: 'Approve a spender contract to use your ERC20 tokens. Use before swapping or supplying to protocols.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to approve' },
        spender: { type: 'string', description: 'Address of the spender contract (0x...)' },
        amount: { type: 'string', description: 'Amount to approve. Use "max" for unlimited approval.' },
      },
      required: ['token', 'spender'],
    },
  },
  {
    name: 'supply_aave',
    description: 'Supply (deposit) tokens to Aave V3 lending pool to earn interest. Use when user wants to lend, deposit, or supply tokens to Aave.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to supply (e.g., "USDC", "WETH")' },
        amount: { type: 'string', description: 'Amount to supply in human-readable format' },
      },
      required: ['token', 'amount'],
    },
  },
  {
    name: 'borrow_aave',
    description: 'Borrow tokens from Aave V3 against your collateral. Use when user wants to borrow from Aave.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to borrow' },
        amount: { type: 'string', description: 'Amount to borrow in human-readable format' },
        interestRateMode: { type: 'number', description: 'Interest rate mode: 1 for stable, 2 for variable. Default is 2 (variable).', default: 2 },
      },
      required: ['token', 'amount'],
    },
  },
  {
    name: 'repay_aave',
    description: 'Repay borrowed tokens to Aave V3. Use when user wants to repay their Aave debt.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to repay' },
        amount: { type: 'string', description: 'Amount to repay in human-readable format' },
        interestRateMode: { type: 'number', description: 'Interest rate mode of the debt: 1 for stable, 2 for variable. Default is 2.', default: 2 },
      },
      required: ['token', 'amount'],
    },
  },
  {
    name: 'withdraw_aave',
    description: 'Withdraw supplied tokens from Aave V3. Use when user wants to withdraw from Aave lending pool.',
    parameters: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Symbol of the token to withdraw' },
        amount: { type: 'string', description: 'Amount to withdraw in human-readable format' },
      },
      required: ['token', 'amount'],
    },
  },
];

// Convert to Anthropic tool format
export function toAnthropicTools() {
  return TOOL_DEFINITIONS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object' as const,
      properties: tool.parameters.properties,
      required: tool.parameters.required,
    },
  }));
}

// Convert to OpenAI function format
export function toOpenAIFunctions() {
  return TOOL_DEFINITIONS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}

// Map tool names to intent types
export function toolNameToIntent(name: string): string {
  const map: Record<string, string> = {
    swap_tokens: 'swap',
    transfer_token: 'transfer',
    approve_token: 'approve',
    supply_aave: 'supply_aave',
    borrow_aave: 'borrow_aave',
    repay_aave: 'repay_aave',
    withdraw_aave: 'withdraw_aave',
  };
  return map[name] || name;
}
