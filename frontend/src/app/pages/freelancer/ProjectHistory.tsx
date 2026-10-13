// src/app/pages/freelancer/ProjectHistory.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Star,
  Calendar,
  Coins,
  Building2,
  ExternalLink,
  Filter,
  Loader2,
  FolderKanban,
  CheckCircle2,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  projectHistoryService,
  type ProjectHistory,
  type ProjectHistoryStats,
} from "../../../services/projectHistoryService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  ACCEPTEE:   { bg: "#DCFCE7", color: "#166534", label: "Terminé" },
  EN_COURS:   { bg: "#DBEAFE", color: "#1E40AF", label: "En cours" },
  REJETEE:    { bg: "#FEE2E2", color: "#991B1B", label: "Annulé" },
  EN_ATTENTE: { bg: "#FEF9C3", color: "#854D0E", label: "En attente" },
};

const formatFcfa = (n: number | null | undefined) => {
  if (n == null) return "—";
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M FCFA`
    : `${n.toLocaleString()} FCFA`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

const initiales = (nom: string | null | undefined) => {
  if (!nom) return "?";
  return nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function ProjectHistory() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId;

  const [historique, setHistorique] = useState<ProjectHistory[]>([]);
  const [stats, setStats] = useState<ProjectHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("Date");

  useEffect(() => {
    if (!freelancerId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [historiqueData, statsData] = await Promise.all([
          projectHistoryService.getHistorique(freelancerId),
          projectHistoryService.getStats(freelancerId),
        ]);
        setHistorique(historiqueData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [freelancerId]);

  // ── Filtrage + tri ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...historique];

    if (filter !== "Tous") {
      const statusKey = Object.entries(statusConfig).find(([, v]) => v.label === filter)?.[0];
      if (statusKey) result = result.filter((p) => p.status === statusKey);
    }

    if (sortBy === "Date") {
      result.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
    } else if (sortBy === "Budget") {
      result.sort((a, b) => b.budget - a.budget);
    } else if (sortBy === "Note") {
      result.sort((a, b) => (b.note ?? 0) - (a.note ?? 0));
    }

    return result;
  }, [historique, filter, sortBy]);

  // ── Stats locales (fallback si l'API ne les renvoie pas encore) ───────────

  const termines = historique.filter((p) => p.status === "ACCEPTEE");
  const totalGagne = stats?.totalGagne ?? termines.reduce((s, p) => s + p.budget, 0);
  const noteMoy =
    stats?.noteMoyenne ??
    (termines.filter((p) => p.note).length > 0
      ? termines.reduce((s, p) => s + (p.note ?? 0), 0) / termines.filter((p) => p.note).length
      : 0);

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--navy)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  const stats4 = [
    { label: "Total projets", value: String(historique.length), icon: FolderKanban },
    { label: "Terminés", value: String(termines.length), icon: CheckCircle2 },
    { label: "Note moyenne", value: noteMoy > 0 ? `${noteMoy.toFixed(1)}/5` : "—", icon: Star },
    { label: "Total gagné", value: formatFcfa(totalGagne), icon: Coins },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          Historique des projets
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {termines.length} projet{termines.length > 1 ? "s" : ""} réalisé{termines.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats4.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "var(--secondary)", color: "var(--navy)" }}
            >
              <s.icon size={16} />
            </span>
            <p className="text-xl font-bold mt-3" style={{ color: "var(--navy)" }}>
              {s.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {["Tous", "Terminé", "En cours", "Annulé"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: filter === f ? "var(--navy)" : "var(--card)",
                color: filter === f ? "#FFF" : "var(--muted-foreground)",
                borderColor: filter === f ? "var(--navy)" : "var(--border)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} style={{ color: "var(--muted-foreground)" }} />
          <select
            className="px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", color: "var(--navy)", background: "var(--card)" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Date</option>
            <option>Budget</option>
            <option>Note</option>
          </select>
        </div>
      </div>

      {/* ── Liste ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: "var(--border)" }}>
          <span
            className="flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            <Inbox size={22} />
          </span>
          <p className="font-semibold" style={{ color: "var(--navy)" }}>
            Aucun projet trouvé
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {filter !== "Tous" ? "Essayez un autre filtre" : "Postulez à des projets pour les voir ici"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((project) => {
            const s = statusConfig[project.status] ?? statusConfig.EN_ATTENTE;
            return (
              <div
                key={project.id}
                className="p-6 rounded-2xl border bg-white hover:shadow-md transition-shadow"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar entreprise */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}
                  >
                    {project.entrepriseAvatar ?? initiales(project.entrepriseNom)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Titre + statut */}
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                          {project.projetTitre}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          <Building2 size={12} />
                          <span className="text-xs">{project.entrepriseNom}</span>
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* Dates + budget */}
                    <div className="flex flex-wrap gap-4 mb-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(project.dateDebut)}
                        {project.dateFin ? ` → ${formatDate(project.dateFin)}` : " (en cours)"}
                        {project.duree && ` · ${project.duree}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins size={12} /> {formatFcfa(project.budget)}
                      </span>
                    </div>

                    {/* Compétences */}
                    {project.competences?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.competences.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{ background: "var(--secondary)", color: "var(--navy)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Note + avis */}
                    {project.note && project.note > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--secondary)" }}>
                        <div className="flex gap-0.5 mt-0.5 shrink-0">
                          {Array.from({ length: project.note }).map((_, i) => (
                            <Star key={i} size={12} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                          ))}
                        </div>
                        {project.commentaireEntreprise && (
                          <p className="text-xs italic" style={{ color: "var(--foreground)" }}>
                            {project.commentaireEntreprise}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-[var(--secondary)]"
                    aria-label="Voir le détail du projet"
                  >
                    <ExternalLink size={15} style={{ color: "var(--navy)" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}