import { Outlet, Link } from "react-router";
import { Check } from "lucide-react";

// ─── Palette (identique au reste de l'app) ──────────────────────────────────
const CM = {
  ember: "#D4AF37",
  gold: "#F0D060",
  clay: "#8A6D1F",
};
const INK = "#080F1D";

// ─── Filigrane Ndop, en watermark sur le panneau de marque ─────────────────
function NdopTexture({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id="ndop-authlayout" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M32 4 L58 32 L32 58 L6 32 Z" fill="none" stroke={CM.gold} strokeWidth="1" />
          <path d="M32 16 L46 32 L32 46 L18 32 Z" fill="none" stroke={CM.gold} strokeWidth="1" />
          <circle cx="32" cy="32" r="3" fill="none" stroke={CM.ember} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ndop-authlayout)" />
    </svg>
  );
}

// ─── Ligne-motif (version compacte de la bande cérémonielle de la landing) ──
function MotifLine() {
  const dots = Array.from({ length: 20 });
  return (
    <div aria-hidden="true" className="w-full overflow-hidden leading-none">
      <svg viewBox="0 0 480 8" preserveAspectRatio="none" className="w-full h-[6px] block">
        {dots.map((_, i) => {
          const x = 8 + i * 24;
          const fill = i % 3 === 0 ? CM.gold : i % 3 === 1 ? CM.ember : CM.clay;
          return (
            <circle
              key={i}
              cx={x}
              cy={4}
              r={i % 4 === 0 ? 2.6 : 1.5}
              fill={fill}
              opacity={i % 4 === 0 ? 0.9 : 0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: INK }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F172A 60%, #1E293B 100%)" }}>
        <NdopTexture opacity={0.05} />

        <div className="relative">
          <Link to="/login" className="flex items-center gap-2">
            <img src="/assets/logo-freekaolo-badge.png" alt="free-kaolo" className="w-14 h-14 object-contain" />
            <span className="text-xl font-bold text-white">free-kaolo</span>
          </Link>
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white leading-tight">
              La plateforme qui connecte les meilleurs talents aux meilleures opportunités
            </h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Trouvez des freelancers certifiés ou publiez vos projets. Paiements sécurisés, messagerie intégrée, IA.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {[
              "Freelancers certifiés et vérifiés",
              "Paiement Mobile Money & virement bancaire",
              "Messagerie temps réel intégrée",
              "Assistant IA pour optimiser vos projets",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${CM.ember}, ${CM.gold})` }}>
                  <Check size={12} strokeWidth={3} style={{ color: INK }} />
                </span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex -space-x-2">
              {["KD", "AM", "SB", "LT"].map((initials) => (
                <div key={initials} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: "#1E293B", color: CM.gold, border: "2px solid #0F172A" }}>
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              <span className="text-white font-semibold">2 400+</span> professionnels nous font confiance
            </p>
          </div>

          {/* Ligne-motif — signature en bas du panneau de marque */}
          <MotifLine />
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/assets/logo-freekaolo-badge.png" alt="free-kaolo" className="w-11 h-11 object-contain" />
            <span className="text-xl font-bold" style={{ color: INK }}>free-kaolo</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}