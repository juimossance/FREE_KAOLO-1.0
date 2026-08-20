// src/services/aiService.ts
import { apiFetch } from "./http";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}
export interface RecommendationDto {
  freelancerId: number;
  userId: number;

  nom: string;
  prenom: string;

  photoUrl: string;

  specialite: string;

  competences: string[];

  ville: string;

  tarif: number;

  note: number;

  disponibilite: string;

  scoreIA: number;

  raison: string;
}
export interface AIResponse {
  content: string;
  model: string;
}

export const aiService = {
  // Chat générique
  chat: (messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> =>
    apiFetch("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages, systemPrompt }),
    }),

  // Générer un CV
  generateCV: (data: Record<string, string>): Promise<AIResponse> =>
    apiFetch("/ai/generate-cv", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Générer un rapport
  generateReport: (params: {
    role: "FREELANCER" | "ENTREPRISE";
    type: string;
    dateDebut: string;
    dateFin: string;
  }): Promise<AIResponse> =>
    apiFetch("/ai/generate-report", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Profil idéal (entreprise)
  idealProfile: async (data: Record<string, string>): Promise<any> => {
  const response = await apiFetch<any>("/ai/ideal-profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response; // ✅ retourne content + freelancers
},

  // Analyse marché
  analysis: (type: string, role: "FREELANCER" | "ENTREPRISE"): Promise<AIResponse> =>
    apiFetch("/ai/analysis", {
      method: "POST",
      body: JSON.stringify({ type, role }),
    }),
};