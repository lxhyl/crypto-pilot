'use client';

import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect, useState, useRef } from 'react';
import type { PreparedTransaction } from '@/types';

/**
 * Transaction lifecycle states:
 *
 *   idle ──→ sending ──→ confirming ──→ confirmed
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
  | 'confirmed'       // Receipt received, transaction succeeded
  | 'wallet_rejected' // User rejected in wallet
  | 'send_error'      // Wallet/RPC error during send (gas estimation, insufficient funds, etc.)
  | 'chain_failed'    // Transaction reverted on-chain
  | 'cancelled';      // User clicked cancel in our UI

export function useTransaction() {
  const {
    sendTransaction,
    data: hash,
    isPending: isSendPending,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction();

  const {
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const [status, setStatus] = useState<TxStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastTxRef = useRef<PreparedTransaction | null>(null);

  // Derive status from wagmi states
  useEffect(() => {
    if (isSendPending) {
      setStatus('sending');
      setErrorMessage(null);
      return;
    }

    if (sendError) {
      const msg = parseSendError(sendError);
      setErrorMessage(msg.message);
      setStatus(msg.isUserRejection ? 'wallet_rejected' : 'send_error');
      return;
    }

    if (hash && isReceiptLoading) {
      setStatus('confirming');
      setErrorMessage(null);
      return;
    }

    if (hash && isReceiptSuccess) {
      setStatus('confirmed');
      setErrorMessage(null);
      return;
    }

    if (hash && isReceiptError) {
      setStatus('chain_failed');
      setErrorMessage(receiptError?.message ? parseChainError(receiptError.message) : 'Transaction reverted on-chain.');
      return;
    }
  }, [isSendPending, sendError, hash, isReceiptLoading, isReceiptSuccess, isReceiptError, receiptError]);

  const execute = useCallback(
    (tx: PreparedTransaction) => {
      lastTxRef.current = tx;
      setStatus('sending');
      setErrorMessage(null);
      resetSend(); // Clear any previous error state in wagmi
      sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value),
        chainId: tx.chainId,
      });
    },
    [sendTransaction, resetSend],
  );

  // Retry: reset state back to idle so user can click Sign & Send again
  const retry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    resetSend();
  }, [resetSend]);

  // Cancel: user doesn't want this transaction anymore
  const cancel = useCallback(() => {
    setStatus('cancelled');
    setErrorMessage(null);
    resetSend();
  }, [resetSend]);

  // Map our detailed status to the simpler display status for TxStatusBadge
  const displayStatus = mapToDisplayStatus(status);

  return {
    execute,
    retry,
    cancel,
    hash,
    status,
    displayStatus,
    errorMessage,
    lastTransaction: lastTxRef.current,
  };
}

// ── Error parsing helpers ──

function parseSendError(error: Error): { message: string; isUserRejection: boolean } {
  const msg = error.message || String(error);
  const msgLower = msg.toLowerCase();

  // User rejected in wallet
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

  // Insufficient funds
  if (
    msgLower.includes('insufficient funds') ||
    msgLower.includes('insufficient balance') ||
    msgLower.includes('exceeds balance')
  ) {
    return { message: 'Insufficient balance to complete this transaction (including gas fees).', isUserRejection: false };
  }

  // Gas estimation failed (simulation revert)
  if (
    msgLower.includes('gas required exceeds') ||
    msgLower.includes('execution reverted') ||
    msgLower.includes('estimategas') ||
    msgLower.includes('call revert') ||
    msgLower.includes('unpredictable_gas_limit')
  ) {
    // Try to extract the revert reason
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

  // Nonce issues
  if (msgLower.includes('nonce')) {
    return { message: 'Nonce conflict. You may have a pending transaction. Try resetting your wallet activity.', isUserRejection: false };
  }

  // Network / RPC errors
  if (
    msgLower.includes('network') ||
    msgLower.includes('timeout') ||
    msgLower.includes('disconnected') ||
    msgLower.includes('failed to fetch')
  ) {
    return { message: 'Network error. Check your internet connection and try again.', isUserRejection: false };
  }

  // Chain not supported or wrong chain
  if (msgLower.includes('chain') && (msgLower.includes('unsupported') || msgLower.includes('mismatch'))) {
    return { message: 'Please switch to the correct network in your wallet.', isUserRejection: false };
  }

  // Fallback: truncate long error messages
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
