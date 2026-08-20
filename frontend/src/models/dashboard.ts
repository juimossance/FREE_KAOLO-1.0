// src/types/dashboard.ts
export type DashboardStats = {
  vue: number;
  applications: number;
  rating: number;
  monthlyRevenue: number;
};

export type Revenue = { month: string; revenuMonthly: number };

export type MonthlyApplication = { month: string; envoyees: number; acceptees: number };

// Doit correspondre exactement aux valeurs de ton enum StatusCandidature côté Java
export type StatusCandidature = "EN_ATTENTE" | "ACCEPTEE" | "REJETEE" | "EN_COURS";

export type RecentApplication = {
  projet: string;
  entreprise: string;
  statut: StatusCandidature;
  date: string;      // LocalDateTime sérialisé en ISO string par Jackson
  budget: number;
};

export type NotificationItem = {
  id: number;
  type: string;
  titre: string;
  description: string;
  date: string;
  lu: boolean;
};

export type FreelancerDashboardData = {
  stats: DashboardStats;
  earnings: Revenue[];
  applicationChart: MonthlyApplication[];
  applications: RecentApplication[];
  notifications: NotificationItem[];
};