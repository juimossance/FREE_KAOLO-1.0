// useEscrowPolling.ts
import { useEffect, useRef, useState } from "react";
import { escrowService, type EscrowTransactionDto } from "../services/escrowService";

export function useEscrowPolling(transactionId: number | null) {
  const [transaction, setTransaction] = useState<EscrowTransactionDto | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!transactionId) return;

    const poll = async () => {
      const tx = await escrowService.verifierStatut(transactionId);
      setTransaction(tx);
      if (tx.statut !== "EN_ATTENTE") {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      }
    };

    poll();
    intervalRef.current = window.setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [transactionId]);

  return transaction;
}