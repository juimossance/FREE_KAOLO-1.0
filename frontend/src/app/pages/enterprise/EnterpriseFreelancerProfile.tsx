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
  User,
  Star,
  Award,
  ExternalLink,
  WalletCards,
  Clock3,
  ShieldCheck,
  UserCheck,
  FileText,
  Eye,
  Download,
  Loader2,
  GraduationCap,
  Languages,
  Code2,
  FolderOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";

import {
  freelancerServices,
  type FreelancerProfil,
} from "../../../services/freelancerservices";

import cvService from "../../../services/cvService";

import {
  certificationService,
  type CertificationItem,
} from "../../../services/certificationservice";

import { portfolioService } from "../../../services/portfolioService";

import {
  avisService,
  type Avis,
} from "../../../services/avisService";

import { CertifiedBadge } from "../../components/CertifiedBadge";

const API_ORIGIN = "http://localhost:8080";

/* =========================================================
   UTILITAIRES
========================================================= */

function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_ORIGIN}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${API_ORIGIN}/${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_ORIGIN}${value}`;
  }

  return `${API_ORIGIN}/uploads/${value}`;
}

function safeExternalUrl(url?: string | null): string {
  if (!url) return "#";

  const value = url.trim();

  if (!value) return "#";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `https://${value}`;
}

