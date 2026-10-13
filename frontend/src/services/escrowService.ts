import { apiFetch } from "./http";

export type StatutEscrow =
  | "EN_ATTENTE"
  | "BLOQUE"
  | "LIBERE"
  | "RETIRE"
  | "ECHEC"
  | "REMBOURSE";

export interface EscrowTransactionDto {
  id: number;
  projetTitre: string;
  montant: number;
  frais: number;
  typeOperation: "DEPOT" | "LIBERATION" | "RETRAIT";
  statut: StatutEscrow;
  operateur: string;
  createdAt: string;
}

export interface SoldeDto {
  soldeDisponible: number;
  soldeEnAttente: number;
}

export interface DepotRequest {
  projetId: number;
  montant: number;
  telephone: string;
  operateur: string;
}

export interface RetraitRequest {
  montant: number;
  telephone: string;
  operateur: string;
}

export const escrowService = {
  initierDepot: (
    projetId: number,
    montant: number,
    telephone: string,
    operateur: string
  ) =>
    apiFetch<EscrowTransactionDto>("/paiements/depot", {
      method: "POST",
      body: JSON.stringify({
        projetId,
        montant,
        telephone,
        operateur,
      } satisfies DepotRequest),
    }),

  libererFonds: (transactionId: number) =>
    apiFetch<EscrowTransactionDto>(`/paiements/${transactionId}/liberer`, {
      method: "POST",
    }),

  initierRetrait: (montant: number, telephone: string, operateur: string) =>
    apiFetch<EscrowTransactionDto>("/paiements/retrait", {
      method: "POST",
      body: JSON.stringify({
        montant,
        telephone,
        operateur,
      } satisfies RetraitRequest),
    }),

  getSolde: () => apiFetch<SoldeDto>("/paiements/solde"),

  getMesTransactions: () =>
    apiFetch<EscrowTransactionDto[]>("/paiements/mes-transactions"),

  verifierStatut: (transactionId: number) =>
    apiFetch<EscrowTransactionDto>(`/paiements/${transactionId}/statut`),
};