import { Link } from "react-router";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

export function AccountActivationPage() {
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, #334155 100%)" }}>
          <CheckCircle size={36} style={{ color: "var(--gold)" }} />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--gold)" }}>
          <Sparkles size={14} style={{ color: "var(--navy)" }} />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--navy)" }}>
        Compte activé ! 🎉
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        Bienvenue sur free-kaolo. Votre compte est maintenant actif et prêt à l'emploi.
      </p>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 gap-3 mb-8 text-left">
        {[
          { emoji: "🎯", title: "Profil complété à 30%", desc: "Complétez votre profil pour augmenter vos chances", cta: "/freelancer/edit-profile" },
          { emoji: "📁", title: "Ajoutez votre portfolio", desc: "Montrez vos meilleures réalisations", cta: "/freelancer/portfolio" },
          { emoji: "🏆", title: "Obtenez vos certifications", desc: "Renforcez votre crédibilité", cta: "/freelancer/certifications" },
        ].map(item => (
          <Link key={item.title} to={item.cta}
            className="flex items-center gap-3 p-4 rounded-xl border hover:border-slate-300 transition-all group"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{item.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
            </div>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--gold)" }} />
          </Link>
        ))}
      </div>

      <Link to="/freelancer/dashboard"
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold"
        style={{ background: "var(--navy)", color: "#FFF" }}>
        Accéder au tableau de bord <ArrowRight size={16} />
      </Link>

      <p className="mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
        Des questions ? <Link to="#" className="font-medium underline" style={{ color: "var(--navy)" }}>Contactez le support</Link>
      </p>
    </div>
  );
}
