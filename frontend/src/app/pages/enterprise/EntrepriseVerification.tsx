import { useEffect, useRef, useState } from "react";
import { Building2, ShieldCheck, Clock3, XCircle, Upload, FileCheck2, Loader2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {
  entrepriseVerificationService,
  type EntrepriseVerification as Verif,
  type EntrepriseVerificationForm,
} from "../../../services/entrepriseVerificationService";
import { CertifiedBadge } from "../../components/CertifiedBadge";

const empty: EntrepriseVerificationForm = { raisonSociale: "", registreCommerce: "", numeroFiscal: "", documentUrl: "" };
const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-slate-200";
const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

export function EntrepriseVerification() {
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId;

  const [current, setCurrent] = useState<Verif | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EntrepriseVerificationForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!entrepriseId) { setLoading(false); return; }
    entrepriseVerificationService
      .getAll(entrepriseId)
      .then((list) => setCurrent(list[0] ?? null))
      .catch(() => setError("Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [entrepriseId]);

  // Pré-remplit le formulaire en cas de rejet (le document doit être réuploadé)
  useEffect(() => {
    if (current?.status === "REJETEE") {
      setForm({
        raisonSociale: current.raisonSociale,
        registreCommerce: current.registreCommerce,
        numeroFiscal: current.numeroFiscal ?? "",
        documentUrl: "",
      });
    }
  }, [current]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return setError("Format non supporté (PDF, JPG, PNG).");
    if (file.size > 10 * 1024 * 1024) return setError("Le fichier dépasse 10 Mo.");
    setError(null);
    setUploading(true);
    try {
      const { url } = await entrepriseVerificationService.uploadDocument(file);
      setForm((f) => ({ ...f, documentUrl: url }));
    } catch {
      setError("L'envoi du document a échoué.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!entrepriseId) return;
    if (!form.raisonSociale.trim() || !form.registreCommerce.trim() || !form.documentUrl) {
      return setError("Renseigne la raison sociale, le RCCM et joins un justificatif.");
    }
    setSaving(true);
    setError(null);
    try {
      const saved =
        current?.status === "REJETEE"
          ? await entrepriseVerificationService.resubmit(current.id, form)
          : await entrepriseVerificationService.create(entrepriseId, form);
      setCurrent(saved);
    } catch {
      setError("La soumission a échoué. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-16"><Loader2 className="animate-spin" style={{ color: "var(--navy)" }} /></div>;
  }

  const showForm = !current || current.status === "REJETEE";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>Certification de l'entreprise</h1>
          {current?.status === "VALIDEE" && <CertifiedBadge label="Entreprise vérifiée" />}
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Faites vérifier votre entreprise pour rassurer les freelances et obtenir le badge « Entreprise vérifiée ».
        </p>
      </div>

      {current?.status === "VALIDEE" && (
        <div className="flex gap-3 p-4 rounded-2xl border" style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#047857" }}>
          <ShieldCheck size={20} />
          <p className="text-sm font-medium">{current.raisonSociale} est vérifiée. Le badge est visible sur votre profil.</p>
        </div>
      )}

      {current?.status === "EN_ATTENTE" && (
        <div className="flex gap-3 p-4 rounded-2xl border" style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#854D0E" }}>
          <Clock3 size={20} />
          <p className="text-sm">Vérification en cours (24 à 48 h ouvrées). Vous serez informé dès la décision.</p>
        </div>
      )}

      {current?.status === "REJETEE" && (
        <div className="flex gap-3 p-4 rounded-2xl border" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}>
          <XCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Demande rejetée</p>
            <p className="text-xs mt-0.5">{current.motifRejet ?? "Merci de corriger votre dossier."}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="p-5 rounded-2xl border bg-white space-y-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>Raison sociale *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-10`} style={inputStyle} value={form.raisonSociale}
                onChange={(e) => setForm((f) => ({ ...f, raisonSociale: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>N° RCCM *</label>
              <input className={inputClass} style={inputStyle} value={form.registreCommerce}
                onChange={(e) => setForm((f) => ({ ...f, registreCommerce: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>N° fiscal (optionnel)</label>
              <input className={inputClass} style={inputStyle} value={form.numeroFiscal ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, numeroFiscal: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--navy)" }}>Justificatif (RCCM, statuts…) *</label>
            <input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])} />
            {form.documentUrl ? (
              <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3"><FileCheck2 size={18} /> <span className="text-sm font-medium">Document joint</span></div>
                <button onClick={() => { setForm((f) => ({ ...f, documentUrl: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                  aria-label="Retirer"><X size={16} /></button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50"
                style={{ borderColor: "var(--border)" }}>
                {uploading ? <Loader2 className="mx-auto animate-spin" /> : <Upload className="mx-auto mb-2" size={21} />}
                <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{uploading ? "Envoi en cours..." : "Importer le justificatif"}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>PDF, JPG ou PNG · 10 Mo max</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--destructive)" }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button onClick={submit} disabled={saving || uploading}
            className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--navy)", color: "#FFF" }}>
            {saving ? "Envoi..." : current?.status === "REJETEE" ? "Resoumettre" : "Soumettre pour vérification"}
          </button>
        </div>
      )}
    </div>
  );
}