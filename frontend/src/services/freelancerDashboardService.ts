// src/services/freelancerDashboardService.ts
import { apiFetch } from "./http";

export interface FreelancerStats {
  vuesProfil: number;
  totalCandidatures: number;
  noteMoyenne: number;
  gainsMoisCourant: number;
  completionProfil: number;
  gainsMensuels: { month: string; amount: number }[];
  candidaturesParMois: { month: string; envoyees: number; acceptees: number }[];
}
// Le backend retourne maintenant des Candidaturedto enrichis
// Aligne l'interface CandidatureFreelancer avec les vrais champs

export interface CandidatureFreelancer {
  id: number;
  projetId: number;
  projetTitre: string;          // ← projetTitre du DTO
  entrepriseNom: string;        // ← entrepriseNom du DTO
  status: "EN_ATTENTE" | "ACCEPTEE" | "EN_COURS" | "REJETEE";
  date: string;
  budget?: number | null;               // ← projetBudget du DTO
}


export interface NotificationFreelancer {
  id: number;
  titre: string;
  description: string;
  type: string; // "success" | "info" | "warning"
  date: string;
  lu: boolean;
}

export const freelancerDashboardService = {
  // ✅ URLs alignées avec prestataireController
  getStats: (freelancerId: number): Promise<FreelancerStats> =>
    apiFetch(`/freelancer/${freelancerId}/stats`),

  getNotifications: (freelancerId: number): Promise<NotificationFreelancer[]> =>
    apiFetch(`/freelancer/${freelancerId}/notifications`),

  marquerNotificationLue: (notificationId: number): Promise<void> =>
    apiFetch(`/freelancer/notifications/${notificationId}/lue`, { method: "PUT" }),

  // ✅ URL alignée avec CandidatureController existant
  getCandidatures: (freelancerId: number): Promise<CandidatureFreelancer[]> =>
    apiFetch(`/freelancer/candidatures/${freelancerId}`),
};