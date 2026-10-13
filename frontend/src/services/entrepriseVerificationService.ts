import { apiFetch } from "./http";

export type VerificationStatus = "EN_ATTENTE" | "VALIDEE" | "REJETEE";

export interface EntrepriseVerification {
  id: number;
  raisonSociale: string;
  registreCommerce: string;
  numeroFiscal: string | null;
  documentUrl: string;
  status: VerificationStatus;
  motifRejet?: string | null;
  dateSoumission: string;
}

export interface AdminEntrepriseVerification extends EntrepriseVerification {
  entrepriseId: number;
  entrepriseNom: string;
  entrepriseEmail: string;
}

export interface EntrepriseVerificationForm {
  raisonSociale: string;
  registreCommerce: string;
  numeroFiscal: string | null;
  documentUrl: string;
}

export const entrepriseVerificationService = {
  getAll(entrepriseId: number) {
    return apiFetch<EntrepriseVerification[]>(`/entreprises/${entrepriseId}/verifications`);
  },
  create(entrepriseId: number, payload: EntrepriseVerificationForm) {
    return apiFetch<EntrepriseVerification>(`/entreprises/${entrepriseId}/verifications`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resubmit(id: number, payload: EntrepriseVerificationForm) {
    return apiFetch<EntrepriseVerification>(`/entreprise-verifications/${id}/resubmit`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/entreprise-verifications/documents", {
      method: "POST",
      body: formData,
    });
  },
  admin: {
    list(status?: VerificationStatus) {
      const qs = status ? `?status=${status}` : "";
      return apiFetch<AdminEntrepriseVerification[]>(`/admin/entreprise-verifications${qs}`);
    },
    validate(id: number) {
      return apiFetch<AdminEntrepriseVerification>(`/admin/entreprise-verifications/${id}/validate`, { method: "PUT" });
    },
    reject(id: number, motif: string) {
      return apiFetch<AdminEntrepriseVerification>(`/admin/entreprise-verifications/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ motif }),
      });
    },
  },
};