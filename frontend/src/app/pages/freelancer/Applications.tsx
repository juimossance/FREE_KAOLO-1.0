// src/app/pages/freelancer/Applications.tsx
import { useEffect, useState, useMemo } from "react";
import { Clock, CheckCircle, XCircle, Eye, MessageSquare,
         Building2, Calendar, DollarSign, Search, Loader2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  candidatureFreelancerService,
  type CandidatureFreelancer,
} from "../../../services/candidatureFreelancerService";

// ── Types & config ────────────────────────────────────────────────────────────

type FilterStatus = "Toutes" | "EN_ATTENTE" | "ACCEPTEE" | "EN_COURS" | "REJETEE";

const statusConfig: Record<string, {
  bg: string; color: string; icon: React.ReactNode; label: string;
}> = {
  EN_ATTENTE: { bg: "#FEF9C3", color: "#854D0E", icon: <Clock size={12} />,       label: "En attente" },
  ACCEPTEE:   { bg: "#DCFCE7", color: "#166534", icon: <CheckCircle size={12} />, label: "Acceptée"   },
  EN_COURS:   { bg: "#DBEAFE", color: "#1E40AF", icon: <Eye size={12} />,         label: "En cours"   },
  REJETEE:    { bg: "#FEE2E2", color: "#991B1B", icon: <XCircle size={12} />,     label: "Rejetée"    },
};

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "Toutes",     label: "Toutes"     },
  { key: "EN_ATTENTE", label: "En attente" },
  { key: "ACCEPTEE",   label: "Acceptée"   },
  { key: "EN_COURS",   label: "En cours"   },
  { key: "REJETEE",    label: "Rejetée"    },
];

const formatFcfa = (n?: number) =>
  n ? `${n.toLocaleString()} FCFA` : "—";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—";

// ── Composant ─────────────────────────────────────────────────────────────────

export function Applications() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId;

  const [candidatures, setCandidatures] = useState<CandidatureFreelancer[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,       setFilter]       = useState<FilterStatus>("Toutes");
  const [search,       setSearch]       = useState("");
  const [expanded,     setExpanded]     = useState<number | null>(null);
  const [retiring,     setRetiring]     = useState<number | null>(null);

  useEffect(() => {
    if (!freelancerId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await candidatureFreelancerService.getAll(freelancerId);
        setCandidatures(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [freelancerId]);

  const handleRetirer = async (candidatureId: number) => {
    if (!confirm("Retirer cette candidature ?")) return;
    try {
      setRetiring(candidatureId);
      await candidatureFreelancerService.retirer(candidatureId);
      setCandidatures(prev => prev.filter(c => c.id !== candidatureId));
      if (expanded === candidatureId) setExpanded(null);
    } catch (err) {
      console.error("Erreur retrait:", err);
    } finally {
      setRetiring(null);
    }
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return candidatures.filter(c => {
      const matchFilter = filter === "Toutes" || c.status === filter;
      const matchSearch =
        c.projetTitre?.toLowerCase().includes(search.toLowerCase()) ||
        c.entrepriseNom?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [candidatures, filter, search]);

  const actives = candidatures.filter(
    c => c.status === "ACCEPTEE" || c.status === "EN_COURS"
  ).length;

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center p-16">
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--navy)" }} />
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-500">❌ {error}</div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          Candidatures Envoyées
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {candidatures.length} candidature{candidatures.length > 1 ? "s" : ""}
          {actives > 0 && ` · ${actives} active${actives > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* ── Stats / filtres ── */}
      <div className="grid grid-cols-5 gap-3">
        {FILTERS.map(f => {
          const count = f.key === "Toutes"
            ? candidatures.length
            : candidatures.filter(c => c.status === f.key).length;
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="p-3 rounded-2xl text-center border transition-all"
              style={{
                background:  active ? "var(--navy)" : "var(--card)",
                borderColor: active ? "var(--navy)" : "var(--border)",
                color:       active ? "#FFF" : "var(--navy)",
              }}>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs mt-0.5"
                style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
                {f.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Recherche ── */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une candidature..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
        />
      </div>

      {/* ── Liste ── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📬</p>
            <p className="font-semibold" style={{ color: "var(--navy)" }}>
              Aucune candidature trouvée
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              {filter !== "Toutes"
                ? "Modifiez vos filtres"
                : "Postulez à de nouveaux projets"}
            </p>
          </div>
        ) : (
          filtered.map(app => {
            const s          = statusConfig[app.status] ?? statusConfig.EN_ATTENTE;
            const isExpanded = expanded === app.id;
            const isRetiring = retiring === app.id;

            return (
              <div key={app.id} className="rounded-2xl border bg-white overflow-hidden"
                style={{ borderColor: "var(--border)" }}>

                {/* ── Ligne principale ── */}
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : app.id)}>

                  {/* Avatar entreprise */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                    {app.entrepriseNom?.slice(0, 2).toUpperCase() ?? "??"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--navy)" }}>
                          {app.projetTitre}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs"
                          style={{ color: "var(--muted-foreground)" }}>
                          <Building2 size={11} /> {app.entrepriseNom}
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: s.bg, color: s.color }}>
                        {s.icon} {s.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs"
                      style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Postulé : {formatDate(app.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={11} /> {formatFcfa(app.projetBudget)}
                      </span>
                      {app.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Deadline : {formatDate(app.deadline)}
                        </span>
                      )}
                    </div>

                    {app.competences && app.competences.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.competences.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-xs"
                            style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Détail expandé ── */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="pt-4">
                      {app.lettreDemotivation && (
                        <>
                          <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy)" }}>
                            Ma lettre de motivation
                          </p>
                          <p className="text-sm p-4 rounded-xl"
                            style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
                            {app.lettreDemotivation}
                          </p>
                        </>
                      )}

                      <div className="flex gap-3 mt-4">
                        {app.status !== "REJETEE" && (
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                            style={{ background: "var(--navy)", color: "#FFF" }}>
                            <MessageSquare size={14} /> Contacter
                          </button>
                        )}
                        {app.status === "EN_ATTENTE" && (
                          <button
                            onClick={() => handleRetirer(app.id)}
                            disabled={isRetiring}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-opacity"
                            style={{
                              borderColor: "var(--destructive)",
                              color:       "var(--destructive)",
                              opacity:     isRetiring ? 0.6 : 1,
                            }}>
                            {isRetiring
                              ? <Loader2 size={14} className="animate-spin" />
                              : <XCircle size={14} />}
                            Retirer la candidature
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}