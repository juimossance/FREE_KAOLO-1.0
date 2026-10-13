import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  freelancerServices,
  FreelancerProfil,
} from "../../../services/freelancerservices";
import {
  Save,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  User,
  Briefcase,
  Award,
  Link2,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  CalendarClock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  PlusCircle,
} from "lucide-react";
import { portfolioService } from "../../../services/portfolioService";

// -----------------------------------------------------------------------------
// Liste des compétences proposées
// -----------------------------------------------------------------------------

const availableSkills = [
  "React",
  "Vue.js",
  "Angular",
  "TypeScript",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "PHP",
  "Laravel",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Figma",
  "Adobe XD",
  "GraphQL",
  "Spring Boot",
  "Java",
  "C#",
  ".NET",
  "Flutter",
  "Dart",
  "Android",
  "Kotlin",
  "Swift",
  "WordPress",
  "UI/UX Design",
  "Photoshop",
  "Illustrator",
  "Premiere Pro",
  "After Effects",
  "Git",
  "GitHub",
  "GitLab",
  "Jenkins",
  "Linux",
  "Firebase",
  "Supabase",
  "REST API",
  "Spring Security",
  "JPA / Hibernate",
  "Tailwind CSS",
  "Bootstrap",
  "Sass",
  "Next.js",
  "Nuxt.js",
  "NestJS",
  "Express.js",
  "FastAPI",
  "Flask",
  "Machine Learning",
  "Intelligence artificielle",
  "Cybersécurité",
  "DevOps",
  "Data Science",
];

// -----------------------------------------------------------------------------
// Contraintes photo
// -----------------------------------------------------------------------------

const PHOTO_MAX_SIZE = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png"];

// -----------------------------------------------------------------------------
// Interface expérience
// -----------------------------------------------------------------------------

interface Experience {
  id: number;
  title: string;
  company: string;
  from: string;
  to: string;
  current: boolean;
}

