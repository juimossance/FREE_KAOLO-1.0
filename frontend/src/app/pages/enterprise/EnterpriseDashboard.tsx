import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useAuth } from "../../../hooks/useAuth";
import {
  projetService,
  type ProjectResponse,
  type CandidatureResponse,
} from "../../../services/projetService";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";

interface DashboardStats {
  projetsActifs: number;
  totalCandidatures: number;
  freelancersRecruites: number;
  budgetDepense: number;
  budgetTotal: number;
  projetsParMois: {
    month: string;
    projets: number;
    recrutes: number;
  }[];
}

const COLORS = ["#0F172A", "#E2E8F0"];

const formatFcfa = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M FCFA`
    : `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

const getInitials = (prenom?: string, nom?: string) =>
  `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) return `Il y a ${Math.max(minutes, 1)} min`;
  if (hours < 24) return `Il y a ${hours}h`;

  return `Il y a ${days}j`;
};

const statusStyle = (status: string) => {
  switch (status) {
    case "Terminé":
      return {
        background: "#ECFDF3",
        color: "#166534",
        border: "#BBF7D0",
      };

    case "En cours":
      return {
        background: "#EFF6FF",
        color: "#1D4ED8",
        border: "#BFDBFE",
      };

    case "Suspendu":
      return {
        background: "#FFFBEB",
        color: "#92400E",
        border: "#FDE68A",
      };

    default:
      return {
        background: "#F8FAFC",
        color: "#334155",
        border: "#E2E8F0",
      };
  }
};

export function EnterpriseDashboard() {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projets, setProjets] = useState<ProjectResponse[]>([]);
  const [candidatures, setCandidatures] = useState<CandidatureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entrepriseId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, projetsData] = await Promise.all([
          projetService.getStatsDashboard(entrepriseId),
          projetService.getMesProjets(entrepriseId),
        ]);

        setStats(statsData as unknown as DashboardStats);
        setProjets(projetsData);

        const recentProjects = projetsData.slice(0, 3);

        const allCandidatures = await Promise.all(
          recentProjects.map((p) =>
            projetService.getCandidatures(p.id)
          )
        );

        const flat = allCandidatures
          .flat()
          .sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          )
          .slice(0, 5);

        setCandidatures(flat);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur de chargement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [entrepriseId]);

  const projetsActifs = projets.filter(
    (p) =>
      p.statut === "Ouvert" ||
      p.statut === "En cours"
  );

  const projetsRecents = projets.slice(0, 4);

  const budgetDepense = stats?.budgetDepense ?? 0;
  const budgetTotal = stats?.budgetTotal ?? 0;

  const budgetRestant = Math.max(
    0,
    budgetTotal - budgetDepense
  );

  const budgetPercentage =
    budgetTotal > 0
      ? Math.min(
          100,
          Math.round((budgetDepense / budgetTotal) * 100)
        )
      : 0;

  const budgetData = [
    {
      name: "Dépensé",
      value: budgetDepense,
    },
    {
      name: "Restant",
      value: budgetRestant,
    },
  ];

  const hireData = stats?.projetsParMois ?? [];

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayLabel =
    today.charAt(0).toUpperCase() + today.slice(1);

  const pendingApplications = useMemo(
    () =>
      projets.reduce(
        (total, project) =>
          total + (project.nombreCandidatures ?? 0),
        0
      ),
    [projets]
  );

  if (loading) {
    return <DashboardSkeleton variant="enterprise" />;
  }

  if (error) {
    return (
      <div className="min-h-full p-6">
        <div
          className="max-w-5xl mx-auto rounded-2xl border p-6"
          style={{
            borderColor: "#FECACA",
            background: "#FEF2F2",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "#DC2626" }}
            />

            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: "#991B1B" }}
              >
                Impossible de charger votre tableau de bord
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: "#B91C1C" }}
              >
                {error}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border"
              style={{
                borderColor: "#FECACA",
                color: "#991B1B",
                background: "#FFF",
              }}
            >
              <RefreshCw size={13} />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full px-4 py-5 md:px-6 md:py-7"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <section>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#16A34A" }}
                />

                <span
                  className="text-xs font-medium"
                  style={{ color: "#64748B" }}
                >
                  Espace entreprise
                </span>

                <span style={{ color: "#CBD5E1" }}>•</span>

                <span
                  className="text-xs"
                  style={{ color: "#94A3B8" }}
                >
                  {todayLabel}
                </span>
              </div>

              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: "#0F172A" }}
              >
                Pilotez vos recrutements.
              </h1>

              <p
                className="mt-2 text-sm md:text-base max-w-2xl"
                style={{ color: "#64748B" }}
              >
                Suivez vos projets, évaluez les candidatures
                et prenez vos décisions depuis un seul espace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/enterprise/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white"
                style={{
                  color: "#0F172A",
                  borderColor: "#CBD5E1",
                  background: "#F8FAFC",
                }}
              >
                <Search size={16} />
                Trouver un talent
              </Link>

              <Link
                to="/enterprise/post-project"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "#0F172A",
                  color: "#FFF",
                  boxShadow:
                    "0 4px 12px rgba(15,23,42,.12)",
                }}
              >
                <ClipboardList size={16} />
                Publier un projet
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            TRUST STRIP
        ========================================================= */}

        <section
          className="rounded-xl border px-4 py-3"
          style={{
            background: "#FFFFFF",
            borderColor: "#E2E8F0",
          }}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                style={{ color: "#16A34A" }}
              />

              <span
                className="text-xs font-medium"
                style={{ color: "#334155" }}
              >
                Espace sécurisé
              </span>
            </div>

            <div
              className="hidden sm:block w-px h-4"
              style={{ background: "#E2E8F0" }}
            />

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={16}
                style={{ color: "#16A34A" }}
              />

              <span
                className="text-xs font-medium"
                style={{ color: "#334155" }}
              >
                Données actualisées
              </span>
            </div>

            <div
              className="hidden sm:block w-px h-4"
              style={{ background: "#E2E8F0" }}
            />

            <div className="flex items-center gap-2">
              <Sparkles
                size={16}
                style={{ color: "#B58A1C" }}
              />

              <span
                className="text-xs font-medium"
                style={{ color: "#334155" }}
              >
                Recommandations intelligentes
              </span>
            </div>

          </div>
        </section>

        {/* =========================================================
            KPI
        ========================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          <DashboardKpi
            label="Projets actifs"
            value={projetsActifs.length}
            detail={`${projets.length} au total`}
            icon={<BriefcaseBusiness size={18} />}
            accent="#2563EB"
          />

          <DashboardKpi
            label="Candidatures"
            value={
              stats?.totalCandidatures ??
              pendingApplications
            }
            detail={`${candidatures.length} récentes`}
            icon={<Users size={18} />}
            accent="#7C3AED"
          />

          <DashboardKpi
            label="Freelancers recrutés"
            value={stats?.freelancersRecruites ?? 0}
            detail="Depuis le début"
            icon={<UserRound size={18} />}
            accent="#16A34A"
          />

          <DashboardKpi
            label="Budget consommé"
            value={formatFcfa(budgetDepense)}
            detail={
              budgetTotal > 0
                ? `${budgetPercentage}% du budget`
                : "Budget non défini"
            }
            icon={<WalletCards size={18} />}
            accent="#B58A1C"
          />

        </section>

        {/* =========================================================
            ANALYTICS
        ========================================================= */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Activity */}

          <div
            className="lg:col-span-2 rounded-2xl border p-5 md:p-6"
            style={{
              background: "#FFFFFF",
              borderColor: "#E2E8F0",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={16}
                    style={{ color: "#0F172A" }}
                  />

                  <h2
                    className="text-sm font-bold"
                    style={{ color: "#0F172A" }}
                  >
                    Activité de recrutement
                  </h2>
                </div>

                <p
                  className="text-xs mt-1"
                  style={{ color: "#94A3B8" }}
                >
                  Évolution de vos projets et recrutements
                </p>
              </div>

              <span
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: "#F8FAFC",
                  color: "#64748B",
                }}
              >
                Cette période
              </span>
            </div>

            {hireData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={240}
              >
                <AreaChart data={hireData}>
                  <defs>
                    <linearGradient
                      id="enterpriseProjects"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0F172A"
                        stopOpacity={0.14}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0F172A"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="enterpriseHires"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#B58A1C"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="95%"
                        stopColor="#B58A1C"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#F1F5F9"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#94A3B8",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="projets"
                    stroke="#0F172A"
                    strokeWidth={2}
                    fill="url(#enterpriseProjects)"
                    name="Projets"
                  />

                  <Area
                    type="monotone"
                    dataKey="recrutes"
                    stroke="#B58A1C"
                    strokeWidth={2}
                    fill="url(#enterpriseHires)"
                    name="Recrutés"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-52 flex flex-col items-center justify-center gap-2"
                style={{ color: "#94A3B8" }}
              >
                <TrendingUp size={24} />
                <p className="text-sm">
                  Les données apparaîtront ici
                </p>
              </div>
            )}
          </div>

          {/* Budget */}

          <div
            className="rounded-2xl border p-5 md:p-6"
            style={{
              background: "#FFFFFF",
              borderColor: "#E2E8F0",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign
                    size={16}
                    style={{ color: "#B58A1C" }}
                  />

                  <h2
                    className="text-sm font-bold"
                    style={{ color: "#0F172A" }}
                  >
                    Budget
                  </h2>
                </div>

                <p
                  className="text-xs mt-1"
                  style={{ color: "#94A3B8" }}
                >
                  Vue de votre consommation
                </p>
              </div>
            </div>

            {budgetTotal > 0 ? (
              <>
                <div className="relative flex justify-center mt-4">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={budgetData}
                      cx={85}
                      cy={85}
                      innerRadius={57}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {budgetData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>
                  </PieChart>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-xl font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {budgetPercentage}%
                    </span>

                    <span
                      className="text-[11px]"
                      style={{ color: "#94A3B8" }}
                    >
                      consommé
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-2">

                  <BudgetRow
                    label="Dépensé"
                    value={formatFcfa(budgetDepense)}
                    dot="#0F172A"
                  />

                  <BudgetRow
                    label="Disponible"
                    value={formatFcfa(budgetRestant)}
                    dot="#E2E8F0"
                  />

                  <div
                    className="pt-3 mt-1 border-t flex items-center justify-between"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "#94A3B8" }}
                    >
                      Budget total
                    </span>

                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#0F172A" }}
                    >
                      {formatFcfa(budgetTotal)}
                    </span>
                  </div>

                </div>
              </>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-center">
                <CircleDollarSign
                  size={28}
                  style={{ color: "#CBD5E1" }}
                />

                <p
                  className="text-sm font-medium mt-3"
                  style={{ color: "#475569" }}
                >
                  Aucun budget défini
                </p>

                <p
                  className="text-xs mt-1 max-w-[220px]"
                  style={{ color: "#94A3B8" }}
                >
                  Définissez un budget pour suivre
                  vos dépenses.
                </p>
              </div>
            )}
          </div>

        </section>

        {/* =========================================================
            PROJECTS + APPLICATIONS
        ========================================================= */}

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Projects */}

          <div
            className="lg:col-span-3 rounded-2xl border overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderColor: "#E2E8F0",
            }}
          >
            <SectionHeader
              icon={<BriefcaseBusiness size={16} />}
              title="Vos projets"
              link="/enterprise/projects"
              linkLabel="Voir tous"
            />

            {projetsRecents.length === 0 ? (
              <EmptyState
                icon={<BriefcaseBusiness size={28} />}
                title="Aucun projet publié"
                description="Publiez votre premier projet pour commencer à recevoir des candidatures."
                actionLabel="Publier un projet"
                actionHref="/enterprise/post-project"
              />
            ) : (
              <div>
                {projetsRecents.map((project) => {
                  const style = statusStyle(project.statut);

                  return (
                    <Link
                      key={project.id}
                      to={`/enterprise/projects/${project.id}`}
                      className="group flex items-center gap-4 px-5 py-4 border-b last:border-b-0 transition-colors hover:bg-slate-50"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#F8FAFC",
                          color: "#475569",
                        }}
                      >
                        <FileText size={17} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "#0F172A" }}
                        >
                          {project.titre}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "#64748B" }}
                          >
                            <Users size={11} />
                            {project.nombreCandidatures}
                            {" "}
                            candidature
                            {project.nombreCandidatures > 1
                              ? "s"
                              : ""}
                          </span>

                          {project.deadline && (
                            <span
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "#64748B" }}
                            >
                              <CalendarDays size={11} />
                              {new Date(
                                project.deadline
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                          style={{
                            background: style.background,
                            color: style.color,
                            borderColor: style.border,
                          }}
                        >
                          {project.statut}
                        </span>

                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#0F172A" }}
                        >
                          {project.budget.toLocaleString(
                            "fr-FR"
                          )}{" "}
                          FCFA
                        </span>
                      </div>

                      <ChevronRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                        style={{ color: "#CBD5E1" }}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applications */}

          <div
            className="lg:col-span-2 rounded-2xl border overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderColor: "#E2E8F0",
            }}
          >
            <SectionHeader
              icon={<Users size={16} />}
              title="Candidatures récentes"
              link="/enterprise/applications"
              linkLabel="Voir toutes"
            />

            {candidatures.length === 0 ? (
              <EmptyState
                icon={<Users size={28} />}
                title="Aucune candidature"
                description="Les nouvelles candidatures apparaîtront ici."
              />
            ) : (
              <div className="p-4 space-y-2">

                {candidatures.map((app) => (
                  <Link
                    key={app.id}
                    to={`/enterprise/freelancer/${app.freelancerId}`}
                    className="group flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "#F1F5F9",
                        color: "#334155",
                      }}
                    >
                      {getInitials(
                        app.freelancerPrenom,
                        app.freelancerNom
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "#0F172A" }}
                      >
                        {app.freelancerPrenom}{" "}
                        {app.freelancerNom}
                      </p>

                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: "#64748B" }}
                      >
                        {app.freelancerSpecialite}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#0F172A" }}
                        >
                          {app.freelancerRating?.toFixed(1) ??
                            "—"}
                        </span>
                      </div>

                      <span
                        className="text-[10px]"
                        style={{ color: "#94A3B8" }}
                      >
                        {timeAgo(app.date)}
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      style={{ color: "#CBD5E1" }}
                    />
                  </Link>
                ))}

              </div>
            )}
          </div>

        </section>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles
              size={15}
              style={{ color: "#B58A1C" }}
            />

            <h2
              className="text-sm font-bold"
              style={{ color: "#0F172A" }}
            >
              Actions rapides
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <QuickAction
              href="/enterprise/post-project"
              icon={<ClipboardList size={18} />}
              label="Publier un projet"
            />

            <QuickAction
              href="/enterprise/search"
              icon={<Search size={18} />}
              label="Rechercher un talent"
            />

            <QuickAction
              href="/enterprise/applications"
              icon={<Users size={18} />}
              label="Gérer les candidatures"
            />

            <QuickAction
              href="/payments"
              icon={<WalletCards size={18} />}
              label="Consulter les paiements"
            />

          </div>
        </section>

      </div>
    </div>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function DashboardKpi({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4 md:p-5"
      style={{
        background: "#FFFFFF",
        borderColor: "#E2E8F0",
      }}
    >
      <div className="flex items-center justify-between gap-3">

        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: `${accent}12`,
            color: accent,
          }}
        >
          {icon}
        </div>

        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#CBD5E1" }}
        />
      </div>

      <p
        className="text-xl md:text-2xl font-bold mt-4 tracking-tight"
        style={{ color: "#0F172A" }}
      >
        {value}
      </p>

      <p
        className="text-xs font-medium mt-1"
        style={{ color: "#475569" }}
      >
        {label}
      </p>

      <p
        className="text-[11px] mt-1"
        style={{ color: "#94A3B8" }}
      >
        {detail}
      </p>
    </div>
  );
}

function BudgetRow({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="flex items-center gap-2 text-xs"
        style={{ color: "#64748B" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-sm"
          style={{ background: dot }}
        />
        {label}
      </span>

      <span
        className="text-xs font-semibold"
        style={{ color: "#0F172A" }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  link,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: "#F1F5F9" }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: "#475569" }}>
          {icon}
        </span>

        <h2
          className="text-sm font-bold"
          style={{ color: "#0F172A" }}
        >
          {title}
        </h2>
      </div>

      <Link
        to={link}
        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
        style={{ color: "#8B6B16" }}
      >
        {linkLabel}
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div
        className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
        style={{
          background: "#F8FAFC",
          color: "#94A3B8",
        }}
      >
        {icon}
      </div>

      <p
        className="text-sm font-semibold mt-4"
        style={{ color: "#334155" }}
      >
        {title}
      </p>

      <p
        className="text-xs mt-1 max-w-xs mx-auto leading-relaxed"
        style={{ color: "#94A3B8" }}
      >
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 mt-4 px-3.5 py-2 rounded-lg text-xs font-semibold"
          style={{
            background: "#0F172A",
            color: "#FFFFFF",
          }}
        >
          {actionLabel}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-white hover:-translate-y-[1px]"
      style={{
        background: "#F8FAFC",
        borderColor: "#E2E8F0",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{
          background: "#FFFFFF",
          color: "#334155",
        }}
      >
        {icon}
      </div>

      <span
        className="text-xs font-semibold flex-1"
        style={{ color: "#334155" }}
      >
        {label}
      </span>

      <ChevronRight
        size={14}
        className="transition-transform group-hover:translate-x-0.5"
        style={{ color: "#CBD5E1" }}
      />
    </Link>
  );
}