import { createBrowserRouter, redirect } from "react-router";

import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterFreelancerPage } from "./pages/auth/RegisterFreelancerPage";
import { RegisterEnterprisePage } from "./pages/auth/RegisterEnterprisePage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { EmailVerificationPage } from "./pages/auth/EmailVerificationPage";
import { AccountActivationPage } from "./pages/auth/AccountActivationPage";

import { FreelancerDashboard } from "./pages/freelancer/FreelancerDashboard";
import { FreelancerProfile } from "./pages/freelancer/FreelancerProfile";
import { EditProfile } from "./pages/freelancer/EditProfile";
import { Portfolio } from "./pages/freelancer/Portfolio";
import { Certifications } from "./pages/freelancer/Certifications";
import { UploadDocuments } from "./pages/freelancer/UploadDocuments";
import { ProjectHistory } from "./pages/freelancer/ProjectHistory";
import { Applications } from "./pages/freelancer/Applications";
import { Ratings } from "./pages/freelancer/Ratings";
import { FreelancerPayments } from "./pages/freelancer/FreelancerPayments";
import { FreelancerNotifications } from "./pages/freelancer/FreelancerNotifications";

import { EnterpriseDashboard } from "./pages/enterprise/EnterpriseDashboard";
import { PostProject } from "./pages/enterprise/PostProject";
import { EditProject } from "./pages/enterprise/EditProject";
import { ProjectsList } from "./pages/enterprise/ProjectsList";
import { ProjectDetails } from "./pages/enterprise/ProjectDetails";
import { SearchProfiles } from "./pages/enterprise/SearchProfiles";

import { CandidateSelection } from "./pages/enterprise/CandidateSelection";
import { ManageApplications } from "./pages/enterprise/ManageApplications";
import { RecruitmentHistory } from "./pages/enterprise/RecruitmentHistory";

import { MessagingPage } from "./pages/messaging/MessagingPage";

import { AIPage } from "./pages/ai/AIPage";

import { PaymentPage } from "./pages/payment/PaymentPage";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminCertifications } from "./pages/admin/AdminCertifications";
import { AdminStats } from "./pages/admin/AdminStats";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminPayments } from "./pages/admin/AdminPayments";

import { AIPageEnterprise } from "./pages/enterprise/AiPageEntreprise";
import { AIPageFreelancer } from "./pages/freelancer/AIPageFreelancer";
import { FreelancerMessage } from "./pages/freelancer/FreelancerMessage";
import { EnterpriseFreelancerProfile } from "./pages/enterprise/EnterpriseFreelancerProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    Component: AuthLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register/freelancer", Component: RegisterFreelancerPage },
      { path: "register/enterprise", Component: RegisterEnterprisePage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "verify-email", Component: EmailVerificationPage },
      { path: "activate", Component: AccountActivationPage },
    ],
  },
  {
    path: "freelancer",
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
      { path: "ai", Component: AIPageFreelancer },
       { path: "messages", Component: FreelancerMessage },
  
      
    ],
  },
  {
    path: "enterprise",
    Component: AppLayout,
    children: [
      { index: true, loader: () => redirect("/enterprise/dashboard") },
      { path: "dashboard", Component: EnterpriseDashboard },
      { path: "post-project", Component: PostProject },
      { path: "edit-project/:id", Component: EditProject },
      { path: "projects", Component: ProjectsList },
      { path: "projects/:id", Component: ProjectDetails },
      { path: "search", Component: SearchProfiles },
     
     { path: "candidates/:projetId?", Component: CandidateSelection },
      { path: "applications", Component: ManageApplications },
      { path: "history", Component: RecruitmentHistory },
      { path: "ai", Component: AIPageEnterprise },
           { path: "messages", Component: MessagingPage },
             {
            path: "freelancer/:freelancerId",Component: EnterpriseFreelancerProfile,
                   },
              
           

    ],
  },
  {
    path: "messages",
    Component: AppLayout,
    children: [
      { index: true, Component: MessagingPage },
      { path: ":id", Component: MessagingPage },
    ],
  },
  {
    path: "ai",
    Component: AppLayout,
    children: [
      { index: true, Component: AIPage },
      { path: ":tab", Component: AIPage },
    ],
  },
  {
    path: "payments",
    Component: AppLayout,
    children: [
      { index: true, Component: PaymentPage },
      { path: ":tab", Component: PaymentPage },
    ],
  },
  
  {
    path: "admin",
    Component: AppLayout,
    children: [
      { index: true, loader: () => redirect("/admin/dashboard") },
      { path: "dashboard", Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "certifications", Component: AdminCertifications },
      { path: "stats", Component: AdminStats },
      { path: "reports", Component: AdminReports },
      { path: "payments", Component: AdminPayments },
    ],
  },
]);
