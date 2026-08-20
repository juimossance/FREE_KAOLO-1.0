import { useState } from "react";
import {
  Smartphone,
  Building,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  CheckCircle,
  Loader2,
  Shield,
  ShieldCheck,
  Lock,
  ScrollText,
  AlertCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type PayTab = "mobile-money" | "bank" | "history" | "invoices" | "withdrawals";

const transactions = [
  { id: 1, type: "in", label: "Paiement — API REST Banking", from: "FinanceApp", amount: 320000, date: "10 Jun 2026", method: "Orange Money", status: "Reçu", invoice: "INV-2026-0089" },
  { id: 2, type: "out", label: "Retrait vers Orange Money", from: "Vous", amount: 200000, date: "08 Jun 2026", method: "Orange Money", status: "Traité", invoice: null },
  { id: 3, type: "in", label: "Paiement — Refonte Site", from: "TechCorp", amount: 180000, date: "01 Jun 2026", method: "Virement", status: "Reçu", invoice: "INV-2026-0081" },
  { id: 4, type: "in", label: "Acompte — E-commerce", from: "RetailCorp", amount: 600000, date: "25 May 2026", method: "Wave", status: "Reçu", invoice: "INV-2026-0075" },
  { id: 5, type: "out", label: "Retrait vers UBA", from: "Vous", amount: 500000, date: "20 May 2026", method: "Virement", status: "Traité", invoice: null },
  { id: 6, type: "in", label: "Paiement — Dashboard", from: "DataTech", amount: 400000, date: "15 May 2026", method: "MTN Money", status: "Reçu", invoice: "INV-2026-0068" },
];

const monthlyData = [
  { month: "Jan", reçu: 180000 }, { month: "Fév", reçu: 240000 },
  { month: "Mar", reçu: 210000 }, { month: "Avr", reçu: 320000 },
  { month: "Mai", reçu: 1000000 }, { month: "Jun", reçu: 500000 },
];

const OPERATORS = [
  { id: "Orange Money", short: "Orange", tint: "#F97316", limit: "500 000 FCFA / transaction" },
  { id: "MTN Money", short: "MTN", tint: "#EAB308", limit: "300 000 FCFA / transaction" },
  { id: "Wave", short: "Wave", tint: "#3B82F6", limit: "1 000 000 FCFA / transaction" },
];

const WITHDRAW_METHODS = [
  { id: "om", label: "Orange", tint: "#F97316", icon: Smartphone },
  { id: "mtn", label: "MTN", tint: "#EAB308", icon: Smartphone },
  { id: "bank", label: "Virement", tint: "var(--navy)", icon: Building },
];

// ── Petits composants ────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    { icon: Lock, text: "Paiements chiffrés bout-en-bout" },
    { icon: ShieldCheck, text: "Fonds protégés jusqu'à confirmation" },
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
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Télécharger la facture">
          <Download size={14} style={{ color: "var(--navy)" }} />
        </button>
      )}
    </div>
  );
}

