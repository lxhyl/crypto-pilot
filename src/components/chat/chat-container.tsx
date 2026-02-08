'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useChat } from '@/hooks/use-chat';
import { useTransaction } from '@/hooks/use-transaction';
import type { IntentType, OperationRecord } from '@/types';

interface ChatContainerProps {
  className?: string;
  onOperationAdded?: (op: OperationRecord) => void;
}

export function ChatContainer({ className, onOperationAdded }: ChatContainerProps) {
  const { messages, isLoading, sendMessage } = useChat();
  const { execute, reject, hash, status: txStatus } = useTransaction();

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

    onOperationAdded?.({
      id: crypto.randomUUID(),
      intent: tx.humanReadable.type as IntentType,
      summary: tx.humanReadable.summary,
      chainId: tx.chainId,
      status: 'pending',
      timestamp: Date.now(),
    });
  }, [activeTxMessage, execute, onOperationAdded]);

  const handleReject = useCallback(() => {
    reject();
  }, [reject]);

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSendExample={sendMessage}
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
