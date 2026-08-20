import { useState } from "react";
import { useNavigate } from "react-router";
import { projetService } from "../../../services/projetService";
import { PlusCircle, Loader2, ArrowRight, Info } from "lucide-react";
import { getCurrentUser } from "../../../utils/jwt";

const categories = ["Développement Web", "Mobile", "Design UI/UX", "Marketing Digital", "Data Science", "Rédaction", "Comptabilité", "Traduction", "SEO/SEA", "DevOps", "Sécurité", "Autre"];
const skillOptions = ["React", "Vue.js", "Angular", "Node.js", "Python", "PHP", "Laravel", "MySQL", "PostgreSQL", "Figma", "React Native", "Flutter", "WordPress", "Shopify", "AWS", "Docker"];

type Step = 1 | 2 | 3;

export function PostProject() {
  // ✅ Récupération de l'utilisateur via decodeJwt
  const user = getCurrentUser();
  const entrepriseId = user?.entrepriseId;

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", category: "", description: "", deliverables: "",
    budget: "", budgetType: "Fixe",
    deadline: "", duration: "", experience: "Intermédiaire",
    visibility: "Public", location: "Télétravail", urgent: false,
  });
  const navigate = useNavigate();

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async () => {
    console.log("🟢 handleSubmit appelé !");
    console.log("user:", user);
    console.log("entrepriseId:", entrepriseId);
    console.log("form:", form);
    console.log("selectedSkills:", selectedSkills);

    if (!user) {
      setError("Vous devez être connecté pour publier un projet");
      return;
    }

    if (!entrepriseId) {
      setError("Aucun compte entreprise associé à cet utilisateur");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = {
        title: form.title,
        category: form.category,
        description: form.description,
        deliverables: form.deliverables,
        budget: parseFloat(form.budget) || 0,
        budgetType: form.budgetType as "Fixe" | "Journalier",
        deadline: form.deadline,
        duration: form.duration,
        experience: form.experience,
        visibility: form.visibility,
        location: form.location,
        urgent: form.urgent,
        skills: selectedSkills,
      };

      await projetService.createProject(entrepriseId, projectData);
      navigate("/enterprise/projects");
    } catch (err) {
      console.error("❌ Erreur création projet :", err);
      setError("Erreur lors de la publication du projet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Publier un Projet</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Trouvez le freelancer idéal pour votre mission
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {([["1", "Projet"], ["2", "Budget & Délais"], ["3", "Validation"]] as const).map(([num, label], i) => (
          <div key={num} className="flex items-center gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => i + 1 < step && setStep((i + 1) as Step)}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: parseInt(num) <= step ? "var(--navy)" : "var(--muted)",
                  color: parseInt(num) <= step ? "#FFF" : "var(--muted-foreground)",
                }}>
                {parseInt(num) < step ? "✓" : num}
              </div>
              <span className="text-xs font-medium hidden sm:block"
                style={{ color: parseInt(num) <= step ? "var(--navy)" : "var(--muted-foreground)" }}>
                {label}
              </span>
            </div>
            {i < 2 && <div className="w-12 h-px" style={{ background: step > i + 1 ? "var(--gold)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Description */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Description du projet</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Titre du projet *</label>
              <input className={inputClass} style={inputStyle} placeholder="ex: Développement d'une application mobile e-commerce"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Catégorie *</label>
              <select className={inputClass} style={inputStyle} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Description détaillée *</label>
              <textarea className={inputClass} style={inputStyle} rows={6}
                placeholder="Décrivez le contexte, les objectifs, les fonctionnalités attendues..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Livrables attendus</label>
              <textarea className={inputClass} style={inputStyle} rows={3}
                placeholder="• Code source complet&#10;• Documentation technique&#10;• Tests unitaires..."
                value={form.deliverables} onChange={e => setForm(f => ({ ...f, deliverables: e.target.value }))} />
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Compétences requises</h3>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    background: selectedSkills.includes(skill) ? "var(--navy)" : "transparent",
                    color: selectedSkills.includes(skill) ? "#FFF" : "var(--muted-foreground)",
                    borderColor: selectedSkills.includes(skill) ? "var(--navy)" : "var(--border)",
                  }}>
                  {skill}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Niveau d'expérience requis</label>
              <div className="grid grid-cols-3 gap-3">
                {["Débutant", "Intermédiaire", "Expert"].map(level => (
                  <button key={level} type="button" onClick={() => setForm(f => ({ ...f, experience: level }))}
                    className="py-2.5 rounded-xl text-sm border font-medium transition-all"
                    style={{
                      background: form.experience === level ? "var(--navy)" : "transparent",
                      color: form.experience === level ? "#FFF" : "var(--muted-foreground)",
                      borderColor: form.experience === level ? "var(--navy)" : "var(--border)",
                    }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Paramètres additionnels</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Visibilité</label>
                <select className={inputClass} style={inputStyle} value={form.visibility}
                  onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                  <option>Public</option>
                  <option>Privé (invitation)</option>
                  <option>Certifiés uniquement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Lieu de travail</label>
                <select className={inputClass} style={inputStyle} value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
                  <option>Télétravail</option>
                  <option>Sur site - Abidjan</option>
                  <option>Hybride</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <div>
                <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>Projet urgent</span>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Les freelancers seront notifiés en priorité</p>
              </div>
            </label>
          </div>

          <button onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--navy)", color: "#FFF" }}>
            Continuer <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Budget & Délais */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Budget</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Type de budget</label>
              <div className="grid grid-cols-2 gap-3">
                {["Fixe", "Journalier"].map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, budgetType: type }))}
                    className="py-2.5 rounded-xl text-sm border font-medium transition-all"
                    style={{
                      background: form.budgetType === type ? "var(--navy)" : "transparent",
                      color: form.budgetType === type ? "#FFF" : "var(--muted-foreground)",
                      borderColor: form.budgetType === type ? "var(--navy)" : "var(--border)",
                    }}>
                    {type === "Fixe" ? "Budget fixe" : "Tarif journalier"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Budget (FCFA)</label>
              <input className={inputClass} style={inputStyle} type="number" placeholder="50 000"
                value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
              <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                La commission free-kaolo est de <strong>8%</strong> sur le montant final de la transaction.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>Délais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Date limite *</label>
                <input type="date" className={inputClass} style={{ ...inputStyle, padding: "10px 16px" }}
                  value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Durée estimée</label>
                <select className={inputClass} style={inputStyle} value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                  <option>Moins d'une semaine</option>
                  <option>1-2 semaines</option>
                  <option>1 mois</option>
                  <option>2-3 mois</option>
                  <option>3-6 mois</option>
                  <option>Plus de 6 mois</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
              Retour
            </button>
            <button onClick={() => setStep(3)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}>
              Prévisualiser <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Validation */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>Aperçu de votre projet</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold" style={{ color: "var(--navy)" }}>{form.title || "Titre du projet"}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.category && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                      {form.category}
                    </span>
                  )}
                  {form.urgent && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "#FEE2E2", color: "#991B1B" }}>
                      🔥 Urgent
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                    {form.experience}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {form.description || "Aucune description fournie"}
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: "var(--secondary)" }}>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Date limite</p>
                  <p className="font-bold" style={{ color: "var(--navy)" }}>{form.deadline || "Non définie"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Lieu</p>
                  <p className="font-bold" style={{ color: "var(--navy)" }}>{form.location}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Durée</p>
                  <p className="font-bold" style={{ color: "var(--navy)" }}>{form.duration || "Non définie"}</p>
                </div>
              </div>
              {selectedSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>Compétences</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: "var(--navy)", color: "#FFF" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              ❌ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
              Modifier
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Publication...</> : <>
                <PlusCircle size={15} /> Publier maintenant
              </>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}