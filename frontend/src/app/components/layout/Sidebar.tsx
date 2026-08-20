// src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, User, Briefcase, Award, FileText, FolderOpen,
  Send, Star, CreditCard, Bell, PlusCircle, Search, Users, Bot,
  MessageSquare, Settings, ChevronRight, LogOut, Shield,
  AlertTriangle, TrendingUp, Building2, History,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/http";

type NavItem     = { label: string; href: string; icon: React.ReactNode };
type Role        = "freelancer" | "enterprise" | "admin";
type SidebarProps = { role: Role; onClose?: () => void };

const freelancerNav: NavItem[] = [
  { label: "Tableau de bord",  href: "/freelancer/dashboard",     icon: <LayoutDashboard size={18} /> },
  { label: "Mon Profil",       href: "/freelancer/profile",       icon: <User size={18} /> },
  { label: "Portfolio",        href: "/freelancer/portfolio",     icon: <FolderOpen size={18} /> },
  { label: "Certifications",   href: "/freelancer/certifications",icon: <Award size={18} /> },
  { label: "Documents",        href: "/freelancer/documents",     icon: <FileText size={18} /> },
  { label: "Candidatures",     href: "/freelancer/applications",  icon: <Send size={18} /> },
  { label: "Projets",          href: "/freelancer/projects",      icon: <Briefcase size={18} /> },
  { label: "Évaluations",      href: "/freelancer/ratings",       icon: <Star size={18} /> },
  { label: "Paiements",        href: "/freelancer/payments",      icon: <CreditCard size={18} /> },
  { label: "Messages",         href: "/messages",                 icon: <MessageSquare size={18} /> },
  { label: "Assistant IA",     href: "/freelancer/ai",                       icon: <Bot size={18} /> },
  { label: "Notifications",    href: "/freelancer/notifications", icon: <Bell size={18} /> },
];

const enterpriseNav: NavItem[] = [
  { label: "Tableau de bord",  href: "/enterprise/dashboard",    icon: <LayoutDashboard size={18} /> },
  { label: "Publier un projet",href: "/enterprise/post-project", icon: <PlusCircle size={18} /> },
  { label: "Mes projets",      href: "/enterprise/projects",     icon: <Briefcase size={18} /> },
  { label: "Recherche talents",href: "/enterprise/search",       icon: <Search size={18} /> },
  { label: "Candidatures",     href: "/enterprise/applications", icon: <Users size={18} /> },
  { label: "Historique",       href: "/enterprise/history",      icon: <History size={18} /> },
  { label: "Messages",         href: "/messages",                icon: <MessageSquare size={18} /> },
  { label: "Assistant IA",     href: "/enterprise/ai",                      icon: <Bot size={18} /> },
  { label: "Paiements",        href: "/payments",                icon: <CreditCard size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard",        href: "/admin/dashboard",         icon: <LayoutDashboard size={18} /> },
  { label: "Utilisateurs",     href: "/admin/users",             icon: <Users size={18} /> },
  { label: "Certifications",   href: "/admin/certifications",    icon: <Award size={18} /> },
  { label: "Statistiques",     href: "/admin/stats",             icon: <TrendingUp size={18} /> },
  { label: "Signalements",     href: "/admin/reports",           icon: <AlertTriangle size={18} /> },
  { label: "Paiements",        href: "/admin/payments",          icon: <CreditCard size={18} /> },
];

const roleIcons  = {
  freelancer: <User size={16} />,
  enterprise: <Building2 size={16} />,
  admin:      <Shield size={16} />,
};
const roleLabels = {
  freelancer: "Freelancer",
  enterprise: "Entreprise",
  admin:      "Administrateur",
};

export function Sidebar({ role, onClose }: SidebarProps) {
  const location         = useLocation();
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const nav = role === "freelancer" ? freelancerNav
            : role === "enterprise" ? enterpriseNav
            : adminNav;

  // ✅ États pour les infos utilisateur
  const [displayName,  setDisplayName]  = useState("Chargement...");
  const [displayEmail, setDisplayEmail] = useState("");
  const [initiales,    setInitiales]    = useState("??");

  // ✅ useEffect correctement placé — pas après un return
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        if (user.role === "FREELANCER") {
          const detail = await apiFetch<{
            nom: string; prenom: string; specialite?: string;
          }>(`/freelancer/${user.freelancerId ?? user.userId}/detail`);

          const nom = `${detail.prenom ?? ""} ${detail.nom ?? ""}`.trim();
          setDisplayName(nom || `Freelancer #${user.userId}`);
          setDisplayEmail(detail.specialite ?? "Freelancer");
          setInitiales(
            `${detail.prenom?.[0] ?? ""}${detail.nom?.[0] ?? ""}`.toUpperCase() || "FL"
          );

        } else if (user.role === "ENTREPRISE") {
          const e = await apiFetch<{
            nomEntreprise: string; secteur?: string;
          }>(`/entreprise/${user.userId}/profil`);

          setDisplayName(e.nomEntreprise ?? `Entreprise #${user.userId}`);
          setDisplayEmail(e.secteur ?? "Entreprise");
          setInitiales((e.nomEntreprise ?? "EN").slice(0, 2).toUpperCase());

        } else {
          setDisplayName("Administrateur");
          setDisplayEmail("admin@free-kaolo.com");
          setInitiales("AD");
        }
      } catch {
        // Fallback si l'API échoue
        const fallback =
          user.role === "FREELANCER" ? `Freelancer #${user.userId}`
        : user.role === "ENTREPRISE" ? `Entreprise #${user.userId}`
        : "Administrateur";
        setDisplayName(fallback);
        setDisplayEmail(user.role);
        setInitiales(user.role.slice(0, 2).toUpperCase());
      }
    };

    fetchProfile();
  }, [user]); // ✅ dépendance correcte

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (href: string) =>
    href === location.pathname ||
    (href !== "/" && location.pathname.startsWith(href));

  return (
    <aside className="h-full flex flex-col"
      style={{ background: "var(--navy)", borderRight: "1px solid var(--sidebar-border)" }}>

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--gold)" }}>
          <span className="text-xs font-bold" style={{ color: "var(--navy)" }}>FK</span>
        </div>
        <div>
          <span className="text-white font-bold text-base">free-kaolo</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span style={{ color: "var(--gold)" }}>{roleIcons[role]}</span>
            <span className="text-xs" style={{ color: "var(--gold)" }}>{roleLabels[role]}</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
              style={{
                background: active ? "var(--gold)" : "transparent",
                color:      active ? "var(--navy)" : "rgba(248,250,252,0.7)",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
                  (e.currentTarget as HTMLElement).style.color = "#F8FAFC";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(248,250,252,0.7)";
                }
              }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* ── User section ── */}
      <div className="border-t px-4 py-4" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "var(--gold)", color: "var(--navy)" }}>
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            {/* ✅ Vrai nom affiché ici */}
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: "rgba(248,250,252,0.5)" }}>
              {displayEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--sidebar-accent)", color: "rgba(248,250,252,0.7)" }}>
            <LogOut size={13} /> Déconnexion
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ background: "var(--sidebar-accent)", color: "rgba(248,250,252,0.7)" }}>
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}