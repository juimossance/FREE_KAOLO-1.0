// src/services/dashboardService.ts
import type { FreelancerDashboardData } from "../models/dashboard";

export async function getFreelancerDashboard(token: string): Promise<FreelancerDashboardData> {
  const res = await fetch("http://localhost:8080/api/dashboard/freelancer", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Impossible de charger le dashboard");
  return res.json();
}