import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  Check,
  Code2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

import {
  skillAssessmentService,
  type SkillAssessment,
  type SkillResult,
} from "../../../services/skillAssessmentService";
import { useAuth } from "../../../hooks/useAuth";

// Adapte uniquement ce chemin si ton useAuth se trouve ailleurs


/* =========================================================
   TYPES INTERNES
========================================================= */

interface AssessmentSkill {
  name: string;
  questions: SkillAssessment["questions"];
}

interface LocalResult {
  skill: string;
  score: number;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function SkillAssessmentPage() {
  /* =========================================================
     AUTHENTIFICATION
  ========================================================= */

  const { user } = useAuth();

  /*
   * Selon ton UserContext, le freelancerId peut être directement
   * disponible sous user.freelancerId.
   *
   * On prévoit aussi user.id et user.userId pour éviter
   * les problèmes si ton objet utilisateur utilise un autre nom.
   */

  const freelancerId =user?.freelancerId ;

  /* =========================================================
     ÉTATS
  ========================================================= */

  const [skills, setSkills] = useState<
    AssessmentSkill[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [started, setStarted] = useState(false);

  const [skillIndex, setSkillIndex] = useState(0);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  /*
   * Les réponses sont enregistrées par compétence.
   *
   * Exemple :
   *
   * {
   *   "Java": {
   *      "0": 1,
   *      "1": 3
   *   },
   *   "Spring Boot": {
   *      "0": 2
   *   }
   * }
   */

  const [answers, setAnswers] = useState<
    Record<string, Record<number, number>>
  >({});

  const [finished, setFinished] = useState(false);

  const [results, setResults] = useState<
    LocalResult[]
  >([]);

  const [timeLeft, setTimeLeft] = useState(15);

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================================
     CHARGEMENT DES COMPÉTENCES
  ========================================================= */

  useEffect(() => {
    if (!freelancerId) {
      setLoading(false);
      setError(
        "Impossible d'identifier votre profil freelancer."
      );
      return;
    }

    loadAssessment();
  }, [freelancerId]);

  async function loadAssessment() {
    if (!freelancerId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      /*
       * 1. Récupérer les compétences du freelancer
       */

      const freelancerSkills =
        await skillAssessmentService.getSkills(
          Number(freelancerId)
        );

      if (
        !freelancerSkills ||
        freelancerSkills.length === 0
      ) {
        setError(
          "Aucune compétence n'est enregistrée sur votre profil."
        );

        return;
      }

      /*
       * 2. Pour chaque compétence,
       * demander à Groq de générer le test.
       */

      const generatedSkills: AssessmentSkill[] = [];

      for (const skill of freelancerSkills) {
        try {
          const assessment =
            await skillAssessmentService.generate(
              Number(freelancerId),
              skill
            );

          if (
            assessment &&
            assessment.questions &&
            assessment.questions.length > 0
          ) {
            generatedSkills.push({
              name: assessment.skill ?? skill,
              questions: assessment.questions,
            });
          }
        } catch (skillError) {
          console.error(
            `Erreur génération test ${skill}:`,
            skillError
          );
        }
      }

      if (generatedSkills.length === 0) {
        setError(
          "Impossible de générer les questions pour vos compétences."
        );

        return;
      }

      setSkills(generatedSkills);

      /*
       * 10 secondes par question
       */

      setTimeLeft(10);
    } catch (err) {
      console.error(
        "Erreur récupération évaluation :",
        err
      );

      setError(
        "Impossible de préparer votre évaluation."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     COMPÉTENCE ACTUELLE
  ========================================================= */

  const currentSkill = skills[skillIndex];

  const questions =
    currentSkill?.questions ?? [];

  const currentQuestion =
    questions[questionIndex];

  /* =========================================================
     RÉPONSE ACTUELLE
  ========================================================= */

  const selectedAnswer =
    currentSkill && currentQuestion
      ? answers[currentSkill.name]?.[questionIndex]
      : undefined;

  /* =========================================================
     TOTAL QUESTIONS
  ========================================================= */

  const totalQuestions = useMemo(() => {
    return skills.reduce(
      (total, skill) =>
        total + skill.questions.length,
      0
    );
  }, [skills]);

  /* =========================================================
     QUESTION GLOBALE
  ========================================================= */

  const currentGlobalQuestion = useMemo(() => {
    let count = 0;

    for (let i = 0; i < skillIndex; i++) {
      count += skills[i].questions.length;
    }

    return count + questionIndex + 1;
  }, [skills, skillIndex, questionIndex]);

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (
      !started ||
      finished ||
      submitting ||
      !currentQuestion
    ) {
      return;
    }

    setTimeLeft(10);

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    started,
    finished,
    submitting,
    skillIndex,
    questionIndex,
    currentQuestion,
  ]);

  /* =========================================================
     PASSAGE AUTOMATIQUE
  ========================================================= */

  useEffect(() => {
    if (
      !started ||
      finished ||
      submitting ||
      timeLeft !== 0 ||
      !currentQuestion
    ) {
      return;
    }

    goToNextQuestion();
  }, [
    timeLeft,
    started,
    finished,
    submitting,
    skillIndex,
    questionIndex,
    currentQuestion,
  ]);

  /* =========================================================
     COMMENCER
  ========================================================= */

  function startAssessment() {
    if (skills.length === 0) {
      return;
    }

    setStarted(true);
    setFinished(false);

    setSkillIndex(0);
    setQuestionIndex(0);

    setAnswers({});
    setResults([]);

    setTimeLeft(10);
  }

  /* =========================================================
     SÉLECTION RÉPONSE
  ========================================================= */

  function selectAnswer(index: number) {
    if (!currentSkill) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,

      [currentSkill.name]: {
        ...(previous[currentSkill.name] ?? {}),
        [questionIndex]: index,
      },
    }));
  }

