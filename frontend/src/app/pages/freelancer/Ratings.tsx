// src/app/pages/freelancer/Ratings.tsx
import { useEffect, useState } from "react";
import { Star, Building2, ShieldCheck, MessageSquareQuote } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { Avis, avisService } from "../../../services/avisService";

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ color: "var(--gold)" }} fill={i <= rating ? "var(--gold)" : "none"} />
      ))}
    </div>
  );
}

const initiales = (nom?: string) =>
  nom ? nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "";

export function Ratings() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId;

  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!freelancerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await avisService.getAvis(freelancerId);
        if (!cancelled) setAvis(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Impossible de charger les avis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [freelancerId]);

  const total = avis.length;
  const moyenne = total ? avis.reduce((s, a) => s + a.note, 0) / total : 0;
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: avis.filter((a) => a.note === stars).length,
  }));

  if (loading) {
    return <p className="p-6 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Chargement des avis...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Évaluations & notes</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {total} évaluation{total > 1 ? "s" : ""} de clients
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "#ECFDF5", color: "#047857" }}>
          <ShieldCheck size={13} /> Avis vérifiés : projets réalisés sur la plateforme
        </span>
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border bg-white text-center flex flex-col items-center justify-center lg:col-span-1"
             style={{ borderColor: "var(--border)" }}>
          <p className="text-6xl font-bold mb-2" style={{ color: "var(--navy)" }}>
            {total ? moyenne.toFixed(1) : "—"}
          </p>
          <StarDisplay rating={Math.round(moyenne)} size={20} />
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            sur {total} évaluation{total > 1 ? "s" : ""}
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-white lg:col-span-2" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--navy)" }}>Distribution des notes</h4>
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.stars} className="flex items-center gap-2">
                <span className="text-xs w-4" style={{ color: "var(--muted-foreground)" }}>{d.stars}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                  <div className="h-full rounded-full"
                       style={{ width: total ? `${(d.count / total) * 100}%` : "0%", background: "var(--gold)" }} />
                </div>
                <span className="text-xs font-medium w-4 text-right" style={{ color: "var(--navy)" }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="p-8 rounded-2xl border bg-white text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          Aucun avis pour le moment. Les entreprises pourront vous noter une fois une mission terminée.
        </div>
      ) : (
        <div className="space-y-4">
          {avis.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                     style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                  {initiales(r.entrepriseNom)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold" style={{ color: "var(--navy)" }}>{r.entrepriseNom || "Entreprise"}</p>
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#ECFDF5", color: "#047857" }}>
                        <ShieldCheck size={10} /> Vérifié
                      </span>
                      {r.projetTitre && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          <Building2 size={11} /> {r.projetTitre}
                        </div>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(r.date)}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <StarDisplay rating={r.note} size={14} />
                    <span className="text-xs font-semibold" style={{ color: "var(--navy)" }}>{r.note}/5</span>
                  </div>

                  {r.commentaire && (
                    <div className="flex gap-2">
                      <MessageSquareQuote size={15} className="shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }} />
                      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{r.commentaire}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}