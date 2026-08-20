import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Loader2, ArrowRight, RefreshCw } from "lucide-react";

export function EmailVerificationPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/activate?code=${code}`,
        { method: "GET" }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Code d'activation invalide.");
      }

      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise(r => setTimeout(r, 1000));
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--secondary)" }}>
          <Mail size={28} style={{ color: "var(--navy)" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>Vérification email</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Un code d'activation a été envoyé à votre adresse email.<br />
          Copiez-le et collez-le ci-dessous.
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <div className="mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            placeholder="Collez votre code d'activation ici"
            className="w-full px-4 py-3 text-center text-sm font-mono rounded-xl border outline-none transition-all"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm mb-4" style={{ background: "#FEF2F2", color: "var(--destructive)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold mb-4"
          style={{
            background: "var(--navy)",
            color: "#FFF",
            opacity: (loading || !code) ? 0.6 : 1,
          }}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Vérification...</> : <>Activer mon compte <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="text-center">
        {resent && (
          <p className="text-sm font-medium mb-2" style={{ color: "var(--success)" }}>
            ✓ Code renvoyé avec succès
          </p>
        )}
        <button onClick={handleResend} disabled={resending}
          className="flex items-center gap-2 mx-auto text-sm font-medium transition-colors"
          style={{ color: "var(--muted-foreground)" }}>
          {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Renvoyer le code
        </button>
      </div>

      <p className="mt-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Mauvaise adresse ?{" "}
        <Link to="/register/freelancer" className="font-semibold" style={{ color: "var(--navy)" }}>
          Modifier
        </Link>
      </p>
    </div>
  );
}