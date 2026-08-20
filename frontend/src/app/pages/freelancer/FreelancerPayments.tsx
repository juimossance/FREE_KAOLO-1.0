import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Smartphone,
  Building,
  Download,
  Search,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const transactions = [
  { id: 1, type: "in", label: "Paiement — API REST Banking", from: "FinanceApp", amount: 320000, date: "10 Jun 2026", method: "Mobile Money", status: "Reçu", invoice: "INV-2026-0089" },
  { id: 2, type: "out", label: "Retrait vers Orange Money", from: "Compte free-kaolo", amount: 200000, date: "08 Jun 2026", method: "Orange Money", status: "Traité", invoice: null },
  { id: 3, type: "in", label: "Paiement — Refonte Site", from: "TechCorp", amount: 180000, date: "01 Jun 2026", method: "Virement bancaire", status: "Reçu", invoice: "INV-2026-0081" },
  { id: 4, type: "in", label: "Acompte — E-commerce", from: "RetailCorp", amount: 600000, date: "25 May 2026", method: "Mobile Money", status: "Reçu", invoice: "INV-2026-0075" },
  { id: 5, type: "out", label: "Retrait vers UBA", from: "Compte free-kaolo", amount: 500000, date: "20 May 2026", method: "Virement bancaire", status: "Traité", invoice: null },
  { id: 6, type: "in", label: "Paiement — Dashboard Analytics", from: "DataTech", amount: 400000, date: "15 May 2026", method: "Wave", status: "Reçu", invoice: "INV-2026-0068" },
];

const monthlyData = [
  { month: "Jan", gains: 180000, retraits: 100000 }, { month: "Fév", gains: 240000, retraits: 150000 },
  { month: "Mar", gains: 210000, retraits: 200000 }, { month: "Avr", gains: 320000, retraits: 250000 },
  { month: "Mai", gains: 1000000, retraits: 500000 }, { month: "Jun", gains: 500000, retraits: 200000 },
];

const OPERATORS = [
  { id: "Orange Money", icon: Smartphone, tint: "#F97316", label: "Orange Money" },
  { id: "MTN Money", icon: Smartphone, tint: "#EAB308", label: "MTN Money" },
  { id: "Virement", icon: Building, tint: "var(--navy)", label: "Virement bancaire" },
];

// ── Petits composants ────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    { icon: Lock, text: "Transactions chiffrées" },
    { icon: ShieldCheck, text: "Retraits vérifiés manuellement" },
    { icon: ScrollText, text: "Conforme BCEAO" },
  ];
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 px-1">
      {items.map((it) => (
        <span key={it.text} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
          <it.icon size={13} style={{ color: "var(--success)" }} />
          {it.text}
        </span>
      ))}
    </div>
  );
}

function OperatorButton({
  operator,
  selected,
  onClick,
}: {
  operator: (typeof OPERATORS)[number];
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = operator.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
      style={{
        background: selected ? "var(--navy)" : "var(--card)",
        borderColor: selected ? "var(--navy)" : "var(--border)",
      }}
    >
      <span
        className="flex items-center justify-center w-9 h-9 rounded-full"
        style={{ background: selected ? "rgba(255,255,255,0.15)" : `${operator.tint}1A`, color: selected ? "#FFF" : operator.tint }}
      >
        <Icon size={16} />
      </span>
      <span className="text-xs text-center font-medium" style={{ color: selected ? "#FFF" : "var(--navy)" }}>
        {operator.label}
      </span>
    </button>
  );
}

