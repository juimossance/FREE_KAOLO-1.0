import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Mail, Lock, Phone, Globe, ArrowRight, Loader2, Eye, EyeOff, MapPin } from "lucide-react";

export function RegisterEnterprisePage() {
  const [step, setStep] = useState(1);
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    companyName: "", sector: "", size: "", email: "", phone: "",
    address: "", city: "", website: "", contactName: "", password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
    setLoading(true);
    setError(null);
     const payload = {
    nom: form.companyName,
    responsable: form.contactName,
    email: form.email,
    password: form.password,
    phone: form.phone,
    secteur: form.sector,
    siteweb: form.website,
   ville: form.city, // déjà un tableau de strings, parfait
    addresse: form.address,
   
  };
try {
    // 2. L'appel réseau lui-même
    const response = await fetch("http://localhost:8080/api/auth/register/entreprise", {
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

    // 4. Succès : on redirige
   
  } catch (err) {
    setError(err instanceof Error ? err.message : "Erreur réseau, veuillez réessayer.");
  } finally {
    setLoading(false);
  }



  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>Inscription Entreprise</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Publiez vos projets et trouvez les meilleurs talents
        </p>
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
              {s === 1 ? "Entreprise" : s === 2 ? "Contact" : "Compte"}
            </span>
            {s < 3 && <div className="w-8 h-px mx-1" style={{ background: step > s ? "var(--gold)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Nom de l'entreprise *</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="text" placeholder="TechCorp CI"
                  value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} required />
              </div>
            </div>
           
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Secteur d'activité *</label>
              <select className={inputClass} style={inputStyle} value={form.sector}
                onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} required>
                <option value="">Sélectionner un secteur</option>
                {["Technologie & IT", "Finance & Banque", "Santé", "Commerce & Distribution", "Éducation", "Agriculture", "Télécommunications", "Médias & Communication", "Construction & BTP", "Autre"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Taille de l'entreprise</label>
              <div className="grid grid-cols-2 gap-2">
                {["1-10", "11-50", "51-200", "200+"].map(size => (
                  <button key={size} type="button" onClick={() => setForm(f => ({ ...f, size }))}
                    className="py-2.5 rounded-xl text-sm border font-medium transition-all"
                    style={{
                      background: form.size === size ? "var(--navy)" : "transparent",
                      color: form.size === size ? "#FFF" : "var(--muted-foreground)",
                      borderColor: form.size === size ? "var(--navy)" : "var(--border)",
                    }}>
                    {size} employés
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Site web</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="url" placeholder="https://monentreprise.ci"
                  value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}>
              Continuer <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Nom du responsable *</label>
              <input className={inputClass} style={inputStyle} type="text" placeholder="Jean-Marc Konan"
                value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Email professionnel *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="email" placeholder="contact@entreprise.ci"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Téléphone *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10`} style={inputStyle} type="tel" placeholder="+225 27 22 00 00 00"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Ville</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select className={`${inputClass} pl-10`} style={inputStyle} value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                  <option value="">Sélectionner</option>
                  {["yaounde", "Douala", "bafoussam", "maroua", "garoua", "bafang", "Autre"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Adresse</label>
              <input className={inputClass} style={inputStyle} type="text" placeholder="Plateau, Rue des Jardins"
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Retour
              </button>
              <button type="button" onClick={() => setStep(3)}
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Mot de passe *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} pl-10 pr-11`} style={inputStyle}
                  type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Confirmer le mot de passe *</label>
              <input className={inputClass} style={inputStyle} type="password" placeholder="••••••••" required />
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
              <p className="text-xs font-semibold text-blue-800 mb-2">📋 Informations importantes</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Votre compte sera vérifié sous 24h ouvrées</li>
                <li>• Un document justificatif peut vous être demandé</li>
                <li>• Vous recevrez un email de confirmation</li>
              </ul>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" required id="terms" className="mt-0.5 w-4 h-4 rounded" />
              <label htmlFor="terms" className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                J'accepte les <Link to="#" className="font-medium" style={{ color: "var(--navy)" }}>CGU</Link> et certifie que les informations fournies sont exactes.
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
                {loading ? <><Loader2 size={15} className="animate-spin" /> Création...</> : <>Créer le compte <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Vous êtes freelancer ?{" "}
        <Link to="/register/freelancer" className="font-semibold" style={{ color: "var(--navy)" }}>Inscription Freelancer</Link>
      </p>
      <p className="mt-2 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Déjà inscrit ?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--navy)" }}>Se connecter</Link>
      </p>
    </div>
  );
}
