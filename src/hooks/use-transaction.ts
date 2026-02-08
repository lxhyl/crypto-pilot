'use client';

import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import type { PreparedTransaction } from '@/types';

type TxStatus = 'idle' | 'pending' | 'confirmed' | 'failed' | 'rejected';

export function useTransaction() {
  const { sendTransaction, data: hash, isPending, error, reset } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const [status, setStatus] = useState<TxStatus>('idle');

  useEffect(() => {
    if (isPending) setStatus('pending');
    else if (isConfirming) setStatus('pending');
    else if (isSuccess) setStatus('confirmed');
    else if (isError || error) setStatus('failed');
  }, [isPending, isConfirming, isSuccess, isError, error]);

  const execute = useCallback(
    (tx: PreparedTransaction) => {
      setStatus('pending');
      sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value),
        chainId: tx.chainId,
      });
    },
    [sendTransaction],
  );

  const reject = useCallback(() => {
    setStatus('rejected');
    reset();
  }, [reset]);

  const resetTx = useCallback(() => {
    setStatus('idle');
    reset();
  }, [reset]);

  return { execute, reject, resetTx, hash, status, isPending, isConfirming };
}
