import { apiFetch } from "./http";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES GÉNÉRAUX IA
// ─────────────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPÉTENCE ÉVALUÉE
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillEvaluation {
  nom: string;
  score: number | null;
  niveau: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CRITÈRES DE RECHERCHE
// ─────────────────────────────────────────────────────────────────────────────

export interface RecommendationCriteria {
  competences: string[];
  localisation: string;
  experience: string;
  duree: string;
  disponibilite: string;
  typeCollaboration: string;
  budget: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMANDATION FREELANCER
// ─────────────────────────────────────────────────────────────────────────────

export interface FreelancerRecommendation {
  id: number;

  prenom: string;
  nom: string;

  specialite: string;

  ville: string;
  pays: string;

  photoUrl: string | null;

  scoreIA: number;

  noteMoyenne: number;
  nombreAvis: number;

  completudeProfil: number;

  scoreCompetences: number;

  competences: SkillEvaluation[];

  disponibilite: string | null;

  tarifJournalier: number | null;

  explication: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉPONSE PROFIL IDÉAL
// ─────────────────────────────────────────────────────────────────────────────

export interface IdealProfileResponse {
  criteria: RecommendationCriteria | null;

  recommendations: FreelancerRecommendation[];

  summary?: string;

  content?: string;

  count?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE IA
// ─────────────────────────────────────────────────────────────────────────────

export const aiService = {
  // ───────────────────────────────────────────────────────────────────────────
  // CHAT
  // ───────────────────────────────────────────────────────────────────────────

  chat: async (
    messages: AIMessage[]
  ): Promise<AIResponse> => {
    return apiFetch<AIResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages,
      }),
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // PROFIL IDÉAL
  // ───────────────────────────────────────────────────────────────────────────

  idealProfile: async (
    message: string
  ): Promise<IdealProfileResponse> => {
    return apiFetch<IdealProfileResponse>(
      "/ai/ideal-profile",
      {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      }
    );
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ANALYSE CV
  // ───────────────────────────────────────────────────────────────────────────

  analyzeCV: async (
    text: string
  ): Promise<any> => {
    return apiFetch<any>("/ai/analyze-cv", {
      method: "POST",
      body: JSON.stringify({
        text,
      }),
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // RAPPORT
  // ───────────────────────────────────────────────────────────────────────────

  generateReport: async (
    data: Record<string, unknown>
  ): Promise<any> => {
    return apiFetch<any>("/ai/generate-report", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ANALYSE MARCHÉ
  // ───────────────────────────────────────────────────────────────────────────

  analysis: async (
    data: Record<string, unknown>
  ): Promise<any> => {
    return apiFetch<any>("/ai/analysis", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CV DRAFT
  // ───────────────────────────────────────────────────────────────────────────

  getCVDraft: async (): Promise<any> => {
    return apiFetch<any>("/ai/cv-draft", {
      method: "GET",
    });
  },

  updateCVDraft: async (
    draft: unknown
  ): Promise<any> => {
    return apiFetch<any>("/ai/cv-draft", {
      method: "PUT",
      body: JSON.stringify(draft),
    });
  },
};

export default aiService;