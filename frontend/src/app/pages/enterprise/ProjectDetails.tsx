// src/app/pages/enterprise/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Users, Clock, DollarSign, MapPin, Edit3, Star, 
         MessageSquare, CheckCircle, Loader2, 
         AlertCircle,
         ArrowLeft,
         CircleCheck,
         Timer,
         CalendarDays,
         MoreHorizontal,
         ShieldCheck,
         Wallet,
         Clock3,
         Target,
         UserCheck,
         CheckCircle2,
         ChevronRight,
         BarChart3,
         Eye,
         XCircle,
         Ban} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { projetService, type ProjectResponse, 
         type CandidatureResponse, type ProjectStats } from "../../../services/projetService";

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const projetId = Number(id);
  const { user } = useAuth();
const [showCloseModal, setShowCloseModal] = useState(false);
const [closingProject, setClosingProject] = useState(false);
  const [projet, setProjet] = useState<ProjectResponse | null>(null);
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!projetId || !user) return;

    projetService.enregistrerVue(projetId)
        .catch(err => {
            console.error(
                "Erreur enregistrement vue :",
                err
            );
        });

    const fetchAll = async () => {
      try {
        setLoading(true);
        // Charge les 3 en parallèle
        const [projetData, candidaturesData, statsData] = await Promise.all([
          projetService.getProjet(projetId),
          projetService.getCandidatures(projetId),
          projetService.getStatsProjet(projetId),
        ]);
        setProjet(projetData);
        setCandidatures(candidaturesData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projetId, user]);

  const handleStatutCandidature = async (candidatureId: number, statut: string) => {
    try {
      setActionLoading(candidatureId);
      const updated = await projetService.changerStatutCandidature(candidatureId, statut);
      setCandidatures(prev =>
        prev.map(c => c.id === candidatureId ? { ...c, status: updated.status } : c)
      );
    } catch (err) {
      console.error("Erreur changement statut:", err);
    } finally {
      setActionLoading(null);
    }
  };

const handleClorerProjet = async () => {
  try {
    setClosingProject(true);

    await projetService.changerStatut(projetId, "Terminé");

    setProjet(prev =>
      prev
        ? {
            ...prev,
            statut: "Terminé",
          }
        : prev
    );

    setShowCloseModal(false);
  } catch (err) {
    console.error("Erreur clôture:", err);
  } finally {
    setClosingProject(false);
  }
};

if (loading) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-5">

        <div className="h-4 w-32 rounded bg-slate-200" />

        <div className="h-10 w-2/3 rounded bg-slate-200" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100"
            />
          ))}
        </div>

        <div className="h-64 rounded-2xl bg-slate-100" />

        <div className="h-48 rounded-2xl bg-slate-100" />

      </div>
    </div>
  );
}

 if (error) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div
        className="rounded-2xl border p-6"
        style={{
          borderColor: "#FECACA",
          background: "#FEF2F2",
        }}
      >
        <div className="flex items-start gap-3">

          <AlertCircle
            size={20}
            style={{ color: "#B91C1C" }}
          />

          <div>
            <h2
              className="font-semibold"
              style={{ color: "#991B1B" }}
            >
              Impossible de charger le projet
            </h2>

            <p
              className="text-sm mt-1"
              style={{ color: "#B91C1C" }}
            >
              {error}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

  if (!projet) return null;

  const statusColors: Record<string, { bg: string; color: string }> = {
    "Ouvert":   { bg: "#DCFCE7", color: "#166534" },
    "En cours": { bg: "#DBEAFE", color: "#1E40AF" },
    "Terminé":  { bg: "#F3F4F6", color: "#374151" },
    "Suspendu": { bg: "#FEF9C3", color: "#854D0E" },
  };
  const sc = statusColors[projet.statut] ?? { bg: "#E5E7EB", color: "#374151" };

  const joursRestants = projet.deadline
    ? Math.max(0, Math.ceil(
        (new Date(projet.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

    {/* =========================================================
        HEADER
    ========================================================= */}

    <div className="mb-7">

      <Link
        to="/enterprise/projects"
        className="inline-flex items-center gap-2 text-sm font-medium mb-5 transition-colors hover:opacity-70"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft size={16} />
        Retour à mes projets
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2 mb-3">

            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: sc.bg,
                color: sc.color,
              }}
            >
              <CircleCheck size={12} />
              {projet.statut}
            </span>

            {projet.categorie && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "var(--secondary)",
                  color: "var(--navy)",
                }}
              >
                {projet.categorie}
              </span>
            )}

            {projet.urgent && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "#FFF7ED",
                  color: "#C2410C",
                }}
              >
                <Timer size={12} />
                Priorité élevée
              </span>
            )}

          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
            style={{ color: "var(--navy)" }}
          >
            {projet.titre}
          </h1>

          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} />
              Publié le{" "}
              {new Date(projet.datePublication).toLocaleDateString("fr-FR")}
            </span>

            {projet.lieu && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} />
                {projet.lieu}
              </span>
            )}

          </div>

        </div>

        <div className="flex items-center gap-2 flex-shrink-0">

          <Link
            to={`/enterprise/edit-project/${projet.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-50"
            style={{
              borderColor: "var(--border)",
              color: "var(--navy)",
              background: "#FFFFFF",
            }}
          >
            <Edit3 size={15} />
            Modifier
          </Link>

          <button
            className="w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
              background: "#FFFFFF",
            }}
          >
            <MoreHorizontal size={18} />
          </button>

        </div>

      </div>
    </div>


    {/* =========================================================
        TRUST BANNER
    ========================================================= */}

    <div
      className="mb-6 rounded-2xl border p-4 sm:p-5 flex items-start gap-3"
      style={{
        background: "#F8FAFC",
        borderColor: "var(--border)",
      }}
    >

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "#E2E8F0",
          color: "var(--navy)",
        }}
      >
        <ShieldCheck size={18} />
      </div>

      <div className="min-w-0">

        <p
          className="text-sm font-semibold"
          style={{ color: "var(--navy)" }}
        >
          Suivi sécurisé de votre projet
        </p>

        <p
          className="text-xs mt-1 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Consultez les candidatures, comparez les profils et choisissez
          votre prestataire avant de clôturer la mission.
        </p>

      </div>

    </div>


    {/* =========================================================
        LAYOUT
    ========================================================= */}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* =======================================================
          MAIN
      ======================================================= */}

      <div className="lg:col-span-2 space-y-5">

        {/* =====================================================
            PROJECT SUMMARY
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white overflow-hidden"
          style={{
            borderColor: "var(--border)",
          }}
        >

          <div className="p-5 sm:p-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {/* Budget */}

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >
                <div className="flex items-center justify-between mb-3">

                  <Wallet
                    size={17}
                    style={{ color: "var(--gold)" }}
                  />

                </div>

                <p
                  className="text-sm sm:text-base font-bold truncate"
                  style={{ color: "var(--navy)" }}
                >
                  {projet.budget?.toLocaleString("fr-FR") ?? "—"} FCFA
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Budget
                </p>

              </div>


              {/* Deadline */}

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >

                <div className="flex items-center justify-between mb-3">

                  <Clock3
                    size={17}
                    style={{ color: "var(--navy)" }}
                  />

                </div>

                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: "var(--navy)" }}
                >
                  {joursRestants !== null
                    ? `${joursRestants} jour${joursRestants > 1 ? "s" : ""}`
                     : "—"}
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Temps restant
                </p>

              </div>


              {/* Candidatures */}

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >

                <div className="flex items-center justify-between mb-3">

                  <Users
                    size={17}
                    style={{ color: "#7C3AED" }}
                  />

                </div>

                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: "var(--navy)" }}
                >
                  {projet.nombreCandidatures}
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Candidatures
                </p>

              </div>


              {/* Vues */}

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >

                <div className="flex items-center justify-between mb-3">

                  <Eye
                    size={17}
                    style={{ color: "#2563EB" }}
                  />

                </div>

                <p
                  className="text-sm sm:text-base font-bold"
                  style={{ color: "var(--navy)" }}
                >
                  {stats?.vues ?? projet.vues}
                </p>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Vues
                </p>

              </div>

            </div>

          </div>


          {/* Description */}

          <div
            className="px-5 sm:px-6 py-5 border-t"
            style={{ borderColor: "var(--border)" }}
          >

            <div className="flex items-center gap-2 mb-3">

              <Target
                size={17}
                style={{ color: "var(--gold)" }}
              />

              <h2
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                À propos de la mission
              </h2>

            </div>

            <p
              className="text-sm leading-7 whitespace-pre-line"
              style={{ color: "var(--foreground)" }}
            >
              {projet.description || "Aucune description renseignée."}
            </p>

          </div>


          {/* Livrables */}

          {projet.livrables && (
            <div
              className="px-5 sm:px-6 py-5 border-t"
              style={{ borderColor: "var(--border)" }}
            >

              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--navy)" }}
              >
                Livrables attendus
              </h3>

              <p
                className="text-sm leading-6 whitespace-pre-line"
                style={{ color: "var(--muted-foreground)" }}
              >
                {projet.livrables}
              </p>

            </div>
          )}


          {/* Compétences */}

          {projet.competences?.length > 0 && (
            <div
              className="px-5 sm:px-6 py-5 border-t"
              style={{ borderColor: "var(--border)" }}
            >

              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--navy)" }}
              >
                Compétences recherchées
              </h3>

              <div className="flex flex-wrap gap-2">

                {projet.competences.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "var(--border)",
                      color: "var(--navy)",
                    }}
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>
          )}

        </section>


        {/* =====================================================
            CANDIDATURES
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white overflow-hidden"
          style={{
            borderColor: "var(--border)",
          }}
        >

          <div
            className="px-5 sm:px-6 py-5 border-b"
            style={{ borderColor: "var(--border)" }}
          >

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Users
                    size={18}
                    style={{ color: "var(--navy)" }}
                  />

                  <h2
                    className="font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Candidatures
                  </h2>

                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--navy)",
                    }}
                  >
                    {candidatures.length}
                  </span>

                </div>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Comparez les profils avant de prendre votre décision.
                </p>

              </div>

            </div>

          </div>


          {candidatures.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "#F1F5F9",
                  color: "var(--muted-foreground)",
                }}
              >
                <Users size={22} />
              </div>

              <h3
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Aucune candidature pour le moment
              </h3>

              <p
                className="text-sm mt-1 max-w-sm mx-auto"
                style={{ color: "var(--muted-foreground)" }}
              >
                Les candidatures apparaîtront ici dès qu'un freelance
                postulera à cette mission.
              </p>

            </div>

          ) : (

            <div
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >

              {candidatures.map(app => {

                const statusLabel: Record<string, string> = {
                  EN_ATTENTE: "À examiner",
                  ACCEPTEE: "Accepté",
                  REJETEE: "Rejeté",
                  EN_COURS: "Présélectionné",
                };

                const statusStyle: Record<
                  string,
                  { bg: string; color: string }
                > = {
                  EN_ATTENTE: {
                    bg: "#F1F5F9",
                    color: "#475569",
                  },
                  ACCEPTEE: {
                    bg: "#DCFCE7",
                    color: "#166534",
                  },
                  REJETEE: {
                    bg: "#FEE2E2",
                    color: "#991B1B",
                  },
                  EN_COURS: {
                    bg: "#FEF3C7",
                    color: "#92400E",
                  },
                };

                const ss =
                  statusStyle[app.status] ??
                  statusStyle.EN_ATTENTE;

                const initials =
                  `${app.freelancerPrenom?.[0] ?? ""}${app.freelancerNom?.[0] ?? ""}`;

                return (

                  <div
                    key={app.id}
                    className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors"
                  >

                    <div className="flex flex-col sm:flex-row gap-4">

                      {/* Avatar */}

                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                          background: "#F1F5F9",
                          color: "var(--navy)",
                        }}
                      >
                        {initials.toUpperCase()}
                      </div>


                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <Link
                                to={`/enterprise/freelancer/${app.freelancerId}`}
                                className="font-semibold hover:underline"
                                style={{ color: "var(--navy)" }}
                              >
                                {app.freelancerPrenom}{" "}
                                {app.freelancerNom}
                              </Link>

                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  background: ss.bg,
                                  color: ss.color,
                                }}
                              >
                                {statusLabel[app.status] ??
                                  app.status}
                              </span>

                            </div>

                            <p
                              className="text-xs mt-1"
                              style={{
                                color:
                                  "var(--muted-foreground)",
                              }}
                            >
                              {app.freelancerSpecialite ||
                                "Spécialité non renseignée"}
                            </p>

                          </div>


                          {/* Rating */}

                          <div
                            className="inline-flex items-center gap-1.5"
                            title="Évaluation du freelance"
                          >

                            <Star
                              size={14}
                              fill="var(--gold)"
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
                              ({app.freelancerNbAvis ?? 0} avis)
                            </span>

                          </div>

                        </div>


                        {/* Informations candidature */}

                        <div className="flex flex-wrap gap-2 mt-4">

                          {app.montantFinal && (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                background: "#F8FAFC",
                                color: "var(--navy)",
                              }}
                            >
                              <Wallet size={13} />
                              {app.montantFinal.toLocaleString(
                                "fr-FR"
                              )}{" "}
                              FCFA
                            </span>
                          )}

                        </div>


                        {/* Compétences */}

                        {app.freelancerCompetences?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">

                            {app.freelancerCompetences
                              .slice(0, 5)
                              .map(skill => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 rounded-md text-xs"
                                  style={{
                                    background:
                                      "var(--secondary)",
                                    color: "var(--navy)",
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}

                          </div>
                        )}


                        {/* Actions */}

                        <div className="flex flex-wrap gap-2 mt-4">

                          {app.status === "EN_ATTENTE" && (
                            <button
                              onClick={() =>
                                handleStatutCandidature(
                                  app.id,
                                  "EN_COURS"
                                )
                              }
                              disabled={
                                actionLoading === app.id
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
                              style={{
                                background: "var(--navy)",
                                color: "#FFFFFF",
                              }}
                            >
                              {actionLoading === app.id ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <UserCheck size={13} />
                              )}

                              Présélectionner
                            </button>
                          )}

                          {app.status === "EN_COURS" && (
                            <button
                              onClick={() =>
                                handleStatutCandidature(
                                  app.id,
                                  "ACCEPTEE"
                                )
                              }
                              disabled={
                                actionLoading === app.id
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold"
                              style={{
                                background: "#166534",
                                color: "#FFFFFF",
                              }}
                            >
                              {actionLoading === app.id ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={13} />
                              )}

                              Accepter
                            </button>
                          )}

                          <Link
                            to={`/messages?freelancer=${app.freelancerId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border"
                            style={{
                              borderColor:
                                "var(--border)",
                              color: "var(--navy)",
                              background: "#FFFFFF",
                            }}
                          >
                            <MessageSquare size={13} />
                            Contacter
                          </Link>

                          <Link
                            to={`/enterprise/freelancer/${app.freelancerId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border"
                            style={{
                              borderColor:
                                "var(--border)",
                              color: "var(--navy)",
                              background: "#FFFFFF",
                            }}
                          >
                            Profil
                            <ChevronRight size={13} />
                          </Link>

                        </div>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </div>


      {/* =======================================================
          SIDEBAR
      ======================================================= */}

      <aside className="space-y-5">

        {/* =====================================================
            STATS
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white p-5"
          style={{ borderColor: "var(--border)" }}
        >

          <div className="flex items-center gap-2 mb-4">

            <BarChart3
              size={17}
              style={{ color: "var(--navy)" }}
            />

            <h3
              className="font-semibold"
              style={{ color: "var(--navy)" }}
            >
              Vue d'ensemble
            </h3>

          </div>

          <div className="space-y-1">

            {[
              {
                label: "Vues",
                value: stats?.vues ?? projet.vues,
                icon: Eye,
              },
              {
                label: "Candidatures",
                value:
                  stats?.nombreCandidatures ??
                  projet.nombreCandidatures,
                icon: Users,
              },
              {
                label: "Présélectionnés",
                value:
                  stats?.nombrePreselectionnes ??
                  candidatures.filter(
                    c => c.status === "EN_COURS"
                  ).length,
                icon: UserCheck,
              },
              {
                label: "Jours restants",
                value:
                  joursRestants !== null
                    ? joursRestants
                    : "—",
                icon: Clock3,
              },
            ].map(stat => {

              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{
                    borderColor: "var(--border)",
                  }}
                >

                  <div className="flex items-center gap-2.5">

                    <Icon
                      size={15}
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    />

                    <span
                      className="text-sm"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      {stat.label}
                    </span>

                  </div>

                  <span
                    className="font-bold"
                    style={{
                      color: "var(--navy)",
                    }}
                  >
                    {stat.value}
                  </span>

                </div>
              );

            })}

          </div>

        </section>


        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white p-5"
          style={{ borderColor: "var(--border)" }}
        >

          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--navy)" }}
          >
            Actions
          </h3>

          <div className="space-y-2">

            <Link
              to={`/enterprise/edit-project/${projet.id}`}
              className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-slate-50"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
              }}
            >
              <span className="flex items-center gap-2">
                <Edit3 size={15} />
                Modifier le projet
              </span>

              <ChevronRight size={15} />
            </Link>


            <Link
              to={`/enterprise/candidates/${projet.id}`}
              className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-slate-50"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
              }}
            >
              <span className="flex items-center gap-2">
                <UserCheck size={15} />
                Sélectionner un candidat
              </span>

              <ChevronRight size={15} />
            </Link>


            {projet.statut !== "Terminé" && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: "#FEF2F2",
                  color: "#991B1B",
                }}
              >
                <XCircle size={15} />
                Clore le projet
              </button>
            )}

          </div>

        </section>


        {/* =====================================================
            DEADLINE CARD
        ===================================================== */}

        <section
          className="rounded-2xl border p-5"
          style={{
            borderColor:
              joursRestants !== null && joursRestants <= 3
                ? "#FDE68A"
                : "var(--border)",
            background:
              joursRestants !== null && joursRestants <= 3
                ? "#FFFBEB"
                : "#FFFFFF",
          }}
        >

          <div className="flex items-start gap-3">

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  joursRestants !== null &&
                  joursRestants <= 3
                    ? "#FEF3C7"
                    : "#F1F5F9",
                color:
                  joursRestants !== null &&
                  joursRestants <= 3
                    ? "#B45309"
                    : "var(--navy)",
              }}
            >
              <Clock3 size={17} />
            </div>

            <div>

              <p
                className="text-sm font-semibold"
                style={{ color: "var(--navy)" }}
              >
                {projet.deadline
                  ? `Échéance : ${new Date(
                      projet.deadline
                    ).toLocaleDateString("fr-FR")}`
                  : "Aucune échéance"}
              </p>

              <p
                className="text-xs mt-1 leading-relaxed"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {joursRestants !== null
                  ? `${joursRestants} jour${
                      joursRestants > 1 ? "s" : ""
                    } restant${
                      joursRestants > 1 ? "s" : ""
                    } avant la date limite.`
                  : "Définissez une date limite pour mieux cadrer la mission."}
              </p>

            </div>

          </div>

        </section>

      </aside>

    </div>


    {/* =========================================================
        CLOSE PROJECT MODAL
    ========================================================= */}

    {showCloseModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >

        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl border p-6"
          style={{
            borderColor: "var(--border)",
          }}
        >

          <div className="flex items-start gap-3">

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "#FEF2F2",
                color: "#B91C1C",
              }}
            >
              <AlertCircle size={20} />
            </div>

            <div>

              <h3
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Clore ce projet ?
              </h3>

              <p
                className="text-sm mt-1 leading-relaxed"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Le projet sera marqué comme terminé. Cette action
                signale aux freelances que la mission n'accepte plus
                de nouvelles candidatures.
              </p>

            </div>

          </div>

          <div className="flex gap-3 mt-6">

            <button
              onClick={() => setShowCloseModal(false)}
              disabled={closingProject}
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
              }}
            >
              Annuler
            </button>

            <button
              onClick={handleClorerProjet}
              disabled={closingProject}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "#991B1B",
                color: "#FFFFFF",
              }}
            >
              {closingProject ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Ban size={15} />
              )}

              Clore le projet
            </button>

          </div>

        </div>

      </div>
    )}

  </div>
);}