import { useMemo, useRef, useState } from "react";

import {
  Send,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  CalendarClock,
  Clock,
  Wallet,
  TrendingUp,
  Filter,
  Bookmark,
  BookmarkCheck,
  Lock,
  FileText,
  Headphones,
  ChevronDown,
  Code2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Award,
  Info,
  X,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  MessageCircle,
  UserCheck,
} from "lucide-react";

import {
  aiService,
  type FreelancerRecommendation,
  type RecommendationCriteria,
} from "../../../services/AIservice";

import {
  freelancerServices,
  type FreelancerProfil,
} from "../../../services/freelancerservices";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: number;
  from: "user" | "assistant";
  text: string;
  time: string;
};

type SortOption = "match" | "priceAsc" | "priceDesc" | "rating";

type Filters = {
  competence: string;
  localisation: string;
  disponibilite: string;
  budget: string;
  sort: SortOption;
};

type Criteria = RecommendationCriteria;

type IdealProfileExtras = {
  content?: string;
  summary?: string;
  exactMatch?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = {
  competence: "",
  localisation: "",
  disponibilite: "",
  budget: "",
  sort: "match",
};

const BUDGET_OPTIONS = [
  "< 40 000 FCFA",
  "40 000 - 60 000 FCFA",
  "60 000+ FCFA",
];

const SORT_LABELS: Record<Exclude<SortOption, "match">, string> = {
  priceAsc: "Prix croissant",
  priceDesc: "Prix décroissant",
  rating: "Mieux notés",
};

const CRITERIA_ROWS: {
  key: keyof Criteria;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    key: "competences",
    label: "Compétences",
    icon: Code2,
  },
  {
    key: "localisation",
    label: "Localisation",
    icon: MapPin,
  },
  {
    key: "experience",
    label: "Expérience",
    icon: TrendingUp,
  },
  {
    key: "duree",
    label: "Durée du projet",
    icon: CalendarClock,
  },
  {
    key: "disponibilite",
    label: "Disponibilité",
    icon: Clock,
  },
  {
    key: "typeCollaboration",
    label: "Type de collaboration",
    icon: Briefcase,
  },
  {
    key: "budget",
    label: "Budget",
    icon: Wallet,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function currentTime(): string {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(
  prenom: string | null | undefined,
  nom: string | null | undefined
): string {
  const first = prenom?.trim().charAt(0) ?? "";
  const last = nom?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "FK";
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return "Tarif non renseigné";
  }

  return `${price.toLocaleString("fr-FR")} FCFA / jour`;
}

function formatRating(rating: number | null | undefined): string {
  if (
    rating === null ||
    rating === undefined ||
    Number.isNaN(Number(rating))
  ) {
    return "0.0";
  }

  return Number(rating).toFixed(1);
}

function availabilityLabel(
  availability: string | null | undefined
): {
  text: string;
  color: string;
} {
  if (!availability) {
    return {
      text: "Disponibilité non renseignée",
      color: "var(--muted-foreground)",
    };
  }

  const value = availability.toLowerCase();

  if (
    value.includes("indisponible") ||
    value.includes("non disponible")
  ) {
    return {
      text: availability,
      color: "var(--destructive)",
    };
  }

  if (
    value.includes("immédiat") ||
    value.includes("maintenant") ||
    value.includes("disponible")
  ) {
    return {
      text: availability,
      color: "var(--success)",
    };
  }

  return {
    text: availability,
    color: "#D97706",
  };
}

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  );
}

function criteriaDisplay(
  criteria: Criteria | null,
  key: keyof Criteria
): string {
  if (!criteria) {
    return "Non précisé";
  }

  const value = criteria[key];

  if (!isFilled(value)) {
    return "Non précisé";
  }

  return Array.isArray(value)
    ? value.join(", ")
    : String(value);
}

function countCriteria(criteria: Criteria | null): number {
  if (!criteria) {
    return 0;
  }

  return CRITERIA_ROWS.filter((row) =>
    isFilled(criteria[row.key])
  ).length;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b, "fr", {
      sensitivity: "base",
    })
  );
}

function getSkillOptions(
  recommendations: FreelancerRecommendation[]
): string[] {
  return uniqueSorted(
    recommendations.flatMap((freelancer) =>
      (freelancer.competences ?? [])
        .map((skill) => skill.nom)
        .filter(Boolean)
    )
  );
}

function getCityOptions(
  recommendations: FreelancerRecommendation[]
): string[] {
  return uniqueSorted(
    recommendations
      .map((freelancer) => freelancer.ville)
      .filter(
        (city): city is string =>
          Boolean(city && city.trim())
      )
  );
}

function getAvailabilityOptions(
  recommendations: FreelancerRecommendation[]
): string[] {
  return uniqueSorted(
    recommendations
      .map((freelancer) => freelancer.disponibilite)
      .filter(
        (availability): availability is string =>
          Boolean(availability && availability.trim())
      )
  );
}

