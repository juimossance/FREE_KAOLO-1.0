import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award, Building2, CheckCircle, XCircle, Eye, Search, Clock,
  Loader2, AlertCircle, GraduationCap,
} from "lucide-react";
import {
  certificationService,
  getCertificationDocumentUrl,
  type AdminCertificationItem,
  type CertStatus,
} from "../../../services/certificationservice";
import {
  entrepriseVerificationService,
  type AdminEntrepriseVerification,
} from "../../../services/entrepriseVerificationService";

type Tab = "FREELANCES" | "ENTREPRISES";

interface Row {
  id: number;
  title: string;
  subtitle: string;
  person: string;
  email: string;
  chips: string[];
  date: string;
  status: CertStatus;
  documentUrl: string;
  motifRejet?: string | null;
  kind: "CERTIFICATION" | "DIPLOME" | "ENTREPRISE";
}

const STATUS_UI: Record<CertStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  EN_ATTENTE: { label: "En attente", bg: "#FEF9C3", color: "#854D0E", icon: <Clock size={12} /> },
  VALIDEE: { label: "Validée", bg: "#DCFCE7", color: "#166534", icon: <CheckCircle size={12} /> },
  REJETEE: { label: "Rejetée", bg: "#FEE2E2", color: "#991B1B", icon: <XCircle size={12} /> },
};

const REJECT_REASONS = [
  "Document illisible ou de mauvaise qualité",
  "Informations incorrectes ou incohérentes",
  "Document expiré",
  "Document non reconnu par free-kaolo",
  "Suspicion de falsification",
];

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "";

const fromCert = (c: AdminCertificationItem): Row => ({
  id: c.id,
  title: c.nom,
  subtitle: c.organisme,
  person: c.freelancerNom,
  email: c.freelancerEmail,
  chips: [c.categorie, ...(c.credentialId ? [`ID : ${c.credentialId}`] : [])],
  date: c.dateSoumission,
  status: c.status,
  documentUrl: c.documentUrl,
  motifRejet: c.motifRejet,
  kind: c.type,
});

const fromVerif = (v: AdminEntrepriseVerification): Row => ({
  id: v.id,
  title: v.raisonSociale,
  subtitle: `RCCM : ${v.registreCommerce}`,
  person: v.entrepriseNom,
  email: v.entrepriseEmail,
  chips: v.numeroFiscal ? [`NIF : ${v.numeroFiscal}`] : [],
  date: v.dateSoumission,
  status: v.status,
  documentUrl: v.documentUrl,
  motifRejet: v.motifRejet,
  kind: "ENTREPRISE",
});

