// src/app/pages/freelancer/ProjectProgress.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  progressionService,
  type AvancementProjet,
} from "../../../services/progressionService";
import { ProgressGauge } from "../../components/progress/ProgressGauge";


// Palette locale au module — un seul accent, tout le reste en neutres.
const TOKENS = {
  accent: "#146B5C", // vert profond, sobre — signal "en progression"
  line: "#E4E7EC",
};

export function ProjectProgress() {
  const { id } = useParams<{ id: string }>();
  const projetId = Number(id);
  const navigate = useNavigate();

  const [data, setData] = useState<AvancementProjet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pourcentage, setPourcentage] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (!projetId) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await progressionService.getByProjet(projetId);
        setData(res);
        setPourcentage(res.progression ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'avancement.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projetId]);

  const historiqueDesc = useMemo(() => {
    const asc = (data?.historique ?? []).slice();
    return asc
      .map((entry, i) => ({
        ...entry,
        delta: i === 0 ? entry.pourcentage : entry.pourcentage - asc[i - 1].pourcentage,
      }))
      .reverse();
  }, [data]);

  const handleSubmit = async () => {
    if (!projetId) return;
    try {
      setSubmitting(true);
      setError(null);
      const updated = await progressionService.update(projetId, {
        pourcentage,
        message: message.trim(),
      });
      setData(updated);
      setMessage("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

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
        Retour
      </button>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
          Suivi de projet
        </p>
        <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: "var(--navy)" }}>
          Déclarer l'avancement
        </h1>
        <p className="text-[13px] mt-1.5 text-slate-500">
          Visible par l'entreprise dès l'enregistrement.
        </p>
      </div>

      {error && (
        <div className="mb-6 border-l-2 border-red-500 bg-red-50/60 pl-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* ── Panneau de saisie ── */}
      <div className="border rounded-lg" style={{ borderColor: TOKENS.line }}>
        <div className="p-6 sm:p-7">
          <div className="flex items-end justify-between mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Progression
            </span>
            <span
              className="text-4xl font-semibold tabular-nums font-mono leading-none"
              style={{ color: "var(--navy)" }}
            >
              {pourcentage}
              <span className="text-lg text-slate-400 ml-0.5">%</span>
            </span>
          </div>

          <ProgressGauge value={pourcentage} />

          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={pourcentage}
            onChange={(e) => setPourcentage(Number(e.target.value))}
            aria-label="Pourcentage d'avancement"
            className="w-full mt-4 progress-range"
            style={{ ["--range-accent" as string]: TOKENS.accent }}
          />
        </div>

        <div className="border-t px-6 sm:px-7 py-6" style={{ borderColor: TOKENS.line }}>
          <label
            htmlFor="progress-note"
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 block mb-2.5"
          >
            Note (optionnel)
          </label>
          <textarea
            id="progress-note"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ce qui a été fait depuis la dernière mise à jour…"
            className="w-full rounded-md border px-3.5 py-2.5 text-[14px] outline-none resize-none transition-shadow focus:shadow-[0_0_0_3px_rgba(20,107,92,0.12)]"
            style={{ borderColor: TOKENS.line }}
          />

          <div className="flex items-center justify-between mt-5">
            <span className="text-[12px] text-slate-400">
              {status === "saved" ? "Enregistré." : ""}
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "var(--navy)" }}
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              Enregistrer la mise à jour
            </button>
          </div>
        </div>
      </div>

      {/* ── Journal ── */}
      {historiqueDesc.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
            Journal
          </p>

          <div>
            {historiqueDesc.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 py-3.5"
                style={{ borderTop: i === 0 ? "none" : `1px solid ${TOKENS.line}` }}
              >
                <span className="text-[12px] font-mono tabular-nums text-slate-400 pt-0.5 w-24 shrink-0">
                  {new Date(entry.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  {new Date(entry.date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
        </div>
      )}

      <style>{`
        .progress-range {
          -webkit-appearance: none;
          height: 2px;
          background: ${TOKENS.line};
          border-radius: 1px;
        }
        .progress-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: var(--range-accent);
          cursor: pointer;
          margin-top: -6px;
          transition: transform 0.15s ease;
        }
        .progress-range::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .progress-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 3px;
          background: var(--range-accent);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}