export function PaymentPage() {
  const [tab, setTab] = useState<PayTab>("mobile-money");
  const [mobileForm, setMobileForm] = useState({ operator: "Orange Money", phone: "", amount: "", name: "" });
  const [bankForm, setBankForm] = useState({ iban: "", bic: "", bankName: "", holderName: "", amount: "", reference: "" });
  const [withdrawMethod, setWithdrawMethod] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all focus:ring-2";
  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const tabs: { key: PayTab; label: string; icon: React.ReactNode }[] = [
    { key: "mobile-money", label: "Mobile Money", icon: <Smartphone size={15} /> },
    { key: "bank", label: "Bancaire", icon: <Building size={15} /> },
    { key: "history", label: "Historique", icon: <CreditCard size={15} /> },
    { key: "invoices", label: "Factures", icon: <Download size={15} /> },
    { key: "withdrawals", label: "Retraits", icon: <ArrowUpRight size={15} /> },
  ];

  const mobileAmount = parseFloat(mobileForm.amount) || 0;
  const mobileFee = Math.round(mobileAmount * 0.015);
  const mobileTotal = mobileAmount + mobileFee;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>
          Gestion des paiements
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Paiements sécurisés et protégés par free-kaolo
        </p>
      </div>

      <TrustStrip />

      {/* Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-6 rounded-2xl text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1E293B 60%, #334155 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.08] bg-white" />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
          <p className="text-sm text-white/70 mb-1">Solde disponible</p>
          <p className="text-3xl font-bold tabular-nums">1 200 000</p>
          <p className="text-sm text-white/70">FCFA</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
            <ShieldCheck size={12} /> Protégé
          </div>
        </div>
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            En attente
          </p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "#D97706" }}>
            320 000 FCFA
          </p>
        </div>
        <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Total reçu
          </p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "var(--success)" }}>
            2.45 M FCFA
          </p>
        </div>
      </div>

      {/* Tabs */}
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
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Mobile Money */}
      {tab === "mobile-money" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border bg-white space-y-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={18} style={{ color: "var(--success)" }} />
              <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
                Paiement Mobile Money
              </h3>
            </div>
            {sent && (
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "#DCFCE7" }}>
                <CheckCircle size={15} style={{ color: "var(--success)" }} />
                <p className="text-sm font-medium text-green-800">Paiement envoyé avec succès !</p>
              </div>
            )}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>
                  Opérateur
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATORS.map((op) => {
                    const active = mobileForm.operator === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setMobileForm((f) => ({ ...f, operator: op.id }))}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all"
                        style={{
                          background: active ? "var(--navy)" : "transparent",
                          borderColor: active ? "var(--navy)" : "var(--border)",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: active ? "#FFF" : op.tint }}
                        />
                        <span className="text-xs font-semibold" style={{ color: active ? "#FFF" : "var(--navy)" }}>
                          {op.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--navy)" }}>
                    +225
                  </span>
                  <input
                    className={inputClass}
                    style={{ ...inputStyle, paddingLeft: "52px" }}
                    type="tel"
                    placeholder="07 00 00 00 00"
                    value={mobileForm.phone}
                    onChange={(e) => setMobileForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Nom du destinataire
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="text"
                  placeholder="Kofi Mensah"
                  value={mobileForm.name}
                  onChange={(e) => setMobileForm((f) => ({ ...f, name: e.target.value }))}
                  required
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
                  placeholder="ex : 150000"
                  value={mobileForm.amount}
                  onChange={(e) => setMobileForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>

              {mobileAmount > 0 && (
                <div className="rounded-xl border overflow-hidden text-sm" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--secondary)" }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Montant</span>
                    <span className="font-medium tabular-nums" style={{ color: "var(--navy)" }}>
                      {mobileAmount.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Frais (1.5%)</span>
                    <span className="font-medium tabular-nums" style={{ color: "var(--navy)" }}>
                      {mobileFee.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border)", background: "#F0F9FF" }}>
                    <span className="font-semibold" style={{ color: "#1E40AF" }}>
                      Total débité
                    </span>
                    <span className="font-bold tabular-nums" style={{ color: "#1E40AF" }}>
                      {mobileTotal.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
                style={{ background: "var(--navy)", color: "#FFF", opacity: sending ? 0.7 : 1 }}
              >
                {sending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Traitement...
                  </>
                ) : (
                  <>
                    <Smartphone size={15} /> Envoyer le paiement
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
              <h4 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
                Comment ça marche ?
              </h4>
              <ol className="relative space-y-4 before:absolute before:left-[13px] before:top-1 before:bottom-1 before:w-px before:bg-[var(--border)]">
                {[
                  "Entrez le numéro et le montant",
                  "Confirmez avec votre code secret opérateur",
                  "Le paiement est débité de votre compte",
                  "Le destinataire reçoit la notification et le solde",
                ].map((text, i) => (
                  <li key={text} className="relative flex items-start gap-3 pl-0">
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
            <div className="p-5 rounded-2xl border" style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
              <div className="flex items-start gap-2">
                <AlertCircle size={16} style={{ color: "#D97706" }} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1.5" style={{ color: "#92400E" }}>
                    Limites de transaction
                  </p>
                  <ul className="text-xs space-y-1.5" style={{ color: "#92400E" }}>
                    {OPERATORS.map((op) => (
                      <li key={op.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: op.tint }} />
                        <span>
                          {op.id} : max {op.limit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer */}
      {tab === "bank" && (
        <div className="max-w-lg space-y-5">
          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
              Virement bancaire
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                IBAN *
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="CI12 1234 5678 9012 3456 7890 12"
                value={bankForm.iban}
                onChange={(e) => setBankForm((f) => ({ ...f, iban: e.target.value }))}
              />
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                <Lock size={11} /> Chiffré et jamais partagé
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  BIC/SWIFT
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="SGCIABID"
                  value={bankForm.bic}
                  onChange={(e) => setBankForm((f) => ({ ...f, bic: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                  Banque
                </label>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))}
                >
                  <option value="">Sélectionner</option>
                  {["Société Générale CI", "SGBCI", "Ecobank CI", "UBA CI", "BOA CI", "Coris Bank", "BNI CI"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Titulaire du compte
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="Prénom Nom"
                value={bankForm.holderName}
                onChange={(e) => setBankForm((f) => ({ ...f, holderName: e.target.value }))}
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
                placeholder="ex : 500000"
                value={bankForm.amount}
                onChange={(e) => setBankForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Motif du virement
              </label>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="Paiement projet #..."
                value={bankForm.reference}
                onChange={(e) => setBankForm((f) => ({ ...f, reference: e.target.value }))}
              />
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", color: "#1E40AF" }}
            >
              <Building size={14} className="shrink-0" />
              Délai de traitement : 1-3 jours ouvrés · Frais : 0.5% (min 500 FCFA)
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              <Building size={15} /> Effectuer le virement
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "var(--navy)" }}>
              Évolution des paiements
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={20}>
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
                <Bar dataKey="reçu" fill="var(--gold)" radius={[4, 4, 0, 0]} name="Reçu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices */}
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
                    <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
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

      {/* Withdrawals */}
      {tab === "withdrawals" && (
        <div className="max-w-md space-y-5">
          <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
            <div>
              <p className="text-xs font-medium text-green-700">Solde disponible pour retrait</p>
              <p className="text-lg font-bold text-green-900 tabular-nums">1 200 000 FCFA</p>
            </div>
            <ShieldCheck size={20} className="text-green-600" />
          </div>
          <div className="p-6 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
              Demander un retrait
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>
                Méthode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WITHDRAW_METHODS.map((m) => {
                  const active = withdrawMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-xs font-medium"
                      style={{
                        background: active ? "var(--navy)" : "var(--card)",
                        borderColor: active ? "var(--navy)" : "var(--border)",
                        color: active ? "#FFF" : "var(--navy)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        style={{ background: active ? "rgba(255,255,255,0.15)" : `${m.tint}1A`, color: active ? "#FFF" : m.tint }}
                      >
                        <m.icon size={15} />
                      </span>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Numéro / IBAN
              </label>
              <input className={inputClass} style={inputStyle} placeholder="+225 07 00 00 00 00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                Montant (FCFA)
              </label>
              <input className={inputClass} style={inputStyle} type="number" placeholder="Minimum 10 000 FCFA" />
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Frais : 1% · Délai : 24-48h ouvrées
              </p>
            </div>
            <button
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              Demander le retrait
            </button>
          </div>
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
                Derniers retraits
              </p>
            </div>
            {transactions
              .filter((t) => t.type === "out")
              .map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-slate-50"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEE2E2" }}>
                    <ArrowUpRight size={16} style={{ color: "var(--destructive)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                      {tx.method}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {tx.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums" style={{ color: "var(--destructive)" }}>
                      -{tx.amount.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs" style={{ color: "var(--success)" }}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}