function formatDate(date?: string | null): string {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function formatNumber(value?: number | null): string {
  if (value === null || value === undefined) return "0";

  return new Intl.NumberFormat("fr-FR").format(value);
}

function normalizeStatus(status?: string | null): string {
  return String(status ?? "").trim().toUpperCase();
}

/* =========================================================
   TYPES FLEXIBLES POUR LE PORTFOLIO
========================================================= */

interface PortfolioItem {
  id?: number | string;
  titre?: string;
  title?: string;
  nom?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  url?: string;
  lien?: string;
  technologies?: string[] | string;
  technologie?: string[] | string;
  tech?: string[] | string;
  createdAt?: string;
  dateCreation?: string;
}

/* =========================================================
   COMPOSANTS UI
========================================================= */

function SectionCard({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            {icon}
          </div>

          <h2 className="text-base font-bold text-slate-900">
            {title}
          </h2>
        </div>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export function EnterpriseFreelancerProfile() {
  const { freelancerId } = useParams<{ freelancerId: string }>();

  const numericFreelancerId = Number(freelancerId);

  /* -------------------------------------------------------
     PROFIL
  ------------------------------------------------------- */

  const [profil, setProfil] = useState<FreelancerProfil | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------
     CV
  ------------------------------------------------------- */

  const [cvUrl, setCvUrl] = useState<string | null>(null);

  const [cvLoading, setCvLoading] = useState(true);

  /* -------------------------------------------------------
     CERTIFICATIONS
  ------------------------------------------------------- */

  const [certifications, setCertifications] = useState<
    CertificationItem[]
  >([]);

  const [certificationsLoading, setCertificationsLoading] =
    useState(true);

  /* -------------------------------------------------------
     PORTFOLIO
  ------------------------------------------------------- */

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  const [portfolioLoading, setPortfolioLoading] = useState(true);

  /* -------------------------------------------------------
     AVIS
  ------------------------------------------------------- */

  const [avis, setAvis] = useState<Avis[]>([]);

  const [avisLoading, setAvisLoading] = useState(true);

  /* =======================================================
     CHARGEMENT DU PROFIL
  ======================================================= */

  useEffect(() => {
    if (
      !freelancerId ||
      Number.isNaN(numericFreelancerId) ||
      numericFreelancerId <= 0
    ) {
      setError("Freelancer introuvable.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await freelancerServices.getProfilByFreelancerId(
            numericFreelancerId
          );

        if (!cancelled) {
          setProfil(data);
        }
      } catch (err) {
        console.error(
          "Erreur chargement profil freelancer :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger le profil du freelancer."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [freelancerId, numericFreelancerId]);

  /* =======================================================
     CHARGEMENT CV
  ======================================================= */

  useEffect(() => {
    if (
      !freelancerId ||
      Number.isNaN(numericFreelancerId) ||
      numericFreelancerId <= 0
    ) {
      return;
    }

    let cancelled = false;
    let generatedUrl: string | null = null;

    const fetchCv = async () => {
      try {
        setCvLoading(true);

        const blob = await cvService.getCv(
          numericFreelancerId
        );

        if (cancelled) return;

        generatedUrl = URL.createObjectURL(blob);

        setCvUrl(generatedUrl);
      } catch (err) {
        console.info(
          "Aucun CV disponible pour ce freelancer.",
          err
        );

        if (!cancelled) {
          setCvUrl(null);
        }
      } finally {
        if (!cancelled) {
          setCvLoading(false);
        }
      }
    };

    fetchCv();

    return () => {
      cancelled = true;

      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }

      setCvUrl(null);
    };
  }, [freelancerId, numericFreelancerId]);

  /* =======================================================
     CHARGEMENT CERTIFICATIONS
  ======================================================= */

  useEffect(() => {
    if (
      !freelancerId ||
      Number.isNaN(numericFreelancerId) ||
      numericFreelancerId <= 0
    ) {
      return;
    }

    let cancelled = false;

    const loadCertifications = async () => {
      try {
        setCertificationsLoading(true);

        const data =
          await certificationService.getAll(
            numericFreelancerId
          );

        if (!cancelled) {
          setCertifications(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "Erreur chargement certifications :",
          err
        );

        if (!cancelled) {
          setCertifications([]);
        }
      } finally {
        if (!cancelled) {
          setCertificationsLoading(false);
        }
      }
    };

    loadCertifications();

    return () => {
      cancelled = true;
    };
  }, [freelancerId, numericFreelancerId]);

  /* =======================================================
     CHARGEMENT PORTFOLIO
  ======================================================= */

  useEffect(() => {
    if (
      !freelancerId ||
      Number.isNaN(numericFreelancerId) ||
      numericFreelancerId <= 0
    ) {
      return;
    }

    let cancelled = false;

    const loadPortfolio = async () => {
      try {
        setPortfolioLoading(true);

        const data =
          await portfolioService.getAll(
            numericFreelancerId
          );

        if (cancelled) return;

        /*
         * On tolère plusieurs formes de réponses :
         * - tableau directement
         * - { data: [...] }
         * - { content: [...] }
         * - { items: [...] }
         */

        let items: unknown = data;

        if (
          items &&
          typeof items === "object" &&
          !Array.isArray(items)
        ) {
          const objectData = items as Record<string, unknown>;

          items =
            objectData.data ??
            objectData.content ??
            objectData.items ??
            [];
        }

        if (Array.isArray(items)) {
          setPortfolio(items as PortfolioItem[]);
        } else {
          setPortfolio([]);
        }
      } catch (err) {
        console.error(
          "Erreur chargement portfolio :",
          err
        );

        if (!cancelled) {
          setPortfolio([]);
        }
      } finally {
        if (!cancelled) {
          setPortfolioLoading(false);
        }
      }
    };

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, [freelancerId, numericFreelancerId]);

  /* =======================================================
     CHARGEMENT AVIS
  ======================================================= */

  useEffect(() => {
    if (
      !freelancerId ||
      Number.isNaN(numericFreelancerId) ||
      numericFreelancerId <= 0
    ) {
      return;
    }

    let cancelled = false;

    const loadAvis = async () => {
      try {
        setAvisLoading(true);

        const data =
          await avisService.getAvis(
            numericFreelancerId
          );

        if (!cancelled) {
          setAvis(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(
          "Erreur chargement avis :",
          err
        );

        if (!cancelled) {
          setAvis([]);
        }
      } finally {
        if (!cancelled) {
          setAvisLoading(false);
        }
      }
    };

    loadAvis();

    return () => {
      cancelled = true;
    };
  }, [freelancerId, numericFreelancerId]);

  /* =======================================================
     COMPÉTENCES
  ======================================================= */

  const skills = useMemo(
    () =>
      Array.isArray(profil?.competence)
        ? profil.competence
        : [],
    [profil]
  );

  /* =======================================================
     LANGUES
  ======================================================= */

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

  /* =======================================================
     CERTIFICATIONS / DIPLÔMES
  ======================================================= */

  const validatedCredentials = useMemo(
    () =>
      certifications.filter(
        (credential) =>
          normalizeStatus(credential.status) ===
          "VALIDEE"
      ),
    [certifications]
  );

  const pendingCredentials = useMemo(
    () =>
      certifications.filter(
        (credential) =>
          normalizeStatus(credential.status) ===
          "EN_ATTENTE"
      ),
    [certifications]
  );

  const rejectedCredentials = useMemo(
    () =>
      certifications.filter(
        (credential) =>
          normalizeStatus(credential.status) ===
          "REJETEE"
      ),
    [certifications]
  );

  const certificationsList = useMemo(
    () =>
      certifications.filter(
        (credential) =>
          (credential.type ?? "CERTIFICATION") ===
            "CERTIFICATION" &&
          normalizeStatus(credential.status) !==
            "REJETEE"
      ),
    [certifications]
  );

  const diplomasList = useMemo(
    () =>
      certifications.filter(
        (credential) =>
          credential.type === "DIPLOME" &&
          normalizeStatus(credential.status) !==
            "REJETEE"
      ),
    [certifications]
  );

  /* =======================================================
     BADGE CERTIFIÉ
  ======================================================= */

  const isCertified =
    profil?.certifie === true ||
    validatedCredentials.length > 0;

  const hasPendingCredentials =
    pendingCredentials.length > 0;

  /* =======================================================
     AVIS / RÉPUTATION
  ======================================================= */

  const averageRating = useMemo(() => {
    if (!avis.length) return 0;

    const total = avis.reduce(
      (sum, review) => sum + Number(review.note || 0),
      0
    );

    return total / avis.length;
  }, [avis]);

  /* =======================================================
     DISPONIBILITÉ
  ======================================================= */

  const isAvailable =
    profil?.disponibilite
      ?.toLowerCase()
      .includes("disponible") ?? false;

  /* =======================================================
     INITIALES
  ======================================================= */

  const initials = `${profil?.prenom?.[0] ?? ""}${
    profil?.nom?.[0] ?? ""
  }`.toUpperCase();

  /* =======================================================
     NOM CV
  ======================================================= */

  const cvFileName =
    profil?.cvNomFichier ||
    `CV-${profil?.prenom ?? "Freelancer"}-${
      profil?.nom ?? ""
    }.pdf`;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={30}
            className="animate-spin"
          />

          <p className="text-sm">
            Chargement du profil...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERREUR
  ======================================================= */

  if (error || !profil) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-2xl p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Profil introuvable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ??
              "Le profil de ce freelancer n'est pas disponible."}
          </p>

          <Link
            to="/enterprise/freelancers"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft size={16} />
            Retour aux freelancers
          </Link>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* =================================================
            RETOUR
        ================================================= */}

        <Link
          to="/enterprise/freelancers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={17} />
          Retour aux freelancers
        </Link>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Cover */}

          <div className="h-32 sm:h-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#d4af37,_transparent_45%)]" />
          </div>

          <div className="px-5 sm:px-7 pb-6">

            <div className="flex flex-col lg:flex-row lg:items-end gap-5 -mt-12">

              {/* Avatar */}

              <div className="relative shrink-0">

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-slate-100 shadow-lg overflow-hidden flex items-center justify-center text-2xl font-bold text-slate-500">

                  {profil.photoUrl ? (
                    <img
                      src={resolveMediaUrl(
                        profil.photoUrl
                      )}
                      alt={`${profil.prenom} ${profil.nom}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials || <User size={34} />
                  )}

                </div>

                {isAvailable && (
                  <span className="absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-semibold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Disponible
                  </span>
                )}

              </div>

              {/* Identité */}

              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">
                    {profil.prenom} {profil.nom}
                  </h1>

                  {isCertified && (
                    <CertifiedBadge
                      label="Certifié"
                      size="sm"
                    />
                  )}

                </div>

                <p className="mt-1 text-sm sm:text-base text-slate-600">
                  {profil.specialite ||
                    "Freelancer professionnel"}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">

                  {profil.ville && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {profil.ville}
                      {profil.pays
                        ? `, ${profil.pays}`
                        : ""}
                    </span>
                  )}

                  {profil.experience && (
                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness size={14} />
                      {profil.experience}
                    </span>
                  )}

                  {profil.tarifJournalier && (
                    <span className="inline-flex items-center gap-1.5">
                      <WalletCards size={14} />
                      {formatNumber(
                        profil.tarifJournalier
                      )}{" "}
                      FCFA / jour
                    </span>
                  )}

                  {profil.disponibilite && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {profil.disponibilite}
                    </span>
                  )}

                </div>

              </div>

              {/* Actions */}

              <div className="flex flex-col sm:flex-row gap-2">

                <Link
                  to={`/messages?freelancer=${profil.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  <MessageSquare size={16} />
                  Contacter
                </Link>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  <UserCheck size={16} />
                  Sélectionner
                </button>

              </div>

            </div>

            {/* Trust strip */}

            <div className="mt-6 pt-5 border-t border-slate-100">

              {isCertified ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck size={19} />

                    <span className="text-sm font-semibold">
                      Profil certifié
                    </span>
                  </div>

                  <span className="hidden sm:block text-slate-300">
                    •
                  </span>

                  <span className="text-xs text-slate-500">
                    Au moins un justificatif professionnel
                    a été validé par l'équipe Free-Kaolo.
                  </span>

                </div>
              ) : hasPendingCredentials ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                  <div className="flex items-center gap-2 text-amber-700">
                    <Clock size={18} />

                    <span className="text-sm font-semibold">
                      Justificatifs en vérification
                    </span>
                  </div>

                  <span className="hidden sm:block text-slate-300">
                    •
                  </span>

                  <span className="text-xs text-slate-500">
                    Certains justificatifs ont été soumis
                    mais ne sont pas encore validés.
                  </span>

                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck size={18} />

                  <span className="text-sm">
                    Profil non certifié
                  </span>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* =================================================
            GRILLE PRINCIPALE
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* =================================================
              COLONNE GAUCHE
          ================================================= */}

          <div className="xl:col-span-2 space-y-5">

            {/* À PROPOS */}

            <SectionCard
              title="À propos"
              icon={<User size={17} />}
            >
              {profil.description ? (
                <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">
                  {profil.description}
                </p>
              ) : (
                <EmptyState
                  icon={<User size={20} />}
                  title="Aucune présentation"
                  description="Ce freelancer n'a pas encore renseigné sa présentation professionnelle."
                />
              )}
            </SectionCard>

            {/* COMPÉTENCES */}

            <SectionCard
              title="Compétences professionnelles"
              icon={<Code2 size={17} />}
            >
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(
                    (skill: any, index: number) => {
                      const skillName =
                        typeof skill === "string"
                          ? skill
                          : skill?.nom ??
                            skill?.name ??
                            skill?.libelle ??
                            `Compétence ${index + 1}`;

                      return (
                        <span
                          key={`${skillName}-${index}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          {skillName}
                        </span>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Code2 size={20} />}
                  title="Aucune compétence renseignée"
                  description="Ce freelancer n'a pas encore ajouté de compétence à son profil."
                />
              )}
            </SectionCard>

            {/* PORTFOLIO */}

            <SectionCard
              title="Portfolio"
              icon={<FolderOpen size={17} />}
              action={
                portfolio.length > 0 ? (
                  <span className="text-xs text-slate-500">
                    {portfolio.length} projet
                    {portfolio.length > 1
                      ? "s"
                      : ""}
                  </span>
                ) : null
              }
            >

              {portfolioLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>
              ) : portfolio.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen size={20} />}
                  title="Portfolio vide"
                  description="Ce freelancer n'a pas encore ajouté de réalisation à son portfolio."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {portfolio.map(
                    (item, index) => {

                      const title =
                        item.titre ??
                        item.title ??
                        item.nom ??
                        `Projet ${index + 1}`;

                      const description =
                        item.description;

                      const image =
                        item.imageUrl ??
                        item.image;

                      const projectUrl =
                        item.url ??
                        item.lien;

                      const rawTechnologies =
                        item.technologies ??
                        item.technologie ??
                        item.tech;

                      let technologies: string[] =
                        [];

                      if (
                        Array.isArray(
                          rawTechnologies
                        )
                      ) {
                        technologies =
                          rawTechnologies.map(
                            String
                          );
                      } else if (
                        typeof rawTechnologies ===
                        "string"
                      ) {
                        technologies =
                          rawTechnologies
                            .split(",")
                            .map((tech) =>
                              tech.trim()
                            )
                            .filter(Boolean);
                      }

                      return (
                        <article
                          key={
                            item.id ??
                            `${title}-${index}`
                          }
                          className="group border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 hover:shadow-md transition"
                        >

                          {/* Image */}

                          <div className="h-40 bg-slate-100 overflow-hidden">

                            {image ? (
                              <img
                                src={resolveMediaUrl(
                                  image
                                )}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FolderOpen
                                  size={38}
                                />
                              </div>
                            )}

                          </div>

                          {/* Content */}

                          <div className="p-4">

                            <div className="flex items-start justify-between gap-3">

                              <h3 className="text-sm font-bold text-slate-900">
                                {title}
                              </h3>

                              {projectUrl && (
                                <a
                                  href={safeExternalUrl(
                                    projectUrl
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
                                  title="Voir le projet"
                                >
                                  <ExternalLink
                                    size={14}
                                  />
                                </a>
                              )}

                            </div>

                            {description && (
                              <p className="mt-2 text-xs text-slate-500 leading-5 line-clamp-3">
                                {description}
                              </p>
                            )}

                            {technologies.length >
                              0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">

                                {technologies
                                  .slice(0, 5)
                                  .map(
                                    (
                                      technology,
                                      techIndex
                                    ) => (
                                      <span
                                        key={`${technology}-${techIndex}`}
                                        className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600"
                                      >
                                        {
                                          technology
                                        }
                                      </span>
                                    )
                                  )}

                              </div>
                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

            </SectionCard>

            {/* CERTIFICATIONS */}

            <SectionCard
              title="Certifications et diplômes"
              icon={<Award size={17} />}
            >

              {certificationsLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>
              ) : certifications.length ===
                0 ? (
                <EmptyState
                  icon={<Award size={20} />}
                  title="Aucun justificatif"
                  description="Ce freelancer n'a pas encore ajouté de certification ou de diplôme."
                />
              ) : (
                <div className="space-y-5">

                  {/* Certification */}

                  {certificationsList.length >
                    0 && (
                    <div>

                      <div className="flex items-center gap-2 mb-3">
                        <Award
                          size={16}
                          className="text-slate-700"
                        />

                        <h3 className="text-sm font-bold text-slate-900">
                          Certifications
                        </h3>
                      </div>

                      <div className="space-y-3">

                        {certificationsList.map(
                          (
                            credential,
                            index
                          ) => {
                            const status =
                              normalizeStatus(
                                credential.status
                              );

                            return (
                              <div
                                key={
                                  credential.id ??
                                  `certification-${index}`
                                }
                                className="border border-slate-200 rounded-xl p-4"
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div className="min-w-0">

                                    <h4 className="text-sm font-semibold text-slate-900">
                                      {
                                        credential.nom
                                      }
                                    </h4>

                                    {credential.organisme && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {
                                          credential.organisme
                                        }
                                      </p>
                                    )}

                                    {credential.credentialId && (
                                      <p className="mt-1 text-[11px] text-slate-400">
                                        ID :{" "}
                                        {
                                          credential.credentialId
                                        }
                                      </p>
                                    )}

                                  </div>

                                  <CredentialStatus
                                    status={
                                      status
                                    }
                                  />

                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[11px] text-slate-500">

                                  {credential.dateObtention && (
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays
                                        size={12}
                                      />
                                      Obtenue le{" "}
                                      {formatDate(
                                        String(
                                          credential.dateObtention
                                        )
                                      )}
                                    </span>
                                  )}

                                  {credential.dateExpiration && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3
                                        size={12}
                                      />
                                      Expire le{" "}
                                      {formatDate(
                                        String(
                                          credential.dateExpiration
                                        )
                                      )}
                                    </span>
                                  )}

                                </div>

                                {credential.documentUrl && (
                                  <a
                                    href={safeExternalUrl(
                                      credential.documentUrl
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-700 hover:text-slate-950"
                                  >
                                    <Eye
                                      size={13}
                                    />
                                    Voir le justificatif
                                  </a>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    </div>
                  )}

                  {/* Diplômes */}

                  {diplomasList.length >
                    0 && (
                    <div>

                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap
                          size={16}
                          className="text-slate-700"
                        />

                        <h3 className="text-sm font-bold text-slate-900">
                          Diplômes
                        </h3>
                      </div>

                      <div className="space-y-3">

                        {diplomasList.map(
                          (
                            diploma,
                            index
                          ) => {
                            const status =
                              normalizeStatus(
                                diploma.status
                              );

                            return (
                              <div
                                key={
                                  diploma.id ??
                                  `diploma-${index}`
                                }
                                className="border border-slate-200 rounded-xl p-4"
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>

                                    <h4 className="text-sm font-semibold text-slate-900">
                                      {
                                        diploma.nom
                                      }
                                    </h4>

                                    {diploma.organisme && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {
                                          diploma.organisme
                                        }
                                      </p>
                                    )}

                                  </div>

                                  <CredentialStatus
                                    status={
                                      status
                                    }
                                  />

                                </div>

                                {diploma.dateObtention && (
                                  <div className="mt-3 text-[11px] text-slate-500 inline-flex items-center gap-1">
                                    <CalendarDays
                                      size={12}
                                    />
                                    Obtenu le{" "}
                                    {formatDate(
                                      String(
                                        diploma.dateObtention
                                      )
                                    )}
                                  </div>
                                )}

                                {diploma.documentUrl && (
                                  <a
                                    href={safeExternalUrl(
                                      diploma.documentUrl
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-700 hover:text-slate-950"
                                  >
                                    <Eye
                                      size={13}
                                    />
                                    Voir le diplôme
                                  </a>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    </div>
                  )}

                  {/* Résumé vérification */}

                  <div className="pt-4 border-t border-slate-100">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2
                            size={15}
                          />
                          <span className="text-xs font-semibold">
                            Validés
                          </span>
                        </div>

                        <p className="mt-1 text-xl font-bold text-emerald-800">
                          {
                            validatedCredentials.length
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <Clock
                            size={15}
                          />
                          <span className="text-xs font-semibold">
                            En attente
                          </span>
                        </div>

                        <p className="mt-1 text-xl font-bold text-amber-800">
                          {
                            pendingCredentials.length
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <XCircle
                            size={15}
                          />
                          <span className="text-xs font-semibold">
                            Rejetés
                          </span>
                        </div>

                        <p className="mt-1 text-xl font-bold text-red-800">
                          {
                            rejectedCredentials.length
                          }
                        </p>
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </SectionCard>

            {/* AVIS */}

            <SectionCard
              title="Avis des entreprises"
              icon={<Star size={17} />}
              action={
                avis.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <Star
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />

                    <span className="text-sm font-bold text-slate-900">
                      {averageRating.toFixed(1)}
                    </span>

                    <span className="text-xs text-slate-500">
                      ({avis.length})
                    </span>
                  </div>
                ) : null
              }
            >

              {avisLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                </div>
              ) : avis.length === 0 ? (
                <EmptyState
                  icon={<Star size={20} />}
                  title="Aucun avis"
                  description="Ce freelancer n'a pas encore reçu d'avis d'une entreprise."
                />
              ) : (
                <div className="space-y-4">

                  {avis.map((review, index) => (
  <article
    key={`review-${index}`}
    className="border-b border-slate-100 last:border-0 pb-4 last:pb-0"
  >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {(
                                review.entrepriseNom ??
                                "Entreprise"
                              )
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-slate-900">
                                {
                                  review.entrepriseNom
                                }
                              </p>

                              {review.projetTitre && (
                                <p className="text-xs text-slate-500">
                                  {
                                    review.projetTitre
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="flex items-center gap-1">

                            {Array.from({
                              length: 5,
                            }).map(
                              (_, starIndex) => (
                                <Star
                                  key={
                                    starIndex
                                  }
                                  size={13}
                                  className={
                                    starIndex <
                                    Number(
                                      review.note
                                    )
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }
                                />
                              )
                            )}

                          </div>

                        </div>

                        {review.commentaire && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            “
                            {
                              review.commentaire
                            }
                            ”
                          </p>
                        )}

                        {review.date && (
                          <p className="mt-2 text-[11px] text-slate-400">
                            {formatDate(
                              review.date
                            )}
                          </p>
                        )}

                      </article>
                    )
                  )}

                </div>
              )}

            </SectionCard>

          </div>

          {/* =================================================
              COLONNE DROITE
          ================================================= */}

          <div className="space-y-5">

            {/* RÉPUTATION */}

            <SectionCard
              title="Réputation"
              icon={<Star size={17} />}
            >

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">

                  <span className="text-xl font-bold text-slate-900">
                    {avis.length > 0
                      ? averageRating.toFixed(
                          1
                        )
                      : "—"}
                  </span>

                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star
                      size={11}
                      className="fill-amber-400 text-amber-400"
                    />

                    <span className="text-[10px] text-slate-400">
                      / 5
                    </span>
                  </div>

                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-900">
                    {avis.length > 0
                      ? "Évaluation moyenne"
                      : "Aucune évaluation"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {avis.length} avis client
                    {avis.length > 1
                      ? "s"
                      : ""}
                  </p>

                </div>

              </div>

            </SectionCard>

            {/* CV */}

            <SectionCard
              title="Curriculum Vitae"
              icon={<FileText size={17} />}
            >

              {cvLoading ? (
                <div className="flex items-center gap-3 py-4 text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  <span className="text-sm">
                    Chargement du CV...
                  </span>
                </div>
              ) : cvUrl ? (
                <div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">

                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-500">
                      <FileText
                        size={19}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {cvFileName}
                      </p>

                      <p className="text-[11px] text-slate-500">
                        Curriculum Vitae
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">

                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Eye size={14} />
                      Aperçu
                    </a>

                    <a
                      href={cvUrl}
                      download={cvFileName}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      <Download
                        size={14}
                      />
                      Télécharger
                    </a>

                  </div>

                </div>
              ) : (
                <EmptyState
                  icon={<FileText size={20} />}
                  title="CV non disponible"
                  description="Ce freelancer n'a pas encore ajouté de CV consultable."
                />
              )}

            </SectionCard>

            {/* LANGUES */}

            <SectionCard
              title="Langues"
              icon={<Languages size={17} />}
            >

              {languages.length > 0 ? (
                <div className="space-y-2">

                  {languages.map(
                    (language, index) => (
                      <div
                        key={`${language}-${index}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >

                        <span className="text-sm font-medium text-slate-700">
                          {language}
                        </span>

                        <Globe
                          size={15}
                          className="text-slate-400"
                        />

                      </div>
                    )
                  )}

                </div>
              ) : (
                <EmptyState
                  icon={<Languages size={20} />}
                  title="Aucune langue renseignée"
                  description="Les langues parlées par ce freelancer ne sont pas encore renseignées."
                />
              )}

            </SectionCard>

            {/* LIENS PROFESSIONNELS */}

            <SectionCard
              title="Présence professionnelle"
              icon={<Globe size={17} />}
            >

              <div className="space-y-2">

                {profil.linkedin && (
                  <a
                    href={safeExternalUrl(
                      profil.linkedin
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Linkedin
                        size={17}
                        className="text-slate-700"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        LinkedIn
                      </span>
                    </div>

                    <ExternalLink
                      size={14}
                      className="text-slate-400"
                    />
                  </a>
                )}

                {profil.github && (
                  <a
                    href={safeExternalUrl(
                      profil.github
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Github
                        size={17}
                        className="text-slate-700"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        GitHub
                      </span>
                    </div>

                    <ExternalLink
                      size={14}
                      className="text-slate-400"
                    />
                  </a>
                )}

                {profil.siteweb && (
                  <a
                    href={safeExternalUrl(
                      profil.siteweb
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Globe
                        size={17}
                        className="text-slate-700"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        Site web
                      </span>
                    </div>

                    <ExternalLink
                      size={14}
                      className="text-slate-400"
                    />
                  </a>
                )}

                {!profil.linkedin &&
                  !profil.github &&
                  !profil.siteweb && (
                    <EmptyState
                      icon={<Globe size={20} />}
                      title="Aucun lien professionnel"
                      description="Ce freelancer n'a pas encore ajouté de lien professionnel."
                    />
                  )}

              </div>

            </SectionCard>

            {/* INFORMATIONS */}

            <SectionCard
              title="Informations professionnelles"
              icon={<BriefcaseBusiness size={17} />}
            >

              <div className="space-y-3">

                <InfoRow
                  label="Spécialité"
                  value={
                    profil.specialite ||
                    "Non renseignée"
                  }
                />

                <InfoRow
                  label="Expérience"
                  value={
                    profil.experience ||
                    "Non renseignée"
                  }
                />

                <InfoRow
                  label="Disponibilité"
                  value={
                    profil.disponibilite ||
                    "Non renseignée"
                  }
                />

                <InfoRow
                  label="Tarif journalier"
                  value={
                    profil.tarifJournalier
                      ? `${formatNumber(
                          profil.tarifJournalier
                        )} FCFA`
                      : "Non renseigné"
                  }
                />

                <InfoRow
                  label="Localisation"
                  value={
                    [profil.ville, profil.pays]
                      .filter(Boolean)
                      .join(", ") ||
                    "Non renseignée"
                  }
                />

              </div>

            </SectionCard>

            {/* CTA */}

            <div className="rounded-2xl bg-slate-950 text-white p-5 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-bold">
                    Ce profil correspond à
                    votre besoin ?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Contactez le freelancer pour
                    discuter de votre projet et
                    vérifier sa disponibilité.
                  </p>

                </div>

              </div>

              <Link
                to={`/messages?freelancer=${profil.id}`}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition"
              >
                Contacter le freelancer
                <ChevronRight size={15} />
              </Link>

            </div>

          </div>
        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 pb-6 text-[11px] text-slate-400">

          <div className="flex items-center gap-2">
            <Building2 size={13} />
            Profil professionnel Free-Kaolo
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={13} />
            Les informations de certification
            dépendent de la validation Free-Kaolo.
          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   STATUT CERTIFICATION
========================================================= */

function CredentialStatus({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "VALIDEE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 size={12} />
          Validée
        </span>
      );

    case "EN_ATTENTE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-semibold text-amber-700 whitespace-nowrap">
          <Clock size={12} />
          En vérification
        </span>
      );

    case "REJETEE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[10px] font-semibold text-red-700 whitespace-nowrap">
          <XCircle size={12} />
          Rejetée
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600 whitespace-nowrap">
          <AlertCircle size={12} />
          Statut inconnu
        </span>
      );
  }
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800 text-right">
        {String(value)}
      </span>
    </div>
  );
}