import { apiFetch } from "./http";

export interface CvAnalysis {
  statut:
    | "aucun"
    | "en_attente"
    | "en_cours"
    | "termine"
    | "erreur";

  scoreGlobal?: number;
  pointsForts?: string[];
  suggestions?: string[];
  competencesDetectees?: string[];
  versionAmelioree?: string;
  dateAnalyse?: string;
}

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

  langues?: string;

  photoUrl?: string;

  certifie?: boolean;

  note?: number;
  noteMoyenne?: number;
  nombreAvis?: number;

  completionPourcentage: number;

  cvUrl?: string;
  cvNomFichier?: string;
  cvAnalysis?: CvAnalysis;
}

export const freelancerServices = {
  getProfil: async (
    userId: number
  ): Promise<FreelancerProfil> =>
    apiFetch<FreelancerProfil>(
      `/freelancer/by-user/${userId}/profil`
    ),

  getProfilByFreelancerId: async (
    freelancerId: number
  ): Promise<FreelancerProfil> =>
    apiFetch<FreelancerProfil>(
      `/freelancer/${freelancerId}/detail`
    ),

  updateProfil: async (
    userId: number,
    data: Partial<FreelancerProfil>
  ): Promise<FreelancerProfil> =>
    apiFetch<FreelancerProfil>(
      `/freelancer/by-user/${userId}/profil`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  updateCompletion: async (
    freelancerId: number,
    completion: number
  ): Promise<number> =>
    apiFetch<number>(
      `/freelancer/${freelancerId}/completion`,
      {
        method: "PUT",
        body: JSON.stringify({
          completion,
        }),
      }
    ),
};