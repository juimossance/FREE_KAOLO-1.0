import { apiFetch } from "./http";

export interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  deliverables: string;
  budget: number;
  budgetType: "Fixe" | "Journalier";
  deadline: string;
  duration: string;
  experience: string;
  visibility: string;
  location: string;
  urgent: boolean;
  skills: string[];
}

export interface ProjectResponse {
  id: number;
  titre: string;
  categorie: string;
  description: string;
  livrables: string;
  budget: number;
  typeBudget: string;
  deadline: string;
  duree: string;
  experience: string;
  visibilite: string;
  lieu: string;
  urgent: boolean;
  statut: string;
  vues: number;
  nombreCandidatures: number;
  datePublication: string;
  competences: string[];
  entrepriseId: number;
  entrepriseNom: string;
}
export interface ProjectStats {
  vues: number;
  nombreCandidatures: number;
  nombrePreselectionnes: number;
  joursRestants: number;
}

export interface CandidatureResponse {
  id: number;
  freelancerId: number;
  freelancerNom: string;
  freelancerPrenom: string;
  freelancerSpecialite: string;
  freelancerPhotoUrl: string;
  freelancerRating: number;
  freelancerNbAvis: number;
  montantFinal: number;
  delaiPropose: string;
  lettreDemotivation: string;
  freelancerCompetences: string[];
  status: "EN_ATTENTE" | "ACCEPTEE" | "REJETEE" | "EN_COURS";
  date: string;
}

export const projetService = {
  createProject: async (entrepriseId: number, data: ProjectFormData): Promise<ProjectResponse> => {
    // ✅ Noms de champs alignés avec le DTO Spring (ProjetDto)
    const payload = {
      titre: data.title,
      categorie: data.category,
      description: data.description,
      livrables: data.deliverables,       // ✅ livrable → livrables
      budget: data.budget,
      typeBudget: data.budgetType,        // ✅ budgetType → typeBudget
      deadline: data.deadline,
      duree: data.duration,               // ✅ duration → duree
      experience: data.experience,
      visibilite: data.visibility,        // ✅ visibility → visibilite
      lieu: data.location,               // ✅ location → lieu
      urgent: data.urgent,
      competences: data.skills,          // ✅ skills → competences
    };

    // ✅ Plus de useAuth() ici — apiFetch lit le token depuis localStorage
    return apiFetch<ProjectResponse>(`/projets/${entrepriseId}/projets`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
   // Détail d'un projet
  getProjet: (projetId: number): Promise<ProjectResponse> =>
    apiFetch(`/projets/projets/${projetId}`),

  enregistrerVue: async (projetId: number): Promise<void> => {
    await apiFetch(`/projets/${projetId}/view`, {
        method: "POST",
    });
},
  // Stats d'un projet
  getStatsProjet: (projetId: number): Promise<ProjectStats> =>
    apiFetch(`/projets/projets/${projetId}/stats`),

  // Stats dashboard entreprise (utilise entrepriseId du JWT)
  getStatsDashboard: (entrepriseId: number): Promise<Record<string, number>> =>
    apiFetch(`/projets/${entrepriseId}/stats`),

  // Mes projets (utilise entrepriseId du JWT)
  getMesProjets: (entrepriseId: number): Promise<ProjectResponse[]> =>
    apiFetch(`/projets/${entrepriseId}/projets`),
getMesProjet: (): Promise<ProjectResponse[]> =>
  apiFetch(`/projets/me`),

  // Modifier un projet
  updateProject: (projetId: number, data: Partial<ProjectFormData>): Promise<ProjectResponse> =>
    apiFetch(`/projets/projets/${projetId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Supprimer un projet
  deleteProject: (projetId: number): Promise<void> =>
    apiFetch(`/projets/projets/${projetId}`, { method: "DELETE" }),

  // Changer le statut d'un projet
  changerStatut: (projetId: number, statut: string): Promise<ProjectResponse> =>
    apiFetch(`/projets/projets/${projetId}/statut?statut=${statut}`, { method: "PUT" }),

  // Projets publics (pour les freelancers)
  getProjetscs: (search?: string, categorie?: string): Promise<ProjectResponse[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categorie) params.append("categorie", categorie);
    return apiFetch(`/projets?${params.toString()}`);
  },

  // ── Candidatures ──────────────────────────────────────────────────────────

  // Candidatures d'un projet (vue entreprise)
  getCandidatures: (projetId: number): Promise<CandidatureResponse[]> =>
    apiFetch(`/projets/projets/${projetId}/candidatures`),

  // Changer le statut d'une candidature
  changerStatutCandidature: (candidatureId: number, statut: string): Promise<CandidatureResponse> =>
    apiFetch(`/projets/candidatures/${candidatureId}/statut?statut=${statut}`, { method: "PUT" }),

};
