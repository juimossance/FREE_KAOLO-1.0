import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { apiFetch } from "../../../services/http";

export function RegisterFreelancerPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  /*
   * Téléphone camerounais.
   * Formats acceptés : 6XXXXXXXX, +237 6XXXXXXXX, +2376XXXXXXXX, 2376XXXXXXXX
   * Les espaces et tirets sont tolérés.
   */
  const isValidCameroonPhone = (phone: string) => {
    const normalized = phone.replace(/[\s-]/g, "");

    return (
      /^6\d{8}$/.test(normalized) ||
      /^\+2376\d{8}$/.test(normalized) ||
      /^2376\d{8}$/.test(normalized)
    );
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  /* ---------------------- VALIDATION SLIDE 1 ---------------------- */
  const validateStep1 = () => {
    setError(null);

    if (!form.firstName.trim()) {
      setError("Veuillez renseigner votre prénom.");
      return false;
    }

    if (form.firstName.trim().length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères.");
      return false;
    }

    if (!form.lastName.trim()) {
      setError("Veuillez renseigner votre nom.");
      return false;
    }

    if (form.lastName.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Veuillez renseigner votre numéro de téléphone.");
      return false;
    }

    if (!isValidCameroonPhone(form.phone)) {
      setError(
        "Veuillez entrer un numéro camerounais valide. Exemple : 6XXXXXXXX ou +237 6XXXXXXXX."
      );
      return false;
    }

    if (!form.email.trim()) {
      setError("Veuillez renseigner votre adresse email.");
      return false;
    }

    if (!isValidEmail(form.email)) {
      setError("Veuillez entrer une adresse email valide.");
      return false;
    }

    return true;
  };

  /* ---------------------- VALIDATION SLIDE 2 ---------------------- */
  const validateStep2 = () => {
    setError(null);

    if (!form.password) {
      setError("Veuillez renseigner votre mot de passe.");
      return false;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    if (!form.confirmPassword) {
      setError("Veuillez confirmer votre mot de passe.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return false;
    }

    return true;
  };

  /* ---------------------- NAVIGATION ---------------------- */
  const handleNext = () => {
    setError(null);

    if (step === 1 && validateStep1()) {
      setStep(2);
      return;
    }

    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);

    if (step > 1) {
      setStep((currentStep) => currentStep - 1);
    }
  };

  /* ---------------------- INSCRIPTION ---------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sécurité : on revalide tout avant l'envoi
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!validateStep2()) {
      setStep(2);
      return;
    }

    setLoading(true);

    // Seules les infos nécessaires à la création du compte sont envoyées.
    // Compétences, expérience, CV... seront complétés après l'inscription.
    const payload = {
      nom: form.lastName.trim(),
      prenom: form.firstName.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/[\s-]/g, ""),
      password: form.password,
    };

    try {
      // apiFetch gère l'URL, les headers et l'extraction du message d'erreur
      await apiFetch<unknown>("/auth/register/prestataire", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Pas de connexion automatique : on passe par la vérification email
      navigate("/verify-email");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur réseau, veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- STYLES ---------------------- */
  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
  };

  /* ---------------------- AFFICHAGE ---------------------- */
  return (
    <div>
      {/* TITRE */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>
          Inscription Freelancer
        </h1>

        <p
          className="mt-1.5 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Créez votre compte et rejoignez la communauté Free-Kaolo
        </p>
      </div>

      {/* INDICATEUR DES ÉTAPES */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: s <= step ? "var(--navy)" : "var(--muted)",
                color: s <= step ? "#FFF" : "var(--muted-foreground)",
              }}
            >
              {s < step ? <Check size={15} /> : s}
            </div>

            <span
              className="text-xs font-medium hidden sm:block"
              style={{
                color:
                  s <= step ? "var(--navy)" : "var(--muted-foreground)",
              }}
            >
              {s === 1 ? "Identité" : s === 2 ? "Sécurité" : "Confirmation"}
            </span>

            {s < 3 && (
              <div
                className="w-8 h-px mx-1"
                style={{
                  background: step > s ? "var(--gold)" : "var(--border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* MESSAGE D'ERREUR GLOBAL */}
      {error && (
        <div
          className="mb-5 p-3 rounded-xl text-sm border"
          style={{
            background: "#FEF2F2",
            borderColor: "#FECACA",
            color: "var(--destructive)",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ================= SLIDE 1 : IDENTITÉ ================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PRÉNOM */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--navy)" }}
                >
                  Prénom
                </label>

                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className={`${inputClass} pl-10`}
                    style={inputStyle}
                    type="text"
                    placeholder="Christian"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* NOM */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--navy)" }}
                >
                  Nom
                </label>

                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className={`${inputClass} pl-10`}
                    style={inputStyle}
                    type="text"
                    placeholder="Juimo"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* TÉLÉPHONE */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Numéro de téléphone
              </label>

              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10`}
                  style={inputStyle}
                  type="tel"
                  placeholder="6XX XX XX XX"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>

              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Exemple : 690 12 34 56 ou +237 690 12 34 56
              </p>
            </div>

            {/* EMAIL */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Adresse email
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10`}
                  style={inputStyle}
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ================= SLIDE 2 : SÉCURITÉ ================= */}
        {step === 2 && (
          <div className="space-y-4">
            {/* MOT DE PASSE */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10 pr-11`}
                  style={inputStyle}
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={
                    showPwd
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* INDICATEUR DE FORCE */}
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (form.password.length / 8) * 100,
                      100
                    )}%`,
                    background:
                      form.password.length >= 8
                        ? "var(--success)"
                        : form.password.length >= 5
                        ? "var(--warning)"
                        : "var(--destructive)",
                  }}
                />
              </div>

              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Le mot de passe doit contenir au moins 8 caractères.
              </p>
            </div>

            {/* CONFIRMATION */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Confirmer le mot de passe
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10 pr-11`}
                  style={inputStyle}
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={
                    showConfirmPwd
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                >
                  {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--navy)", color: "#FFF" }}
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= SLIDE 3 : CONFIRMATION ================= */}
        {step === 3 && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl border"
              style={{ borderColor: "var(--border)", background: "#F8FAFC" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--navy)", color: "#FFF" }}
                >
                  <Check size={17} />
                </div>

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Vérifiez vos informations
                  </p>

                  <p
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Votre compte sera créé avec ces informations.
                  </p>
                </div>
              </div>
            </div>

            {/* RÉCAPITULATIF */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex justify-between gap-4 p-4 border-b">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Prénom
                </span>
                <span
                  className="text-sm font-medium text-right"
                  style={{ color: "var(--navy)" }}
                >
                  {form.firstName}
                </span>
              </div>

              <div className="flex justify-between gap-4 p-4 border-b">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Nom
                </span>
                <span
                  className="text-sm font-medium text-right"
                  style={{ color: "var(--navy)" }}
                >
                  {form.lastName}
                </span>
              </div>

              <div className="flex justify-between gap-4 p-4 border-b">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Téléphone
                </span>
                <span
                  className="text-sm font-medium text-right"
                  style={{ color: "var(--navy)" }}
                >
                  {form.phone}
                </span>
              </div>

              <div className="flex justify-between gap-4 p-4">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Email
                </span>
                <span
                  className="text-sm font-medium text-right break-all"
                  style={{ color: "var(--navy)" }}
                >
                  {form.email}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#F8FAFC" }}>
              <p
                className="text-xs leading-5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Après la création de votre compte, vous pourrez compléter
                votre profil avec votre spécialité, vos compétences, votre
                expérience, votre CV et vos certifications.
              </p>
            </div>

            {/* CONDITIONS */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-0.5 w-4 h-4 rounded"
              />

              <label
                htmlFor="terms"
                className="text-xs leading-5"
                style={{ color: "var(--muted-foreground)" }}
              >
                J'accepte les{" "}
                <Link
                  to="#"
                  className="font-medium"
                  style={{ color: "var(--navy)" }}
                >
                  Conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  to="#"
                  className="font-medium"
                  style={{ color: "var(--navy)" }}
                >
                  Politique de confidentialité
                </Link>
                .
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--navy)",
                  color: "#FFF",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Inscription...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* LIENS */}
      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        Vous êtes une entreprise ?{" "}
        <Link
          to="/register/enterprise"
          className="font-semibold"
          style={{ color: "var(--navy)" }}
        >
          Inscription Entreprise
        </Link>
      </p>

      <p
        className="mt-2 text-center text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        Déjà inscrit ?{" "}
        <Link
          to="/login"
          className="font-semibold"
          style={{ color: "var(--navy)" }}
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
