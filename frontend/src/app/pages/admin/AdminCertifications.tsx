import { useState } from "react";
import { Award, CheckCircle, XCircle, Eye, MessageSquare, Search, Clock } from "lucide-react";

type CertStatus = "En attente" | "Validée" | "Rejetée";

type Cert = {
  id: number; user: string; userEmail: string; certName: string; org: string;
  submittedDate: string; category: string; credentialId: string; status: CertStatus;
  document: string;
};

const initialCerts: Cert[] = [
  { id: 1, user: "Jean-Marc Konan", userEmail: "jm@freelance.ci", certName: "Google Professional Cloud Architect", org: "Google Cloud", submittedDate: "10 Jun 2026", category: "Cloud", credentialId: "GCP-PCA-2026", status: "En attente", document: "cert_google_jm.pdf" },
  { id: 2, user: "Mariama Diallo", userEmail: "mariama@content.ci", certName: "HubSpot Content Marketing", org: "HubSpot Academy", submittedDate: "09 Jun 2026", category: "Marketing", credentialId: "HS-CM-2026", status: "En attente", document: "cert_hubspot_md.pdf" },
  { id: 3, user: "Emmanuel Brou", userEmail: "ebrou@mobile.com", certName: "Flutter Developer Certified", org: "Google", submittedDate: "08 Jun 2026", category: "Mobile", credentialId: "FLUTTER-2026", status: "En attente", document: "cert_flutter_eb.pdf" },
  { id: 4, user: "Awa Traoré", userEmail: "awa@data.ml", certName: "TensorFlow Developer Certificate", org: "Google", submittedDate: "07 Jun 2026", category: "Data Science", credentialId: "TF-DEV-2026", status: "En attente", document: "cert_tf_at.pdf" },
  { id: 5, user: "Kwame Asante", userEmail: "kwame@devops.gh", certName: "Certified Kubernetes Administrator", org: "CNCF", submittedDate: "05 Jun 2026", category: "DevOps", credentialId: "CKA-2026", status: "En attente", document: "cert_cka_ka.pdf" },
  { id: 6, user: "Kofi Mensah", userEmail: "kofi@exemple.com", certName: "React Advanced Developer", org: "Meta", submittedDate: "01 Jun 2026", category: "Frontend", credentialId: "META-REACT-2024", status: "Validée", document: "cert_react_km.pdf" },
  { id: 7, user: "Fatou Diallo", userEmail: "fatou@design.com", certName: "Adobe Certified Expert XD", org: "Adobe", submittedDate: "28 May 2026", category: "Design", credentialId: "ADOBE-XD-2026", status: "Rejetée", document: "cert_adobe_fd.pdf" },
];

export function AdminCertifications() {
  const [certs, setCerts] = useState(initialCerts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CertStatus | "Toutes">("Toutes");
  const [selected, setSelected] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  const filtered = certs.filter(c => {
    const matchSearch = c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.certName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Toutes" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const validate = (id: number) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, status: "Validée" as CertStatus } : c));
    setSelected(null);
  };

  const reject = (id: number) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, status: "Rejetée" as CertStatus } : c));
    setShowRejectModal(null);
    setRejectReason("");
  };

  const pending = certs.filter(c => c.status === "En attente").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Validation des Certifications</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {pending} en attente de validation
          </p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#FEF9C3", color: "#854D0E" }}>
            <Clock size={15} /> {pending} certifications à traiter
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", count: certs.filter(c => c.status === "En attente").length, color: "#854D0E", bg: "#FEF9C3" },
          { label: "Validées", count: certs.filter(c => c.status === "Validée").length, color: "#166534", bg: "#DCFCE7" },
          { label: "Rejetées", count: certs.filter(c => c.status === "Rejetée").length, color: "#991B1B", bg: "#FEE2E2" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border bg-white text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
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
          {(["Toutes", "En attente", "Validée", "Rejetée"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
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

      {/* List */}
      <div className="space-y-3">
        {filtered.map(cert => (
          <div key={cert.id}
            className="p-5 rounded-2xl border bg-white hover:shadow-md transition-shadow"
            style={{ borderColor: selected === cert.id ? "var(--gold)" : "var(--border)" }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--secondary)" }}>
                <Award size={22} style={{ color: "var(--gold)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{cert.certName}</h4>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{cert.org}</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{
                      background: cert.status === "Validée" ? "#DCFCE7" : cert.status === "En attente" ? "#FEF9C3" : "#FEE2E2",
                      color: cert.status === "Validée" ? "#166534" : cert.status === "En attente" ? "#854D0E" : "#991B1B",
                    }}>
                    {cert.status === "Validée" ? <CheckCircle size={12} /> : cert.status === "Rejetée" ? <XCircle size={12} /> : <Clock size={12} />}
                    {cert.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                  <span>👤 {cert.user} ({cert.userEmail})</span>
                  <span>📋 ID: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{cert.credentialId}</code></span>
                  <span>📅 Soumis le: {cert.submittedDate}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)" }}>{cert.category}</span>
                </div>
                {cert.status === "En attente" && (
                  <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "#DBEAFE", color: "#1E40AF" }}>
                      <Eye size={13} /> Voir le document
                    </button>
                    <button onClick={() => validate(cert.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "var(--success)", color: "#FFF" }}>
                      <CheckCircle size={13} /> Valider
                    </button>
                    <button onClick={() => setShowRejectModal(cert.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "var(--destructive)", color: "#FFF" }}>
                      <XCircle size={13} /> Rejeter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border"
                      style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                      <MessageSquare size={13} /> Demander info
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject modal */}
      {showRejectModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--navy)" }}>Rejeter la certification</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Indiquez la raison du rejet. L'utilisateur sera notifié et pourra re-soumettre.
            </p>
            <div className="space-y-3 mb-4">
              {[
                "Document illisible ou de mauvaise qualité",
                "Informations incorrectes ou incohérentes",
                "Certificat expiré",
                "Certificat non reconnu par free-kaolo",
                "Suspicion de falsification",
              ].map(reason => (
                <button key={reason} onClick={() => setRejectReason(reason)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all"
                  style={{
                    borderColor: rejectReason === reason ? "var(--destructive)" : "var(--border)",
                    background: rejectReason === reason ? "#FEE2E2" : "transparent",
                    color: rejectReason === reason ? "#991B1B" : "var(--navy)",
                  }}>
                  {reason}
                </button>
              ))}
              <textarea className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                placeholder="Ou saisir une raison personnalisée..." rows={2}
                value={rejectReason.includes("—") ? "" : ""}
                onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Annuler
              </button>
              <button onClick={() => showRejectModal && reject(showRejectModal)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--destructive)", color: "#FFF" }}>
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
