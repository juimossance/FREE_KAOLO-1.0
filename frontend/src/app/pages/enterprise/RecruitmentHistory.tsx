
// src/app/pages/enterprise/RecruitmentHistory.tsx

import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Wallet,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  ArrowUpRight,
  Loader2,
  BriefcaseBusiness,
  CircleDollarSign,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import {
  recruitmentService,
  type Recruitment,
  type RecruitmentStats,
} from "../../../services/recrutementService";

// ─────────────────────────────────────────────────────────────
// Configuration des statuts
// ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  {
    label: string;
    bg: string;
    color: string;
    icon: typeof CheckCircle2;
  }
> = {
  ACCEPTEE: {
    label: "Terminé",
    bg: "#F0FDF4",
    color: "#15803D",
    icon: CheckCircle2,
  },

  EN_COURS: {
    label: "En cours",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    icon: Clock3,
  },

  EN_ATTENTE: {
    label: "En attente",
    bg: "#FFFBEB",
    color: "#A16207",
    icon: Clock3,
  },

  REJETEE: {
    label: "Annulé",
    bg: "#FEF2F2",
    color: "#B91C1C",
    icon: XCircle,
  },
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatFcfa = (n: number) => {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  }

  return `${n.toLocaleString("fr-FR")} FCFA`;
};

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      })
    : "";

