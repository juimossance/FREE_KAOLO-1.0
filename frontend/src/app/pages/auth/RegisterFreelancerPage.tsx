import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, Phone, Briefcase, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

const skills = ["Développement Web", "Design UI/UX", "Marketing Digital", "Rédaction", "Data Science", "Mobile", "DevOps", "Graphisme", "SEO", "Vidéo"];

export function RegisterFreelancerPage() {
  const [step, setStep] = useState(1);
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    specialty: "", experience: "", country: "Côte d'Ivoire", description: "",
  });
const navigate = useNavigate();
  const toggleSkill = (skill: string) => {
    setSelectedSkills(s => s.includes(skill) ? s.filter(x => x !== skill) : [...s, skill]);
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. On traduit notre state React vers la forme attendue par le backend
  const payload = {
    nom: form.lastName,
    prenom: form.firstName,
    email: form.email,
    password: form.password,
    phone: form.phone,
    pays: form.country,
    specialite: form.specialty,
    competence: selectedSkills, // déjà un tableau de strings, parfait
    experience: form.experience,
    description: form.description,
  };
    try {
    // 2. L'appel réseau lui-même
    const response = await fetch("http://localhost:8080/api/auth/register/prestataire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify(payload),
      
    });
navigate(`/verify-email`)
    // 3. Gestion des erreurs HTTP (4xx, 5xx)
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Une erreur est survenue lors de l'inscription.");

    }

  
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erreur réseau, veuillez réessayer.");
  } finally {
    setLoading(false);
  }
}; 

    


  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };
const inputdescription = "w-full px-4 py-5 rounded-xl text-sm border outline-none transition-all";
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>Inscription Freelancer</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>Rejoignez la communauté des talents free-kaolo</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: s <= step ? "var(--navy)" : "var(--muted)",
                color: s <= step ? "#FFF" : "var(--muted-foreground)",
              }}>
              {s < step ? "✓" : s}
            </div>
            <span className="text-xs font-medium hidden sm:block"
              style={{ color: s <= step ? "var(--navy)" : "var(--muted-foreground)" }}>
              {s === 1 ? "Identité" : s === 2 ? "Compétences" : "Finalisation"}
            </span>
            {s < 3 && <div className="w-8 h-px mx-1" style={{ background: step > s ? "var(--gold)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Prénom</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={inputClass} style={inputStyle} type="text" placeholder="Kofi" value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Nom</label>
                <input className={inputClass} style={inputStyle} type="text" placeholder="Mensah" value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="email" placeholder="kofi@exemple.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Téléphone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="tel" placeholder="+225 07 01 02 03 04"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Pays</label>
              <select className={inputClass} style={inputStyle} value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                <option>Côte d'Ivoire</option>
                <option>Sénégal</option>
                <option>Ghana</option>
                <option>Cameroun</option>
                <option>Mali</option>
                <option>Burkina Faso</option>
                <option>Togo</option>
                <option>Bénin</option>
              </select>
            </div>
            <button type="button" onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}>
              Continuer <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Spécialité principale</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="text" placeholder="Développeur Full Stack"
                  value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Compétences <span className="font-normal text-slate-400">(sélectionnez jusqu'à 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                    style={{
                      background: selectedSkills.includes(skill) ? "var(--navy)" : "transparent",
                      color: selectedSkills.includes(skill) ? "#FFF" : "var(--muted-foreground)",
                      borderColor: selectedSkills.includes(skill) ? "var(--navy)" : "var(--border)",
                    }}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Années d'expérience</label>
              <select className={inputClass} style={inputStyle} value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}>
                <option value="">Sélectionner</option>
                <option>Moins d'un an</option>
                <option>1-2 ans</option>
                <option>3-5 ans</option>
                <option>5-10 ans</option>
                <option>Plus de 10 ans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 " style={{ color: "var(--navy)" }}> Description</label>
   <textarea
  rows={4}
  placeholder="Décrivez votre expérience, vos projets, etc."
  value={form.description}
  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
  className={inputdescription}
  style={inputStyle}
/>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Retour
              </button>
              <button type="button" onClick={handleNext}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--navy)", color: "#FFF" }}>
                Continuer <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10 pr-11`} style={inputStyle}
                  type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: form.password.length > 8 ? "100%" : `${(form.password.length / 8) * 100}%`,
                    background: form.password.length > 8 ? "var(--success)" : form.password.length > 4 ? "var(--warning)" : "var(--destructive)",
                  }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Confirmer le mot de passe</label>
              <input className={`${inputClass}`} style={inputStyle} type="password" placeholder="••••••••" />
            </div>
            <div className="p-4 rounded-xl border" style={{ borderColor: "var(--border)", background: "#F8FAFC" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--navy)" }}>Résumé de votre profil :</p>
              <div className="space-y-1.5">
                {[
                  { label: "Nom", value: `${form.firstName} ${form.lastName}` || "—" },
                  { label: "Email", value: form.email || "—" },
                  { label: "Spécialité", value: form.specialty || "—" },
                  { label: "Compétences", value: selectedSkills.join(", ") || "Aucune" },
                ].map(item => (
                  <div key={item.label} className="flex gap-2 text-xs">
                    <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>{item.label}:</span>
                    <span style={{ color: "var(--navy)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required id="terms" className="mt-0.5 w-4 h-4 rounded" />
              <label htmlFor="terms" className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                J'accepte les <Link to="#" className="font-medium" style={{ color: "var(--navy)" }}>Conditions d'utilisation</Link> et la{" "}
                <Link to="#" className="font-medium" style={{ color: "var(--navy)" }}>Politique de confidentialité</Link>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Retour
              </button>
              {error && (
  <div className="p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "var(--destructive)" }}>
    {error}
  </div>
)}
              <button type="submit" disabled={loading} 
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--navy)", color: "#FFF", opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Inscription...</> : <>Créer mon compte <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Vous êtes une entreprise ?{" "}
        <Link to="/register/enterprise" className="font-semibold" style={{ color: "var(--navy)" }}>
          Inscription Entreprise
        </Link>
      </p>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Déjà inscrit ?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--navy)" }}>Se connecter</Link>
      </p>
    </div>
  );
}
function setError(arg0: null) {
  throw new Error("Function not implemented.");
}

