import { useEffect, useMemo, useState } from "react";
import {
  Search, BadgeCheck, Clock, Wallet, MapPin, Send, X, ShieldCheck,
  CheckCircle2, Loader2, AlertCircle, Briefcase, Users, SearchX,
  Zap,
} from "lucide-react";
import { apiFetch } from "../../../services/http";
import { useAuth } from "../../../hooks/useAuth";
import { candidatureService } from "../../../services/candidaturesevice";


export interface Projet {
  id: number;
  titre: string;
  description: string;
  entreprise: string;
  entrepriseVerifiee: boolean;
  ville?: string;
  budget: string; // déjà formaté pour l'affichage
  typeBudget?: string;
  deadline: string | null; // ISO
  categorie: string;
  tags: string[];
  nbCandidats: number;
  urgent: boolean;
  dejaPostule?: boolean;
}

// Correspond au ProjetDto du backend (Spring).
interface ProjetDto {
  id: number;
  titre: string;
  categorie: string | null;
  description: string | null;
  budget: number | null;
  typeBudget: string | null;
  deadline: string | null;
  lieu: string | null;
  urgent: boolean;
  nombreCandidatures: number;
  competences: string[] | null;
  entrepriseNom: string | null;
  // Pas encore envoyés par le backend : voir note de réponse
  entrepriseVerifiee?: boolean;
  dejaPostule?: boolean;
}

const toProjet = (r: ProjetDto): Projet => ({
  id: r.id,
  titre: r.titre,
  description: r.description ?? "",
  entreprise: r.entrepriseNom ?? "Entreprise",
  entrepriseVerifiee: Boolean(r.entrepriseVerifiee),
  ville: r.lieu ?? undefined,
  budget: r.budget != null ? fcfa(r.budget) : "À négocier",
  typeBudget: r.typeBudget ?? undefined,
  deadline: r.deadline,
  categorie: r.categorie ?? "Autre",
  tags: r.competences ?? [],
  nbCandidats: r.nombreCandidatures ?? 0,
  urgent: r.urgent,
  dejaPostule: r.dejaPostule,
});

export const projetService = {
  // GET /api/projets : projets publics, filtres optionnels ?search= et ?categorie=
  getPublics: () => apiFetch<ProjetDto[]>("/projets").then((l) => l.map(toProjet)),
};

/* ---------- Utilitaires ---------- */
const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const SANS_ECHEANCE = 9999;
const joursRestants = (iso: string | null) =>
  iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000) : SANS_ECHEANCE;

