// src/app/services/certificationservice.ts
//
// Même hypothèse que portfolioservice.ts : apiFetch<T>(url, options) renvoie
// directement le JSON parsé. Si sa vraie signature diffère, dis-le-moi et
// j'ajuste les deux fichiers ensemble.
import { apiFetch } from "./http";

export type CertStatus = "EN_ATTENTE" | "VALIDEE" | "REJETEE";

export interface CertificationItem {
  id: number;
  nom: string;
  organisme: string;
  credentialId: string;
  categorie: string;
  dateObtention: string;   // format ISO "YYYY-MM-DD"
  dateExpiration: string | null;
  documentUrl: string;
  status: CertStatus;
  motifRejet: string | null;
}

export interface CertificationFormData {
  nom: string;
  organisme: string;
  credentialId: string;
  categorie: string;
  dateObtention: string;   // format ISO "YYYY-MM-DD"
  dateExpiration: string | null;
  documentUrl: string;
}

export const certificationService = {
   async getAll(freelancerId: number): Promise<CertificationItem[]> {
    return apiFetch<CertificationItem[]>(`/freelancers/${freelancerId}/certifications`);
  },

  async create(freelancerId: number, payload: CertificationFormData): Promise<CertificationItem> {
    return apiFetch<CertificationItem>(`/freelancers/${freelancerId}/certifications`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },


  // Uniquement valide si la certification ciblée est au statut REJETEE (vérifié côté backend)
  async resubmit(id: number, payload: CertificationFormData): Promise<CertificationItem> {
    return apiFetch<CertificationItem>(`/certifications/${id}/resubmit`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/certifications/${id}`, { method: "DELETE" });
  },

  async uploadDocument(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    // Comme pour portfolioservice.uploadImage : ne pas fixer Content-Type ici,
    // apiFetch/le navigateur doit générer la boundary multipart lui-même.
    return apiFetch<{ url: string }>("/certifications/documents", {
      method: "POST",
      body: formData,
    });
  },
};