import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "#F0FFF4" }}>
          <CheckCircle size={32} style={{ color: "var(--success)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--navy)" }}>Email envoyé !</h1>
        <p className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
          Nous avons envoyé un lien de réinitialisation à
        </p>
        <p className="text-sm font-semibold mb-6" style={{ color: "var(--navy)" }}>{email}</p>
        <div className="p-4 rounded-xl mb-6 text-left" style={{ background: "#F8FAFC", border: "1px solid var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>Vous n'avez pas reçu l'email ?</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Vérifiez vos spams ou{" "}
            <button onClick={() => setSent(false)} className="font-medium underline" style={{ color: "var(--navy)" }}>
              renvoyez le lien
            </button>
          </p>
        </div>
        <Link to="/login"
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold w-full"
          style={{ background: "var(--navy)", color: "#FFF" }}>
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="flex items-center gap-2 text-sm mb-6 hover:underline"
        style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft size={14} /> Retour à la connexion
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--navy)" }}>Mot de passe oublié</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--navy)" }}>Adresse email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold"
          style={{ background: "var(--navy)", color: "#FFF", opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</> : <>Envoyer le lien <ArrowRight size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Vous vous souvenez ?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--navy)" }}>Se connecter</Link>
      </p>
    </div>
  );
}