const initiales = (prenom?: string, nom?: string) =>
  `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

// ─────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────

export function RecruitmentHistory() {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  const [recrutements, setRecrutements] = useState<Recruitment[]>([]);
  const [stats, setStats] = useState<RecruitmentStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState("Tous");

  // ───────────────────────────────────────────────────────────
  // Chargement
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!entrepriseId) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

     
        const [recrutementsData, statsData] = await Promise.all([
          recruitmentService.getHistorique(),
          recruitmentService.getStats(),
        ]);

        setRecrutements(recrutementsData);
        setStats(statsData);
    
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger l'historique."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [entrepriseId]);

  // ───────────────────────────────────────────────────────────
  // Données dérivées
  // ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (filter === "Tous") return recrutements;

    const statusKey = Object.entries(statusConfig).find(
      ([, value]) => value.label === filter
    )?.[0];

    return statusKey
      ? recrutements.filter((r) => r.status === statusKey)
      : recrutements;
  }, [recrutements, filter]);

  const termines = recrutements.filter(
    (r) => r.status === "ACCEPTEE"
  );

  const totalDepense =
    stats?.totalDepense ??
    termines.reduce((sum, recruitment) => sum + recruitment.montant, 0);

  const notes = termines.filter(
    (recruitment) => recruitment.note && recruitment.note > 0
  );

  const noteMoy =
    stats?.noteMoyenneDonnee ??
    (notes.length > 0
      ? notes.reduce(
          (sum, recruitment) => sum + (recruitment.note ?? 0),
          0
        ) / notes.length
      : 0);

  // ───────────────────────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--navy)" }}
          />

          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Chargement de votre historique...
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Error
  // ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-5 rounded-2xl border bg-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
            <XCircle size={18} className="text-red-600" />
          </div>

          <div>
            <p
              className="font-semibold"
              style={{ color: "var(--navy)" }}
            >
              Impossible de charger l'historique
            </p>

            <p className="text-sm mt-1 text-slate-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Rendu
  // ───────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

      {/* ───────────────── Header ───────────────── */}

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--secondary)",
                  color: "var(--navy)",
                }}
              >
                <BriefcaseBusiness size={16} />
              </div>

              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                Recrutements
              </span>
            </div>

            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: "var(--navy)" }}
            >
              Historique des recrutements
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Suivez vos collaborations passées et en cours.
            </p>
          </div>

          <div
            className="text-sm font-medium"
            style={{ color: "var(--muted-foreground)" }}
          >
            {recrutements.length} recrutement
            {recrutements.length > 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* ───────────────── Stats ───────────────── */}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

        {/* Total recrutements */}
        <div
          className="p-4 sm:p-5 rounded-2xl border bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--secondary)",
                color: "var(--navy)",
              }}
            >
              <Users size={18} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              TOTAL
            </span>
          </div>

          <p
            className="text-xl sm:text-2xl font-bold mt-4"
            style={{ color: "var(--navy)" }}
          >
            {stats?.totalRecrutements ?? recrutements.length}
          </p>

          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Recrutements
          </p>
        </div>

        {/* Projets terminés */}
        <div
          className="p-4 sm:p-5 rounded-2xl border bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-700">
              <CheckCircle2 size={18} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              TERMINÉS
            </span>
          </div>

          <p
            className="text-xl sm:text-2xl font-bold mt-4"
            style={{ color: "var(--navy)" }}
          >
            {stats?.projetsTermines ?? termines.length}
          </p>

          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Projets terminés
          </p>
        </div>

        {/* Note moyenne */}
        <div
          className="p-4 sm:p-5 rounded-2xl border bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "#FAFAF9",
                color: "var(--navy)",
              }}
            >
              <Star size={18} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              ÉVALUATION
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-4">
            <p
              className="text-xl sm:text-2xl font-bold"
              style={{ color: "var(--navy)" }}
            >
              {noteMoy > 0 ? noteMoy.toFixed(1) : "—"}
            </p>

            {noteMoy > 0 && (
              <Star
                size={14}
                fill="var(--gold)"
                style={{ color: "var(--gold)" }}
              />
            )}
          </div>

          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Note moyenne donnée
          </p>
        </div>

        {/* Total dépensé */}
        <div
          className="p-4 sm:p-5 rounded-2xl border bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--secondary)",
                color: "var(--navy)",
              }}
            >
              <Wallet size={18} />
            </div>

            <span className="text-xs font-medium text-slate-400">
              BUDGET
            </span>
          </div>

          <p
            className="text-lg sm:text-xl font-bold mt-4 truncate"
            style={{ color: "var(--navy)" }}
          >
            {formatFcfa(totalDepense)}
          </p>

          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Total dépensé
          </p>
        </div>
      </section>

      {/* ───────────────── Filtres ───────────────── */}

      <section
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        aria-label="Filtres des recrutements"
      >
        {["Tous", "Terminé", "En cours", "En attente", "Annulé"].map(
          (item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap"
                style={{
                  background: active ? "var(--navy)" : "#FFFFFF",
                  color: active
                    ? "#FFFFFF"
                    : "var(--muted-foreground)",
                  borderColor: active
                    ? "var(--navy)"
                    : "var(--border)",
                }}
              >
                {item}
              </button>
            );
          }
        )}
      </section>

      {/* ───────────────── Liste ───────────────── */}

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl border bg-white px-5 py-14 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
            style={{
              background: "var(--secondary)",
              color: "var(--navy)",
            }}
          >
            <FileText size={20} />
          </div>

          <p
            className="font-semibold mt-4"
            style={{ color: "var(--navy)" }}
          >
            Aucun recrutement trouvé
          </p>

          <p
            className="text-sm mt-1 max-w-md mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            {filter !== "Tous"
              ? "Essayez un autre filtre pour afficher davantage de résultats."
              : "Publiez des projets pour commencer à recruter des freelancers."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">

          {filtered.map((rec) => {
            const status =
              statusConfig[rec.status] ??
              statusConfig.EN_ATTENTE;

            const StatusIcon = status.icon;

            return (
              <article
                key={rec.id}
                className="group p-4 sm:p-5 lg:p-6 rounded-2xl border bg-white transition-all hover:shadow-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start gap-3 sm:gap-4">

                  {/* Avatar */}

                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--navy)",
                    }}
                  >
                    {rec.freelancerAvatar ??
                      initiales(
                        rec.freelancerPrenom,
                        rec.freelancerNom
                      )}
                  </div>

                  {/* Contenu */}

                  <div className="flex-1 min-w-0">

                    {/* Titre */}

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div className="min-w-0">
                        <h4
                          className="font-semibold text-sm sm:text-base truncate"
                          style={{ color: "var(--navy)" }}
                        >
                          {rec.projetTitre}
                        </h4>

                        <p
                          className="text-xs sm:text-sm mt-1 truncate"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {rec.freelancerPrenom}{" "}
                          {rec.freelancerNom}
                        </p>

                        {rec.projetCategorie && (
                          <span
                            className="inline-flex mt-2 px-2 py-1 rounded-lg text-xs font-medium"
                            style={{
                              background: "var(--secondary)",
                              color: "var(--navy)",
                            }}
                          >
                            {rec.projetCategorie}
                          </span>
                        )}
                      </div>

                      {/* Statut */}

                      <span
                        className="inline-flex items-center gap-1.5 self-start px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                        style={{
                          background: status.bg,
                          color: status.color,
                        }}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>
                    </div>

                    {/* Informations */}

                    <div
                      className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />

                        {formatDate(rec.dateDebut)}

                        {rec.dateFin
                          ? ` → ${formatDate(rec.dateFin)}`
                          : " · en cours"}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <CircleDollarSign size={13} />

                        {formatFcfa(rec.montant)}
                      </span>
                    </div>

                    {/* Note */}

                    {rec.note && rec.note > 0 && (
                      <div
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-4 p-3 rounded-xl"
                        style={{
                          background: "#FAFAF9",
                        }}
                      >
                        <div className="flex gap-0.5">
                          {Array.from({
                            length: rec.note,
                          }).map((_, index) => (
                            <Star
                              key={index}
                              size={13}
                              fill="var(--gold)"
                              style={{
                                color: "var(--gold)",
                              }}
                            />
                          ))}
                        </div>

                        {rec.commentaire && (
                          <p
                            className="text-xs italic line-clamp-2"
                            style={{
                              color: "var(--foreground)",
                            }}
                          >
                            "{rec.commentaire}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action */}

                  <a
                    href={`/enterprise/projects/${rec.candidatureId}`}
                    aria-label={`Voir le projet ${rec.projetTitre}`}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100"
                    style={{
                      color: "var(--navy)",
                    }}
                  >
                    <ArrowUpRight size={17} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

