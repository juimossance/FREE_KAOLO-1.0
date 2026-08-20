// src/routes.tsx
import { createBrowserRouter, redirect } from "react-router";

import { AppLayout } from "./app/components/layout/AppLayout";
import { AuthLayout } from "./app/components/layout/AuthLayout";


import { ProtectedRoute } from "./app/components/auth/ProtectedRoute";
import { LoginPage } from "./app/pages/auth/LoginPage";
import { RegisterFreelancerPage } from "./app/pages/auth/RegisterFreelancerPage";
import { RegisterEnterprisePage } from "./app/pages/auth/RegisterEnterprisePage";
import { ForgotPasswordPage } from "./app/pages/auth/ForgotPasswordPage";
import { EmailVerificationPage } from "./app/pages/auth/EmailVerificationPage";
import { AccountActivationPage } from "./app/pages/auth/AccountActivationPage";
import { FreelancerDashboard } from "./app/pages/freelancer/FreelancerDashboard";
import { FreelancerProfile } from "./app/pages/freelancer/FreelancerProfile";
import { EditProfile } from "./app/pages/freelancer/EditProfile";
import { Portfolio } from "./app/pages/freelancer/Portfolio";
import { Certifications } from "./app/pages/freelancer/Certifications";
import { UploadDocuments } from "./app/pages/freelancer/UploadDocuments";
import { ProjectHistory } from "./app/pages/freelancer/ProjectHistory";
import { Applications } from "./app/pages/freelancer/Applications";
import { Ratings } from "./app/pages/freelancer/Ratings";
import { FreelancerPayments } from "./app/pages/freelancer/FreelancerPayments";
import { FreelancerNotifications } from "./app/pages/freelancer/FreelancerNotifications";
import { PostProject } from "./app/pages/enterprise/PostProject";
import { EnterpriseDashboard } from "./app/pages/enterprise/EnterpriseDashboard";
import { EditProject } from "./app/pages/enterprise/EditProject";
import { ProjectDetails } from "./app/pages/enterprise/ProjectDetails";
import { SearchProfiles } from "./app/pages/enterprise/SearchProfiles";
import { ProjectsList } from "./app/pages/enterprise/ProjectsList";

import { CandidateSelection } from "./app/pages/enterprise/CandidateSelection";
import { ManageApplications } from "./app/pages/enterprise/ManageApplications";
import { RecruitmentHistory } from "./app/pages/enterprise/RecruitmentHistory";
import { AdminDashboard } from "./app/pages/admin/AdminDashboard";
import { AdminUsers } from "./app/pages/admin/AdminUsers";
import { AdminCertifications } from "./app/pages/admin/AdminCertifications";
import { AdminStats } from "./app/pages/admin/AdminStats";
import { AdminReports } from "./app/pages/admin/AdminReports";
import { AdminPayments } from "./app/pages/admin/AdminPayments";
import { MessagingPage } from "./app/pages/messaging/MessagingPage";
import { AIPage } from "./app/pages/ai/AIPage";
import { PaymentPage } from "./app/pages/payment/PaymentPage";
import { AIPageFreelancer } from "./app/pages/freelancer/AIPageFreelancer";
import { AIPageEnterprise } from "./app/pages/enterprise/AiPageEntreprise";
import { EnterpriseFreelancerProfile } from "./app/pages/enterprise/EnterpriseFreelancerProfile";

export const router = createBrowserRouter([
  // Redirection racine
  {
    path: "/",
    loader: () => redirect("/login"),
  },

  // ── Auth (pages publiques) ─────────────────────────────────────────────────
  {
    Component: AuthLayout,
    children: [
      { path: "login",                Component: LoginPage },
      { path: "register/freelancer",  Component: RegisterFreelancerPage },
      { path: "register/enterprise",  Component: RegisterEnterprisePage },
      { path: "forgot-password",      Component: ForgotPasswordPage },
      { path: "verify-email",         Component: EmailVerificationPage },
      { path: "activate",             Component: AccountActivationPage },
    ],
  },

  // ── Freelancer (FREELANCER uniquement) ────────────────────────────────────
 {
  path: "freelancer",
  element: <ProtectedRoute allowedRoles={["FREELANCER"]} />,
  children: [
    {
      Component: AppLayout,
      children: [
        { index: true, loader: () => redirect("/freelancer/dashboard") },

        { path: "dashboard", Component: FreelancerDashboard },
        { path: "profile", Component: FreelancerProfile },
        { path: "edit-profile", Component: EditProfile },
        { path: "portfolio", Component: Portfolio },
        { path: "certifications", Component: Certifications },
        { path: "documents", Component: UploadDocuments },
        { path: "projects", Component: ProjectHistory },
        { path: "applications", Component: Applications },
        { path: "ratings", Component: Ratings },
        { path: "payments", Component: FreelancerPayments },
        { path: "notifications", Component: FreelancerNotifications },

        { path: "messages", Component: MessagingPage },
        { path: "messages/:id", Component: MessagingPage },

        { path: "ai", Component: AIPageFreelancer },
        { path: "ai/:tab", Component: AIPageFreelancer },
      ],
    },
  ],
},

  // ── Enterprise (ENTREPRISE uniquement) ────────────────────────────────────
  {
  path: "enterprise",
  element: <ProtectedRoute allowedRoles={["ENTREPRISE"]} />,
  children: [
    {
      Component: AppLayout,
      children: [
        { index: true, loader: () => redirect("/enterprise/dashboard") },

        { path: "dashboard", Component: EnterpriseDashboard },

        { path: "post-project", Component: PostProject },
        { path: "edit-project/:id", Component: EditProject },

        { path: "projects", Component: ProjectsList },
        { path: "projects/:id", Component: ProjectDetails },

        { path: "search", Component: SearchProfiles },
        { path: "candidates/:projetId", Component: CandidateSelection },
        { path: "applications", Component: ManageApplications },
        { path: "history", Component: RecruitmentHistory },

        { path: "messages", Component: MessagingPage },
        { path: "messages/:id", Component: MessagingPage },

        { path: "payments", Component: PaymentPage },
        { path: "payments/:tab", Component: PaymentPage },

        { path: "ai", Component: AIPageEnterprise },
        { path: "ai/:tab", Component: AIPageEnterprise },
       {
          path: "freelancer/:freelancerId",
          Component: EnterpriseFreelancerProfile,
        },
      ],
    },
  ],
},

  // ── Admin (ADMIN uniquement) ──────────────────────────────────────────────
  {
    path: "admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        Component: AppLayout,
        children: [
          { index: true, loader: () => redirect("/admin/dashboard") },
          { path: "dashboard",    Component: AdminDashboard },
          { path: "users",        Component: AdminUsers },
          { path: "certifications",Component: AdminCertifications },
          { path: "stats",        Component: AdminStats },
          { path: "reports",      Component: AdminReports },
          { path: "payments",     Component: AdminPayments },
        ],
      },
    ],
  },

  // ── Pages communes (tous les rôles connectés) ─────────────────────────────
  // ── Pages communes ──
{
  element: <ProtectedRoute allowedRoles={["FREELANCER", "ENTREPRISE", "ADMIN"]} />,
  children: [
    {
      Component: AppLayout,
      children: [
        { path: "messages", Component: MessagingPage },
        { path: "messages/:id", Component: MessagingPage },
        { path: "ai", Component: AIPage },
        { path: "ai/:tab", Component: AIPage },
        { path: "payments", Component: PaymentPage },
        { path: "payments/:tab", Component: PaymentPage },
      ],
    },
  ],
},
]);

