import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Trash2,
  Eye,
  ShieldCheck,
  Lock,
  AlertCircle,
  FileCheck2,
  ArrowUpRight,
  Info,
} from "lucide-react";

type DocStatus = "Validé" | "En attente" | "Rejeté";

type Doc = {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
  status: DocStatus;
};

const initialDocs: Doc[] = [
  {
    id: 1,
    name: "CNI_Kofi_Mensah.pdf",
    type: "Pièce d'identité",
    size: "1.2 MB",
    date: "10 Jun 2026",
    status: "Validé",
  },
  {
    id: 2,
    name: "Diplome_Ingenieur_2020.pdf",
    type: "Diplôme",
    size: "3.4 MB",
    date: "10 Jun 2026",
    status: "Validé",
  },
  {
    id: 3,
    name: "Attestation_Travail_TechCorp.pdf",
    type: "Attestation de travail",
    size: "0.8 MB",
    date: "09 Jun 2026",
    status: "En attente",
  },
  {
    id: 4,
    name: "Certificat_AWS.pdf",
    type: "Certification",
    size: "2.1 MB",
    date: "05 Jun 2026",
    status: "En attente",
  },
  {
    id: 5,
    name: "Portfolio_2023.pdf",
    type: "Portfolio",
    size: "8.7 MB",
    date: "01 Jun 2026",
    status: "Rejeté",
  },
];

const statusConfig: Record<
  DocStatus,
  {
    icon: React.ReactNode;
    bg: string;
    color: string;
    border: string;
    label: string;
  }
> = {
  Validé: {
    icon: <CheckCircle2 size={14} />,
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
    label: "Vérifié",
  },

  "En attente": {
    icon: <Clock3 size={14} />,
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
    label: "En vérification",
  },

  Rejeté: {
    icon: <XCircle size={14} />,
    bg: "#FEF2F2",
    color: "#B91C1C",
    border: "#FECACA",
    label: "Action requise",
  },
};

const docTypes = [
  "Pièce d'identité",
  "Diplôme",
  "Attestation de travail",
  "Certification",
  "Portfolio",
  "Extrait de casier judiciaire",
  "Autre",
];

