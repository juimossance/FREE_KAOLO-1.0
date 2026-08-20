import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  Globe,
  Github,
  Linkedin,
  MessageSquare,
  CheckCircle2,
  User,
  Star,
  Award,
  ExternalLink,
  WalletCards,
  Clock3,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  freelancerService,
  type FreelancerProfil,
} from "../../../services/freelancerservices";

export function EnterpriseFreelancerProfile() {
  const { freelancerId } = useParams<{ freelancerId: string }>();

  const [profil, setProfil] = useState<FreelancerProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!freelancerId) {
      setError("Freelancer introuvable");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await freelancerService.getProfilByFreelancerId(
            Number(freelancerId)
          );

        setProfil(data);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError("Impossible de charger le profil du freelancer.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [freelancerId]);

  const skills = useMemo(
    () => (Array.isArray(profil?.competence) ? profil.competence : []),
    [profil]
  );

  const languages = useMemo(
    () =>
      profil?.langues
        ? profil.langues
            .split(",")
            .map((language) => language.trim())
            .filter(Boolean)
        : [],
    [profil]
  );

  if (loading) {
    return (
      <div className="space-y-5 p-4 sm:p-6 animate-pulse">
        <div className="h-5 w-40 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="lg:col-span-2 space-y-5">
            <div className="h-48 rounded-2xl bg-slate-100" />
            <div className="h-64 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profil) {
    return (
      <div className="p-6 sm:p-10">
        <div
          className="max-w-xl mx-auto rounded-2xl border p-6 text-center"
          style={{
            background: "#FEF2F2",
            borderColor: "#FECACA",
          }}
        >
          <div
            className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              background: "#FEE2E2",
              color: "#B91C1C",
            }}
          >
            <User size={21} />
          </div>

          <h2
            className="mt-4 font-semibold"
            style={{ color: "#991B1B" }}
          >
            Profil indisponible
          </h2>

          <p
            className="text-sm mt-1"
            style={{ color: "#B91C1C" }}
          >
            {error || "Le profil demandé n'existe pas."}
          </p>

          <Link
            to="/enterprise/applications"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "var(--navy)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft size={14} />
            Retour aux candidatures
          </Link>
        </div>
      </div>
    );
  }

  const initials =
    `${profil.prenom?.[0] ?? ""}${profil.nom?.[0] ?? ""}`.toUpperCase();

  const safeUrl = (url?: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const isAvailable =
    profil.disponibilite?.toLowerCase().includes("disponible");

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <div className="flex items-center justify-between gap-6">
        <Link
          to="/enterprise/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--navy)" }}
        >
          <ArrowLeft size={16} />
          Retour aux candidatures
        </Link>

        <div
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{
            background: "#F8FAFC",
            borderColor: "var(--border)",
          }}
        >
          <ShieldCheck
            size={14}
            style={{ color: "#047857" }}
          />

          <span
            className="text-xs font-semibold"
            style={{ color: "#166534" }}
          >
            Profil professionnel
          </span>
        </div>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}
      {/* =====================================================
    PROFILE HERO — TRUST FIRST
===================================================== */}
<section
  className="rounded-xl border bg-white overflow-hidden"
  style={{ borderColor: "var(--border)" }}
