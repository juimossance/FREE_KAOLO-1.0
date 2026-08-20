import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { freelancerService, FreelancerProfil } from "../../../services/freelancerservices";
import {
  Save,
  CheckCircle2,
  Circle,
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
  X,
} from "lucide-react";

// Liste des compétences disponibles (peut venir d'une API)
const availableSkills = [
  "React", "Vue.js", "Angular", "TypeScript", "Node.js", "Express",
  "Python", "Django", "PHP", "Laravel", "PostgreSQL", "MySQL",
  "MongoDB", "Docker", "Kubernetes", "AWS", "Azure", "Figma",
  "Adobe XD", "GraphQL", "Spring Boot", "Java", "C#", ".NET",
];

// Interface pour une expérience (locale)
interface Experience {
  id: number;
  title: string;
  company: string;
  from: string; // format "YYYY-MM"
  to: string;   // format "YYYY-MM" ou vide si actuel
  current: boolean;
}

// --- Petits composants de mise en page réutilisables -----------------------

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
            style={{ background: "var(--secondary)", color: "var(--navy)" }}
          >
            <Icon size={17} />
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight" style={{ color: "var(--navy)" }}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
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

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
      {children}
      {required && <span style={{ color: "var(--gold)" }}> *</span>}
    </label>
  );
}

// -----------------------------------------------------------------------------

