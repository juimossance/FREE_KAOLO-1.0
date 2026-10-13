import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Sparkles,
  Loader2,
  Download,
  Save,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { aiCvService, type AtsCv } from "../../../services/Aicvservice";

export function CvAiAssistant() {
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cv, setCv] = useState<AtsCv | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [newCompetence, setNewCompetence] = useState("");
  const [newLangue, setNewLangue] = useState("");

  // Normalise toutes les données provenant du backend.
  // L'objectif est qu'aucun tableau ou objet utilisé dans le JSX ne soit null.
  const normalizeCv = (data: AtsCv): AtsCv => ({
    ...data,

    infosPersonnelles: {
      prenom: data.infosPersonnelles?.prenom ?? "",
      nom: data.infosPersonnelles?.nom ?? "",
      email: data.infosPersonnelles?.email ?? "",
      telephone: data.infosPersonnelles?.telephone ?? "",
      ville: data.infosPersonnelles?.ville ?? "",
    },

    liens: {
      linkedin: data.liens?.linkedin ?? "",
      github: data.liens?.github ?? "",
      siteweb: data.liens?.siteweb ?? "",
    },

    titrePoste: data.titrePoste ?? "",
    resume: data.resume ?? "",

    diagnostics: data.diagnostics ?? [],
    competences: data.competences ?? [],

    experiences: (data.experiences ?? []).map((exp) => ({
      ...exp,
      poste: exp.poste ?? "",
      entreprise: exp.entreprise ?? "",
      periode: exp.periode ?? "",
      bullets: exp.bullets ?? [],
    })),

    formations: (data.formations ?? []).map((formation) => ({
      ...formation,
      diplome: formation.diplome ?? "",
      etablissement: formation.etablissement ?? "",
      periode: formation.periode ?? "",
    })),

    langues: data.langues ?? [],
    suggestions: data.suggestions ?? [],
  });

  // ── Chargement initial : on tente de reprendre le dernier brouillon ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingDraft(true);

        const draft = await aiCvService.getDraft();

        if (draft) {
          setCv(normalizeCv(draft));
          setStatus("Brouillon repris là où vous l'aviez laissé.");
        }
      } catch (err) {
        // Pas de brouillon ou erreur silencieuse :
        // on retombe sur l'écran "Analyser".
      } finally {
        setLoadingDraft(false);
      }
    };

    load();
  }, []);

  const handleAnalyze = async (isReanalysis = false) => {
    if (isReanalysis) {
      const confirmed = window.confirm(
        "Relancer l'analyse va remplacer vos modifications actuelles par une nouvelle version générée à partir de votre CV importé. Continuer ?"
      );

      if (!confirmed) return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setStatus(null);

      const result = await aiCvService.analyzeCv();

      setCv(normalizeCv(result));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'analyser le CV. Vérifiez qu'un CV a bien été importé dans votre profil."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!cv) return;

    try {
      setSaving(true);
      setError(null);

      const normalizedCv = normalizeCv(cv);
      setCv(normalizedCv);

      await aiCvService.saveDraft(normalizedCv);

      setStatus("Modifications enregistrées.");
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le brouillon."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!cv) return;

    try {
      setDownloading(true);
      setError(null);

      const normalizedCv = normalizeCv(cv);
      setCv(normalizedCv);

      const blob = await aiCvService.generateAtsPdf(normalizedCv);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `CV-${normalizedCv.infosPersonnelles.nom || "candidat"}-ATS.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de générer le PDF."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ── Helpers d'édition ──

  const patch = (fn: (draft: AtsCv) => AtsCv) => {
    setCv((prev) => (prev ? fn(normalizeCv(prev)) : prev));
  };

  const updateInfo = (
    field: keyof AtsCv["infosPersonnelles"],
    value: string
  ) =>
    patch((d) => ({
      ...d,
      infosPersonnelles: {
        ...d.infosPersonnelles,
        [field]: value,
      },
    }));

  const updateLien = (
    field: keyof AtsCv["liens"],
    value: string
  ) =>
    patch((d) => ({
      ...d,
      liens: {
        ...d.liens,
        [field]: value,
      },
    }));

  const addCompetence = () => {
    if (!newCompetence.trim()) return;

    patch((d) => ({
      ...d,
      competences: [...(d.competences ?? []), newCompetence.trim()],
    }));

    setNewCompetence("");
  };

  const removeCompetence = (i: number) =>
    patch((d) => ({
      ...d,
      competences: (d.competences ?? []).filter(
        (_, idx) => idx !== i
      ),
    }));

  const addLangue = () => {
    if (!newLangue.trim()) return;

    patch((d) => ({
      ...d,
      langues: [...(d.langues ?? []), newLangue.trim()],
    }));

    setNewLangue("");
  };

  const removeLangue = (i: number) =>
    patch((d) => ({
      ...d,
      langues: (d.langues ?? []).filter(
        (_, idx) => idx !== i
      ),
    }));

  const addExperience = () =>
    patch((d) => ({
      ...d,
      experiences: [
        ...(d.experiences ?? []),
        {
          poste: "",
          entreprise: "",
          periode: "",
          bullets: [""],
        },
      ],
    }));

  const removeExperience = (ei: number) =>
    patch((d) => ({
      ...d,
      experiences: (d.experiences ?? []).filter(
        (_, i) => i !== ei
      ),
    }));

  const updateExperienceField = (
    ei: number,
    field: "poste" | "entreprise" | "periode",
    value: string
  ) =>
    patch((d) => {
      const experiences = [...(d.experiences ?? [])];

      if (!experiences[ei]) return d;

      experiences[ei] = {
        ...experiences[ei],
        [field]: value,
      };

      return {
        ...d,
        experiences,
      };
    });

  const addBullet = (ei: number) =>
    patch((d) => {
      const experiences = [...(d.experiences ?? [])];

      if (!experiences[ei]) return d;

      experiences[ei] = {
        ...experiences[ei],
        bullets: [...(experiences[ei].bullets ?? []), ""],
      };

      return {
        ...d,
        experiences,
      };
    });

  const updateBullet = (
    ei: number,
    bi: number,
    value: string
  ) =>
    patch((d) => {
      const experiences = [...(d.experiences ?? [])];

      if (!experiences[ei]) return d;

      const bullets = [...(experiences[ei].bullets ?? [])];

      if (bi >= bullets.length) return d;

      bullets[bi] = value;

      experiences[ei] = {
        ...experiences[ei],
        bullets,
      };

      return {
        ...d,
        experiences,
      };
    });

  const removeBullet = (ei: number, bi: number) =>
    patch((d) => {
      const experiences = [...(d.experiences ?? [])];

      if (!experiences[ei]) return d;

      experiences[ei] = {
        ...experiences[ei],
        bullets: (experiences[ei].bullets ?? []).filter(
          (_, i) => i !== bi
        ),
      };

      return {
        ...d,
        experiences,
      };
    });

  const addFormation = () =>
    patch((d) => ({
      ...d,
      formations: [
        ...(d.formations ?? []),
        {
          diplome: "",
          etablissement: "",
          periode: "",
        },
      ],
    }));

  const removeFormation = (fi: number) =>
    patch((d) => ({
      ...d,
      formations: (d.formations ?? []).filter(
        (_, i) => i !== fi
      ),
    }));

  const updateFormationField = (
    fi: number,
    field: "diplome" | "etablissement" | "periode",
    value: string
  ) =>
    patch((d) => {
      const formations = [...(d.formations ?? [])];

      if (!formations[fi]) return d;

      formations[fi] = {
        ...formations[fi],
        [field]: value,
      };

      return {
        ...d,
        formations,
      };
    });

  const addSuggestedCompetence = (skill: string) =>
    patch((d) =>
      (d.competences ?? []).includes(skill)
        ? d
        : {
            ...d,
            competences: [
              ...(d.competences ?? []),
              skill,
            ],
            suggestions: (d.suggestions ?? []).filter(
              (s) => s !== skill
            ),
          }
    );

  const inputStyle =
    "w-full rounded-md border px-3 py-2 text-[13px] outline-none";

  // ── Rendu ──

  if (loadingDraft) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2
          size={22}
          className="animate-spin"
          style={{ color: "var(--navy)" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/freelancer/profile"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-8 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour au profil
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
            Assistant IA
          </p>

          <h1
            className="text-[26px] font-semibold tracking-tight"
            style={{ color: "var(--navy)" }}
          >
            Optimiser mon CV pour les ATS
          </h1>

          <p className="text-[13px] mt-1.5 text-slate-500 max-w-xl">
            L'IA reformule votre CV importé, identifie ce qui peut vous
            coûter des candidatures, et génère une version optimisée.
            Vos modifications restent enregistrées si vous revenez plus tard.
          </p>
        </div>

        {cv && (
          <button
            onClick={() => handleAnalyze(true)}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 shrink-0 mt-1"
          >
            <RotateCcw size={13} />
            Réanalyser
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 border-l-2 border-red-500 bg-red-50/60 pl-3.5 py-2.5 text-[13px] text-red-700 flex items-start gap-2">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {status && (
        <div className="mb-6 text-[13px] text-emerald-700 flex items-center gap-2">
          <Info size={14} />
          {status}
        </div>
      )}

      {!cv && (
        <div
          className="border rounded-lg p-8 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--secondary)",
              color: "var(--navy)",
            }}
          >
            <Sparkles size={19} />
          </div>

          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--navy)" }}
          >
            Analyser mon CV importé
          </p>

          <p className="text-[13px] text-slate-500 mb-5 max-w-sm mx-auto">
            Assurez-vous d'avoir déjà importé un CV (PDF, DOC ou DOCX)
            depuis votre profil.
          </p>

          <button
            onClick={() => handleAnalyze(false)}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--navy)" }}
          >
            {analyzing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}

            {analyzing
              ? "Analyse en cours…"
              : "Lancer l'analyse"}
          </button>
        </div>
      )}

      {cv && (
        <div className="space-y-7">
          {/* Garde-fou */}
          <div
            className="flex items-start gap-2 text-[12.5px] text-slate-500 border rounded-lg px-3.5 py-2.5"
            style={{ borderColor: "var(--border)" }}
          >
            <Info size={14} className="mt-0.5 shrink-0" />

            <span>
              L'IA n'invente aucun fait (dates, employeurs, diplômes).
              Les ajouts qu'elle propose restent en suggestion — à vous
              de les valider.
            </span>
          </div>

          {/* Diagnostics */}
          {(cv.diagnostics ?? []).length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                Ce qui peut vous coûter des candidatures
              </p>

              <div className="space-y-2.5">
                {(cv.diagnostics ?? [])
                  .slice()
                  .sort((a, b) => {
                    const order = {
                      critique: 0,
                      important: 1,
                      mineur: 2,
                    };

                    return (
                      order[a.gravite] -
                      order[b.gravite]
                    );
                  })
                  .map((d, i) => {
                    const style =
                      d.gravite === "critique"
                        ? {
                            bg: "#FEF2F2",
                            border: "#FECACA",
                            color: "#B91C1C",
                            Icon: AlertTriangle,
                            label: "Critique",
                          }
                        : d.gravite === "important"
                        ? {
                            bg: "#FFFBEB",
                            border: "#FDE68A",
                            color: "#B45309",
                            Icon: AlertCircle,
                            label: "Important",
                          }
                        : {
                            bg: "#F8FAFC",
                            border: "var(--border)",
                            color: "#64748B",
                            Icon: Info,
                            label: "Mineur",
                          };

                    const Icon = style.Icon;

                    return (
                      <div
                        key={i}
                        className="border rounded-lg p-3.5"
                        style={{
                          background: style.bg,
                          borderColor: style.border,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon
                            size={14}
                            style={{ color: style.color }}
                          />

                          <span
                            className="text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: style.color }}
                          >
                            {style.label}
                          </span>
                        </div>

                        <p
                          className="text-[13.5px] font-medium mb-1"
                          style={{ color: "var(--navy)" }}
                        >
                          {d.probleme}
                        </p>

                        <p className="text-[13px] text-slate-600 mb-1.5">
                          {d.impact}
                        </p>

                        <p className="text-[13px] text-slate-500">
                          <span className="font-semibold">
                            À faire :{" "}
                          </span>
                          {d.recommandation}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* Infos personnelles + titre */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
              Informations
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Prénom"
                value={cv.infosPersonnelles.prenom}
                onChange={(e) =>
                  updateInfo("prenom", e.target.value)
                }
              />

              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Nom"
                value={cv.infosPersonnelles.nom}
                onChange={(e) =>
                  updateInfo("nom", e.target.value)
                }
              />
            </div>

            <input
              className={inputStyle + " mb-2.5"}
              style={{ borderColor: "var(--border)" }}
              placeholder="Titre de poste"
              value={cv.titrePoste}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  titrePoste: e.target.value,
                }))
              }
            />

            <div className="grid grid-cols-3 gap-2.5">
              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Email"
                value={cv.infosPersonnelles.email}
                onChange={(e) =>
                  updateInfo("email", e.target.value)
                }
              />

              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Téléphone"
                value={cv.infosPersonnelles.telephone}
                onChange={(e) =>
                  updateInfo("telephone", e.target.value)
                }
              />

              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Ville"
                value={cv.infosPersonnelles.ville}
                onChange={(e) =>
                  updateInfo("ville", e.target.value)
                }
              />
            </div>
          </section>

          {/* Liens */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
              Liens
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="LinkedIn"
                value={cv.liens.linkedin}
                onChange={(e) =>
                  updateLien("linkedin", e.target.value)
                }
              />

              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="GitHub"
                value={cv.liens.github}
                onChange={(e) =>
                  updateLien("github", e.target.value)
                }
              />

              <input
                className={inputStyle}
                style={{ borderColor: "var(--border)" }}
                placeholder="Site web"
                value={cv.liens.siteweb}
                onChange={(e) =>
                  updateLien("siteweb", e.target.value)
                }
              />
            </div>
          </section>

          {/* Résumé */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
              Profil
            </p>

            <textarea
              value={cv.resume}
              onChange={(e) =>
                patch((d) => ({
                  ...d,
                  resume: e.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-md border px-3.5 py-2.5 text-[13.5px] outline-none resize-none"
              style={{ borderColor: "var(--border)" }}
            />
          </section>

          {/* Compétences */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
              Compétences
            </p>

            <div className="flex flex-wrap gap-2 mb-2.5">
              {(cv.competences ?? []).map((skill, i) => (
                <span
                  key={skill + i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--navy)",
                  }}
                >
                  {skill}

                  <button
                    onClick={() => removeCompetence(i)}
                    aria-label={`Retirer ${skill}`}
                  >
                    <Trash2
                      size={11}
                      className="text-slate-400 hover:text-red-600"
                    />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className={inputStyle + " flex-1"}
                style={{ borderColor: "var(--border)" }}
                placeholder="Ajouter une compétence…"
                value={newCompetence}
                onChange={(e) =>
                  setNewCompetence(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && addCompetence()
                }
              />

              <button
                onClick={addCompetence}
                className="px-3 rounded-md border text-xs font-semibold"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* Expériences */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Expérience
              </p>

              <button
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--navy)" }}
              >
                <Plus size={13} />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {(cv.experiences ?? []).map((exp, ei) => (
                <div
                  key={ei}
                  className="border rounded-lg p-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        className={inputStyle}
                        style={{ borderColor: "var(--border)" }}
                        placeholder="Poste"
                        value={exp.poste}
                        onChange={(e) =>
                          updateExperienceField(
                            ei,
                            "poste",
                            e.target.value
                          )
                        }
                      />

                      <input
                        className={inputStyle}
                        style={{ borderColor: "var(--border)" }}
                        placeholder="Entreprise"
                        value={exp.entreprise}
                        onChange={(e) =>
                          updateExperienceField(
                            ei,
                            "entreprise",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      onClick={() => removeExperience(ei)}
                      aria-label="Supprimer l'expérience"
                    >
                      <Trash2
                        size={14}
                        className="text-slate-300 hover:text-red-600 mt-2"
                      />
                    </button>
                  </div>

                  <input
                    className={inputStyle + " mb-2.5"}
                    style={{ borderColor: "var(--border)" }}
                    placeholder="Période (ex: 2022 - 2024)"
                    value={exp.periode}
                    onChange={(e) =>
                      updateExperienceField(
                        ei,
                        "periode",
                        e.target.value
                      )
                    }
                  />

                  <ul className="space-y-1.5 mb-2">
                    {(exp.bullets ?? []).map((bullet, bi) => (
                      <li
                        key={bi}
                        className="flex items-start gap-2"
                      >
                        <span className="text-slate-300 mt-1.5">
                          •
                        </span>

                        <textarea
                          value={bullet}
                          onChange={(e) =>
                            updateBullet(
                              ei,
                              bi,
                              e.target.value
                            )
                          }
                          rows={1}
                          className="flex-1 text-[13px] outline-none resize-none bg-transparent"
                        />

                        <button
                          onClick={() =>
                            removeBullet(ei, bi)
                          }
                          aria-label="Retirer"
                        >
                          <Trash2
                            size={12}
                            className="text-slate-300 hover:text-red-600 mt-1"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => addBullet(ei)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700"
                  >
                    <Plus size={12} />
                    Ajouter une puce
                  </button>
                </div>
              ))}

              {(cv.experiences ?? []).length === 0 && (
                <p className="text-[13px] text-slate-400">
                  Aucune expérience — ajoutez-en une.
                </p>
              )}
            </div>
          </section>

          {/* Formations */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Formation
              </p>

              <button
                onClick={addFormation}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--navy)" }}
              >
                <Plus size={13} />
                Ajouter
              </button>
            </div>

            <div className="space-y-2.5">
              {(cv.formations ?? []).map((f, fi) => (
                <div
                  key={fi}
                  className="border rounded-lg p-3.5 flex items-start gap-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <input
                      className={inputStyle}
                      style={{ borderColor: "var(--border)" }}
                      placeholder="Diplôme"
                      value={f.diplome}
                      onChange={(e) =>
                        updateFormationField(
                          fi,
                          "diplome",
                          e.target.value
                        )
                      }
                    />

                    <input
                      className={inputStyle}
                      style={{ borderColor: "var(--border)" }}
                      placeholder="Établissement"
                      value={f.etablissement}
                      onChange={(e) =>
                        updateFormationField(
                          fi,
                          "etablissement",
                          e.target.value
                        )
                      }
                    />

                    <input
                      className={inputStyle}
                      style={{ borderColor: "var(--border)" }}
                      placeholder="Période"
                      value={f.periode}
                      onChange={(e) =>
                        updateFormationField(
                          fi,
                          "periode",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    onClick={() => removeFormation(fi)}
                    aria-label="Supprimer"
                  >
                    <Trash2
                      size={14}
                      className="text-slate-300 hover:text-red-600 mt-2"
                    />
                  </button>
                </div>
              ))}

              {(cv.formations ?? []).length === 0 && (
                <p className="text-[13px] text-slate-400">
                  Aucune formation — ajoutez-en une.
                </p>
              )}
            </div>
          </section>

          {/* Langues */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
              Langues
            </p>

            <div className="flex flex-wrap gap-2 mb-2.5">
              {(cv.langues ?? []).map((l, i) => (
                <span
                  key={l + i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    background: "var(--secondary)",
                    color: "var(--navy)",
                  }}
                >
                  {l}

                  <button
                    onClick={() => removeLangue(i)}
                    aria-label={`Retirer ${l}`}
                  >
                    <Trash2
                      size={11}
                      className="text-slate-400 hover:text-red-600"
                    />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className={inputStyle + " flex-1"}
                style={{ borderColor: "var(--border)" }}
                placeholder="Ex : Anglais (courant)"
                value={newLangue}
                onChange={(e) =>
                  setNewLangue(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && addLangue()
                }
              />

              <button
                onClick={addLangue}
                className="px-3 rounded-md border text-xs font-semibold"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </section>

          {/* Suggestions IA */}
          {(cv.suggestions ?? []).length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                Suggestions à valider
              </p>

              <div className="space-y-2">
                {(cv.suggestions ?? []).map(
                  (suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 border rounded-md px-3 py-2 text-[13px]"
                      style={{
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="text-slate-600">
                        {suggestion}
                      </span>

                      <button
                        onClick={() =>
                          addSuggestedCompetence(
                            suggestion
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold shrink-0"
                        style={{ color: "var(--navy)" }}
                      >
                        <Plus size={12} />
                        Ajouter
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border disabled:opacity-60"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
              }}
            >
              {saving ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save size={15} />
              )}

              Enregistrer mes modifications
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--navy)" }}
            >
              {downloading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Download size={15} />
              )}

              Télécharger le CV ATS (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
