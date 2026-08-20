import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, Clock, Shield, Search } from "lucide-react";

type ReportStatus = "En attente" | "En cours" | "Résolu" | "Rejeté";
type ReportType = "Profil frauduleux" | "Comportement inapproprié" | "Paiement litigieux" | "Faux avis" | "Spam" | "Contenu interdit";

type Report = {
  id: number; reportedUser: string; reportedBy: string; type: ReportType; description: string;
  date: string; status: ReportStatus; severity: "Faible" | "Moyen" | "Élevé" | "Critique";
};

const initialReports: Report[] = [
  { id: 1, reportedUser: "user_suspect_456", reportedBy: "TechCorp CI", type: "Profil frauduleux", description: "Ce freelancer a fourni de faux documents et certifications. Son portfolio contient des projets volés.", date: "11 Jun 2026", status: "En attente", severity: "Critique" },
  { id: 2, reportedUser: "Emmanuel Brou", reportedBy: "RetailCorp CI", type: "Paiement litigieux", description: "Le freelancer a reçu le paiement mais n'a pas livré le projet dans les délais convenus.", date: "10 Jun 2026", status: "En attente", severity: "Élevé" },
  { id: 3, reportedUser: "Agence XYZ", reportedBy: "Kofi Mensah", type: "Comportement inapproprié", description: "Cette entreprise envoie des messages harassants et hors plateforme.", date: "10 Jun 2026", status: "En cours", severity: "Moyen" },
  { id: 4, reportedUser: "freelancer_spam_789", reportedBy: "FinanceApp", type: "Spam", description: "Cet utilisateur envoie des messages non sollicités à de nombreuses entreprises.", date: "09 Jun 2026", status: "En attente", severity: "Faible" },
  { id: 5, reportedUser: "Jean-Paul Dupont", reportedBy: "StartupCI", type: "Faux avis", description: "Cet utilisateur a laissé un avis frauduleux avec plusieurs comptes.", date: "08 Jun 2026", status: "Résolu", severity: "Moyen" },
  { id: 6, reportedUser: "ProDesign CI", reportedBy: "Awa Traoré", type: "Contenu interdit", description: "Portfolio contenant des œuvres protégées sans licence.", date: "07 Jun 2026", status: "Rejeté", severity: "Faible" },
];

const severityConfig = {
  "Critique": { bg: "#7F1D1D", color: "#FFF" },
  "Élevé": { bg: "#FEE2E2", color: "#991B1B" },
  "Moyen": { bg: "#FEF9C3", color: "#854D0E" },
  "Faible": { bg: "#F3F4F6", color: "#374151" },
};

const statusConfig: Record<ReportStatus, { bg: string; color: string }> = {
  "En attente": { bg: "#FEF9C3", color: "#854D0E" },
  "En cours": { bg: "#DBEAFE", color: "#1E40AF" },
  "Résolu": { bg: "#DCFCE7", color: "#166534" },
  "Rejeté": { bg: "#F3F4F6", color: "#374151" },
};

export function AdminReports() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReportStatus | "Tous">("Tous");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = reports.filter(r => {
    const matchSearch = r.reportedUser.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const updateStatus = (id: number, status: ReportStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--navy)" }}>
          <AlertTriangle size={20} style={{ color: "var(--destructive)" }} />
          Gestion des Signalements
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {reports.filter(r => r.status === "En attente").length} signalements à traiter
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "En attente", count: reports.filter(r => r.status === "En attente").length, color: "#854D0E", bg: "#FEF9C3" },
          { label: "En cours", count: reports.filter(r => r.status === "En cours").length, color: "#1E40AF", bg: "#DBEAFE" },
          { label: "Résolus", count: reports.filter(r => r.status === "Résolu").length, color: "#166534", bg: "#DCFCE7" },
          { label: "Rejetés", count: reports.filter(r => r.status === "Rejeté").length, color: "#374151", bg: "#F3F4F6" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl text-center border bg-white" style={{ borderColor: "var(--border)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
        </div>
        <div className="flex gap-2">
          {(["Tous", "En attente", "En cours", "Résolu", "Rejeté"] as const).map(f => (
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

      {/* Reports */}
      <div className="space-y-3">
        {filtered.map(report => {
          const sev = severityConfig[report.severity];
          const st = statusConfig[report.status];
          const isExpanded = expanded === report.id;
          return (
            <div key={report.id} className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : report.id)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#FEE2E2" }}>
                  <AlertTriangle size={18} style={{ color: "var(--destructive)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{report.reportedUser}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: sev.bg, color: sev.color }}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Signalé par: {report.reportedBy} · {report.type} · {report.date}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                      {report.status === "Résolu" ? <CheckCircle size={11} /> :
                        report.status === "Rejeté" ? <XCircle size={11} /> : <Clock size={11} />}
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{report.description}</p>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl text-sm" style={{ background: "var(--secondary)" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Type de signalement</p>
                        <p className="font-semibold" style={{ color: "var(--navy)" }}>{report.type}</p>
                      </div>
                      <div className="p-3 rounded-xl text-sm" style={{ background: "var(--secondary)" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Sévérité</p>
                        <p className="font-semibold" style={{ color: "var(--navy)" }}>{report.severity}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {report.status === "En attente" || report.status === "En cours" ? (
                        <>
                          <button onClick={() => updateStatus(report.id, "En cours")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: "#DBEAFE", color: "#1E40AF" }}>
                            <Eye size={13} /> Enquêter
                          </button>
                          <button onClick={() => updateStatus(report.id, "Résolu")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: "var(--success)", color: "#FFF" }}>
                            <CheckCircle size={13} /> Marquer résolu
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: "var(--destructive)", color: "#FFF" }}>
                            <Shield size={13} /> Suspendre l'utilisateur
                          </button>
                          <button onClick={() => updateStatus(report.id, "Rejeté")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border"
                            style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                            <XCircle size={13} /> Rejeter
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border"
                            style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                            <MessageSquare size={13} /> Contacter le plaignant
                          </button>
                        </>
                      ) : (
                        <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                          Signalement {report.status.toLowerCase()} le {report.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
