// src/services/recruitmentService.ts
import { apiFetch } from "./http";

export interface Recruitment {
  id: number;
  candidatureId: number;
  projetId: number;
  projetTitre: string;
  projetCategorie: string;
  freelancerNom: string;
  freelancerPrenom: string;
  freelancerAvatar?: string;
  dateDebut: string;
  dateFin?: string;
  montant: number;
  note?: number;
  commentaire?: string;
  status: "ACCEPTEE" | "EN_COURS" | "EN_ATTENTE" | "REJETEE";
}

export interface RecruitmentStats {
  totalRecrutements: number;
  projetsTermines: number;
  noteMoyenneDonnee: number;
  totalDepense: number;
}

export const recruitmentService = {
  getHistorique: (): Promise<Recruitment[]> =>
    apiFetch(`/entreprise/me/recrutements`),

  getStats: (): Promise<RecruitmentStats> =>
    apiFetch(`/entreprise/me/recrutements/stats`),
};