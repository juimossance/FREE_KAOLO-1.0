// src/app/pages/enterprise/NotationModal.tsx

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";

import { apiFetch } from "../../../services/http";
import type { Recruitment } from "../../../services/recrutementService";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

type NotationModalProps = {
  recrutement: Recruitment;
  onClose: () => void;
  onSuccess: (recrutementId: number, note: number, commentaire: string) => void;
};

// ─────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────

export function NotationModal({
  recrutement,
  onClose,
  onSuccess,
}: NotationModalProps) {
  const [note, setNote] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (note === 0) {
      setError("Sélectionnez une note avant de valider.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // ⚠️ À AJUSTER : remplace par l'URL/méthode réelle de ton
      // service de notation (ex: recruitmentService.noterFreelance).
      await apiFetch(`/recrutements/${recrutement.id}/avis`, {
        method: "POST",
        body: JSON.stringify({ note, commentaire }),
      });

      onSuccess(recrutement.id, note, commentaire);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer votre avis."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedNote = hoverNote || note;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className="text-base sm:text-lg font-bold"
              style={{ color: "var(--navy)" }}
            >
              Noter {recrutement.freelancerPrenom} {recrutement.freelancerNom}
            </h3>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Projet : {recrutement.projetTitre}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-slate-100"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Étoiles */}
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setNote(value)}
                onMouseEnter={() => setHoverNote(value)}
                onMouseLeave={() => setHoverNote(0)}
                className="transition-transform hover:scale-110"
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
              >
                <Star
                  size={30}
                  fill={value <= displayedNote ? "var(--gold)" : "none"}
                  style={{ color: "var(--gold)" }}
                />
              </button>
            );
          })}
        </div>

        <p
          className="text-center text-xs mt-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          {displayedNote > 0
            ? `${displayedNote} / 5`
            : "Sélectionnez une note"}
        </p>

        {/* Commentaire */}
        <div className="mt-5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}
          >
            Commentaire (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={3}
            placeholder="Décrivez votre expérience avec ce freelance..."
            className="w-full mt-2 p-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {error && (
          <p className="text-xs mt-3" style={{ color: "#B91C1C" }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: "var(--navy)", color: "#FFFFFF" }}
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Valider l'avis"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}