/* ---------- Page ---------- */
export default function ProjectsPage() {
  const { user } = useAuth();
  const freelancerId = user?.role === "FREELANCER" ? user.freelancerId ?? null : null;

  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const [cible, setCible] = useState<Projet | null>(null);
  const [postules, setPostules] = useState<Set<number>>(new Set());

  useEffect(() => {
    projetService
      .getPublics()
      .then((d) => {
        setProjets(d);
        setPostules(new Set(d.filter((p) => p.dejaPostule).map((p) => p.id)));
      })
      .catch(() => setError("Impossible de charger les projets. Vérifiez votre connexion et réessayez."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(projets.map((p) => p.categorie)))],
    [projets]
  );

  const liste = projets.filter(
    (p) =>
      (cat === "Tous" || p.categorie === cat) &&
      (p.titre + p.entreprise + p.tags.join(" ")).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* En-tête */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Projets ouverts</h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading ? "Chargement…" : `${liste.length} projet${liste.length > 1 ? "s" : ""} public${liste.length > 1 ? "s" : ""} disponible${liste.length > 1 ? "s" : ""}`}
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher par titre, entreprise ou compétence"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Catégories">
              {categories.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={cat === c}
                  onClick={() => setCat(c)}
                  className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 ${
                    cat === c
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Liste */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {freelancerId === null && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Connectez-vous avec un compte freelancer pour postuler à ces projets.
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
          </div>
        )}

        {loading && (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        )}

        {!loading && !error && liste.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <SearchX className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
            <p className="mt-3 font-medium">Aucun projet ne correspond à votre recherche</p>
            <p className="text-sm text-slate-600">Essayez un autre mot-clé ou choisissez « Tous ».</p>
          </div>
        )}

        <ul className="space-y-3">
          {liste.map((p) => {
            const jours = joursRestants(p.deadline);
            const dejaPostule = postules.has(p.id);
            return (
              <li key={p.id} className="grid overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-[220px_1fr]">
                {/* Colonne budget : l'information qui compte en premier */}
                <div className="flex flex-col justify-center gap-1 border-b border-slate-200 bg-slate-900 p-5 text-white md:border-b-0 md:border-r">
                  <span className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Wallet className="h-3.5 w-3.5" aria-hidden /> Budget du client
                  </span>
                  <span className="text-lg font-semibold leading-tight">{p.budget}</span>
                  {p.typeBudget && <span className="text-sm text-slate-300">{p.typeBudget}</span>}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{p.entreprise}</span>
                    {p.entrepriseVerifiee && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Identité vérifiée
                      </span>
                    )}
                    {p.ville && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{p.ville}</span>
                    )}
                  </div>

                  <h2 className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
                    {p.titre}
                    {p.urgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                        <Zap className="h-3.5 w-3.5" aria-hidden /> Urgent
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 line-clamp-2 max-w-prose text-sm text-slate-600">{p.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{t}</span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className={`inline-flex items-center gap-1.5 ${jours <= 3 ? "font-medium text-amber-700" : ""}`}>
                        <Clock className="h-4 w-4" aria-hidden />
                        {jours === SANS_ECHEANCE
                          ? "Sans échéance"
                          : jours > 0
                            ? `${jours} jour${jours > 1 ? "s" : ""} restant${jours > 1 ? "s" : ""}`
                            : "Clôturé"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" aria-hidden /> {p.nbCandidats} candidature{p.nbCandidats > 1 ? "s" : ""}
                      </span>
                    </div>

                    {dejaPostule ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-teal-700" aria-hidden /> Candidature envoyée
                      </span>
                    ) : (
                      <button
                        disabled={jours <= 0 || freelancerId === null}
                        title={freelancerId === null ? "Seuls les comptes freelancer peuvent postuler" : undefined}
                        onClick={() => setCible(p)}
                        className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <Send className="h-4 w-4" aria-hidden /> Postuler
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      {cible && freelancerId !== null && (
        <ApplyDialog
          projet={cible}
          freelancerId={freelancerId}
          onClose={() => setCible(null)}
          onDone={(id) => setPostules((s) => new Set(s).add(id))}
        />
      )}
    </div>
  );
}

/* ---------- Confirmation de candidature ---------- */
function ApplyDialog({
  projet, freelancerId, onClose, onDone,
}: {
  projet: Projet; freelancerId: number; onClose: () => void; onDone: (id: number) => void;
}) {
  const [etat, setEtat] = useState<"idle" | "loading" | "ok" | "erreur">("idle");
  const [messageErreur, setMessageErreur] = useState("");

  const envoyer = async () => {
    setEtat("loading");
    try {
      await candidatureService.postuler(freelancerId, projet.id);
      onDone(projet.id);
      setEtat("ok");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      // Un doublon côté serveur : on grise la carte comme si la candidature existait
      if (/déjà postulé/i.test(msg)) onDone(projet.id);
      // Les messages de type JSON brut ou "Erreur HTTP" ne sont pas lisibles : on garde le texte par défaut
      setMessageErreur(msg && !msg.startsWith("{") && !msg.startsWith("Erreur HTTP") ? msg : "");
      setEtat("erreur");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="apply-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="apply-title" className="text-lg font-semibold">
              {etat === "ok" ? "Candidature envoyée" : "Confirmer votre candidature"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{projet.titre} · {projet.entreprise}</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {etat === "ok" ? (
          <div className="mt-5 flex items-start gap-3 rounded-lg bg-teal-50 p-4 text-sm text-teal-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            Le client a été notifié. Suivez la réponse dans « Mes candidatures ».
          </div>
        ) : (
          <>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3"><Briefcase className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />Votre profil sera partagé avec {projet.entreprise}.</li>
              <li className="flex gap-3"><Wallet className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />Budget : {projet.budget}{projet.typeBudget ? ` (${projet.typeBudget})` : ""}.</li>
              <li className="flex gap-3"><ShieldCheck className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />Postuler est gratuit et ne vous engage pas.</li>
            </ul>

            {etat === "erreur" && (
              <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {messageErreur || "L'envoi a échoué. Réessayez dans un instant."}
              </p>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            {etat === "ok" ? "Fermer" : "Annuler"}
          </button>
          {etat !== "ok" && (
            <button
              onClick={envoyer}
              disabled={etat === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {etat === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              {etat === "loading" ? "Envoi…" : "Envoyer ma candidature"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}