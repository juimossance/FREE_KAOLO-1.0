import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Users,
  Clock3,
  WalletCards,
  UserCheck,
  Filter,
  ChevronDown,
  BriefcaseBusiness,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { CandidatureEntreprise, changerStatusCandidature, getCandidaturesEntreprise, StatusCandidature } from "../../../services/candidatureEntrepriseService";
import { apiFetch } from "../../../services/http";



const statusConfig: Record<
  StatusCandidature,
  {
    bg: string;
    color: string;
    border: string;
    label: string;
  }
> = {
  EN_ATTENTE: {
    bg: "#FFF7ED",
    color: "#9A3412",
    border: "#FED7AA",
    label: "À traiter",
  },

  EN_COURS: {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
    label: "Présélectionné",
  },

  ACCEPTEE: {
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
    label: "Acceptée",
  },

  REJETEE: {
    bg: "#FEF2F2",
    color: "#B91C1C",
    border: "#FECACA",
    label: "Rejetée",
  },
};


const filters = [
  { key: "Toutes", label: "Toutes" },
  { key: "EN_ATTENTE", label: "À traiter" },
  { key: "EN_COURS", label: "Présélectionnées" },
  { key: "ACCEPTEE", label: "Acceptées" },
  { key: "REJETEE", label: "Rejetées" },
];

export function ManageApplications() {
  const { user } = useAuth();

  const entrepriseId = user?.entrepriseId;

  const [candidatures, setCandidatures] = useState<
    CandidatureEntreprise[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Toutes");

  const [updating, setUpdating] = useState<number | null>(null);

  const [pendingAction, setPendingAction] = useState<{
    candidatureId: number;
    status: StatusCandidature;
    candidateName: string;
  } | null>(null);

  /**
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  const fetchApplications = async () => {
    if (!entrepriseId) return;

    try {
      setLoading(true);
      setError(null);

      /*
       * IMPORTANT :
       * Idéalement, ton backend devrait identifier l'entreprise
       * directement depuis le JWT.
       *
       * Exemple :
       * candidatureEntrepriseService.getMine()
       *
       * Si ton service actuel nécessite encore entrepriseId,
       * conserve getAll(entrepriseId).
       */

      const data =await getCandidaturesEntreprise();

      setCandidatures(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les candidatures."
      );
    } finally {
      setLoading(false);
    }
  };
  const [contactingId, setContactingId] = useState<number | null>(null);

const handleContact = async (freelancerId: number) => {
  setContactingId(freelancerId);
  try {
    const conversation = await apiFetch<{ id: number }>("/conversations/start", {
      method: "POST",
      body: JSON.stringify({ targetUserId: freelancerId }),
    });

    window.location.href = `/messages?conversationId=${conversation.id}`;
  } catch (err) {
    console.error(err);
    // TODO: afficher une notification d'erreur à l'utilisateur
  } finally {
    setContactingId(null);
  }
};

  useEffect(() => {
    fetchApplications();
  }, [entrepriseId]);

  /**
   * ============================================================
   * CHANGEMENT DE STATUT
   * ============================================================
   */

  const executeStatusChange = async (
    candidatureId: number,
    status: StatusCandidature
  ) => {
    try {
      setUpdating(candidatureId);

      const updated =await changerStatusCandidature(candidatureId, status);

      setCandidatures((prev) =>
        prev.map((c) =>
          c.id === candidatureId
            ? {
                ...c,
           status: updated.status,
              }
            : c
        )
      );
    } catch (err) {
      console.error("Erreur changement statut :", err);
    } finally {
      setUpdating(null);
      setPendingAction(null);
    }
  };
