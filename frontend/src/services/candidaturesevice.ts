import { apiFetch } from "./http";

export interface Candidature {
  id: number;
  projet: string;
  entreprise: string;
  avatar: string;
  datePostulation: string;
  budget: string;
  deadline: string;
  statut: "En attente" | "Acceptée" | "En cours" | "Rejetée" | "Terminée";
  lettreMotivation: string;
  tags: string[];
}

export const candidatureService = {
  getAll: (userId: number) =>
    apiFetch<Candidature[]>(`/freelancer/candidatures/${userId}`),
  getRecent: (userId: number) =>
    apiFetch<Candidature[]>(`/freelancer/candidatures/recentes/${userId}`),
  getHistorique: (userId: number, status?: string) =>
    apiFetch<Candidature[]>(
      `/freelancer/${userId}/projets-historique${status ? `?status=${status}` : ""}`
    ),
  postuler: (freelancerId: number, projetId: number) =>
    apiFetch<Candidature>(
      `/freelancer/candidatures/postuler/${freelancerId}/${projetId}`,
      { method: "POST" }
    ),
};