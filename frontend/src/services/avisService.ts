import { apiFetch } from "./http";

export interface Avis {
  note: number;
  commentaire?: string;
  projetTitre?: string;
  entrepriseNom?: string;
  date?: string;
}

export const avisService = {
  getAvis: (freelancerId: number): Promise<Avis[]> =>
    apiFetch(`/freelancer/candidatures/${freelancerId}/avis`),
};