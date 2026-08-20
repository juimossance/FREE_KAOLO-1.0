import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  TrendingUp,
  Eye,
  Send,
  Star,
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Search,
  Pencil,
  Award,
  Wallet,
  BriefcaseBusiness,
  CircleDollarSign,
  Bell,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { useAuth } from "../../../hooks/useAuth";
import { getFreelancerDashboard } from "../../../services/dashboardService";
import type { FreelancerDashboardData } from "../../../models/dashboard";

// ─────────────────────────────────────────────────────────────
// Statuts
// ─────────────────────────────────────────────────────────────

const statusStyles: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  EN_ATTENTE: {
    bg: "#FEFCE8",
    color: "#854D0E",
    label: "En attente",
  },
  ACCEPTEE: {
    bg: "#F0FDF4",
    color: "#166534",
    label: "Acceptée",
  },
  EN_COURS: {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    label: "En cours",
  },
  REJETEE: {
    bg: "#FEF2F2",
    color: "#B91C1C",
    label: "Rejetée",
  },
};

// ─────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────

export function FreelancerDashboard() {
  const { token } = useAuth();

  const [data, setData] = useState<FreelancerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    getFreelancerDashboard(token)
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger votre tableau de bord."
        )
      )
      .finally(() => setLoading(false));
  }, [token]);

  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"
          />
          <p className="text-sm text-slate-500">
            Chargement de votre activité...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div
          className="rounded-2xl border p-6 flex items-start gap-4"
          style={{
            borderColor: "#FECACA",
            background: "#FEF2F2",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
            <AlertCircle size={19} className="text-red-600" />
          </div>

          <div>
            <h3 className="font-semibold text-red-900">
              Impossible de charger votre tableau de bord
            </h3>

            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ─────────────────────────────────────────────────────────────
  // Statistiques
  // ─────────────────────────────────────────────────────────────

  const stats = [
    {
      label: "Vues du profil",
      value: data.stats.vue.toLocaleString(),
      description: "Visibilité auprès des entreprises",
      icon: Eye,
      accent: "#2563EB",
    },
    {
      label: "Candidatures",
      value: data.stats.applications.toString(),
      description: "Candidatures envoyées",
      icon: Send,
      accent: "#475569",
    },
    {
      label: "Note moyenne",
      value: data.stats.rating.toFixed(1),
      description: "Évaluation de vos prestations",
      icon: Star,
      accent: "#B08A2E",
    },
    {
      label: "Gains ce mois",
      value: `${data.stats.monthlyRevenue.toLocaleString()} FCFA`,
      description: "Revenus enregistrés",
      icon: CreditCard,
      accent: "#15803D",
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // Actions rapides
  // ─────────────────────────────────────────────────────────────

  const quickActions = [
    {
      label: "Chercher des projets",
      description: "Trouver de nouvelles opportunités",
      href: "/enterprise/search",
      icon: Search,
    },
    {
      label: "Mettre à jour le profil",
      description: "Améliorer votre visibilité",
      href: "/freelancer/edit-profile",
      icon: Pencil,
    },
    {
      label: "Ajouter une certification",
      description: "Renforcer votre crédibilité",
      href: "/freelancer/certifications",
      icon: Award,
    },
    {
      label: "Retirer des fonds",
      description: "Gérer vos revenus",
      href: "/payments/mobile-money",
      icon: Wallet,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* ══════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════ */}

        <section
          className="relative overflow-hidden rounded-3xl border bg-white"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Accent décoratif discret */}
          <div
            className="absolute right-0 top-0 w-40 h-40 rounded-full blur-3xl opacity-[0.07]"
            style={{ background: "var(--gold)" }}
          />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
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
                    Espace freelancer
                  </span>
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ color: "var(--navy)" }}
                >
                  Votre activité
                </h1>

                <p
                  className="mt-2 text-sm sm:text-base max-w-xl"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Suivez vos performances, vos candidatures et vos revenus
                  depuis un seul espace.
                </p>
              </div>

              <Link
                to="/freelancer/edit-profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:translate-y-[-1px] hover:shadow-md"
                style={{
                  background: "var(--navy)",
                  color: "#FFFFFF",
                }}
              >
                <Pencil size={15} />
                Compléter mon profil
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Indicateur de confiance */}
            <div
              className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-5 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  style={{ color: "#15803D" }}
                />

                <span
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: "var(--navy)" }}
                >
                  Profil visible aux entreprises
                </span>
              </div>

              <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />

              <span
                className="text-xs sm:text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Maintenez vos informations à jour pour renforcer votre
                visibilité.
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════════════ */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-2xl border bg-white p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${stat.accent}12`,
                      color: stat.accent,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <ArrowRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </div>

                <div className="mt-4">
                  <p
                    className="text-xl sm:text-2xl font-bold tracking-tight"
                    style={{ color: "var(--navy)" }}
                  >
                    {stat.value}
                  </p>

                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: "var(--navy)" }}
                  >
                    {stat.label}
                  </p>

                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ══════════════════════════════════════════════════════
            GRAPHIQUES
        ══════════════════════════════════════════════════════ */}

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">

          {/* Revenus */}
          <div
            className="xl:col-span-3 rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="px-5 sm:px-6 pt-5 sm:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CircleDollarSign
                      size={17}
                      style={{ color: "var(--navy)" }}
                    />

                    <h2
                      className="font-semibold"
                      style={{ color: "var(--navy)" }}
                    >
                      Évolution des gains
                    </h2>
                  </div>

                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Suivi de vos revenus mensuels
                  </p>
                </div>

                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "#F8FAFC",
                    color: "var(--muted-foreground)",
                  }}
                >
                  FCFA
                </span>
              </div>
            </div>

            <div className="px-2 sm:px-4 pt-4 pb-5">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.earnings}>
                  <defs>
                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0F172A"
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0F172A"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
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
                    tickFormatter={(v) =>
                      `${(v / 1000).toFixed(0)}k`
                    }
                    width={42}
                  />

                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString()} FCFA`,
                      "Gains",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenuMonthly"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                    fill="url(#incomeGradient)"
                    dot={{
                      fill: "#0F172A",
                      strokeWidth: 0,
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Candidatures */}
          <div
            className="xl:col-span-2 rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="px-5 sm:px-6 pt-5 sm:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Send
                      size={17}
                      style={{ color: "var(--navy)" }}
                    />

                    <h2
                      className="font-semibold"
                      style={{ color: "var(--navy)" }}
                    >
                      Candidatures
                    </h2>
                  </div>

                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Activité récente
                  </p>
                </div>

                <Link
                  to="/freelancer/applications"
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: "var(--navy)" }}
                >
                  Voir tout
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="px-2 sm:px-4 pt-4 pb-5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.applicationChart}
                  barSize={9}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
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
                    width={28}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Bar
                    dataKey="envoyees"
                    fill="#0F172A"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="acceptees"
                    fill="#CBD5E1"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="flex items-center justify-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span className="text-xs text-slate-500">
                    Envoyées
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-xs text-slate-500">
                    Acceptées
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            ACTIVITÉ
        ══════════════════════════════════════════════════════ */}

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">

          {/* Candidatures récentes */}
          <div
            className="xl:col-span-3 rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <h2
                  className="font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  Candidatures récentes
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Les dernières opportunités auxquelles vous avez répondu
                </p>
              </div>

              <Link
                to="/freelancer/applications"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Tout voir
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="divide-y">
              {data.applications.length === 0 ? (
                <div className="py-12 px-5 text-center">
                  <div
                    className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--navy)",
                    }}
                  >
                    <Send size={17} />
                  </div>

                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Aucune candidature récente
                  </p>

                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Commencez à rechercher des projets adaptés à votre profil.
                  </p>
                </div>
              ) : (
                data.applications.map((app, i) => {
                  const style =
                    statusStyles[app.statut] ?? {
                      bg: "#F8FAFC",
                      color: "#475569",
                      label: app.statut,
                    };

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--navy)",
                        }}
                      >
                        {app.entreprise?.slice(0, 2).toUpperCase() ?? "FK"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--navy)" }}
                        >
                          {app.projet}
                        </p>

                        <p
                          className="text-xs mt-1 truncate"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {app.entreprise} ·{" "}
                          {new Date(app.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            background: style.bg,
                            color: style.color,
                          }}
                        >
                          {style.label}
                        </span>

                        <p
                          className="text-xs mt-1.5 font-medium"
                          style={{
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {app.budget.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notifications */}
          <div
            className="xl:col-span-2 rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--navy)",
                  }}
                >
                  <Bell size={15} />
                </div>

                <h2
                  className="font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  Notifications
                </h2>
              </div>

              <Link
                to="/freelancer/notifications"
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: "var(--navy)" }}
              >
                Tout voir
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="p-4 space-y-2">
              {data.notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--navy)" }}
                  >
                    Aucune notification
                  </p>

                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Vous êtes à jour.
                  </p>
                </div>
              ) : (
                data.notifications.map((n) => {
                  const isSuccess = n.type === "SUCCESS";
                  const isInfo = n.type === "INFO";

                  return (
                    <div
                      key={n.id}
                      className="flex gap-3 p-3 rounded-xl border"
                      style={{
                        background: n.lu ? "#FFFFFF" : "#F8FAFC",
                        borderColor: n.lu
                          ? "#F1F5F9"
                          : "#E2E8F0",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSuccess
                            ? "#F0FDF4"
                            : isInfo
                              ? "#EFF6FF"
                              : "#FFFBEB",
                        }}
                      >
                        {isSuccess ? (
                          <CheckCircle
                            size={15}
                            style={{ color: "#15803D" }}
                          />
                        ) : isInfo ? (
                          <TrendingUp
                            size={15}
                            style={{ color: "#2563EB" }}
                          />
                        ) : (
                          <AlertCircle
                            size={15}
                            style={{ color: "#B45309" }}
                          />
                        )}
                      </div>

                      <p
                        className="text-xs leading-relaxed flex-1"
                        style={{
                          color: n.lu
                            ? "var(--muted-foreground)"
                            : "var(--navy)",
                          fontWeight: n.lu ? 400 : 600,
                        }}
                      >
                        {n.titre}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            ACTIONS RAPIDES
        ══════════════════════════════════════════════════════ */}

        <section>
          <div className="mb-3">
            <h2
              className="font-semibold"
              style={{ color: "var(--navy)" }}
            >
              Actions rapides
            </h2>

            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Accédez rapidement aux fonctionnalités essentielles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  to={action.href}
                  className="group flex items-center gap-3 p-4 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--navy)",
                    }}
                  >
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--navy)" }}
                    >
                      {action.label}
                    </p>

                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={15}
                    className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}