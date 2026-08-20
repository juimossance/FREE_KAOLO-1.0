import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { freelancerService, FreelancerProfil } from "../../../services/freelancerservices";
import {
  Star, MapPin, Briefcase, Edit3, ExternalLink, Award, Globe,
  Github, Linkedin, CheckCircle, Download, ShieldCheck, Clock,
  Code2, LayoutDashboard, Smartphone, TrendingUp
} from "lucide-react";

const staticReviews = [
  {
    name: "TechCorp CI",
    avatar: "TC",
    rating: 5,
    text: "Excellent travail, livraison avant les délais.",
    date: "Mai 2026",
    project: "Refonte plateforme e-commerce"
  },
];

const staticCertifications = [
  { name: "AWS Cloud Practitioner", org: "Amazon", year: "2025" },
];

const staticStats = [
  { label: "Projets réalisés", value: "23" },
  { label: "Clients satisfaits", value: "19" },
  { label: "Taux de succès", value: "96%" },
  { label: "Livraisons à temps", value: "100%" },
];

const staticPortfolio = [
  { title: "E-commerce Platform", tech: "React · Next.js", icon: Code2 },
  { title: "Banking Dashboard", tech: "Vue.js · D3.js", icon: LayoutDashboard },
  { title: "Mobile App CI", tech: "React Native", icon: Smartphone },
];

const staticTrustSignals = [
  { icon: ShieldCheck, label: "Identité vérifiée" },
  { icon: Clock, label: "Répond en moins de 2h" },
];

export function FreelancerProfile() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [profil, setProfil] = useState<FreelancerProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("Utilisateur non identifié");
      return;
    }

    const chargerProfil = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await freelancerService.getProfil(userId);
        setProfil(data);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    chargerProfil();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!profil) return null;

  const {
    prenom,
    nom,
    specialite,
    ville,
    pays,
    experience,
    tarifJournalier,
    disponibilite,
    description,
    competence,
    github,
    linkedin,
    siteweb,
    photoUrl,
    langues,
    completionPourcentage
  } = profil;

  const avatarLetters = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase();
  const avatarContent = photoUrl ? (
    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
  ) : (
    avatarLetters || "?"
  );

  const bioText = description || "";
  const skillList = Array.isArray(competence) ? competence : [];
  const languageList = langues ? langues.split(",").map((l) => l.trim()) : [];

  const completion = completionPourcentage ?? 0;
  const ringStyle = {
    background: `conic-gradient(var(--gold) ${completion * 3.6}deg, var(--border) 0deg)`
  };

  const githubHref = github ? (github.startsWith("http") ? github : `https://${github}`) : "";
  const linkedinHref = linkedin ? (linkedin.startsWith("http") ? linkedin : `https://${linkedin}`) : "";
  const sitewebHref = siteweb ? (siteweb.startsWith("http") ? siteweb : `https://${siteweb}`) : "";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div
          className="h-28 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, #334155 100%)" }}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="diamondPattern" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamondPattern)" />
          </svg>

          <Link
            to="/freelancer/edit-profile"
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <Edit3 size={13} /> Modifier
          </Link>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="relative w-24 h-24 rounded-2xl p-[3px] flex-shrink-0" style={ringStyle}>
              <div
                className="w-full h-full rounded-2xl border-4 border-white flex items-center justify-center text-2xl font-bold overflow-hidden"
                style={{ background: "var(--gold)", color: "var(--navy)" }}
              >
                {avatarContent}
              </div>
              {completion >= 80 && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ background: "#166534" }}
                  aria-label="Profil certifié"
                >
                  <CheckCircle size={13} className="text-white" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
                {prenom} {nom}
              </h2>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {specialite || "Spécialité non renseignée"}
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              {githubHref && (
                <a
                  href={githubHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="GitHub"
                >
                  <Github size={16} className="text-slate-600" />
                </a>
              )}
              {linkedinHref && (
                <a
                  href={linkedinHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={16} className="text-slate-600" />
                </a>
              )}
              {sitewebHref && (
                <a
                  href={sitewebHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  aria-label="Site web"
                >
                  <Globe size={16} className="text-slate-600" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            {staticTrustSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div key={signal.label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#166534" }}>
                  <Icon size={14} />
                  {signal.label}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            {ville && pays && (
              <div className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                <MapPin size={14} /> {ville}, {pays}
              </div>
            )}
            {experience && (
              <div className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                <Briefcase size={14} /> {experience} ans d'expérience
              </div>
            )}
            {tarifJournalier && (
              <div className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--navy)" }}>
                {tarifJournalier.toLocaleString()} FCFA/jour
              </div>
            )}
            {disponibilite && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "#DCFCE7", color: "#166534" }}
              >
                {disponibilite}
              </span>
            )}
          </div>

          {bioText && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              {bioText}
            </p>
          )}

          <div className="mt-4 flex gap-3 flex-wrap">
            <Link
              to="/messages"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              Envoyer un message
            </Link>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: "var(--navy)" }}
            >
              <Download size={15} /> Télécharger CV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          {skillList.length > 0 && (
            <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-3" style={{ color: "var(--navy)" }}>Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languageList.length > 0 && (
            <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-3" style={{ color: "var(--navy)" }}>Langues</h3>
              <div className="space-y-2">
                {languageList.map((lang) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--navy)" }}>{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--navy)" }}>
                <Award size={16} style={{ color: "var(--gold)" }} /> Certifications
              </h3>
              <Link to="/freelancer/certifications" className="text-xs" style={{ color: "var(--gold)" }}>
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {staticCertifications.map((cert) => (
                <div key={cert.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--secondary)" }}
                  >
                    <Award size={14} style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--navy)" }}>{cert.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{cert.org} · {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--navy)" }}>
              <TrendingUp size={16} style={{ color: "var(--gold)" }} /> Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {staticStats.map((s) => (
                <div
                  key={s.label}
                  className="p-3 rounded-xl text-center"
                  style={{ background: "var(--secondary)" }}
                >
                  <p className="text-xl font-bold" style={{ color: "var(--navy)" }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Portfolio récent</h3>
              <Link
                to="/freelancer/portfolio"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--gold)" }}
              >
                Voir tout <ExternalLink size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {staticPortfolio.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="rounded-xl overflow-hidden border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div
                      className="h-24 flex items-center justify-center"
                      style={{ background: "var(--secondary)" }}
                    >
                      <Icon size={28} style={{ color: "var(--navy)" }} />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold" style={{ color: "var(--navy)" }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{p.tech}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Avis clients</h3>
              <Link to="/freelancer/ratings" className="text-xs font-medium" style={{ color: "var(--gold)" }}>
                Voir tout (28)
              </Link>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{ background: "var(--secondary)" }}>
              <div className="text-center">
                <p className="text-4xl font-bold" style={{ color: "var(--navy)" }}>4.9</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>28 avis</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs w-4" style={{ color: "var(--muted-foreground)" }}>{stars}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: "var(--gold)",
                          width: stars === 5 ? "82%" : stars === 4 ? "14%" : stars === 3 ? "4%" : "0%"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {staticReviews.map((r) => (
                <div key={r.name} className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--secondary)", color: "var(--navy)" }}
                    >
                      {r.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{r.name}</p>
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{r.date}</span>
                      </div>
                      <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{r.project}</p>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                        ))}
                      </div>
                      <p className="text-sm" style={{ color: "var(--foreground)" }}>{r.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}