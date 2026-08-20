// src/services/freelancerSearchService.ts
import { apiFetch } from "./http";

export interface FreelancerPublic {
  id: number;
  userId: number;
  nom: string;
  prenom: string;
  specialite: string;
  noteMoyenne: number;
  nombreAvis: number;
  tarifJournalier: number;
  ville: string;
  experience: string;
  competences: string[];
  certified: boolean;
  disponibilite: string;
  nombreProjets: number;
  photoUrl?: string;
}

export interface FreelancerDetail extends FreelancerPublic {
  description: string;
  github?: string;
  linkedin?: string;
  siteweb?: string;
  langues?: string;
  pays?: string;
  portfolio: PortfolioPublic[];
  avis: AvisClient[];
  stats: FreelancerPublicStats;
}

export interface PortfolioPublic {
  id: number;
  titre: string;
  description: string;
  technologies: string[];
  categorie: string;
  couleur: string;
  emoji: string;
  annee: string;
  featured: boolean;
}

export interface AvisClient {
  id: number;
  entrepriseNom: string;
  projetTitre: string;
  note: number;
  commentaire: string;
  date: string;
}

export interface FreelancerPublicStats {
  totalProjets: number;
  tauxSucces: number;
  tauxPonctualite: number;
  nombreRepetitions: number;
}

export interface SearchFilters {
  search?: string;
  categorie?: string;
  ville?: string;
  minTarif?: number;
  maxTarif?: number;
  certified?: boolean;
  disponible?: boolean;
  competences?: string[];
}


  export const freelancerSearchService = {
  // ✅ /prestataires → /freelancer (c'est là que le controller est mappé)
  search: (filters: SearchFilters): Promise<FreelancerPublic[]> => {
    const params = new URLSearchParams();
    if (filters.search)     params.append("search",     filters.search);
    if (filters.categorie)  params.append("categorie",  filters.categorie);
    if (filters.ville)      params.append("ville",      filters.ville);
    if (filters.minTarif)   params.append("minTarif",   String(filters.minTarif));
    if (filters.maxTarif)   params.append("maxTarif",   String(filters.maxTarif));
    if (filters.certified)  params.append("certified",  "true");
    if (filters.disponible) params.append("disponible", "true");
    if (filters.competences?.length)
      params.append("competences", filters.competences.join(","));
    return apiFetch(`/freelancer?${params.toString()}`);
  },

  getDetail: (freelancerId: number): Promise<FreelancerDetail> =>
    apiFetch(`/freelancer/${freelancerId}/detail`),
};

