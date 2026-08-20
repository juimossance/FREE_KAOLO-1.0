// src/services/candidatureEntrepriseService.ts
import { apiFetch } from "./http";

export type StatusCandidature =
  | "EN_ATTENTE"
  | "ACCEPTEE"
  |  "REJETEE"
  | "EN_COURS";
    

export interface CandidatureEntreprise {
  id: number;

  projetId: number;
  projetTitre: string;
  projetBudget: number | null;
 freelancerId: number;
  freelancerUserId: number;
  freelancerNom: string | null;
  freelancerPrenom: string | null;
  freelancerSpecialite: string | null;

  freelancerRating: number | null;
  freelancerNbAvis: number | null;

  freelancerCompetences: string[];

  status: StatusCandidature;

  date: string;

  montantFinal: number | null;

  commentaireEntreprise: string | null;

  entrepriseNom: string | null;

  dateFin: string | null;

  note: number | null;
}
export const candidatureEntrepriseService = {
  // Toutes les candidatures d'une entreprise (tous projets)
  getAll: (entrepriseId: number): Promise<CandidatureEntreprise[]> =>
    apiFetch(`/entreprise/${entrepriseId}`),

  // Candidatures d'un projet spécifique
  getByProjet: (projetId: number): Promise<CandidatureEntreprise[]> =>
    apiFetch(`/projets/projets/${projetId}/candidatures`),

  // Changer le statut
  changerStatut: (candidatureId: number, statut: string): Promise<CandidatureEntreprise> =>
    apiFetch(`/projets/candidatures/${candidatureId}/statut?statut=${statut}`, {
      method: "PUT",
    }),

  // Confirmer la sélection de plusieurs candidats
  confirmerSelection: (candidatureIds: number[]): Promise<void> =>
    apiFetch(`/projets/candidatures/confirmer`, {
      method: "POST",
      body: JSON.stringify({ candidatureIds }),
    }),
};
export async function getCandidaturesEntreprise() {

  return apiFetch<CandidatureEntreprise[]>(
    "/entreprise/candidatures"
  );
}


export async function getCandidaturesByStatus(
  status: StatusCandidature
) {

  return apiFetch<CandidatureEntreprise[]>(
    `/entreprise/candidatures/status/${status}`
  );
}


export async function changerStatusCandidature(
  candidatureId: number,
  status: StatusCandidature
) {

  return apiFetch<CandidatureEntreprise>(
    `/entreprise/candidatures/${candidatureId}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    }
  );
}