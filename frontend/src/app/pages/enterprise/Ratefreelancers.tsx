
// src/app/pages/enterprise/RateFreelancers.tsx

import { useEffect, useState } from "react";
import {
  Star,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";

import {
  MissionANoter,
  notationService,
} from "../../../services/notationService";

type Onglet = "a_noter" | "notes";

/**
 * Sélecteur de note de 1 à 5 étoiles
 */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label="Note de 1 à 5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-0.5 rounded focus-visible:outline focus-visible:outline-2"
        >
          <Star
            size={26}
            style={{ color: "var(--gold)" }}
            fill={
              i <= (hover || value)
                ? "var(--gold)"
                : "none"
            }
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Affichage statique d'une note existante
 */
function StarsStatic({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          style={{ color: "var(--gold)" }}
          fill={i <= n ? "var(--gold)" : "none"}
        />
      ))}
    </div>
  );
}

/**
 * Carte d'une mission
 *
 * Règle :
 * - note === null → pas encore notée
 * - note === 0 → pas encore notée
 * - note entre 1 et 5 → déjà notée
 */
function MissionCard({
  mission,
  onRated,
}: {
  mission: MissionANoter;
  onRated: (
    id: number,
    note: number,
    commentaire: string
  ) => void;
}) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * IMPORTANT :
   * Une note à 0 signifie "aucune note".
   *
   * Seules les notes de 1 à 5 sont considérées
   * comme de vraies notes.
   */
  const dejaNote =
    mission.note != null && mission.note > 0;

  const submit = async () => {
    /**
     * Une vraie note doit obligatoirement être
     * comprise entre 1 et 5.
     */
    if (note < 1 || note > 5) {
      setError("Choisissez une note de 1 à 5.");
      return;
    }

    try {
      setSending(true);
      setError(null);

      await notationService.noter(
        mission.candidatureId,
        note,
        commentaire.trim()
      );

      /**
       * Mise à jour immédiate de l'interface
       * sans rechargement de la page.
       */
      onRated(
        mission.candidatureId,
        note,
        commentaire.trim()
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'enregistrer la note."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="p-5 rounded-2xl border bg-white space-y-4"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Informations de la mission */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p
            className="font-semibold"
            style={{ color: "var(--navy)" }}
          >
            {mission.freelancerNom}
          </p>

          <p
            className="text-xs mt-0.5 flex items-center gap-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Briefcase size={12} />

            {mission.projetTitre}

            {mission.dateFin &&
              ` · terminé le ${new Date(
                mission.dateFin
              ).toLocaleDateString("fr-FR")}`}
          </p>
        </div>

        {/* Badge uniquement si note comprise entre 1 et 5 */}
        {dejaNote && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#047857" }}
          >
            <CheckCircle size={14} />
            Noté
          </span>
        )}
      </div>

      {/* ================================
          MISSION DÉJÀ NOTÉE
          ================================ */}
      {dejaNote ? (
        <div className="space-y-2">
          <StarsStatic n={mission.note!} />

          {mission.commentaire && (
            <p
              className="text-sm"
              style={{ color: "var(--foreground)" }}
            >
              {mission.commentaire}
            </p>
          )}
        </div>
      ) : (
        /* ================================
           MISSION À NOTER
           ================================ */
        <div className="space-y-3">
          <StarPicker
            value={note}
            onChange={setNote}
          />

          <textarea
            value={commentaire}
            onChange={(e) =>
              setCommentaire(e.target.value)
            }
            maxLength={1000}
            rows={3}
            placeholder="Décrivez votre collaboration : qualité du travail, communication, respect des délais"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
          />

          {error && (
            <p
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#991B1B" }}
            >
              <AlertCircle size={13} />
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span
              className="text-[11px]"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              Une note ne peut plus être modifiée une fois
              envoyée.
            </span>

            <button
              type="button"
              onClick={submit}
              disabled={sending}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{
                background: "var(--navy)",
                color: "#fff",
              }}
            >
              {sending
                ? "Envoi..."
                : "Publier la note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Page principale de notation des freelances
 */
export function RateFreelancers() {
  const [missions, setMissions] = useState<MissionANoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onglet, setOnglet] =
    useState<Onglet>("a_noter");

  /**
   * Chargement des missions terminées
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data =
          await notationService.getMissions();

        if (!cancelled) {
          setMissions(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Impossible de charger les missions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Mise à jour locale après notation.
   */
  const handleRated = (
    id: number,
    note: number,
    commentaire: string
  ) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.candidatureId === id
          ? {
              ...m,
              note,
              commentaire,
            }
          : m
      )
    );
  };

  /**
   * IMPORTANT :
   *
   * null ou 0 = aucune note
   * 1 à 5 = note existante
   */
  const aNoter = missions.filter(
    (m) => m.note == null || m.note === 0
  );

  const notes = missions.filter(
    (m) => m.note != null && m.note > 0
  );

  const liste =
    onglet === "a_noter"
      ? aNoter
      : notes;

  /**
   * Bouton d'onglet
   */
  const tab = (
    key: Onglet,
    label: string,
    count: number
  ) => (
    <button
      type="button"
      onClick={() => setOnglet(key)}
      className="px-4 py-2 rounded-xl text-sm font-medium border"
      style={{
        borderColor: "var(--border)",
        background:
          onglet === key
            ? "var(--navy)"
            : "#fff",
        color:
          onglet === key
            ? "#fff"
            : "var(--navy)",
      }}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">

      {/* En-tête */}
      <div>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--navy)" }}
        >
          Noter vos freelances
        </h2>

        <p
          className="text-sm mt-0.5"
          style={{
            color: "var(--muted-foreground)",
          }}
        >
          Seules les missions terminées peuvent
          être notées.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        {tab(
          "a_noter",
          "À noter",
          aNoter.length
        )}

        {tab(
          "notes",
          "Déjà notés",
          notes.length
        )}
      </div>

      {/* Erreur globale */}
      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "#FEF2F2",
            borderColor: "#FECACA",
            color: "#991B1B",
          }}
        >
          {error}
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <p
          className="text-sm text-center py-8"
          style={{
            color: "var(--muted-foreground)",
          }}
        >
          Chargement...
        </p>
      ) : liste.length === 0 ? (
        /* Aucun résultat */
        <div
          className="p-8 rounded-2xl border bg-white text-center text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          {onglet === "a_noter"
            ? "Aucune mission terminée en attente de note."
            : "Vous n'avez encore noté aucun freelance."}
        </div>
      ) : (
        /* Liste des missions */
        <div className="space-y-4">
          {liste.map((m) => (
            <MissionCard
              key={m.candidatureId}
              mission={m}
              onRated={handleRated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

