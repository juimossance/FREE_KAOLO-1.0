import { useState } from "react";
import { Star, ThumbsUp, Building2, ShieldCheck, MessageSquareQuote } from "lucide-react";

const reviews = [
  { id: 1, company: "RetailCorp CI", avatar: "RC", project: "E-commerce Platform", date: "Avr 2026", rating: 5, communication: 5, quality: 5, deadline: 5, comment: "Kofi est un développeur exceptionnel. Il a livré un projet de haute qualité avant les délais prévus. Sa communication était impeccable tout au long du projet. Je le recommande vivement.", liked: 12 },
  { id: 2, company: "FinanceApp", avatar: "FA", project: "API REST Banking", date: "Mar 2026", rating: 5, communication: 4, quality: 5, deadline: 5, comment: "Excellent travail sur l'API. La documentation est complète et le code est propre et maintenable. Très professionnel.", liked: 8 },
  { id: 3, company: "StartupCI", avatar: "SC", project: "Dashboard Analytics", date: "Fév 2026", rating: 4, communication: 4, quality: 4, deadline: 5, comment: "Bon travail dans l'ensemble. Quelques allers-retours nécessaires pour les ajustements UI, mais le résultat final est satisfaisant.", liked: 5 },
  { id: 4, company: "DataTech", avatar: "DT", project: "Data Visualization Tool", date: "Jan 2026", rating: 5, communication: 5, quality: 5, deadline: 5, comment: "Exceptionnel ! Les visualisations D3.js sont magnifiques et performantes. Kofi a dépassé toutes mes attentes.", liked: 19 },
  { id: 5, company: "ImmoCI", avatar: "IC", project: "CRM Immobilier", date: "Déc 2025", rating: 4, communication: 3, quality: 4, deadline: 4, comment: "Bon développeur, quelques problèmes de communication au départ mais le projet a été livré correctement.", liked: 3 },
];

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} style={{ color: "var(--gold)" }} fill={i <= rating ? "var(--gold)" : "none"} />
      ))}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-28 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
        <div className="h-full rounded-full" style={{ width: `${(value / 5) * 100}%`, background: "var(--gold)" }} />
      </div>
      <span className="text-xs font-semibold w-6 text-right" style={{ color: "var(--navy)" }}>
        {value}
      </span>
    </div>
  );
}

function HelpfulButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(false);

  const toggle = () => {
    setActive((a) => !a);
    setCount((c) => (active ? c - 1 : c + 1));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
      style={{
        color: active ? "var(--navy)" : "var(--muted-foreground)",
        background: active ? "var(--secondary)" : "transparent",
      }}
      aria-pressed={active}
    >
      <ThumbsUp size={13} fill={active ? "var(--navy)" : "none"} />
      {count} utile{count > 1 ? "s" : ""}
    </button>
  );
}

export function Ratings() {
  const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const avgComm = (reviews.reduce((sum, r) => sum + r.communication, 0) / reviews.length).toFixed(1);
  const avgQuality = (reviews.reduce((sum, r) => sum + r.quality, 0) / reviews.length).toFixed(1);
  const avgDeadline = (reviews.reduce((sum, r) => sum + r.deadline, 0) / reviews.length).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
            Évaluations & notes
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {reviews.length} évaluations de clients
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#ECFDF5", color: "#047857" }}
        >
          <ShieldCheck size={13} /> Avis vérifiés · projets réalisés sur la plateforme
        </span>
      </div>

      {/* Note globale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border bg-white text-center flex flex-col items-center justify-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-6xl font-bold mb-2" style={{ color: "var(--navy)" }}>
            {avg}
          </p>
          <div className="flex justify-center mb-2">
            <StarDisplay rating={Math.round(parseFloat(avg))} size={20} />
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            sur {reviews.length} évaluations
          </p>
        </div>

        <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--navy)" }}>
            Distribution des notes
          </h4>
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.stars} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-14">
                  {Array.from({ length: d.stars }).map((_, i) => (
                    <Star key={i} size={10} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                  ))}
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--secondary)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: reviews.length > 0 ? `${(d.count / reviews.length) * 100}%` : "0%",
                      background: "var(--gold)",
                    }}
                  />
                </div>
                <span className="text-xs font-medium w-4 text-right" style={{ color: "var(--navy)" }}>
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--navy)" }}>
            Détail par critère
          </h4>
          <div className="space-y-3">
            <RatingBar label="Communication" value={parseFloat(avgComm)} />
            <RatingBar label="Qualité du travail" value={parseFloat(avgQuality)} />
            <RatingBar label="Respect des délais" value={parseFloat(avgDeadline)} />
            <RatingBar label="Note globale" value={parseFloat(avg)} />
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "var(--secondary)", color: "var(--navy)" }}
              >
                {review.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold" style={{ color: "var(--navy)" }}>
                      {review.company}
                    </p>
                    <span
                      className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#ECFDF5", color: "#047857" }}
                    >
                      <ShieldCheck size={10} /> Vérifié
                    </span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <Building2 size={11} /> {review.project}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {review.date}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <StarDisplay rating={review.rating} size={14} />
                  <span className="text-xs font-semibold" style={{ color: "var(--navy)" }}>
                    {review.rating}/5
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <MessageSquareQuote size={15} className="shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {review.comment}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span>
                      Communication : <strong style={{ color: "var(--navy)" }}>{review.communication}/5</strong>
                    </span>
                    <span>
                      Qualité : <strong style={{ color: "var(--navy)" }}>{review.quality}/5</strong>
                    </span>
                    <span>
                      Délais : <strong style={{ color: "var(--navy)" }}>{review.deadline}/5</strong>
                    </span>
                  </div>
                  <HelpfulButton initialCount={review.liked} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}