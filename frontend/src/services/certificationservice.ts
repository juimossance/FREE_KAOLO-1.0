// src/app/services/certificationservice.ts
//
// Même hypothèse que portfolioservice.ts : apiFetch<T>(url, options) renvoie
// directement le JSON parsé. Si sa vraie signature diffère, dis-le-moi et
// j'ajuste les deux fichiers ensemble.
import { apiFetch } from "./http";

export type CertType = "CERTIFICATION" | "DIPLOME";

export type CertStatus =
  | "VALIDEE"
  | "EN_ATTENTE"
  | "REJETEE";

export interface CertificationItem {
  id: number;

  type: CertType;

  nom: string;
  organisme: string;
  credentialId: string;
  categorie: string;

  dateObtention: string;
  dateExpiration: string | null;

  documentUrl: string;

  status: CertStatus;
  motifRejet?: string | null;
}

export interface CertificationFormData {
  type: CertType;

  nom: string;
  organisme: string;
  credentialId: string;
  categorie: string;

  dateObtention: string;
  dateExpiration: string | null;

  documentUrl: string;
}
export interface AdminCertificationItem extends CertificationItem {
  freelancerId: number;
  freelancerNom: string;
  freelancerEmail: string;
  dateSoumission: string;
}
export const certificationService = {
    admin: {
    list(status?: CertStatus): Promise<AdminCertificationItem[]> {
      const qs = status ? `?status=${status}` : "";
      return apiFetch<AdminCertificationItem[]>(`/admin/certifications${qs}`);
    },
    validate(id: number): Promise<AdminCertificationItem> {
      return apiFetch<AdminCertificationItem>(`/admin/certifications/${id}/validate`, { method: "PUT" });
    },
    reject(id: number, motif: string): Promise<AdminCertificationItem> {
      return apiFetch<AdminCertificationItem>(`/admin/certifications/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ motif }),
      });
    },
  },
  
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
export const isCredentialValid = (c: CertificationItem): boolean =>
  c.status === "VALIDEE" &&
  (!c.dateExpiration || new Date(c.dateExpiration) >= new Date(new Date().toDateString()));
  const API_BASE_URL = "http://localhost:8080";

export const getCertificationDocumentUrl = (documentUrl: string): string => {
  if (!documentUrl) return "";

  if (
    documentUrl.startsWith("http://") ||
    documentUrl.startsWith("https://")
  ) {
    return documentUrl;
  }

  return `${API_BASE_URL}${documentUrl.startsWith("/") ? "" : "/"}${documentUrl}`;
};