// src/services/progressionService.ts
import { apiFetch } from "./http";

/* =========================================================
   TYPES
========================================================= */

export interface MiseAJourAvancement {
  id: number;
  pourcentage: number;
  message: string;
  date: string; // ISO
}

export interface AvancementProjet {
  projetId: number;
  progression: number; // 0-100, valeur courante
  derniereMiseAJour?: string; // ISO
  historique: MiseAJourAvancement[];
}

export interface NouvelleMiseAJour {
  pourcentage: number;
  message: string;
}

/* =========================================================
   SERVICE
   Endpoints backend attendus (à adapter à votre contrôleur) :
     GET  /api/projets/{id}/avancement          -> AvancementProjet
     POST /api/projets/{id}/avancement           -> AvancementProjet (mise à jour)
       body: { pourcentage, message }
       Le backend doit vérifier que l'utilisateur connecté (JWT)
       est bien le freelancer dont la candidature sur ce projet
       est au statut EN_COURS, sinon 403.
========================================================= */

export const progressionService = {
  /**
   * Récupère l'avancement courant + l'historique d'un projet.
   * Utilisable côté entreprise (lecture) et côté freelancer.
   */
  getByProjet(projetId: number) {
    return apiFetch<AvancementProjet>(`/projets/${projetId}/avancement`);
  },

  /**
   * Publie une nouvelle mise à jour d'avancement.
   * Réservé au freelancer affecté au projet (contrôle côté backend).
   */
  update(projetId: number, data: NouvelleMiseAJour) {
    return apiFetch<AvancementProjet>(`/projets/${projetId}/avancement`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};