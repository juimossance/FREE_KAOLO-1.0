// src/app/services/portfolioservice.ts
//
// Utilise apiFetch (wrapper fetch déjà configuré dans le projet, avec
// baseURL + JWT). Si sa signature diffère de ce que j'ai supposé ici,
// donne-moi son code et j'ajuste.
import { apiFetch } from "./http";

export interface PortfolioItem {
  id: number;
  titre: string;
  description: string;
  technologies: string[];
  categorie: string;
  annee: string;
  icone: string;
  couleur: string;
  featured: boolean;
  imageUrl?: string;
}

export interface PortfolioFormData {
  titre: string;
  description: string;
  technologies: string[];
  categorie: string;
  annee: string;
  icone: string;
  couleur: string;
  imageUrl?: string;
  featured: boolean;
}

export const portfolioService = {
  async getAll(freelancerId: number): Promise<PortfolioItem[]> {
    return apiFetch<PortfolioItem[]>(`/freelancer/${freelancerId}/portfolio`);
  },

  async create(freelancerId: number, payload: PortfolioFormData): Promise<PortfolioItem> {
    return apiFetch<PortfolioItem>(`/freelancer/${freelancerId}/portfolio`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: number, payload: PortfolioFormData): Promise<PortfolioItem> {
    return apiFetch<PortfolioItem>(`/portfolio/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/portfolio/${id}`, { method: "DELETE" });
  },

  async toggleFeatured(id: number, featured: boolean): Promise<PortfolioItem> {
    return apiFetch<PortfolioItem>(`/portfolio/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify({ featured }),
    });
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    // Point critique : ne PAS passer de header Content-Type ici.
    // Si apiFetch ajoute automatiquement "Content-Type: application/json"
    // par défaut à toutes les requêtes, cet appel cassera l'upload car le
    // navigateur ne pourra plus générer la boundary multipart lui-même.
    // Il faut que apiFetch laisse le Content-Type absent quand le body
    // est une instance de FormData (voir note ci-dessous).
    return apiFetch<{ url: string }>("/portfolio/images", {
      method: "POST",
      body: formData,
    });
  },
};