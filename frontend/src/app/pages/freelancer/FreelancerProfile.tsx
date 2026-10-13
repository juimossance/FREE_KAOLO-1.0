// src/app/pages/freelancer/FreelancerProfile.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../../hooks/useAuth";

import {
  freelancerServices,
  FreelancerProfil,
} from "../../../services/freelancerservices";

import cvService from "../../../services/cvService";
import { Avis, avisService } from "../../../services/avisService";

import {
  certificationService,
  type CertificationItem,
} from "../../../services/certificationservice";

import { portfolioService } from "../../../services/portfolioService";

// Badge de certification


import {
  Star,
  MapPin,
  Briefcase,
  Edit3,
  ExternalLink,
  Award,
  Globe,
  Github,
  Linkedin,
  CheckCircle,
  ShieldCheck,
  Clock,
  Code2,
  LayoutDashboard,
  Smartphone,
  Upload,
  Eye,
  RefreshCw,
  TrendingUp,
  Trash2,
  Download,
  AlertCircle,
  User,
  Languages,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Circle,
} from "lucide-react";
import { CertifiedBadge } from "../../components/CertifiedBadge";

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_ORIGIN = "http://localhost:8080";

// ============================================================================
// DONNÉES STATIQUES TEMPORAIRES
// ============================================================================

const staticStats = [
  { label: "Projets réalisés", value: "23" },
  { label: "Clients satisfaits", value: "19" },
  { label: "Taux de succès", value: "96%" },
  { label: "Livraisons à temps", value: "100%" },
];

const staticPortfolio = [
  {
    title: "E-commerce Platform",
    tech: "React · Next.js",
    icon: Code2,
  },
  {
    title: "Banking Dashboard",
    tech: "Vue.js · D3.js",
    icon: LayoutDashboard,
  },
  {
    title: "Mobile App CI",
    tech: "React Native",
    icon: Smartphone,
  },
];

// ============================================================================
// UTILITAIRES MÉDIAS
// ============================================================================

/**
 * Transforme une photoUrl venant de la base de données
 * en URL réellement exploitable par le navigateur.
 *
 * Exemples :
 *
 * photo_sophie.jpg
 *      -> http://localhost:8080/uploads/photo_sophie.jpg
 *
 * /uploads/photo_sophie.jpg
 *      -> http://localhost:8080/uploads/photo_sophie.jpg
 *
 * http://localhost:8080/uploads/photo_sophie.jpg 
 *      -> inchangé 
 */ 
const resolveMediaUrl = (url?: string | null): string => { 
  if (!url) { 
    return ""; 
  } 
 
  const cleanUrl = url.trim(); 
 
  if (!cleanUrl) { 
    return ""; 
  } 
 
  // URL complète 
  if (/^https?:\/\//i.test(cleanUrl)) { 
    return cleanUrl; 
  } 
 
  // Data URL 
  if (cleanUrl.startsWith("data:")) { 
    return cleanUrl; 
  } 
 
  // Blob URL 
  if (cleanUrl.startsWith("blob:")) { 
    return cleanUrl; 
  } 
 
  // /uploads/... 
  if (cleanUrl.startsWith("/uploads/")) { 
    return `${API_ORIGIN}${cleanUrl}`; 
  } 
 
  // uploads/... 
  if (cleanUrl.startsWith("uploads/")) { 
    return `${API_ORIGIN}/${cleanUrl}`; 
  } 
 
  // Autre chemin absolu 
  if (cleanUrl.startsWith("/")) { 
    return `${API_ORIGIN}${cleanUrl}`; 
  } 
 
  // Nom de fichier simple 
  return `${API_ORIGIN}/uploads/${cleanUrl}`; 
}; 
 
// ============================================================================ 
// COMPLÉTUDE DU PROFIL 
// ============================================================================ 
 
interface CompletionItem { 
  key: string; 
  label: string; 
  weight: number; 
  done: boolean; 
  to?: string; 
} 
 
interface CompletionExtras { 
  hasCv: boolean; 
  portfolioCount: number; 
  certificationCount: number; 
  diplomaCount: number; 
} 
 
const hasText = (value: unknown) => 
  value !== undefined && 
  value !== null && 
  String(value).trim() !== ""; 
 
/** 
 * Calcule la complétude du profil. 
 * 
 * Total : 
 * - données du freelance : 60 points 
 * - CV : 10 
 * - portfolio : 10 
 * - certification : 10 
 * - diplôme : 10 
 * 
 * Total = 100 
 */ 
function buildCompletion( 
  profil: FreelancerProfil, 
  extras: CompletionExtras 
) { 
  const skills = Array.isArray(profil.competence) 
    ? profil.competence 
    : []; 
 
  const items: CompletionItem[] = [ 
    { 
      key: "photo", 
      label: "Photo de profil", 
      weight: 10, 
      done: hasText(profil.photoUrl), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "bio", 
      label: "Bio professionnelle", 
      weight: 10, 
      done: (profil.description?.trim().length ?? 0) > 20, 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "specialite", 
      label: "Spécialité", 
      weight: 5, 
      done: hasText(profil.specialite), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "skills", 
      label: "Compétences (3+)", 
      weight: 10, 
      done: skills.length >= 3, 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "experience", 
      label: "Années d'expérience", 
      weight: 5, 
      done: hasText(profil.experience), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "ville", 
      label: "Localisation", 
      weight: 5, 
      done: hasText(profil.ville), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "tarif", 
      label: "Tarif et disponibilité", 
      weight: 5, 
      done: 
        Number(profil.tarifJournalier) > 0 && 
        hasText(profil.disponibilite), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "langues", 
      label: "Langues", 
      weight: 5, 
      done: hasText(profil.langues), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "liens", 
      label: "Lien professionnel", 
      weight: 5, 
      done: 
        hasText(profil.github) || 
        hasText(profil.linkedin) || 
        hasText(profil.siteweb), 
      to: "/freelancer/edit-profile", 
    }, 
 
    { 
      key: "cv", 
      label: "CV importé", 
      weight: 10, 
      done: extras.hasCv, 
    }, 
 
    { 
      key: "portfolio", 
      label: "Projet au portfolio", 
      weight: 10, 
      done: extras.portfolioCount > 0, 
      to: "/freelancer/portfolio", 
    }, 
 
    { 
      key: "certification", 
      label: "Certification", 
      weight: 10, 
      done: extras.certificationCount > 0, 
      to: "/freelancer/certifications", 
    }, 
 
    { 
      key: "diplome", 
      label: "Diplôme", 
      weight: 10, 
      done: extras.diplomaCount > 0, 
      to: "/freelancer/certifications", 
    }, 
  ]; 
 
  const score = items.reduce( 
    (total, item) => total + (item.done ? item.weight : 0), 
    0 
  ); 
 
  return { 
    items, 
    score, 
  }; 
}; 
 
// ============================================================================ 
// CERTIFICATIONS 
// ============================================================================ 
 
/** 
 * Pour la complétude : 
 * une certification/diplôme soumis compte, 
 * sauf lorsqu'il est rejeté. 
 */ 