  /* =========================================================
     QUESTION SUIVANTE
  ========================================================= */

  function goToNextQuestion() {
    /*
     * Question suivante dans la compétence actuelle
     */

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(
        (previous) => previous + 1
      );

      return;
    }

    /*
     * Compétence suivante
     */

    if (skillIndex < skills.length - 1) {
      setSkillIndex(
        (previous) => previous + 1
      );

      setQuestionIndex(0);

      return;
    }

    /*
     * Dernière question du dernier skill
     */

    submitAllAssessments();
  }

  /* =========================================================
     PASSAGE MANUEL
  ========================================================= */

  function next() {
    /*
     * Le bouton "Question suivante"
     * nécessite une réponse.
     */

    if (selectedAnswer === undefined) {
      return;
    }

    goToNextQuestion();
  }

  /* =========================================================
     ENVOYER TOUS LES RÉSULTATS
  ========================================================= */

  async function submitAllAssessments() {
    if (
      submitting ||
      !freelancerId
    ) {
      return;
    }

    try {
      setSubmitting(true);

      const finalResults: LocalResult[] = [];

      /*
       * Chaque compétence possède son propre endpoint
       * POST /skill-assessment/submit/{freelancerId}
       */

      for (const skill of skills) {
        const skillAnswers =
          answers[skill.name] ?? {};

        /*
         * Le backend attend :
         *
         * answers: number[]
         *
         * Exemple :
         * [1, 2, 0, 3, 1]
         */

        const formattedAnswers =
          skill.questions.map(
            (_, index) =>
              skillAnswers[index] ?? -1
          );

        try {
          const result =
            await skillAssessmentService.submit(
              Number(freelancerId),
              skill.name,
              formattedAnswers
            );

          finalResults.push(result);
        } catch (skillError) {
          console.error(
            `Erreur soumission ${skill.name}:`,
            skillError
          );
        }
      }

      if (finalResults.length === 0) {
        setError(
          "Impossible d'enregistrer les résultats."
        );

        return;
      }

      setResults(finalResults);

      setFinished(true);
    } catch (err) {
      console.error(
        "Erreur soumission évaluation :",
        err
      );

      setError(
        "Une erreur est survenue lors de l'enregistrement des résultats."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     RECOMMENCER
  ========================================================= */

  async function restartAssessment() {
    setStarted(false);
    setFinished(false);

    setSkillIndex(0);
    setQuestionIndex(0);

    setAnswers({});
    setResults([]);

    await loadAssessment();
  }

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
        <div className="text-center">

          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#D4AF3715",
              color: "#D4AF37",
            }}
          >
            <Sparkles size={25} />
          </div>

          <h1 className="mt-5 text-lg font-semibold">
            Préparation de votre évaluation
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            L'intelligence artificielle prépare des
            questions adaptées aux compétences de votre
            profil.
          </p>

          <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full w-1/2 animate-pulse rounded-full"
              style={{
                backgroundColor: "#D4AF37",
              }}
            />
          </div>

        </div>
      </div>
    );
  }

  /* =========================================================
     ERREUR
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">

        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
            }}
          >
            <ShieldCheck size={25} />
          </div>

          <h1 className="mt-5 text-lg font-semibold">
            Évaluation indisponible
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAssessment}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <RotateCcw size={16} />
            Réessayer
          </button>

        </section>

      </div>
    );
  }

  /* =========================================================
     START
  ========================================================= */

  if (!started) {
    return (
      <StartScreen
        skills={skills}
        questionTime={10}
        onStart={startAssessment}
      />
    );
  }

  /* =========================================================
     RESULTS
  ========================================================= */

  if (finished) {
    return (
      <ResultsScreen
        results={results}
        onRestart={restartAssessment}
      />
    );
  }

  /* =========================================================
     PROTECTION
  ========================================================= */

  if (!currentSkill || !currentQuestion) {
    return null;
  }

  const timerDanger = timeLeft <= 5;

  /* =========================================================
     ASSESSMENT
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-7 flex items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <Code2
                size={18}
                style={{
                  color: "#D4AF37",
                }}
              />

              <span className="text-sm font-semibold">
                {currentSkill.name}
              </span>

            </div>

            <p className="mt-1 text-xs text-slate-400">
              Vérification des fondamentaux
            </p>

          </div>

          <div className="flex items-center gap-2">

            {/* TIMER */}

            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                timerDanger
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Timer size={14} />

              <span>
                00:
                {String(timeLeft).padStart(2, "0")}
              </span>
            </div>

            {/* QUESTION */}

            <span
              className="rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{
                borderColor: "#D4AF3755",
                color: "#8A6A00",
                backgroundColor: "#D4AF3710",
              }}
            >
              Question {questionIndex + 1}/
              {questions.length}
            </span>

          </div>

        </div>

        {/* PROGRESSION */}

        <div className="mb-7">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs text-slate-400">
              Progression globale
            </span>

            <span className="text-xs font-medium text-slate-500">
              {currentGlobalQuestion}/
              {totalQuestions}
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  (currentGlobalQuestion /
                    totalQuestions) *
                  100
                }%`,
                backgroundColor: "#D4AF37",
              }}
            />

          </div>

        </div>

        {/* QUESTION */}

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">

          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              color: "#D4AF37",
            }}
          >
            Question
          </span>

          <h1 className="mt-3 text-xl font-semibold leading-8 md:text-2xl">
            {currentQuestion.question}
          </h1>

          {/* OPTIONS */}

          <div className="mt-8 space-y-3">

            {currentQuestion.options.map(
              (option, index) => {

                const selected =
                  selectedAnswer === index;

                return (
                  <button
                    key={`${currentSkill.name}-${questionIndex}-${index}`}
                    type="button"
                    onClick={() =>
                      selectAnswer(index)
                    }
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "bg-[#D4AF37]/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                    style={
                      selected
                        ? {
                            borderColor:
                              "#D4AF37",
                          }
                        : undefined
                    }
                  >

                    {/* LETTER */}

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
                        selected
                          ? "text-[#8A6A00]"
                          : "border-slate-200 text-slate-500"
                      }`}
                      style={
                        selected
                          ? {
                              borderColor:
                                "#D4AF37",
                              backgroundColor:
                                "#D4AF3715",
                            }
                          : undefined
                      }
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </div>

                    {/* TEXTE */}

                    <span
                      className={`flex-1 text-sm ${
                        selected
                          ? "font-medium text-[#0F172A]"
                          : "text-slate-600"
                      }`}
                    >
                      {option}
                    </span>

                    {/* CHECK */}

                    {selected && (
                      <Check
                        size={18}
                        style={{
                          color: "#D4AF37",
                        }}
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* TIMER */}

          <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">

            <Timer size={14} />

            {timerDanger ? (
              <span className="font-medium text-red-500">
                Le temps est presque écoulé...
              </span>
            ) : (
              <span>
                Temps restant pour cette question
              </span>
            )}

          </div>

          {/* FOOTER */}

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">

            <button
              type="button"
              onClick={next}
              disabled={
                selectedAnswer === undefined ||
                submitting
              }
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: "#0F172A",
              }}
            >

              {submitting
                ? "Enregistrement..."
                : currentGlobalQuestion ===
                  totalQuestions
                ? "Terminer"
                : "Question suivante"}

              <ArrowRight size={16} />

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   START SCREEN
========================================================= */

