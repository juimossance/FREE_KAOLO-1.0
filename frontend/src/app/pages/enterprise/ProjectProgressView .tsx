// src/app/pages/enterprise/ProjectProgressView.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  progressionService,
  type AvancementProjet,
} from "../../../services/progressionService";
import { ProgressGauge } from "../../components/progress/ProgressGauge";


const POLL_INTERVAL_MS = 15000;
const TOKENS = {
  accent: "#146B5C",
  line: "#E4E7EC",
};

export function ProjectProgressView() {
  const { id } = useParams<{ id: string }>();
  const projetId = Number(id);
  const navigate = useNavigate();

  const [data, setData] = useState<AvancementProjet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!projetId) return;
      try {
        if (!silent) setLoading(true);
        const res = await progressionService.getByProjet(projetId);
        setData(res);
        setError(null);
        setLastFetch(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'avancement.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [projetId]
  );

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), POLL_INTERVAL_MS);
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const historiqueDesc = useMemo(() => {
    const asc = (data?.historique ?? []).slice();
    return asc
      .map((entry, i) => ({
        ...entry,
        delta: i === 0 ? entry.pourcentage : entry.pourcentage - asc[i - 1].pourcentage,
      }))
      .reverse();
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={22} className="animate-spin" style={{ color: TOKENS.accent }} />
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-6 py-10"
      style={{ ["--progress-accent" as string]: TOKENS.accent, ["--line" as string]: TOKENS.line }}
    >
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-8 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux projets
      </button>

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
            Suivi de projet
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: "var(--navy)" }}>
            Avancement
          </h1>
        </div>

        <div className="flex items-center gap-1.5 pt-1 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: TOKENS.accent }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: TOKENS.accent }}
            />
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {lastFetch ? lastFetch.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 border-l-2 border-red-500 bg-red-50/60 pl-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* ── Compteur ── */}
      <div className="border rounded-lg p-6 sm:p-7" style={{ borderColor: TOKENS.line }}>
        <div className="flex items-end justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Progression globale
          </span>
          <span
            className="text-4xl font-semibold tabular-nums font-mono leading-none"
            style={{ color: "var(--navy)" }}
          >
            {data?.progression ?? 0}
            <span className="text-lg text-slate-400 ml-0.5">%</span>
          </span>
        </div>

        <ProgressGauge value={data?.progression ?? 0} />
      </div>

      {/* ── Journal ── */}
      <div className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
          Journal du freelancer
        </p>

        {historiqueDesc.length > 0 ? (
          <div>
            {historiqueDesc.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 py-3.5"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${TOKENS.line}` }}
              >
                <span className="text-[12px] font-mono tabular-nums text-slate-400 pt-0.5 w-24 shrink-0">
                  {new Date(entry.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}{" "}
                  {new Date(entry.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>

                <span
                  className="text-[13px] font-mono tabular-nums font-semibold w-14 shrink-0"
                  style={{ color: entry.delta >= 0 ? TOKENS.accent : "#B42318" }}
                >
                  {entry.delta >= 0 ? "+" : ""}
                  {entry.delta}%
                </span>

                <p className="text-[13px] text-slate-600 leading-relaxed">
                  {entry.message || <span className="text-slate-350 italic">Sans note</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="border rounded-lg px-5 py-8 text-center text-[13px] text-slate-400"
            style={{ borderColor: TOKENS.line }}
          >
            Aucune mise à jour publiée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}