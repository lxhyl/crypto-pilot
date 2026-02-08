export type IntentType =
  | 'swap'
  | 'transfer'
  | 'approve'
  | 'supply_aave'
  | 'borrow_aave'
  | 'repay_aave'
  | 'withdraw_aave';

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

export interface PreparedTransaction {
  to: string;
  data: string;
  value: string; // bigint as string for serialization
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