function StartScreen({
  skills,
  questionTime,
  onStart,
}: {
  skills: AssessmentSkill[];
  questionTime: number;
  onStart: () => void;
}) {
  const totalQuestions =
    skills.reduce(
      (total, skill) =>
        total + skill.questions.length,
      0
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <main className="mx-auto max-w-6xl px-6 py-12">

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">

          {/* MAIN */}

          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: "#D4AF3715",
                color: "#8A6A00",
              }}
            >
              <Sparkles size={14} />
              Évaluation de vos compétences
            </div>

            <h1 className="max-w-xl text-3xl font-bold tracking-tight">
              Vérifiez votre maîtrise technique
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Cette évaluation vérifie les fondamentaux
              des compétences déclarées sur votre profil
              freelancer.
            </p>

            {/* STATISTIQUES */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-2xl font-bold">
                  {skills.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Compétences
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-2xl font-bold">
                  {totalQuestions}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Questions
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-2xl font-bold">
                  {questionTime}s
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Par question
                </p>
              </div>

            </div>

            {/* COMPÉTENCES */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                >

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "#D4AF3715",
                      color: "#D4AF37",
                    }}
                  >
                    <Code2 size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      {skill.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {skill.questions.length} questions
                    </p>

                  </div>

                </div>
              ))}

            </div>

            {/* INFO */}

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <Timer
                size={18}
                className="mt-0.5 shrink-0"
                style={{
                  color: "#D4AF37",
                }}
              />

              <div>

                <p className="text-sm font-semibold">
                  {questionTime} secondes par question
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Si le temps arrive à zéro, la question
                  suivante s'affiche automatiquement.
                </p>

              </div>

            </div>

            {/* START */}

            <button
              type="button"
              onClick={onStart}
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95"
              style={{
                backgroundColor: "#0F172A",
              }}
            >
              Commencer l'évaluation
              <ArrowRight size={17} />
            </button>

          </section>

          {/* TRUST */}

          <section className="rounded-2xl bg-[#0F172A] p-7 text-white">

            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "#D4AF3720",
                color: "#D4AF37",
              }}
            >
              <ShieldCheck size={22} />
            </div>

            <h2 className="mt-6 text-lg font-semibold">
              Une évaluation simple
            </h2>

            <div className="mt-6 space-y-5">

              <TrustItem
                number="01"
                title="Vos compétences"
                text="Les compétences enregistrées sur votre profil sont utilisées."
              />

              <TrustItem
                number="02"
                title="Questions techniques"
                text="Des questions sont générées pour chaque compétence."
              />

              <TrustItem
                number="03"
                title="Temps limité"
                text="Chaque question dispose de 10 secondes."
              />

              <TrustItem
                number="04"
                title="Votre score"
                text="Chaque compétence reçoit une note et un niveau."
              />

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
        style={{
          backgroundColor: "#D4AF3718",
          color: "#D4AF37",
        }}
      >
        {number}
      </div>

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   RESULTS
========================================================= */

