'use client';

import { useWalletClient, usePublicClient } from 'wagmi';
import { useCallback, useState, useRef } from 'react';
import type { PreparedTransaction, TransactionStep } from '@/types';

/**
 * Transaction lifecycle states:
 *
 *   idle ──→ sending ──→ confirming ──→ (next step or confirmed)
 *               │             │
 *               ▼             ▼
 *           wallet_rejected  chain_failed
 *           send_error
 *               │             │
 *               ▼             ▼
 *             idle (retry)  idle (retry)
 *
 *   Any state ──→ cancelled (user clicks X)
 */
export type TxStatus =
  | 'idle'            // Ready to sign, show Sign & Send
  | 'sending'         // Wallet popup is open, waiting for user to sign
  | 'confirming'      // Signed, submitted to chain, waiting for receipt
  | 'confirmed'       // All steps completed successfully
  | 'wallet_rejected' // User rejected in wallet
  | 'send_error'      // Wallet/RPC error during send
  | 'chain_failed'    // Transaction reverted on-chain
  | 'cancelled';      // User clicked cancel in our UI

interface StepProgress {
  currentStep: number;  // 0-indexed
  totalSteps: number;
  currentLabel: string;
  completedHashes: string[];
}

export function useTransaction() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [status, setStatus] = useState<TxStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [stepProgress, setStepProgress] = useState<StepProgress | null>(null);
  const lastTxRef = useRef<PreparedTransaction | null>(null);
  const abortRef = useRef(false);

  const execute = useCallback(
    async (tx: PreparedTransaction) => {
      if (!walletClient || !publicClient) {
        setErrorMessage('Wallet not connected. Please connect your wallet first.');
        setStatus('send_error');
        return;
      }

      lastTxRef.current = tx;
      abortRef.current = false;
      setErrorMessage(null);
      setHash(undefined);

      const steps = tx.steps;
      const completedHashes: string[] = [];

      for (let i = 0; i < steps.length; i++) {
        if (abortRef.current) {
          setStatus('cancelled');
          return;
        }

        const step = steps[i];
        setStepProgress({
          currentStep: i,
          totalSteps: steps.length,
          currentLabel: step.label,
          completedHashes: [...completedHashes],
        });

        // Step: sending
        setStatus('sending');

        let txHash: `0x${string}`;
        try {
          txHash = await walletClient.sendTransaction({
            to: step.to as `0x${string}`,
            data: (step.data || '0x') as `0x${string}`,
            value: BigInt(step.value || '0'),
            chain: undefined, // use wallet's current chain
          });
        } catch (err) {
          const parsed = parseSendError(err as Error);
          setErrorMessage(parsed.message);
          setStatus(parsed.isUserRejection ? 'wallet_rejected' : 'send_error');
          return;
        }

        setHash(txHash);
        completedHashes.push(txHash);

        // Step: confirming
        setStatus('confirming');
        setStepProgress({
          currentStep: i,
          totalSteps: steps.length,
          currentLabel: step.label,
          completedHashes: [...completedHashes],
        });

        try {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          if (receipt.status === 'reverted') {
            setErrorMessage(`Step ${i + 1}/${steps.length} reverted on-chain: "${step.label}"`);
            setStatus('chain_failed');
            return;
          }
        } catch (err) {
          setErrorMessage(parseChainError((err as Error).message));
          setStatus('chain_failed');
          return;
        }
      }

      // All steps completed
      setStepProgress({
        currentStep: steps.length - 1,
        totalSteps: steps.length,
        currentLabel: 'All steps completed',
        completedHashes,
      });
      setStatus('confirmed');
    },
    [walletClient, publicClient],
  );

  const retry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setHash(undefined);
    setStepProgress(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setStatus('cancelled');
    setErrorMessage(null);
  }, []);

  const displayStatus = mapToDisplayStatus(status);

  return {
    execute,
    retry,
    cancel,
    hash,
    status,
    displayStatus,
    errorMessage,
    stepProgress,
    lastTransaction: lastTxRef.current,
  };
}

// ── Error parsing helpers ──

function parseSendError(error: Error): { message: string; isUserRejection: boolean } {
  const msg = error.message || String(error);
  const msgLower = msg.toLowerCase();

  if (
    msgLower.includes('user rejected') ||
    msgLower.includes('user denied') ||
    msgLower.includes('rejected the request') ||
    msgLower.includes('action_rejected') ||
    msgLower.includes('user refused') ||
    msgLower.includes('cancelled') ||
    msgLower.includes('declined')
  ) {
    return { message: 'You rejected the transaction in your wallet.', isUserRejection: true };
  }

  if (
    msgLower.includes('insufficient funds') ||
    msgLower.includes('insufficient balance') ||
    msgLower.includes('exceeds balance')
  ) {
    return { message: 'Insufficient balance to complete this transaction (including gas fees).', isUserRejection: false };
  }

  if (
    msgLower.includes('gas required exceeds') ||
    msgLower.includes('execution reverted') ||
    msgLower.includes('estimategas') ||
    msgLower.includes('call revert') ||
    msgLower.includes('unpredictable_gas_limit')
  ) {
    const revertMatch = msg.match(/reason:\s*(.+?)(?:\n|$)/i) ||
                        msg.match(/reverted with reason string '(.+?)'/i) ||
                        msg.match(/execution reverted:\s*(.+?)(?:\n|$)/i);
    const reason = revertMatch?.[1]?.trim();
    return {
      message: reason
        ? `Transaction would fail: ${reason}`
        : 'Transaction simulation failed. The contract may revert with the current parameters.',
      isUserRejection: false,
    };
  }

  if (msgLower.includes('nonce')) {
    return { message: 'Nonce conflict. You may have a pending transaction. Try resetting your wallet activity.', isUserRejection: false };
  }

  if (
    msgLower.includes('network') ||
    msgLower.includes('timeout') ||
    msgLower.includes('disconnected') ||
    msgLower.includes('failed to fetch')
  ) {
    return { message: 'Network error. Check your internet connection and try again.', isUserRejection: false };
  }

  if (msgLower.includes('chain') && (msgLower.includes('unsupported') || msgLower.includes('mismatch'))) {
    return { message: 'Please switch to the correct network in your wallet.', isUserRejection: false };
  }

  const truncated = msg.length > 150 ? msg.slice(0, 150) + '\u2026' : msg;
  return { message: `Transaction failed: ${truncated}`, isUserRejection: false };
}

function parseChainError(message: string): string {
  const msgLower = message.toLowerCase();
  if (msgLower.includes('reverted') || msgLower.includes('revert')) {
    return 'Transaction reverted on-chain. The contract rejected this operation.';
  }
  if (msgLower.includes('out of gas')) {
    return 'Transaction ran out of gas during execution.';
  }
  return 'Transaction failed on-chain.';
}

function mapToDisplayStatus(status: TxStatus): 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected' {
  switch (status) {
    case 'idle': return 'idle';
    case 'sending':
    case 'confirming': return 'pending';
    case 'confirmed': return 'confirmed';
    case 'wallet_rejected':
    case 'cancelled': return 'rejected';
    case 'send_error':
    case 'chain_failed': return 'failed';
    default: return 'idle';
  }
}
