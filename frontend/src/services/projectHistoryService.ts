// src/services/projectHistoryService.ts
import { apiFetch } from "./http";

export interface ProjectHistory {
  id: number;
  projetId: number;
  projetTitre: string;
  entrepriseNom: string;
  entrepriseAvatar?: string;
  dateDebut: string;
  dateFin?: string;
  duree?: string;
  budget: number;
  note?: number;
  commentaireEntreprise?: string;
  status: "ACCEPTEE" | "EN_COURS" | "REJETEE" | "EN_ATTENTE";
  competences: string[];
}

export interface ProjectHistoryStats {
  totalProjets: number;
  projetsTermines: number;
  noteMoyenne: number;
  totalGagne: number;
}

export const projectHistoryService = {
  getHistorique: (freelancerId: number, status?: string): Promise<ProjectHistory[]> => {
    const params = status ? `?status=${status}` : "";
    
    return apiFetch(`/freelancer/candidatures/${freelancerId}/projets-historique${params}`);
  },

  getStats: (freelancerId: number): Promise<ProjectHistoryStats> =>
    apiFetch(`/freelancer/candidatures/${freelancerId}/stats`),
};