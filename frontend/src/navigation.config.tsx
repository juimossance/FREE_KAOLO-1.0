// navigation.config.tsx
//
// Source unique de vérité pour la navigation par rôle.
// IMPORTANT : le rôle doit provenir de l'utilisateur authentifié
// (JWT / AuthContext / SecurityContext côté backend).
// NE JAMAIS déterminer le rôle à partir de location.pathname.

import type { ReactNode } from "react";
import {
  User,
  Settings,
  Briefcase,
  Award,
  Upload,
  FileText,
  History,
  Star,
  Search,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/* ============================================================
   ROLES
   ============================================================ */

export const APP_ROLES = {
  FREELANCER: "FREELANCER",
  ENTREPRISE: "ENTREPRISE",
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/* ============================================================
   TYPES
   ============================================================ */

export type NavChild = {
  label: string;
  path: string;
  icon: ReactNode;
  description?: string;
};

export type NavItem = {
  label: string;
  path?: string;
  children?: NavChild[];
};

/* ============================================================
   NAVIGATION PAR RÔLE
   ============================================================ */

export const ROLE_NAVIGATION: Readonly<Record<AppRole, readonly NavItem[]>> = {
  FREELANCER: [
    {
      label: "Dashboard",
      path: "/freelancer/dashboard",
    },

    {
      label: "Mon Profil",
      children: [
        {
          label: "Profil public",
          path: "/freelancer/profile",
          icon: <User size={15} />,
          description: "Votre vitrine professionnelle",
        },
        {
          label: "Modifier le profil",
          path: "/freelancer/edit-profile",
          icon: <Settings size={15} />,
          description: "Informations et compétences",
        },
        {
          label: "Portfolio",
          path: "/freelancer/portfolio",
          icon: <Briefcase size={15} />,
          description: "Vos projets réalisés",
        },
        {
          label: "Certifications",
          path: "/freelancer/certifications",
          icon: <Award size={15} />,
          description: "Badges et diplômes",
        },
        {
          label: "Documents",
          path: "/freelancer/documents",
          icon: <Upload size={15} />,
          description: "Pièces justificatives",
        },
      ],
    },

    {
      label: "Missions",
      children: [
        {
          label: "Candidatures",
          path: "/freelancer/applications",
          icon: <FileText size={15} />,
          description: "Suivre mes postulations",
        },
        {
          label: "Historique",
          path: "/freelancer/projects",
          icon: <History size={15} />,
          description: "Projets terminés",
        },
        {
          label: "Évaluations",
          path: "/freelancer/ratings",
          icon: <Star size={15} />,
          description: "Avis et notes clients",
        },
      ],
    },

    {
      label: "Paiements",
      path: "/freelancer/payments",
    },

    {
      label: "Messages",
      path: "/freelancer/messages",
    },

    {
      label: "Assistant IA",
      path: "/freelancer/ai",
    },
  ],

  ENTREPRISE: [
    {
      label: "Dashboard",
      path: "/enterprise/dashboard",
    },

    {
      label: "Projets",
      children: [
        {
          label: "Mes projets",
          path: "/enterprise/projects",
          icon: <Briefcase size={15} />,
          description: "Gérer vos missions actives",
        },
        {
          label: "Publier un projet",
          path: "/enterprise/post-project",
          icon: <ArrowRight size={15} />,
          description: "Nouveau recrutement",
        },
        {
          label: "Candidatures",
          path: "/enterprise/applications",
          icon: <FileText size={15} />,
          description: "Gérer les postulations",
        },
      ],
    },

    {
      label: "Talents",
      children: [
        {
          label: "Rechercher",
          path: "/enterprise/search",
          icon: <Search size={15} />,
          description: "Trouver des freelancers",
        },
        {
          label: "Sélection",
          path: "/enterprise/candidates",
          icon: <Users size={15} />,
          description: "Vos candidats sélectionnés",
        },
        {
          label: "Historique",
          path: "/enterprise/history",
          icon: <History size={15} />,
          description: "Recrutements précédents",
        },
      ],
    },

    {
      label: "Assistant IA",
      path: "/enterprise/ai",
    },

    {
      label: "Paiements",
      path: "/payments",
    },

    {
      label: "Messages",
      path: "/enterprise/messages",
    },
  ],

  ADMIN: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
    },

    {
      label: "Utilisateurs",
      path: "/admin/users",
    },

    {
      label: "Certifications",
      path: "/admin/certifications",
    },

    {
      label: "Statistiques",
      path: "/admin/stats",
    },

    {
      label: "Signalements",
      path: "/admin/reports",
    },

    {
      label: "Paiements",
      path: "/admin/payments",
    },
  ],

  CLIENT: [
    {
      label: "Dashboard",
      path: "/client/dashboard",
    },

    {
      label: "Mes projets",
      path: "/client/projects",
    },

    {
      label: "Messages",
      path: "/client/messages",
    },
  ],
};

/* ============================================================
   MENU UTILISATEUR
   ============================================================ */

export const ROLE_USER_MENU: Readonly<
  Record<AppRole, readonly NavChild[]>