// -----------------------------------------------------------------------------
// Section Card
// -----------------------------------------------------------------------------

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border bg-white overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="flex items-center justify-between gap-3 px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{
              background: "var(--secondary)",
              color: "var(--navy)",
            }}
          >
            <Icon size={17} />
          </span>

          <div>
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--navy)" }}
            >
              {title}
            </h3>

            {subtitle && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Label
// -----------------------------------------------------------------------------

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="block text-sm font-medium mb-1.5"
      style={{ color: "var(--navy)" }}
    >
      {children}

      {required && <span style={{ color: "var(--gold)" }}> *</span>}
    </label>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export function EditProfile() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [form, setForm] = useState<Partial<FreelancerProfil>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // COMPÉTENCES
  // ---------------------------------------------------------------------------

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [customSkill, setCustomSkill] = useState("");

  const [skillError, setSkillError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // EXPÉRIENCES
  // ---------------------------------------------------------------------------

  const [experiences, setExperiences] = useState<Experience[]>([]);

  // ---------------------------------------------------------------------------
  // PHOTO
  // ---------------------------------------------------------------------------

  const photoInputRef = useRef<HTMLInputElement>(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [photoError, setPhotoError] = useState<string | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ===========================================================================
  // CHARGEMENT DU PROFIL
  // ===========================================================================

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await freelancerServices.getProfil(userId);

        setForm(data);

        // ---------------------------------------------------------------------
        // On récupère les compétences existantes
        //
        // Important :
        // même si une compétence n'existe pas dans availableSkills,
        // elle sera conservée et affichée.
        // ---------------------------------------------------------------------

        if (Array.isArray(data.competence)) {
          const normalizedSkills = data.competence
            .filter(
              (skill): skill is string =>
                typeof skill === "string" && skill.trim().length > 0
            )
            .map((skill) => skill.trim());

          setSelectedSkills([...new Set(normalizedSkills)]);
        } else {
          setSelectedSkills([]);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // ===========================================================================
  // LIBÉRATION PHOTO PREVIEW
  // ===========================================================================

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ===========================================================================
  // SAUVEGARDE
  // ===========================================================================

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      const payload = {
        ...form,

        // Les compétences sont envoyées comme List<String>
        competence: selectedSkills,
      };

      console.log("Payload envoyé :", payload);

      await freelancerServices.updateProfil(userId, payload);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ===========================================================================
  // CHANGEMENT CHAMP
  // ===========================================================================

  const handleChange = (
    field: keyof FreelancerProfil,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ===========================================================================
  // PHOTO
  // ===========================================================================

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !userId) return;

    setPhotoError(null);

    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError(
        "Format non supporté. Utilisez une image JPG ou PNG."
      );
      return;
    }

    if (file.size > PHOTO_MAX_SIZE) {
      setPhotoError(
        "La photo dépasse 2 Mo. Choisissez une image plus légère."
      );
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));

    try {
      setUploadingPhoto(true);

      const { url } = await portfolioService.uploadImage(file);

      handleChange("photoUrl", url);
    } catch (err) {
      console.error("Erreur upload photo :", err);

      setPhotoError(
        "L'envoi de la photo a échoué. Réessayez."
      );

      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoError(null);

    handleChange("photoUrl", "");
  };

  const displayedPhoto =
    photoPreview ?? form.photoUrl ?? "";

  // ===========================================================================
  // COMPÉTENCES
  // ===========================================================================

  /**
   * Ajoute une compétence.
   *
   * Exemple :
   * utilisateur écrit "Spring Security"
   * ↓
   * clique sur Ajouter
   * ↓
   * ["Java", "Spring Boot", "Spring Security"]
   */

  const addCustomSkill = () => {
    const skill = customSkill.trim();

    setSkillError(null);

    if (!skill) {
      setSkillError("Veuillez saisir une compétence.");
      return;
    }

    // Minimum 2 caractères
    if (skill.length < 2) {
      setSkillError(
        "La compétence doit contenir au moins 2 caractères."
      );
      return;
    }

    // Vérifie si elle existe déjà
    const alreadyExists = selectedSkills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillError("Cette compétence est déjà ajoutée.");
      return;
    }

    setSelectedSkills((prev) => [...prev, skill]);

    setCustomSkill("");
  };

  /**
   * Permet d'ajouter la compétence avec la touche Entrée.
   */
  const handleCustomSkillKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomSkill();
    }
  };

  /**
   * Supprime une compétence.
   */
  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills((prev) =>
      prev.filter(
        (skill) =>
          skill.toLowerCase() !==
          skillToRemove.toLowerCase()
      )
    );
  };

  /**
   * Active/désactive une compétence proposée.
   */
  const toggleSkill = (skill: string) => {
    setSkillError(null);

    const exists = selectedSkills.some(
      (selectedSkill) =>
        selectedSkill.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      removeSkill(skill);
    } else {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  // ===========================================================================
  // EXPÉRIENCES
  // ===========================================================================

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now(),
      title: "",
      company: "",
      from: "",
      to: "",
      current: false,
    };

    setExperiences((prev) => [...prev, newExp]);
  };

  const removeExperience = (id: number) => {
    setExperiences((prev) =>
      prev.filter((exp) => exp.id !== id)
    );
  };

  const updateExperience = (
    id: number,
    field: keyof Experience,
    value: any
  ) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              [field]: value,
            }
          : exp
      )
    );
  };

  // ===========================================================================
  // LOADING
  // ===========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  // ===========================================================================
  // STYLES
  // ===========================================================================

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:ring-2 focus:ring-offset-0";

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
  } as React.CSSProperties;

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="max-w-4xl mx-auto">

      {/* =====================================================================
          HEADER
      ===================================================================== */}

      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6 flex items-center justify-between backdrop-blur border-b"
        style={{
          background:
            "color-mix(in srgb, var(--background, #fff) 88%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div>
          <div className="flex items-center gap-2">

            <h2
              className="text-xl font-bold"
              style={{ color: "var(--navy)" }}
            >
              Modifier le profil
            </h2>

            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                background: "#ECFDF5",
                color: "#047857",
              }}
            >
              <ShieldCheck size={12} />
              Vérifié par notre équipe
            </span>
          </div>

          <p
            className="text-sm mt-0.5"
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            Toute modification est revue avant publication
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploadingPhoto}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
          style={{
            background: saved
              ? "var(--success)"
              : "var(--navy)",
            color: "#FFF",
            opacity:
              saving || uploadingPhoto ? 0.7 : 1,
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} />
              Enregistré
            </>
          ) : saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save size={15} />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <div className="space-y-6 pb-24">

        {/* ===================================================================
            ERREUR GÉNÉRALE
        =================================================================== */}

        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium"
            style={{
              background: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#B91C1C",
            }}
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ===================================================================
            PHOTO
        =================================================================== */}

        <SectionCard
          icon={Camera}
          title="Photo de profil"
          subtitle="Un visage humain renforce la confiance des clients"
        >
          <div className="flex items-center gap-5">

            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ring-4 overflow-hidden shrink-0"
              style={{
                background: "var(--gold)",
                color: "var(--navy)",
                ["--tw-ring-color" as any]:
                  "var(--secondary)",
              }}
            >
              {displayedPhoto ? (
                <img
                  src={displayedPhoto}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {form.prenom?.[0] || "?"}
                  {form.nom?.[0] || "?"}
                </>
              )}

              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <Loader2
                    size={20}
                    className="animate-spin text-white"
                  />
                </div>
              )}
            </div>

            <div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handlePhotoChange}
              />

              <div className="flex flex-wrap items-center gap-2 mb-2">

                <button
                  type="button"
                  onClick={() =>
                    photoInputRef.current?.click()
                  }
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-[var(--secondary)] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--navy)",
                  }}
                >
                  <Upload size={14} />

                  {displayedPhoto
                    ? "Changer la photo"
                    : "Télécharger une photo"}
                </button>

                {displayedPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-red-50 disabled:opacity-60"
                    style={{
                      borderColor: "#FECACA",
                      color: "#B91C1C",
                    }}
                  >
                    <Trash2 size={14} />
                    Retirer
                  </button>
                )}
              </div>

              <p
                className="text-xs"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                JPG, PNG · Max 2 Mo · Recommandé 400×400 px
              </p>

              {photoError && (
                <div
                  className="flex items-center gap-1.5 mt-2 text-xs font-medium"
                  style={{ color: "#B91C1C" }}
                >
                  <AlertCircle size={13} />
                  {photoError}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ===================================================================
            INFORMATIONS PERSONNELLES
        =================================================================== */}

        <SectionCard
          icon={User}
          title="Informations personnelles"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <FieldLabel required>
                Prénom
              </FieldLabel>

              <input
                className={inputClass}
                style={inputStyle}
                value={form.prenom || ""}
                onChange={(e) =>
                  handleChange(
                    "prenom",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <FieldLabel required>
                Nom
              </FieldLabel>

              <input
                className={inputClass}
                style={inputStyle}
                value={form.nom || ""}
                onChange={(e) =>
                  handleChange(
                    "nom",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <FieldLabel required>
                Email
              </FieldLabel>

              <div className="relative">

                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                />

                <input
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    paddingLeft: "2.25rem",
                  }}
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div>
              <FieldLabel>
                Téléphone
              </FieldLabel>

              <div className="relative">

                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                />

                <input
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    paddingLeft: "2.25rem",
                  }}
                  value={form.phone || ""}
                  onChange={(e) =>
                    handleChange(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div>
              <FieldLabel>
                Ville
              </FieldLabel>

              <div className="relative">

                <MapPin
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                />

                <input
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    paddingLeft: "2.25rem",
                  }}
                  value={form.ville || ""}
                  onChange={(e) =>
                    handleChange(
                      "ville",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div>
              <FieldLabel>
                Pays
              </FieldLabel>

              <input
                className={inputClass}
                style={inputStyle}
                value={form.pays || ""}
                onChange={(e) =>
                  handleChange(
                    "pays",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <FieldLabel>
                Disponibilité
              </FieldLabel>

              <select
                className={inputClass}
                style={inputStyle}
                value={form.disponibilite || ""}
                onChange={(e) =>
                  handleChange(
                    "disponibilite",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Sélectionnez
                </option>

                <option value="Disponible">
                  Disponible
                </option>

                <option value="Partiellement disponible">
                  Partiellement disponible
                </option>

                <option value="Indisponible">
                  Indisponible
                </option>
              </select>
            </div>

            <div>
              <FieldLabel>
                Langues
              </FieldLabel>

              <input
                className={inputClass}
                style={inputStyle}
                placeholder="ex : Français, Anglais"
                value={form.langues || ""}
                onChange={(e) =>
                  handleChange(
                    "langues",
                    e.target.value
                  )
                }
              />
            </div>

          </div>
        </SectionCard>

        {/* ===================================================================
            INFORMATIONS PROFESSIONNELLES
        =================================================================== */}

        <SectionCard
          icon={Briefcase}
          title="Informations professionnelles"
        >
          <div className="space-y-4">

            <div>
              <FieldLabel required>
                Spécialité principale
              </FieldLabel>

              <input
                className={inputClass}
                style={inputStyle}
                value={form.specialite || ""}
                onChange={(e) =>
                  handleChange(
                    "specialite",
                    e.target.value
                  )
                }
                placeholder="ex : Développeur Full-Stack"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <FieldLabel>
                  Expérience (années)
                </FieldLabel>

                <input
                  className={inputClass}
                  style={inputStyle}
                  type="text"
                  value={form.experience || ""}
                  onChange={(e) =>
                    handleChange(
                      "experience",
                      e.target.value
                    )
                  }
                  placeholder="ex : 5 ans"
                />
              </div>

              <div>
                <FieldLabel>
                  Tarif journalier (FCFA)
                </FieldLabel>

                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  value={
                    form.tarifJournalier ?? ""
                  }
                  onChange={(e) =>
                    handleChange(
                      "tarifJournalier",
                      e.target.value
                        ? parseFloat(
                            e.target.value
                          )
                        : undefined
                    )
                  }
                />
              </div>

            </div>

            <div>
              <FieldLabel>
                Bio professionnelle
              </FieldLabel>

              <textarea
                className={inputClass}
                style={inputStyle}
                rows={4}
                value={form.description || ""}
                onChange={(e) =>
                  handleChange(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Décrivez votre expertise, vos réalisations et ce qui vous distingue..."
              />

              <p
                className="text-xs mt-1.5"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Visible publiquement sur votre
                profil ·{" "}
                {form.description?.length || 0}{" "}
                caractères
              </p>
            </div>

          </div>
        </SectionCard>

        {/* ===================================================================
            COMPÉTENCES
        =================================================================== */}

        <SectionCard
          icon={Award}
          title="Compétences"
          subtitle="Ajoutez les technologies et compétences que vous maîtrisez"
          action={
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: "var(--secondary)",
                color: "var(--navy)",
              }}
            >
              {selectedSkills.length} compétence
              {selectedSkills.length > 1 ? "s" : ""}
            </span>
          }
        >

          {/* ================================================================
              COMPÉTENCES ACTUELLEMENT SÉLECTIONNÉES
          ================================================================ */}

          {selectedSkills.length > 0 && (
            <div className="mb-6">

              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Mes compétences
              </p>

              <div className="flex flex-wrap gap-2">

                {selectedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background:
                        "var(--navy)",
                      color: "#FFF",
                    }}
                  >
                    <CheckCircle2 size={12} />

                    <span>{skill}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(skill)
                      }
                      className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                      aria-label={`Supprimer ${skill}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* ================================================================
              AJOUT MANUEL
          ================================================================ */}

          <div
            className="rounded-xl border p-4 mb-6"
            style={{
              borderColor: "var(--border)",
              background:
                "var(--secondary)",
            }}
          >

            <div className="flex items-center gap-2 mb-2">

              <PlusCircle
                size={17}
                style={{
                  color: "var(--gold)",
                }}
              />

              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--navy)",
                }}
              >
                Vous ne trouvez pas votre
                compétence ?
              </p>

            </div>

            <p
              className="text-xs mb-3"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Écrivez votre compétence ci-dessous
              pour l'ajouter à votre profil.
            </p>

            <div className="flex gap-2">

              <input
                className={inputClass}
                style={inputStyle}
                value={customSkill}
                onChange={(e) => {
                  setCustomSkill(e.target.value);
                  setSkillError(null);
                }}
                onKeyDown={
                  handleCustomSkillKeyDown
                }
                placeholder="Ex : Spring Security, Flutter, Photoshop..."
              />

              <button
                type="button"
                onClick={addCustomSkill}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                style={{
                  background:
                    "var(--navy)",
                  color: "#FFF",
                }}
              >
                <Plus size={15} />
                Ajouter
              </button>
            </div>

            {skillError && (
              <div
                className="flex items-center gap-1.5 mt-2 text-xs font-medium"
                style={{
                  color: "#B91C1C",
                }}
              >
                <AlertCircle size={13} />
                {skillError}
              </div>
            )}
          </div>

          {/* ================================================================
              COMPÉTENCES PROPOSÉES
          ================================================================ */}

          <div>

            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Compétences proposées
            </p>

            <div className="flex flex-wrap gap-2">

              {availableSkills.map((skill) => {

                const active =
                  selectedSkills.some(
                    (selectedSkill) =>
                      selectedSkill.toLowerCase() ===
                      skill.toLowerCase()
                  );

                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      toggleSkill(skill)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                    style={{
                      background: active
                        ? "var(--navy)"
                        : "transparent",

                      color: active
                        ? "#FFF"
                        : "var(--muted-foreground)",

                      borderColor: active
                        ? "var(--navy)"
                        : "var(--border)",
                    }}
                  >
                    {active && (
                      <CheckCircle2 size={12} />
                    )}

                    {skill}
                  </button>
                );
              })}

            </div>
          </div>

          {/* ================================================================
              INFORMATION
          ================================================================ */}

          <div
            className="mt-5 flex items-start gap-2 px-3 py-2.5 rounded-lg"
            style={{
              background: "#F8FAFC",
              border:
                "1px solid var(--border)",
            }}
          >
            <AlertCircle
              size={14}
              className="shrink-0 mt-0.5"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            />

            <p
              className="text-xs leading-relaxed"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Ajoutez uniquement les compétences
              que vous maîtrisez réellement.
              Elles seront utilisées par le système
              de recommandation pour vous proposer
              des missions correspondant à votre
              profil.
            </p>
          </div>

        </SectionCard>

        {/* ===================================================================
            EXPÉRIENCES
        =================================================================== */}

        <SectionCard
          icon={CalendarClock}
          title="Expériences professionnelles"
          action={
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                color: "var(--gold)",
              }}
            >
              <Plus size={15} />
              Ajouter
            </button>
          }
        >

          {experiences.length === 0 ? (

            <div
              className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-dashed"
              style={{
                borderColor:
                  "var(--border)",
              }}
            >

              <CalendarClock
                size={22}
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
                className="mb-2"
              />

              <p
                className="text-sm font-medium"
                style={{
                  color: "var(--navy)",
                }}
              >
                Aucune expérience ajoutée
              </p>

              <p
                className="text-xs mt-1"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                Les profils avec expérience
                détaillée inspirent davantage
                confiance
              </p>
            </div>

          ) : (

            <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">

              {experiences.map((exp) => (

                <li
                  key={exp.id}
                  className="relative pl-7"
                >

                  <span
                    className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      borderColor:
                        "var(--navy)",
                      background:
                        exp.current
                          ? "var(--navy)"
                          : "var(--card)",
                    }}
                  />

                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      borderColor:
                        "var(--border)",
                      background:
                        "var(--secondary)",
                    }}
                  >

                    <div className="flex items-start justify-between gap-3 mb-3">

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 min-w-0">

                        <input
                          className="text-sm font-semibold bg-transparent border-b border-dashed focus:outline-none"
                          style={{
                            color:
                              "var(--navy)",
                            borderColor:
                              "var(--border)",
                            minWidth:
                              "160px",
                          }}
                          placeholder="Titre du poste"
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "title",
                              e.target.value
                            )
                          }
                        />

                        <input
                          className="text-xs bg-transparent border-b border-dashed focus:outline-none"
                          style={{
                            color:
                              "var(--muted-foreground)",
                            borderColor:
                              "var(--border)",
                            minWidth:
                              "140px",
                          }}
                          placeholder="Entreprise"
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "company",
                              e.target.value
                            )
                          }
                        />

                        {exp.current && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                "#ECFDF5",
                              color:
                                "#047857",
                            }}
                          >
                            En poste
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeExperience(
                            exp.id
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Supprimer cette expérience"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">

                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          Début
                        </label>

                        <input
                          type="month"
                          className={inputClass}
                          style={{
                            ...inputStyle,
                            padding:
                              "8px 12px",
                          }}
                          value={exp.from}
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "from",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{
                            color:
                              "var(--muted-foreground)",
                          }}
                        >
                          Fin
                        </label>

                        <input
                          type="month"
                          className={inputClass}
                          style={{
                            ...inputStyle,
                            padding:
                              "8px 12px",
                            opacity:
                              exp.current
                                ? 0.5
                                : 1,
                          }}
                          value={exp.to}
                          disabled={
                            exp.current
                          }
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "to",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="flex items-end pb-2.5">

                        <label className="flex items-center gap-2 text-xs cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              exp.current
                            }
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "current",
                                e.target.checked
                              )
                            }
                          />

                          <span
                            style={{
                              color:
                                "var(--navy)",
                            }}
                          >
                            Poste actuel
                          </span>

                        </label>

                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        {/* ===================================================================
            LIENS PROFESSIONNELS
        =================================================================== */}

        <SectionCard
          icon={Link2}
          title="Liens professionnels"
          subtitle="Des liens vérifiables augmentent la crédibilité de votre profil"
        >

          <div className="space-y-4">

            {[
              {
                label: "GitHub",
                key: "github" as keyof FreelancerProfil,
                Icon: Github,
              },
              {
                label: "LinkedIn",
                key: "linkedin" as keyof FreelancerProfil,
                Icon: Linkedin,
              },
              {
                label: "Site web",
                key: "siteweb" as keyof FreelancerProfil,
                Icon: Globe,
              },
            ].map(
              ({
                label,
                key,
                Icon,
              }) => (

                <div key={key}>

                  <FieldLabel>
                    {label}
                  </FieldLabel>

                  <div className="relative">

                    <Icon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    />

                    <input
                      className={inputClass}
                      style={{
                        ...inputStyle,
                        paddingLeft:
                          "2.25rem",
                        paddingRight:
                          "2.5rem",
                      }}
                      type="url"
                      placeholder={`https://${key}.com/username`}
                      value={
                        (form[key] as string) ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(
                          key,
                          e.target.value
                        )
                      }
                    />

                    {form[key] && (
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                        onClick={() =>
                          handleChange(
                            key,
                            ""
                          )
                        }
                        aria-label={`Supprimer ${label}`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

          </div>
        </SectionCard>

      </div>

      {/* =====================================================================
          BARRE D'ACTION
      ===================================================================== */}

      <div
        className="sticky bottom-0 -mx-6 px-6 py-4 flex justify-end gap-3 border-t backdrop-blur"
        style={{
          background:
            "color-mix(in srgb, var(--background, #fff) 92%, transparent)",
          borderColor: "var(--border)",
        }}
      >

        <button
          type="button"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--secondary)]"
          style={{
            borderColor: "var(--border)",
            color: "var(--navy)",
          }}
        >
          Annuler
        </button>

        <button
          onClick={handleSave}
          disabled={
            saving || uploadingPhoto
          }
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
          style={{
            background: saved
              ? "var(--success)"
              : "var(--navy)",
            color: "#FFF",
            opacity:
              saving || uploadingPhoto
                ? 0.7
                : 1,
          }}
        >

          {saved ? (
            <>
              <CheckCircle2 size={15} />
              Enregistré !
            </>
          ) : saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save size={15} />
              Enregistrer les modifications
            </>
          )}

        </button>
      </div>

    </div>
  );
}