const countsForCompletion = (c: CertificationItem) => 
  c.status !== "REJETEE"; 
 
/** 
 * Détermine si un justificatif a réellement été validé. 
 * 
 * IMPORTANT : 
 * EN_ATTENTE  -> pas de badge 
 * REJETEE     -> pas de badge 
 * VALIDEE     -> badge 
 */ 
const isValidatedCredential = (c: CertificationItem) => 
  c.status === "VALIDEE"; 
 
// ============================================================================ 
// DATE 
// ============================================================================ 
 
const yearOf = (isoDate?: string | null) => { 
  if (!isoDate) { 
    return ""; 
  } 
 
  const d = new Date(isoDate); 
 
  return Number.isNaN(d.getTime()) 
    ? "" 
    : String(d.getFullYear()); 
}; 
 
// ============================================================================ 
// COMPOSANT 
// ============================================================================ 
 
export function FreelancerProfile() { 
  const { user } = useAuth(); 
 
  const userId = user?.userId; 
  const freelancerId = user?.freelancerId; 
 
  // ========================================================================== 
  // ÉTATS 
  // ========================================================================== 
 
  const [profil, setProfil] = 
    useState<FreelancerProfil | null>(null); 
 
  const [loading, setLoading] = useState(true); 
 
  const [photoError, setPhotoError] = useState(false); 
 
  const [uploading, setUploading] = useState(false); 
 
  const [cvUrl, setCvUrl] = 
    useState<string | null>(null); 
 
  const [cvFileName, setCvFileName] = 
    useState<string | null>(null); 
 
  const [cvChecked, setCvChecked] = 
    useState(false); 
 
  const [error, setError] = 
    useState<string | null>(null); 
 
  const [successMessage, setSuccessMessage] = 
    useState<string | null>(null); 
 
  // Avis 
  const [avis, setAvis] = 
    useState<Avis[]>([]); 
 
  const [avisLoading, setAvisLoading] = 
    useState(true); 
 
  // Certifications 
  const [certifications, setCertifications] = 
    useState<CertificationItem[]>([]); 
 
  // Portfolio 
  const [portfolioCount, setPortfolioCount] = 
    useState(0); 
 
  const [extrasLoaded, setExtrasLoaded] = 
    useState(false); 
 
  // ========================================================================== 
  // AVIS 
  // ========================================================================== 
 
  const noteMoyenne = 
    avis.length > 0 
      ? avis.reduce( 
          (sum, a) => sum + a.note, 
          0 
        ) / avis.length 
      : 0; 
 
  const distribution = [5, 4, 3, 2, 1].map( 
    (stars) => { 
      const count = avis.filter( 
        (a) => a.note === stars 
      ).length; 
 
      const pct = 
        avis.length > 0 
          ? (count / avis.length) * 100 
          : 0; 
 
      return { 
        stars, 
        count, 
        pct, 
      }; 
    } 
  ); 
 
  const formatAvisDate = (d?: string) => 
    d 
      ? new Date(d).toLocaleDateString( 
          "fr-FR", 
          { 
            month: "short", 
            year: "numeric", 
          } 
        ) 
      : ""; 
 
  const initialesEntreprise = (nom?: string) => 
    nom 
      ? nom 
          .split(" ") 
          .map((w) => w[0]) 
          .join("") 
          .slice(0, 2) 
          .toUpperCase() 
      : "??"; 
 
  // ========================================================================== 
  // CHARGEMENT DES AVIS 
  // ========================================================================== 
 
  useEffect(() => { 
    if (!freelancerId) { 
      setAvisLoading(false); 
      return; 
    } 
 
    let cancelled = false; 
 
    const fetchAvis = async () => { 
      try { 
        setAvisLoading(true); 
 
        const data = 
          await avisService.getAvis( 
            freelancerId 
          ); 
 
        if (!cancelled) { 
          setAvis(data); 
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
 
    fetchAvis(); 
 
    return () => { 
      cancelled = true; 
    }; 
  }, [freelancerId]); 
 
  // ========================================================================== 
  // CERTIFICATIONS + PORTFOLIO 
  // ========================================================================== 
useEffect(() => { 
  setPhotoError(false); 
}, [profil?.photoUrl]); 
 
  useEffect(() => { 
    if (!freelancerId) { 
      setExtrasLoaded(true); 
      return; 
    } 
 
    let cancelled = false; 
 
    const loadExtras = async () => { 
      const [ 
        certResult, 
        portfolioResult, 
      ] = await Promise.allSettled([ 
        certificationService.getAll( 
          freelancerId 
        ), 
        portfolioService.getAll( 
          freelancerId 
        ), 
      ]); 
 
      if (cancelled) { 
        return; 
      } 
 
      if (certResult.status === "fulfilled") { 
        setCertifications( 
          certResult.value 
        ); 
      } else { 
        console.error( 
          "Erreur chargement certifications :", 
          certResult.reason 
        ); 
      } 
 
      if ( 
        portfolioResult.status === 
        "fulfilled" 
      ) { 
        setPortfolioCount( 
          portfolioResult.value.length 
        ); 
      } else { 
        console.error( 
          "Erreur chargement portfolio :", 
          portfolioResult.reason 
        ); 
      } 
 
      setExtrasLoaded(true); 
    }; 
 
    loadExtras(); 
 
    return () => { 
      cancelled = true; 
    }; 
  }, [freelancerId]); 
 
  // ========================================================================== 
  // CHARGEMENT DU PROFIL 
  // ========================================================================== 
 
  useEffect(() => { 
    if (!userId) { 
      setLoading(false); 
      setError( 
        "Utilisateur non identifié." 
      ); 
      return; 
    } 
 
    let cancelled = false; 
 
    const chargerProfil = async () => { 
      try { 
        setLoading(true); 
        setError(null); 
 
        const data = 
          await freelancerServices.getProfil( 
            userId 
          ); 
 
        if (!cancelled) { 
          setProfil(data); 
 
          // Si le backend fournit déjà le nom du CV 
          if (data.cvNomFichier) { 
            setCvFileName( 
              data.cvNomFichier 
            ); 
          } 
        } 
      } catch (err) { 
        if (!cancelled) { 
          console.error( 
            "Erreur chargement profil :", 
            err 
          ); 
 
          setError( 
            err instanceof Error 
              ? err.message 
              : "Impossible de charger le profil." 
          ); 
        } 
      } finally { 
        if (!cancelled) { 
          setLoading(false); 
        } 
      } 
    }; 
 
    chargerProfil(); 
 
    return () => { 
      cancelled = true; 
    }; 
  }, [userId]); 
 
  // ========================================================================== 
  // CHARGEMENT DU CV 
  // ========================================================================== 
 
  useEffect(() => { 
    if (!freelancerId) { 
      setCvChecked(true); 
      return; 
    } 
 
    let cancelled = false; 
 
    const fetchCv = async () => { 
      try { 
        const blob = 
          await cvService.getCv( 
            freelancerId 
          ); 
 
        if (cancelled) { 
          return; 
        } 
 
        const url = 
          URL.createObjectURL(blob); 
 
        setCvUrl((previousUrl) => { 
          if (previousUrl) { 
            URL.revokeObjectURL( 
              previousUrl 
            ); 
          } 
 
          return url; 
        }); 
      } catch (err) { 
        if (!cancelled) { 
          console.info( 
            "Aucun CV disponible ou impossible de le charger." 
          ); 
 
          setCvUrl(null); 
        } 
      } finally { 
        if (!cancelled) { 
          setCvChecked(true); 
        } 
      } 
    }; 
 
    fetchCv(); 
 
    return () => { 
      cancelled = true; 
    }; 
  }, [freelancerId]); 
 
  // ==========================================================================
  // SAUVEGARDE DE LA COMPLÉTUDE EN BASE
  //
  // IMPORTANT :
  // - userId sert à charger le profil via /by-user/{userId}/profil
  // - freelancerId sert à enregistrer la complétude du freelance
  // - ce hook reste avant les return conditionnels pour respecter les règles React
  // ============================================================================

  useEffect(() => {
    if (
      !profil ||
      !freelancerId ||
      !cvChecked ||
      !extrasLoaded
    ) {
      return;
    }

    const validCertifications =
      certifications.filter(
        countsForCompletion
      );

    const validCertificationsOnly =
      validCertifications.filter(
        (certification) =>
          String(
            certification.type ?? "CERTIFICATION"
          ).toUpperCase() === "CERTIFICATION"
      );

    const validDiplomas =
      validCertifications.filter(
        (certification) =>
          String(
            certification.type ?? ""
          ).toUpperCase() === "DIPLOME"
      );

    const result =
      buildCompletion(profil, {
        hasCv: Boolean(cvUrl),
        portfolioCount,
        certificationCount:
          validCertificationsOnly.length,
        diplomaCount:
          validDiplomas.length,
      });

    const saveCompletion = async () => {
      try {
        await freelancerServices.updateCompletion(
          freelancerId,
          result.score
        );

        console.log(
          `Complétude enregistrée : ${result.score}%`
        );
      } catch (err) {
        console.error(
          "Erreur lors de l'enregistrement de la complétude :",
          err
        );
      }
    };

    saveCompletion();
  }, [
    profil,
    freelancerId,
    cvChecked,
    extrasLoaded,
    cvUrl,
    portfolioCount,
    certifications,
  ]);

  // ========================================================================== 
  // IMPORT CV 
  // ========================================================================== 
 
  const handleCvImport = async ( 
    event: React.ChangeEvent<HTMLInputElement> 
  ) => { 
    const file = 
      event.target.files?.[0]; 
 
    if (!file) { 
      return; 
    } 
 
    const allowedTypes = [ 
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
    ]; 
 
    if ( 
      !allowedTypes.includes( 
        file.type 
      ) 
    ) { 
      setError( 
        "Veuillez importer un fichier PDF, DOC ou DOCX." 
      ); 
 
      setSuccessMessage(null); 
      event.target.value = ""; 
 
      return; 
    } 
 
    if ( 
      file.size > 
      5 * 1024 * 1024 
    ) { 
      setError( 
        "La taille maximale du CV est de 5 Mo." 
      ); 
 
      setSuccessMessage(null); 
      event.target.value = ""; 
 
      return; 
    } 
 
    if (!freelancerId) { 
      setError( 
        "Utilisateur non identifié." 
      ); 
 
      event.target.value = ""; 
 
      return; 
    } 
 
    try { 
      setUploading(true); 
      setError(null); 
      setSuccessMessage(null); 
 
      await cvService.importCv( 
        freelancerId, 
        file 
      ); 
 
      try { 
        const blob = 
          await cvService.getCv( 
            freelancerId 
          ); 
 
        const url = 
          URL.createObjectURL(blob); 
 
        setCvUrl((previousUrl) => { 
          if (previousUrl) { 
            URL.revokeObjectURL( 
              previousUrl 
            ); 
          } 
 
          return url; 
        }); 
      } catch (previewError) { 
        console.warn( 
          "CV importé mais aperçu indisponible :", 
          previewError 
        ); 
      } 
 
      setCvFileName(file.name); 
 
      setSuccessMessage( 
        "Votre CV a été importé avec succès." 
      ); 
    } catch (err) { 
      console.error( 
        "Erreur import CV :", 
        err 
      ); 
 
      setError( 
        err instanceof Error 
          ? err.message 
          : "Impossible d'importer le CV." 
      ); 
 
      setSuccessMessage(null); 
    } finally { 
      setUploading(false); 
 
      event.target.value = ""; 
    } 
  }; 
 
  // ========================================================================== 
  // SUPPRESSION CV 
  // ========================================================================== 
 
  const handleDeleteCv = async () => { 
    if (!freelancerId || !cvUrl) { 
      return; 
    } 
 
    const confirmed = 
      window.confirm( 
        "Voulez-vous vraiment supprimer votre CV ?" 
      ); 
 
    if (!confirmed) { 
      return; 
    } 
 
    try { 
      setError(null); 
      setSuccessMessage(null); 
 
      await cvService.deleteCv( 
        freelancerId 
      ); 
 
      setCvUrl((previousUrl) => { 
        if (previousUrl) { 
          URL.revokeObjectURL( 
            previousUrl 
          ); 
        } 
 
        return null; 
      }); 
 
      setCvFileName(null); 
 
      setSuccessMessage( 
        "Votre CV a été supprimé." 
      ); 
    } catch (err) { 
      console.error( 
        "Erreur suppression CV :", 
        err 
      ); 
 
      setError( 
        err instanceof Error 
          ? err.message 
          : "Impossible de supprimer le CV." 
      ); 
    } 
  }; 
 
  // ========================================================================== 
  // LOADING 
  // ========================================================================== 
 
  if (loading) { 
    return ( 
      <div className="min-h-[60vh] flex items-center justify-center px-4"> 
        <div className="flex flex-col items-center gap-3"> 
          <div 
            className="w-10 h-10 rounded-full border-4 animate-spin" 
            style={{ 
              borderColor: "#E2E8F0", 
              borderTopColor: 
                "var(--navy)", 
            }} 
          /> 
 
          <p 
            className="text-sm" 
            style={{ 
              color: 
                "var(--muted-foreground)", 
            }} 
          > 
            Chargement de votre profil... 
          </p> 
        </div> 
      </div> 
    ); 
  } 
 
  // ========================================================================== 
  // PROFIL INTROUVABLE 
  // ========================================================================== 
 
  if (!profil) { 
    return ( 
      <div className="min-h-[60vh] flex items-center justify-center px-4"> 
        <div 
          className="max-w-md w-full p-6 rounded-2xl border bg-white text-center" 
          style={{ 
            borderColor: "var(--border)", 
          }} 
        > 
          <div 
            className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center" 
            style={{ 
              background: "#F8FAFC", 
              color: "var(--navy)", 
            }} 
          > 
            <User size={21} /> 
          </div> 
 
          <h2 
            className="mt-4 font-semibold" 
            style={{ 
              color: "var(--navy)", 
            }} 
          > 
            Profil introuvable 
          </h2> 
 
          <p 
            className="mt-1 text-sm" 
            style={{ 
              color: 
                "var(--muted-foreground)", 
            }} 
          > 
            Nous n'avons pas pu récupérer 
            vos informations. 
          </p> 
        </div> 
      </div> 
    ); 
  } 
 
  // ========================================================================== 
  // DONNÉES PROFIL 
  // ========================================================================== 
 
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
  } = profil; 
 
  // ========================================================================== 
  // PHOTO 
  // ========================================================================== 
 
  const avatarLetters = 
  `${prenom?.[0] || ""}${nom?.[0] || ""}` 
    .toUpperCase(); 
 
const resolvedPhotoUrl = 
  resolveMediaUrl(photoUrl); 
 
const avatarContent = 
  resolvedPhotoUrl && !photoError ? ( 
    <img 
      src={resolvedPhotoUrl} 
      alt={`Photo de ${prenom ?? ""} ${nom ?? ""}`} 
      className="w-full h-full object-cover" 
      onError={() => { 
        console.error( 
          "Impossible de charger la photo :", 
          resolvedPhotoUrl 
        ); 
 
        setPhotoError(true); 
      }} 
    /> 
  ) : ( 
    avatarLetters || "?" 
  ); 
 
  // ========================================================================== 
  // COMPÉTENCES 
  // ========================================================================== 
 
  const bioText = 
    description || ""; 
 
  const skillList = 
    Array.isArray(competence) 
      ? competence 
      : []; 
 
  // ========================================================================== 
  // LANGUES 
  // ========================================================================== 
 
  const languageList = langues 
    ? langues 
        .split(",") 
        .map((language) => 
          language.trim() 
        ) 
        .filter(Boolean) 
    : []; 
 
  // ========================================================================== 
  // CERTIFICATIONS / DIPLÔMES 
  // ========================================================================== 
 
  const certificationsList = 
    certifications.filter( 
      (c) => 
        (c.type ?? 
          "CERTIFICATION") === 
          "CERTIFICATION" && 
        countsForCompletion(c) 
    ); 
 
  const diplomasList = 
    certifications.filter( 
      (c) => 
        c.type === "DIPLOME" && 
        countsForCompletion(c) 
    ); 
 
  const credentialPreview = [ 
    ...diplomasList, 
    ...certificationsList, 
  ].slice(0, 4); 
 
  // ========================================================================== 
  // ALGORITHME DU BADGE CERTIFIÉ 
  // ========================================================================== 
 
  /** 
   * Le badge n'est PAS lié à la complétude du profil. 
   * 
   * Règle : 
   * 
   * 1. Le backend peut déclarer directement le freelance certifié : 
   * 
   *      profil.certifie === true 
   * 
   * OU 
   * 
   * 2. Au moins une certification/diplôme possède : 
   * 
   *      status === "VALIDEE" 
   * 
   * EN_ATTENTE -> pas de badge 
   * REJETEE    -> pas de badge 
   */ 
  const hasValidatedCredential = 
    certifications.some( 
      isValidatedCredential 
    ); 
 
  const isCertified = 
    profil.certifie === true || 
    hasValidatedCredential; 
 
  // ========================================================================== 
  // COMPLÉTUDE 
  // ========================================================================== 
 
  const completionData = 
    buildCompletion(profil, { 
      hasCv: Boolean(cvUrl), 
      portfolioCount, 
      certificationCount: 
        certificationsList.length, 
      diplomaCount: 
        diplomasList.length, 
    }); 
 
  const completionReady = 
    cvChecked && 
    extrasLoaded; 
 
  const completion = 
    completionReady 
      ? completionData.score 
      : 0; 
 
  const missingItems = 
    completionData.items.filter( 
      (item) => !item.done 
    ); 
 
  // ========================================================================== 
  // LIENS 
  // ========================================================================== 
 
  const githubHref = github 
    ? github.startsWith("http") 
      ? github 
      : `https://${github}` 
    : ""; 
 
  const linkedinHref = linkedin 
    ? linkedin.startsWith("http") 
      ? linkedin 
      : `https://${linkedin}` 
    : ""; 
 
  const sitewebHref = siteweb 
    ? siteweb.startsWith("http") 
      ? siteweb 
      : `https://${siteweb}` 
    : ""; 
 
  // ========================================================================== 
  // MESSAGE COMPLÉTUDE 
  // ========================================================================== 
 
  const completionMessage = 
    !completionReady 
      ? "Calcul en cours..." 
      : completion >= 90 
        ? "Votre profil est très complet." 
        : completion >= 70 
          ? "Votre profil est bien renseigné." 
          : completion >= 40 
            ? "Quelques informations peuvent encore renforcer votre profil." 
            : "Complétez votre profil pour améliorer votre visibilité."; 
 
  // ========================================================================== 
  // RENDU 
  // ========================================================================== 
 
  return ( 
    <div className="w-full px-3 sm:px-5 lg:px-8 py-4 sm:py-6"> 
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6"> 
 
        {/* ================================================================ */} 
        {/* HERO                                                             */} 
        {/* ================================================================ */} 
 
        <section 
          className="rounded-2xl sm:rounded-3xl border bg-white overflow-hidden" 
          style={{ 
            borderColor: 
              "var(--border)", 
          }} 
        > 
          {/* Bandeau */} 
          <div 
            className="h-24 sm:h-28 relative overflow-hidden" 
            style={{ 
              background: 
                "linear-gradient(135deg, var(--navy) 0%, #334155 100%)", 
            }} 
          > 
            <svg 
              className="absolute inset-0 w-full h-full opacity-[0.08]" 
              preserveAspectRatio="none" 
              aria-hidden="true" 
            > 
              <defs> 
                <pattern 
                  id="diamondPattern" 
                  width="28" 
                  height="28" 
                  patternUnits="userSpaceOnUse" 
                > 
                  <path 
                    d="M14 0 L28 14 L14 28 L0 14 Z" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="1" 
                  /> 
                </pattern> 
              </defs> 
 
              <rect 
                width="100%" 
                height="100%" 
                fill="url(#diamondPattern)" 
              /> 
            </svg> 
 
            <Link 
              to="/freelancer/edit-profile" 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm" 
            > 
              <Edit3 size={14} /> 
              Modifier 
            </Link> 
          </div> 
 
          {/* Informations */} 
          <div className="px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6"> 
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-11"> 
 
              {/* ========================================================== */} 
              {/* AVATAR                                                      */} 
              {/* ========================================================== */} 
 
              <div 
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-[3px] flex-shrink-0" 
                style={{ 
                  background: isCertified 
                    ? "#059669" 
                    : "#CBD5E1", 
                }} 
              > 
                <div className="w-full h-full rounded-2xl border-4 border-white flex items-center justify-center text-xl sm:text-2xl font-bold overflow-hidden bg-white"> 
                  {avatarContent} 
                </div> 
 
                {/* Badge sur la photo */} 
                {isCertified && ( 
                  <div 
                    className="absolute -bottom-1 -right-1" 
                    title="Freelance certifié" 
                  > 
                    <CertifiedBadge 
                      label="Certifié" 
                      size="sm" 
                    /> 
                  </div> 
                )} 
              </div> 
 
              {/* ========================================================== */} 
              {/* IDENTITÉ                                                    */} 
              {/* ========================================================== */} 
 
              <div className="min-w-0 flex-1"> 
                <div className="flex flex-wrap items-center gap-2"> 
 
                  <h1 
                    className="text-xl sm:text-2xl font-bold tracking-tight truncate" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    {prenom} {nom} 
                  </h1> 
 
                  {/* Badge principal à côté du nom */} 
                  {isCertified && ( 
                    <CertifiedBadge 
                      label="Certifié" 
                      size="sm" 
                    /> 
                  )} 
                </div> 
 
                <p 
                  className="text-sm mt-1 truncate" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  {specialite || 
                    "Spécialité non renseignée"} 
                </p> 
              </div> 
 
              {/* ========================================================== */} 
              {/* RÉSEAUX                                                     */} 
              {/* ========================================================== */} 
 
              <div className="flex gap-2 pb-1"> 
                {githubHref && ( 
                  <a 
                    href={githubHref} 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="GitHub" 
                    className="p-2.5 rounded-xl border hover:bg-slate-50 transition-colors" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                    }} 
                  > 
                    <Github 
                      size={16} 
                      className="text-slate-600" 
                    /> 
                  </a> 
                )} 
 
                {linkedinHref && ( 
                  <a 
                    href={linkedinHref} 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="LinkedIn" 
                    className="p-2.5 rounded-xl border hover:bg-slate-50 transition-colors" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                    }} 
                  > 
                    <Linkedin 
                      size={16} 
                      className="text-slate-600" 
                    /> 
                  </a> 
                )} 
 
                {sitewebHref && ( 
                  <a 
                    href={sitewebHref} 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Site web" 
                    className="p-2.5 rounded-xl border hover:bg-slate-50 transition-colors" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                    }} 
                  > 
                    <Globe 
                      size={16} 
                      className="text-slate-600" 
                    /> 
                  </a> 
                )} 
              </div> 
            </div> 
 
            {/* ============================================================ */} 
            {/* STATUT CERTIFICATION                                         */} 
            {/* ============================================================ */} 
 
            {isCertified && ( 
              <div 
                className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t" 
                style={{ 
                  borderColor: 
                    "var(--border)", 
                }} 
              > 
                <CertifiedBadge 
                  label="Profil certifié" 
                  size="md" 
                /> 
 
                <span 
                  className="text-xs" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  Certification validée par 
                  l'équipe Free-Kaolo 
                </span> 
              </div> 
            )} 
 
            {/* ============================================================ */} 
            {/* MÉTADONNÉES                                                  */} 
            {/* ============================================================ */} 
 
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm"> 
              {ville && ( 
                <div 
                  className="flex items-center gap-1.5" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  <MapPin size={14} /> 
 
                  {ville} 
 
                  {pays 
                    ? `, ${pays}` 
                    : ""} 
                </div> 
              )} 
 
              {experience !== 
                undefined && 
                experience !== null && ( 
                  <div 
                    className="flex items-center gap-1.5" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    <Briefcase 
                      size={14} 
                    /> 
 
                    {experience} ans 
                    d'expérience 
                  </div> 
                )} 
 
              {tarifJournalier && ( 
                <div 
                  className="flex items-center gap-1.5 font-semibold" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  {tarifJournalier.toLocaleString( 
                    "fr-FR" 
                  )}{" "} 
                  FCFA/jour 
                </div> 
              )} 
 
              {disponibilite && ( 
                <span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" 
                  style={{ 
                    background: 
                      "#F0FDF4", 
                    color: 
                      "#166534", 
                  }} 
                > 
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ 
                      background: 
                        "#16A34A", 
                    }} 
                  /> 
 
                  {disponibilite} 
                </span> 
              )} 
            </div> 
 
            {/* ============================================================ */} 
            {/* BIO                                                            */} 
            {/* ============================================================ */} 
 
            {bioText && ( 
              <p 
                className="text-sm leading-6 mt-4 max-w-4xl" 
                style={{ 
                  color: 
                    "var(--foreground)", 
                }} 
              > 
                {bioText} 
              </p> 
            )} 
 
            {/* ============================================================ */} 
            {/* MESSAGES                                                      */} 
            {/* ============================================================ */} 
 
            <div className="mt-4"> 
              {successMessage && ( 
                <div 
                  className="mb-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm" 
                  style={{ 
                    background: 
                      "#F0FDF4", 
                    borderColor: 
                      "#BBF7D0", 
                    color: 
                      "#166534", 
                  }} 
                > 
                  <CheckCircle 
                    size={16} 
                  /> 
 
                  <span> 
                    {successMessage} 
                  </span> 
                </div> 
              )} 
 
              {error && ( 
                <div 
                  className="mb-3 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm" 
                  style={{ 
                    background: 
                      "#FEF2F2", 
                    borderColor: 
                      "#FECACA", 
                    color: 
                      "#991B1B", 
                  }} 
                > 
                  <AlertCircle 
                    size={16} 
                    className="mt-0.5 flex-shrink-0" 
                  /> 
 
                  <span>{error}</span> 
                </div> 
              )} 
            </div> 
 
            {/* ============================================================ */} 
            {/* ACTIONS                                                       */} 
            {/* ============================================================ */} 
 
            <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5"> 
 
              <Link 
                to="/messages" 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90" 
                style={{ 
                  background: 
                    "var(--navy)", 
                  color: "#FFFFFF", 
                }} 
              > 
                Envoyer un message 
 
                <ArrowRight 
                  size={15} 
                /> 
              </Link> 
 
              <label 
                htmlFor="cv-upload" 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-colors hover:bg-slate-50" 
                style={{ 
                  borderColor: 
                    "var(--border)", 
                  color: 
                    "var(--navy)", 
                }} 
              > 
                {uploading ? ( 
                  <> 
                    <RefreshCw 
                      size={16} 
                      className="animate-spin" 
                    /> 
 
                    Importation... 
                  </> 
                ) : ( 
                  <> 
                    <Upload 
                      size={16} 
                    /> 
 
                    Importer mon CV 
                  </> 
                )} 
              </label> 
 
              <input 
                id="cv-upload" 
                type="file" 
                accept=".pdf,.doc,.docx" 
                className="hidden" 
                onChange={ 
                  handleCvImport 
                } 
                disabled={uploading} 
              /> 
 
              {cvUrl && ( 
                <> 
                  <a 
                    href={cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-slate-50 transition-colors" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Eye size={16} /> 
 
                    Voir mon CV 
                  </a> 
 
                  <a 
                    href={cvUrl} 
                    download={ 
                      cvFileName ?? 
                      "mon-cv.pdf" 
                    } 
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-slate-50 transition-colors" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Download 
                      size={16} 
                    /> 
 
                    Télécharger 
                  </a> 
 
                  <button 
                    type="button" 
                    onClick={ 
                      handleDeleteCv 
                    } 
                    disabled={ 
                      uploading 
                    } 
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-red-50 disabled:opacity-50" 
                    style={{ 
                      borderColor: 
                        "#FECACA", 
                      color: 
                        "#B91C1C", 
                    }} 
                  > 
                    <Trash2 
                      size={16} 
                    /> 
 
                    Supprimer 
                  </button> 
 
                  <Link 
                    to="/freelancer/cv" 
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50" 
                    style={{ 
                      borderColor: 
                        "var(--border)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Sparkles 
                      size={16} 
                    /> 
 
                    Analyser avec l'IA 
                  </Link> 
                </> 
              )} 
            </div> 
 
            <div 
              className="mt-2 text-[11px]" 
              style={{ 
                color: 
                  "var(--muted-foreground)", 
              }} 
            > 
              PDF, DOC ou DOCX · 5 Mo 
              maximum 
            </div> 
          </div> 
        </section> 
 
        {/* ================================================================ */} 
        {/* COMPLÉTUDE                                                       */} 
        {/* ================================================================ */} 
 
        <section 
          className="rounded-2xl border bg-white p-4 sm:p-5" 
          style={{ 
            borderColor: 
              "var(--border)", 
          }} 
        > 
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center"> 
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" 
              style={{ 
                background: 
                  "var(--secondary)", 
                color: 
                  "var(--navy)", 
              }} 
            > 
              <User size={19} /> 
            </div> 
 
            <div className="flex-1"> 
              <div className="flex items-center justify-between gap-3 mb-2"> 
                <div> 
                  <p 
                    className="text-sm font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Complétude du profil 
                  </p> 
 
                  <p 
                    className="text-xs mt-0.5" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    {completionMessage} 
                  </p> 
                </div> 
 
                <span 
                  className="text-lg font-bold" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  {completionReady 
                    ? `${completion}%` 
                    : "…"} 
                </span> 
              </div> 
 
              <div 
                className="h-2 rounded-full overflow-hidden" 
                style={{ 
                  background: 
                    "#E2E8F0", 
                }} 
              > 
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${completion}%`, 
                    background: 
                      completion >= 80 
                        ? "#16A34A" 
                        : "var(--navy)", 
                  }} 
                /> 
              </div> 
            </div> 
 
            {completionReady && 
              completion === 100 && ( 
                <span 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold" 
                  style={{ 
                    color: 
                      "#047857", 
                  }} 
                > 
                  <CheckCircle 
                    size={15} 
                  /> 
 
                  Profil complet 
                </span> 
              )} 
          </div> 
 
          {completionReady && ( 
            <div 
              className="mt-4 pt-4 border-t flex flex-wrap gap-2" 
              style={{ 
                borderColor: 
                  "var(--border)", 
              }} 
            > 
              {completionData.items.map( 
                (item) => { 
                  const chipClass = 
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border"; 
 
                  if (item.done) { 
                    return ( 
                      <span 
                        key={item.key} 
                        className={ 
                          chipClass 
                        } 
                        style={{ 
                          background: 
                            "#F0FDF4", 
                          borderColor: 
                            "#BBF7D0", 
                          color: 
                            "#166534", 
                        }} 
                      > 
                        <CheckCircle 
                          size={12} 
                        /> 
 
                        {item.label} 
                      </span> 
                    ); 
                  } 
 
                  const pendingStyle = { 
                    background: 
                      "#FFFFFF", 
                    borderColor: 
                      "var(--border)", 
                    color: 
                      "var(--muted-foreground)", 
                  }; 
 
                  if ( 
                    item.key === 
                    "cv" 
                  ) { 
                    return ( 
                      <label 
                        key={ 
                          item.key 
                        } 
                        htmlFor="cv-upload" 
                        className={`${chipClass} cursor-pointer hover:bg-slate-50 transition-colors`} 
                        style={ 
                          pendingStyle 
                        } 
                      > 
                        <Circle 
                          size={12} 
                        /> 
 
                        {item.label} · 
                        +{item.weight}% 
                      </label> 
                    ); 
                  } 
 
                  return ( 
                    <Link 
                      key={item.key} 
                      to={ 
                        item.to ?? 
                        "/freelancer/edit-profile" 
                      } 
                      className={`${chipClass} hover:bg-slate-50 transition-colors`} 
                      style={ 
                        pendingStyle 
                      } 
                    > 
                      <Circle 
                        size={12} 
                      /> 
 
                      {item.label} · 
                      +{item.weight}% 
                    </Link> 
                  ); 
                } 
              )} 
            </div> 
          )} 
 
          {completionReady && 
            missingItems.length > 
              0 && ( 
              <p 
                className="text-[11px] mt-3" 
                style={{ 
                  color: 
                    "var(--muted-foreground)", 
                }} 
              > 
                Cliquez sur un élément 
                manquant pour le 
                compléter. 
              </p> 
            )} 
        </section> 
 
        {/* ================================================================ */} 
        {/* CONTENU                                                          */} 
        {/* ================================================================ */} 
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6"> 
 
          {/* ============================================================= */} 
          {/* COLONNE GAUCHE                                                */} 
          {/* ============================================================= */} 
 
          <div className="space-y-5"> 
 
            {/* Compétences */} 
            {skillList.length > 
              0 && ( 
              <section 
                className="p-5 rounded-2xl border bg-white" 
                style={{ 
                  borderColor: 
                    "var(--border)", 
                }} 
              > 
                <div className="flex items-center gap-2 mb-4"> 
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center" 
                    style={{ 
                      background: 
                        "var(--secondary)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Sparkles 
                      size={15} 
                    /> 
                  </div> 
 
                  <h2 
                    className="font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Compétences 
                  </h2> 
                </div> 
 
                <div className="flex flex-wrap gap-2"> 
                  {skillList.map( 
                    (skill) => ( 
                      <span 
                        key={skill} 
                        className="px-3 py-1.5 rounded-lg text-xs font-medium" 
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
              </section> 
            )} 
 
            {/* Langues */} 
            {languageList.length > 
              0 && ( 
              <section 
                className="p-5 rounded-2xl border bg-white" 
                style={{ 
                  borderColor: 
                    "var(--border)", 
                }} 
              > 
                <div className="flex items-center gap-2 mb-4"> 
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center" 
                    style={{ 
                      background: 
                        "var(--secondary)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Languages 
                      size={15} 
                    /> 
                  </div> 
 
                  <h2 
                    className="font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Langues 
                  </h2> 
                </div> 
 
                <div className="space-y-2"> 
                  {languageList.map( 
                    (language) => ( 
                      <div 
                        key={ 
                          language 
                        } 
                        className="flex items-center gap-2 text-sm" 
                        style={{ 
                          color: 
                            "var(--navy)", 
                        }} 
                      > 
                        <CheckCircle 
                          size={14} 
                          style={{ 
                            color: 
                              "#16A34A", 
                          }} 
                        /> 
 
                        {language} 
                      </div> 
                    ) 
                  )} 
                </div> 
              </section> 
            )} 
 
            {/* Certifications */} 
            <section 
              className="p-5 rounded-2xl border bg-white" 
              style={{ 
                borderColor: 
                  "var(--border)", 
              }} 
            > 
              <div className="flex items-center justify-between mb-4"> 
                <div className="flex items-center gap-2"> 
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center" 
                    style={{ 
                      background: 
                        "var(--secondary)", 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    <Award 
                      size={15} 
                    /> 
                  </div> 
 
                  <h2 
                    className="font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Certifications & 
                    diplômes 
                  </h2> 
                </div> 
 
                <Link 
                  to="/freelancer/certifications" 
                  className="text-xs font-medium" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  Voir tout 
                </Link> 
              </div> 
 
              {credentialPreview.length === 
              0 ? ( 
                <p 
                  className="text-xs leading-5" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  Aucune certification 
                  ni aucun diplôme 
                  pour le moment.{" "} 
                  <Link 
                    to="/freelancer/certifications" 
                    className="font-semibold underline" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Ajouter 
                  </Link> 
                </p> 
              ) : ( 
                <div className="space-y-3"> 
                  {credentialPreview.map( 
                    (item) => { 
                      const isDiploma = 
                        item.type === 
                        "DIPLOME"; 
 
                      return ( 
                        <div 
                          key={ 
                            item.id 
                          } 
                          className="flex items-center gap-3" 
                        > 
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" 
                            style={{ 
                              background: 
                                "var(--secondary)", 
                            }} 
                          > 
                            {isDiploma ? ( 
                              <GraduationCap 
                                size={ 
                                  15 
                                } 
                                style={{ 
                                  color: 
                                    "var(--navy)", 
                                }} 
                              /> 
                            ) : ( 
                              <Award 
                                size={ 
                                  15 
                                } 
                                style={{ 
                                  color: 
                                    "var(--navy)", 
                                }} 
                              /> 
                            )} 
                          </div> 
 
                          <div className="min-w-0 flex-1"> 
                            <p 
                              className="text-xs font-semibold truncate" 
                              style={{ 
                                color: 
                                  "var(--navy)", 
                              }} 
                              title={ 
                                item.nom 
                              } 
                            > 
                              {item.nom} 
                            </p> 
 
                            <p 
                              className="text-xs mt-0.5 truncate" 
                              style={{ 
                                color: 
                                  "var(--muted-foreground)", 
                              }} 
                            > 
                              { 
                                item.organisme 
                              } 
 
                              {yearOf( 
                                item.dateObtention 
                              ) && 
                                ` · ${yearOf( 
                                  item.dateObtention 
                                )}`} 
                            </p> 
                          </div> 
 
                          {item.status === 
                          "VALIDEE" ? ( 
                            <ShieldCheck 
                              size={ 
                                14 
                              } 
                              className="text-emerald-600 flex-shrink-0" 
                              aria-label="Certification validée" 
                            /> 
                          ) : ( 
                            <Clock 
                              size={ 
                                14 
                              } 
                              className="flex-shrink-0" 
                              style={{ 
                                color: 
                                  "#A16207", 
                              }} 
                              aria-label="En vérification" 
                            /> 
                          )} 
                        </div> 
                      ); 
                    } 
                  )} 
                </div> 
              )} 
            </section> 
 
            {/* Statistiques */} 
            <section 
              className="p-5 rounded-2xl border bg-white" 
              style={{ 
                borderColor: 
                  "var(--border)", 
              }} 
            > 
              <div className="flex items-center gap-2 mb-4"> 
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center" 
                  style={{ 
                    background: 
                      "var(--secondary)", 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  <TrendingUp 
                    size={15} 
                  /> 
                </div> 
 
                <h2 
                  className="font-semibold" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  Statistiques 
                </h2> 
              </div> 
 
              <div className="grid grid-cols-2 gap-3"> 
                {staticStats.map( 
                  (stat) => ( 
                    <div 
                      key={ 
                        stat.label 
                      } 
                      className="p-3 rounded-xl" 
                      style={{ 
                        background: 
                          "var(--secondary)", 
                      }} 
                    > 
                      <p 
                        className="text-xl font-bold" 
                        style={{ 
                          color: 
                            "var(--navy)", 
                        }} 
                      > 
                        {stat.value} 
                      </p> 
 
                      <p 
                        className="text-xs mt-0.5" 
                        style={{ 
                          color: 
                            "var(--muted-foreground)", 
                        }} 
                      > 
                        {stat.label} 
                      </p> 
                    </div> 
                  ) 
                )} 
              </div> 
            </section> 
          </div> 
 
          {/* ============================================================= */} 
          {/* COLONNE DROITE                                                */} 
          {/* ============================================================= */} 
 
          <div className="lg:col-span-2 space-y-5"> 
 
            {/* Portfolio */} 
            <section 
              className="p-5 rounded-2xl border bg-white" 
              style={{ 
                borderColor: 
                  "var(--border)", 
              }} 
            > 
              <div className="flex items-center justify-between mb-4"> 
                <div> 
                  <h2 
                    className="font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Portfolio récent 
                  </h2> 
 
                  <p 
                    className="text-xs mt-0.5" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    Vos réalisations 
                    principales 
                  </p> 
                </div> 
 
                <Link 
                  to="/freelancer/portfolio" 
                  className="flex items-center gap-1 text-xs font-medium" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  Voir tout 
 
                  <ExternalLink 
                    size={11} 
                  /> 
                </Link> 
              </div> 
 
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> 
                {staticPortfolio.map( 
                  (project) => { 
                    const Icon = 
                      project.icon; 
 
                    return ( 
                      <div 
                        key={ 
                          project.title 
                        } 
                        className="rounded-xl overflow-hidden border hover:shadow-md transition-shadow" 
                        style={{ 
                          borderColor: 
                            "var(--border)", 
                        }} 
                      > 
                        <div 
                          className="h-24 flex items-center justify-center" 
                          style={{ 
                            background: 
                              "var(--secondary)", 
                          }} 
                        > 
                          <Icon 
                            size={28} 
                            style={{ 
                              color: 
                                "var(--navy)", 
                            }} 
                          /> 
                        </div> 
 
                        <div className="p-3"> 
                          <p 
                            className="text-xs font-semibold truncate" 
                            style={{ 
                              color: 
                                "var(--navy)", 
                            }} 
                          > 
                            { 
                              project.title 
                            } 
                          </p> 
 
                          <p 
                            className="text-xs mt-0.5 truncate" 
                            style={{ 
                              color: 
                                "var(--muted-foreground)", 
                            }} 
                          > 
                            { 
                              project.tech 
                            } 
                          </p> 
                        </div> 
                      </div> 
                    ); 
                  } 
                )} 
              </div> 
            </section> 
 
            {/* Avis */} 
            <section 
              className="p-5 rounded-2xl border bg-white" 
              style={{ 
                borderColor: 
                  "var(--border)", 
              }} 
            > 
              <div className="flex items-center justify-between mb-4"> 
                <div> 
                  <h2 
                    className="font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    Avis clients 
                  </h2> 
 
                  <p 
                    className="text-xs mt-0.5" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    Retours sur vos 
                    collaborations 
                  </p> 
                </div> 
 
                <Link 
                  to="/freelancer/ratings" 
                  className="text-xs font-medium" 
                  style={{ 
                    color: 
                      "var(--navy)", 
                  }} 
                > 
                  Voir tout 
                </Link> 
              </div> 
 
              {/* Résumé */} 
              <div 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl mb-5" 
                style={{ 
                  background: 
                    "var(--secondary)", 
                }} 
              > 
                <div className="text-center min-w-[90px]"> 
                  <p 
                    className="text-4xl font-bold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    {noteMoyenne > 
                    0 
                      ? noteMoyenne.toFixed( 
                          1 
                        ) 
                      : "—"} 
                  </p> 
 
                  <div className="flex justify-center gap-0.5 mt-1"> 
                    {[1, 2, 3, 4, 5].map( 
                      (index) => ( 
                        <Star 
                          key={ 
                            index 
                          } 
                          size={13} 
                          fill={ 
                            index <= 
                            Math.round( 
                              noteMoyenne 
                            ) 
                              ? "var(--gold)" 
                              : "none" 
                          } 
                          style={{ 
                            color: 
                              "var(--gold)", 
                          }} 
                        /> 
                      ) 
                    )} 
                  </div> 
 
                  <p 
                    className="text-xs mt-1" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    {avis.length} avis 
                  </p> 
                </div> 
 
                <div className="flex-1 w-full space-y-1.5"> 
                  {distribution.map( 
                    ({ 
                      stars, 
                      pct, 
                    }) => ( 
                      <div 
                        key={ 
                          stars 
                        } 
                        className="flex items-center gap-2" 
                      > 
                        <span 
                          className="text-xs w-4" 
                          style={{ 
                            color: 
                              "var(--muted-foreground)", 
                          }} 
                        > 
                          {stars} 
                        </span> 
 
                        <div className="flex-1 h-1.5 rounded-full bg-white overflow-hidden"> 
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              background: 
                                "var(--gold)", 
                              width: `${pct}%`, 
                            }} 
                          /> 
                        </div> 
                      </div> 
                    ) 
                  )} 
                </div> 
              </div> 
 
              {/* Liste avis */} 
              {avisLoading ? ( 
                <p 
                  className="text-sm text-center py-4" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  Chargement des avis... 
                </p> 
              ) : avis.length === 
                0 ? ( 
                <p 
                  className="text-sm text-center py-4" 
                  style={{ 
                    color: 
                      "var(--muted-foreground)", 
                  }} 
                > 
                  Aucun avis pour le 
                  moment. 
                </p> 
              ) : ( 
                <div className="space-y-4"> 
                  {avis.map( 
                    ( 
                      review, 
                      i 
                    ) => ( 
                      <div 
                        key={i} 
                        className="border-b pb-4 last:border-0 last:pb-0" 
                        style={{ 
                          borderColor: 
                            "var(--border)", 
                        }} 
                      > 
                        <div className="flex items-start gap-3"> 
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" 
                            style={{ 
                              background: 
                                "var(--secondary)", 
                              color: 
                                "var(--navy)", 
                            }} 
                          > 
                            {initialesEntreprise( 
                              review.entrepriseNom 
                            )} 
                          </div> 
 
                          <div className="flex-1 min-w-0"> 
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"> 
                              <p 
                                className="text-sm font-semibold" 
                                style={{ 
                                  color: 
                                    "var(--navy)", 
                                }} 
                              > 
                                {review.entrepriseNom || 
                                  "Entreprise"} 
                              </p> 
 
                              <span 
                                className="text-xs" 
                                style={{ 
                                  color: 
                                    "var(--muted-foreground)", 
                                }} 
                              > 
                                {formatAvisDate( 
                                  review.date 
                                )} 
                              </span> 
                            </div> 
 
                            {review.projetTitre && ( 
                              <p 
                                className="text-xs mb-1.5" 
                                style={{ 
                                  color: 
                                    "var(--muted-foreground)", 
                                }} 
                              > 
                                { 
                                  review.projetTitre 
                                } 
                              </p> 
                            )} 
 
                            <div className="flex gap-0.5 mb-2"> 
                              {Array.from({ 
                                length: 
                                  review.note, 
                              }).map( 
                                ( 
                                  _, 
                                  index 
                                ) => ( 
                                  <Star 
                                    key={ 
                                      index 
                                    } 
                                    size={ 
                                      12 
                                    } 
                                    fill="var(--gold)" 
                                    style={{ 
                                      color: 
                                        "var(--gold)", 
                                    }} 
                                  /> 
                                ) 
                              )} 
                            </div> 
 
                            {review.commentaire && ( 
                              <p 
                                className="text-sm leading-5" 
                                style={{ 
                                  color: 
                                    "var(--foreground)", 
                                }} 
                              > 
                                { 
                                  review.commentaire 
                                } 
                              </p> 
                            )} 
                          </div> 
                        </div> 
                      </div> 
                    ) 
                  )} 
                </div> 
              )} 
            </section> 
 
            {/* ============================================================ */} 
            {/* BLOC CONFIANCE                                               */} 
            {/* ============================================================ */} 
 
            <section 
              className="rounded-2xl border p-4 sm:p-5" 
              style={{ 
                borderColor: 
                  "var(--border)", 
                background: 
                  "#F8FAFC", 
              }} 
            > 
              <div className="flex items-start gap-3"> 
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
                  style={{ 
                    background: 
                      "#FFFFFF", 
                    color: 
                      "#047857", 
                    border: 
                      "1px solid var(--border)", 
                  }} 
                > 
                  <ShieldCheck 
                    size={19} 
                  /> 
                </div> 
 
                <div> 
                  <p 
                    className="text-sm font-semibold" 
                    style={{ 
                      color: 
                        "var(--navy)", 
                    }} 
                  > 
                    {isCertified 
                      ? "Profil certifié" 
                      : "Renforcez votre crédibilité"} 
                  </p> 
 
                  <p 
                    className="text-xs leading-5 mt-1" 
                    style={{ 
                      color: 
                        "var(--muted-foreground)", 
                    }} 
                  > 
                    {isCertified 
                      ? "Au moins un justificatif de votre profil a été validé par l'équipe Free-Kaolo." 
                      : "Ajoutez et faites valider vos certifications ou diplômes pour obtenir le badge Certifié."} 
                  </p> 
 
                  {isCertified && ( 
                    <div className="mt-3"> 
                      <CertifiedBadge 
                        label="Certifié" 
                        size="md" 
                      /> 
                    </div> 
                  )} 
                </div> 
              </div> 
            </section> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}