// src/services/aiCvService.ts
import { apiFetch } from "./http";

export interface Diagnostic {
  probleme: string;
  impact: string;
  recommandation: string;
  gravite: "critique" | "important" | "mineur";
}

export interface AtsCv {
  infosPersonnelles: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    ville: string;
  };
  titrePoste: string;
  resume: string;
  liens: {
    linkedin: string;
    github: string;
    siteweb: string;
  };
  competences: string[];
  experiences: {
    poste: string;
    entreprise: string;
    periode: string;
    bullets: string[];
  }[];
  formations: {
    diplome: string;
    etablissement: string;
    periode: string;
  }[];
  langues: string[];
  motsClesAts: string[];
  diagnostics: Diagnostic[];
  suggestions: string[];
}

export const aiCvService = {
  /** Lance une nouvelle analyse IA à partir du CV importé dans le profil. */
  analyzeCv(): Promise<AtsCv> {
    return apiFetch<AtsCv>("/ai/analyze-cv", { method: "POST" });
  },

  /** Génère le PDF final (ATS, une colonne) à partir du CV structuré. */
  generateAtsPdf(cv: AtsCv): Promise<Blob> {
    return apiFetch<Blob>("/ai/generate-ats-cv/pdf", {
      method: "POST",
      body: JSON.stringify(cv),
    });
  },

  /**
   * Charge le dernier brouillon sauvegardé, s'il existe.
   * Renvoie null si le freelancer n'a jamais sauvegardé de brouillon
   * (le backend répond 204, apiFetch renvoie undefined dans ce cas).
   */
  async getDraft(): Promise<AtsCv | null> {
    const result = await apiFetch<AtsCv | undefined>("/ai/cv-draft", { method: "GET" });
    return result ?? null;
  },

  /** Sauvegarde le brouillon édité, sans repasser par l'IA. */
  saveDraft(cv: AtsCv): Promise<{ saved: boolean; updatedAt: string }> {
    return apiFetch("/ai/cv-draft", {
      method: "PUT",
      body: JSON.stringify(cv),
    });
  },
};