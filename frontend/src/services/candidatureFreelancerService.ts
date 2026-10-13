// src/services/candidatureFreelancerService.ts
import { apiFetch } from "./http";

export interface CandidatureFreelancer {
  id: number;
  projetId: number;
  projetTitre: string;
  entrepriseNom: string;
  status: "EN_ATTENTE" | "ACCEPTEE" | "EN_COURS" | "REJETEE";
  date: string;
  projetBudget: number;
  deadline?: string;
  lettreDemotivation?: string;
  competences?: string[];
}

export const candidatureFreelancerService = {
  getAll: (freelancerId: number): Promise<CandidatureFreelancer[]> =>
    apiFetch(`/freelancer/candidatures/${freelancerId}`),
  

  retirer: (candidatureId: number): Promise<void> =>
    apiFetch(`/freelancer/candidatures/${candidatureId}`, { method: "DELETE" }),
};