import { useEffect, useMemo, useState } from "react";
import {
  Star,
  CheckCircle,
  X,
  MessageSquare,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Users,
  AlertCircle,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { apiFetch } from "../../../services/http";
import {
  CandidatureEntreprise,
  candidatureEntrepriseService,
  getCandidaturesEntreprise,
} from "../../../services/candidatureEntrepriseService";

export function CandidateSelection() {
  const [candidatures, setCandidatures] = useState<CandidatureEntreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [contactingId, setContactingId] = useState<number | null>(null);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCandidaturesEntreprise();
      setCandidatures(
        data.filter((c) => c.status === "EN_ATTENTE" || c.status === "EN_COURS")
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les candidatures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const handleContact = async (freelancerId: number) => {
    setContactingId(freelancerId);
    try {
      const conversation = await apiFetch<{ id: number }>("/conversations/start", {
        method: "POST",
        body: JSON.stringify({ targetUserId: freelancerId }),
      });
      window.location.href = `/messages?conversationId=${conversation.id}`;
    } catch (err) {
      console.error(err);
      // TODO: afficher une notification d'erreur à l'utilisateur
    } finally {
      setContactingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCandidatures = useMemo(
    () => candidatures.filter((c) => selectedIds.has(c.id)),
    [candidatures, selectedIds]
  );
  const selectedCount = selectedCandidatures.length;

  const handleConfirm = async () => {
    if (selectedCount === 0) return;
    setConfirming(true);
    try {
      await candidatureEntrepriseService.confirmerSelection(Array.from(selectedIds));
      setConfirmed(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Impossible de confirmer la sélection.");
    } finally {
      setConfirming(false);
    }
  };

  const resetSelection = () => {
    setSelectedIds(new Set());
    setConfirmed(false);
  };

  const candidateName = (c: CandidatureEntreprise) =>
    `${c.freelancerPrenom ?? ""} ${c.freelancerNom ?? ""}`.trim() || `Freelancer #${c.freelancerId}`;

  const priceLabel = (c: CandidatureEntreprise) =>
    c.montantFinal
      ? `${c.montantFinal.toLocaleString("fr-FR")} FCFA`
      : c.projetBudget
      ? `${c.projetBudget.toLocaleString("fr-FR")} FCFA (budget)`
      : "Non précisé";

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-100" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border p-6" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#FEE2E2", color: "#B91C1C" }}
            >
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ color: "#991B1B" }}>
                Impossible de charger les candidatures
              </h3>
              <p className="text-sm mt-1" style={{ color: "#B91C1C" }}>
                {error}
              </p>
              <button
                onClick={fetchCandidatures}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--navy)", color: "#FFFFFF" }}
              >
                <RefreshCw size={14} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-10" style={{ borderColor: "var(--border)" }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#F0FDF4" }}>
              <CheckCircle size={32} strokeWidth={2} style={{ color: "var(--success)" }} />
            </div>

            <div
              className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border px-3 py-1.5"
              style={{ borderColor: "#BBF7D0", background: "#F0FDF4", color: "#166534" }}
            >
              <ShieldCheck size={14} />
              <span className="text-xs font-semibold">Sélection enregistrée</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--navy)" }}>
              Sélection confirmée
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: "var(--muted-foreground)" }}>
              {selectedCandidatures.map(candidateName).join(", ")}{" "}
              {selectedCount === 1
                ? "a été notifié et peut maintenant commencer"
                : "ont été notifiés et peuvent maintenant commencer"}{" "}
              à travailler sur votre projet.
            </p>

            <div className="mt-6 rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "white", color: "var(--navy)" }}>
                  <Users size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
                    {selectedCount} freelancer{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    La sélection a été transmise avec succès.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              
              <a  href="/messages"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--navy)", color: "#FFF" }}
              >
                <MessageSquare size={16} />
                Aller à la messagerie
              </a>
              
             <a   href="/enterprise/projects"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:bg-slate-50"
                style={{ borderColor: "var(--border)", color: "var(--navy)" }}
              >
                Retour aux projets
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                <Users size={16} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Recrutement
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--navy)" }}>
              Sélection des candidats
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              {candidatures.length} candidat{candidatures.length > 1 ? "s" : ""} présélectionné{candidatures.length > 1 ? "s" : ""}
            </p>
          </div>

          {selectedCount > 0 && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              style={{ background: "var(--navy)", color: "#FFF" }}
            >
              {confirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Confirmer ({selectedCount})
                </>
              )}
            </button>
          )}
        </header>

        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: selectedCount > 0 ? "#D6D3D1" : "var(--border)", background: selectedCount > 0 ? "#FAFAF9" : "#FFFFFF" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: selectedCount > 0 ? "var(--gold)" : "var(--secondary)", color: "var(--navy)" }}
              >
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
                  {selectedCount === 0
                    ? "Aucun candidat sélectionné"
                    : `${selectedCount} candidat${selectedCount > 1 ? "s" : ""} sélectionné${selectedCount > 1 ? "s" : ""}`}
                </p>
                <p className="mt-1 text-xs leading-5" style={{ color: "var(--muted-foreground)" }}>
                  {selectedCount === 0
                    ? "Sélectionnez un ou plusieurs profils pour poursuivre."
                    : selectedCandidatures.map(candidateName).join(", ")}
                </p>
              </div>
            </div>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={resetSelection}
                className="self-start rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-100 sm:self-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {candidatures.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center" style={{ borderColor: "var(--border)" }}>
              <Users size={24} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                Aucune candidature à traiter pour le moment
              </p>
            </div>
          ) : (
            candidatures.map((c) => {
              const isSelected = selectedIds.has(c.id);
              const initials = candidateName(c)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={c.id}
                  className="rounded-2xl border bg-white transition-all duration-200"
                  style={{
                    borderColor: isSelected ? "var(--gold)" : "var(--border)",
                    boxShadow: isSelected ? "0 4px 18px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                        <button
                          type="button"
                          aria-label={isSelected ? `Désélectionner ${candidateName(c)}` : `Sélectionner ${candidateName(c)}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleSelect(c.id)}
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all"
                          style={{
                            borderColor: isSelected ? "var(--gold)" : "var(--border)",
                            background: isSelected ? "var(--gold)" : "transparent",
                          }}
                        >
                          {isSelected && <CheckCircle size={13} strokeWidth={2.5} style={{ color: "var(--navy)" }} />}
                        </button>

                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold sm:h-14 sm:w-14 sm:text-base"
                          style={{ background: isSelected ? "var(--gold)" : "var(--secondary)", color: "var(--navy)" }}
                        >
                          {initials}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold" style={{ color: "var(--navy)" }}>
                                {candidateName(c)}
                              </h3>
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
                                style={{ background: "#F0FDF4", color: "#166534" }}
                              >
                                <ShieldCheck size={11} />
                                Profil vérifié
                              </span>
                            </div>
                            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                              {c.freelancerSpecialite ?? "Spécialité non précisée"}
                            </p>
                            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                              Projet : {c.projetTitre}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-base font-bold flex items-center gap-1 sm:justify-end" style={{ color: "var(--navy)" }}>
                              <WalletCards size={14} style={{ color: "var(--gold)" }} />
                              {priceLabel(c)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                          <div className="flex items-center gap-1.5">
                            <Star size={14} fill="var(--gold)" style={{ color: "var(--gold)" }} />
                            <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>
                              {c.freelancerRating?.toFixed(1) ?? "—"}
                            </span>
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              ({c.freelancerNbAvis ?? 0} avis)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {c.freelancerCompetences?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold" style={{ color: "var(--navy)" }}>
                          Compétences principales
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.freelancerCompetences.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium"
                              style={{
                                background: isSelected ? "var(--navy)" : "var(--secondary)",
                                color: isSelected ? "#FFFFFF" : "var(--navy)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => toggleSelect(c.id)}
                        className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                        style={{
                          background: isSelected ? "#FEF2F2" : "var(--navy)",
                          color: isSelected ? "var(--destructive)" : "#FFFFFF",
                          border: isSelected ? "1px solid #FECACA" : "1px solid transparent",
                        }}
                      >
                        {isSelected ? (
                          <>
                            <X size={15} />
                            Désélectionner
                          </>
                        ) : (
                          <>
                            <CheckCircle size={15} />
                            Sélectionner
                          </>
                        )}
                      </button>

                    <button
  type="button"
  onClick={() => handleContact(c.freelancerUserId)}
  disabled={contactingId === c.freelancerUserId}
  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 disabled:opacity-60"
  style={{ borderColor: "var(--border)", color: "var(--navy)" }}
>
  {contactingId === c.freelancerUserId ? (
    <Loader2 size={15} className="animate-spin" />
  ) : (
    <MessageSquare size={15} />
  )}
  Contacter
</button>

                      
                        <a href={`/enterprise/freelancer/${c.freelancerId}`}
                        className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 sm:ml-auto"
                        style={{ borderColor: "var(--border)", color: "var(--navy)" }}
                      >
                        Voir le profil
                        <ArrowRight size={15} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}