export function AdminCertifications() {
  const [tab, setTab] = useState<Tab>("FREELANCES");
  const [certs, setCerts] = useState<AdminCertificationItem[]>([]);
  const [verifs, setVerifs] = useState<AdminEntrepriseVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CertStatus | "TOUTES">("TOUTES");

  const [rejectTarget, setRejectTarget] = useState<Row | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [c, v] = await Promise.allSettled([
      certificationService.admin.list(),
      entrepriseVerificationService.admin.list(),
    ]);
    if (c.status === "fulfilled") setCerts(c.value);
    if (v.status === "fulfilled") setVerifs(v.value);
    if (c.status === "rejected" || v.status === "rejected") {
      setError("Impossible de charger une partie des données.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(
    () => (tab === "FREELANCES" ? certs.map(fromCert) : verifs.map(fromVerif)),
    [tab, certs, verifs]
  );

  const pendingFreelances = certs.filter((c) => c.status === "EN_ATTENTE").length;
  const pendingEntreprises = verifs.filter((v) => v.status === "EN_ATTENTE").length;

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.person.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
    return matchSearch && (filter === "TOUTES" || r.status === filter);
  });

  const count = (s: CertStatus) => rows.filter((r) => r.status === s).length;

  const applyUpdate = (kind: Row["kind"], updated: AdminCertificationItem | AdminEntrepriseVerification) => {
    if (kind === "ENTREPRISE") {
      setVerifs((p) => p.map((x) => (x.id === updated.id ? (updated as AdminEntrepriseVerification) : x)));
    } else {
      setCerts((p) => p.map((x) => (x.id === updated.id ? (updated as AdminCertificationItem) : x)));
    }
  };

  const validate = async (row: Row) => {
    setBusyId(row.id);
    setError(null);
    try {
      const updated =
        row.kind === "ENTREPRISE"
          ? await entrepriseVerificationService.admin.validate(row.id)
          : await certificationService.admin.validate(row.id);
      applyUpdate(row.kind, updated);
    } catch {
      setError("La validation a échoué. Réessaie.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setBusyId(rejectTarget.id);
    setError(null);
    try {
      const updated =
        rejectTarget.kind === "ENTREPRISE"
          ? await entrepriseVerificationService.admin.reject(rejectTarget.id, rejectReason.trim())
          : await certificationService.admin.reject(rejectTarget.id, rejectReason.trim());
      applyUpdate(rejectTarget.kind, updated);
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      setError("Le rejet a échoué. Réessaie.");
    } finally {
      setBusyId(null);
    }
  };

  const pending = tab === "FREELANCES" ? pendingFreelances : pendingEntreprises;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>Validation des justificatifs</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {pending} en attente de validation
          </p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#FEF9C3", color: "#854D0E" }}>
            <Clock size={15} /> {pending} à traiter
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="inline-grid grid-cols-2 gap-1 p-1 rounded-2xl" style={{ background: "#E2E8F0" }}>
        {([
          { key: "FREELANCES", label: "Freelances", icon: <Award size={16} />, n: pendingFreelances },
          { key: "ENTREPRISES", label: "Entreprises", icon: <Building2 size={16} />, n: pendingEntreprises },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setFilter("TOUTES"); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t.key ? "#FFF" : "transparent",
              color: tab === t.key ? "var(--navy)" : "var(--muted-foreground)",
            }}>
            {t.icon} {t.label}
            {t.n > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "#FEF9C3", color: "#854D0E" }}>
                {t.n}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#991B1B" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["EN_ATTENTE", "VALIDEE", "REJETEE"] as CertStatus[]).map((s) => (
          <div key={s} className="p-5 rounded-2xl border bg-white text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-3xl font-bold" style={{ color: STATUS_UI[s].color }}>{count(s)}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-foreground)" }}>{STATUS_UI[s].label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
        </div>
        <div className="flex gap-2">
          {(["TOUTES", "EN_ATTENTE", "VALIDEE", "REJETEE"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                background: filter === f ? "var(--navy)" : "var(--card)",
                borderColor: filter === f ? "var(--navy)" : "var(--border)",
                color: filter === f ? "#FFF" : "var(--muted-foreground)",
              }}>
              {f === "TOUTES" ? "Toutes" : STATUS_UI[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 size={26} className="animate-spin" style={{ color: "var(--navy)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>Aucun élément.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const ui = STATUS_UI[row.status];
            const busy = busyId === row.id;
            return (
              <div key={`${row.kind}-${row.id}`} className="p-5 rounded-2xl border bg-white hover:shadow-md transition-shadow"
                style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--secondary)", color: "var(--gold)" }}>
                    {row.kind === "ENTREPRISE" ? <Building2 size={22} />
                      : row.kind === "DIPLOME" ? <GraduationCap size={22} /> : <Award size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{row.title}</h4>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{row.subtitle}</p>
                      </div>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background: ui.bg, color: ui.color }}>
                        {ui.icon} {ui.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                      <span>👤 {row.person} ({row.email})</span>
                      <span>📅 Soumis le {fmt(row.date)}</span>
                      {row.kind === "DIPLOME" && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)" }}>Diplôme</span>
                      )}
                      {row.chips.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-full" style={{ background: "var(--secondary)" }}>{c}</span>
                      ))}
                    </div>

                    {row.status === "REJETEE" && row.motifRejet && (
                      <p className="text-xs mb-2" style={{ color: "#991B1B" }}>Motif : {row.motifRejet}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {row.documentUrl && (
                      <a
  href={getCertificationDocumentUrl(row.documentUrl)}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
  style={{ background: "#DBEAFE", color: "#1E40AF" }}
>
  <Eye size={13} /> Voir le document
</a>
                      )}
                      {row.status === "EN_ATTENTE" && (
                        <>
                          <button disabled={busy} onClick={() => validate(row)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-60"
                            style={{ background: "var(--success)", color: "#FFF" }}>
                            {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Valider
                          </button>
                          <button disabled={busy} onClick={() => { setRejectTarget(row); setRejectReason(""); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-60"
                            style={{ background: "var(--destructive)", color: "#FFF" }}>
                            <XCircle size={13} /> Rejeter
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de rejet */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--navy)" }}>Rejeter « {rejectTarget.title} »</h3>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Indiquez la raison du rejet. L'utilisateur la verra et pourra resoumettre.
            </p>
            <div className="space-y-2 mb-4">
              {REJECT_REASONS.map((r) => (
                <button key={r} onClick={() => setRejectReason(r)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all"
                  style={{
                    borderColor: rejectReason === r ? "var(--destructive)" : "var(--border)",
                    background: rejectReason === r ? "#FEE2E2" : "transparent",
                    color: rejectReason === r ? "#991B1B" : "var(--navy)",
                  }}>
                  {r}
                </button>
              ))}
              <textarea rows={2} maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                placeholder="Ou saisir une raison personnalisée..."
                value={REJECT_REASONS.includes(rejectReason) ? "" : rejectReason}
                onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                Annuler
              </button>
              <button onClick={confirmReject} disabled={!rejectReason.trim() || busyId === rejectTarget.id}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
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