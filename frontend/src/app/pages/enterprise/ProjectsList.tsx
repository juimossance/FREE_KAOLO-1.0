import { useEffect, useState } from 'react';
import { Link } from "react-router";
import { PlusCircle, Edit3, Clock, DollarSign, Search } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../services/http";

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
}

const statusConfig: Record<string, { bg: string; color: string }> = {
  "Ouvert":   { bg: "#DCFCE7", color: "#166534" },
  "En cours": { bg: "#DBEAFE", color: "#1E40AF" },
  "Terminé":  { bg: "#F3F4F6", color: "#374151" },
  "Suspendu": { bg: "#FEF9C3", color: "#854D0E" },
};

export function ProjectsList() {
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("Tous");

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // ✅ apiFetch attache le token automatiquement
        // ✅ le backend identifie l'entreprise via le JWT — pas besoin d'ID dans l'URL
        const data = await apiFetch<Projet[]>("/projets/me");
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filtered = projects.filter(p => {
    const matchSearch = p.titre?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchFilter = filter === "Tous" || p.statut === filter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "Ouvert",   count: projects.filter(p => p.statut === "Ouvert").length,   color: "#166534", bg: "#DCFCE7" },
    { label: "En cours", count: projects.filter(p => p.statut === "En cours").length, color: "#1E40AF", bg: "#DBEAFE" },
    { label: "Terminé",  count: projects.filter(p => p.statut === "Terminé").length,  color: "#374151", bg: "#F3F4F6" },
    { label: "Suspendu", count: projects.filter(p => p.statut === "Suspendu").length, color: "#854D0E", bg: "#FEF9C3" },
  ];

  if (loading) return <div className="p-6 text-center">Chargement des projets...</div>;
  if (error)   return <div className="p-6 text-red-500"> Erreur : {error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Mes Projets</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {projects.length} projet{projects.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/enterprise/post-project"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "var(--navy)", color: "#FFF" }}
        >
          <PlusCircle size={16} /> Nouveau projet
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="p-4 rounded-2xl text-center border bg-white"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Tous", "Ouvert", "En cours", "Terminé", "Suspendu"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background:   filter === f ? "var(--navy)"   : "var(--card)",
                borderColor:  filter === f ? "var(--navy)"   : "var(--border)",
                color:        filter === f ? "#FFF"           : "var(--muted-foreground)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map(project => {
          const s = statusConfig[project.statut] || { bg: "#E5E7EB", color: "#374151" };
          return (
            <div
              key={project.id}
              className="p-5 rounded-2xl border bg-white hover:shadow-md transition-shadow"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link
                      to={`/enterprise/projects/${project.id}`}
                      className="font-semibold hover:underline"
                      style={{ color: "var(--navy)" }}
                    >
                      {project.titre}
                    </Link>
                    {project.urgent && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: "#FEE2E2", color: "#991B1B" }}
                      >
                        🔥 Urgent
                      </span>
                    )}
                  </div>
                 <div className="flex flex-wrap gap-4 text-xs mb-3">
  {project.categorie && (
    <span
      className="px-2 py-0.5 rounded-full"
      style={{ background: "var(--secondary)" }}
    >
      {project.categorie}
    </span>
  )}

  <span className="flex items-center gap-1">
    <DollarSign size={11} />
    {project.budget?.toLocaleString("fr-FR")} FCFA
  </span>

  {project.deadline && (
    <span className="flex items-center gap-1">
      <Clock size={11} />
      {new Date(project.deadline).toLocaleDateString("fr-FR")}
    </span>
  )}
</div><div
  className="flex flex-wrap gap-4 text-xs"
  style={{ color: "var(--muted-foreground)" }}
>
  <span>
    {project.nombreCandidatures ?? 0} candidature
    {(project.nombreCandidatures ?? 0) > 1 ? "s" : ""}
  </span>

  <span>
    {project.vues ?? 0} vue
    {(project.vues ?? 0) > 1 ? "s" : ""}
  </span>

  {project.lieu && (
    <span>{project.lieu}</span>
  )}

  {project.experience && (
    <span>{project.experience}</span>
  )}
</div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Publié le {project.datePublication ? new Date(project.datePublication).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {project.statut}
                  </span>
                  <div className="flex gap-1.5">
                    <Link
                      to={`/enterprise/edit-project/${project.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "var(--secondary)", color: "var(--navy)" }}
                    >
                      <Edit3 size={12} /> Modifier
                    </Link>
                    <Link
                      to={`/enterprise/projects/${project.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "var(--navy)", color: "#FFF" }}
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-semibold" style={{ color: "var(--navy)" }}>Aucun projet trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}