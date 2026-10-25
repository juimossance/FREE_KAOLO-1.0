import type { FreelancerDashboardData } from "../models/dashboard";
import { apiFetch } from "./http";

export function getFreelancerDashboard(): Promise<FreelancerDashboardData> {
  return apiFetch<FreelancerDashboardData>("/dashboard/freelancer");
}
