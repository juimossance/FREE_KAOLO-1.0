import { Outlet, Link } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy)" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: "linear-gradient(160deg, #0F172A 60%, #1E293B 100%)" }}>
        <div>
          <Link to="/login" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gold)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>FK</span>
            </div>
            <span className="text-xl font-bold text-white">free-kaolo</span>
          </Link>
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white leading-tight">
              La plateforme qui connecte les meilleurs talents aux meilleures opportunités
            </h2>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed">
              Trouvez des freelancers certifiés ou publiez vos projets. Paiements sécurisés, messagerie intégrée, IA.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {[
              { icon: "✓", text: "Freelancers certifiés et vérifiés" },
              { icon: "✓", text: "Paiement Mobile Money & virement bancaire" },
              { icon: "✓", text: "Messagerie temps réel intégrée" },
              { icon: "✓", text: "Assistant IA pour optimiser vos projets" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--gold)", color: "var(--navy)" }}>
                  {item.icon}
                </span>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["KD", "AM", "SB", "LT"].map((initials) => (
              <div key={initials} className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-semibold"
                style={{ background: "var(--navy-light)", color: "var(--gold)" }}>
                {initials}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            <span className="text-white font-semibold">2 400+</span> professionnels nous font confiance
          </p>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gold)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--navy)" }}>FK</span>
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--navy)" }}>free-kaolo</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
