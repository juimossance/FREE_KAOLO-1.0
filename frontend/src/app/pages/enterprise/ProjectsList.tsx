
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  PlusCircle,
  Edit3,
  Wallet,
  Search,
  Eye,
  Activity,
  Users,
  BriefcaseBusiness,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  MapPin,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { projetService } from "../../../services/projetService";

/* =========================================================
   TYPES
========================================================= */

interface Projet {
  id: number;
  titre: string;
  description: string;
  budget: number;
  categorie?: string;
  datePublication: string;
  deadline?: string;
  duree?: string;
  experience?: string;
  lieu?: string;
  statut: string;
  urgent: boolean;
  visibilite: string;
  vues: number;
  nombreCandidatures: number;
  progression?: number;
}

type StatusKey =
  | "Ouvert"
  | "En cours"
  | "Terminé"
  | "Suspendu";

interface StatusConfig {
  label: string;
  bg: string;
  color: string;
  icon: React.ReactNode;
}

/* =========================================================
   CONFIGURATION DES STATUTS
========================================================= */

const statusConfig: Record<StatusKey, StatusConfig> = {
  Ouvert: {
    label: "Ouvert",
    bg: "#ECFDF5",
    color: "#047857",
    icon: <CheckCircle2 size={13} />,
  },

  "En cours": {
    label: "En cours",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    icon: <Activity size={13} />,
  },

  Terminé: {
    label: "Terminé",
    bg: "#F3F4F6",
    color: "#374151",
    icon: <CheckCircle2 size={13} />,
  },

  Suspendu: {
    label: "Suspendu",
    bg: "#FFFBEB",
    color: "#B45309",
    icon: <PauseCircle size={13} />,
  },
};

/* =========================================================
   TRANSITIONS AUTORISÉES
========================================================= */

