export type IntentType =
  | 'swap'
  | 'transfer'
  | 'approve'
  | 'supply_aave'
  | 'borrow_aave'
  | 'repay_aave'
  | 'withdraw_aave'
  | 'add_liquidity_v3'
  | 'add_liquidity_v4'
  | 'claim_merkle';

export interface ToolCallResult {
  intent: IntentType;
  params: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallResult[];
  transaction?: PreparedTransaction | null;
  timestamp: number;
}

/**
 * A single on-chain call.
 * A PreparedTransaction may contain multiple steps (e.g. approve + supply).
 */
export interface TransactionStep {
  to: string;
  data: string;
  value: string;
  label: string; // e.g. "Approve USDC for Aave Pool"
  /**
   * If present, this step is an ERC20 approve.
   * The transaction hook will check on-chain allowance first
   * and skip this step if the user already has sufficient approval.
   */
  approveCheck?: {
    token: `0x${string}`;
    spender: `0x${string}`;
    minAmount: string; // bigint as string
  };
}

/**
 * A prepared multi-step transaction.
 * Each step is a separate on-chain tx sent sequentially.
 * The user clicks "Sign & Send" once, and we auto-execute all steps.
 */
export interface PreparedTransaction {
  steps: TransactionStep[];
  chainId: number;
  humanReadable: HumanReadableOperation;
}

export interface HumanReadableOperation {
  type: IntentType;
  summary: string;
  details: OperationDetail[];
  warnings: string[];
}

export interface OperationDetail {
  label: string;
  value: string;
}

export interface AIResponse {
  message: string;
  toolCalls: ToolCallResult[];
}

export interface OperationRecord {
  id: string;
  intent: IntentType;
  summary: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'rejected';
  chainId: number;
  timestamp: number;
}