>
  {/* Cover */}
  <div
    className="h-36 sm:h-36 relative"
     style={{
        background: "rgba(6, 3, 3, 0.08)",
        borderColor: "rgba(255,255,255,0.15)",
      }}
  >
    {/* Accent visuel */}
    <div
      className="absolute right-[-40px] top-[-80px] w-64 h-64 rounded-full opacity-20"
      style={{
        background:
          "radial-gradient(circle, var(--gold) 0%, transparent 65%)",
      }}
    />

    <div
      className="absolute bottom-4 left-5 sm:left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm"
      style={{
        background: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.15)",
      }}
    >
      <ShieldCheck size={14} className="text-emerald-300" />

      <span className="text-xs font-medium text-white">
        Profil candidat
      </span>
    </div>
  </div>

  {/* Identity area */}
  <div className="px-4 sm:px-6 pb-6">
    <div className="flex flex-col xl:flex-row xl:items-end gap-5 -mt-12">

      {/* Avatar */}
      <div
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden flex items-center justify-center flex-shrink-0 text-2xl font-bold shadow-sm"
        style={{
          background: "var(--gold)",
          color: "var(--navy)",
        }}
      >
        {profil.photoUrl ? (
          <img
            src={profil.photoUrl}
            alt={`${profil.prenom} ${profil.nom}`}
            className="w-full h-full object-cover"
          />
        ) : (
          initials || <User size={32} />
        )}

        {/* Indicateur disponibilité */}
        {isAvailable && (
          <span
            className="absolute right-1.5 bottom-1.5 w-4 h-4 rounded-full border-2 border-white"
            style={{ background: "#10B981" }}
            title="Disponible"
          />
        )}
      </div>

      {/* Identité */}
      <div className="flex-1 min-w-0 xl:pb-1">

        <div className="flex flex-wrap items-center gap-2">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--navy)" }}
          >
            {profil.prenom} {profil.nom}
          </h1>

          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: "#ECFDF5",
              color: "#047857",
              border: "1px solid #A7F3D0",
            }}
          >
            <CheckCircle2 size={12} />
            Vérifié
          </span>
        </div>

        <p
          className="text-sm mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          {profil.specialite || "Spécialité non renseignée"}
        </p>

        {/* Informations essentielles */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">

          {profil.ville && profil.pays && (
            <span
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <MapPin size={13} />
              {profil.ville}, {profil.pays}
            </span>
          )}

          {profil.experience && (
            <span
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <BriefcaseBusiness size={13} />
              {profil.experience} ans d'expérience
            </span>
          )}

          {typeof profil.tarifJournalier === "number" && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "var(--navy)" }}
            >
              <WalletCards
                size={13}
                style={{ color: "var(--gold)" }}
              />

              {profil.tarifJournalier.toLocaleString("fr-FR")} FCFA/j
            </span>
          )}
        </div>
      </div>

      {/* Actions recrutement */}
      <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">

        <Link
          to={`/messages?freelancer=${profil.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            background: "var(--navy)",
            color: "#FFFFFF",
          }}
        >
          <MessageSquare size={15} />
          Contacter
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-50"
          style={{
            borderColor: "var(--border)",
            color: "var(--navy)",
            background: "#FFFFFF",
          }}
        >
          <UserCheck size={15} />
          Sélectionner
        </button>
      </div>
    </div>

    {/* Trust strip */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">

      {/* Disponibilité */}
      <div
        className="rounded-xl border px-4 py-3"
        style={{
          background: "#F8FAFC",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: isAvailable ? "#ECFDF5" : "#F1F5F9",
              color: isAvailable ? "#047857" : "#64748B",
            }}
          >
            <Clock3 size={15} />
          </div>

          <div>
            <p
              className="text-[11px] font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Disponibilité
            </p>

            <p
              className="text-sm font-semibold"
              style={{
                color: isAvailable
                  ? "#047857"
                  : "var(--navy)",
              }}
            >
              {profil.disponibilite || "Non précisée"}
            </p>
          </div>
        </div>
      </div>

      {/* Réputation */}
      <div
        className="rounded-xl border px-4 py-3"
        style={{
          background: "#F8FAFC",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "#FFF8E6",
              color: "var(--gold)",
            }}
          >
            <Star
              size={15}
              fill="currentColor"
            />
          </div>

          <div>
            <p
              className="text-[11px] font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Réputation
            </p>

            <p
              className="text-sm font-semibold"
              style={{ color: "var(--navy)" }}
            >
              
              <span
                className="text-xs font-normal ml-1"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Profil */}
      <div
        className="rounded-xl border px-4 py-3"
        style={{
          background: "#F8FAFC",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "#ECFDF5",
              color: "#047857",
            }}
          >
            <ShieldCheck size={15} />
          </div>

          <div>
            <p
              className="text-[11px] font-medium"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              Confiance
            </p>

            <p
              className="text-sm font-semibold"
              style={{ color: "#047857" }}
            >
              Profil vérifié
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ===================================================
            LEFT
        =================================================== */}
        <aside className="space-y-5">
          {/* Reputation */}
          <section
            className="rounded-2xl border bg-white p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Réputation
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Star
                    size={18}
                    fill="currentColor"
                    style={{ color: "var(--gold)" }}
                  />

                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--navy)" }}
                  >
                   
                  </span>

                  <span
                    className="text-xs"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    /5
                  </span>
                </div>
              </div>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "#FFF8E6",
                  color: "var(--gold)",
                }}
              >
                <Award size={18} />
              </div>
            </div>

            <p
              className="text-xs mt-2"
              style={{
                color: "var(--muted-foreground)",
              }}
            >
              avis clients
            </p>
          </section>

          {/* Skills */}
          <section
            className="rounded-2xl border bg-white p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Compétences
              </h2>

              <span
                className="text-xs"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                {skills.length}
              </span>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--navy)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p
                className="text-sm"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                Aucune compétence renseignée.
              </p>
            )}
          </section>

          {/* Languages */}
          {languages.length > 0 && (
            <section
              className="rounded-2xl border bg-white p-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="font-semibold mb-4"
                style={{ color: "var(--navy)" }}
              >
                Langues
              </h2>

              <div className="space-y-2.5">
                {languages.map((language) => (
                  <div
                    key={language}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{
                      background: "#F8FAFC",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--navy)" }}
                    >
                      {language}
                    </span>

                    <Globe
                      size={14}
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Professional links */}
          {(profil.github ||
            profil.linkedin ||
            profil.siteweb) && (
            <section
              className="rounded-2xl border bg-white p-5"
              style={{ borderColor: "var(--border)" }}
            >
              <h2
                className="font-semibold mb-4"
                style={{ color: "var(--navy)" }}
              >
                Présence professionnelle
              </h2>

              <div className="space-y-2">
                {profil.github && (
                  <a
                    href={safeUrl(profil.github)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Github size={15} />
                      GitHub
                    </span>
                    <ExternalLink size={13} />
                  </a>
                )}

                {profil.linkedin && (
                  <a
                    href={safeUrl(profil.linkedin)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Linkedin size={15} />
                      LinkedIn
                    </span>
                    <ExternalLink size={13} />
                  </a>
                )}

                {profil.siteweb && (
                  <a
                    href={safeUrl(profil.siteweb)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Globe size={15} />
                      Site web
                    </span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </section>
          )}
        </aside>

        {/* ===================================================
            RIGHT
        =================================================== */}
        <main className="lg:col-span-2 space-y-5">
          {/* About */}
          <section
            className="rounded-2xl border bg-white p-5 sm:p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "#F1F5F9",
                  color: "var(--navy)",
                }}
              >
                <User size={17} />
              </div>

              <div>
                <h2
                  className="font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  À propos du candidat
                </h2>

                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  Présentation professionnelle
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-7"
              style={{ color: "var(--foreground)" }}
            >
              {profil.description ||
                "Aucune description professionnelle disponible pour le moment."}
            </p>
          </section>

          {/* Key metrics */}
          <section
            className="rounded-2xl border bg-white p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <h2
              className="font-semibold mb-4"
              style={{ color: "var(--navy)" }}
            >
              Informations clés
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness
                    size={15}
                    style={{ color: "var(--navy)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Expérience
                  </span>
                </div>

                <p
                  className="text-lg font-bold mt-2"
                  style={{ color: "var(--navy)" }}
                >
                  {profil.experience || "—"}
                </p>

                <p
                  className="text-[11px]"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  années
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >
                <div className="flex items-center gap-2">
                  <WalletCards
                    size={15}
                    style={{ color: "var(--gold)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Tarif journalier
                  </span>
                </div>

                <p
                  className="text-lg font-bold mt-2"
                  style={{ color: "var(--navy)" }}
                >
                  {typeof profil.tarifJournalier === "number"
                    ? profil.tarifJournalier.toLocaleString("fr-FR")
                    : "—"}
                </p>

                <p
                  className="text-[11px]"
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                >
                  FCFA / jour
                </p>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: "#F8FAFC" }}
              >
                <div className="flex items-center gap-2">
                  <Clock3
                    size={15}
                    style={{ color: "#047857" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Disponibilité
                  </span>
                </div>

                <p
                  className="text-sm font-bold mt-3"
                  style={{
                    color: isAvailable
                      ? "#047857"
                      : "var(--navy)",
                  }}
                >
                  {profil.disponibilite || "Non précisée"}
                </p>
              </div>
            </div>
          </section>

          {/* Trust decision */}
          <section
            className="rounded-2xl border p-5"
            style={{
              background: "#F0FDF4",
              borderColor: "#BBF7D0",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#DCFCE7",
                  color: "#15803D",
                }}
              >
                <ShieldCheck size={17} />
              </div>

              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "#166534" }}
                >
                  Évaluation orientée confiance
                </h3>

                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "#15803D" }}
                >
                  Consultez les compétences, l'expérience, la
                  réputation et les références professionnelles
                  avant de prendre une décision de recrutement.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}