import type { IntentType, PreparedTransaction } from '@/types';
import { generateSwapCalldata } from './swap';
import { generateTransferCalldata } from './transfer';
import { generateApproveCalldata } from './approve';
import { generateAaveSupplyCalldata } from './aave-supply';
import { generateAaveBorrowCalldata } from './aave-borrow';
import { generateAaveRepayCalldata } from './aave-repay';
import { generateAaveWithdrawCalldata } from './aave-withdraw';

export function generateCalldata(
  intent: IntentType,
  params: Record<string, unknown>,
  chainId: number,
  userAddress: `0x${string}`,
): PreparedTransaction {
  switch (intent) {
    case 'swap':
      return generateSwapCalldata(
        params as { tokenIn: string; tokenOut: string; amount: string; slippage?: number },
        chainId,
        userAddress,
      );
    case 'transfer':
      return generateTransferCalldata(
        params as { token: string; to: string; amount: string },
        chainId,
      );
    case 'approve':
      return generateApproveCalldata(
        params as { token: string; spender: string; amount?: string },
        chainId,
      );
    case 'supply_aave':
      return generateAaveSupplyCalldata(
        params as { token: string; amount: string },
        chainId,
        userAddress,
      );
    case 'borrow_aave':
      return generateAaveBorrowCalldata(
        params as { token: string; amount: string; interestRateMode?: number },
        chainId,
        userAddress,
      );
    case 'repay_aave':
      return generateAaveRepayCalldata(
        params as { token: string; amount: string; interestRateMode?: number },
        chainId,
        userAddress,
      );
    case 'withdraw_aave':
      return generateAaveWithdrawCalldata(
        params as { token: string; amount: string },
        chainId,
        userAddress,
      );
    default:
      throw new Error(`Unknown intent: ${intent}`);
  }
}
