import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  BriefcaseBusiness,
  Wallet,
  CalendarDays,
  BarChart3,
  Clock3,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  CircleHelp,
} from "lucide-react";
import { apiFetch } from "../../../services/http";

export function EditProject() {
 
 const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    deadline: "",
    experience: "",
    location: "",
    urgent: false,
    status: "",
});
useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
        try {
            setLoading(true);

            const project = await apiFetch<any>(
                `/projets/projets/${projectId}`
            );

            console.log("Projet récupéré :", project);

          setForm({
  title: project.titre ?? "",
  category: project.categorie ?? "",
  description: project.description ?? "",
  budget: project.budget != null
    ? String(project.budget)
    : "",
  deadline: project.deadline ?? "",
  experience: project.experience ?? "",
  location: project.lieu ?? "",
  urgent: project.urgent ?? false,
  status: project.statut ?? "",
});

        } catch (error) {
            console.error("Erreur récupération projet :", error);
        } finally {
            setLoading(false);
        }
    };

    fetchProject();
}, [projectId]);
  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900";

  const inputStyle = {
    borderColor: "var(--border)",
    background: "#FFFFFF",
    color: "var(--foreground)",
  };
 const { id } = useParams<{ id: string }>();
  const handleSave = async () => {
    if (!id) {
        console.error("ID du projet absent");
        return;
    }

    try {
        setSaved(false);

        const payload = {
            titre: form.title,
            categorie: form.category,
            description: form.description,
            budget: form.budget ? Number(form.budget) : 0,
            deadline: form.deadline,
            experience: form.experience,
            lieu: form.location,
            urgent: form.urgent,
            statut: form.status,
        };

        console.log("Données envoyées :", payload);

        await apiFetch(`/projets/projets/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        setSaved(true);

        setTimeout(() => {
            navigate("/enterprise/projects");
        }, 1000);

    } catch (error) {
        console.error("Erreur modification projet :", error);
        setSaved(false);
    }
};

  const formatFcfa = (value: string) => {
    const number = Number(value);

    if (!number) return "0 FCFA";

    return `${number.toLocaleString("fr-FR")} FCFA`;
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">

          <div className="flex items-start gap-3">

            <button
              onClick={() => navigate("/enterprise/projects")}
              className="mt-1 w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:bg-slate-100"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
                background: "#FFFFFF",
              }}
              aria-label="Retour aux projets"
            >
              <ChevronLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--gold)" }}
                >
                  Gestion du projet
                </span>

                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--muted-foreground)" }}
                />

                <span
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Modification
                </span>

              </div>

              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: "var(--navy)" }}
              >
                Modifier le projet
              </h1>

              <p
                className="text-sm mt-1 max-w-2xl"
                style={{ color: "var(--muted-foreground)" }}
              >
                Mettez à jour les informations de votre mission sans perdre
                le contexte déjà transmis aux freelances.
              </p>
            </div>

          </div>

          {/* Statut */}

          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border self-start"
            style={{
              borderColor: "#BBF7D0",
              background: "#F0FDF4",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#16A34A" }}
            />

            <span
              className="text-xs font-semibold"
              style={{ color: "#166534" }}
            >
              Projet ouvert
            </span>
          </div>

        </div>

        {/* =========================================================
            TRUST NOTICE
        ========================================================= */}

        <div
          className="rounded-2xl border p-4 sm:p-5 mb-6 flex items-start gap-3"
          style={{
            background: "#FFFBEB",
            borderColor: "#FDE68A",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FEF3C7" }}
          >
            <AlertTriangle
              size={18}
              style={{ color: "#B45309" }}
            />
          </div>

          <div className="flex-1">
            <p
              className="text-sm font-semibold"
              style={{ color: "#92400E" }}
            >
              Modification pouvant affecter les candidatures
            </p>

            <p
              className="text-sm mt-1 leading-relaxed"
              style={{ color: "#A16207" }}
            >
              Le budget ou la date limite peuvent influencer les candidatures
              déjà reçues. <strong>12 candidatures</strong> sont actuellement
              en attente.
            </p>
          </div>

          <CircleHelp
            size={17}
            className="hidden sm:block flex-shrink-0"
            style={{ color: "#B45309" }}
          />
        </div>

        {/* =========================================================
            FORM
        ========================================================= */}

        <div className="space-y-5">

          {/* =======================================================
              GENERAL INFORMATION
          ======================================================= */}

          <section
            className="rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >

            <div
              className="px-5 sm:px-6 py-5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "#F1F5F9",
                    color: "var(--navy)",
                  }}
                >
                  <BriefcaseBusiness size={19} />
                </div>

                <div>
                  <h2
                    className="font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Informations générales
                  </h2>

                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Les informations qui définissent votre mission.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">

              {/* Titre */}

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--navy)" }}
                >
                  Titre du projet
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ex. Refonte de notre site web"
                />

                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Utilisez un titre précis permettant aux freelances de
                  comprendre immédiatement la mission.
                </p>
              </div>

              {/* Catégorie + statut */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--navy)" }}
                  >
                    Catégorie
                  </label>

                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                  >
                    {[
                      "Développement Web",
                      "Mobile",
                      "Design UI/UX",
                      "DevOps",
                      "Data Science",
                      "Marketing",
                    ].map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--navy)" }}
                  >
                    Statut du projet
                  </label>

                 <select
    className={inputClass}
    style={inputStyle}
    value={form.status}
    onChange={(e) =>
        setForm((f) => ({
            ...f,
            status: e.target.value,
        }))
    }
>
    <option value="Ouvert">Ouvert</option>
    <option value="En cours">En cours</option>
    <option value="Terminé">Terminé</option>
    <option value="Suspendu">Suspendu</option>
</select>
                </div>

              </div>

              {/* Description */}

              <div>
                <div className="flex items-center justify-between mb-2">

                  <label
                    className="text-sm font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Description
                  </label>

                  <span
                    className="text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {form.description.length} caractères
                  </span>

                </div>

                <textarea
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  rows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Décrivez clairement les objectifs, livrables et attentes du projet..."
                />

                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Une description précise réduit les incompréhensions et
                  améliore la qualité des candidatures.
                </p>
              </div>

            </div>
          </section>

          {/* =======================================================
              BUDGET + DEADLINE
          ======================================================= */}

          <section
            className="rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >

            <div
              className="px-5 sm:px-6 py-5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "#F8F5EA",
                    color: "var(--gold)",
                  }}
                >
                  <Wallet size={19} />
                </div>

                <div>
                  <h2
                    className="font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Budget & délais
                  </h2>

                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Définissez les conditions financières et temporelles.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">

              {/* Budget */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <div>
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "var(--navy)" }}
                    >
                      Fourchette budgétaire
                    </label>

                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Montant prévu pour la réalisation du projet.
                    </p>
                  </div>

                  <BarChart3
                    size={18}
                    style={{ color: "var(--muted-foreground)" }}
                  />

                </div>
<div className="relative max-w-md">
  <span
    className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold"
    style={{ color: "var(--muted-foreground)" }}
  >
    BUDGET
  </span>

  <input
    className={`${inputClass} pl-20 pr-20`}
    style={inputStyle}
    type="number"
    value={form.budget}
    onChange={(e) =>
      setForm((f) => ({
        ...f,
        budget: e.target.value,
      }))
    }
  />

  <span
    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
    style={{ color: "var(--muted-foreground)" }}
  >
    FCFA
  </span>
</div>
               
          

                {/* Résumé budget */}

             <div
  className="mt-3 px-4 py-3 rounded-xl flex items-center justify-between"
  style={{ background: "#F8FAFC" }}
>
  <span
    className="text-xs"
    style={{ color: "var(--muted-foreground)" }}
  >
    Budget affiché aux candidats
  </span>

  <span
    className="text-sm font-bold"
    style={{ color: "var(--navy)" }}
  >
    {formatFcfa(form.budget)}
  </span>
</div>

              </div>

              {/* Date + expérience */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--navy)" }}
                  >
                    Date limite
                  </label>

                  <div className="relative">

                    <CalendarDays
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--muted-foreground)" }}
                    />

                    <input
                      type="date"
                      className={`${inputClass} pl-11`}
                      style={inputStyle}
                      value={form.deadline}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          deadline: e.target.value,
                        }))
                      }
                    />

                  </div>

                </div>

                <div>

                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--navy)" }}
                  >
                    Niveau d'expérience
                  </label>

                  <div className="relative">

                    <BarChart3
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--muted-foreground)" }}
                    />

                    <select
                      className={`${inputClass} pl-11`}
                      style={inputStyle}
                      value={form.experience}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          experience: e.target.value,
                        }))
                      }
                    >
                      <option>Débutant</option>
                      <option>Intermédiaire</option>
                      <option>Expert</option>
                    </select>

                  </div>

                </div>

              </div>

              {/* Localisation */}

              <div>

                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--navy)" }}
                >
                  Mode de travail
                </label>

                <div className="relative">

                  <MapPin
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--muted-foreground)" }}
                  />

                  <select
                    className={`${inputClass} pl-11`}
                    style={inputStyle}
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: e.target.value,
                      }))
                    }
                  >
                    <option>Télétravail</option>
                    <option>Présentiel</option>
                    <option>Hybride</option>
                  </select>

                </div>

              </div>

              {/* Urgence */}

              <div
                className="rounded-xl border p-4 flex items-center gap-3"
                style={{
                  borderColor: form.urgent
                    ? "#FCD34D"
                    : "var(--border)",
                  background: form.urgent
                    ? "#FFFBEB"
                    : "#FFFFFF",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      urgent: !f.urgent,
                    }))
                  }
                  className="w-10 h-6 rounded-full p-1 transition-colors flex-shrink-0"
                  style={{
                    background: form.urgent
                      ? "var(--gold)"
                      : "#CBD5E1",
                  }}
                  aria-label="Modifier le statut urgent"
                >
                  <span
                    className="block w-4 h-4 rounded-full bg-white transition-transform"
                    style={{
                      transform: form.urgent
                        ? "translateX(16px)"
                        : "translateX(0)",
                    }}
                  />
                </button>

                <div className="flex-1">

                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--navy)" }}
                  >
                    Mission urgente
                  </p>

                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Indiquez aux freelances que cette mission nécessite une
                    prise en charge rapide.
                  </p>

                </div>

                <Clock3
                  size={18}
                  style={{
                    color: form.urgent
                      ? "var(--gold)"
                      : "var(--muted-foreground)",
                  }}
                />

              </div>

            </div>
          </section>

          {/* =======================================================
              TRUST SUMMARY
          ======================================================= */}

          <section
            className="rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: "#CBD5E1",
              background: "#F8FAFC",
            }}
          >

            <div className="flex items-start gap-3">

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#E2E8F0",
                  color: "var(--navy)",
                }}
              >
                <ShieldCheck size={18} />
              </div>

              <div>

                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  Vérifiez vos modifications
                </h3>

                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Avant de sauvegarder, vérifiez notamment le budget, la date
                  limite et le statut du projet. Ces informations peuvent
                  influencer les décisions des freelances.
                </p>

              </div>

            </div>

          </section>

          {/* =======================================================
              ACTIONS
          ======================================================= */}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 pb-8">

            <button
              onClick={() => navigate("/enterprise/projects")}
              className="sm:flex-1 py-3.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
              style={{
                borderColor: "var(--border)",
                color: "var(--navy)",
                background: "#FFFFFF",
              }}
            >
              Annuler
            </button>

            <button
              onClick={handleSave}
              disabled={saved}
              className="sm:flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: saved
                  ? "var(--success)"
                  : "var(--navy)",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)",
              }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={17} />
                  Modifications enregistrées
                </>
              ) : (
                <>
                  <Save size={17} />
                  Enregistrer les modifications
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}