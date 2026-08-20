import { apiFetch } from "./http";

export interface Transaction {
  id: number;
  type: "in" | "out";
  label: string;
  from: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  invoice?: string;
}

export interface Solde {
  disponible: number;
  enAttente: number;
  totalGagne: number;
}

export interface RetraitDto {
  montant: number;
  methode: string;
  reference: string;
}

export const paiementService = {
  getSolde: (userId: number) =>
    apiFetch<Solde>(`/freelancer/${userId}/solde`),
  getTransactions: (userId: number, search?: string) =>
    apiFetch<Transaction[]>(
      `/freelancer/${userId}/transactions${search ? `?search=${search}` : ""}`
    ),
  getFactures: (userId: number) =>
    apiFetch<Transaction[]>(`/freelancer/${userId}/factures`),
  getGainsMensuels: (userId: number) =>
    apiFetch<{ month: string; amount: number }[]>(
      `/freelancer/${userId}/gains-mensuels`
    ),
  demanderRetrait: (userId: number, dto: RetraitDto) =>
    apiFetch<{ message: string; soldeRestant: number }>(
      `/freelancer/${userId}/retrait`,
      { method: "POST", body: JSON.stringify(dto) }
    ),
};