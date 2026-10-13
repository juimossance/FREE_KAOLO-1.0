import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  ExternalLink,
  Upload,
  X,
  ShieldCheck,
  AlertCircle,
  CalendarDays,
  Building2,
  Fingerprint,
  FileCheck2,
  ChevronRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  certificationService,
  type CertificationItem,
  type CertificationFormData,
  type CertStatus,
  type CertType,
} from "../../../services/certificationservice";

// ── Configuration ───────────────────────────────────────────────────────────

const statusConfig: Record<
  CertStatus,
  {
    icon: React.ReactNode;
    bg: string;
    color: string;
    border: string;
    label: string;
  }
> = {
  VALIDEE: {
    icon: <CheckCircle2 size={14} />,
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
    label: "Vérifiée",
  },
  EN_ATTENTE: {
    icon: <Clock3 size={14} />,
    bg: "#FFFBEB",
    color: "#A16207",
    border: "#FDE68A",
    label: "En vérification",
  },
  REJETEE: {
    icon: <XCircle size={14} />,
    bg: "#FEF2F2",
    color: "#B91C1C",
    border: "#FECACA",
    label: "À corriger",
  },
};

// Catégories (certifications uniquement)
const categories = ["Toutes", "Cloud", "Frontend", "Backend", "DevOps", "Data", "Mobile"];

// Niveaux (diplômes uniquement) — stockés dans le champ `categorie`
const diplomaLevels = ["BTS / DUT", "Licence", "Master", "Ingénieur", "Doctorat", "Autre"];

const typeCopy: Record<
  CertType,
  {
    tab: string;
    singular: string;
    plural: string;
    add: string;
    modalResubmit: string;
    nameLabel: string;
    namePlaceholder: string;
    orgLabel: string;
    orgPlaceholder: string;
    levelLabel: string;
    idLabel: string;
    idPlaceholder: string;
    dateLabel: string;
    verified: string;
    emptyTitle: string;
    emptyText: string;
  }
> = {
  CERTIFICATION: {
    tab: "Certifications",
    singular: "certification",
    plural: "certifications",
    add: "Ajouter une certification",
    modalResubmit: "Resoumettre la certification",
    nameLabel: "Nom de la certification",
    namePlaceholder: "Ex. AWS Certified Cloud Practitioner",
    orgLabel: "Organisme",
    orgPlaceholder: "Amazon Web Services",
    levelLabel: "Catégorie",
    idLabel: "Identifiant de l'accréditation",
    idPlaceholder: "Identifiant unique du certificat",
    dateLabel: "Date d'obtention",
    verified: "Certifications vérifiées",
    emptyTitle: "Aucune certification ajoutée",
    emptyText: "Ajoutez vos certifications pour rassurer les entreprises sur vos compétences.",
  },
  DIPLOME: {
    tab: "Diplômes",
    singular: "diplôme",
    plural: "diplômes",
    add: "Ajouter un diplôme",
    modalResubmit: "Resoumettre le diplôme",
    nameLabel: "Intitulé du diplôme",
    namePlaceholder: "Ex. Licence en Génie logiciel",
    orgLabel: "Établissement",
    orgPlaceholder: "Institut Africain d'Informatique",
    levelLabel: "Niveau",
    idLabel: "Numéro du diplôme (optionnel)",
    idPlaceholder: "Numéro figurant sur le diplôme",
    dateLabel: "Date d'obtention",
    verified: "Diplômes vérifiés",
    emptyTitle: "Aucun diplôme ajouté",
    emptyText: "Ajoutez votre diplôme le plus élevé pour renforcer la crédibilité de votre profil.",
  },
};

const typeOf = (item: CertificationItem): CertType => item.type ?? "CERTIFICATION";

const defaultLevel = (type: CertType) => (type === "DIPLOME" ? diplomaLevels[1] : "Cloud");

const makeEmptyForm = (type: CertType): CertificationFormData => ({
  type,
  nom: "",
  organisme: "",
  credentialId: "",
  categorie: defaultLevel(type),
  dateObtention: "",
  dateExpiration: null,
  documentUrl: "",
});

