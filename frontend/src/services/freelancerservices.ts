// src/services/freelancerService.ts

import { apiFetch } from "./http";

export interface FreelancerProfil {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  ville: string;
  pays: string;
  specialite: string;
  tarifJournalier: number;
  description: string;
  github?: string;
  linkedin?: string;
  siteweb?: string;
  disponibilite: string;
  experience: string | number;
  competence: string[];
  completionPourcentage: number;
  langues?: string;
  photoUrl?: string;
}

export const freelancerService = {

  // Profil du freelancer connecté
  getProfil: async (userId: number): Promise<FreelancerProfil> => {
    return apiFetch<FreelancerProfil>(
      `/freelancer/by-user/${userId}/profil`
    );
  },

  // Profil public d'un candidat
  getProfilByFreelancerId: async (
    freelancerId: number
  ): Promise<FreelancerProfil> => {
    return apiFetch<FreelancerProfil>(
      `/freelancer/${freelancerId}/detail`
    );
  },
  

  // Mise à jour du profil personnel
  updateProfil: async (
    userId: number,
    data: Partial<FreelancerProfil>
  ): Promise<FreelancerProfil> => {
    return apiFetch<FreelancerProfil>(
      `/freelancer/by-user/${userId}/profil`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  getCompletion: async (
    freelancerId: number
  ): Promise<{ pourcentage: number }> => {
    return apiFetch<{ pourcentage: number }>(
      `/freelancer/${freelancerId}/completion`
    );
  },
};