const allowedTransitions: Record<StatusKey, StatusKey[]> = {
  Ouvert: ["En cours", "Suspendu"],
  "En cours": ["Terminé", "Suspendu"],
  Suspendu: ["Ouvert", "En cours"],
  Terminé: [],
};

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export function ProjectsList() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tous" | StatusKey>("Tous");

  /**
   * ID du projet dont le statut est actuellement en modification.
   */
  const [changingStatusId, setChangingStatusId] = useState<number | null>(
    null
  );

  /* =======================================================
     CHARGEMENT DES PROJETS
  ======================================================= */

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * L'identité de l'entreprise est déterminée
         * côté backend à partir du JWT.
         *
         * Aucun entrepriseId envoyé par le frontend.
         */
        const data = await projetService.getMesProjet();

        setProjects(data ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les projets."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  /* =======================================================
     CHANGEMENT DE STATUT
  ======================================================= */

  const handleChangeStatus = async (
    projetId: number,
    nouveauStatut: StatusKey
  ) => {
    const project = projects.find((p) => p.id === projetId);

    if (!project) {
      return;
    }

    const ancienStatut = project.statut as StatusKey;

    /*
     * Aucun changement si le statut sélectionné
     * est déjà celui du projet.
     */
    if (ancienStatut === nouveauStatut) {
      return;
    }

    /*
     * Vérification côté frontend.
     *
     * Le backend doit également effectuer cette vérification.
     */
    const transitionsAutorisees =
      allowedTransitions[ancienStatut] ?? [];

    if (!transitionsAutorisees.includes(nouveauStatut)) {
      setError(
        `Impossible de passer le projet de "${ancienStatut}" à "${nouveauStatut}".`
      );

      return;
    }

    /*
     * Confirmation supplémentaire avant de terminer
     * définitivement un projet.
     */
    if (nouveauStatut === "Terminé") {
      const confirmed = window.confirm(
        `Voulez-vous vraiment marquer le projet "${project.titre}" comme terminé ?\n\nCette action indique que le projet est finalisé.`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setChangingStatusId(projetId);
      setError(null);

      const updatedProject =
        await projetService.changerStatut(
          projetId,
          nouveauStatut
        );

      /*
       * Mise à jour immédiate du projet dans la liste.
       *
       * On utilise le statut retourné par le backend
       * comme source de vérité.
       */
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === projetId
            ? {
                ...currentProject,
                statut: updatedProject.statut,
              }
            : currentProject
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut du projet."
      );
    } finally {
      setChangingStatusId(null);
    }
  };

  /* =======================================================
     FILTRAGE
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.titre?.toLowerCase().includes(normalizedSearch) ||
        project.categorie?.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "Tous" || project.statut === filter;

      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const stats = useMemo(
    () => [
      {
        label: "Projets ouverts",
        value: projects.filter((p) => p.statut === "Ouvert").length,
        icon: <BriefcaseBusiness size={18} />,
        bg: "#ECFDF5",
        color: "#047857",
      },
      {
        label: "En cours",
        value: projects.filter((p) => p.statut === "En cours").length,
        icon: <Activity size={18} />,
        bg: "#EFF6FF",
        color: "#1D4ED8",
      },
      {
        label: "Terminés",
        value: projects.filter((p) => p.statut === "Terminé").length,
        icon: <CheckCircle2 size={18} />,
        bg: "#F3F4F6",
        color: "#374151",
      },
      {
        label: "Suspendus",
        value: projects.filter((p) => p.statut === "Suspendu").length,
        icon: <PauseCircle size={18} />,
        bg: "#FFFBEB",
        color: "#B45309",
      },
    ],
    [projects]
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />

          <p className="text-sm text-slate-500">
            Chargement de vos projets...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR GLOBAL
  ======================================================= */

  if (error && projects.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 mt-0.5 flex-shrink-0"
            />

            <div>
              <h3 className="font-semibold text-red-900">
                Impossible de charger les projets
              </h3>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #0F172A, #1E293B)",
                }}
              >
                <BriefcaseBusiness
                  size={17}
                  className="text-white"
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Espace entreprise
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--navy)" }}
            >
              Mes projets
            </h1>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Publiez, gérez et suivez l'exécution de vos projets.
            </p>
          </div>

          <Link
            to="/enterprise/post-project"
            className="
              inline-flex items-center justify-center gap-2
              px-4 sm:px-5 py-2.5
              rounded-xl
              text-sm font-semibold
              transition-all
              hover:-translate-y-0.5
              hover:shadow-lg
              w-full sm:w-auto
            "
            style={{
              background: "var(--navy)",
              color: "#FFFFFF",
            }}
          >
            <PlusCircle size={17} />
            Nouveau projet
          </Link>
        </header>

        {/* =================================================
            ERROR NON BLOQUANTE
        ================================================= */}

        {error && projects.length > 0 && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={17}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />

              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-3 sm:gap-4
            mb-7
          "
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                bg-white
                border
                rounded-2xl
                p-4
                sm:p-5
                transition-all
                hover:shadow-sm
              "
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>

                  <p
                    className="text-xs sm:text-sm mt-1"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: stat.bg,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="mb-6">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search */}

            <div className="relative flex-1">
              <Search
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou catégorie..."
                className="
                  w-full
                  pl-10
                  pr-10
                  py-3
                  rounded-xl
                  text-sm
                  border
                  bg-white
                  outline-none
                  transition-all
                  focus:ring-2
                  focus:ring-slate-200
                "
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-700
                  "
                  aria-label="Effacer la recherche"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filters */}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                "Tous",
                "Ouvert",
                "En cours",
                "Terminé",
                "Suspendu",
              ].map((status) => {
                const active = filter === status;

                return (
                  <button
                    key={status}
                    onClick={() =>
                      setFilter(status as "Tous" | StatusKey)
                    }
                    className="
                      flex-shrink-0
                      px-3.5
                      py-2.5
                      rounded-xl
                      text-xs
                      sm:text-sm
                      font-medium
                      border
                      transition-all
                    "
                    style={{
                      background: active
                        ? "var(--navy)"
                        : "#FFFFFF",
                      borderColor: active
                        ? "var(--navy)"
                        : "var(--border)",
                      color: active
                        ? "#FFFFFF"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {filteredProjects.length}
            </span>{" "}
            projet
            {filteredProjects.length !== 1 ? "s" : ""}
          </p>

          {search || filter !== "Tous" ? (
            <button
              onClick={() => {
                setSearch("");
                setFilter("Tous");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>

        {/* =================================================
            PROJECTS
        ================================================= */}

        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const status =
              statusConfig[project.statut as StatusKey] ?? {
                label: project.statut,
                bg: "#F3F4F6",
                color: "#374151",
                icon: <AlertCircle size={13} />,
              };

            const currentStatus =
              project.statut as StatusKey;

            const isChangingStatus =
              changingStatusId === project.id;

            const availableStatuses =
              allowedTransitions[currentStatus] ?? [];

            const canTrackProgress =
              project.statut === "En cours";

            return (
              <article
                key={project.id}
                className="
                  bg-white
                  border
                  rounded-2xl
                  overflow-hidden
                  transition-all
                  hover:shadow-md
                "
                style={{
                  borderColor: "var(--border)",
                }}
              >
                <div className="p-4 sm:p-5">

                  {/* =======================================
                      TOP
                  ======================================= */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <Link
                          to={`/enterprise/projects/${project.id}`}
                          className="
                            text-base
                            sm:text-lg
                            font-semibold
                            hover:underline
                            truncate
                          "
                          style={{
                            color: "var(--navy)",
                          }}
                        >
                          {project.titre}
                        </Link>

                        {project.urgent && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              px-2
                              py-1
                              rounded-full
                              text-[11px]
                              font-semibold
                            "
                            style={{
                              background: "#FEF2F2",
                              color: "#B91C1C",
                            }}
                          >
                            <AlertCircle size={12} />
                            Prioritaire
                          </span>
                        )}
                      </div>

                      {/* CATEGORY + METADATA */}

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

                        {project.categorie && (
                          <span
                            className="
                              inline-flex
                              items-center
                              px-2.5
                              py-1
                              rounded-lg
                              font-medium
                            "
                            style={{
                              background: "var(--secondary)",
                              color: "var(--navy)",
                            }}
                          >
                            {project.categorie}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1">
                          <Wallet size={13} />
                          {project.budget?.toLocaleString("fr-FR")} FCFA
                        </span>

                        {project.deadline && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            Échéance{" "}
                            {new Date(
                              project.deadline
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        )}

                        {project.lieu && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} />
                            {project.lieu}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ===================================
                        STATUS
                    =================================== */}

                    <div className="flex-shrink-0">

                      <div className="relative">

                        <select
                          value={project.statut}
                          disabled={
                            isChangingStatus ||
                            currentStatus === "Terminé"
                          }
                          onChange={(e) =>
                            handleChangeStatus(
                              project.id,
                              e.target.value as StatusKey
                            )
                          }
                          className="
                            appearance-none
                            inline-flex
                            items-center
                            pl-3
                            pr-8
                            py-2
                            rounded-full
                            text-xs
                            font-semibold
                            border
                            outline-none
                            transition-all
                            cursor-pointer
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                            focus:ring-2
                            focus:ring-slate-200
                          "
                          style={{
                            background: status.bg,
                            color: status.color,
                            borderColor: status.color,
                          }}
                          aria-label={`Changer le statut du projet ${project.titre}`}
                        >
                          <option value={project.statut}>
                            {project.statut}
                          </option>

                          {availableStatuses.map(
                            (availableStatus) => (
                              <option
                                key={availableStatus}
                                value={availableStatus}
                              >
                                {availableStatus}
                              </option>
                            )
                          )}
                        </select>

                        {isChangingStatus ? (
                          <Loader2
                            size={13}
                            className="
                              absolute
                              right-2.5
                              top-1/2
                              -translate-y-1/2
                              animate-spin
                              pointer-events-none
                            "
                            style={{
                              color: status.color,
                            }}
                          />
                        ) : (
                          <ChevronDown
                            size={13}
                            className="
                              absolute
                              right-2.5
                              top-1/2
                              -translate-y-1/2
                              pointer-events-none
                            "
                            style={{
                              color: status.color,
                            }}
                          />
                        )}
                      </div>

                      {currentStatus === "Terminé" && (
                        <p className="text-[10px] text-slate-400 mt-1 text-right">
                          Projet finalisé
                        </p>
                      )}

                    </div>
                  </div>

                  {/* =======================================
                      DESCRIPTION
                  ======================================= */}

                  {project.description && (
                    <p
                      className="
                        text-sm
                        leading-relaxed
                        mt-4
                        line-clamp-2
                      "
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                  {/* =======================================
                      PROJECT METRICS
                  ======================================= */}

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-2
                      mt-4
                      pt-4
                      border-t
                      text-xs
                    "
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >

                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} />
                      {project.nombreCandidatures ?? 0} candidature
                      {(project.nombreCandidatures ?? 0) > 1
                        ? "s"
                        : ""}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={14} />
                      {project.vues ?? 0} vue
                      {(project.vues ?? 0) > 1 ? "s" : ""}
                    </span>

                    {project.experience && (
                      <span>
                        Expérience : {project.experience}
                      </span>
                    )}

                    <span>
                      Publié le{" "}
                      {project.datePublication
                        ? new Date(
                            project.datePublication
                          ).toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                  </div>

                  {/* =======================================
                      PROGRESS PREVIEW
                  ======================================= */}

                  {project.statut === "En cours" && (
                    <div
                      className="
                        mt-4
                        rounded-xl
                        border
                        p-3.5
                      "
                      style={{
                        background: "#F8FAFC",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-2">

                          <div
                            className="
                              w-7
                              h-7
                              rounded-lg
                              flex
                              items-center
                              justify-center
                            "
                            style={{
                              background: "#EFF6FF",
                              color: "#1D4ED8",
                            }}
                          >
                            <Activity size={14} />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              Suivi du projet
                            </p>

                            <p className="text-[11px] text-slate-500">
                              Avancement communiqué par le freelancer
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-blue-700">
                          {typeof project.progression === "number"
                            ? `${project.progression}%`
                            : "À suivre"}
                        </span>
                      </div>

                      {typeof project.progression === "number" && (
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  project.progression
                                )
                              )}%`,
                              background:
                                "linear-gradient(90deg, #1D4ED8, #3B82F6)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* =======================================
                      ACTIONS
                  ======================================= */}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">

                    <div className="flex items-center gap-2">

                      {/* VOIR = DETAILS */}

                      <Link
                        to={`/enterprise/projects/${project.id}`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-3.5
                          py-2.5
                          rounded-xl
                          text-xs
                          font-semibold
                          border
                          transition-all
                          hover:bg-slate-50
                        "
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--navy)",
                        }}
                      >
                        <Eye size={14} />
                        Voir le projet
                      </Link>

                      {/* MODIFIER */}

                      <Link
                        to={`/enterprise/edit-project/${project.id}`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-3.5
                          py-2.5
                          rounded-xl
                          text-xs
                          font-semibold
                          transition-all
                          hover:bg-slate-100
                        "
                        style={{
                          background: "var(--secondary)",
                          color: "var(--navy)",
                        }}
                      >
                        <Edit3 size={14} />
                        Modifier
                      </Link>

                    </div>

                    {/* SUIVRE = EXECUTION */}

                    {canTrackProgress ? (
                      <Link
                        to={`/enterprise/projects/${project.id}/progress`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          text-xs
                          font-semibold
                          transition-all
                          hover:-translate-y-0.5
                          hover:shadow-md
                          w-full
                          sm:w-auto
                        "
                        style={{
                          background:
                            "linear-gradient(135deg, #0F172A, #1E293B)",
                          color: "#FFFFFF",
                        }}
                      >
                        <Activity size={14} />
                        Suivre
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          text-xs
                          font-medium
                          w-full
                          sm:w-auto
                        "
                        style={{
                          background: "#F8FAFC",
                          color: "#94A3B8",
                        }}
                      >
                        <Activity size={14} />
                        Suivi disponible en cours
                      </span>
                    )}

                  </div>
                </div>
              </article>
            );
          })}

          {/* =============================================
              EMPTY STATE
          ============================================= */}

          {filteredProjects.length === 0 && (
            <div
              className="
                bg-white
                border
                rounded-2xl
                py-14
                px-5
                text-center
              "
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-4
                "
                style={{
                  background: "var(--secondary)",
                  color: "var(--navy)",
                }}
              >
                <Search size={20} />
              </div>

              <h3
                className="font-semibold"
                style={{
                  color: "var(--navy)",
                }}
              >
                Aucun projet trouvé
              </h3>

              <p
                className="text-sm mt-1 max-w-sm mx-auto"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                Aucun projet ne correspond à votre recherche ou
                aux filtres sélectionnés.
              </p>

              {(search || filter !== "Tous") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("Tous");
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    mt-5
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-semibold
                  "
                  style={{
                    background: "var(--navy)",
                    color: "#FFFFFF",
                  }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            TRUST FOOTER
        ================================================= */}

        {projects.length > 0 && (
          <div
            className="
              mt-6
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-3
              rounded-2xl
              border
              bg-white
              px-4
              py-3.5
            "
            style={{
              borderColor: "var(--border)",
            }}
          >
            <div
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
                flex-shrink-0
              "
              style={{
                background: "#ECFDF5",
                color: "#047857",
              }}
            >
              <CheckCircle2 size={16} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Suivi transparent
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Les informations d'avancement sont communiquées
                par les freelances affectés au projet.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