function toUrl(link: string): string {
  const value = link.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CRITÈRE
// ─────────────────────────────────────────────────────────────────────────────

function CriteriaRow({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
}) {
  const filled = value !== "Non précisé";

  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon
        size={14}
        className="mt-0.5 shrink-0"
        style={{ color: "var(--gold)" }}
      />

      <div className="min-w-0 flex-1">
        <p
          className="text-[11px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          {label}
        </p>

        <p
          className={`text-sm font-medium ${
            !filled ? "italic" : ""
          }`}
          style={{
            color: filled
              ? "var(--navy)"
              : "var(--muted-foreground)",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRE
// ─────────────────────────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="appearance-none pl-3 pr-7 py-2 rounded-lg text-xs font-medium border outline-none cursor-pointer"
        style={{
          borderColor: "var(--border)",
          color: "var(--navy)",
          background: "var(--card)",
        }}
      >
        <option value="">{label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--muted-foreground)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

function InfoBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        borderColor: "var(--border)",
        background: "#FFFFFF",
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={13}
          style={{ color: "var(--gold)" }}
        />

        <span
          className="text-[10px] uppercase tracking-wide font-semibold"
          style={{
            color: "var(--muted-foreground)",
          }}
        >
          {label}
        </span>
      </div>

      <p
        className="text-xs font-bold mt-1"
        style={{ color: "var(--navy)" }}
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARTE FREELANCER
// ─────────────────────────────────────────────────────────────────────────────

function FreelancerResultCard({
  freelancer,
  saved,
  exactMatch,
  onToggleSave,
  onViewProfile,
}: {
  freelancer: FreelancerRecommendation;
  saved: boolean;
  exactMatch: boolean;
  onToggleSave: () => void;
  onViewProfile?: (id: number) => void;
}) {
  const f = freelancer;

  const availability = availabilityLabel(
    f.disponibilite
  );

  const allSkills = f.competences ?? [];
  const visibleSkills = allSkills.slice(0, 4);
  const extraSkills =
    allSkills.length - visibleSkills.length;

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden flex flex-col"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <div className="p-5 flex-1 flex flex-col gap-4 relative">
        {/* SCORE */}
        <div className="flex items-center justify-between">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: exactMatch
                ? "#FDF3E0"
                : "var(--secondary)",
              color: exactMatch
                ? "#B8860B"
                : "var(--muted-foreground)",
            }}
          >
            {exactMatch
              ? `${Math.round(f.scoreIA)}% Match`
              : `Proposition · ${Math.round(
                  f.scoreIA
                )}%`}
          </span>

          <button
            onClick={onToggleSave}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={
              saved
                ? "Retirer des favoris"
                : "Enregistrer ce profil"
            }
          >
            {saved ? (
              <BookmarkCheck
                size={16}
                style={{ color: "var(--gold)" }}
              />
            ) : (
              <Bookmark
                size={16}
                style={{
                  color: "var(--muted-foreground)",
                }}
              />
            )}
          </button>
        </div>

        {/* IDENTITÉ */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {f.photoUrl ? (
              <img
                src={f.photoUrl}
                alt={`${f.prenom} ${f.nom}`}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "var(--secondary)",
                  color: "var(--navy)",
                }}
              >
                {getInitials(
                  f.prenom,
                  f.nom
                )}
              </div>
            )}

            <span
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 border-white"
              title="Profil présent dans Free-Kaolo"
            >
              <CheckCircle2
                size={14}
                style={{
                  color: "var(--success)",
                }}
                fill="var(--success)"
                className="text-white"
              />
            </span>
          </div>

          <div className="min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ color: "var(--navy)" }}
            >
              {f.prenom} {f.nom}
            </p>

            <p
              className="text-xs font-medium truncate"
              style={{ color: "#B8860B" }}
            >
              {f.specialite ||
                "Professionnel indépendant"}
            </p>
          </div>
        </div>

        {/* LOCALISATION / DISPONIBILITÉ */}
        <div className="space-y-1">
          <p
            className="flex items-center gap-1.5 text-xs"
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            <MapPin size={12} />

            {f.ville || "Ville non renseignée"}

            {f.pays ? `, ${f.pays}` : ""}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: availability.color,
              }}
            />

            <span
              style={{
                color: availability.color,
              }}
            >
              {availability.text}
            </span>
          </p>
        </div>

        {/* COMPÉTENCES */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((skill, index) => (
            <span
              key={`${skill.nom}-${index}`}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{
                background: "var(--secondary)",
                color: "var(--navy)",
              }}
            >
              {skill.nom}

              {skill.score !== null &&
                skill.score !== undefined && (
                  <span className="ml-1 opacity-60">
                    {Math.round(skill.score)}
                  </span>
                )}
            </span>
          ))}

          {extraSkills > 0 && (
            <span
              className="px-2 py-0.5 rounded-md text-[11px] font-medium"
              style={{
                background: "var(--secondary)",
                color: "var(--muted-foreground)",
              }}
            >
              +{extraSkills}
            </span>
          )}
        </div>

        {/* INDICATEURS */}
        <div
          className="grid grid-cols-2 gap-2 text-xs"
          style={{
            color: "var(--muted-foreground)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Star
              size={12}
              fill="var(--gold)"
              style={{ color: "var(--gold)" }}
            />

            <span>
              {formatRating(f.noteMoyenne)}
            </span>

            <span>
              ({f.nombreAvis ?? 0})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Award size={12} />

            <span>
              Compétences{" "}
              {Math.round(
                f.scoreCompetences
              )}
              %
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} />

            <span>
              Profil{" "}
              {Math.round(
                f.completudeProfil
              )}
              %
            </span>
          </div>

          {f.tarifJournalier !== null &&
            f.tarifJournalier !== undefined && (
              <div className="flex items-center gap-1.5">
                <Wallet size={12} />

                <span>
                  {f.tarifJournalier.toLocaleString(
                    "fr-FR"
                  )}{" "}
                  FCFA/j
                </span>
              </div>
            )}
        </div>

        {/* EXPLICATION IA */}
        {f.explication && (
          <div
            className="rounded-xl p-3 text-[11px] leading-relaxed"
            style={{
              background: "#FEFCF6",
              color: "#6B5A2A",
            }}
          >
            <div className="flex items-start gap-2">
              <Sparkles
                size={13}
                className="mt-0.5 shrink-0"
                style={{
                  color: "var(--gold)",
                }}
              />

              <p>{f.explication}</p>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
          <p
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--navy)" }}
          >
            {formatPrice(
              f.tarifJournalier
            )}
          </p>

          <button
            onClick={() =>
              onViewProfile?.(f.id)
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide border transition-colors hover:bg-[var(--gold)] hover:text-white"
            style={{
              borderColor: "var(--gold)",
              color: "var(--gold)",
            }}
          >
            Voir le profil
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* CONFIANCE */}
      <div
        className="px-5 py-2.5 flex items-center gap-1.5 text-[11px] font-medium"
        style={{
          background: "#FEFCF6",
          color: "#B8860B",
        }}
      >
        <CheckCircle2 size={12} />

        {exactMatch
          ? "Recommandé selon les critères et les données du profil"
          : "Profil proche de votre demande, à vérifier"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PROFIL
// ─────────────────────────────────────────────────────────────────────────────

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h5
        className="text-[11px] font-bold uppercase tracking-wide mb-1.5"
        style={{ color: "var(--navy)" }}
      >
        {title}
      </h5>

      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL PROFIL
// ─────────────────────────────────────────────────────────────────────────────

function FreelancerProfileModal({
  profile,
  loading,
  error,
  onClose,
  onRetry,
  onOpenFullPage,
}: {
  profile: FreelancerProfil | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  onOpenFullPage?: () => void;
}) {
  const availability = availabilityLabel(
    profile?.disponibilite
  );

  const rating =
    profile?.noteMoyenne ??
    profile?.note;

  const links = profile
    ? [
        {
          label: "GitHub",
          value: profile.github,
        },
        {
          label: "LinkedIn",
          value: profile.linkedin,
        },
        {
          label: "Site web",
          value: profile.siteweb,
        },
      ].filter(
        (link) =>
          link.value &&
          link.value.trim()
      )
    : [];

  const hasContact =
    Boolean(
      profile?.email?.trim()
    ) ||
    Boolean(
      profile?.phone?.trim()
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15, 23, 42, .5)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Profil du freelance"
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border"
        style={{
          borderColor: "var(--border)",
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div
          className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b z-10"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--navy)" }}
            >
              Profil du freelance
            </p>

            <p
              className="text-[10px]"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Informations utiles pour votre décision
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <X
              size={16}
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            />
          </button>
        </div>

        <div className="p-5">
          {/* CHARGEMENT */}
          {loading && (
            <div className="py-16 text-center">
              <Loader2
                size={28}
                className="animate-spin mx-auto"
                style={{
                  color: "var(--gold)",
                }}
              />

              <p
                className="text-xs mt-3"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Chargement du profil...
              </p>
            </div>
          )}

          {/* ERREUR */}
          {!loading && error && (
            <div className="py-10 text-center">
              <AlertCircle
                size={26}
                className="mx-auto"
                style={{
                  color:
                    "var(--destructive)",
                }}
              />

              <p
                className="text-sm font-semibold mt-3"
                style={{
                  color:
                    "var(--destructive)",
                }}
              >
                Impossible de charger le profil
              </p>

              <p
                className="text-xs mt-1"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {error}
              </p>

              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  color: "var(--gold)",
                }}
              >
                <RefreshCw size={13} />
                Réessayer
              </button>
            </div>
          )}

          {/* PROFIL */}
          {!loading &&
            !error &&
            profile && (
              <div className="space-y-5">
                {/* IDENTITÉ */}
                <div className="flex items-start gap-4">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={`${profile.prenom} ${profile.nom}`}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{
                        background:
                          "var(--secondary)",
                        color:
                          "var(--navy)",
                      }}
                    >
                      {getInitials(
                        profile.prenom,
                        profile.nom
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-lg font-bold flex items-center gap-1.5"
                      style={{
                        color: "var(--navy)",
                      }}
                    >
                      {profile.prenom}{" "}
                      {profile.nom}

                      {profile.certifie && (
                        <ShieldCheck
                          size={17}
                          style={{
                            color:
                              "var(--success)",
                          }}
                          aria-label="Profil certifié"
                        />
                      )}
                    </p>

                    <p
                      className="text-sm font-semibold mt-0.5"
                      style={{
                        color: "#B8860B",
                      }}
                    >
                      {profile.specialite ||
                        "Professionnel indépendant"}
                    </p>

                    <p
                      className="flex items-center gap-1.5 text-xs mt-1"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      <MapPin size={12} />

                      {profile.ville ||
                        "Ville non renseignée"}

                      {profile.pays
                        ? `, ${profile.pays}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* ACTIONS DE CONTACT */}
                {hasContact && (
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor:
                        "rgba(184, 134, 11, .25)",
                      background:
                        "#FEFCF6",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle
                        size={15}
                        style={{
                          color:
                            "var(--gold)",
                        }}
                      />

                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{
                            color:
                              "var(--navy)",
                          }}
                        >
                          Contacter ce freelance
                        </p>

                        <p
                          className="text-[10px]"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          Prenez contact pour discuter du projet avant de confirmer votre choix.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profile.email &&
                        profile.email.trim() && (
                          <a
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                            style={{
                              background:
                                "var(--gold)",
                              color: "#FFFFFF",
                            }}
                          >
                            <Mail size={13} />
                            Envoyer un email
                          </a>
                        )}

                      {profile.phone &&
                        profile.phone.trim() && (
                          <a
                            href={`tel:${profile.phone}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hover:bg-white"
                            style={{
                              borderColor:
                                "var(--gold)",
                              color:
                                "var(--gold)",
                            }}
                          >
                            <Phone size={13} />
                            Appeler
                          </a>
                        )}
                    </div>
                  </div>
                )}

                {/* CHIFFRES CLÉS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <InfoBadge
                    icon={Star}
                    label="Note"
                    value={`${formatRating(
                      rating
                    )}/5`}
                  />

                  <InfoBadge
                    icon={Award}
                    label="Avis"
                    value={`${profile.nombreAvis ?? 0}`}
                  />

                  <InfoBadge
                    icon={UserCheck}
                    label="Profil"
                    value={`${Math.round(
                      profile.completionPourcentage ??
                        0
                    )}%`}
                  />

                  <InfoBadge
                    icon={Wallet}
                    label="Tarif"
                    value={
                      profile.tarifJournalier !==
                      null &&
                      profile.tarifJournalier !==
                        undefined
                        ? `${profile.tarifJournalier.toLocaleString(
                            "fr-FR"
                          )} FCFA/j`
                        : "Non renseigné"
                    }
                  />
                </div>

                {/* DISPONIBILITÉ / EXPÉRIENCE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <InfoBadge
                    icon={Clock}
                    label="Disponibilité"
                    value={availability.text}
                  />

                  <InfoBadge
                    icon={TrendingUp}
                    label="Expérience"
                    value={
                      profile.experience !==
                        undefined &&
                      String(
                        profile.experience
                      ).trim() !== ""
                        ? String(
                            profile.experience
                          )
                        : "Non renseignée"
                    }
                  />

                  <InfoBadge
                    icon={MapPin}
                    label="Localisation"
                    value={
                      [
                        profile.ville,
                        profile.pays,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                      "Non renseignée"
                    }
                  />
                </div>

                {/* À PROPOS */}
                {profile.description &&
                  profile.description.trim() && (
                    <ProfileSection title="À propos">
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "var(--secondary)",
                        }}
                      >
                        <p
                          className="text-xs leading-relaxed"
                          style={{
                            color:
                              "var(--foreground)",
                          }}
                        >
                          {profile.description}
                        </p>
                      </div>
                    </ProfileSection>
                  )}

                {/* COMPÉTENCES */}
                {profile.competence?.length >
                  0 && (
                  <ProfileSection title="Compétences">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.competence.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                            style={{
                              background:
                                "var(--secondary)",
                              color:
                                "var(--navy)",
                            }}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </ProfileSection>
                )}

                {/* LANGUES */}
                {profile.langues &&
                  profile.langues.trim() && (
                    <ProfileSection title="Langues">
                      <div
                        className="flex items-start gap-2 rounded-xl p-3"
                        style={{
                          background:
                            "var(--secondary)",
                        }}
                      >
                        <Globe
                          size={14}
                          className="mt-0.5"
                          style={{
                            color:
                              "var(--gold)",
                          }}
                        />

                        <p
                          className="text-xs leading-relaxed"
                          style={{
                            color:
                              "var(--foreground)",
                          }}
                        >
                          {profile.langues}
                        </p>
                      </div>
                    </ProfileSection>
                  )}

                {/* CONTACT */}
                {(profile.email ||
                  profile.phone) && (
                  <ProfileSection title="Coordonnées">
                    <div className="space-y-2">
                      {profile.email &&
                        profile.email.trim() && (
                          <div
                            className="flex items-center justify-between gap-3 rounded-xl border p-3"
                            style={{
                              borderColor:
                                "var(--border)",
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail
                                size={14}
                                className="shrink-0"
                                style={{
                                  color:
                                    "var(--gold)",
                                }}
                              />

                              <span
                                className="text-xs truncate"
                                style={{
                                  color:
                                    "var(--foreground)",
                                }}
                              >
                                {profile.email}
                              </span>
                            </div>

                            <a
                              href={`mailto:${profile.email}`}
                              className="text-[11px] font-bold shrink-0"
                              style={{
                                color:
                                  "var(--gold)",
                              }}
                            >
                              Écrire
                            </a>
                          </div>
                        )}

                      {profile.phone &&
                        profile.phone.trim() && (
                          <div
                            className="flex items-center justify-between gap-3 rounded-xl border p-3"
                            style={{
                              borderColor:
                                "var(--border)",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Phone
                                size={14}
                                style={{
                                  color:
                                    "var(--gold)",
                                }}
                              />

                              <span
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--foreground)",
                                }}
                              >
                                {profile.phone}
                              </span>
                            </div>

                            <a
                              href={`tel:${profile.phone}`}
                              className="text-[11px] font-bold"
                              style={{
                                color:
                                  "var(--gold)",
                              }}
                            >
                              Appeler
                            </a>
                          </div>
                        )}
                    </div>
                  </ProfileSection>
                )}

                {/* LIENS PROFESSIONNELS */}
                {links.length > 0 && (
                  <ProfileSection title="Présence professionnelle">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {links.map((link) => (
                        <a
                          key={link.label}
                          href={toUrl(
                            link.value as string
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-colors hover:bg-slate-50"
                          style={{
                            borderColor:
                              "var(--border)",
                            color:
                              "var(--navy)",
                          }}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-semibold">
                            <Globe
                              size={13}
                              style={{
                                color:
                                  "var(--gold)",
                              }}
                            />
                            {link.label}
                          </span>

                          <ExternalLink
                            size={12}
                            style={{
                              color:
                                "var(--muted-foreground)",
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </ProfileSection>
                )}

                {/* AVIS */}
                <ProfileSection title="Réputation">
                  <div
                    className="rounded-xl border p-4"
                    style={{
                      borderColor:
                        "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star
                          size={20}
                          fill="var(--gold)"
                          style={{
                            color:
                              "var(--gold)",
                          }}
                        />

                        <span
                          className="text-xl font-bold"
                          style={{
                            color:
                              "var(--navy)",
                          }}
                        >
                          {formatRating(rating)}
                        </span>

                        <span
                          className="text-xs"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          / 5
                        </span>
                      </div>

                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{
                            color:
                              "var(--navy)",
                          }}
                        >
                          {profile.nombreAvis ??
                            0}{" "}
                          avis
                        </p>

                        <p
                          className="text-[10px]"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          Évaluations issues des missions réalisées sur Free-Kaolo
                        </p>
                      </div>
                    </div>
                  </div>
                </ProfileSection>

                {/* COMPLÉTUDE */}
                <ProfileSection title="Complétude du profil">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{
                      background:
                        "var(--secondary)",
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            profile.completionPourcentage ??
                              0
                          )
                        )}%`,
                        background:
                          "var(--gold)",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p
                      className="text-[11px]"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    >
                      Profil complété à{" "}
                      {Math.round(
                        profile.completionPourcentage ??
                          0
                      )}
                      %
                    </p>
                  </div>
                </ProfileSection>

                {/* POURQUOI CE PROFIL */}
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    background:
                      "#FEFCF6",
                    borderColor:
                      "rgba(184, 134, 11, .2)",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{
                        color:
                          "var(--gold)",
                      }}
                    />

                    <div>
                      <p
                        className="text-xs font-bold"
                        style={{
                          color:
                            "var(--navy)",
                        }}
                      >
                        Éléments à vérifier avant de choisir
                      </p>

                      <ul
                        className="mt-2 space-y-1.5 text-[11px]"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                      >
                        <li>
                          • Vérifiez que les compétences correspondent aux exigences du projet.
                        </li>

                        <li>
                          • Consultez la note et le nombre d'avis pour évaluer la réputation.
                        </li>

                        <li>
                          • Vérifiez la disponibilité et l'expérience avant de commencer la mission.
                        </li>

                        <li>
                          • Utilisez GitHub, LinkedIn ou le site web pour approfondir son parcours.
                        </li>

                        <li>
                          • Contactez directement le freelance pour confirmer les modalités du projet.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {profile.email &&
                    profile.email.trim() && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                        style={{
                          background:
                            "var(--gold)",
                          color: "#FFFFFF",
                        }}
                      >
                        <Mail size={13} />
                        Contacter
                      </a>
                    )}

                  {profile.phone &&
                    profile.phone.trim() && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:bg-slate-50"
                        style={{
                          borderColor:
                            "var(--gold)",
                          color:
                            "var(--gold)",
                        }}
                      >
                        <Phone size={13} />
                        Appeler
                      </a>
                    )}

                  {onOpenFullPage && (
                    <button
                      onClick={onOpenFullPage}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-slate-50"
                      style={{
                        borderColor:
                          "var(--border)",
                        color:
                          "var(--navy)",
                      }}
                    >
                      Page complète
                      <ArrowRight size={12} />
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-slate-50"
                    style={{
                      borderColor:
                        "var(--border)",
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export function AIPageEnterprise({
  onViewProfile,
}: {
  onViewProfile?: (id: number) => void;
}) {
  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: 1,
        from: "assistant",
        text: "Décrivez le profil que vous recherchez. Je vais analyser votre besoin et rechercher les freelances les plus pertinents.",
        time: currentTime(),
      },
    ]);

  const [criteria, setCriteria] =
    useState<Criteria | null>(null);

  const [recommendations, setRecommendations] =
    useState<FreelancerRecommendation[]>([]);

  const [exactMatch, setExactMatch] =
    useState(true);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [savedIds, setSavedIds] =
    useState<Set<number>>(new Set());

  const [savedSearch, setSavedSearch] =
    useState(false);

  const [confirmed, setConfirmed] =
    useState(false);

  const [filters, setFilters] =
    useState<Filters>(EMPTY_FILTERS);

  const inputRef =
    useRef<HTMLTextAreaElement>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // PROFIL
  // ───────────────────────────────────────────────────────────────────────────

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [profile, setProfile] =
    useState<FreelancerProfil | null>(null);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const profileRequestRef =
    useRef(0);

  const openProfile = async (
    freelancerId: number
  ) => {
    const requestId =
      ++profileRequestRef.current;

    setSelectedId(freelancerId);
    setProfile(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const detail =
        await freelancerServices.getProfilByFreelancerId(
          freelancerId
        );

      if (
        requestId ===
        profileRequestRef.current
      ) {
        setProfile(detail);
      }
    } catch (err) {
      console.error(
        "Erreur chargement profil :",
        err
      );

      if (
        requestId ===
        profileRequestRef.current
      ) {
        setProfileError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement du profil."
        );
      }
    } finally {
      if (
        requestId ===
        profileRequestRef.current
      ) {
        setProfileLoading(false);
      }
    }
  };

  const closeProfile = () => {
    profileRequestRef.current++;

    setSelectedId(null);
    setProfile(null);
    setProfileError(null);
    setProfileLoading(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RECHERCHE IA
  // ───────────────────────────────────────────────────────────────────────────

  const submit = async () => {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "user",
        text,
        time: currentTime(),
      },
    ]);

    setInput("");
    setLoading(true);
    setError(null);
    setConfirmed(false);
    setFilters(EMPTY_FILTERS);

    try {
      const response =
        await aiService.idealProfile(text);

      const extras =
        response as typeof response &
          IdealProfileExtras;

      const list =
        response.recommendations ?? [];

      const count = list.length;

      setCriteria(
        response.criteria ?? null
      );

      setRecommendations(list);

      setExactMatch(
        extras.exactMatch ?? true
      );

      const assistantText =
        extras.content ||
        extras.summary ||
        (count === 0
          ? "Aucun freelance n'est disponible pour le moment. Vous pouvez modifier votre demande."
          : `J'ai analysé votre besoin et trouvé ${count} profil${
              count > 1 ? "s" : ""
            } correspondant${
              count > 1 ? "s" : ""
            }.`);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "assistant",
          text: assistantText,
          time: currentTime(),
        },
      ]);
    } catch (err) {
      console.error(
        "Erreur recherche IA :",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la recherche."
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "assistant",
          text: "Je n'ai pas pu terminer l'analyse de votre demande. Vérifiez la connexion au serveur puis réessayez.",
          time: currentTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const skillOptions = useMemo(
    () =>
      getSkillOptions(
        recommendations
      ),
    [recommendations]
  );

  const cityOptions = useMemo(
    () =>
      getCityOptions(
        recommendations
      ),
    [recommendations]
  );

  const availabilityOptions = useMemo(
    () =>
      getAvailabilityOptions(
        recommendations
      ),
    [recommendations]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // FILTRES
  // ───────────────────────────────────────────────────────────────────────────

  const results = useMemo(() => {
    let filtered = [
      ...recommendations,
    ];

    if (filters.competence) {
      const searched =
        filters.competence.toLowerCase();

      filtered = filtered.filter(
        (freelancer) =>
          (
            freelancer.competences ??
            []
          ).some((skill) =>
            skill.nom
              .toLowerCase()
              .includes(searched)
          )
      );
    }

    if (filters.localisation) {
      const searched =
        filters.localisation.toLowerCase();

      filtered = filtered.filter(
        (freelancer) =>
          freelancer.ville
            ?.toLowerCase() === searched
      );
    }

    if (filters.disponibilite) {
      const searched =
        filters.disponibilite.toLowerCase();

      filtered = filtered.filter(
        (freelancer) =>
          freelancer.disponibilite
            ?.toLowerCase()
            .includes(searched)
      );
    }

    if (filters.budget) {
      filtered = filtered.filter(
        (freelancer) => {
          const price =
            freelancer.tarifJournalier;

          if (
            price === null ||
            price === undefined
          ) {
            return false;
          }

          if (
            filters.budget ===
            "< 40 000 FCFA"
          ) {
            return price < 40000;
          }

          if (
            filters.budget ===
            "40 000 - 60 000 FCFA"
          ) {
            return (
              price >= 40000 &&
              price <= 60000
            );
          }

          if (
            filters.budget ===
            "60 000+ FCFA"
          ) {
            return price >= 60000;
          }

          return true;
        }
      );
    }

    switch (filters.sort) {
      case "priceAsc":
        filtered.sort(
          (a, b) =>
            (a.tarifJournalier ??
              Infinity) -
            (b.tarifJournalier ??
              Infinity)
        );
        break;

      case "priceDesc":
        filtered.sort(
          (a, b) =>
            (b.tarifJournalier ??
              -Infinity) -
            (a.tarifJournalier ??
              -Infinity)
        );
        break;

      case "rating":
        filtered.sort(
          (a, b) =>
            b.noteMoyenne -
            a.noteMoyenne
        );
        break;

      case "match":
      default:
        filtered.sort(
          (a, b) =>
            b.scoreIA -
            a.scoreIA
        );
        break;
    }

    return filtered;
  }, [
    recommendations,
    filters,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // FAVORIS
  // ───────────────────────────────────────────────────────────────────────────

  const toggleSave = (id: number) => {
    setSavedIds((previous) => {
      const next = new Set(
        previous
      );

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const filledCriteria =
    countCriteria(criteria);

  const setFilter = <
    K extends keyof Filters
  >(
    key: K,
    value: Filters[K]
  ) =>
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

  // ───────────────────────────────────────────────────────────────────────────
  // RENDU
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{
        background:
          "var(--background, #F8F7F4)",
      }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
        {/* COLONNE GAUCHE */}
        <div
          className="lg:w-[340px] lg:flex-shrink-0 lg:overflow-y-auto lg:min-h-0 border-b lg:border-b-0 lg:border-r p-4 lg:p-5 space-y-4"
          style={{
            borderColor:
              "var(--border)",
          }}
        >
          {/* ASSISTANT */}
          <div
            className="rounded-2xl border bg-white p-4"
            style={{
              borderColor:
                "var(--border)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "var(--gold)",
                }}
              >
                <Sparkles
                  size={14}
                  className="text-white"
                />
              </span>

              <div>
                <p
                  className="text-xs font-bold"
                  style={{
                    color:
                      "var(--navy)",
                  }}
                >
                  Assistant IA Free-Kaolo
                </p>

                <p
                  className="text-[11px]"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Analyse votre besoin et recherche les profils les plus pertinents.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto min-h-0">
              {messages.map(
                (message) =>
                  message.from ===
                  "user" ? (
                    <div
                      key={message.id}
                      className="flex justify-end"
                    >
                      <div
                        className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
                        style={{
                          background:
                            "var(--navy)",
                          color: "#FFF",
                          borderBottomRightRadius: 4,
                        }}
                      >
                        {message.text}

                        <div className="text-[10px] text-white/50 mt-1 text-right">
                          {message.time}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="flex justify-start"
                    >
                      <div
                        className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
                        style={{
                          background:
                            "var(--secondary)",
                          color:
                            "var(--foreground)",
                          borderBottomLeftRadius: 4,
                        }}
                      >
                        {message.text}

                        <div
                          className="text-[10px] mt-1"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          {message.time}
                        </div>
                      </div>
                    </div>
                  )
              )}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-3.5 py-2.5 rounded-xl"
                    style={{
                      background:
                        "var(--secondary)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Loader2
                        size={13}
                        className="animate-spin"
                        style={{
                          color:
                            "var(--gold)",
                        }}
                      />

                      <span
                        className="text-xs"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                      >
                        Analyse en cours...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CRITÈRES */}
          <div
            className="rounded-2xl border bg-white p-4"
            style={{
              borderColor:
                "var(--border)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles
                size={13}
                style={{
                  color:
                    "var(--gold)",
                }}
              />

              <h4
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color:
                    "var(--navy)",
                }}
              >
                Critères détectés
              </h4>
            </div>

            {criteria ? (
              <>
                <div
                  className="divide-y"
                  style={{
                    borderColor:
                      "var(--border)",
                  }}
                >
                  {CRITERIA_ROWS.map(
                    (row) => (
                      <CriteriaRow
                        key={row.key}
                        label={row.label}
                        icon={row.icon}
                        value={criteriaDisplay(
                          criteria,
                          row.key
                        )}
                      />
                    )
                  )}
                </div>

                <div
                  className="text-[10px] mt-2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {filledCriteria}{" "}
                  critère
                  {filledCriteria >
                  1
                    ? "s"
                    : ""}{" "}
                  détecté
                  {filledCriteria >
                  1
                    ? "s"
                    : ""}
                </div>
              </>
            ) : (
              <div
                className="py-6 text-center text-xs"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Décrivez votre besoin pour que l'IA puisse détecter les critères.
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  inputRef.current?.focus()
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-slate-50"
                style={{
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--navy)",
                }}
              >
                Modifier
              </button>

              <button
                onClick={() =>
                  setConfirmed(true)
                }
                disabled={!criteria}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background:
                    "var(--gold)",
                  color: "#FFF",
                }}
              >
                {confirmed && (
                  <CheckCircle2 size={12} />
                )}

                {confirmed
                  ? "Confirmé"
                  : "Confirmer"}
              </button>
            </div>
          </div>

          {/* SAISIE */}
          <div
            className="rounded-2xl border bg-white p-3"
            style={{
              borderColor:
                "var(--border)",
            }}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="Décrivez votre besoin en détail..."
                rows={3}
                disabled={loading}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs border outline-none resize-none focus:ring-2 disabled:opacity-60"
                style={{
                  borderColor:
                    "var(--border)",
                  background:
                    "var(--secondary)",
                  color:
                    "var(--foreground)",
                  maxHeight: "120px",
                }}
              />

              <button
                onClick={submit}
                disabled={
                  !input.trim() ||
                  loading
                }
                className="p-2.5 rounded-xl flex-shrink-0 transition-all disabled:cursor-not-allowed"
                style={{
                  background:
                    input.trim() &&
                    !loading
                      ? "var(--gold)"
                      : "var(--secondary)",
                  color:
                    input.trim() &&
                    !loading
                      ? "#FFF"
                      : "var(--muted-foreground)",
                }}
                aria-label="Envoyer"
              >
                {loading ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>

            <p
              className="text-[10px] mt-1.5"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Entrée pour envoyer • Maj + Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="flex-1 lg:overflow-y-auto lg:min-h-0 p-4 lg:p-6 space-y-5">
          {/* HEADER */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p
              className="flex items-center gap-2 text-sm font-semibold"
              style={{
                color:
                  "var(--navy)",
              }}
            >
              <Sparkles
                size={15}
                style={{
                  color:
                    "var(--gold)",
                }}
              />

              {recommendations.length}{" "}
              profil
              {recommendations.length >
              1
                ? "s"
                : ""}{" "}
              {exactMatch
                ? "recommandé"
                : "proposé"}
              {recommendations.length >
              1
                ? "s"
                : ""}
            </p>

            <button
              onClick={() =>
                setSavedSearch(
                  (value) => !value
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide border transition-colors hover:bg-[var(--gold)] hover:text-white"
              style={{
                borderColor:
                  "var(--gold)",
                color:
                  "var(--gold)",
              }}
            >
              {savedSearch ? (
                <BookmarkCheck
                  size={13}
                />
              ) : (
                <Bookmark size={13} />
              )}

              {savedSearch
                ? "Recherche enregistrée"
                : "Sauvegarder la recherche"}
            </button>
          </div>

          {/* PROPOSITIONS ALTERNATIVES */}
          {!loading &&
            !error &&
            recommendations.length >
              0 &&
            !exactMatch && (
              <div
                className="rounded-2xl border p-4 flex items-start gap-3"
                style={{
                  borderColor:
                    "rgba(217, 119, 6, .3)",
                  background:
                    "rgba(217, 119, 6, .05)",
                }}
              >
                <Info
                  size={18}
                  className="shrink-0"
                  style={{
                    color: "#D97706",
                  }}
                />

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#B45309",
                    }}
                  >
                    Profils proches de votre demande
                  </p>

                  <p
                    className="text-xs mt-1"
                    style={{
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    Aucun profil ne correspond parfaitement à tous les critères. Les profils affichés sont les alternatives les plus pertinentes.
                  </p>
                </div>
              </div>
            )}

          {/* ERREUR */}
          {error && (
            <div
              className="rounded-2xl border p-4 flex items-start gap-3"
              style={{
                borderColor:
                  "rgba(220, 38, 38, .25)",
                background:
                  "rgba(220, 38, 38, .04)",
              }}
            >
              <AlertCircle
                size={18}
                className="shrink-0"
                style={{
                  color:
                    "var(--destructive)",
                }}
              />

              <div className="flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      "var(--destructive)",
                  }}
                >
                  Impossible de récupérer les recommandations
                </p>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {error}
                </p>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  color:
                    "var(--destructive)",
                }}
              >
                <RefreshCw size={13} />
                Réessayer
              </button>
            </div>
          )}

          {/* FILTRES */}
          <div
            className="flex items-center gap-2 flex-wrap sticky top-0 z-10 py-1 -my-1"
            style={{
              background:
                "var(--background, #F8F7F4)",
            }}
          >
            <span
              className="flex items-center gap-1.5 text-xs font-semibold mr-1"
              style={{
                color:
                  "var(--navy)",
              }}
            >
              <Filter size={13} />
              Filtres
            </span>

            {skillOptions.length >
              0 && (
              <FilterSelect
                label="Compétences"
                value={
                  filters.competence
                }
                options={
                  skillOptions
                }
                onChange={(value) =>
                  setFilter(
                    "competence",
                    value
                  )
                }
              />
            )}

            {cityOptions.length >
              0 && (
              <FilterSelect
                label="Localisation"
                value={
                  filters.localisation
                }
                options={
                  cityOptions
                }
                onChange={(value) =>
                  setFilter(
                    "localisation",
                    value
                  )
                }
              />
            )}

            {availabilityOptions.length >
              0 && (
              <FilterSelect
                label="Disponibilité"
                value={
                  filters.disponibilite
                }
                options={
                  availabilityOptions
                }
                onChange={(value) =>
                  setFilter(
                    "disponibilite",
                    value
                  )
                }
              />
            )}

            <FilterSelect
              label="Budget"
              value={filters.budget}
              options={
                BUDGET_OPTIONS
              }
              onChange={(value) =>
                setFilter(
                  "budget",
                  value
                )
              }
            />

            <div className="ml-auto">
              <FilterSelect
                label="Meilleure correspondance"
                value={
                  filters.sort ===
                  "match"
                    ? ""
                    : SORT_LABELS[
                        filters.sort
                      ]
                }
                options={Object.values(
                  SORT_LABELS
                )}
                onChange={(value) => {
                  const entry =
                    Object.entries(
                      SORT_LABELS
                    ).find(
                      ([, label]) =>
                        label ===
                        value
                    );

                  setFilter(
                    "sort",
                    (entry?.[0] as SortOption) ??
                      "match"
                  );
                }}
              />
            </div>
          </div>

          {/* CHARGEMENT */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2
                  size={30}
                  className="animate-spin mx-auto"
                  style={{
                    color:
                      "var(--gold)",
                  }}
                />

                <p
                  className="text-sm font-semibold mt-3"
                  style={{
                    color:
                      "var(--navy)",
                  }}
                >
                  Analyse du besoin en cours
                </p>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Groq analyse votre demande puis Free-Kaolo calcule les correspondances à partir des données réelles de la plateforme.
                </p>
              </div>
            </div>
          )}

          {/* AUCUNE RECHERCHE */}
          {!loading &&
            recommendations.length ===
              0 &&
            !error && (
              <div
                className="rounded-2xl border bg-white p-10 text-center"
                style={{
                  borderColor:
                    "var(--border)",
                }}
              >
                <Sparkles
                  size={30}
                  className="mx-auto"
                  style={{
                    color:
                      "var(--gold)",
                  }}
                />

                <p
                  className="text-sm font-bold mt-3"
                  style={{
                    color:
                      "var(--navy)",
                  }}
                >
                  Décrivez le freelance que vous recherchez
                </p>

                <p
                  className="text-xs mt-1 max-w-md mx-auto"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Exemple : « Je cherche un développeur Java Spring Boot à Douala pour deux mois avec au moins deux ans d'expérience. »
                </p>
              </div>
            )}

          {/* RÉSULTATS */}
          {!loading &&
            results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map(
                  (freelancer) => (
                    <FreelancerResultCard
                      key={
                        freelancer.id
                      }
                      freelancer={
                        freelancer
                      }
                      saved={savedIds.has(
                        freelancer.id
                      )}
                      exactMatch={
                        exactMatch
                      }
                      onToggleSave={() =>
                        toggleSave(
                          freelancer.id
                        )
                      }
                      onViewProfile={
                        openProfile
                      }
                    />
                  )
                )}
              </div>
            )}

          {/* FILTRES SANS RÉSULTATS */}
          {!loading &&
            recommendations.length >
              0 &&
            results.length ===
              0 && (
              <div
                className="rounded-2xl border bg-white p-10 text-center"
                style={{
                  borderColor:
                    "var(--border)",
                }}
              >
                <Filter
                  size={28}
                  className="mx-auto"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                />

                <p
                  className="text-sm font-bold mt-3"
                  style={{
                    color:
                      "var(--navy)",
                  }}
                >
                  Aucun profil ne correspond aux filtres
                </p>

                <button
                  onClick={() =>
                    setFilters(
                      EMPTY_FILTERS
                    )
                  }
                  className="mt-3 text-xs font-semibold"
                  style={{
                    color:
                      "var(--gold)",
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

          {/* CONFIANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 pb-6">
            {[
              {
                icon: ShieldCheck,
                title: "Profils vérifiés",
                text: "Identité et compétences vérifiées par Free-Kaolo",
              },
              {
                icon: Lock,
                title: "Paiements sécurisés",
                text: "Vos paiements sont protégés jusqu'à la livraison",
              },
              {
                icon: FileText,
                title: "Données réelles",
                text: "Les recommandations utilisent les données de la plateforme",
              },
              {
                icon: Headphones,
                title: "Support dédié",
                text: "Notre équipe vous accompagne à chaque étape",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-white p-4 flex items-start gap-3"
                style={{
                  borderColor:
                    "var(--border)",
                }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "var(--secondary)",
                    color:
                      "var(--gold)",
                  }}
                >
                  <item.icon size={16} />
                </span>

                <div>
                  <p
                    className="text-xs font-bold"
                    style={{
                      color:
                        "var(--navy)",
                    }}
                  >
                    {item.title}
                  </p>

                  <p
                    className="text-[11px] mt-0.5"
                    style={{
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL PROFIL */}
      {selectedId !== null && (
        <FreelancerProfileModal
          profile={profile}
          loading={profileLoading}
          error={profileError}
          onClose={closeProfile}
          onRetry={() =>
            openProfile(selectedId)
          }
          onOpenFullPage={
            onViewProfile
              ? () => {
                  const id =
                    selectedId;

                  closeProfile();

                  onViewProfile(id);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}