const handleStatusChange = async (
  candidatureId: number,
  status: StatusCandidature
) => {
  try {
    setUpdating(candidatureId);

    const updated = await changerStatusCandidature(
      candidatureId,
      status
    );

    setCandidatures((prev) =>
      prev.map((c) =>
        c.id === candidatureId
          ? {
              ...c,
              status: updated.status,
            }
          : c
      )
    );
  } catch (err) {
    console.error("Erreur changement statut :", err);

    setError(
      err instanceof Error
        ? err.message
        : "Impossible de modifier le statut."
    );
  } finally {
    setUpdating(null);
  }
};
  const requestStatusChange = (
    candidatureId: number,
    status: StatusCandidature,
    candidateName: string
  ) => {
    /**
     * Une acceptation ou un rejet est une décision métier.
     * On demande donc une confirmation.
     */
    setPendingAction({
      candidatureId,
      status,
      candidateName,
    });
  };

  /**
   * ============================================================
   * FILTRAGE
   * ============================================================
   */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidatures.filter((c) => {
      const candidateName =
        `${c.freelancerPrenom ?? ""} ${
          c.freelancerNom ?? ""
        }`.toLowerCase();

      const projectName =
        c.projetTitre?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        candidateName.includes(query) ||
        projectName.includes(query);

      const matchesFilter =
        filter === "Toutes" ||
        c.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [candidatures, search, filter]);

  /**
   * ============================================================
   * STATS
   * ============================================================
   */

  const stats = useMemo(
    () => ({
      total: candidatures.length,

      pending: candidatures.filter(
        (c) => c.status === "EN_ATTENTE"
      ).length,

     shortlisted: candidatures.filter(
        (c) => c.status === "EN_COURS"
      ).length,

      accepted: candidatures.filter(
        (c) => c.status === "ACCEPTEE"
      ).length,
    }),
    [candidatures]
  );

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl bg-slate-100"
            />
          ))}
        </div>

        <div className="h-16 rounded-2xl bg-slate-100" />

        <div className="h-72 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  /**
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "#FEF2F2",
          borderColor: "#FECACA",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "#FEE2E2",
              color: "#B91C1C",
            }}
          >
            <AlertCircle size={20} />
          </div>

          <div className="flex-1">
            <h3
              className="font-semibold"
              style={{ color: "#991B1B" }}
            >
              Impossible de charger les candidatures
            </h3>

            <p
              className="text-sm mt-1"
              style={{ color: "#B91C1C" }}
            >
              {error}
            </p>

            <button
              onClick={fetchApplications}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "var(--navy)",
                color: "#FFFFFF",
              }}
            >
              <RefreshCw size={14} />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "#ECFDF5",
                color: "#047857",
              }}
            >
              <UserCheck size={16} />
            </div>

            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#047857" }}
            >
              Recrutement
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--navy)" }}
          >
            Gestion des candidatures
          </h1>

          <p
            className="text-sm mt-1 max-w-2xl"
            style={{ color: "var(--muted-foreground)" }}
          >
            Évaluez les profils, comparez les propositions et
            prenez vos décisions avec les informations essentielles.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border self-start lg:self-auto"
          style={{
            background: "#F8FAFC",
            borderColor: "var(--border)",
          }}
        >
          <Users
            size={15}
            style={{ color: "var(--navy)" }}
          />

          <span
            className="text-xs font-semibold"
            style={{ color: "var(--navy)" }}
          >
            {stats.total} candidature
            {stats.total > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* =====================================================
          TRUST SUMMARY
      ===================================================== */}

      <div
        className="rounded-2xl border p-4 flex items-start gap-3"
        style={{
          background: "#F0FDF4",
          borderColor: "#BBF7D0",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "#DCFCE7",
            color: "#15803D",
          }}
        >
          <CheckCircle2 size={18} />
        </div>

        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "#166534" }}
          >
            Prenez une décision informée
          </p>

          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: "#15803D" }}
          >
            Consultez le profil, les compétences, la note et la
            proposition avant de présélectionner ou d'accepter
            un candidat.
          </p>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <button
          onClick={() => setFilter("Toutes")}
          className="text-left p-4 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor:
              filter === "Toutes"
                ? "var(--navy)"
                : "var(--border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "#F1F5F9",
                color: "var(--navy)",
              }}
            >
              <Users size={17} />
            </div>

            <ArrowUpRight
              size={15}
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>

          <p
            className="text-2xl font-bold mt-4"
            style={{ color: "var(--navy)" }}
          >
            {stats.total}
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Total reçu
          </p>
        </button>

        <button
          onClick={() => setFilter("EN_ATTENTE")}
          className="text-left p-4 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor:
              filter === "EN_ATTENTE"
                ? "#F59E0B"
                : "var(--border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "#FFF7ED",
              color: "#C2410C",
            }}
          >
            <Clock3 size={17} />
          </div>

          <p
            className="text-2xl font-bold mt-4"
            style={{ color: "#9A3412" }}
          >
            {stats.pending}
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            À traiter
          </p>
        </button>

        <button
          onClick={() => setFilter("EN_COURS")}
          className="text-left p-4 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor:
              filter === "EN_COURS"
                ? "#2563EB"
                : "var(--border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "#EFF6FF",
              color: "#2563EB",
            }}
          >
            <UserCheck size={17} />
          </div>

          <p
            className="text-2xl font-bold mt-4"
            style={{ color: "#1D4ED8" }}
          >
            {stats.shortlisted}
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            En cours
          </p>
        </button>

        <button
          onClick={() => setFilter("ACCEPTEE")}
          className="text-left p-4 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor:
              filter === "ACCEPTEE"
                ? "#10B981"
                : "var(--border)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "#ECFDF5",
              color: "#047857",
            }}
          >
            <CheckCircle2 size={17} />
          </div>

          <p
            className="text-2xl font-bold mt-4"
            style={{ color: "#047857" }}
          >
            {stats.accepted}
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            Acceptées
          </p>
        </button>

      </div>

      {/* =====================================================
          SEARCH / FILTERS
      ===================================================== */}

      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un candidat ou un projet..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-slate-900/10"
              style={{
                borderColor: "var(--border)",
                background: "#FFFFFF",
                color: "var(--foreground)",
              }}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "#F8FAFC",
                color: "var(--muted-foreground)",
              }}
            >
              <Filter size={14} />
              <span className="text-xs font-medium">
                Filtre
              </span>
            </div>

          
          </div>

        </div>

        <div className="flex items-center justify-between mt-3 px-1">
          <p
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {filtered.length} résultat
            {filtered.length > 1 ? "s" : ""}
          </p>

          {(search || filter !== "Toutes") && (
            <button
              onClick={() => {
                setSearch("");
                setFilter("Toutes");
              }}
              className="text-xs font-semibold"
              style={{ color: "var(--navy)" }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          APPLICATIONS
      ===================================================== */}

      <div
        className="rounded-2xl border bg-white overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >

        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "var(--border)",
                  background: "#F8FAFC",
                }}
              >
                <th className="text-left px-5 py-4 text-xs font-semibold">
                  Candidat
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold">
                  Projet
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold">
                  Évaluation
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold">
                  Proposition
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold">
                  Statut
                </th>

                <th className="text-right px-5 py-4 text-xs font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((app) => {
                const s =
                  statusConfig[app.status] ??
                  statusConfig.EN_ATTENTE;

                const isUpdating =
                  updating === app.id;

                return (
                  <tr
                    key={app.id}
                    className="border-b last:border-0 hover:bg-slate-50/70 transition-colors"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >

                    {/* CANDIDAT */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">

                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: "#E2E8F0",
                            color: "var(--navy)",
                          }}
                        >
                          {app.freelancerPrenom?.[0]}
                          {app.freelancerNom?.[0]}
                        </div>

                        <div className="min-w-0">
                          <Link
                            to={`/enterprise/freelancer/${app.freelancerId}`}
                            className="text-sm font-semibold hover:underline block truncate"
                            style={{
                              color: "var(--navy)",
                            }}
                          >
                            {app.freelancerPrenom}{" "}
                            {app.freelancerNom}
                          </Link>

                          <div className="flex items-center gap-1.5 mt-1">
                            {app.freelancerCompetences
                              ?.slice(0, 2)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="px-1.5 py-0.5 rounded-md text-[10px]"
                                  style={{
                                    background: "#F1F5F9",
                                    color:
                                      "var(--muted-foreground)",
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* PROJET */}
                    <td className="px-5 py-5">
                      <div className="flex items-start gap-2">

                        <BriefcaseBusiness
                          size={15}
                          className="mt-0.5 flex-shrink-0"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        />

                        <p
                          className="text-sm font-medium max-w-[200px]"
                          style={{
                            color: "var(--navy)",
                          }}
                        >
                          {app.projetTitre}
                        </p>

                      </div>
                    </td>

                    {/* EVALUATION */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          fill="currentColor"
                          style={{
                            color: "var(--gold)",
                          }}
                        />

                        <span
                          className="text-sm font-bold"
                          style={{
                            color: "var(--navy)",
                          }}
                        >
                          {app.freelancerRating?.toFixed(1) ??
                            "—"}
                        </span>

                        <span
                          className="text-xs"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          /5
                        </span>
                      </div>
                    </td>

                    {/* PROPOSITION */}
                    <td className="px-5 py-5">
                      <div className="space-y-1">

                        <div className="flex items-center gap-1.5">
                          <WalletCards
                            size={13}
                            style={{
                              color: "var(--gold)",
                            }}
                          />

                          <span
                            className="text-sm font-semibold"
                            style={{
                              color: "var(--navy)",
                            }}
                          >
                            {app.montantFinal
                              ? `${app.montantFinal.toLocaleString(
                                  "fr-FR"
                                )} FCFA`
                              : "Non précisé"}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          <Clock3 size={12} />

                          {app.date
                            ? new Date(
                                app.date
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "Date inconnue"}
                        </div>

                      </div>
                    </td>

                    {/* STATUS */}
           <td className="px-5 py-5">
{isUpdating ? (
  <div
    className="px-2 py-1 rounded-lg flex items-center gap-1.5"
    style={{
      background: s.bg,
      color: s.color,
    }}
  >
    <Loader2
      size={12}
      className="animate-spin"
    />

    <span className="text-[10px] font-semibold">
      Mise à jour...
    </span>
  </div>
) : (
  <div className="relative flex-shrink-0">
    <span
      className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none z-10"
      style={{
        background: s.color,
      }}
    />

    <select
      value={app.status}
      onChange={(e) =>
        handleStatusChange(
          app.id,
          e.target.value as StatusCandidature
        )
      }
      className="appearance-none pl-5 pr-6 py-1 rounded-lg text-[10px] font-semibold cursor-pointer outline-none border"
      style={{
        background: s.bg,
        color: s.color,
        borderColor: s.border,
      }}
    >
      <option value="EN_ATTENTE">
        À traiter
      </option>

      <option value="EN_COURS">
        Présélectionné
      </option>

      <option value="ACCEPTEE">
        Acceptée
      </option>

      <option value="REJETEE">
        Rejetée
      </option>
    </select>

    <ChevronDown
      size={10}
      className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        color: s.color,
      }}
    />
  </div>
)}
</td>

                    {/* ACTIONS */}
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-1">

                        <Link
                          to={`/enterprise/freelancer/${app.freelancerId}`}
                          title="Voir le profil"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"
                        >
                          <Eye
                            size={15}
                            style={{
                              color: "var(--navy)",
                            }}
                          />
                        </Link>

<button
  type="button"
  onClick={() => handleContact(app.freelancerId)}
  disabled={contactingId === app.freelancerId}
  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-60"
  title="Contacter"
>
  {contactingId === app.freelancerId ? (
    <Loader2 size={15} className="animate-spin" style={{ color: "var(--navy)" }} />
  ) : (
    <MessageSquare size={15} style={{ color: "var(--navy)" }} />
  )}
</button>


                        {app.status !== "ACCEPTEE" &&
                          app.status !== "REJETEE" && (
                            <>
                              <button
                                onClick={() =>
                                  requestStatusChange(
                                    app.id,
                                    "ACCEPTEE",
                                    `${app.freelancerPrenom} ${app.freelancerNom}`
                                  )
                                }
                                title="Accepter"
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-50"
                              >
                                <CheckCircle2
                                  size={15}
                                  style={{
                                    color: "#047857",
                                  }}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  requestStatusChange(
                                    app.id,
                                    "REJETEE",
                                    `${app.freelancerPrenom} ${app.freelancerNom}`
                                  )
                                }
                                title="Rejeter"
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50"
                              >
                                <XCircle
                                  size={15}
                                  style={{
                                    color: "#B91C1C",
                                  }}
                                />
                              </button>
                            </>
                          )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            MOBILE
        ===================================================== */}

        <div className="lg:hidden divide-y">
          {filtered.map((app) => {
            const s =
              statusConfig[app.status] ??
              statusConfig.EN_ATTENTE;

            const isUpdating =
              updating === app.id;

            return (
              <div
                key={app.id}
                className="p-4 sm:p-5"
                style={{
                  borderColor: "var(--border)",
                }}
              >

                <div className="flex items-start gap-3">

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "#E2E8F0",
                      color: "var(--navy)",
                    }}
                  >
                    {app.freelancerPrenom?.[0]}
                    {app.freelancerNom?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/enterprise/freelancer/${app.freelancerId}`}
                          className="text-sm font-semibold"
                          style={{
                            color: "var(--navy)",
                          }}
                        >
                          {app.freelancerPrenom}{" "}
                          {app.freelancerNom}
                        </Link>

                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          {app.projetTitre}
                        </p>
                      </div>

                      <span
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0"
                        style={{
                          background: s.bg,
                          color: s.color,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">

                      <div className="flex items-center gap-1">
                        <Star
                          size={13}
                          fill="currentColor"
                          style={{
                            color: "var(--gold)",
                          }}
                        />

                        <span
                          className="text-xs font-bold"
                          style={{
                            color: "var(--navy)",
                          }}
                        >
                          {app.freelancerRating?.toFixed(1) ??
                            "—"}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                      >
                        <WalletCards size={12} />

                        {app.montantFinal
                          ? `${app.montantFinal.toLocaleString(
                              "fr-FR"
                            )} FCFA`
                          : "Tarif non précisé"}
                      </div>

                    </div>

                    {app.freelancerCompetences?.length ? (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {app.freelancerCompetences
                          .slice(0, 4)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded-md text-[10px]"
                              style={{
                                background: "#F1F5F9",
                                color:
                                  "var(--muted-foreground)",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <Link
                        to={`/enterprise/freelancer/${app.freelancerId}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border"
                        style={{
                          borderColor:
                            "var(--border)",
                          color: "var(--navy)",
                        }}
                      >
                        <Eye size={13} />
                        Profil
                      </Link>

                      <Link
                        to={`/messages?freelancer=${app.freelancerId}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                        style={{
                          background: "var(--navy)",
                          color: "#FFFFFF",
                        }}
                      >
                        <MessageSquare size={13} />
                        Contacter
                      </Link>

                    </div>

                    {app.status !== "ACCEPTEE" &&
                      app.status !== "REJETEE" && (
                        <div className="grid grid-cols-2 gap-2 mt-2">

                          <button
                            onClick={() =>
                              requestStatusChange(
                                app.id,
                                "ACCEPTEE",
                                `${app.freelancerPrenom} ${app.freelancerNom}`
                              )
                            }
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: "#ECFDF5",
                              color: "#047857",
                            }}
                          >
                            <CheckCircle2 size={13} />
                            Accepter
                          </button>

                          <button
                            onClick={() =>
                              requestStatusChange(
                                app.id,
                                "REJETEE",
                                `${app.freelancerPrenom} ${app.freelancerNom}`
                              )
                            }
                            disabled={isUpdating}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: "#FEF2F2",
                              color: "#B91C1C",
                            }}
                          >
                            <XCircle size={13} />
                            Rejeter
                          </button>

                        </div>
                      )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}

        {filtered.length === 0 && (
          <div className="py-16 px-6 text-center">

            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
              style={{
                background: "#F1F5F9",
                color: "var(--muted-foreground)",
              }}
            >
              <Users size={21} />
            </div>

            <h3
              className="font-semibold mt-4"
              style={{ color: "var(--navy)" }}
            >
              Aucune candidature trouvée
            </h3>

            <p
              className="text-sm mt-1 max-w-sm mx-auto"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              Aucun candidat ne correspond à vos critères
              de recherche ou de filtrage.
            </p>

          </div>
        )}

      </div>

      {/* =====================================================
          CONFIRMATION
      ===================================================== */}

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setPendingAction(null)}
          />

          <div
            className="relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl"
            style={{
              borderColor: "var(--border)",
            }}
          >

            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{
                background:
                  pendingAction.status === "ACCEPTEE"
                    ? "#ECFDF5"
                    : "#FEF2F2",

                color:
                  pendingAction.status === "ACCEPTEE"
                    ? "#047857"
                    : "#B91C1C",
              }}
            >
              {pendingAction.status === "ACCEPTEE" ? (
                <CheckCircle2 size={21} />
              ) : (
                <XCircle size={21} />
              )}
            </div>

            <h3
              className="text-lg font-bold"
              style={{
                color: "var(--navy)",
              }}
            >
              {pendingAction.status === "ACCEPTEE"
                ? "Accepter cette candidature ?"
                : "Rejeter cette candidature ?"}
            </h3>

            <p
              className="text-sm mt-2 leading-relaxed"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              Vous êtes sur le point de modifier le statut
              de la candidature de{" "}
              <strong
                style={{
                  color: "var(--navy)",
                }}
              >
                {pendingAction.candidateName}
              </strong>
              .
            </p>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                }}
              >
                Annuler
              </button>

              <button
                onClick={() =>
                  executeStatusChange(
                    pendingAction.candidatureId,
                    pendingAction.status
                  )
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background:
                    pendingAction.status === "ACCEPTEE"
                      ? "#047857"
                      : "#B91C1C",

                  color: "#FFFFFF",
                }}
              >
                Confirmer
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}