function TransactionRow({ tx }: { tx: (typeof transactions)[number] }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: tx.type === "in" ? "#DCFCE7" : "#FEE2E2" }}
      >
        {tx.type === "in" ? (
          <ArrowDownLeft size={18} style={{ color: "var(--success)" }} />
        ) : (
          <ArrowUpRight size={18} style={{ color: "var(--destructive)" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--navy)" }}>
          {tx.label}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {tx.from} · {tx.date} · {tx.method}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold tabular-nums" style={{ color: tx.type === "in" ? "var(--success)" : "var(--destructive)" }}>
          {tx.type === "in" ? "+" : "-"}
          {tx.amount.toLocaleString()} FCFA
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {tx.status}
        </p>
      </div>
      {tx.invoice && (
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Télécharger la facture">
          <Download size={14} style={{ color: "var(--navy)" }} />
        </button>
      )}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────

export function FreelancerPayments() {
  const [tab, setTab] = useState<"history" | "withdraw" | "invoices">("history");
  const [search, setSearch] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Orange Money");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [balanceHidden, setBalanceHidden] = useState(false);

  const balance = 1200000;
  const pending = 320000;
  const totalEarned = transactions.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(
    (t) => t.label.toLowerCase().includes(search.toLowerCase()) || t.from.toLowerCase().includes(search.toLowerCase())
  );

  const amountNum = parseFloat(withdrawAmount) || 0;
  const withdrawFee = Math.round(amountNum * 0.01);
  const withdrawNet = amountNum - withdrawFee;

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2";
  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          Paiements reçus
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Gérez vos revenus et retraits
        </p>
      </div>

      <TrustStrip />

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-6 rounded-2xl text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1E293B 60%, #334155 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.08] bg-white" />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-white/70">Solde disponible</p>
            <button
              onClick={() => setBalanceHidden((h) => !h)}
              className="p-1 rounded-md text-white/50 hover:text-white/90 transition-colors"
              aria-label={balanceHidden ? "Afficher le solde" : "Masquer le solde"}
            >
              {balanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-3xl font-bold tabular-nums">{balanceHidden ? "••• •••" : (balance / 1000).toFixed(0) + " k"}</p>
          <p className="text-sm text-white/70">FCFA</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
            <CreditCard size={12} /> Compte free-kaolo
            <span className="w-1 h-1 rounded-full bg-white/30 mx-1" />
            <ShieldCheck size={12} /> Protégé
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            En attente
          </p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "#D97706" }}>
            {(pending / 1000).toFixed(0)} k FCFA
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            1 paiement en cours de validation
          </p>
        </div>
        <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Total gagné
          </p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "var(--success)" }}>
            {(totalEarned / 1000000).toFixed(2)} M FCFA
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Depuis l'inscription
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
          Gains vs retraits
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString()} FCFA`]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
            />
            <Bar dataKey="gains" fill="var(--gold)" radius={[4, 4, 0, 0]} name="Gains" />
            <Bar dataKey="retraits" fill="var(--navy)" radius={[4, 4, 0, 0]} name="Retraits" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: "var(--gold)" }} /> Gains
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: "var(--navy)" }} /> Retraits
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {([
          ["history", "Historique"],
          ["withdraw", "Retirer des fonds"],
          ["invoices", "Factures"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === key ? "#FFF" : "transparent",
              color: tab === key ? "var(--navy)" : "var(--muted-foreground)",
              boxShadow: tab === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une transaction..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {filtered.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: "var(--muted-foreground)" }}>
                Aucune transaction ne correspond à votre recherche
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filtered.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "withdraw" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="max-w-md space-y-5">
            <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
              <div>
                <p className="text-xs font-medium text-green-700">Solde disponible</p>
                <p className="text-lg font-bold text-green-900 tabular-nums">1 200 000 FCFA</p>
              </div>
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>
                Méthode de retrait
              </label>
              <div className="grid grid-cols-3 gap-3">
                {OPERATORS.map((op) => (
                  <OperatorButton key={op.id} operator={op} selected={withdrawMethod === op.id} onClick={() => setWithdrawMethod(op.id)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Numéro / IBAN
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="+225 07 00 00 00 00"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Montant (FCFA)
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                type="number"
                placeholder="ex : 100000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Minimum 10 000 FCFA · Délai 24-48h ouvrées
              </p>
            </div>

            {amountNum > 0 && (
              <div className="rounded-xl border overflow-hidden text-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--secondary)" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>Montant demandé</span>
                  <span className="font-medium tabular-nums" style={{ color: "var(--navy)" }}>
                    {amountNum.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>Frais (1%)</span>
                  <span className="font-medium tabular-nums" style={{ color: "var(--destructive)" }}>
                    − {withdrawFee.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border)", background: "#F0FDF4" }}>
                  <span className="font-semibold" style={{ color: "#166534" }}>
                    Vous recevrez
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: "#166534" }}>
                    {withdrawNet.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            )}

            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              Demander le retrait <ArrowRight size={15} />
            </button>
          </div>

          <div className="p-5 rounded-2xl border bg-white h-fit" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--navy)" }}>
              <ShieldCheck size={16} style={{ color: "var(--success)" }} /> Vos retraits sont protégés
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "var(--foreground)" }}>
              {[
                "Chaque demande est vérifiée manuellement avant traitement",
                "Vos coordonnées ne sont jamais partagées à des tiers",
                "Un reçu est généré automatiquement pour chaque opération",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--gold)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {transactions
              .filter((t) => t.invoice)
              .map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--secondary)" }}>
                    <CreditCard size={16} style={{ color: "var(--navy)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                      {tx.invoice}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {tx.label} · {tx.date}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#166534" }}>
                    Payée
                  </span>
                  <p className="font-semibold tabular-nums" style={{ color: "var(--navy)" }}>
                    {tx.amount.toLocaleString()} FCFA
                  </p>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-slate-50"
                    style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                  >
                    <Download size={13} /> PDF
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}