export function UploadDocuments() {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [dragging, setDragging] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatedCount = docs.filter(
    (doc) => doc.status === "Validé"
  ).length;

  const pendingCount = docs.filter(
    (doc) => doc.status === "En attente"
  ).length;

  const rejectedCount = docs.filter(
    (doc) => doc.status === "Rejeté"
  ).length;

  const verificationScore =
    docs.length > 0
      ? Math.round((validatedCount / docs.length) * 100)
      : 0;

  const addDocument = (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier ne doit pas dépasser 10 MB.");
      return;
    }

    const newDoc: Doc = {
      id: Date.now(),
      name: file.name,
      type: selectedType || "Document",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("fr-FR"),
      status: "En attente",
    };

    setDocs((current) => [newDoc, ...current]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      addDocument(file);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div className="min-w-0">

            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  color: "var(--gold)",
                }}
              >
                <ShieldCheck size={17} />
              </div>

              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--gold)" }}
              >
                Vérification du profil
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--navy)" }}
            >
              Mes documents
            </h1>

            <p
              className="mt-2 text-sm sm:text-base max-w-2xl leading-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Vérifiez votre identité, vos qualifications et votre
              expérience pour renforcer la confiance des entreprises.
            </p>

          </div>

          {/* Trust indicator */}

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "#ECFDF5",
                color: "#047857",
              }}
            >
              <ShieldCheck size={20} />
            </div>

            <div>
              <p
                className="text-xs font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Niveau de vérification
              </p>

              <p
                className="text-sm font-bold"
                style={{ color: "var(--navy)" }}
              >
                {verificationScore}% vérifié
              </p>
            </div>
          </div>

        </header>

        {/* =====================================================
            TRUST BANNER
        ===================================================== */}

        <section
          className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
          style={{
            background:
              "linear-gradient(135deg, #0F172A 0%, #172033 60%, #1E293B 100%)",
            borderColor: "rgba(212,175,55,0.22)",
          }}
        >

          <div className="absolute -right-10 -top-16 w-52 h-52 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-5">

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(212,175,55,0.14)",
                color: "#D4AF37",
              }}
            >
              <Lock size={21} />
            </div>

            <div className="flex-1">

              <h2 className="text-sm sm:text-base font-semibold text-white">
                Vos documents renforcent votre crédibilité
              </h2>

              <p className="text-xs sm:text-sm mt-1 leading-5 text-white/55 max-w-3xl">
                Les documents validés peuvent être utilisés pour afficher
                des indicateurs de confiance sur votre profil professionnel.
              </p>

            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <ShieldCheck size={14} />
              <span className="text-xs font-medium">
                Données protégées
              </span>
            </div>

          </div>

        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          <StatCard
            icon={<FileCheck2 size={18} />}
            label="Documents vérifiés"
            value={validatedCount}
            description="Documents approuvés"
            iconBg="#ECFDF5"
            iconColor="#047857"
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="En vérification"
            value={pendingCount}
            description="Traitement en cours"
            iconBg="#FFFBEB"
            iconColor="#B45309"
          />

          <StatCard
            icon={<AlertCircle size={18} />}
            label="Action requise"
            value={rejectedCount}
            description="Documents à corriger"
            iconBg="#FEF2F2"
            iconColor="#B91C1C"
          />

        </div>

        {/* =====================================================
            REQUIRED DOCUMENTS
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >

          <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2
                  className="font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  Vérification du profil
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Les éléments ci-dessous permettent d'établir votre
                  identité professionnelle.
                </p>
              </div>

              <Info
                size={17}
                style={{ color: "var(--muted-foreground)" }}
              />

            </div>

          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">

            {[
              {
                name: "Pièce d'identité",
                required: true,
                status: "Validé" as DocStatus,
              },
              {
                name: "Diplôme ou attestation",
                required: true,
                status: "Validé" as DocStatus,
              },
              {
                name: "Photo professionnelle",
                required: false,
                status: "En attente" as DocStatus,
              },
              {
                name: "Portfolio ou références",
                required: false,
                status: "Rejeté" as DocStatus,
              },
            ].map((doc) => {

              const status = statusConfig[doc.status];

              return (
                <div
                  key={doc.name}
                  className="flex items-center gap-3 p-3.5 rounded-xl border transition-colors hover:bg-slate-50"
                  style={{
                    borderColor: "var(--border)",
                    background: "#F8FAFC",
                  }}
                >

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.icon}
                  </div>

                  <div className="flex-1 min-w-0">

                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--navy)" }}
                    >
                      {doc.name}

                      {doc.required && (
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      )}
                    </p>

                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {doc.required
                        ? "Document recommandé pour la vérification"
                        : "Document complémentaire"}
                    </p>

                  </div>

                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                    style={{
                      background: status.bg,
                      color: status.color,
                      border: `1px solid ${status.border}`,
                    }}
                  >
                    {status.label}
                  </span>

                </div>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            UPLOAD
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >

          <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>

            <div className="flex items-center gap-3">

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(212,175,55,0.12)",
                  color: "var(--gold)",
                }}
              >
                <Upload size={17} />
              </div>

              <div>
                <h2
                  className="font-semibold"
                  style={{ color: "var(--navy)" }}
                >
                  Ajouter un document
                </h2>

                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  PDF, JPG ou PNG · 10 MB maximum
                </p>
              </div>

            </div>

          </div>

          <div className="p-5">

            {/* Type */}

            <div className="mb-5">

              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--navy)" }}
              >
                Type de document
              </label>

              <select
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--card)",
                  color: "var(--foreground)",
                }}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">
                  Sélectionner un type
                </option>

                {docTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

            </div>

            {/* Dropzone */}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer"
              style={{
                borderColor: dragging
                  ? "var(--gold)"
                  : "var(--border)",
                background: dragging
                  ? "#FFFBEB"
                  : "#F8FAFC",
              }}
            >

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105"
                style={{
                  background: dragging
                    ? "#FEF3C7"
                    : "#FFFFFF",
                  color: dragging
                    ? "var(--gold)"
                    : "var(--navy)",
                  border: "1px solid var(--border)",
                }}
              >
                <Upload size={23} />
              </div>

              <p
                className="font-semibold text-sm sm:text-base"
                style={{ color: "var(--navy)" }}
              >
                {dragging
                  ? "Déposez le fichier ici"
                  : "Ajoutez votre document"}
              </p>

              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                Glissez-déposez un fichier ou sélectionnez-le depuis votre appareil.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    addDocument(file);
                  }
                }}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 mt-5 rounded-xl text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: "var(--navy)",
                  color: "#FFFFFF",
                }}
              >
                <Upload size={15} />
                Choisir un fichier
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock
                  size={12}
                  style={{ color: "var(--muted-foreground)" }}
                />

                <span
                  className="text-[11px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Vos documents sont utilisés uniquement pour la vérification.
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            DOCUMENT LIST
        ===================================================== */}

        <section
          className="rounded-2xl border bg-white overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >

          <div
            className="px-5 py-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >

            <div>

              <h2
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                Mes documents
              </h2>

              <p
                className="text-xs mt-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                {docs.length} document{docs.length > 1 ? "s" : ""} enregistré{docs.length > 1 ? "s" : ""}
              </p>

            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "#F8FAFC",
                color: "var(--muted-foreground)",
              }}
            >
              <ShieldCheck size={14} />

              <span className="text-xs font-medium">
                Vérification sécurisée
              </span>
            </div>

          </div>

          <div>

            {docs.length === 0 ? (

              <div className="py-14 px-5 text-center">

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: "#F8FAFC",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <FileText size={21} />
                </div>

                <h3
                  className="font-semibold text-sm"
                  style={{ color: "var(--navy)" }}
                >
                  Aucun document
                </h3>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Ajoutez votre premier document pour commencer la vérification.
                </p>

              </div>

            ) : (

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>

                {docs.map((doc) => {

                  const status = statusConfig[doc.status];

                  return (
                    <div
                      key={doc.id}
                      className="px-5 py-4 hover:bg-slate-50 transition-colors"
                    >

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* File */}

                        <div className="flex items-center gap-3 flex-1 min-w-0">

                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "#F1F5F9",
                              color: "var(--navy)",
                            }}
                          >
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0">

                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: "var(--navy)" }}
                            >
                              {doc.name}
                            </p>

                            <p
                              className="text-xs mt-1 truncate"
                              style={{
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {doc.type} · {doc.size} · {doc.date}
                            </p>

                          </div>

                        </div>

                        {/* Status */}

                        <span
                          className="inline-flex self-start sm:self-auto items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                          style={{
                            background: status.bg,
                            color: status.color,
                            border: `1px solid ${status.border}`,
                          }}
                        >
                          {status.icon}
                          {status.label}
                        </span>

                        {/* Actions */}

                        <div className="flex items-center gap-1">

                          <button
                            type="button"
                            title="Voir le document"
                            className="p-2 rounded-lg transition-colors hover:bg-slate-100"
                            style={{
                              color: "var(--navy)",
                            }}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Supprimer le document"
                            onClick={() =>
                              setDocs((current) =>
                                current.filter(
                                  (item) => item.id !== doc.id
                                )
                              )
                            }
                            className="p-2 rounded-lg transition-colors hover:bg-red-50"
                            style={{
                              color: "var(--destructive)",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                      {/* Rejection explanation */}

                      {doc.status === "Rejeté" && (

                        <div
                          className="mt-3 ml-0 sm:ml-14 flex items-start gap-2 px-3 py-2.5 rounded-xl"
                          style={{
                            background: "#FEF2F2",
                            color: "#991B1B",
                          }}
                        >
                          <AlertCircle
                            size={15}
                            className="mt-0.5 flex-shrink-0"
                          />

                          <div className="text-xs">

                            <p className="font-semibold">
                              Document rejeté
                            </p>

                            <p className="mt-0.5 opacity-80">
                              Le fichier semble illisible. Veuillez
                              vérifier sa qualité puis le soumettre à nouveau.
                            </p>

                          </div>

                        </div>

                      )}

                      {/* Pending explanation */}

                      {doc.status === "En attente" && (

                        <div
                          className="mt-3 ml-0 sm:ml-14 flex items-center gap-2 text-xs"
                          style={{
                            color: "#92400E",
                          }}
                        >
                          <Clock3 size={13} />

                          <span>
                            Votre document est actuellement en cours de vérification.
                          </span>

                        </div>

                      )}

                    </div>
                  );
                })}

              </div>

            )}

          </div>

          {/* Footer */}

          {docs.length > 0 && (

            <div
              className="px-5 py-3 border-t flex items-center gap-2"
              style={{
                borderColor: "var(--border)",
                background: "#F8FAFC",
              }}
            >
              <Info
                size={14}
                style={{ color: "var(--muted-foreground)" }}
              />

              <p
                className="text-[11px]"
                style={{
                  color: "var(--muted-foreground)",
                }}
              >
                Les documents validés peuvent contribuer à votre niveau
                de confiance auprès des entreprises.
              </p>

            </div>

          )}

        </section>

      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  iconBg: string;
  iconColor: string;
};

function StatCard({
  icon,
  label,
  value,
  description,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border bg-white"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-3">

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </div>

        <span
          className="text-2xl font-bold"
          style={{ color: "var(--navy)" }}
        >
          {value}
        </span>

      </div>

      <p
        className="text-sm font-semibold mt-4"
        style={{ color: "var(--navy)" }}
      >
        {label}
      </p>

      <p
        className="text-xs mt-1"
        style={{ color: "var(--muted-foreground)" }}
      >
        {description}
      </p>

    </div>
  );
}