function formatMonthYear(isoDate: string | null): string {
  if (!isoDate) return "Sans expiration";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-slate-200";

const inputStyle = {
  borderColor: "var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

// ── Page ────────────────────────────────────────────────────────────────────

export function Certifications() {
  const { user } = useAuth();
  const freelancerId = user?.freelancerId;

  const [certs, setCerts] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeType, setActiveType] = useState<CertType>("CERTIFICATION");
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [showModal, setShowModal] = useState(false);
  const [resubmitTarget, setResubmitTarget] = useState<CertificationItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<CertificationFormData>(makeEmptyForm("CERTIFICATION"));

  // Upload du document justificatif
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // ── Chargement ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!freelancerId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await certificationService.getAll(freelancerId);
        setCerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [freelancerId]);

  // ── Filtrage & compteurs ─────────────────────────────────────────────────

  const certificationCount = certs.filter((c) => typeOf(c) === "CERTIFICATION").length;
  const diplomaCount = certs.filter((c) => typeOf(c) === "DIPLOME").length;

  const ofType = useMemo(() => certs.filter((c) => typeOf(c) === activeType), [certs, activeType]);

  const filtered = useMemo(() => {
    if (activeType !== "CERTIFICATION" || activeCategory === "Toutes") return ofType;
    return ofType.filter((cert) => cert.categorie === activeCategory);
  }, [ofType, activeType, activeCategory]);

  // Les compteurs suivent l'onglet actif
  const validatedCount = ofType.filter((c) => c.status === "VALIDEE").length;
  const pendingCount = ofType.filter((c) => c.status === "EN_ATTENTE").length;
  const rejectedCount = ofType.filter((c) => c.status === "REJETEE").length;

  const copy = typeCopy[activeType];
  const formCopy = typeCopy[form.type];

  const switchType = (type: CertType) => {
    setActiveType(type);
    setActiveCategory("Toutes");
  };

  // ── Modal : ouverture ────────────────────────────────────────────────────

  const openAdd = () => {
    setResubmitTarget(null);
    setForm(makeEmptyForm(activeType));
    setFormError(null);
    setDocError(null);
    setShowModal(true);
  };

  const openResubmit = (cert: CertificationItem) => {
    setResubmitTarget(cert);
    setForm({
      type: typeOf(cert),
      nom: cert.nom,
      organisme: cert.organisme,
      credentialId: cert.credentialId,
      categorie: cert.categorie,
      dateObtention: cert.dateObtention,
      dateExpiration: cert.dateExpiration,
      // Le document doit être réuploadé — celui qui a été rejeté n'est pas réutilisé
      documentUrl: "",
    });
    setFormError(null);
    setDocError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setResubmitTarget(null);
  };

  // Changement de type dans la modale (uniquement à l'ajout)
  const changeFormType = (type: CertType) => {
    setForm((f) => ({
      ...f,
      type,
      categorie: defaultLevel(type),
      dateExpiration: type === "DIPLOME" ? null : f.dateExpiration,
    }));
  };

  // ── Upload du justificatif ───────────────────────────────────────────────

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setDocError(null);

    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setDocError("Format non supporté. Utilise un PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError("Le fichier dépasse 10 Mo. Choisis un fichier plus léger.");
      return;
    }

    setUploadingDoc(true);
    try {
      const { url } = await certificationService.uploadDocument(file);
      setForm((f) => ({ ...f, documentUrl: url }));
    } catch (err) {
      console.error("Erreur upload document:", err);
      setDocError("L'envoi du document a échoué. Réessaie.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDoc = () => {
    setForm((f) => ({ ...f, documentUrl: "" }));
    setDocError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Soumission ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.organisme.trim() || !form.dateObtention || !form.documentUrl) {
      setFormError("Merci de remplir les champs obligatoires et de joindre un justificatif.");
      return;
    }
    if (!freelancerId) return;

    // Un diplôme n'expire pas
    const payload: CertificationFormData = {
      ...form,
      dateExpiration: form.type === "DIPLOME" ? null : form.dateExpiration,
    };

    setSaving(true);
    setFormError(null);
    try {
      if (resubmitTarget) {
        const updated = await certificationService.resubmit(resubmitTarget.id, payload);
        const withType = { ...updated, type: updated.type ?? payload.type };
        setCerts((prev) => prev.map((c) => (c.id === resubmitTarget.id ? withType : c)));
      } else {
        const created = await certificationService.create(freelancerId, payload);
        const withType = { ...created, type: created.type ?? payload.type };
        setCerts((prev) => [withType, ...prev]);
        // On affiche l'onglet où l'élément vient d'être ajouté
        setActiveType(payload.type);
        setActiveCategory("Toutes");
      }
      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      setFormError("La soumission a échoué. Réessaie dans un instant.");
    } finally {
      setSaving(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--navy)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--secondary)", color: "var(--gold)" }}
              >
                <Award size={19} />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                Profil professionnel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--navy)" }}>
              Certifications & diplômes
            </h1>
            <p className="mt-1 text-sm leading-6 max-w-xl" style={{ color: "var(--muted-foreground)" }}>
              Gérez vos certifications et vos diplômes, et permettez aux entreprises de vérifier facilement vos compétences.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
            style={{ background: "var(--navy)", color: "#FFFFFF" }}
          >
            <Plus size={17} />
            {copy.add}
          </button>
        </header>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: "var(--destructive)", background: "#FEF2F2" }}>
            <AlertCircle size={18} style={{ color: "var(--destructive)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--destructive)" }}>{error}</p>
          </div>
        )}

        {/* TRUST BANNER */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border"
          style={{ background: "#F8FAFC", borderColor: "var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#ECFDF5", color: "#047857" }}
          >
            <ShieldCheck size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
              Vos certifications et diplômes renforcent votre profil
            </p>
            <p className="text-xs mt-0.5 leading-5" style={{ color: "var(--muted-foreground)" }}>
              Les éléments validés sont identifiés comme vérifiés auprès des entreprises.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#047857" }}>
            <CheckCircle2 size={14} />
            Vérification active
          </div>
        </div>

        {/* ONGLETS TYPE */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl sm:inline-grid sm:w-auto" style={{ background: "#E2E8F0" }}>
          {(["CERTIFICATION", "DIPLOME"] as CertType[]).map((type) => {
            const active = activeType === type;
            const count = type === "CERTIFICATION" ? certificationCount : diplomaCount;
            return (
              <button
                key={type}
                onClick={() => switchType(type)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "var(--navy)" : "var(--muted-foreground)",
                  boxShadow: active ? "0 1px 3px rgba(15, 23, 42, 0.1)" : "none",
                }}
              >
                {type === "DIPLOME" ? <GraduationCap size={16} /> : <Award size={16} />}
                {typeCopy[type].tab}
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{ background: active ? "var(--secondary)" : "#F1F5F9" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard icon={<CheckCircle2 size={18} />} label={copy.verified} value={validatedCount} bg="#ECFDF5" color="#047857" />
          <StatCard icon={<Clock3 size={18} />} label="En cours de vérification" value={pendingCount} bg="#FFFBEB" color="#A16207" />
          <StatCard icon={<AlertCircle size={18} />} label="À corriger" value={rejectedCount} bg="#FEF2F2" color="#B91C1C" />
        </div>

        {/* FILTER */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
                {activeType === "DIPLOME" ? "Mes diplômes" : "Mes certifications"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {filtered.length} {filtered.length > 1 ? copy.plural : copy.singular}
              </p>
            </div>
          </div>

          {activeType === "CERTIFICATION" && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all"
                    style={{
                      background: active ? "var(--navy)" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "var(--muted-foreground)",
                      borderColor: active ? "var(--navy)" : "var(--border)",
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* LISTE */}
        <div className="space-y-3">
          {filtered.length === 0 && <EmptyState type={activeType} hasItems={ofType.length > 0} />}
          {filtered.map((cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              status={statusConfig[cert.status]}
              onResubmit={() => openResubmit(cert)}
            />
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full sm:max-w-xl max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--gold)" }}>
                  {form.type === "DIPLOME" ? <GraduationCap size={18} /> : <Award size={18} />}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "var(--navy)" }}>
                    {resubmitTarget ? formCopy.modalResubmit : formCopy.add}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Soumettez vos justificatifs pour vérification.
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Fermer">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Choix du type (uniquement à l'ajout) */}
              {!resubmitTarget && (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl" style={{ background: "#F1F5F9" }}>
                  {(["CERTIFICATION", "DIPLOME"] as CertType[]).map((type) => {
                    const active = form.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => changeFormType(type)}
                        className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: active ? "#FFFFFF" : "transparent",
                          color: active ? "var(--navy)" : "var(--muted-foreground)",
                          boxShadow: active ? "0 1px 2px rgba(15, 23, 42, 0.08)" : "none",
                        }}
                      >
                        {type === "DIPLOME" ? <GraduationCap size={14} /> : <Award size={14} />}
                        {typeCopy[type].singular.charAt(0).toUpperCase() + typeCopy[type].singular.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>{formCopy.nameLabel}</label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder={formCopy.namePlaceholder}
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>{formCopy.orgLabel}</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className={`${inputClass} pl-10`}
                      style={inputStyle}
                      placeholder={formCopy.orgPlaceholder}
                      value={form.organisme}
                      onChange={(e) => setForm((f) => ({ ...f, organisme: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>{formCopy.levelLabel}</label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.categorie}
                    onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
                  >
                    {(form.type === "DIPLOME" ? diplomaLevels : categories.filter((c) => c !== "Toutes")).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>{formCopy.idLabel}</label>
                <div className="relative">
                  <Fingerprint size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    style={inputStyle}
                    placeholder={formCopy.idPlaceholder}
                    value={form.credentialId}
                    onChange={(e) => setForm((f) => ({ ...f, credentialId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>{formCopy.dateLabel}</label>
                  <div className="relative">
                    <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      className={`${inputClass} pl-10`}
                      style={inputStyle}
                      value={form.dateObtention}
                      onChange={(e) => setForm((f) => ({ ...f, dateObtention: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Un diplôme n'a pas de date d'expiration */}
                {form.type === "CERTIFICATION" && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>Date d'expiration</label>
                    <div className="relative">
                      <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        className={`${inputClass} pl-10`}
                        style={inputStyle}
                        value={form.dateExpiration ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, dateExpiration: e.target.value || null }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload du justificatif */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>
                  Document justificatif
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {form.documentUrl ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                        <FileCheck2 size={18} />
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: "var(--navy)" }}>Document joint</p>
                    </div>
                    <button type="button" onClick={handleRemoveDoc} className="p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0" aria-label="Retirer le document">
                      <X size={16} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files?.[0]); }}
                    className="group border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:bg-slate-50"
                    style={{ borderColor: dragActive ? "var(--navy)" : "var(--border)", background: dragActive ? "var(--secondary)" : undefined }}
                  >
                    {uploadingDoc ? (
                      <>
                        <Loader2 size={21} className="mx-auto mb-2 animate-spin" style={{ color: "var(--navy)" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>Envoi en cours...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                          <Upload size={21} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>Importer le justificatif</p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>PDF, JPG ou PNG · 10 Mo maximum</p>
                      </>
                    )}
                  </div>
                )}

                {docError && (
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium" style={{ color: "var(--destructive)" }}>
                    <AlertCircle size={13} />
                    {docError}
                  </div>
                )}
              </div>

              {/* Message de confiance */}
              <div className="flex gap-3 p-4 rounded-2xl border" style={{ background: "#F8FAFC", borderColor: "var(--border)" }}>
                <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                <p className="text-xs leading-5" style={{ color: "var(--muted-foreground)" }}>
                  Votre document sera utilisé uniquement pour vérifier l'authenticité de votre {formCopy.singular}. Après soumission,
                  son statut passera à{" "}
                  <strong style={{ color: "var(--navy)" }}>En vérification</strong>.
                </p>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--destructive)" }}>
                  <AlertCircle size={13} />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                  style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || uploadingDoc}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--navy)", color: "#FFFFFF", opacity: saving || uploadingDoc ? 0.7 : 1 }}
                >
                  {saving ? (
                    <><Loader2 size={14} className="animate-spin" /> Envoi...</>
                  ) : resubmitTarget ? (
                    "Resoumettre"
                  ) : (
                    "Soumettre pour validation"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── STAT CARD ───────────────────────────────────────────────────────── */

function StatCard({ icon, label, value, bg, color }: { icon: React.ReactNode; label: string; value: number; bg: string; color: string }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border bg-white flex items-center gap-4 transition-all hover:shadow-sm" style={{ borderColor: "var(--border)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{value}</p>
        <p className="text-xs font-medium truncate" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      </div>
    </div>
  );
}

/* ── CERTIFICATION / DIPLÔME CARD ────────────────────────────────────── */

function CertificationCard({
  cert,
  status,
  onResubmit,
}: {
  cert: CertificationItem;
  status: { icon: React.ReactNode; bg: string; color: string; border: string; label: string };
  onResubmit: () => void;
}) {
  const isDiploma = typeOf(cert) === "DIPLOME";
  const copy = typeCopy[typeOf(cert)];

  return (
    <article className="group bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--secondary)", color: "var(--gold)" }}>
          {isDiploma ? <GraduationCap size={22} /> : <Award size={22} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--navy)" }}>{cert.nom}</h3>
                  {cert.status === "VALIDEE" && (
                    <span title={`${copy.singular.charAt(0).toUpperCase() + copy.singular.slice(1)} vérifié(e)`} aria-label="Vérifié">
                      <ShieldCheck size={15} className="text-emerald-600" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  <Building2 size={14} />
                  {cert.organisme}
                </div>
              </div>

              <span
                className="self-start inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border"
                style={{ background: status.bg, color: status.color, borderColor: status.border }}
              >
                {status.icon}
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetaItem icon={<CalendarDays size={13} />} label="Obtenu" value={formatMonthYear(cert.dateObtention)} />
              {!isDiploma && (
                <MetaItem icon={<CalendarDays size={13} />} label="Expiration" value={formatMonthYear(cert.dateExpiration)} />
              )}
              {cert.credentialId && (
                <MetaItem icon={<Fingerprint size={13} />} label="Identifiant" value={cert.credentialId} mono />
              )}
              <MetaItem
                icon={isDiploma ? <GraduationCap size={13} /> : <Award size={13} />}
                label={copy.levelLabel}
                value={cert.categorie}
              />
            </div>

            {cert.status === "REJETEE" && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Justificatif à corriger</p>
                  <p className="text-xs mt-0.5 leading-5">
                    {cert.motifRejet ?? "Le document fourni n'est pas suffisamment lisible. Veuillez transmettre une version de meilleure qualité."}
                  </p>
                </div>
              </div>
            )}

            {cert.status === "EN_ATTENTE" && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#854D0E" }}>
                <Clock3 size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Vérification en cours</p>
                  <p className="text-xs mt-0.5 leading-5">
                    Notre équipe vérifie actuellement ce document. Le délai indicatif est de 24 à 48 heures ouvrées.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {cert.status !== "REJETEE" && cert.documentUrl && (
                <a
                  href={cert.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                >
                  <FileCheck2 size={14} />
                  Voir le justificatif
                  <ExternalLink size={12} />
                </a>
              )}

              {cert.status === "REJETEE" && (
                <button
                  onClick={onResubmit}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "var(--navy)", color: "#FFFFFF" }}
                >
                  <Upload size={14} />
                  Resoumettre
                </button>
              )}

              <button className="inline-flex items-center gap-1 text-xs font-medium ml-auto" style={{ color: "var(--muted-foreground)" }}>
                Détails
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── META ITEM ───────────────────────────────────────────────────────── */

function MetaItem({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 p-2.5 rounded-xl" style={{ background: "#F8FAFC" }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {icon}
        {label}
      </div>
      <p className={`mt-1 text-xs font-semibold truncate ${mono ? "font-mono" : ""}`} style={{ color: "var(--navy)" }} title={value}>
        {value}
      </p>
    </div>
  );
}

/* ── EMPTY STATE ─────────────────────────────────────────────────────── */

function EmptyState({ type, hasItems }: { type: CertType; hasItems: boolean }) {
  const copy = typeCopy[type];
  return (
    <div className="bg-white border rounded-2xl p-10 text-center" style={{ borderColor: "var(--border)" }}>
      <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "var(--secondary)", color: "var(--gold)" }}>
        {type === "DIPLOME" ? <GraduationCap size={22} /> : <Award size={22} />}
      </div>
      <h3 className="mt-4 font-semibold" style={{ color: "var(--navy)" }}>
        {hasItems ? "Aucun résultat" : copy.emptyTitle}
      </h3>
      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        {hasItems ? "Aucun résultat ne correspond à ce filtre." : copy.emptyText}
      </p>
    </div>
  );
}