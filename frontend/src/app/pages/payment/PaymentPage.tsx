import { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  CheckCircle,
  Loader2,
  Shield,
  ShieldCheck,
  Lock,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEscrowPolling } from "../../../hooks/useEscrowPolling";
import { useAuth } from "../../../hooks/useAuth";

import {
  escrowService,
  type EscrowTransactionDto,
  type SoldeDto,
} from "../../../services/escrowService";

import { projetService } from "../../../services/projetService";

type ProjetDepot = {
  id: number;
  titre: string;
  freelancerNom?: string;
};

const TAUX_FRAIS_DEPOT = 0.015;
const TAUX_FRAIS_RETRAIT = 0.01;

const OPERATORS = [
  { id: "ORANGE", label: "Orange Money", short: "Orange", tint: "#F97316" },
  { id: "MTN", label: "MTN Mobile Money", short: "MTN", tint: "#EAB308" },
];

const STATUT_CONFIG: Record<
  EscrowTransactionDto["statut"],
  { label: string; bg: string; fg: string; icon: typeof CheckCircle }
> = {
  EN_ATTENTE: {
    label: "En attente de confirmation",
    bg: "#FEF3C7",
    fg: "#92400E",
    icon: Clock,
  },
  BLOQUE: { label: "Bloqué en escrow", bg: "#DBEAFE", fg: "#1E40AF", icon: Lock },
  LIBERE: { label: "Libéré", bg: "#DCFCE7", fg: "#166534", icon: CheckCircle },
  RETIRE: { label: "Retiré", bg: "#DCFCE7", fg: "#166534", icon: CheckCircle },
  ECHEC: { label: "Échec", bg: "#FEE2E2", fg: "#991B1B", icon: XCircle },
  REMBOURSE: {
    label: "Remboursé",
    bg: "#F1F5F9",
    fg: "#475569",
    icon: ArrowUpRight,
  },
};

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2";

const inputStyle = {
  borderColor: "var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
};

const cardStyle = { borderColor: "var(--border)" };

const gradientStyle = {
  background:
    "linear-gradient(135deg, var(--navy) 0%, #1E293B 60%, #334155 100%)",
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

const cleanPhone = (value: string) => value.replace(/\s+/g, "");

const isPhoneValid = (value: string) => /^[6-9]\d{8}$/.test(cleanPhone(value));

function TrustStrip() {
  const items = [
    { icon: Lock, text: "Paiements chiffrés bout-en-bout" },
    { icon: ShieldCheck, text: "Fonds protégés jusqu'à confirmation" },
    { icon: Shield, text: "Sécurisé par CamPay" },
  ];

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 px-1">
      {items.map((it) => (
        <span
          key={it.text}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          <it.icon size={13} style={{ color: "var(--success)" }} />
          {it.text}
        </span>
      ))}
    </div>
  );
}

function StatutBadge({ statut }: { statut: EscrowTransactionDto["statut"] }) {
  const cfg = STATUT_CONFIG[statut];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  );
}

type BannerKind = "warning" | "success" | "error";

const BANNER_STYLES: Record<
  BannerKind,
  { bg: string; fg: string; icon: typeof CheckCircle; spin?: boolean }
> = {
  warning: { bg: "#FEF3C7", fg: "#92400E", icon: Loader2, spin: true },
  success: { bg: "#DCFCE7", fg: "#166534", icon: CheckCircle },
  error: { bg: "#FEE2E2", fg: "#991B1B", icon: AlertCircle },
};

function Banner({
  kind,
  icon,
  children,
}: {
  kind: BannerKind;
  icon?: typeof CheckCircle;
  children: React.ReactNode;
}) {
  const s = BANNER_STYLES[kind];
  const Icon = icon ?? s.icon;

  return (
    <div
      className="p-3 rounded-xl flex items-center gap-2"
      style={{ background: s.bg }}
    >
      <Icon
        size={15}
        className={s.spin ? "animate-spin" : undefined}
        style={{ color: s.fg }}
      />
      <p className="text-sm font-medium" style={{ color: s.fg }}>
        {children}
      </p>
    </div>
  );
}

function OperatorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--navy)" }}
      >
        Opérateur
      </label>

      <div className="grid grid-cols-2 gap-2">
        {OPERATORS.map((op) => {
          const active = value === op.id;

          return (
            <button
              key={op.id}
              type="button"
              onClick={() => onChange(op.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border transition-all"
              style={{
                background: active ? "var(--navy)" : "var(--card)",
                borderColor: active ? "var(--navy)" : "var(--border)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: active ? "#FFF" : op.tint }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: active ? "#FFF" : "var(--navy)" }}
              >
                {op.short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PhoneField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--navy)" }}
      >
        {label}
      </label>

      <div className="relative">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ color: "var(--navy)" }}
        >
          +237
        </span>

        <input
          className={inputClass}
          style={{ ...inputStyle, paddingLeft: "52px" }}
          type="tel"
          inputMode="numeric"
          placeholder="6 XX XX XX XX"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

function TransactionRow({
  tx,
  isIncoming,
}: {
  tx: EscrowTransactionDto;
  isIncoming: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isIncoming ? "#DCFCE7" : "#FEE2E2" }}
      >
        {isIncoming ? (
          <ArrowDownLeft size={18} style={{ color: "var(--success)" }} />
        ) : (
          <ArrowUpRight size={18} style={{ color: "var(--destructive)" }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--navy)" }}
        >
          {tx.projetTitre}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {formatDate(tx.createdAt)} · {tx.operateur}
        </p>
      </div>

      <div className="text-right">
        <p
          className="font-bold tabular-nums"
          style={{
            color: isIncoming ? "var(--success)" : "var(--destructive)",
          }}
        >
          {isIncoming ? "+" : "-"}
          {tx.montant.toLocaleString()} FCFA
        </p>
        <StatutBadge statut={tx.statut} />
      </div>
    </div>
  );
}

type EntrepriseTab = "depot" | "escrows" | "history" | "invoices";
type FreelancerTab = "solde" | "withdrawals" | "history" | "invoices";

export function PaymentPage() {
  const { user } = useAuth();

  const isEntreprise = user?.role === "ENTREPRISE";
  const isFreelancer = user?.role === "FREELANCER";

  const [tab, setTab] = useState<EntrepriseTab | FreelancerTab>(
    isEntreprise ? "depot" : "solde"
  );
  const [transactions, setTransactions] = useState<EscrowTransactionDto[]>([]);
  const [solde, setSolde] = useState<SoldeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxId, setPendingTxId] = useState<number | null>(null);

  const polledTx = useEscrowPolling(pendingTxId);

  const chargerDonnees = useCallback(async () => {
    try {
      setError(null);
      setTransactions(await escrowService.getMesTransactions());

      if (isFreelancer) {
        setSolde(await escrowService.getSolde());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [isFreelancer]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  useEffect(() => {
    if (polledTx && polledTx.statut !== "EN_ATTENTE") {
      setPendingTxId(null);
      chargerDonnees();
    }
  }, [polledTx, chargerDonnees]);

  const tabs = isEntreprise
    ? [
        { key: "depot" as const, label: "Déposer des fonds", icon: <Smartphone size={15} /> },
        { key: "escrows" as const, label: "Mes escrows en cours", icon: <ShieldCheck size={15} /> },
        { key: "history" as const, label: "Historique", icon: <CreditCard size={15} /> },
        { key: "invoices" as const, label: "Reçus", icon: <Download size={15} /> },
      ]
    : [
        { key: "solde" as const, label: "Mon solde", icon: <ShieldCheck size={15} /> },
        { key: "withdrawals" as const, label: "Retraits", icon: <ArrowUpRight size={15} /> },
        { key: "history" as const, label: "Historique", icon: <CreditCard size={15} /> },
        { key: "invoices" as const, label: "Factures", icon: <Download size={15} /> },
      ];

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center h-64">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "var(--navy)" }}
        />
      </div>
    );
  }

  // un dépôt libéré garde son reçu
  const facturesEntreprise = transactions.filter(
    (t) =>
      t.typeOperation === "DEPOT" &&
      (t.statut === "BLOQUE" || t.statut === "LIBERE")
  );

  const facturesFreelancer = transactions.filter(
    (t) => t.typeOperation === "LIBERATION" && t.statut === "LIBERE"
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          Gestion des paiements
        </h2>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          Paiements sécurisés en escrow, propulsés par CamPay
        </p>
      </div>

      <TrustStrip />

      {error && <Banner kind="error">{error}</Banner>}

      {isFreelancer && solde && <SoldeFreelancerCards solde={solde} />}
      {isEntreprise && <SoldeEntrepriseCards transactions={transactions} />}

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.key ? "#FFF" : "transparent",
              color: tab === t.key ? "var(--navy)" : "var(--muted-foreground)",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {isEntreprise && tab === "depot" && (
        <DepotForm onSuccess={setPendingTxId} pendingTx={polledTx} />
      )}

      {isEntreprise && tab === "escrows" && (
        <EscrowsEnCours
          transactions={transactions.filter(
            (t) => t.typeOperation === "DEPOT" && t.statut === "BLOQUE"
          )}
          onLibere={async (id) => {
            await escrowService.libererFonds(id);
            await chargerDonnees();
          }}
        />
      )}

      {isFreelancer && tab === "solde" && solde && (
        <DetailSoldeFreelancer />
      )}

      {isFreelancer && tab === "withdrawals" && (
        <RetraitForm
          soldeDisponible={solde?.soldeDisponible ?? 0}
          onSuccess={setPendingTxId}
          pendingTx={polledTx}
          historique={transactions.filter((t) => t.typeOperation === "RETRAIT")}
        />
      )}

      {tab === "history" && (
        <HistoriqueTab transactions={transactions} isFreelancer={isFreelancer} />
      )}

      {tab === "invoices" && (
        <FacturesTab
          transactions={isFreelancer ? facturesFreelancer : facturesEntreprise}
        />
      )}
    </div>
  );
}

function SoldeEntrepriseCards({
  transactions,
}: {
  transactions: EscrowTransactionDto[];
}) {
  const somme = (type: string, statut: string) =>
    transactions
      .filter((t) => t.typeOperation === type && t.statut === statut)
      .reduce((s, t) => s + t.montant, 0);

  const totalBloque = somme("DEPOT", "BLOQUE");
  const totalLibere = somme("LIBERATION", "LIBERE");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="p-6 rounded-2xl text-white relative overflow-hidden"
        style={gradientStyle}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.08] bg-white" />

        <p className="text-sm text-white/70 mb-1">
          Actuellement bloqué en escrow
        </p>
        <p className="text-3xl font-bold tabular-nums">
          {totalBloque.toLocaleString()}
        </p>
        <p className="text-sm text-white/70">FCFA</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
          <Lock size={12} />
          Protégé jusqu'à validation du travail
        </div>
      </div>

      <div className="p-5 rounded-2xl border bg-white" style={cardStyle}>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Total libéré aux freelances
        </p>
        <p
          className="text-2xl font-bold mt-1 tabular-nums"
          style={{ color: "var(--success)" }}
        >
          {totalLibere.toLocaleString()} FCFA
        </p>
      </div>
    </div>
  );
}

function SoldeFreelancerCards({ solde }: { solde: SoldeDto }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        className="p-6 rounded-2xl text-white relative overflow-hidden"
        style={gradientStyle}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.08] bg-white" />

        <p className="text-sm text-white/70 mb-1">
          Solde disponible pour retrait
        </p>
        <p className="text-3xl font-bold tabular-nums">
          {solde.soldeDisponible.toLocaleString()}
        </p>
        <p className="text-sm text-white/70">FCFA</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
          <ShieldCheck size={12} />
          Déjà libéré, prêt à être retiré
        </div>
      </div>

      <div className="p-5 rounded-2xl border bg-white" style={cardStyle}>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          En attente (escrow bloqué)
        </p>
        <p
          className="text-2xl font-bold mt-1 tabular-nums"
          style={{ color: "#D97706" }}
        >
          {solde.soldeEnAttente.toLocaleString()} FCFA
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Libéré dès validation par l'entreprise
        </p>
      </div>
    </div>
  );
}

function DetailSoldeFreelancer() {
  return (
    <div className="p-6 rounded-2xl border bg-white space-y-3" style={cardStyle}>
      <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
        Comment ça fonctionne
      </h3>

      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Quand une entreprise dépose des fonds pour un projet, l'argent est
        bloqué en escrow — il n'est ni chez elle, ni chez vous. Une fois le
        travail validé, l'entreprise libère les fonds : ils rejoignent votre
        solde disponible ci-dessus, que vous pouvez retirer à tout moment vers
        Orange Money ou MTN Mobile Money.
      </p>
    </div>
  );
}

function DepotForm({
  onSuccess,
  pendingTx,
}: {
  onSuccess: (id: number) => void;
  pendingTx: EscrowTransactionDto | null;
}) {
  const [form, setForm] = useState({
    projetId: "",
    operateur: "ORANGE",
    telephone: "",
    montant: "",
  });
  const [projets, setProjets] = useState<ProjetDepot[]>([]);
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const montant = parseFloat(form.montant) || 0;

  // même arrondi que le backend (supérieur)
  const frais = Math.ceil(montant * TAUX_FRAIS_DEPOT);
  const total = montant + frais;

  useEffect(() => {
    const chargerProjets = async () => {
      setLoadingProjets(true);
      setErrorMsg(null);

      try {
        setProjets(await projetService.getMesProjet());
      } catch (e) {
        console.error("Erreur chargement projets :", e);
        setErrorMsg(
          e instanceof Error ? e.message : "Impossible de charger les projets."
        );
      } finally {
        setLoadingProjets(false);
      }
    };

    chargerProjets();
  }, []);

  const projetSelectionne = projets.find(
    (p) => String(p.id) === form.projetId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.projetId) {
      setErrorMsg("Veuillez sélectionner un projet.");
      return;
    }
    if (!projetSelectionne) {
      setErrorMsg("Le projet sélectionné est introuvable.");
      return;
    }
    if (montant <= 0) {
      setErrorMsg("Veuillez saisir un montant valide.");
      return;
    }
    if (!form.telephone.trim()) {
      setErrorMsg("Veuillez saisir le numéro à débiter.");
      return;
    }
    if (!isPhoneValid(form.telephone)) {
      setErrorMsg("Veuillez saisir un numéro camerounais valide.");
      return;
    }

    setSending(true);

    try {
      const tx = await escrowService.initierDepot(
        projetSelectionne.id,
        montant,
        cleanPhone(form.telephone),
        form.operateur
      );

      onSuccess(tx.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors du dépôt");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl border bg-white space-y-5" style={cardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} style={{ color: "var(--success)" }} />

          <div>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
              Déposer des fonds en escrow
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sélectionnez le projet à financer
            </p>
          </div>
        </div>

        {pendingTx?.statut === "EN_ATTENTE" && (
          <Banner kind="warning">
            Validez la demande sur votre téléphone ({pendingTx.operateur})...
          </Banner>
        )}

        {pendingTx?.statut === "BLOQUE" && (
          <Banner kind="success">Fonds bloqués en escrow avec succès !</Banner>
        )}

        {pendingTx?.statut === "ECHEC" && (
          <Banner kind="error" icon={XCircle}>
            Le dépôt a échoué, réessayez.
          </Banner>
        )}

        {errorMsg && <Banner kind="error">{errorMsg}</Banner>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PROJET */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--navy)" }}
            >
              Projet concerné
            </label>

            {loadingProjets ? (
              <div
                className="w-full px-4 py-3 rounded-xl border flex items-center gap-2 text-sm"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <Loader2 size={15} className="animate-spin" />
                Chargement de vos projets...
              </div>
            ) : projets.length === 0 ? (
              <div
                className="p-4 rounded-xl border text-sm"
                style={{
                  borderColor: "#FCA5A5",
                  background: "#FEF2F2",
                  color: "#991B1B",
                }}
              >
                <p className="font-medium">
                  Aucun projet disponible pour un dépôt escrow.
                </p>
                <p className="text-xs mt-1">
                  Un projet doit avoir un freelance assigné avant de pouvoir
                  recevoir des fonds.
                </p>
              </div>
            ) : (
              <select
                className={inputClass}
                style={inputStyle}
                value={form.projetId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projetId: e.target.value }))
                }
                required
              >
                <option value="">Sélectionnez un projet</option>

                {projets.map((projet) => (
                  <option key={projet.id} value={projet.id}>
                    {projet.titre}
                    {projet.freelancerNom ? ` — ${projet.freelancerNom}` : ""}
                  </option>
                ))}
              </select>
            )}

            {projetSelectionne && (
              <div
                className="mt-2 px-3 py-2 rounded-lg"
                style={{ background: "var(--secondary)" }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Projet sélectionné
                </p>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: "var(--navy)" }}
                >
                  {projetSelectionne.titre}
                </p>
              </div>
            )}
          </div>

          <OperatorPicker
            value={form.operateur}
            onChange={(id) => setForm((f) => ({ ...f, operateur: id }))}
          />

          <PhoneField
            label="Numéro à débiter"
            value={form.telephone}
            onChange={(v) => setForm((f) => ({ ...f, telephone: v }))}
          />

          {/* MONTANT */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--navy)" }}
            >
              Montant (FCFA)
            </label>

            <input
              className={inputClass}
              style={inputStyle}
              type="number"
              min="1"
              step="1"
              placeholder="ex : 150000"
              value={form.montant}
              onChange={(e) =>
                setForm((f) => ({ ...f, montant: e.target.value }))
              }
              required
            />
          </div>

          {/* RECAP */}
          {montant > 0 && (
            <div
              className="rounded-xl border overflow-hidden text-sm"
              style={cardStyle}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: "var(--secondary)" }}
              >
                <span style={{ color: "var(--muted-foreground)" }}>
                  Montant du projet
                </span>
                <span
                  className="font-medium tabular-nums"
                  style={{ color: "var(--navy)" }}
                >
                  {montant.toLocaleString()} FCFA
                </span>
              </div>

              <div
                className="flex items-center justify-between px-4 py-2.5 border-t"
                style={cardStyle}
              >
                <span style={{ color: "var(--muted-foreground)" }}>
                  Frais plateforme (1,5 %)
                </span>
                <span
                  className="font-medium tabular-nums"
                  style={{ color: "var(--navy)" }}
                >
                  {frais.toLocaleString()} FCFA
                </span>
              </div>

              <div
                className="flex items-center justify-between px-4 py-3 border-t"
                style={{ borderColor: "var(--border)", background: "#F0F9FF" }}
              >
                <span className="font-semibold" style={{ color: "#1E40AF" }}>
                  Total débité
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: "#1E40AF" }}
                >
                  {total.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={
              sending ||
              pendingTx?.statut === "EN_ATTENTE" ||
              projets.length === 0 ||
              !projetSelectionne
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
            style={{
              background: "var(--navy)",
              color: "#FFF",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Envoi de la demande...
              </>
            ) : (
              <>
                <Lock size={15} />
                Bloquer les fonds en escrow
              </>
            )}
          </button>
        </form>
      </div>

      {/* COMMENT CA MARCHE */}
      <div className="p-5 rounded-2xl border bg-white" style={cardStyle}>
        <h4 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Comment ça marche ?
        </h4>

        <ol className="relative space-y-4 before:absolute before:left-[13px] before:top-1 before:bottom-1 before:w-px before:bg-[var(--border)]">
          {[
            "Vous choisissez le projet à financer",
            "Vous indiquez le montant convenu",
            "Vous confirmez sur votre téléphone (USSD)",
            "Les fonds sont bloqués en escrow, ni chez vous ni chez le freelance",
            "Vous libérez les fonds une fois le travail validé",
          ].map((text, i) => (
            <li key={text} className="relative flex items-start gap-3">
              <span
                className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "var(--secondary)", color: "var(--navy)" }}
              >
                {i + 1}
              </span>
              <p className="text-sm pt-1" style={{ color: "var(--foreground)" }}>
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function EscrowsEnCours({
  transactions,
  onLibere,
}: {
  transactions: EscrowTransactionDto[];
  onLibere: (id: number) => Promise<void>;
}) {
  const [liberatingId, setLiberatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLibere = async (id: number) => {
    setLiberatingId(id);
    setError(null);

    try {
      await onLibere(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la libération");
    } finally {
      setLiberatingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div
        className="p-8 rounded-2xl border bg-white text-center"
        style={cardStyle}
      >
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Aucun fonds bloqué en escrow actuellement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <Banner kind="error">{error}</Banner>}

      <div
        className="rounded-2xl border bg-white overflow-hidden"
        style={cardStyle}
      >
        <div className="divide-y">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#DBEAFE" }}
              >
                <Lock size={16} style={{ color: "#1E40AF" }} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--navy)" }}
                >
                  {tx.projetTitre}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Bloqué le {formatDate(tx.createdAt)}
                </p>
              </div>

              <p
                className="font-bold tabular-nums"
                style={{ color: "var(--navy)" }}
              >
                {tx.montant.toLocaleString()} FCFA
              </p>

              <button
                onClick={() => handleLibere(tx.id)}
                disabled={liberatingId === tx.id}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--success)", color: "#FFF" }}
              >
                {liberatingId === tx.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle size={13} />
                )}
                Libérer les fonds
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RetraitForm({
  soldeDisponible,
  onSuccess,
  pendingTx,
  historique,
}: {
  soldeDisponible: number;
  onSuccess: (id: number) => void;
  pendingTx: EscrowTransactionDto | null;
  historique: EscrowTransactionDto[];
}) {
  const [form, setForm] = useState({
    operateur: "ORANGE",
    telephone: "",
    montant: "",
  });
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const montant = parseFloat(form.montant) || 0;
  const depasseLeSolde = montant > soldeDisponible;

  // même arrondi que le backend (inférieur)
  const frais = Math.floor(montant * TAUX_FRAIS_RETRAIT);
  const montantNet = Math.max(0, montant - frais);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (montant <= 0) {
      setErrorMsg("Veuillez saisir un montant valide.");
      return;
    }
    if (montant < 10) {
      setErrorMsg("Le montant minimum de retrait est de 10 FCFA.");
      return;
    }
    if (depasseLeSolde) {
      setErrorMsg("Le montant dépasse votre solde disponible.");
      return;
    }
    if (!form.telephone.trim()) {
      setErrorMsg("Veuillez saisir le numéro de réception.");
      return;
    }
    if (!isPhoneValid(form.telephone)) {
      setErrorMsg("Veuillez saisir un numéro camerounais valide.");
      return;
    }

    setSending(true);

    try {
      const tx = await escrowService.initierRetrait(
        montant,
        cleanPhone(form.telephone),
        form.operateur
      );

      onSuccess(tx.id);
      setForm({ operateur: "ORANGE", telephone: "", montant: "" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors du retrait");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <div
        className="p-4 rounded-2xl border flex items-center justify-between"
        style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}
      >
        <div>
          <p className="text-xs font-medium text-green-700">
            Solde disponible pour retrait
          </p>
          <p className="text-lg font-bold text-green-900 tabular-nums">
            {soldeDisponible.toLocaleString()} FCFA
          </p>
        </div>

        <ShieldCheck size={20} className="text-green-600" />
      </div>

      <div className="p-6 rounded-2xl border bg-white space-y-4" style={cardStyle}>
        <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
          Demander un retrait
        </h3>

        {pendingTx?.statut === "EN_ATTENTE" && (
          <Banner kind="warning">Envoi en cours vers {pendingTx.operateur}...</Banner>
        )}

        {pendingTx?.statut === "RETIRE" && (
          <Banner kind="success">Retrait effectué avec succès !</Banner>
        )}

        {pendingTx?.statut === "ECHEC" && (
          <Banner kind="error" icon={XCircle}>
            Le retrait a échoué.
          </Banner>
        )}

        {errorMsg && <Banner kind="error">{errorMsg}</Banner>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <OperatorPicker
            value={form.operateur}
            onChange={(id) => setForm((f) => ({ ...f, operateur: id }))}
          />

          <PhoneField
            label="Numéro de réception"
            value={form.telephone}
            onChange={(v) => setForm((f) => ({ ...f, telephone: v }))}
          />

          {/* MONTANT */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--navy)" }}
            >
              Montant (FCFA)
            </label>

            <input
              className={inputClass}
              style={{
                ...inputStyle,
                borderColor: depasseLeSolde
                  ? "var(--destructive)"
                  : inputStyle.borderColor,
              }}
              type="number"
              min="10"
              step="1"
              placeholder="Minimum 10 FCFA"
              value={form.montant}
              onChange={(e) =>
                setForm((f) => ({ ...f, montant: e.target.value }))
              }
              required
            />

            <p
              className="text-xs mt-1"
              style={{
                color: depasseLeSolde
                  ? "var(--destructive)"
                  : "var(--muted-foreground)",
              }}
            >
              Frais : 1% · Délai : 24-48h ouvrées
            </p>

            {montant > 0 && (
              <div
                className="mt-2 p-3 rounded-xl"
                style={{ background: "var(--secondary)" }}
              >
                <div className="flex justify-between text-xs">
                  <span>Montant demandé</span>
                  <span className="font-semibold">
                    {montant.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex justify-between text-xs mt-1">
                  <span>Frais de retrait</span>
                  <span className="font-semibold">
                    {frais.toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t">
                  <span>Vous recevez</span>
                  <span>{montantNet.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={sending || pendingTx?.statut === "EN_ATTENTE"}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
            style={{
              background: "var(--navy)",
              color: "#FFF",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Envoi...
              </>
            ) : (
              "Demander le retrait"
            )}
          </button>
        </form>
      </div>

      {/* HISTORIQUE RETRAITS */}
      <div
        className="rounded-2xl border bg-white overflow-hidden"
        style={cardStyle}
      >
        <div className="px-5 py-3.5 border-b" style={cardStyle}>
          <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
            Derniers retraits
          </p>
        </div>

        {historique.length === 0 ? (
          <p
            className="px-5 py-4 text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Aucun retrait pour le moment.
          </p>
        ) : (
          historique.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-slate-50"
              style={cardStyle}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FEE2E2" }}
              >
                <ArrowUpRight size={16} style={{ color: "var(--destructive)" }} />
              </div>

              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--navy)" }}
                >
                  {tx.operateur}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatDate(tx.createdAt)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="font-bold tabular-nums"
                  style={{ color: "var(--destructive)" }}
                >
                  -{tx.montant.toLocaleString()} FCFA
                </p>
                <StatutBadge statut={tx.statut} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HistoriqueTab({
  transactions,
  isFreelancer,
}: {
  transactions: EscrowTransactionDto[];
  isFreelancer: boolean;
}) {
  const monthlyData = buildMonthlyData(transactions, isFreelancer);

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl border bg-white" style={cardStyle}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Évolution des paiements
        </h3>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString()} FCFA`]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
            />

            <Bar
              dataKey="montant"
              fill="var(--gold)"
              radius={[4, 4, 0, 0]}
              name="Montant"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="rounded-2xl border bg-white overflow-hidden"
        style={cardStyle}
      >
        {transactions.length === 0 ? (
          <p
            className="px-5 py-6 text-sm text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            Aucune transaction pour le moment.
          </p>
        ) : (
          <div className="divide-y">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                isIncoming={isFreelancer && tx.typeOperation === "LIBERATION"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FacturesTab({
  transactions,
}: {
  transactions: EscrowTransactionDto[];
}) {
  if (transactions.length === 0) {
    return (
      <div
        className="p-8 rounded-2xl border bg-white text-center"
        style={cardStyle}
      >
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Aucun document disponible.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden"
      style={cardStyle}
    >
      <div className="divide-y">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--secondary)" }}
            >
              <CreditCard size={16} style={{ color: "var(--navy)" }} />
            </div>

            <div className="flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--navy)" }}
              >
                REF-{tx.id.toString().padStart(6, "0")}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {tx.projetTitre} · {formatDate(tx.createdAt)}
              </p>
            </div>

            <StatutBadge statut={tx.statut} />

            <p
              className="font-semibold tabular-nums"
              style={{ color: "var(--navy)" }}
            >
              {tx.montant.toLocaleString()} FCFA
            </p>

            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-slate-50"
              style={{ borderColor: "var(--border)", color: "var(--navy)" }}
            >
              <Download size={13} />
              PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMonthlyData(
  transactions: EscrowTransactionDto[],
  isFreelancer: boolean
) {
  const type = isFreelancer ? "LIBERATION" : "DEPOT";
  const byMonth = new Map<string, number>();

  transactions
    .filter((t) => t.typeOperation === type)
    .forEach((t) => {
      // l'année évite de fusionner janvier 2025 et janvier 2026
      const month = new Date(t.createdAt).toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });

      byMonth.set(month, (byMonth.get(month) ?? 0) + t.montant);
    });

  return Array.from(byMonth.entries()).map(([month, montant]) => ({
    month,
    montant,
  }));
}