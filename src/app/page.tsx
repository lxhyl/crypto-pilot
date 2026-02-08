'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { ChatContainer } from '@/components/chat/chat-container';
import { OperationHistory } from '@/components/history/operation-history';
import type { OperationRecord } from '@/types';

export default function Home() {
  const [operations, setOperations] = useState<OperationRecord[]>([]);

  const handleOperationAdded = (op: OperationRecord) => {
    setOperations((prev) => [op, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <ChatContainer
          className="flex-1"
          onOperationAdded={handleOperationAdded}
        />
        <OperationHistory
          className="w-80 hidden lg:flex"
          operations={operations}
        />
      </main>
    </div>
  );
}
