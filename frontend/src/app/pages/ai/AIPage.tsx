import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Briefcase,
  Info,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Freelancer {
  id: number;
  name: string;
  avatar: string;
  specialite: string;
  skills: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  disponibilite: "Disponible" | "Partiellement disponible" | "Indisponible";
  tarifJournalier: number;
  ville: string;
  completedProjects: number;
  responseTime: string;
}

type ChatMessage =
  | { id: number; from: "user"; text: string }
  | { id: number; from: "assistant"; text: string; results?: { freelancer: Freelancer; matchedSkills: string[] }[] };

// ── Données ───────────────────────────────────────────────────────────────────

const freelancers: Freelancer[] = [
  { id: 1, name: "Kofi Mensah", avatar: "KM", specialite: "Développeur Full-Stack", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"], rating: 4.9, reviews: 27, verified: true, disponibilite: "Disponible", tarifJournalier: 85000, ville: "Abidjan", completedProjects: 34, responseTime: "< 2h" },
  { id: 2, name: "Awa Diallo", avatar: "AD", specialite: "Designer UI/UX", skills: ["Figma", "Design System", "Adobe XD", "Prototypage"], rating: 4.8, reviews: 19, verified: true, disponibilite: "Disponible", tarifJournalier: 65000, ville: "Dakar", completedProjects: 22, responseTime: "< 3h" },
  { id: 3, name: "Jean-Marc Kouassi", avatar: "JK", specialite: "Développeur Mobile", skills: ["React Native", "Kotlin", "Swift", "Firebase"], rating: 4.7, reviews: 15, verified: true, disponibilite: "Partiellement disponible", tarifJournalier: 90000, ville: "Abidjan", completedProjects: 18, responseTime: "< 5h" },
  { id: 4, name: "Fatou Ndiaye", avatar: "FN", specialite: "Data Analyst", skills: ["Python", "SQL", "Power BI", "Machine Learning"], rating: 4.9, reviews: 31, verified: true, disponibilite: "Disponible", tarifJournalier: 95000, ville: "Dakar", completedProjects: 29, responseTime: "< 1h" },
  { id: 5, name: "Yao N'Guessan", avatar: "YN", specialite: "Développeur Backend", skills: ["Java", "Spring Boot", "Docker", "AWS"], rating: 4.6, reviews: 12, verified: false, disponibilite: "Disponible", tarifJournalier: 80000, ville: "Bouaké", completedProjects: 9, responseTime: "< 6h" },
  { id: 6, name: "Aïcha Traoré", avatar: "AT", specialite: "Développeuse Frontend", skills: ["React", "Vue.js", "TypeScript", "Tailwind CSS"], rating: 5.0, reviews: 8, verified: true, disponibilite: "Disponible", tarifJournalier: 70000, ville: "Abidjan", completedProjects: 11, responseTime: "< 2h" },
  { id: 7, name: "Moussa Koné", avatar: "MK", specialite: "Chef de projet digital", skills: ["Agile", "Scrum", "Jira", "Gestion d'équipe"], rating: 4.8, reviews: 23, verified: true, disponibilite: "Indisponible", tarifJournalier: 100000, ville: "Abidjan", completedProjects: 26, responseTime: "< 4h" },
  { id: 8, name: "Grace Osei", avatar: "GO", specialite: "Développeuse Full-Stack", skills: ["Django", "Python", "React", "PostgreSQL"], rating: 4.7, reviews: 16, verified: true, disponibilite: "Disponible", tarifJournalier: 75000, ville: "Accra", completedProjects: 20, responseTime: "< 3h" },
];

const suggestedPrompts = [
  "Développeur React pour une application e-commerce, 3 semaines",
  "Designer UI/UX pour refondre notre application mobile",
  "Data analyst pour un tableau de bord de ventes",
];

// ── Logique de correspondance (transparente : mots-clés vs compétences) ───────

function matchFreelancers(query: string) {
  const words = query
    .toLowerCase()
    .split(/[^a-zàâäéèêëïîôöùûüç0-9+.]+/)
    .filter((w) => w.length > 2);

  const scored = freelancers.map((f) => {
    const haystack = [f.specialite, ...f.skills].map((s) => s.toLowerCase());
    const matchedSkills = f.skills.filter((skill) =>
      words.some((w) => skill.toLowerCase().includes(w) || w.includes(skill.toLowerCase()))
    );
    const specialiteMatch = words.some((w) => f.specialite.toLowerCase().includes(w));
    const score = matchedSkills.length * 2 + (specialiteMatch ? 1 : 0);
    return { freelancer: f, matchedSkills, score };
  });

  const relevant = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  if (relevant.length > 0) return { results: relevant.slice(0, 4), fallback: false };

  // Repli transparent : pas de correspondance directe, on le dit et on montre les mieux notés
  const topRated = [...freelancers].sort((a, b) => b.rating - a.rating).slice(0, 3).map((f) => ({ freelancer: f, matchedSkills: [] }));
  return { results: topRated, fallback: true };
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={13} fill="var(--gold)" style={{ color: "var(--gold)" }} />
      <span className="text-xs font-semibold" style={{ color: "var(--navy)" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function availabilityColor(status: Freelancer["disponibilite"]) {
  if (status === "Disponible") return "var(--success)";
  if (status === "Partiellement disponible") return "#D97706";
  return "var(--destructive)";
}

function FreelancerCard({
  freelancer,
  matchedSkills,
  onViewProfile,
}: {
  freelancer: Freelancer;
  matchedSkills: string[];
  onViewProfile?: (id: number) => void;
}) {
  const f = freelancer;
  return (
    <div className="rounded-2xl border bg-white p-5 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "var(--secondary)", color: "var(--navy)" }}
        >
          {f.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>
              {f.name}
            </p>
            {f.verified && (
              <span title="Profil vérifié">
                <ShieldCheck size={14} style={{ color: "var(--success)" }} />
              </span>
            )}
          </div>
          <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
            {f.specialite}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "var(--muted-foreground)" }}>
        <StarRating rating={f.rating} />
        <span>({f.reviews} avis)</span>
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {f.ville}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: availabilityColor(f.disponibilite) }} />
        <span style={{ color: "var(--foreground)" }}>{f.disponibilite}</span>
        <span className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
        <span className="flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
          <Clock size={11} /> Répond {f.responseTime}
        </span>
      </div>

      {/* Compétences — celles qui correspondent à la demande sont mises en avant */}
      <div className="flex flex-wrap gap-1.5">
        {f.skills.map((skill) => {
          const matched = matchedSkills.includes(skill);
          return (
            <span
              key={skill}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium"
              style={{
                background: matched ? "var(--navy)" : "var(--secondary)",
                color: matched ? "#FFF" : "var(--muted-foreground)",
              }}
            >
              {matched && <CheckCircle2 size={10} />}
              {skill}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 mt-1 border-t" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Tarif journalier
          </p>
          <p className="text-sm font-bold tabular-nums" style={{ color: "var(--navy)" }}>
            {f.tarifJournalier.toLocaleString()} FCFA
          </p>
        </div>
        <button
          onClick={() => onViewProfile?.(f.id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
          style={{ background: "var(--navy)", color: "#FFF" }}
        >
          Voir le profil <ArrowRight size={13} />
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
        <Briefcase size={11} /> {f.completedProjects} projets réalisés sur free-kaolo
      </p>
    </div>
  );
}

function SearchingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--navy)" }}>
        <Sparkles size={14} className="text-white" />
      </div>
      <div
        className="px-4 py-3 rounded-2xl flex items-center gap-2 text-sm"
        style={{ background: "var(--card)", borderBottomLeftRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", color: "var(--muted-foreground)" }}
      >
        <Search size={14} className="animate-pulse" />
        Recherche des profils correspondants...
      </div>
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────

export function AIPage({ onViewProfile }: { onViewProfile?: (id: number) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "assistant",
      text: "Bonjour ! Décrivez le profil que vous recherchez (compétences, type de mission, durée) et je vous propose les freelances les plus pertinents sur free-kaolo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, searching]);

  const submit = (text: string) => {
    const query = text.trim();
    if (!query || searching) return;

    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text: query }]);
    setInput("");
    setSearching(true);

    setTimeout(() => {
      const { results, fallback } = matchFreelancers(query);
      setSearching(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "assistant",
          text: fallback
            ? "Je n'ai pas trouvé de correspondance exacte avec ces compétences. Voici nos profils les mieux notés en attendant — vous pouvez aussi préciser votre besoin."
            : `J'ai trouvé ${results.length} profil${results.length > 1 ? "s" : ""} qui correspond${results.length > 1 ? "ent" : ""} à votre demande, classés par pertinence :`,
          results,
        },
      ]);
    }, 1100);
  };

  const hasConversationStarted = messages.length > 1;

  return (
    <div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="px-4 md:px-0 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: "var(--navy)" }}>
            <Sparkles size={15} className="text-white" />
          </span>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            Trouver un freelance
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Assistant automatisé de mise en relation — les suggestions se basent sur les compétences déclarées des profils
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
          {[
            { icon: ShieldCheck, text: "Profils vérifiés manuellement" },
            { icon: Star, text: "Avis certifiés après mission" },
            { icon: Info, text: "Correspondance basée sur les compétences, pas une note opaque" },
          ].map((it) => (
            <span key={it.text} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              <it.icon size={12} style={{ color: "var(--success)" }} />
              {it.text}
            </span>
          ))}
        </div>
      </div>

      {/* Zone de conversation — seule cette zone défile */}
      <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-4 md:px-0 space-y-5 pb-4">
        {messages.map((msg) =>
          msg.from === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div
                className="max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{ background: "var(--navy)", color: "#FFF", borderBottomRightRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
              >
                {msg.text}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--navy)" }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <div
                  className="max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{ background: "var(--card)", color: "var(--foreground)", borderBottomLeftRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                >
                  {msg.text}
                </div>
              </div>

              {msg.results && (
                <div className="pl-[42px] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.results.map((r) => (
                    <FreelancerCard key={r.freelancer.id} freelancer={r.freelancer} matchedSkills={r.matchedSkills} onViewProfile={onViewProfile} />
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {searching && <SearchingBubble />}

        {!hasConversationStarted && !searching && (
          <div className="pl-[42px] flex flex-wrap gap-2">
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors hover:bg-slate-50"
                style={{ borderColor: "var(--border)", color: "var(--navy)", background: "var(--card)" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Zone de saisie (fixe) */}
      <div className="px-4 md:px-0 pt-3 pb-4 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-end gap-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Décrivez le profil recherché : compétences, durée, contexte du projet..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl text-sm border outline-none resize-none focus:ring-2"
            style={{ borderColor: "var(--border)", background: "var(--secondary)", color: "var(--foreground)", maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || searching}
            className="p-3 rounded-xl flex-shrink-0 transition-all disabled:cursor-not-allowed"
            style={{
              background: input.trim() && !searching ? "var(--navy)" : "var(--secondary)",
              color: input.trim() && !searching ? "#FFF" : "var(--muted-foreground)",
            }}
            aria-label="Envoyer"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
          <Info size={11} /> Les suggestions sont générées automatiquement à partir des profils publiés — vérifiez toujours les avis avant de contacter un freelance.
        </p>
      </div>
    </div>
  );
}