function ResultsScreen({
  results,
  onRestart,
}: {
  results: SkillResult[];
  onRestart: () => void;
}) {
  const globalScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (total, result) =>
              total + result.score,
            0
          ) / results.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">

          <div className="flex items-center gap-3">

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "#D4AF3718",
                color: "#D4AF37",
              }}
            >
              <Award size={19} />
            </div>

            <div>

              <p className="text-sm font-bold">
                Résultats
              </p>

              <p className="text-[11px] text-slate-400">
                Évaluation des compétences
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* SCORE GLOBAL */}

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex flex-col items-center text-center">

            <div
              className="flex h-32 w-32 items-center justify-center rounded-full border-4"
              style={{
                borderColor: "#D4AF37",
              }}
            >

              <div>

                <p
                  className="text-4xl font-bold"
                  style={{
                    color: "#D4AF37",
                  }}
                >
                  {globalScore}
                </p>

                <p className="text-xs text-slate-400">
                  / 100
                </p>

              </div>

            </div>

            <h1 className="mt-6 text-xl font-bold">
              Évaluation terminée
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Voici votre résultat pour chaque compétence.
            </p>

          </div>

        </section>

        {/* RESULTS */}

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {results.map((result) => (

            <div
              key={result.skill}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "#D4AF3715",
                      color: "#D4AF37",
                    }}
                  >
                    <Code2 size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      {result.skill}
                    </p>

                    <p className="text-xs text-slate-400">
                      Niveau {result.level}
                    </p>

                  </div>

                </div>

                <p className="text-2xl font-bold">
                  {result.score}%
                </p>

              </div>

              {/* DÉTAIL */}

              <div className="mt-4 flex justify-between text-xs text-slate-400">

                <span>
                  {result.correctAnswers}/
                  {result.totalQuestions} bonnes réponses
                </span>

                <span>
                  {result.score}%
                </span>

              </div>

              {/* BARRE */}

              <div className="mt-3 h-2 rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.score}%`,
                    backgroundColor:
                      result.score >= 75
                        ? "#16A34A"
                        : "#D4AF37",
                  }}
                />

              </div>

            </div>

          ))}

        </div>

        {/* RESTART */}

        <div className="mt-8 flex justify-center">

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            <RotateCcw size={16} />
            Refaire l'évaluation
          </button>

        </div>

      </main>

    </div>
  );
}