> = {
  FREELANCER: [
    {
      label: "Mon profil",
      path: "/freelancer/profile",
      icon: <User size={14} />,
    },
    {
      label: "Paramètres",
      path: "/freelancer/edit-profile",
      icon: <Settings size={14} />,
    },
  ],

  ENTREPRISE: [
    {
      label: "Mon profil",
      path: "/enterprise/profile",
      icon: <User size={14} />,
    },
    {
      label: "Paramètres",
      path: "/enterprise/settings",
      icon: <Settings size={14} />,
    },
  ],

  ADMIN: [
    {
      label: "Mon profil",
      path: "/admin/profile",
      icon: <User size={14} />,
    },
    {
      label: "Paramètres",
      path: "/admin/settings",
      icon: <Settings size={14} />,
    },
  ],

  CLIENT: [
    {
      label: "Mon profil",
      path: "/client/profile",
      icon: <User size={14} />,
    },
    {
      label: "Paramètres",
      path: "/client/settings",
      icon: <Settings size={14} />,
    },
  ],
};

/* ============================================================
   LABELS
   ============================================================ */

export const ROLE_LABELS: Readonly<Record<AppRole, string>> = {
  FREELANCER: "Freelancer",
  ENTREPRISE: "Entreprise",
  ADMIN: "Administrateur",
  CLIENT: "Client",
};

/* ============================================================
   BADGES
   ============================================================ */

export const ROLE_BADGE_COLORS: Readonly<
  Record<AppRole, { bg: string; color: string }>
> = {
  FREELANCER: {
    bg: "rgba(212,175,55,0.15)",
    color: "#D4AF37",
  },

  ENTREPRISE: {
    bg: "rgba(59,130,246,0.15)",
    color: "#60A5FA",
  },

  ADMIN: {
    bg: "rgba(239,68,68,0.15)",
    color: "#F87171",
  },

  CLIENT: {
    bg: "rgba(34,197,94,0.15)",
    color: "#4ADE80",
  },
};

/* ============================================================
   ICÔNES
   ============================================================ */

export const ROLE_ICON: Readonly<Record<AppRole, ReactNode>> = {
  ADMIN: <ShieldCheck size={11} />,
  ENTREPRISE: <Briefcase size={11} />,
  FREELANCER: <User size={11} />,
  CLIENT: <User size={11} />,
};

/* ============================================================
   DASHBOARD PAR RÔLE
   ============================================================ */

/**
 * Retourne la page d'accueil autorisée pour le rôle.
 *
 * IMPORTANT :
 * Cette fonction ne détermine PAS le rôle.
 * Elle reçoit un rôle déjà authentifié.
 */
export function getRoleHome(role: AppRole | undefined): string {
  if (!role) {
    return "/login";
  }

  switch (role) {
    case APP_ROLES.ADMIN:
      return "/admin/dashboard";

    case APP_ROLES.ENTREPRISE:
      return "/enterprise/dashboard";

    case APP_ROLES.FREELANCER:
      return "/freelancer/dashboard";

    case APP_ROLES.CLIENT:
      return "/client/dashboard";

    default:
      return "/login";
  }
}

/* ============================================================
   PREFIXE D'ESPACE
   ============================================================ */

/**
 * Retourne le préfixe de l'espace correspondant au rôle.
 *
 * Exemple :
 * FREELANCER → /freelancer
 * ENTREPRISE → /enterprise
 * ADMIN → /admin
 * CLIENT → /client
 *
 * IMPORTANT :
 * Cette fonction sert uniquement à vérifier une route.
 * Elle ne doit jamais être utilisée pour déterminer le rôle.
 */
export function getRolePrefix(role: AppRole): string {
  switch (role) {
    case APP_ROLES.ADMIN:
      return "/admin";

    case APP_ROLES.ENTREPRISE:
      return "/enterprise";

    case APP_ROLES.FREELANCER:
      return "/freelancer";

    case APP_ROLES.CLIENT:
      return "/client";

    default:
      return "";
  }
}

/* ============================================================
   VALIDATION DU RÔLE
   ============================================================ */

/**
 * Vérifie qu'une valeur correspond réellement à un AppRole.
 *
 * Utile lorsque le rôle provient d'une source externe
 * comme le JWT ou l'API.
 */
export function isAppRole(value: unknown): value is AppRole {
  return (
    value === APP_ROLES.ADMIN ||
    value === APP_ROLES.ENTREPRISE ||
    value === APP_ROLES.FREELANCER ||
    value === APP_ROLES.CLIENT
  );
}

/* ============================================================
   VALIDATION D'ACCÈS À UN ESPACE
   ============================================================ */

/**
 * Vérifie si une route appartient à l'espace autorisé du rôle.
 *
 * Exemple :
 *
 * isRouteAllowed("FREELANCER", "/freelancer/dashboard")
 * → true
 *
 * isRouteAllowed("FREELANCER", "/admin/dashboard")
 * → false
 */
export function isRouteAllowed(
  role: AppRole | undefined,
  pathname: string
): boolean {
  if (!role || !pathname) {
    return false;
  }

  const prefix = getRolePrefix(role);

  return (
    pathname === prefix ||
    pathname.startsWith(`${prefix}/`)
  );
}

/* ============================================================
   RÉCUPÉRATION DE LA NAVIGATION
   ============================================================ */

/**
 * Retourne uniquement la navigation correspondant au rôle authentifié.
 *
 * Ne jamais passer ici un rôle calculé à partir de l'URL.
 */
export function getNavigationForRole(
  role: AppRole | undefined
): readonly NavItem[] {
  if (!role || !isAppRole(role)) {
    return [];
  }

  return ROLE_NAVIGATION[role];
}

/**
 * Retourne uniquement le menu utilisateur correspondant
 * au rôle authentifié.
 */
export function getUserMenuForRole(
  role: AppRole | undefined
): readonly NavChild[] {
  if (!role || !isAppRole(role)) {
    return [];
  }

  return ROLE_USER_MENU[role];
}