export function EditProfile() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [form, setForm] = useState<Partial<FreelancerProfil>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Chargement initial
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await freelancerService.getProfil(userId);
        setForm(data);

        if (Array.isArray(data.competence)) {
          setSelectedSkills(data.competence);
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

  // Sauvegarde
  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      const payload = {
        ...form,
        competence: selectedSkills,
      };

      await freelancerService.updateProfil(userId, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FreelancerProfil, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

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
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: number, field: keyof Experience, value: any) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  // Checklist de complétion basée sur l'état réel du formulaire (trust-first :
  // on n'affiche jamais un statut "fait" qui ne correspond pas aux données)
  const checklist = useMemo(
    () => [
      { label: "Photo de profil", done: Boolean((form as any).photoUrl) },
      { label: "Bio professionnelle", done: Boolean(form.description && form.description.length > 20) },
      { label: "Compétences (3+)", done: selectedSkills.length >= 3 },
      { label: "Expérience professionnelle", done: experiences.length > 0 },
    ],
    [form, selectedSkills, experiences]
  );
  const completion = form.completionPourcentage ?? Math.round(
    (checklist.filter((c) => c.done).length / checklist.length) * 100
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:ring-2 focus:ring-offset-0";
  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
  } as React.CSSProperties;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Barre d'en-tête persistante */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6 flex items-center justify-between backdrop-blur border-b"
        style={{ background: "color-mix(in srgb, var(--background, #fff) 88%, transparent)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
              Modifier le profil
            </h2>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: "#ECFDF5", color: "#047857" }}
            >
              <ShieldCheck size={12} /> Vérifié par notre équipe
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Toute modification est revue avant publication
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
          style={{
            background: saved ? "var(--success)" : "var(--navy)",
            color: "#FFF",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} /> Enregistré
            </>
          ) : saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save size={15} /> Enregistrer
            </>
          )}
        </button>
      </div>

      <div className="space-y-6 pb-24">
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium"
            style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Barre de complétion, pilotée par l'état réel des données */}
        <div className="p-5 rounded-2xl border" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-900">Profil complété à {completion}%</p>
            <span className="text-xs text-blue-600">
              {completion < 100 ? `+${100 - completion}% pour débloquer le badge Premium` : "Profil complet !"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-blue-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {checklist.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: item.done ? "#0369A1" : "#94A3B8" }}
              >
                {item.done ? (
                  <CheckCircle2 size={13} style={{ color: "#0EA5E9" }} />
                ) : (
                  <Circle size={13} />
                )}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Photo de profil */}
        <SectionCard icon={Camera} title="Photo de profil" subtitle="Un visage humain renforce la confiance des clients">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ring-4"
              style={{ background: "var(--gold)", color: "var(--navy)", ["--tw-ring-color" as any]: "var(--secondary)" }}
            >
              {form.prenom?.[0] || "?"}
              {form.nom?.[0] || "?"}
            </div>
            <div>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border mb-2 transition-colors hover:bg-[var(--secondary)]"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}
              >
                <Upload size={14} /> Télécharger une photo
              </button>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                JPG, PNG · Max 2 Mo · Recommandé 400×400 px
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Informations personnelles */}
        <SectionCard icon={User} title="Informations personnelles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Prénom</FieldLabel>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.prenom || ""}
                onChange={(e) => handleChange("prenom", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Nom</FieldLabel>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.nom || ""}
                onChange={(e) => handleChange("nom", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel required>Email</FieldLabel>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Téléphone</FieldLabel>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  value={form.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Ville</FieldLabel>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                  value={form.ville || ""}
                  onChange={(e) => handleChange("ville", e.target.value)}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Pays</FieldLabel>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.pays || ""}
                onChange={(e) => handleChange("pays", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Disponibilité</FieldLabel>
              <select
                className={inputClass}
                style={inputStyle}
                value={form.disponibilite || ""}
                onChange={(e) => handleChange("disponibilite", e.target.value)}
              >
                <option value="">Sélectionnez</option>
                <option>Disponible</option>
                <option>Partiellement disponible</option>
                <option>Indisponible</option>
              </select>
            </div>
            <div>
              <FieldLabel>Langues</FieldLabel>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="ex : Français, Anglais"
                value={form.langues || ""}
                onChange={(e) => handleChange("langues", e.target.value)}
              />
            </div>
          </div>
        </SectionCard>

        {/* Informations professionnelles */}
        <SectionCard icon={Briefcase} title="Informations professionnelles">
          <div className="space-y-4">
            <div>
              <FieldLabel required>Spécialité principale</FieldLabel>
              <input
                className={inputClass}
                style={inputStyle}
                value={form.specialite || ""}
                onChange={(e) => handleChange("specialite", e.target.value)}
                placeholder="ex : Développeur Full-Stack"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Expérience (années)</FieldLabel>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="text"
                  value={form.experience || ""}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  placeholder="ex : 5 ans"
                />
              </div>
              <div>
                <FieldLabel>Tarif journalier (FCFA)</FieldLabel>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  value={form.tarifJournalier ?? ""}
                  onChange={(e) => handleChange("tarifJournalier", parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Bio professionnelle</FieldLabel>
              <textarea
                className={inputClass}
                style={inputStyle}
                rows={4}
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Décrivez votre expertise, vos réalisations et ce qui vous distingue..."
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                Visible publiquement sur votre profil · {form.description?.length || 0} caractères
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Compétences */}
        <SectionCard
          icon={Award}
          title="Compétences"
          action={
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--secondary)", color: "var(--navy)" }}>
              {selectedSkills.length} sélectionnée{selectedSkills.length > 1 ? "s" : ""}
            </span>
          }
        >
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: active ? "var(--navy)" : "transparent",
                    color: active ? "#FFF" : "var(--muted-foreground)",
                    borderColor: active ? "var(--navy)" : "var(--border)",
                  }}
                >
                  {active && <CheckCircle2 size={12} />}
                  {skill}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Expériences professionnelles */}
        <SectionCard
          icon={CalendarClock}
          title="Expériences professionnelles"
          action={
            <button
              type="button"
              onClick={addExperience}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "var(--gold)" }}
            >
              <Plus size={15} /> Ajouter
            </button>
          }
        >
          {experiences.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center py-10 rounded-xl border border-dashed"
              style={{ borderColor: "var(--border)" }}
            >
              <CalendarClock size={22} style={{ color: "var(--muted-foreground)" }} className="mb-2" />
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                Aucune expérience ajoutée
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Les profils avec expérience détaillée inspirent davantage confiance
              </p>
            </div>
          ) : (
            <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
              {experiences.map((exp) => (
                <li key={exp.id} className="relative pl-7">
                  <span
                    className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2"
                    style={{ borderColor: "var(--navy)", background: exp.current ? "var(--navy)" : "var(--card)" }}
                  />
                  <div
                    className="p-4 rounded-xl border"
                    style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 min-w-0">
                        <input
                          className="text-sm font-semibold bg-transparent border-b border-dashed focus:outline-none"
                          style={{ color: "var(--navy)", borderColor: "var(--border)", minWidth: "160px" }}
                          placeholder="Titre du poste"
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                        />
                        <input
                          className="text-xs bg-transparent border-b border-dashed focus:outline-none"
                          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)", minWidth: "140px" }}
                          placeholder="Entreprise"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        />
                        {exp.current && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "#ECFDF5", color: "#047857" }}
                          >
                            En poste
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Supprimer cette expérience"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                          Début
                        </label>
                        <input
                          type="month"
                          className={inputClass}
                          style={{ ...inputStyle, padding: "8px 12px" }}
                          value={exp.from}
                          onChange={(e) => updateExperience(exp.id, "from", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                          Fin
                        </label>
                        <input
                          type="month"
                          className={inputClass}
                          style={{ ...inputStyle, padding: "8px 12px", opacity: exp.current ? 0.5 : 1 }}
                          value={exp.to}
                          disabled={exp.current}
                          onChange={(e) => updateExperience(exp.id, "to", e.target.value)}
                        />
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                          />
                          <span style={{ color: "var(--navy)" }}>Poste actuel</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        {/* Liens professionnels */}
        <SectionCard icon={Link2} title="Liens professionnels" subtitle="Des liens vérifiables augmentent la crédibilité de votre profil">
          <div className="space-y-4">
            {[
              { label: "GitHub", key: "github" as keyof FreelancerProfil, Icon: Github },
              { label: "LinkedIn", key: "linkedin" as keyof FreelancerProfil, Icon: Linkedin },
              { label: "Site web", key: "siteweb" as keyof FreelancerProfil, Icon: Globe },
            ].map(({ label, key, Icon }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    className={inputClass}
                    style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    type="url"
                    placeholder={`https://${key}.com/username`}
                    value={(form[key] as string) || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                  {form[key] ? (
                    <X
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: "var(--muted-foreground)" }}
                      onClick={() => handleChange(key, "")}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Barre d'action inférieure persistante */}
      <div
        className="sticky bottom-0 -mx-6 px-6 py-4 flex justify-end gap-3 border-t backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--background, #fff) 92%, transparent)", borderColor: "var(--border)" }}
      >
        <button
          type="button"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--secondary)]"
          style={{ borderColor: "var(--border)", color: "var(--navy)" }}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed"
          style={{
            background: saved ? "var(--success)" : "var(--navy)",
            color: "#FFF",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} /> Enregistré !
            </>
          ) : saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save size={15} /> Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}