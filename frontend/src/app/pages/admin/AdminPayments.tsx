import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, Eye, AlertTriangle, Search, Download, CreditCard, Shield } from "lucide-react";

type PayStatus = "Traité" | "En attente" | "Litigieux" | "Remboursé";

const transactions = [
  { id: 1, from: "TechCorp CI", to: "Kofi Mensah", project: "Refonte Site Corporate", amount: 180000, date: "10 Jun 2026", method: "Orange Money", status: "Traité" as PayStatus, commission: 14400, ref: "TXN-2026-1089" },
  { id: 2, from: "RetailCorp", to: "Ama Nkrumah", project: "E-commerce Platform", amount: 600000, date: "09 Jun 2026", method: "Virement", status: "En attente" as PayStatus, commission: 48000, ref: "TXN-2026-1085" },
  { id: 3, from: "FinanceApp", to: "Emmanuel Brou", project: "API REST Banking", amount: 320000, date: "08 Jun 2026", method: "MTN Money", status: "Litigieux" as PayStatus, commission: 25600, ref: "TXN-2026-1081" },
  { id: 4, from: "DataTech", to: "Kwame Asante", project: "Dashboard Analytics", amount: 400000, date: "05 Jun 2026", method: "Wave", status: "Traité" as PayStatus, commission: 32000, ref: "TXN-2026-1075" },
  { id: 5, from: "StartupCI", to: "Fatou Diallo", project: "Design System", amount: 150000, date: "03 Jun 2026", method: "Orange Money", status: "Remboursé" as PayStatus, commission: 0, ref: "TXN-2026-1068" },
  { id: 6, from: "ImmoCI", to: "Jean-Marc Konan", project: "CRM Immobilier", amount: 250000, date: "01 Jun 2026", method: "Virement", status: "Traité" as PayStatus, commission: 20000, ref: "TXN-2026-1061" },
];

const statusConfig: Record<PayStatus, { bg: string; color: string }> = {
  "Traité": { bg: "#DCFCE7", color: "#166534" },
  "En attente": { bg: "#FEF9C3", color: "#854D0E" },
  "Litigieux": { bg: "#FEE2E2", color: "#991B1B" },
  "Remboursé": { bg: "#F3F4F6", color: "#374151" },
};

const totalCommissions = transactions.reduce((sum, t) => sum + t.commission, 0);
const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

export function AdminPayments() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PayStatus | "Tous">("Tous");
  const [statuses, setStatuses] = useState<Record<string, PayStatus>>(
    Object.fromEntries(transactions.map(t => [t.ref, t.status]))
  );

  const filtered = transactions.filter(t => {
    const matchSearch = t.from.toLowerCase().includes(search.toLowerCase()) ||
      t.to.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase()) ||
      t.ref.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" || statuses[t.ref] === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--navy)" }}>
            <Shield size={20} style={{ color: "var(--gold)" }} />
            Gestion des Paiements
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Supervision de toutes les transactions de la plateforme
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
          <Download size={15} /> Exporter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Volume total", value: `${(totalVolume / 1000000).toFixed(2)}M FCFA`, color: "var(--navy)" },
          { label: "Commissions (8%)", value: `${(totalCommissions / 1000).toFixed(0)}k FCFA`, color: "var(--gold)" },
          { label: "En attente", value: transactions.filter(t => t.status === "En attente").length.toString(), color: "#854D0E" },
          { label: "Litiges", value: transactions.filter(t => t.status === "Litigieux").length.toString(), color: "var(--destructive)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
            <CreditCard size={18} className="mb-3" style={{ color: s.color }} />
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Litigieux alert */}
      {transactions.some(t => t.status === "Litigieux") && (
        <div className="p-4 rounded-2xl border flex items-start gap-3" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <AlertTriangle size={18} style={{ color: "var(--destructive)" }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold" style={{ color: "#991B1B" }}>
              {transactions.filter(t => t.status === "Litigieux").length} paiement(s) en litige nécessitent votre attention
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#991B1B" }}>
              Consultez les transactions marquées « Litigieux » et prenez les mesures nécessaires.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par utilisateur, projet, référence..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
        </div>
        <div className="flex gap-2">
          {(["Tous", "Traité", "En attente", "Litigieux", "Remboursé"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: filter === f ? "var(--navy)" : "var(--card)",
                borderColor: filter === f ? "var(--navy)" : "var(--border)",
                color: filter === f ? "#FFF" : "var(--muted-foreground)",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
                {["Référence", "De → À", "Projet", "Montant", "Commission", "Méthode", "Date", "Statut", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(tx => {
                const st = statusConfig[statuses[tx.ref] as PayStatus];
                return (
                  <tr key={tx.ref} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{tx.ref}</code>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-xs font-medium" style={{ color: "var(--navy)" }}>{tx.from}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>→ {tx.to}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs" style={{ color: "var(--navy)" }}>{tx.project}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
                        {tx.amount.toLocaleString()} FCFA
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium" style={{ color: "var(--gold)" }}>
                        {tx.commission > 0 ? `${tx.commission.toLocaleString()} FCFA` : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{tx.method}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{tx.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={statuses[tx.ref]}
                        onChange={e => setStatuses(s => ({ ...s, [tx.ref]: e.target.value as PayStatus }))}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer"
                        style={{ background: st.bg, color: st.color, borderColor: "transparent" }}>
                        {["Traité", "En attente", "Litigieux", "Remboursé"].map(s => (
                          <option key={s} style={{ background: "#FFF", color: "var(--navy)" }}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <Eye size={13} style={{ color: "var(--navy)" }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <Download size={13} style={{ color: "var(--navy)" }} />
                        </button>
                        {statuses[tx.ref] === "Litigieux" && (
                          <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <AlertTriangle size={13} style={{ color: "var(--destructive)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Affichage de {filtered.length} sur {transactions.length} transactions
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
            Commissions totales: <span style={{ color: "var(--gold)" }}>{totalCommissions.toLocaleString()} FCFA</span>
          </p>
        </div>
      </div>
    </div>
  );
}
