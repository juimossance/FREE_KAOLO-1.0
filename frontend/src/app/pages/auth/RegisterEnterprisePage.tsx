
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
} from "lucide-react";

type FormData = {
  companyName: string;
  sector: string;
  size: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website: string;
  contactName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export function RegisterEnterprisePage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [form, setForm] = useState<FormData>({
    companyName: "",
    sector: "",
    size: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    contactName: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const navigate = useNavigate();

  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  const normalizePhone = (phone: string) => {
    return phone.replace(/[\s().-]/g, "");
  };

  /**
   * Numéros camerounais :
   *
   * +237 6XXXXXXXX
   * 00237 6XXXXXXXX
   * 6XXXXXXXX
   *
   * Les numéros fixes commençant par 2 peuvent également
   * être acceptés si nécessaire.
   */
  const isValidCameroonPhone = (phone: string) => {
    const value = normalizePhone(phone);

    const normalized = value
      .replace(/^00237/, "+237")
      .replace(/^237/, "+237");

    return /^(\+237)?[26]\d{8}$/.test(normalized);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isValidPassword = (password: string) => {
    return password.length >= 8;
  };

  const validateStep1 = () => {
    if (!form.companyName.trim()) {
      setError("Veuillez renseigner le nom de votre entreprise.");
      return false;
    }

    if (!form.sector.trim()) {
      setError("Veuillez sélectionner votre secteur d'activité.");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!form.contactName.trim()) {
      setError("Veuillez renseigner le nom du responsable.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Veuillez renseigner l'adresse email professionnelle.");
      return false;
    }

    if (!isValidEmail(form.email)) {
      setError("Veuillez renseigner une adresse email valide.");
      return false;
    }

    if (!form.phone.trim()) {
      setError("Veuillez renseigner le numéro de téléphone.");
      return false;
    }

    if (!isValidCameroonPhone(form.phone)) {
      setError(
        "Veuillez renseigner un numéro de téléphone camerounais valide, par exemple : +237 6 95 12 34 56."
      );
      return false;
    }

    if (!form.city.trim()) {
      setError("Veuillez sélectionner votre ville.");
      return false;
    }

    if (!form.address.trim()) {
      setError("Veuillez renseigner l'adresse de votre entreprise.");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!form.password) {
      setError("Veuillez renseigner votre mot de passe.");
      return false;
    }

    if (!isValidPassword(form.password)) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
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

    if (!form.acceptTerms) {
      setError(
        "Vous devez accepter les CGU et certifier l'exactitude des informations fournies."
      );
      return false;
    }

    return true;
  };

  /**
   * Validation du slide courant.
   *
   * IMPORTANT :
   * On ne se contente pas de `required` dans les inputs.
   * Cette fonction empêche réellement le changement de slide.
   */
  const validateCurrentStep = () => {
    setError(null);

    switch (step) {
      case 1:
        return validateStep1();

      case 2:
        return validateStep2();

      case 3:
        return validateStep3();

      default:
        return true;
    }
  };

  /**
   * Passage au slide suivant.
   *
   * L'utilisateur NE PEUT PAS avancer si le slide actuel
   * n'est pas correctement rempli.
   */
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (step < 3) {
      setStep((previousStep) => previousStep + 1);
      setError(null);
    }
  };

  /**
   * Retour au slide précédent.
   */
  const handleBack = () => {
    if (step > 1) {
      setStep((previousStep) => previousStep - 1);
      setError(null);
    }
  };

  /**
   * Mise à jour générique du formulaire.
   */
  const updateForm = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  /*
   * ============================================================
   * INSCRIPTION
   * ============================================================
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /*
     * Double sécurité :
     * même si quelqu'un déclenche directement le submit,
     * le dernier slide doit obligatoirement être valide.
     */
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError(null);

    const normalizedPhone = normalizePhone(form.phone)
      .replace(/^00237/, "+237")
      .replace(/^237/, "+237");

    const payload = {
      nomEntreprise: form.companyName.trim(),
      responsable: form.contactName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: normalizedPhone,
      secteur: form.sector,
      siteweb: form.website.trim(),
      ville: form.city,
      adresse: form.address.trim(),
    };

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register/entreprise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let message = "";

        try {
          message = await response.text();
        } catch {
          message = "";
        }

        throw new Error(
          message ||
            "Une erreur est survenue lors de l'inscription."
        );
      }

      /*
       * Redirection uniquement si l'inscription a réellement réussi.
       */
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

  /*
   * ============================================================
   * STYLES
   * ============================================================
   */

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2 focus:ring-slate-200";

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--card)",
    color: "var(--foreground)",
  };

  const isStep1Valid =
    form.companyName.trim() !== "" &&
    form.sector.trim() !== "";

  const isStep2Valid =
    form.contactName.trim() !== "" &&
    isValidEmail(form.email) &&
    isValidCameroonPhone(form.phone) &&
    form.city.trim() !== "" &&
    form.address.trim() !== "";

  const isStep3Valid =
    form.password.length >= 8 &&
    form.confirmPassword !== "" &&
    form.password === form.confirmPassword &&
    form.acceptTerms;

  const currentStepValid =
    step === 1
      ? isStep1Valid
      : step === 2
      ? isStep2Valid
      : isStep3Valid;

  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--navy)" }}
        >
          Inscription Entreprise
        </h1>

        <p
          className="mt-1.5 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Publiez vos projets et trouvez les meilleurs talents au Cameroun
        </p>
      </div>

      {/* =====================================================
          STEPS
      ===================================================== */}

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background:
                  s <= step ? "var(--navy)" : "var(--muted)",
                color:
                  s <= step
                    ? "#FFF"
                    : "var(--muted-foreground)",
              }}
            >
              {s < step ? (
                <CheckCircle2 size={16} />
              ) : (
                s
              )}
            </div>

            <span
              className="text-xs font-medium hidden sm:block"
              style={{
                color:
                  s <= step
                    ? "var(--navy)"
                    : "var(--muted-foreground)",
              }}
            >
              {s === 1
                ? "Entreprise"
                : s === 2
                ? "Contact"
                : "Compte"}
            </span>

            {s < 3 && (
              <div
                className="w-8 h-px mx-1"
                style={{
                  background:
                    step > s
                      ? "var(--gold)"
                      : "var(--border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* =====================================================
          ERROR GLOBAL
      ===================================================== */}

      {error && (
        <div
          className="mb-5 p-3.5 rounded-xl text-sm border"
          style={{
            background: "#FEF2F2",
            color: "#B91C1C",
            borderColor: "#FECACA",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ===================================================
            STEP 1 — ENTREPRISE
        =================================================== */}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Nom de l'entreprise *
              </label>

              <div className="relative">
                <Building2
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10`}
                  style={inputStyle}
                  type="text"
                  placeholder="Ex. Kaolo Technologies"
                  value={form.companyName}
                  onChange={(e) =>
                    updateForm(
                      "companyName",
                      e.target.value
                    )
                  }
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Secteur d'activité *
              </label>

              <select
                className={inputClass}
                style={inputStyle}
                value={form.sector}
                onChange={(e) =>
                  updateForm("sector", e.target.value)
                }
              >
                <option value="">
                  Sélectionner un secteur
                </option>

                {[
                  "Technologie & Informatique",
                  "Finance & Banque",
                  "Assurance",
                  "Santé",
                  "Commerce & Distribution",
                  "Éducation & Formation",
                  "Agriculture & Agroalimentaire",
                  "Télécommunications",
                  "Médias & Communication",
                  "Transport & Logistique",
                  "Construction & BTP",
                  "Tourisme & Hôtellerie",
                  "Énergie",
                  "Industrie",
                  "Services",
                  "Autre",
                ].map((sector) => (
                  <option
                    key={sector}
                    value={sector}
                  >
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Taille de l'entreprise
              </label>

              <select
                className={inputClass}
                style={inputStyle}
                value={form.size}
                onChange={(e) =>
                  updateForm("size", e.target.value)
                }
              >
                <option value="">
                  Sélectionner
                </option>
                <option value="1-10">
                  1 à 10 employés
                </option>
                <option value="11-50">
                  11 à 50 employés
                </option>
                <option value="51-200">
                  51 à 200 employés
                </option>
                <option value="201-500">
                  201 à 500 employés
                </option>
                <option value="500+">
                  Plus de 500 employés
                </option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Site web
              </label>

              <div className="relative">
                <Globe
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10`}
                  style={inputStyle}
                  type="url"
                  placeholder="https://monentreprise.cm"
                  value={form.website}
                  onChange={(e) =>
                    updateForm(
                      "website",
                      e.target.value
                    )
                  }
                  autoComplete="url"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--navy)",
                color: "#FFF",
                opacity: isStep1Valid ? 1 : 0.5,
                cursor: isStep1Valid
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ===================================================
            STEP 2 — CONTACT
        =================================================== */}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Nom du responsable *
              </label>

              <input
                className={inputClass}
                style={inputStyle}
                type="text"
                placeholder="Ex. Christian Juimo"
                value={form.contactName}
                onChange={(e) =>
                  updateForm(
                    "contactName",
                    e.target.value
                  )
                }
                autoComplete="name"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Email professionnel *
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
                  placeholder="contact@entreprise.cm"
                  value={form.email}
                  onChange={(e) =>
                    updateForm(
                      "email",
                      e.target.value
                    )
                  }
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Téléphone camerounais *
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
                  placeholder="+237 6 95 12 34 56"
                  value={form.phone}
                  onChange={(e) =>
                    updateForm(
                      "phone",
                      e.target.value
                    )
                  }
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>

              <p
                className="mt-1.5 text-xs"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                Exemple : +237 6 95 12 34 56
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Ville *
              </label>

              <div className="relative">
                <MapPin
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  className={`${inputClass} pl-10`}
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) =>
                    updateForm(
                      "city",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Sélectionner votre ville
                  </option>

                  <option value="Yaoundé">
                    Yaoundé
                  </option>

                  <option value="Douala">
                    Douala
                  </option>

                  <option value="Bafoussam">
                    Bafoussam
                  </option>

                  <option value="Bamenda">
                    Bamenda
                  </option>

                  <option value="Garoua">
                    Garoua
                  </option>

                  <option value="Maroua">
                    Maroua
                  </option>

                  <option value="Ngaoundéré">
                    Ngaoundéré
                  </option>

                  <option value="Bertoua">
                    Bertoua
                  </option>

                  <option value="Ebolowa">
                    Ebolowa
                  </option>

                  <option value="Kribi">
                    Kribi
                  </option>

                  <option value="Limbe">
                    Limbe
                  </option>

                  <option value="Buea">
                    Buea
                  </option>

                  <option value="Autre">
                    Autre
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Adresse *
              </label>

              <input
                className={inputClass}
                style={inputStyle}
                type="text"
                placeholder="Ex. Bastos, Yaoundé"
                value={form.address}
                onChange={(e) =>
                  updateForm(
                    "address",
                    e.target.value
                  )
                }
                autoComplete="street-address"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                }}
              >
                Retour
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isStep2Valid}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--navy)",
                  color: "#FFF",
                  opacity: isStep2Valid ? 1 : 0.5,
                  cursor: isStep2Valid
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                Continuer
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            STEP 3 — COMPTE
        =================================================== */}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Mot de passe *
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10 pr-11`}
                  style={inputStyle}
                  type={
                    showPwd
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    updateForm(
                      "password",
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPwd((value) => !value)
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={
                    showPwd
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPwd ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>

              <p
                className="mt-1.5 text-xs"
                style={{
                  color:
                    form.password &&
                    form.password.length < 8
                      ? "#B91C1C"
                      : "var(--muted-foreground)",
                }}
              >
                Minimum 8 caractères.
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--navy)" }}
              >
                Confirmer le mot de passe *
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10 pr-11`}
                  style={inputStyle}
                  type={
                    showConfirmPwd
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateForm(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPwd(
                      (value) => !value
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={
                    showConfirmPwd
                      ? "Masquer la confirmation"
                      : "Afficher la confirmation"
                  }
                >
                  {showConfirmPwd ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>

              {form.confirmPassword &&
                form.password !==
                  form.confirmPassword && (
                  <p
                    className="mt-1.5 text-xs"
                    style={{ color: "#B91C1C" }}
                  >
                    Les mots de passe ne correspondent
                    pas.
                  </p>
                )}
            </div>

            {/* Informations importantes */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "#F0F9FF",
                border: "1px solid #BAE6FD",
              }}
            >
              <p className="text-xs font-semibold text-blue-800 mb-2">
                Informations importantes
              </p>

              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • Votre compte pourra être vérifié
                  avant l'accès à certaines fonctionnalités.
                </li>

                <li>
                  • Un document justificatif peut vous être
                  demandé.
                </li>

                <li>
                  • Vous recevrez un email de confirmation.
                </li>
              </ul>
            </div>

            {/* CGU */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl border"
              style={{
                borderColor: form.acceptTerms
                  ? "#A7F3D0"
                  : "var(--border)",
                background: form.acceptTerms
                  ? "#F0FDF4"
                  : "#FFFFFF",
              }}
            >
              <input
                type="checkbox"
                id="terms"
                checked={form.acceptTerms}
                onChange={(e) =>
                  updateForm(
                    "acceptTerms",
                    e.target.checked
                  )
                }
                className="mt-0.5 w-4 h-4 rounded cursor-pointer"
              />

              <label
                htmlFor="terms"
                className="text-xs leading-5 cursor-pointer"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                J'accepte les{" "}
                <Link
                  to="/register/enterprise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                  style={{
                    color: "var(--navy)",
                  }}
                >
                  CGU
                </Link>{" "}
                et certifie que les informations
                fournies sont exactes.
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--navy)",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Retour
              </button>

              <button
                type="submit"
                disabled={loading || !isStep3Valid}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "var(--navy)",
                  color: "#FFF",
                  opacity:
                    loading || !isStep3Valid
                      ? 0.5
                      : 1,
                  cursor:
                    loading || !isStep3Valid
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Création...
                  </>
                ) : (
                  <>
                    Créer le compte
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <p
        className="mt-6 text-center text-sm"
        style={{
          color: "var(--muted-foreground)",
        }}
      >
        Vous êtes freelancer ?{" "}
        <Link
          to="/register/freelancer"
          className="font-semibold"
          style={{ color: "var(--navy)" }}
        >
          Inscription Freelancer
        </Link>
      </p>

      <p
        className="mt-2 text-center text-sm"
        style={{
          color: "var(--muted-foreground)",
        }}
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

