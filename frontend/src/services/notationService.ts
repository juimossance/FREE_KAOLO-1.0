// src/services/notationService.ts
import { apiFetch } from "./http";

export interface MissionANoter {
  candidatureId: number;
  freelancerId: number;
  freelancerNom: string;
  projetTitre: string;
  dateFin?: string | null;
  note?: number | null;          // null = pas encore noté
  commentaire?: string | null;
}

export const notationService = {
  // Missions TERMINEE des projets de l'entreprise connectée
  getMissions: () =>
    apiFetch<MissionANoter[]>("/entreprise/candidatures/terminees"),

  noter: (candidatureId: number, note: number, commentaire: string) =>
    apiFetch(`/entreprise/candidatures/${candidatureId}/note`, {
      method: "POST",
      body: JSON.stringify({ note, commentaire }),
    }),
};