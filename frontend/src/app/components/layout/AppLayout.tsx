
// src/components/layout/AppLayout.tsx

import { Outlet, useLocation } from "react-router";
import {
  Search,
  Command,
  ChevronRight,
  Home,
} from "lucide-react";

import { Navbar } from "./Navbar";

/**
 * ============================================================
 * PAGE TITLES
 * ============================================================
 */

const pageTitles: Record<string, string> = {
  "/freelancer/dashboard": "Tableau de bord",
  "/freelancer/profile": "Mon profil",
  "/freelancer/edit-profile": "Modifier le profil",
  "/freelancer/portfolio": "Portfolio",
  "/freelancer/certifications": "Certifications",
  "/freelancer/documents": "Documents",
  "/freelancer/projects": "Historique des projets",
  "/freelancer/applications": "Candidatures envoyées",
  "/freelancer/ratings": "Évaluations & notes",
  "/freelancer/payments": "Paiements reçus",
  "/freelancer/notifications": "Notifications",

  "/enterprise/dashboard": "Tableau de bord",
  "/enterprise/post-project": "Publier un projet",
  "/enterprise/projects": "Mes projets",
  "/enterprise/search": "Recherche de talents",
  "/enterprise/applications": "Gestion des candidatures",
  "/enterprise/candidates": "Sélection des candidats",
  "/enterprise/history": "Historique des recrutements",

  "/messages": "Messagerie",
  "/ai": "Assistant IA",
  "/payments": "Paiements",

  "/admin/dashboard": "Administration",
  "/admin/users": "Gestion des utilisateurs",
  "/admin/certifications": "Validation des certifications",
  "/admin/stats": "Statistiques plateforme",
  "/admin/reports": "Gestion des signalements",
  "/admin/payments": "Gestion des paiements",
};

/**
 * ============================================================
 * PAGE TITLE RESOLVER
 * ============================================================
 */

function getPageTitle(pathname: string): string {
  const exactTitle = pageTitles[pathname];

  if (exactTitle) {
    return exactTitle;
  }

  const matchingRoute = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname.startsWith(route));

  return matchingRoute
    ? pageTitles[matchingRoute]
    : "free-kaolo";
}

/**
 * ============================================================
 * SECTION RESOLVER
 * ============================================================
 *
 * Permet d'afficher une information contextuelle discrète
 * dans le header sans surcharger l'interface.
 */

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith("/freelancer")) {
    return "Espace freelance";
  }

  if (pathname.startsWith("/enterprise")) {
    return "Espace entreprise";
  }

  if (pathname.startsWith("/admin")) {
    return "Administration";
  }

  if (pathname.startsWith("/messages")) {
    return "Communication";
  }

  if (pathname.startsWith("/ai")) {
    return "Outils";
  }

  if (pathname.startsWith("/payments")) {
    return "Finance";
  }

  return "Espace personnel";
}

/**
 * ============================================================
 * APP LAYOUT
 * ============================================================
 */

export function AppLayout() {
  const location = useLocation();

  const title = getPageTitle(location.pathname);
  const section = getSectionLabel(location.pathname);

  const isDashboard =
    location.pathname.endsWith("/dashboard");

  return (
   <div
      className="h-screen flex flex-col overflow-hidden" // ⬅️ min-h-screen → h-screen + overflow-hidden
      style={{ background: "#F7F8FA", color: "#07111D" }}
    >
      <Navbar />

      <div className="flex flex-1 min-h-0 flex-col pt-16"> {/* ⬅️ min-h-screen → flex-1 min-h-0 + overflow-hidden */}
       
        {/* ====================================================
            SECONDARY HEADER
            ==================================================== */}

        <header
          className="sticky top-16 z-30 flex min-h-[60px] flex-shrink-0 items-center border-b bg-white/95 backdrop-blur-xl"
          style={{
            borderColor: "rgba(7,17,29,.07)",
          }}
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            {/* ================================================
                PAGE CONTEXT
                ================================================ */}

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                {/* Home icon */}

                <div
                  className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:flex"
                  style={{
                    background: "#F7F3EA",
                    color: "#A77A21",
                  }}
                >
                  <Home size={14} strokeWidth={2} />
                </div>

                {/* Breadcrumb separator */}

                <ChevronRight
                  size={13}
                  className="hidden shrink-0 text-slate-300 sm:block"
                />

                {/* Section */}

                <span
                  className="hidden shrink-0 text-[11px] font-medium sm:block"
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  {section}
                </span>

                <ChevronRight
                  size={13}
                  className="hidden shrink-0 text-slate-300 sm:block"
                />

                {/* Current page */}

                <h1
                  className="truncate text-sm font-bold tracking-[-0.01em] sm:text-[15px]"
                  style={{
                    color: "#07111D",
                  }}
                >
                  {title}
                </h1>
              </div>

              {/* Dashboard contextual message */}

              {isDashboard && (
                <p
                  className="mt-0.5 hidden text-[10px] sm:block"
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  Gérez votre activité depuis votre espace.
                </p>
              )}
            </div>

            {/* ================================================
                DESKTOP SEARCH
                ================================================ */}

            <div
              className="group hidden h-9 w-56 items-center gap-2 rounded-xl border px-3 transition-all md:flex lg:w-64"
              style={{
                background: "#F8FAFC",
                borderColor: "#E2E8F0",
              }}
            >
              <Search
                size={15}
                className="shrink-0 text-slate-400 transition-colors group-focus-within:text-[#A77A21]"
              />

              <input
                type="search"
                placeholder="Rechercher..."
                aria-label="Rechercher"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                style={{
                  color: "#07111D",
                }}
              />

              {/* Keyboard shortcut */}

              <div
                className="hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 lg:flex"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E2E8F0",
                }}
              >
                <Command
                  size={10}
                  style={{
                    color: "#94A3B8",
                  }}
                />

                <span
                  className="text-[9px] font-medium"
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  K
                </span>
              </div>
            </div>

            {/* ================================================
                MOBILE SEARCH
                ================================================ */}

            <button
              type="button"
              aria-label="Rechercher"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all hover:bg-slate-50 md:hidden"
              style={{
                background: "#FFFFFF",
                borderColor: "#E2E8F0",
                color: "#475569",
              }}
            >
              <Search size={16} />
            </button>
          </div>
        </header>

        {/* ====================================================
            PAGE CONTENT
            ==================================================== */}

           <main
          id="main-content"
          className="mx-auto w-full max-w-[1600px] flex-1 min-h-0 overflow-y-auto" // ⬅️ flex-1 seul → flex-1 min-h-0 overflow-y-auto
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

