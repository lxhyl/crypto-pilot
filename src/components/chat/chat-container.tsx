'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useChat } from '@/hooks/use-chat';
import { useTransaction } from '@/hooks/use-transaction';
import { useOperationHistory } from '@/hooks/use-operation-history';
import type { IntentType, OperationRecord } from '@/types';

interface ChatContainerProps {
  className?: string;
  onOperationAdded?: (op: OperationRecord) => void;
  onOperationUpdated?: (id: string, updates: Partial<OperationRecord>) => void;
}

export function ChatContainer({ className, onOperationAdded, onOperationUpdated }: ChatContainerProps) {
  const { messages, isLoading, sendMessage } = useChat();
  const { execute, reject, resetTx, hash, status: txStatus } = useTransaction();
  const { addOperation, updateOperation } = useOperationHistory();

  // Find the latest message with a transaction
  const activeTxMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].transaction) return messages[i];
    }
    return null;
  }, [messages]);

  const handleConfirm = useCallback(() => {
    if (!activeTxMessage?.transaction) return;
    const tx = activeTxMessage.transaction;
    execute(tx);

    const opId = addOperation({
      intent: tx.humanReadable.type as IntentType,
      summary: tx.humanReadable.summary,
      chainId: tx.chainId,
      status: 'pending',
    });

    // Notify parent
    onOperationAdded?.({
      id: opId,
      intent: tx.humanReadable.type as IntentType,
      summary: tx.humanReadable.summary,
      chainId: tx.chainId,
      status: 'pending',
      timestamp: Date.now(),
    });
  }, [activeTxMessage, execute, addOperation, onOperationAdded]);

  const handleReject = useCallback(() => {
    reject();
  }, [reject]);

  // Track tx status changes for history
  useEffect(() => {
    if (hash && txStatus === 'confirmed') {
      // In a real app, update the operation record here
    }
  }, [hash, txStatus]);

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onConfirmTx={handleConfirm}
        onRejectTx={handleReject}
        txHash={hash}
        txStatus={txStatus}
        activeTxMessageId={activeTxMessage?.id}
      />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
